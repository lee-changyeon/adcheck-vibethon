// headless Chrome + DevTools 프로토콜 도우미 (라이브러리 없음). 캡처·녹화 스크립트가 같이 쓴다.
import { spawn } from 'node:child_process'
import { join } from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Chrome을 띄우고 페이지 하나에 연결한다. onEvent(method, params)로 이벤트를 받는다 */
export async function openChrome({ port, profileDir, scale = 2, width = 375, height = 812, onEvent }) {
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    '--no-first-run', '--hide-scrollbars', `--force-device-scale-factor=${scale}`, 'about:blank',
  ], { stdio: 'ignore' })
  let targets
  for (let i = 0; i < 50; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break } catch { /* 대기 */ }
    await sleep(200)
  }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  let id = 0
  const pending = new Map()
  const send = (method, params = {}) => new Promise((res, rej) => {
    const n = ++id
    pending.set(n, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)))
    ws.send(JSON.stringify({ id: n, method, params }))
  })
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return }
    if (onEvent && m.method) onEvent(m.method, m.params, send)
  })
  const js = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval error')
    return r.result.value
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: true })
  const close = () => { ws.close(); chrome.kill() }
  return { send, js, close }
}

/** 페이지 조작 도우미 묶음: 이동·찾기·누르기·스크롤·기다리기 */
export function pageHelpers({ send, js }, base) {
  const go = async (path, wait = 1800) => { await send('Page.navigate', { url: base + path }); await sleep(wait) }
  /** 글자로 시작하는 가장 안쪽 요소를 화면 위에서 top px 아래로 (시트 안 스크롤 영역도 처리) */
  const scrollTo = (text, top = 70) => js(`(() => {
    const t = ${JSON.stringify(text)};
    const el = [...document.querySelectorAll('body *')].find(e => e.textContent.trim().startsWith(t) && ![...e.children].some(c => c.textContent.trim().startsWith(t)));
    if (!el) throw new Error('not found: ' + t);
    let box = el.parentElement;
    while (box && box !== document.body && !(box.scrollHeight > box.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(box).overflowY))) box = box.parentElement;
    if (box && box !== document.body) box.scrollTop += el.getBoundingClientRect().top - box.getBoundingClientRect().top - ${top} + 70;
    else window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - ${top});
  })()`)
  /** sel에 맞고 글자를 가진 요소 중 가장 안쪽 것을 누른다 (클릭은 바깥 카드까지 전달된다) */
  const click = (sel, text) => js(`(() => {
    const t = ${JSON.stringify(text)};
    const all = [...document.querySelectorAll(${JSON.stringify(sel)})].filter(e => e.textContent.includes(t));
    const el = all.find(e => !all.some(o => o !== e && e.contains(o)));
    if (!el) throw new Error('no element: ' + ${JSON.stringify(text)}); el.click(); return true;
  })()`)
  /** 조건식이 참이 될 때까지 기다린다 (최대 timeout ms) */
  const waitFor = async (expr, timeout = 15000) => {
    const end = Date.now() + timeout
    while (Date.now() < end) {
      if (await js(`!!(${expr})`).catch(() => false)) return true
      await sleep(250)
    }
    throw new Error('timeout: ' + expr)
  }
  const hasEnabled = (text) => `[...document.querySelectorAll('button')].some(b => b.textContent.includes(${JSON.stringify(text)}) && !b.disabled)`
  return { go, scrollTo, click, waitFor, hasEnabled }
}

export const profile = (out, name) => join(out, name)
