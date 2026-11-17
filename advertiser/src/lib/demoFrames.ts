/*
 * 예시 화면: 카메라 없이도 시연할 수 있도록 '다른 휴대폰 화면을 연속으로 찍은 사진' 6장을 만든다.
 * 장마다 흔들림(흐림), 화면 깜빡임 줄무늬, 모아레, 위치 어긋남을 다르게 넣고, 비교적 깨끗한 장도 한 장 둔다.
 */

export const DEMO_HANDLE = '@daegu_brunch_log'

const CAPTION = [
  '대명동 베이글하우스 신메뉴 먹어봤어요',
  '블루베리 크림치즈 베이글이 진짜 꾸덕하고',
  '쑥 베이글은 향이 은은해서 커피랑 잘 어울려요',
  '주말 오전엔 웨이팅 있으니 일찍 가세요',
]
const TAGS = '#대구맛집 #대명동카페 #베이글맛집 #대구브런치 #빵스타그램 #신메뉴 #베이글하우스 #협찬'

const W = 720
const H = 1040
const FONT = "'Pretendard Variable', Pretendard, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif"

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('이 브라우저는 이미지 처리를 지원하지 않아요')
  return { c, ctx }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/** 깨끗한 원본 화면 (인스타그램 스타일 게시물) */
function drawScreen() {
  const { c, ctx } = makeCanvas(W, H)
  // 휴대폰 테두리
  ctx.fillStyle = '#1f2328'
  ctx.fillRect(0, 0, W, H)
  const sx = 28
  const sy = 28
  const sw = W - 56
  const sh = H - 56
  roundRect(ctx, sx, sy, sw, sh, 36)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.save()
  ctx.clip()

  const pad = sx + 28
  // 상단: 프로필
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(pad + 26, sy + 62, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(pad + 26, sy + 62, 21, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fcd34d'
  ctx.beginPath()
  ctx.arc(pad + 26, sy + 62, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#111827'
  ctx.font = `700 28px ${FONT}`
  ctx.textBaseline = 'middle'
  ctx.fillText(DEMO_HANDLE.slice(1), pad + 66, sy + 62)

  // 사진 영역: 베이글 그림
  const py = sy + 104
  const ph = 300
  const grad = ctx.createLinearGradient(sx, py, sx, py + ph)
  grad.addColorStop(0, '#fde7c4')
  grad.addColorStop(1, '#e9b97a')
  ctx.fillStyle = grad
  ctx.fillRect(sx, py, sw, ph)
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.ellipse(sx + sw / 2, py + ph / 2 + 20, 250, 95, 0, 0, Math.PI * 2)
  ctx.fill()
  const bagel = (cx: number, cy: number, r: number, color: string) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.beginPath()
    ctx.arc(cx - r * 0.25, cy - r * 0.3, r * 0.45, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2)
    ctx.fill()
  }
  bagel(sx + sw / 2 - 130, py + ph / 2 + 10, 78, '#b45309')
  bagel(sx + sw / 2 + 20, py + ph / 2 + 30, 82, '#6b8e23')
  bagel(sx + sw / 2 + 165, py + ph / 2 + 5, 72, '#7c3aed')

  // 아이콘 줄
  const iy = py + ph + 42
  ctx.strokeStyle = '#111827'
  ctx.lineWidth = 3.5
  for (let k = 0; k < 3; k++) {
    roundRect(ctx, pad + k * 54, iy - 15, 30, 30, 8)
    ctx.stroke()
  }
  ctx.fillStyle = '#111827'
  ctx.font = `700 24px ${FONT}`
  ctx.fillText('좋아요 1,284개', pad, iy + 50)

  // 본문
  ctx.font = `500 29px ${FONT}`
  let y = iy + 104
  const lineH = 46
  const maxW = sw - 56
  for (const line of CAPTION) {
    for (const l of wrap(ctx, line, maxW)) {
      ctx.fillText(l, pad, y)
      y += lineH
    }
  }
  y += 10
  ctx.fillStyle = '#1d4ed8'
  for (const l of wrap(ctx, TAGS, maxW)) {
    ctx.fillText(l, pad, y)
    y += lineH
  }
  ctx.fillStyle = '#9ca3af'
  ctx.font = `400 22px ${FONT}`
  ctx.fillText('2시간 전', pad, y + 10)
  ctx.restore()
  return c
}

type Distortion = { blur: number; band: number; period: number; moire: number; dx: number; dy: number; rot: number; noise: number }

const DISTORTIONS: Distortion[] = [
  { blur: 2.4, band: 0.22, period: 46, moire: 0.1, dx: 3, dy: -2, rot: 0.004, noise: 10 },
  { blur: 1.4, band: 0.3, period: 64, moire: 0.12, dx: -2, dy: 1, rot: -0.003, noise: 9 },
  { blur: 0.35, band: 0.06, period: 58, moire: 0.03, dx: 0, dy: 0, rot: 0, noise: 5 }, // 가장 깨끗한 장
  { blur: 3.4, band: 0.12, period: 38, moire: 0.06, dx: 4, dy: 3, rot: 0.006, noise: 12 },
  { blur: 0.9, band: 0.34, period: 52, moire: 0.16, dx: -1, dy: -3, rot: -0.002, noise: 8 },
  { blur: 1.8, band: 0.18, period: 72, moire: 0.08, dx: 2, dy: 2, rot: 0.003, noise: 10 },
]

function distort(src: HTMLCanvasElement, d: Distortion, seed: number) {
  const { c, ctx } = makeCanvas(W, H)
  ctx.fillStyle = '#1f2328'
  ctx.fillRect(0, 0, W, H)
  ctx.save()
  ctx.translate(W / 2 + d.dx, H / 2 + d.dy)
  ctx.rotate(d.rot)
  ctx.filter = d.blur > 0 ? `blur(${d.blur}px)` : 'none'
  ctx.drawImage(src, -W / 2, -H / 2)
  ctx.restore()
  ctx.filter = 'none'

  // 화면 깜빡임 줄무늬 (가로 띠, 장마다 위치가 다름)
  const phase = seed * 1.7
  for (let y = 0; y < H; y += 2) {
    const v = Math.sin((y / d.period) * Math.PI * 2 + phase)
    if (v > 0) {
      ctx.fillStyle = `rgba(20, 30, 60, ${v * d.band})`
      ctx.fillRect(0, y, W, 2)
    }
  }
  // 모아레 (기울어진 미세 격자)
  if (d.moire > 0) {
    ctx.save()
    ctx.globalAlpha = d.moire
    ctx.strokeStyle = seed % 2 ? '#7c3aed' : '#0e7490'
    ctx.lineWidth = 1
    const step = 5 + (seed % 3)
    for (let x = -H; x < W + H; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + H * 0.35, H)
      ctx.stroke()
    }
    ctx.restore()
  }
  // 가장자리 어둡게 (렌즈 비네팅)
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)
  // 센서 잡음
  const img = ctx.getImageData(0, 0, W, H)
  let s = seed * 9301 + 49297
  for (let i = 0; i < img.data.length; i += 4) {
    s = (s * 9301 + 49297) % 233280
    const n = (s / 233280 - 0.5) * 2 * d.noise
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** 예시 연속 촬영 6장 */
export async function makeDemoFrames(): Promise<HTMLCanvasElement[]> {
  if (document.fonts?.ready) await document.fonts.ready
  const clean = drawScreen()
  return DISTORTIONS.map((d, i) => distort(clean, d, i + 1))
}
