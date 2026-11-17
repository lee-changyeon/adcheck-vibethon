import { ArrowLeft, Eraser, ScanSearch, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import ResultView from '../components/ResultView'
import { Button, ChoiceChips, Input, SectionTitle, Textarea } from '../components/ui'
import { runCheck } from '../data/rules'
import { EXAMPLES, makeRecord } from '../data/sample'
import { type CheckInput, type CheckResult, PLATFORM_LABEL, type Platform, REWARD_LABEL, type Reward } from '../data/types'
import { useHistory } from '../hooks/useHistory'
import { useLocalStorage } from '../hooks/useLocalStorage'

const EMPTY: CheckInput = { platform: 'instagram', reward: 'product', brand: '', text: '' }

const PLATFORMS = (Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => ({ value: p, label: PLATFORM_LABEL[p] }))
const REWARDS = (Object.keys(REWARD_LABEL) as Reward[]).map((r) => ({ value: r, label: REWARD_LABEL[r] }))

/** 기능 ①②: 광고 표시 점검 + 고친 글 */
export default function CheckPage() {
  const [draft, setDraft] = useLocalStorage<CheckInput>('adcheck.draft', EMPTY)
  const [result, setResult] = useState<CheckResult | null>(null)
  /** 「고친 글로 점검」 직전의 글과 결과. 돌아가기 버튼에 쓴다 */
  const [previous, setPrevious] = useState<{ draft: CheckInput; result: CheckResult } | null>(null)
  const [, setHistory] = useHistory()
  const resultRef = useRef<HTMLDivElement>(null)

  const scrollToResult = () =>
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)

  const update = (patch: Partial<CheckInput>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setResult(null)
    setPrevious(null)
  }

  const check = (input: CheckInput) => {
    if (!input.text.trim()) return
    setResult(runCheck(input))
    setHistory((h) => [makeRecord(input), ...h].slice(0, 100))
    scrollToResult()
  }

  const recheck = (text: string) => {
    if (result) setPrevious({ draft, result })
    const next = { ...draft, text }
    setDraft(next)
    check(next)
  }

  const goBack = () => {
    if (!previous) return
    setDraft(previous.draft)
    setResult(previous.result)
    setPrevious(null)
    scrollToResult()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-5 text-white">
        <p className="text-2xl font-extrabold tracking-tight">올리기 전에 30초 점검 ✅</p>
        <p className="mt-1 text-sm leading-relaxed text-white/70">
          협찬 글을 붙여넣으면 공정위 광고 표시 기준으로 뒷광고 위험을 찾고, 고친 글까지 만들어 드려요.
        </p>
      </section>

      <section>
        <SectionTitle>
          <span className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-slate-950" /> 예시 글로 체험하기
          </span>
        </SectionTitle>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => {
                setDraft(ex.input)
                setResult(null)
                setPrevious(null)
              }}
              className="shrink-0 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-200 active:scale-95"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-600">어디에 올리나요?</p>
          <ChoiceChips options={PLATFORMS} value={draft.platform} onChange={(platform) => update({ platform })} />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-600">업체에서 무엇을 받았나요?</p>
          <ChoiceChips options={REWARDS} value={draft.reward} onChange={(reward) => update({ reward })} cols={2} />
        </div>
        <Input label="업체·브랜드 이름 (선택)" placeholder="예: 베이글하우스" value={draft.brand} onChange={(e) => update({ brand: e.target.value })} />
        <div>
          <Textarea
            label={draft.platform === 'instagram' ? '올릴 글 (본문 + 해시태그)' : '올릴 글 (첫 줄은 제목)'}
            rows={8}
            placeholder={'올릴 글을 그대로 붙여넣으세요.\n예: 대명동 베이글 맛집 발견 🥯 ...\n#대구맛집 #협찬'}
            value={draft.text}
            onChange={(e) => update({ text: e.target.value })}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>{draft.text.trim().length}자</span>
            {draft.text && (
              <button type="button" className="flex items-center gap-1 py-1 font-medium" onClick={() => update({ text: '' })}>
                <Eraser size={14} /> 지우기
              </button>
            )}
          </div>
        </div>
        <Button
          full
          onClick={() => {
            setPrevious(null)
            check(draft)
          }}
          disabled={!draft.text.trim()} className="py-4 text-base">
          <ScanSearch size={20} /> 점검하기
        </Button>
      </section>

      <section ref={resultRef} className="scroll-mt-20">
        {result && (
          <>
            <SectionTitle>점검 결과</SectionTitle>
            {previous && (
              <Button variant="secondary" full onClick={goBack} className="mb-3">
                <ArrowLeft size={18} /> 원래 글로 돌아가기 ({previous.result.score}점)
              </Button>
            )}
            <ResultView result={result} onRecheck={recheck} />
          </>
        )}
      </section>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」을 바탕으로 한 참고용 점검이며, 법률 자문이 아니에요.
      </p>
    </div>
  )
}
