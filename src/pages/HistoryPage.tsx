import { ScanSearch, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { DocArt } from '../components/Art'
import ResultView from '../components/ResultView'
import { Badge, BottomSheet, Button, Card, EmptyState, HeroType, LinkButton, PageHero, Pill } from '../components/ui'
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

  const hero = (
    <PageHero
      pills={<Pill>이 휴대폰에만 저장</Pill>}
      title={
        <>
          <HeroType>
            <span className="text-brand-sky">내</span> <span className="text-brand-500">점검</span>
          </HeroType>
          <br />
          <HeroType>기록</HeroType>
        </>
      }
      desc={history.length > 0 ? `지금까지 ${history.length}개의 글을 점검했어요. 누르면 자세히 볼 수 있어요.` : undefined}
      art={<DocArt className="-rotate-6" />}
    />
  )

  if (history.length === 0) {
    return (
      <div>
        {hero}
        <EmptyState
          icon={<DocArt className="w-20" />}
          title="아직 점검한 글이 없어요"
          description="점검 탭에서 올릴 글을 점검해 보세요"
          action={
            <LinkButton to="/check">
              <ScanSearch size={18} /> 점검하러 가기
            </LinkButton>
          }
        />
      </div>
    )
  }

  const remove = (id: string) => {
    setHistory((h) => h.filter((r) => r.id !== id))
    setOpen(null)
  }

  return (
    <div className="space-y-3">
      {hero}
      {history.map((r) => (
        <Card key={r.id} onClick={() => setOpen(r)} className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-black text-brand-800">{r.score}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-950">{r.text.trim().split('\n')[0]}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {when(r.createdAt)} · {PLATFORM_LABEL[r.platform]} · {r.brand || REWARD_LABEL[r.reward]}
            </p>
          </div>
          <Badge color={VERDICT_COLOR[r.verdict]}>{r.verdict}</Badge>
        </Card>
      ))}

      <BottomSheet open={open !== null} onClose={() => setOpen(null)} title="점검 상세">
        {open && (
          <div className="max-h-[70svh] space-y-4 overflow-y-auto">
            <p className="text-xs text-slate-500">
              {when(open.createdAt)} · {PLATFORM_LABEL[open.platform]} · {REWARD_LABEL[open.reward]}
              {open.brand && ` · ${open.brand}`}
            </p>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-600">원래 글</p>
              <pre className="whitespace-pre-wrap rounded-2xl bg-white p-4 font-sans text-sm leading-relaxed">{open.text}</pre>
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
