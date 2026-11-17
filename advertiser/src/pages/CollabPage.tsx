import { CalendarDays, ChevronRight, Plus, Search, Send, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AccountLine, CreatorForm, EventForm } from '../components/CollabParts'
import { Badge, BottomSheet, Card, ChoiceChips, EmptyState, Fab, ProgressBar, ScrollChips, SectionTitle, Toast } from '../components/ui'
import {
  type Creator,
  type CreatorField,
  FIELD_LABEL,
  FIELDS,
  formatDateTime,
  formatFollowers,
  isClosed,
  rankApplications,
} from '../data/collab'
import { useCollab } from '../hooks/useCollab'
import { useToast } from '../hooks/useToast'

type Tab = 'creators' | 'events'
const TABS: { value: Tab; label: string }[] = [
  { value: 'creators', label: '크리에이터 DB' },
  { value: 'events', label: '협업 행사' },
]
type FieldFilter = 'all' | CreatorField

/** 기능: 협업 크리에이터 DB · 행사 목록 */
export default function CollabPage() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'events' ? 'events' : 'creators'

  return (
    <div className="space-y-5">
      <ChoiceChips options={TABS} value={tab} onChange={(t) => setParams(t === 'events' ? { tab: 'events' } : {}, { replace: true })} cols={2} />
      {tab === 'creators' ? <CreatorDb /> : <EventList />}
    </div>
  )
}

function CreatorDb() {
  const { creators, setCreators, setDms, setApplications } = useCollab()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [field, setField] = useState<FieldFilter>('all')
  /** null: 닫힘, 'new': 새로 등록, Creator: 수정 */
  const [editing, setEditing] = useState<Creator | 'new' | null>(null)

  const fieldOptions: { value: FieldFilter; label: string }[] = [
    { value: 'all', label: `전체 ${creators.length}` },
    ...FIELDS.filter((f) => creators.some((c) => c.field === f)).map((f) => ({
      value: f,
      label: `${FIELD_LABEL[f]} ${creators.filter((c) => c.field === f).length}`,
    })),
  ]
  const q = query.trim().toLowerCase()
  const shown = creators
    .filter((c) => field === 'all' || c.field === field)
    .filter((c) => !q || [c.name, c.memo, ...c.accounts.map((a) => a.handle)].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => b.followers - a.followers)

  const save = (c: Creator) => {
    const exists = creators.some((x) => x.id === c.id)
    setCreators((cs) => (exists ? cs.map((x) => (x.id === c.id ? c : x)) : [c, ...cs]))
    setEditing(null)
    toast.show(exists ? `${c.name} 님 정보를 수정했어요` : `${c.name} 님을 등록했어요`)
  }
  const remove = (c: Creator) => {
    if (!confirm(`${c.name} 님을 DB에서 삭제할까요?`)) return
    setCreators((cs) => cs.filter((x) => x.id !== c.id))
    // 발송 기록·신청 기록은 이름이 남도록 그대로 두고, 연결만 끊는다
    setDms((ds) => ds.map((d) => (d.creatorId === c.id ? { ...d, creatorId: '' } : d)))
    setApplications((as) => as.map((a) => (a.creatorId === c.id ? { ...a, creatorId: null } : a)))
    setEditing(null)
    toast.show(`${c.name} 님을 삭제했어요`)
  }

  return (
    <section className="space-y-3">
      <label className="relative block">
        <span className="sr-only">크리에이터 검색</span>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름·계정·메모 검색"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </label>
      <ScrollChips options={fieldOptions} value={field} onChange={setField} />

      {creators.length === 0 ? (
        <EmptyState icon={<Users size={40} />} title="등록된 크리에이터가 없어요" description="오른쪽 아래 + 버튼으로 함께 일할 크리에이터를 등록해 보세요" />
      ) : shown.length === 0 ? (
        <EmptyState icon={<Search size={40} />} title="조건에 맞는 크리에이터가 없어요" description="검색어나 분야를 바꿔 보세요" />
      ) : (
        <div className="space-y-2">
          {shown.map((c) => (
            <Card key={c.id} onClick={() => setEditing(c)} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <p className="truncate font-bold">{c.name}</p>
                <Badge color="brand">{FIELD_LABEL[c.field]}</Badge>
                <span className="ml-auto shrink-0 text-sm font-semibold text-slate-700">
                  팔로워 {formatFollowers(c.followers)}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                <AccountLine accounts={c.accounts} />
              </div>
              {c.memo && <p className="line-clamp-1 text-xs text-slate-400">{c.memo}</p>}
            </Card>
          ))}
        </div>
      )}

      <Fab onClick={() => setEditing('new')} label="크리에이터 등록">
        <Plus size={26} />
      </Fab>
      <BottomSheet open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? '크리에이터 등록' : '크리에이터 정보'}>
        {editing !== null && (
          <CreatorForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? null : editing}
            onSave={save}
            onDelete={editing === 'new' ? undefined : () => remove(editing)}
          />
        )}
      </BottomSheet>
      <Toast message={toast.message} />
    </section>
  )
}

function EventList() {
  const { events, setEventsNow, dms, applications } = useCollab()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(t)
  }, [])

  const sorted = [...events].sort((a, b) => Number(isClosed(a, now)) - Number(isClosed(b, now)) || a.startsAt.localeCompare(b.startsAt))

  return (
    <section>
      <SectionTitle>행사 {events.length}개</SectionTitle>
      {events.length === 0 ? (
        <EmptyState icon={<CalendarDays size={40} />} title="만든 행사가 없어요" description="오른쪽 아래 + 버튼으로 크리에이터를 초대할 행사를 만들어 보세요" />
      ) : (
        <div className="space-y-2">
          {sorted.map((ev) => {
            const apps = applications.filter((a) => a.eventId === ev.id)
            const ranked = rankApplications(apps, ev.capacity)
            const selected = ranked.filter((a) => a.selection === 'selected').length
            const waiting = ranked.length - selected
            const sent = dms.filter((d) => d.eventId === ev.id && d.status !== 'failed').length
            const closed = isClosed(ev, now)
            return (
              <Card key={ev.id} onClick={() => navigate(`/collab/events/${ev.id}`)} className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-snug">{ev.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDateTime(ev.startsAt)} · {ev.place}
                    </p>
                  </div>
                  <Badge color={closed ? 'slate' : 'green'}>{closed ? '마감' : '모집 중'}</Badge>
                  <ChevronRight size={18} className="mt-0.5 shrink-0 text-slate-300" />
                </div>
                <div>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="font-semibold">
                      신청 {apps.length}명 <span className="text-slate-400">/ 모집 {ev.capacity}명</span>
                    </span>
                    {waiting > 0 && <span className="text-xs font-semibold text-amber-600">대기 {waiting}명</span>}
                  </div>
                  <ProgressBar value={(selected / ev.capacity) * 100} />
                </div>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <Send size={12} /> DM 발송 {sent}명
                </p>
              </Card>
            )
          })}
        </div>
      )}
      <Fab onClick={() => setCreating(true)} label="행사 만들기">
        <Plus size={26} />
      </Fab>
      <BottomSheet open={creating} onClose={() => setCreating(false)} title="새 협업 행사">
        {creating && (
          <EventForm
            initial={null}
            onSave={(ev) => {
              setEventsNow([ev, ...events])
              setCreating(false)
              navigate(`/collab/events/${ev.id}`)
            }}
          />
        )}
      </BottomSheet>
    </section>
  )
}
