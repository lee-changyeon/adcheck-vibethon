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

const RING: Record<Verdict, string> = { 적합: '#16a34a', '보완 필요': '#d97706', '위반 위험': '#dc2626' }

const SEVERITY_STYLE: Record<Severity, { icon: typeof ShieldAlert; box: string; iconColor: string; label: string }> = {
  danger: { icon: ShieldAlert, box: 'bg-red-50 ring-red-100', iconColor: 'text-red-600', label: '위반' },
  warning: { icon: AlertTriangle, box: 'bg-amber-50 ring-amber-100', iconColor: 'text-amber-600', label: '보완' },
  tip: { icon: Lightbulb, box: 'bg-slate-50 ring-slate-100', iconColor: 'text-slate-500', label: '팁' },
}

function ScoreRing({ score, verdict }: { score: number; verdict: Verdict }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={RING[verdict]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-[11px] text-slate-400">/ 100점</span>
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
          <div key={issue.code} className={`flex gap-3 rounded-2xl p-4 ring-1 ${s.box}`}>
            <Icon size={20} className={`mt-0.5 shrink-0 ${s.iconColor}`} />
            <div className="min-w-0">
              <p className="font-semibold">
                <span className={`mr-1 text-xs ${s.iconColor}`}>{s.label}</span>
                {issue.title}
              </p>
              {issue.found && (
                <p className="mt-1 text-sm">
                  문제 표현: <mark className="rounded bg-white px-1 font-semibold">{issue.found}</mark>
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
        <Card className="space-y-3 ring-brand-100">
          <p className="font-bold text-brand-700">✍️ 이렇게 고쳐서 올리세요</p>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-brand-50 p-3 font-sans text-sm leading-relaxed">{fixedText}</pre>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? '복사됨' : '고친 글 복사'}
            </Button>
            {onRecheck && (
              <Button variant="secondary" onClick={() => onRecheck(fixedText)}>
                <RefreshCw size={16} /> 고친 글로 점검
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
