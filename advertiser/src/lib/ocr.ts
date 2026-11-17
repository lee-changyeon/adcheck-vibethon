/*
 * 브라우저 안 글자 인식 (tesseract.js)
 *  - 처음 쓸 때만 라이브러리를 불러오고(지연 로딩), 만든 작업자(worker)는 계속 재사용한다
 *  - 한글·영어 언어 데이터는 처음 한 번 인터넷(CDN)에서 받아 브라우저에 저장된다
 */
import type { Worker } from 'tesseract.js'

export type OcrResult = { text: string; confidence: number }
export type OcrProgress = (percent: number, label: string) => void

let workerPromise: Promise<Worker> | null = null
let onProgress: OcrProgress | null = null

const INIT_TIMEOUT_MS = 90_000

function report(status: string, progress: number) {
  if (!onProgress) return
  // 준비 단계 0~40%, 인식 단계 40~100%
  if (status === 'recognizing text') onProgress(40 + progress * 60, '글자 읽는 중')
  else if (status.includes('traineddata')) onProgress(10 + progress * 25, '한글 사전 받는 중 (처음 한 번)')
  else if (status.includes('core')) onProgress(progress * 10, '인식 엔진 불러오는 중')
  else onProgress(35 + progress * 5, '인식 준비 중')
}

function withTimeout<T>(p: Promise<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms)
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e: unknown) => {
        clearTimeout(t)
        reject(e instanceof Error ? e : new Error(String(e)))
      },
    )
  })
}

function getWorker() {
  if (!workerPromise) {
    workerPromise = withTimeout(
      (async () => {
        const { createWorker } = await import('tesseract.js')
        return createWorker('kor+eng', 1, { logger: (m) => report(m.status, m.progress) })
      })(),
      INIT_TIMEOUT_MS,
      '인식 엔진 준비 시간이 너무 오래 걸려요',
    ).catch((e: unknown) => {
      workerPromise = null // 다음에 다시 시도할 수 있게
      throw e
    })
  }
  return workerPromise
}

/** 인식 결과 정리: 줄 끝 공백, 겹친 공백, 빈 줄 반복, '# 태그' → '#태그' */
export function cleanOcrText(raw: string) {
  return raw
    .split('\n')
    .map((line) =>
      line
        .replace(/[ \t]+/g, ' ')
        .replace(/#\s+(?=\S)/g, '#')
        .replace(/@\s+(?=\w)/g, '@')
        .trim(),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 화면 글자에서 게시물 본문만 골라내기
 *  - 첫 부분의 영문 계정 이름 줄 → 계정으로 사용
 *  - '좋아요 N개', 'N시간 전' 같은 화면 장식 줄은 뺀다
 */
export function splitPostText(text: string) {
  let handle = ''
  const body: string[] = []
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t) continue // 인식기가 넣는 빈 줄은 뺀다
    // 본문 시작 전, 한글 없는 줄 끝의 영문 계정 이름 (앞의 프로필 사진은 '( . )' 같은 기호로 읽힘)
    const m = /@?([a-z0-9][a-z0-9._]{2,29})$/i.exec(t)
    if (!handle && body.length === 0 && m && !/[가-힣]/.test(t)) {
      handle = m[1]
      continue
    }
    if (/^좋아요\s*[\d,.]+\s*개/.test(t)) continue
    if (/^\d+\s*(초|분|시간|일|주)\s*전$/.test(t)) continue
    body.push(t)
  }
  return { handle, body: body.join('\n') }
}

/** 캔버스의 글자를 읽는다. 실패하면 한국어 오류 메시지로 던진다 */
export async function recognizeText(canvas: HTMLCanvasElement, progress?: OcrProgress): Promise<OcrResult> {
  onProgress = progress ?? null
  try {
    const worker = await getWorker()
    const { data } = await worker.recognize(canvas)
    onProgress?.(100, '완료')
    return { text: cleanOcrText(data.text), confidence: Math.round(data.confidence) }
  } catch (e) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    const detail = e instanceof Error && /[가-힣]/.test(e.message) ? e.message : ''
    throw new Error(
      offline
        ? '인터넷이 연결되지 않아 글자 인식 엔진을 불러오지 못했어요. 사진을 보며 글을 직접 입력해 주세요.'
        : `글자 인식에 실패했어요${detail ? ` (${detail})` : ''}. 사진을 보며 글을 직접 입력해 주세요.`,
    )
  } finally {
    onProgress = null
  }
}
