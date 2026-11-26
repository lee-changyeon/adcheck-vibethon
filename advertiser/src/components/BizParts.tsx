import { AlertTriangle, ChevronDown, Lightbulb, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ActionStatus, Campaign } from '../data/biz'
import { STATUS_LABEL } from '../data/biz'
import { type Issue, type Severity, VERDICT_COLOR, type Verdict } from '../data/types'
import { Badge, type BadgeColor } from './ui'

/** 지금 보고 있는 캠페인을 바꾸는 선택 상자 */
export function CampaignSwitcher({ campaigns, value, onChange }: { campaigns: Campaign[]; value: string; onChange: (id: string) => void }) {
  return (
    <label className="relative block">
      <span className="sr-only">캠페인 선택</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full appearance-none rounded-2xl bg-white ring-1 ring-inset ring-slate-200 py-3 pl-5 pr-12 text-base font-semibold outline-none focus:ring-2 focus:ring-brand-600"
      >
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.brand} · {c.name}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-brand-700" />
    </label>
  )
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return <Badge color={VERDICT_COLOR[verdict]}>{verdict}</Badge>
}

const STATUS_COLOR: Record<ActionStatus, BadgeColor> = { open: 'slate', requested: 'brand', resolved: 'green' }
export function StatusBadge({ status }: { status: ActionStatus }) {
  return <Badge color={STATUS_COLOR[status]}>{STATUS_LABEL[status]}</Badge>
}

const SEVERITY_STYLE: Record<Severity, { icon: typeof ShieldAlert; box: string; color: string; label: string }> = {
  danger: { icon: ShieldAlert, box: 'bg-red-50', color: 'text-red-600', label: '위반' },
  warning: { icon: AlertTriangle, box: 'bg-amber-50', color: 'text-amber-600', label: '보완' },
  tip: { icon: Lightbulb, box: 'bg-slate-100', color: 'text-slate-500', label: '팁' },
}

/** 문제 항목 목록 (짧은 형태): 흰 둥근 카드 + 신호색 원 아이콘 */
export function IssueList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0)
    return (
      <p className="flex items-center gap-2.5 rounded-2xl bg-green-50 p-3 pl-4 text-sm font-bold text-green-700">
        <ShieldCheck size={18} className="shrink-0" /> 광고 표시 규칙을 잘 지킨 게시물이에요.
      </p>
    )
  return (
    <div className="space-y-2">
      {issues.map((i) => {
        const s = SEVERITY_STYLE[i.severity]
        const Icon = s.icon
        return (
          <div key={i.code} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${s.box}`}>
              <Icon size={18} className={s.color} />
            </span>
            <div className="min-w-0 self-center text-sm">
              <p className="font-extrabold">
                <span className={`mr-1 text-xs ${s.color}`}>{s.label}</span>
                {i.title}
              </p>
              {i.found && (
                <p className="mt-0.5 text-slate-600">
                  문제 표현: <mark className="bg-transparent px-0.5 font-semibold text-slate-950 underline decoration-red-600 decoration-2 underline-offset-2">{i.found}</mark>
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
