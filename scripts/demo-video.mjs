// 애드체크 30초 시연영상 녹화: headless Chrome 화면 녹화(screencast) → 프레임 PNG + 타이밍 목록
// 사용: 개발 서버(npm run dev -- --port 5175)를 켠 뒤
//   node scripts/demo-video.mjs <작업폴더(임시)> [base=http://localhost:5175]
// 결과: <작업폴더>/frames/*.jpg, <작업폴더>/frames.txt (ffmpeg concat 목록). 이어서 scripts/demo-video-encode.ps1로 인코딩
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.argv[2]
const BASE = process.argv[3] ?? 'http://localhost:5175'
const PORT = 9336
const FRAMES = join(OUT, 'frames')
rmSync(FRAMES, { recursive: true, force: true })
mkdirSync(FRAMES, { recursive: true })

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(OUT, '_profile')}`,
  '--no-first-run', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let targets
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break } catch { /* 대기 */ }
  await sleep(200)
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
const frames = []
let recording = false
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id
  pending.set(n, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)))
  ws.send(JSON.stringify({ id: n, method, params }))
})
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return }
  if (m.method === 'Page.screencastFrame') {
    const { data, sessionId, metadata } = m.params
    if (recording) frames.push({ t: metadata.timestamp, data })
    send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  }
})
const js = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval error')
  return r.result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true })

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
  // 0.9초: 작게 나타나 → 누르는 동안 유지 → 커지며 사라짐 (전환 대신 animate로 시작 상태를 보장)
  r.animate([
    { transform: 'scale(.6)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1, offset: 0.2 },
    { transform: 'scale(1)', opacity: 1, offset: 0.6 },
    { transform: 'scale(1.5)', opacity: 0 },
  ], { duration: 900, easing: 'ease-out' });
  setTimeout(() => r.remove(), 900);
};
window.__find = (sel, text) => [...document.querySelectorAll(sel)].find(e => e.textContent.trim().includes(text));
true`
const sub = (text) => js(`window.__sub(${JSON.stringify(text)})`)
/** 버튼·링크를 찾아 보이게 한 뒤 동그라미를 그리고 누른다 */
const tap = async (sel, text, waitBeforeClick = 450) => {
  const pos = await js(`(() => {
    const el = window.__find(${JSON.stringify(sel)}, ${JSON.stringify(text)});
    if (!el) throw new Error('not found: ${text}');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`)
  await js(`window.__ring(${pos.x}, ${pos.y})`)
  await sleep(waitBeforeClick)
  await js(`window.__find(${JSON.stringify(sel)}, ${JSON.stringify(text)}).click()`)
}
const smoothTo = (expr) => js(`window.scrollTo({ top: ${expr}, behavior: 'smooth' })`)
const topOf = (text, offset) => `(() => { const el = [...document.querySelectorAll('main *')].find(e => { const t=${JSON.stringify(text)}; return e.textContent.trim().startsWith(t) && ![...e.children].some(c => c.textContent.trim().startsWith(t)) }); return el.getBoundingClientRect().top + window.scrollY - ${offset} })()`

// 통계 화면(차트 라이브러리)은 따로 불러오므로 미리 한 번 열어 둔다. 그다음 샘플 데이터 상태로 시작 (localStorage 비움)
await send('Page.navigate', { url: BASE + '/stats' })
await sleep(3000)
await js('localStorage.clear()')
await send('Page.navigate', { url: BASE + '/' })
await sleep(2500)
await js(HELPERS)

await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 750, maxHeight: 1624, everyNthFrame: 1 })
await sleep(300)
recording = true
const t0 = Date.now()
const at = async (sec) => { const wait = t0 + sec * 1000 - Date.now(); if (wait > 0) await sleep(wait) }

// ① 첫 화면
await sub('① 애드체크 — 협찬 글 뒷광고 위험 점검')
await at(2.6)
await tap('a', '지금 점검하기')
await sleep(500)
await js(HELPERS)
// ② 예시 글 고르기
await sub("② 예시 글 '해시태그 끝에 #협찬'")
await at(3.9)
await js(`(() => {
  const s = document.querySelector('main select');
  window.__ring(s.getBoundingClientRect().left + s.offsetWidth / 2, s.getBoundingClientRect().top + s.offsetHeight / 2);
  Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, '0');
  s.dispatchEvent(new Event('change', { bubbles: true }));
})()`)
await sleep(350)
await smoothTo(topOf('올릴 글', 120))
// ③ 점검하기 → 30점
await at(5.4)
await sub('③ 점검하기 → 30점 위반 위험')
await tap('button', '점검하기', 300)
// ④ 문제 항목
await at(10.4)
await sub('④ 문제 항목 3개와 이유')
await smoothTo('window.scrollY + 330')
await at(12.8)
await smoothTo('window.scrollY + 330')
// ⑤ 고친 글로 점검
await at(15.0)
await sub('⑤ 고친 글로 점검')
await smoothTo(topOf('✍️ 이렇게 고쳐서 올리세요', 70))
await at(17.6)
await tap('button', '고친 글로 점검', 400)
// ⑥ 100점
await at(20.0)
await sub('⑥ 100점 적합 — 그대로 올리면 끝')
// ⑦ 통계
await at(24.0)
await tap('nav a', '통계', 350)
await sleep(400)
await js(HELPERS)
await sub('⑦ 통계 탭: 내가 자주 틀리는 항목')
await at(26.2)
await smoothTo(topOf('내가 자주 틀리는 항목', 64))
await at(30.4)

recording = false
await send('Page.stopScreencast')
const first = frames[0].t
const list = []
frames.forEach((f, i) => {
  const name = `f${String(i).padStart(5, '0')}.jpg`
  writeFileSync(join(FRAMES, name), Buffer.from(f.data, 'base64'))
  const next = frames[i + 1]?.t ?? first + 30.4
  list.push(`file 'frames/${name}'`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`)
})
list.push(`file 'frames/f${String(frames.length - 1).padStart(5, '0')}.jpg'`)
writeFileSync(join(OUT, 'frames.txt'), list.join('\n'))
// 통계 화면에서 가장 많이 틀린 항목 (나레이션 문구 확인용)
console.log('frames', frames.length, 'span', (frames.at(-1).t - first).toFixed(2), 'top item:', await js(`(document.querySelector('.recharts-yAxis .recharts-cartesian-axis-tick text') || {}).textContent`))
ws.close()
chrome.kill()
