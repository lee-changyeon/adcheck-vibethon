// 애드체크 비즈 30초 시연영상 녹화: headless Chrome 화면 녹화(screencast) → 프레임 + ffmpeg concat 목록
// 글자 읽기(OCR) 기다리는 구간은 영상에서 FFWD초로 압축한다(자막에 '빠르게 감기' 표시)
// 사용: advertiser 개발 서버(npm run dev -- --port 5176)를 켠 뒤
//   node scripts/demo-video-biz.mjs <작업폴더(임시)> [base=http://localhost:5176]
//   powershell -File scripts/demo-video-encode.ps1 -Work <작업폴더> -Out <mp4> -LinesFile <작업폴더>/narration.json -Length (<작업폴더>/length.txt 값)
// 나레이션 시작 시각은 녹화 중 장면이 실제로 바뀐 시각으로 정해져 narration.json에 저장된다
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { openChrome, pageHelpers, sleep } from './lib/cdp.mjs'

const OUT = process.argv[2]
const BASE = process.argv[3] ?? 'http://localhost:5176'
const FRAMES = join(OUT, 'frames')
const LENGTH = 30
const TARGET = 29.4 // 화면이 이보다 길면 전체를 빠르게 재생해 맞춘다 (끝에 0.6초 멈춤)
const FFWD = 1.8 // OCR 구간을 영상에서 몇 초로 보여 줄지
rmSync(FRAMES, { recursive: true, force: true })
mkdirSync(FRAMES, { recursive: true })

const frames = []
let recording = false
const page = await openChrome({
  port: 9338,
  profileDir: join(OUT, '_profile'),
  onEvent: (method, params, send) => {
    if (method !== 'Page.screencastFrame') return
    if (recording) frames.push({ t: params.metadata.timestamp, data: params.data })
    send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {})
  },
})
const { send, js } = page
const { go, waitFor, hasEnabled } = pageHelpers(page, BASE)

/** 화면에 자막과 누르는 곳 동그라미를 그리는 도우미 (페이지 안에 넣는다) */
const HELPERS = `
window.__sub = (text) => {
  let el = document.getElementById('__sub');
  if (!el) {
    el = document.createElement('div'); el.id = '__sub';
    el.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:9999;max-width:340px;width:max-content;padding:10px 18px;border-radius:999px;background:rgba(17,20,20,.86);color:#fff;font:700 15px/1.35 Pretendard,sans-serif;text-align:center;box-shadow:0 8px 20px -8px rgba(0,0,0,.4);transition:opacity .25s';
    document.body.appendChild(el);
  }
  el.style.opacity = '0';
  setTimeout(() => { el.textContent = text; el.style.opacity = '1'; }, 180);
};
window.__ring = (x, y) => {
  const r = document.createElement('div');
  r.style.cssText = 'position:fixed;z-index:10000;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;border:4px solid #008a78;background:rgba(0,138,120,.22);pointer-events:none;left:' + x + 'px;top:' + y + 'px';
  document.body.appendChild(r);
  r.animate([
    { transform: 'scale(.6)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1, offset: 0.2 },
    { transform: 'scale(1)', opacity: 1, offset: 0.6 },
    { transform: 'scale(1.5)', opacity: 0 },
  ], { duration: 900, easing: 'ease-out' });
  setTimeout(() => r.remove(), 900);
};
window.__find = (sel, t) => {
  const all = [...document.querySelectorAll(sel)].filter(e => e.textContent.includes(t));
  return all.find(e => !all.some(o => o !== e && e.contains(o)));
};
window.__scrollTo = (t, top) => {
  const el = [...document.querySelectorAll('body *')].find(e => e.textContent.trim().startsWith(t) && ![...e.children].some(c => c.textContent.trim().startsWith(t)));
  if (!el) return;
  let box = el.parentElement;
  while (box && box !== document.body && !(box.scrollHeight > box.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
  if (box && box !== document.body) box.scrollTo({ top: box.scrollTop + el.getBoundingClientRect().top - box.getBoundingClientRect().top - top + 70, behavior: 'smooth' });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - top, behavior: 'smooth' });
};
true`
const helpers = () => js(HELPERS)
const marks = []
const sub = (text) => { marks.push([Date.now(), text.slice(0, 1)]); return js(`window.__sub(${JSON.stringify(text)})`) }
const scroll = (text, top = 70) => js(`window.__scrollTo(${JSON.stringify(text)}, ${top})`)
/** 버튼·링크를 찾아 동그라미를 그린 뒤 누른다 */
const tap = async (sel, text, wait = 420) => {
  const pos = await js(`(async () => {
    const el = window.__find(${JSON.stringify(sel)}, ${JSON.stringify(text)});
    if (!el) throw new Error('not found: ' + ${JSON.stringify(text)});
    const r0 = el.getBoundingClientRect();
    if (r0.top < 60 || r0.bottom > innerHeight - 90) el.scrollIntoView({ block: 'center', behavior: 'instant' });
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`)
  await js(`window.__ring(${pos.x}, ${pos.y})`)
  await sleep(wait)
  await js(`window.__find(${JSON.stringify(sel)}, ${JSON.stringify(text)}).click()`)
}

