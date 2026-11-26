// 스토어 스크린샷 캡처: headless Chrome + DevTools 프로토콜 (라이브러리 없음)
// 사용: 개발 서버(npm run dev -- --port 5175)를 켠 뒤 node scripts/store-screenshots.mjs <출력폴더(임시)> [base=http://localhost:5175]
// 360×640 화면 × 3배율 = 1080×1920. 출력 폴더의 PNG를 확인한 뒤 docs/store/screenshots/로 복사한다
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.argv[2]
const BASE = process.argv[3] ?? 'http://localhost:5175'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
mkdirSync(OUT, { recursive: true })
const profile = join(OUT, '_profile')

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--hide-scrollbars', '--force-device-scale-factor=3', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let targets
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.length) break } catch { /* 아직 안 뜸 */ }
  await sleep(200)
}
const page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
})
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id
  pending.set(n, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)))
  ws.send(JSON.stringify({ id: n, method, params }))
})
const js = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval error')
  return r.result.value
}
const go = async (path) => { await send('Page.navigate', { url: BASE + path }); await sleep(1800) }
const shot = async (name) => {
  await sleep(500)
  const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
  console.log('saved', name)
}
/** 글자가 들어간 요소를 찾아 화면 위에서 top px 아래로 오게 스크롤 */
const scrollTo = (text, top = 70) => js(`(() => {
  const el = [...document.querySelectorAll('main *')].find(e => { const t = ${JSON.stringify(text)}; return e.textContent.trim().startsWith(t) && ![...e.children].some(c => c.textContent.trim().startsWith(t)) });
  if (!el) throw new Error('not found: ' + ${JSON.stringify(text)});
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - ${top});
})()`)
const click = (text) => js(`(() => {
  const b = [...document.querySelectorAll('button')].find(e => e.textContent.trim().includes(${JSON.stringify(text)}));
  if (!b) throw new Error('no button: ' + ${JSON.stringify(text)}); b.click();
})()`)

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 640, deviceScaleFactor: 3, mobile: true })
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

// 예시 기록 7건 (앱의 점검 함수로 만든 실제 결과), 지난 며칠에 걸쳐
await go('/')
await js(`(async () => {
  localStorage.clear();
  const { EXAMPLES, makeRecord } = await import('/src/data/sample.ts');
  const now = Date.now();
  const recs = EXAMPLES.map((ex, i) => makeRecord(ex.input, new Date(now - (i + 1) * 9 * 3600_000)));
  localStorage.setItem('adcheck.history', JSON.stringify(recs));
  localStorage.setItem('adcheck.draft', JSON.stringify(EXAMPLES[0].input));
})()`)

await go('/'); await shot('01_홈')
await go('/check'); await scrollTo('어디에 올리나요?', 96); await shot('02_점검입력')
await click('점검하기'); await sleep(1200); await scrollTo('점검 결과', 70); await shot('03_점검결과')
await js(`[...document.querySelectorAll('main p')].filter(p => p.textContent.includes('유료 파트너십')).forEach(p => p.style.opacity = '0')`); await scrollTo('✍️ 이렇게 고쳐서 올리세요', 98); await shot('04_고친글')
await click('고친 글로 점검'); await sleep(1200); await js(`document.querySelectorAll('main p').forEach(p => p.style.opacity = ''); document.querySelector('main').style.paddingBottom = '700px'`); await scrollTo('점검 결과', 76); await shot('05_재점검')
await go('/history'); await shot('06_이력')
await go('/stats'); await sleep(1500); await scrollTo('점검한 글', 250); await shot('07_통계')
await go('/guide'); await shot('08_가이드')

ws.close()
chrome.kill()
