// 스토어 그래픽 이미지 1024×500: 앱 홈의 SVG 일러스트 + 새 스크린샷 2장으로 HTML을 만들어 headless Chrome으로 캡처
// 사용: 스크린샷을 먼저 찍은 뒤 node scripts/store-feature-graphic.mjs <프로젝트폴더> <스크린샷폴더(임시)> <출력png>
import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [ROOT, SHOTS, OUT] = process.argv.slice(2)
const BASE = 'http://localhost:5175'
const PORT = 9334
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(SHOTS, '_fgprofile')}`,
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
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } })
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id
  pending.set(n, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)))
  ws.send(JSON.stringify({ id: n, method, params }))
})
const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value

await send('Page.enable')
await send('Page.navigate', { url: BASE + '/' })
await sleep(2000)
// 홈 히어로의 일러스트 4개(휴대폰·#협찬 딱지·말풍선·방패)와 머리말 방패 로고
const svgs = await js(`[...document.querySelectorAll('main section svg')].slice(0, 4).map(s => s.outerHTML)`)
const logo = await js(`document.querySelector('header svg').outerHTML`)

// @theme 색 변수를 그대로 :root에 옮긴다 (SVG가 var(--color-*)를 쓴다)
const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8')
const vars = [...css.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)].map((m) => `${m[1]}:${m[2]};`).join('')
const font = pathToFileURL(join(ROOT, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2')).href
const img = (f) => `data:image/png;base64,${readFileSync(join(SHOTS, f)).toString('base64')}`
const art = (i, style) => svgs[i].replace('<svg ', `<svg style="position:absolute;${style}" class="art" `)

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;src:url('${font}') format('woff2');font-weight:100 900}
:root{${vars}}
*{margin:0;box-sizing:border-box}
body{width:1024px;height:500px;overflow:hidden;font-family:P,sans-serif;position:relative;
  background:linear-gradient(180deg,var(--color-brand-100),var(--color-brand-50));color:var(--color-slate-900)}
.glow{position:absolute;left:120px;top:-140px;width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.55);filter:blur(60px)}
.art{filter:drop-shadow(0 10px 10px rgb(18 53 47 / .22))}
.brand{position:absolute;left:56px;top:44px;display:flex;align-items:center;gap:10px;font-size:28px;font-weight:900;letter-spacing:-.03em}
.pills{position:absolute;left:56px;top:110px;display:flex;gap:8px;align-items:center}
.pill{border-radius:999px;padding:5px 16px;font-size:19px;font-weight:800;background:rgba(255,255,255,.8)}
.t{position:absolute;left:52px;top:150px;font-size:88px;line-height:1.02;font-weight:900;letter-spacing:-.045em}
.t .back{position:absolute;inset:0;color:#fff;-webkit-text-stroke:16px #fff;text-shadow:0 16px 26px rgb(18 53 47 / .22)}
.t .back *{color:#fff}
.t .front{position:relative}
.sub{position:absolute;left:58px;top:362px;font-size:24px;font-weight:600;color:var(--color-slate-700);letter-spacing:-.02em}
.cta{position:absolute;left:56px;top:412px;border-radius:999px;background:var(--color-brand-600);color:#fff;font-size:22px;font-weight:800;padding:12px 28px;box-shadow:0 10px 20px -10px var(--color-brand-700)}
.phone{position:absolute;width:236px;border-radius:34px;border:7px solid #111414;overflow:hidden;box-shadow:0 30px 50px -20px rgb(18 53 47 / .45);background:#fff}
.phone img{display:block;width:100%}
</style></head><body>
<div class="glow"></div>
<div class="brand">${logo.replace('<svg ', '<svg style="width:34px" ')}애드체크</div>
<div class="pills">
  <span class="pill" style="color:var(--color-brand-700);box-shadow:inset 0 0 0 2px var(--color-brand-400)">협찬 글도</span>
  <span class="pill" style="color:var(--color-brand-sky);box-shadow:inset 0 0 0 2px var(--color-brand-sky-light)">후기 글도</span>
  <span style="transform:rotate(12deg) translateY(-6px);background:#111414;color:#fff;border-radius:16px 16px 16px 4px;padding:4px 12px;font-size:18px;font-weight:900">체크!</span>
</div>
<div class="t">
  <div class="back"><span>뒷광고</span><br>30초 점검</div>
  <div class="front"><span style="color:var(--color-brand-sky)">뒷</span><span style="color:var(--color-brand-500)">광고</span><br><span style="color:var(--color-slate-800)">30초 점검</span></div>
</div>
<div class="sub">협찬 글 붙여넣으면 고친 글까지 만들어 드려요</div>
<div class="cta">공정위 심사지침 기준 · 무료</div>
<div class="phone" style="left:604px;top:58px;transform:rotate(-6deg)"><img src="${img('01_홈.png')}"></div>
<div class="phone" style="left:780px;top:96px;transform:rotate(5deg)"><img src="${img('05_재점검.png')}"></div>
${art(1, 'left:520px;top:28px;width:110px;transform:rotate(-12deg)')}
${art(3, 'left:936px;top:20px;width:76px;transform:rotate(12deg)')}
${art(2, 'left:560px;top:392px;width:78px;transform:rotate(-8deg)')}
</body></html>`
const htmlPath = join(SHOTS, '_feature.html')
writeFileSync(htmlPath, html)

await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 500, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: pathToFileURL(htmlPath).href })
await sleep(1500)
const { data } = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(OUT, Buffer.from(data, 'base64'))
console.log('saved', OUT)
ws.close()
chrome.kill()