// ── 준비: 글자 인식 한글 데이터를 미리 받아 둔다 (IndexedDB에 남음) ──
await go('/')
await js('localStorage.clear()')
await go('/scan', 2000)
await js(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('예시 화면으로 체험')).click()`)
await waitFor(hasEnabled('이 장면으로 글자 읽기'), 30000)
await js(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('이 장면으로 글자 읽기')).click()`)
await waitFor(hasEnabled('게시물로 등록하고 검수'), 180000)
console.log('OCR warm-up done')
// 미리 열어 둘 화면 (지연 로딩 대비) 후 샘플 데이터 상태로
await go('/collab/events/ev-01', 1500)
await js('localStorage.clear()')
await go('/', 2500)
await helpers()

await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 750, maxHeight: 1624, everyNthFrame: 1 })
await sleep(300)
recording = true
const ffwd = [] // [시작, 끝] (epoch 초) — 이 구간은 영상에서 FFWD초로 줄인다
const nowSec = () => Date.now() / 1000
/** 장면마다 일정 시간 머문다 (실행 속도가 달라도 장면 길이는 같게) */
const hold = (sec) => sleep(sec * 1000)

// ① 대시보드
await sub('① 대시보드 — 캠페인 준수율 38%')
await hold(1.6)
// ② 게시물 → 조치 필요 → 위반 게시물
await tap('nav a', '게시물', 300)
await sleep(350)
await helpers()
await sub("② 게시물 '조치 필요' → 위반 게시물")
await hold(0.6)
await tap('main button', '조치 필요', 300)
await hold(0.5)
await tap('main *', '@daegu_foodie', 300)
await hold(0.3)
// ③ 수정 요청 메시지
await sub('③ 수정 요청 메시지 자동 작성')
await scroll('수정 요청 메시지', 90)
await hold(2.0)
// ④ 화면 스캔 → 예시 화면으로 체험
await tap('button[aria-label="닫기"]', '', 300)
await sleep(250)
await tap('nav a', '화면 스캔', 300)
await sleep(400)
await js('window.scrollTo(0, 0)')
await helpers()
await sub("④ 화면 스캔 '예시 화면으로 체험'")
await hold(0.8)
await tap('button', '예시 화면으로 체험', 300)
await waitFor(hasEnabled('이 장면으로 글자 읽기'), 30000)
// ⑤ 추천 장면 골라 글자 읽기
await sub('⑤ 추천 장면 골라 글자 읽기')
await scroll('장면 고르기', 76)
await hold(1.4)
await tap('button', '이 장면으로 글자 읽기', 320)
// ⑥ 글자 읽기 (빠르게 감기)
await sleep(250)
await sub('⑥ 글자 읽기 (빠르게 감기 ▶▶)')
const a = nowSec()
await waitFor(hasEnabled('게시물로 등록하고 검수'), 180000)
const b = nowSec()
ffwd.push([a, b])
console.log(`OCR ${(b - a).toFixed(1)}s → ${FFWD}s`)
await hold(0.2)
// ⑦ 게시물로 등록
await sub('⑦ 읽은 글을 게시물로 등록')
await scroll('게시물로 등록하고 검수', 520)
await hold(1.2)
await tap('button', '게시물로 등록하고 검수', 320)
await sleep(700)
await helpers()
// ⑧ 45점
await sub('⑧ 바로 검수: 45점 위반 위험')
await hold(2.0)
// ⑨ 협업 → 행사
await tap('button[aria-label="닫기"]', '', 300)
await sleep(250)
await tap('nav a', '협업', 300)
await sleep(400)
await js('window.scrollTo(0, 0)')
await helpers()
await sub("⑨ 협업 → 행사 '베이글하우스 겨울 신메뉴 시식회'")
await hold(0.6)
await tap('main button', '협업 행사', 300)
await hold(0.5)
await tap('main *', '베이글하우스 겨울 신메뉴 시식회', 300)
await sleep(400)
await helpers()
await hold(0.3)
// ⑩ 선착순 신청 → 5명 몰리기
await sub("⑩ 선착순 신청 '5명 몰리기'")
await tap('main button', '선착순 신청', 300)
await hold(0.7)
await tap('main button', '5명 몰리기', 320)
await hold(0.9)
// ⑪ 선발 5 · 대기 3
await sub('⑪ 신청 시각 순 자동 선발: 선발 5 · 대기 3')
await scroll('선착순 신청', 230)
await hold(3.6)

