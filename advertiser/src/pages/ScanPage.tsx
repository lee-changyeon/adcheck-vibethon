import { AlertTriangle, Camera, ClipboardList, Images, Layers, RotateCcw, ScanLine, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CampaignSwitcher } from '../components/BizParts'
import { Badge, Button, Card, ChoiceChips, EmptyState, Input, ProgressBar, SectionTitle, Textarea } from '../components/ui'
import { newId, normalizeHandle, type Post } from '../data/biz'
import { PLATFORM_LABEL, type Platform } from '../data/types'
import { useBiz } from '../hooks/useBiz'
import { DEMO_HANDLE, makeDemoFrames } from '../lib/demoFrames'
import { type Frame, grabFrame, fileToCanvas, prepareForOcr, rankFrames } from '../lib/frames'
import { recognizeText, splitPostText } from '../lib/ocr'

type Step = 'start' | 'camera' | 'review' | 'read'
type OcrState = { status: 'idle' } | { status: 'running'; percent: number; label: string } | { status: 'done'; confidence: number } | { status: 'error'; message: string }

const SHOTS = 8
const SHOT_INTERVAL_MS = 130
const PLATFORMS = (Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))
const cameraSupported = () => typeof window !== 'undefined' && window.isSecureContext && !!navigator.mediaDevices?.getUserMedia

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function bandingLevel(b: number): { label: string; color: 'green' | 'amber' | 'red' } {
  // 줄무늬 값 = 가로줄 평균 밝기(0~255)의 출렁임. 예시 화면 기준 깨끗한 장 4~8, 심한 장 18 이상
  if (b < 9) return { label: '적음', color: 'green' }
  if (b < 16) return { label: '보통', color: 'amber' }
  return { label: '많음', color: 'red' }
}

