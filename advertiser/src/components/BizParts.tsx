import { AlertTriangle, ChevronDown, Lightbulb, ShieldAlert } from 'lucide-react'
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
        className="min-h-12 w-full appearance-none rounded-3xl border-2 border-transparent bg-slate-100 in-data-[surface=soft]:bg-white py-3 pl-5 pr-12 text-base font-semibold outline-none focus:border-slate-950 focus:bg-white focus:ring-[6px] focus:ring-slate-100"
      >
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.brand} · {c.name}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-950" />
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
  danger: { icon: ShieldAlert, box: 'bg-white shadow-[inset_3px_0_0_var(--color-red-600)]', color: 'text-red-600', label: '위반' },
  warning: { icon: AlertTriangle, box: 'bg-white shadow-[inset_3px_0_0_var(--color-amber-600)]', color: 'text-amber-600', label: '보완' },
  tip: { icon: Lightbulb, box: 'bg-white shadow-[inset_3px_0_0_var(--color-slate-400)]', color: 'text-slate-500', label: '팁' },
}

/** 문제 항목 목록 (짧은 형태) */
export function IssueList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return <p className="bg-white p-3 pl-4 text-sm font-medium text-green-700 shadow-[inset_3px_0_0_var(--color-green-700)]">광고 표시 규칙을 잘 지킨 게시물이에요.</p>
  return (
    <div className="space-y-2">
      {issues.map((i) => {
        const s = SEVERITY_STYLE[i.severity]
        const Icon = s.icon
        return (
          <div key={i.code} className={`flex gap-2.5 p-3 pl-4 ${s.box}`}>
            <Icon size={18} className={`mt-0.5 shrink-0 ${s.color}`} />
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
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
