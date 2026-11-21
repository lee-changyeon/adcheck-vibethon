import { AlertTriangle, Check, Copy, Info, Lightbulb, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { copyText } from '../lib/clipboard'
import { type CheckResult, type Severity, VERDICT_COLOR, type Verdict } from '../data/types'
import { Badge, Button, Card } from './ui'

const VERDICT_TEXT: Record<Verdict, string> = {
  적합: '광고 표시 규칙을 잘 지켰어요. 그대로 올려도 좋아요.',
  '보완 필요': '큰 문제는 없지만 더 명확하게 고치는 게 좋아요.',
  '위반 위험': '이대로 올리면 뒷광고로 보일 수 있어요. 고친 글을 사용하세요.',
}

/** 점수 고리 색 = index.css 신호색 (적합 green-700 · 보완 amber-600 · 위반 red-600) */
const RING: Record<Verdict, string> = { 적합: 'var(--color-green-700)', '보완 필요': 'var(--color-amber-600)', '위반 위험': 'var(--color-red-600)' }

const SEVERITY_STYLE: Record<Severity, { icon: typeof ShieldAlert; box: string; iconColor: string; label: string }> = {
  danger: { icon: ShieldAlert, box: 'bg-slate-100 shadow-[inset_3px_0_0_var(--color-red-600)]', iconColor: 'text-red-600', label: '위반' },
  warning: { icon: AlertTriangle, box: 'bg-slate-100 shadow-[inset_3px_0_0_var(--color-amber-600)]', iconColor: 'text-amber-600', label: '보완' },
  tip: { icon: Lightbulb, box: 'bg-slate-100 shadow-[inset_3px_0_0_var(--color-slate-400)]', iconColor: 'text-slate-500', label: '팁' },
}

function ScoreRing({ score, verdict }: { score: number; verdict: Verdict }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-slate-200)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={RING[verdict]}
          strokeWidth="8"
          strokeLinecap="butt"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-[11px] text-slate-500">/ 100점</span>
      </div>
    </div>
  )
}

/** 점검 결과: 점수 · 항목별 문제 · 고친 글 */
export default function ResultView({ result, onRecheck }: { result: CheckResult; onRecheck?: (text: string) => void }) {
  const [copied, setCopied] = useState(false)
  const { score, verdict, issues, fixedText, reminders } = result
  const needsFix = issues.length > 0

  const copy = async () => {
    const ok = await copyText(fixedText)
    setCopied(ok)
    if (ok) setTimeout(() => setCopied(false), 2000)
    else alert('복사하지 못했어요. 글을 길게 눌러 직접 복사해 주세요.')
  }

  return (
    <div className="space-y-3">
      <Card className="flex items-center gap-4">
        <ScoreRing score={score} verdict={verdict} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {verdict === '적합' ? <ShieldCheck size={20} className="text-green-600" /> : <ShieldAlert size={20} className={verdict === '위반 위험' ? 'text-red-600' : 'text-amber-600'} />}
            <Badge color={VERDICT_COLOR[verdict]}>{verdict}</Badge>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{VERDICT_TEXT[verdict]}</p>
        </div>
      </Card>

      {issues.map((issue) => {
        const s = SEVERITY_STYLE[issue.severity]
        const Icon = s.icon
        return (
          <div key={issue.code} className={`flex gap-3 p-4 pl-5 ${s.box}`}>
            <Icon size={20} className={`mt-0.5 shrink-0 ${s.iconColor}`} />
            <div className="min-w-0">
              <p className="font-semibold">
                <span className={`mr-1 text-xs ${s.iconColor}`}>{s.label}</span>
                {issue.title}
              </p>
              {issue.found && (
                <p className="mt-1 text-sm">
                  문제 표현: <mark className="bg-white px-1 font-semibold text-slate-950 underline decoration-red-600 decoration-2 underline-offset-2">{issue.found}</mark>
                </p>
              )}
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{issue.detail}</p>
            </div>
          </div>
        )
      })}

      {reminders.map((r) => (
        <p key={r} className="flex gap-2 px-1 text-sm leading-relaxed text-slate-500">
          <Info size={16} className="mt-0.5 shrink-0" />
          {r}
        </p>
      ))}

      {needsFix && (
        <Card className="space-y-4">
          <p className="text-lg font-semibold text-slate-950">✍️ 이렇게 고쳐서 올리세요</p>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap bg-white p-4 font-sans text-sm leading-relaxed">{fixedText}</pre>
          <div className="grid gap-2">
            <Button onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? '복사됨' : '고친 글 복사'}
            </Button>
            {onRecheck && (
              <Button variant="secondary" onClick={() => onRecheck(fixedText)} className="bg-white hover:bg-slate-50">
                <RefreshCw size={16} /> 고친 글로 점검
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