const stopWall = nowSec()
recording = false
await send('Page.stopScreencast')

// 실제 시각(epoch 초) → 영상 시각 (빠르게 감은 구간은 FFWD초로 줄인다)
const first = frames[0].t
const toVideo = (t) => {
  let v = t - first
  for (const [A, B] of ffwd) {
    const s0 = A - first
    const e0 = B - first
    if (v > e0) v -= e0 - s0 - FFWD
    else if (v > s0) v = s0 + (v - s0) * (FFWD / (e0 - s0))
  }
  return v
}
const rawEnd = toVideo(stopWall) // 마지막 화면이 멈춰 있으면 프레임이 안 오므로 멈춘 시각 기준
const k = rawEnd > TARGET ? TARGET / rawEnd : 1 // 재생 속도 배율의 역수
const video = (t) => toVideo(t) * k
const length = Math.max(LENGTH, Math.ceil((rawEnd * k + 0.6) * 10) / 10)
const list = []
frames.forEach((f, i) => {
  const name = `f${String(i).padStart(5, '0')}.jpg`
  writeFileSync(join(FRAMES, name), Buffer.from(f.data, 'base64'))
  const v = video(f.t)
  const next = i + 1 < frames.length ? video(frames[i + 1].t) : length + 0.4
  list.push(`file 'frames/${name}'`, `duration ${Math.max(0.001, next - v).toFixed(4)}`)
})
list.push(`file 'frames/f${String(frames.length - 1).padStart(5, '0')}.jpg'`)
writeFileSync(join(OUT, 'frames.txt'), list.join('\n'))

// 나레이션: 장면이 실제로 시작한 영상 시각 + 0.3초에 맞춘다
// 나레이션 문장과 Heami(말 속도 1)가 실제로 읽는 시간(초, 끝 무음 제외 측정값)
const NARRATION = {
  '①': ['준수율 삼십팔 퍼센트. 위반 게시물을 볼게요.', 4.0],
  '③': ['수정 요청 메시지는 자동 작성.', 2.3],
  '④': ['화면 스캔은 여러 장 찍은 화면에서 가장 선명한 장면을 골라 글자를 읽어요.', 5.2],
  '⑦': ['등록하면 바로 검수, 사십오 점 위반 위험이에요.', 3.75],
  '⑨': ['협업 탭에서 행사 선착순 신청을 받아요.', 2.95],
  '⑪': ['다섯 명 선발, 세 명은 대기예요.', 2.7],
}
const scenes = marks.map(([w, t]) => [t, video(w / 1000)])
// 장면이 실제로 시작한 영상 시각 + 0.3초. 단, 앞 문장이 끝나기 전에는 시작하지 않는다
let free = 0.2
const lines = scenes.filter(([t]) => NARRATION[t]).map(([t, v]) => {
  const [text, sec] = NARRATION[t]
  const start = +Math.max(free, v + 0.3).toFixed(2)
  free = start + sec + 0.3
  return [start, text]
})
if (free > length + 0.1) console.warn(`경고: 나레이션이 영상 끝(${length}s)을 넘음 (${free.toFixed(1)}s)`)
if (1 / k > 1.25) console.warn(`경고: 재생 속도 ${(1 / k).toFixed(2)}배 — 컴퓨터가 바쁠 때 녹화됨, 다시 녹화 권장`)
writeFileSync(join(OUT, 'narration.json'), JSON.stringify(lines, null, 1))
writeFileSync(join(OUT, 'length.txt'), String(length))
console.log('scenes', scenes.map(([t, v]) => `${t}@${v.toFixed(1)}`).join(' '))
console.log('frames', frames.length, 'raw', rawEnd.toFixed(1), 'speed', (1 / k).toFixed(2), 'length', length)
page.close()
