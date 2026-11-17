/*
 * 연속 촬영 프레임 고르기
 * 모니터·휴대폰 화면을 찍으면 화면 깜빡임(주사율)과 카메라 셔터가 어긋나 가로 줄무늬(밴딩)·모아레가 생기고,
 * 손떨림으로 흐려진다. 여러 장을 찍어 각 장의 점수를 매기고, 여러 장을 겹친 '합성본'도 후보로 만든 뒤 가장 좋은 장면을 고른다.
 *  - 선명도: 라플라시안(경계 강도) 분산 — 글자 경계가 또렷할수록 큼
 *  - 줄무늬: 가로줄 평균 밝기의 출렁임 — 화면 밴딩이 심할수록 큼
 *  - 합성본: 같은 위치 픽셀의 중앙값 — 장마다 위치가 바뀌는 줄무늬가 지워짐
 */

export type Frame = {
  id: string
  canvas: HTMLCanvasElement
  thumb: string // 미리보기용 작은 JPEG
  sharpness: number
  banding: number
  score: number
  composite: boolean
}

const ANALYZE_WIDTH = 400

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function ctx2d(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('이 브라우저는 이미지 처리를 지원하지 않아요')
  return ctx
}

/** 비디오의 현재 장면을 캔버스로 복사 (긴 변 maxSide 이하) */
export function grabFrame(source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement, maxSide = 1280) {
  const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.width
  const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.height
  const scale = Math.min(1, maxSide / Math.max(sw, sh))
  const c = makeCanvas(Math.round(sw * scale), Math.round(sh * scale))
  ctx2d(c).drawImage(source, 0, 0, c.width, c.height)
  return c
}

/** 작은 흑백 배열로 줄이기 (점수 계산용) */
function toGray(canvas: HTMLCanvasElement) {
  const w = ANALYZE_WIDTH
  const h = Math.max(1, Math.round((canvas.height / canvas.width) * w))
  const small = makeCanvas(w, h)
  const ctx = ctx2d(small)
  ctx.drawImage(canvas, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)
  const gray = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
  return { gray, w, h }
}

function sharpnessOf(gray: Float32Array, w: number, h: number) {
  let sum = 0
  let sum2 = 0
  let n = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const lap = gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w] - 4 * gray[i]
      sum += lap
      sum2 += lap * lap
      n++
    }
  }
  const mean = sum / n
  return sum2 / n - mean * mean
}

function rowMeans(gray: Float32Array, w: number, h: number) {
  const rows = new Float32Array(h)
  for (let y = 0; y < h; y++) {
    let s = 0
    for (let x = 0; x < w; x++) s += gray[y * w + x]
    rows[y] = s / w
  }
  return rows
}

function bandingOf(gray: Float32Array, w: number, h: number) {
  return rippleOf(rowMeans(gray, w, h))
}

/** 가로줄 평균 밝기에서 넓은 범위 평균을 빼고 남은 출렁임의 크기(RMS) */
function rippleOf(rows: Float32Array) {
  const h = rows.length
  const win = 12
  let acc = 0
  let n = 0
  for (let y = 0; y < h; y++) {
    let s = 0
    let c = 0
    for (let k = Math.max(0, y - win); k <= Math.min(h - 1, y + win); k++) {
      s += rows[k]
      c++
    }
    const d = rows[y] - s / c
    acc += d * d
    n++
  }
  return Math.sqrt(acc / n)
}

function scoreOf(sharpness: number, banding: number) {
  // 글자 인식에는 흐림이 줄무늬보다 치명적이라 줄무늬 감점은 완만하게
  return sharpness / (1 + (banding / 12) ** 2)
}

function toThumb(canvas: HTMLCanvasElement) {
  const t = makeCanvas(240, Math.round((canvas.height / canvas.width) * 240))
  ctx2d(t).drawImage(canvas, 0, 0, t.width, t.height)
  return t.toDataURL('image/jpeg', 0.7)
}

export function analyzeFrame(canvas: HTMLCanvasElement, id: string, composite = false): Frame {
  const { gray, w, h } = toGray(canvas)
  const sharpness = sharpnessOf(gray, w, h)
  const banding = bandingOf(gray, w, h)
  return { id, canvas, thumb: toThumb(canvas), sharpness, banding, score: scoreOf(sharpness, banding), composite }
}

/** 작은 흑백 배열 (위치 맞추기용) */
function smallGray(canvas: HTMLCanvasElement, w: number, h: number) {
  const s = makeCanvas(w, h)
  const ctx = ctx2d(s)
  ctx.drawImage(canvas, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)
  const g = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) g[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
  return g
}

/** 손떨림으로 어긋난 위치 찾기: 기준 장과 차이가 가장 작은 가로·세로 이동량 (작은 그림 기준 픽셀) */
function estimateShift(ref: Float32Array, img: Float32Array, w: number, h: number, range: number) {
  let best = { dx: 0, dy: 0, err: Infinity }
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      let err = 0
      for (let y = range; y < h - range; y += 2) {
        const ro = y * w
        const io = (y + dy) * w + dx
        for (let x = range; x < w - range; x += 2) err += Math.abs(ref[ro + x] - img[io + x])
      }
      if (err < best.err) best = { dx, dy, err }
    }
  }
  return best
}

