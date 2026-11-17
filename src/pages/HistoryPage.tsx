import { History, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ResultView from '../components/ResultView'
import { Badge, BottomSheet, Button, Card, EmptyState } from '../components/ui'
import { runCheck } from '../data/rules'
import { type CheckRecord, PLATFORM_LABEL, REWARD_LABEL, VERDICT_COLOR } from '../data/types'
import { useHistory } from '../hooks/useHistory'

function when(iso: string) {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (days === 0) return `오늘 ${hm}`
  if (days === 1) return `어제 ${hm}`
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/** 기능 ③: 점검 이력 */
export default function HistoryPage() {
  const [history, setHistory] = useHistory()
  const [open, setOpen] = useState<CheckRecord | null>(null)

  if (history.length === 0) {
    return <EmptyState icon={<History size={40} />} title="아직 점검한 글이 없어요" description="점검 탭에서 올릴 글을 점검해 보세요" />
  }

  const remove = (id: string) => {
    setHistory((h) => h.filter((r) => r.id !== id))
    setOpen(null)
  }

  return (
    <div className="space-y-2">
      <p className="mb-3 text-sm text-slate-500">지금까지 {history.length}개의 글을 점검했어요. 누르면 자세히 볼 수 있어요.</p>
      {history.map((r) => (
        <Card key={r.id} onClick={() => setOpen(r)} className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg font-bold">{r.score}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{r.text.trim().split('\n')[0]}</p>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {when(r.createdAt)} · {PLATFORM_LABEL[r.platform]} · {r.brand || REWARD_LABEL[r.reward]}
            </p>
          </div>
          <Badge color={VERDICT_COLOR[r.verdict]}>{r.verdict}</Badge>
        </Card>
      ))}

      <BottomSheet open={open !== null} onClose={() => setOpen(null)} title="점검 상세">
        {open && (
          <div className="max-h-[70svh] space-y-4 overflow-y-auto">
            <p className="text-xs text-slate-400">
              {when(open.createdAt)} · {PLATFORM_LABEL[open.platform]} · {REWARD_LABEL[open.reward]}
              {open.brand && ` · ${open.brand}`}
            </p>
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-600">원래 글</p>
              <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 font-sans text-sm leading-relaxed">{open.text}</pre>
            </div>
            <ResultView result={runCheck(open)} />
            <Button variant="ghost" full onClick={() => remove(open.id)} className="text-red-600">
              <Trash2 size={16} /> 이 기록 삭제
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