/** 기능 ④: 화면 촬영 스캔 — 여러 장 찍고 가장 선명한 장면을 골라 글자 인식 후 검수 */
export default function ScanPage() {
  const { campaigns, current, setCurrentId, addPostNow } = useBiz()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('start')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [frames, setFrames] = useState<Frame[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [shot, setShot] = useState(0)
  const [ocr, setOcr] = useState<OcrState>({ status: 'idle' })
  const [chosenUrl, setChosenUrl] = useState('')
  const [handle, setHandle] = useState('')
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [text, setText] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const runRef = useRef(0) // 화면을 벗어나거나 다시 시작하면 늦게 끝난 작업 결과를 버림

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  useEffect(
    () => () => {
      runRef.current++
      stopCamera()
    },
    [],
  )

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (step === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => undefined)
    }
  }, [step])

  if (!current) {
    return <EmptyState icon={<ClipboardList size={40} />} title="캠페인이 없어요" description="캠페인 탭에서 캠페인을 먼저 등록한 뒤 스캔해 주세요" />
  }

  const reset = () => {
    runRef.current++
    stopCamera()
    setStep('start')
    setFrames([])
    setSelectedId('')
    setShot(0)
    setOcr({ status: 'idle' })
    setChosenUrl('')
    setText('')
    setHandle('')
    setBusy('')
  }

  const analyze = async (canvases: HTMLCanvasElement[], defaultHandle = '') => {
    const run = runRef.current
    setBusy('가장 선명한 장면을 고르는 중…')
    await sleep(30) // 안내 문구가 먼저 그려지도록
    try {
      const ranked = rankFrames(canvases)
      if (run !== runRef.current) return
      setFrames(ranked)
      setSelectedId(ranked[0]?.id ?? '')
      setHandle(defaultHandle)
      setStep('review')
    } catch {
      setError('사진을 분석하지 못했어요. 다른 사진으로 다시 시도해 주세요.')
    } finally {
      if (run === runRef.current) setBusy('')
    }
  }

  const openCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setStep('camera')
    } catch (e) {
      const name = e instanceof DOMException ? e.name : ''
      setError(
        name === 'NotAllowedError'
          ? '카메라 사용이 거부되었어요. 브라우저 주소창의 권한 설정에서 카메라를 허용하거나, 사진 여러 장 불러오기를 이용해 주세요.'
          : name === 'NotFoundError'
            ? '이 기기에서 카메라를 찾지 못했어요. 사진 여러 장 불러오기를 이용해 주세요.'
            : '카메라를 켜지 못했어요. 사진 여러 장 불러오기를 이용해 주세요.',
      )
    }
  }

  const shoot = async () => {
    const video = videoRef.current
    if (!video || video.videoWidth === 0) {
      setError('카메라 화면이 아직 준비되지 않았어요. 잠시 후 다시 눌러 주세요.')
      return
    }
    setError('')
    const run = runRef.current
    const canvases: HTMLCanvasElement[] = []
    for (let i = 0; i < SHOTS; i++) {
      if (run !== runRef.current) return
      canvases.push(grabFrame(video))
      setShot(i + 1)
      await sleep(SHOT_INTERVAL_MS)
    }
    stopCamera()
    await analyze(canvases)
  }

  const loadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setBusy('사진을 불러오는 중…')
    const results = await Promise.allSettled(Array.from(files).slice(0, 12).map(fileToCanvas))
    const canvases = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
    if (canvases.length === 0) {
      setBusy('')
      setError('사진을 열지 못했어요. JPG·PNG 사진을 골라 주세요.')
      return
    }
    await analyze(canvases)
  }

  const loadDemo = async () => {
    setError('')
    setBusy('예시 연속 촬영 화면을 만드는 중…')
    try {
      const canvases = await makeDemoFrames()
      await analyze(canvases, DEMO_HANDLE)
    } catch {
      setBusy('')
      setError('예시 화면을 만들지 못했어요. 사진 불러오기를 이용해 주세요.')
    }
  }

  const readSelected = async () => {
    const frame = frames.find((f) => f.id === selectedId)
    if (!frame) return
    const run = runRef.current
    setChosenUrl(frame.canvas.toDataURL('image/jpeg', 0.85))
    setStep('read')
    setText('')
    setOcr({ status: 'running', percent: 0, label: '인식 준비 중' })
    try {
      const result = await recognizeText(prepareForOcr(frame.canvas), (percent, label) => {
        if (run === runRef.current) setOcr({ status: 'running', percent, label })
      })
      if (run !== runRef.current) return
      const { handle: found, body } = splitPostText(result.text)
      setText(body)
      setHandle((h) => h || found)
      setOcr({ status: 'done', confidence: result.confidence })
    } catch (e) {
      if (run !== runRef.current) return
      setOcr({ status: 'error', message: e instanceof Error ? e.message : '글자 인식에 실패했어요. 사진을 보며 글을 직접 입력해 주세요.' })
    }
  }

  const register = () => {
    const post: Post = {
      id: newId(),
      campaignId: current.id,
      influencer: normalizeHandle(handle),
      platform,
      text: text.trim(),
      status: 'open',
      updatedAt: new Date().toISOString(),
    }
    addPostNow(post)
    navigate('/posts', { state: { openId: post.id } })
  }

  const maxSharp = Math.max(1, ...frames.map((f) => f.sharpness))
  const valid = !!normalizeHandle(handle) && !!text.trim()

  return (
    <div className="space-y-4">
      <CampaignSwitcher campaigns={campaigns} value={current.id} onChange={setCurrentId} />

      {error && (
        <div className="flex gap-2 bg-slate-100 p-3 pl-4 text-sm text-red-700 shadow-[inset_3px_0_0_var(--color-red-600)]" role="alert">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {step === 'start' && (
        <>
          <Card className="space-y-2">
            <p className="flex items-center gap-2 font-bold">
              <ScanLine size={18} className="text-slate-950" /> 화면을 찍어서 검수하기
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              모니터나 휴대폰 화면을 찍으면 화면 깜빡임 때문에 <b>가로 줄무늬</b>가 생기고, 손떨림으로 글자가 흐려져요. 그래서 짧은 간격으로 <b>여러 장</b>을 찍은 뒤
              가장 선명한 장면(또는 여러 장을 겹친 합성본)을 골라 글자를 읽어요.
            </p>
          </Card>

          {busy ? (
            <Card className="text-center text-sm font-semibold text-slate-600">{busy}</Card>
          ) : (
            <div className="space-y-2">
              {cameraSupported() && (
                <Button full onClick={openCamera}>
                  <Camera size={18} /> 카메라 켜기
                </Button>
              )}
              <Button full variant="secondary" onClick={() => fileRef.current?.click()}>
                <Images size={18} /> 사진 여러 장 불러오기
              </Button>
              <Button full variant="secondary" onClick={loadDemo}>
                <Sparkles size={18} /> 예시 화면으로 체험
              </Button>
              {!cameraSupported() && (
                <p className="px-1 text-xs leading-relaxed text-slate-400">
                  지금 주소(http)에서는 보안 정책상 카메라를 쓸 수 없어요. 휴대폰 카메라 앱으로 같은 화면을 여러 장 찍은 뒤 불러오세요.
                </p>
              )}
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void loadFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </>
      )}

      {step === 'camera' && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl bg-black">
            <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover" />
          </div>
          <p className="text-sm text-slate-500">화면 전체가 들어오게 맞추고, 휴대폰을 최대한 움직이지 마세요.</p>
          {shot > 0 || busy ? (
            <Card className="space-y-2">
              <p className="text-sm font-semibold">{busy || `촬영 중 ${shot}/${SHOTS}`}</p>
              <ProgressBar value={(shot / SHOTS) * 100} />
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={reset}>
                취소
              </Button>
              <Button onClick={shoot}>
                <Camera size={18} /> 연속 {SHOTS}장 촬영
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-3">
          <SectionTitle
            action={
              <Button variant="ghost" className="px-2 py-1.5" onClick={reset}>
                <RotateCcw size={16} /> 다시 찍기
              </Button>
            }
          >
            장면 고르기 ({frames.length}장)
          </SectionTitle>
          <p className="text-sm text-slate-500">선명도가 높고 줄무늬가 적은 순서예요. 다른 장면을 누르면 그 장면으로 바꿀 수 있어요.</p>
          <div className="grid grid-cols-3 gap-2">
            {frames.map((f, i) => {
              const band = bandingLevel(f.banding)
              const selected = f.id === selectedId
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  aria-pressed={selected}
                  className={`overflow-hidden rounded-xl bg-white text-left ring-2 transition active:scale-[0.98] ${selected ? 'ring-slate-950' : 'ring-transparent'}`}
                >
                  <div className="relative">
                    <img src={f.thumb} alt={`${i + 1}위 장면`} className="aspect-[3/4] w-full object-cover" />
                    <div className="absolute left-1 top-1 flex flex-col items-start gap-1">
                      {i === 0 && <Badge color="brand">추천</Badge>}
                      {f.composite && (
                        <Badge color="slate">
                          <Layers size={11} className="mr-0.5 inline" />
                          합성
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5 p-1.5 text-[11px] leading-tight text-slate-500">
                    <p>
                      선명도 <b className="text-slate-800">{Math.round((f.sharpness / maxSharp) * 100)}</b>
                    </p>
                    <p>
                      줄무늬 <b className={band.color === 'green' ? 'text-green-700' : band.color === 'amber' ? 'text-amber-700' : 'text-red-700'}>{band.label}</b>
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          <Button full onClick={readSelected} disabled={!selectedId}>
            <ScanLine size={18} /> 이 장면으로 글자 읽기
          </Button>
        </div>
      )}

      {step === 'read' && (
        <div className="space-y-4">
          <SectionTitle
            action={
              <Button variant="ghost" className="px-2 py-1.5" onClick={() => setStep('review')} disabled={ocr.status === 'running'}>
                장면 다시 고르기
              </Button>
            }
          >
            글자 확인
          </SectionTitle>
          {chosenUrl && <img src={chosenUrl} alt="선택한 장면" className="max-h-[50svh] w-full rounded-2xl bg-slate-900 object-contain" />}

          {ocr.status === 'running' && (
            <Card className="space-y-2">
              <p className="text-sm font-semibold">
                {ocr.label} · {Math.round(ocr.percent)}%
              </p>
              <ProgressBar value={ocr.percent} />
            </Card>
          )}
          {ocr.status === 'error' && (
            <div className="flex gap-2 bg-slate-100 p-3 pl-4 text-sm text-amber-800 shadow-[inset_3px_0_0_var(--color-amber-600)]" role="alert">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p>{ocr.message}</p>
                <Button variant="secondary" className="px-3 py-2" onClick={readSelected}>
                  다시 시도
                </Button>
              </div>
            </div>
          )}
          {ocr.status === 'done' && (
            <p className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
              글자 인식 완료 (인식 신뢰도 {ocr.confidence}%). 사진과 비교해 틀린 글자를 고친 뒤 등록하세요.
            </p>
          )}

          <Input label="인플루언서 계정" placeholder="예: @daegu_foodie" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-600">플랫폼</p>
            <ChoiceChips options={PLATFORMS} value={platform} onChange={setPlatform} />
          </div>
          <Textarea
            label="인식된 게시물 글 (고칠 수 있어요)"
            rows={8}
            placeholder={ocr.status === 'running' ? '글자를 읽는 중이에요…' : '사진을 보며 게시물 글을 입력하세요'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button full disabled={!valid || ocr.status === 'running'} onClick={register}>
            게시물로 등록하고 검수
          </Button>
        </div>
      )}
    </div>
  )
}