/** 같은 위치 픽셀의 중앙값으로 합성. 첫 장을 기준으로 다른 장의 위치를 맞춘 뒤 합친다 */
export function medianComposite(canvases: HTMLCanvasElement[]) {
  const base = canvases[0]
  const W = base.width
  const H = base.height
  const sw = 200
  const sh = Math.max(1, Math.round((H / W) * sw))
  const k = W / sw
  const refSmall = smallGray(base, sw, sh)
  const datas = canvases.map((c, idx) => {
    let dx = 0
    let dy = 0
    if (idx > 0) {
      const s = estimateShift(refSmall, smallGray(c, sw, sh), sw, sh, 5)
      dx = s.dx * k
      dy = s.dy * k
    }
    const tmp = c.width === W && c.height === H && dx === 0 && dy === 0 ? c : (() => {
      const t = makeCanvas(W, H)
      const tctx = ctx2d(t)
      tctx.drawImage(base, 0, 0) // 이동으로 비는 가장자리는 기준 장으로 채움
      tctx.drawImage(c, -dx, -dy, W, H)
      return t
    })()
    return ctx2d(tmp).getImageData(0, 0, W, H).data
  })
  const out = makeCanvas(W, H)
  const octx = ctx2d(out)
  const img = octx.createImageData(W, H)
  const n = datas.length
  const vals = new Array<number>(n)
  for (let i = 0; i < W * H * 4; i++) {
    if ((i & 3) === 3) {
      img.data[i] = 255
      continue
    }
    for (let k = 0; k < n; k++) vals[k] = datas[k][i]
    // 작은 배열이라 삽입 정렬
    for (let a = 1; a < n; a++) {
      const v = vals[a]
      let b = a - 1
      while (b >= 0 && vals[b] > v) {
        vals[b + 1] = vals[b]
        b--
      }
      vals[b + 1] = v
    }
    img.data[i] = vals[n >> 1]
  }
  octx.putImageData(img, 0, 0)
  return out
}

/**
 * 프레임 목록 → 점수 계산 + 합성본 추가 → 점수 높은 순
 * 3장 이상이면 줄무늬는 '전체 중앙값 합성본과의 차이'로 잰다.
 * 글줄·사진처럼 모든 장에 똑같이 있는 가로 구조는 빠지고, 장마다 위치가 바뀌는 화면 깜빡임 줄무늬만 남기 때문.
 */
export function rankFrames(canvases: HTMLCanvasElement[]): Frame[] {
  const frames = canvases.map((c, i) => analyzeFrame(c, `f${i + 1}`))
  if (canvases.length >= 3) {
    // 너무 흐린 장(하위 1/3)은 빼고 합성
    const good = [...frames].sort((a, b) => b.sharpness - a.sharpness).slice(0, Math.max(3, Math.ceil(frames.length * 0.67)))
    frames.push(analyzeFrame(medianComposite(good.map((f) => f.canvas)), 'composite', true))

    // 기준 합성본은 점수 계산용이라 작은 크기로 만든다 (휴대폰에서도 빠르게)
    const ref = toGray(medianComposite(canvases.map((c) => grabFrame(c, ANALYZE_WIDTH * 1.5))))
    const refRows = rowMeans(ref.gray, ref.w, ref.h)
    for (const f of frames) {
      const g = toGray(f.canvas)
      if (g.h !== ref.h) continue // 비율이 다른 사진은 기존 방식 유지
      const rows = rowMeans(g.gray, g.w, g.h)
      // 차이의 표준편차 (전체 밝기 차이는 평균으로 빠짐). 손떨림으로 위아래가 어긋난 만큼은 맞춰 본 뒤 가장 작은 값
      let best = Infinity
      for (let sft = -6; sft <= 6; sft++) {
        let s = 0
        let s2 = 0
        let n = 0
        for (let y = 6; y < rows.length - 6; y++) {
          const d = rows[y + sft] - refRows[y]
          s += d
          s2 += d * d
          n++
        }
        if (n > 0) best = Math.min(best, Math.sqrt(Math.max(0, s2 / n - (s / n) ** 2)))
      }
      f.banding = Number.isFinite(best) ? best : f.banding
      f.score = scoreOf(f.sharpness, f.banding)
    }
  }
  return frames.sort((a, b) => b.score - a.score)
}

/** 글자 인식이 잘 되도록 흑백 + 명암 늘이기 + 작으면 키우기 */
export function prepareForOcr(canvas: HTMLCanvasElement) {
  const scale = canvas.width < 1200 ? 2 : 1
  const c = makeCanvas(canvas.width * scale, canvas.height * scale)
  const ctx = ctx2d(c)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(canvas, 0, 0, c.width, c.height)
  const img = ctx.getImageData(0, 0, c.width, c.height)
  const d = img.data
  const hist = new Array<number>(256).fill(0)
  const g = new Uint8ClampedArray(c.width * c.height)
  for (let i = 0; i < g.length; i++) {
    const v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]
    g[i] = v
    hist[g[i]]++
  }
  // 밝기 하위 2% ~ 상위 2%를 0~255로 늘이기
  const total = g.length
  let lo = 0
  let hi = 255
  for (let acc = 0; lo < 255 && acc + hist[lo] < total * 0.02; lo++) acc += hist[lo]
  for (let acc = 0; hi > 0 && acc + hist[hi] < total * 0.02; hi--) acc += hist[hi]
  const range = Math.max(1, hi - lo)
  for (let i = 0; i < g.length; i++) {
    const v = ((g[i] - lo) / range) * 255
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** 파일(사진) → 캔버스 */
export function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve(grabFrame(img, 1600))
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('사진을 열지 못했어요'))
    }
    img.src = url
  })
}
