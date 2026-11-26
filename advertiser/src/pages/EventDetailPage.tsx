import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Copy,
  Lock,
  MapPin,
  Pencil,
  RotateCcw,
  Send,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EventForm } from '../components/CollabParts'
import { Badge, type BadgeColor, BottomSheet, Button, Card, ChoiceChips, EmptyState, Input, ProgressBar, ScrollChips, SectionTitle, Textarea, Toast } from '../components/ui'
import { newId, normalizeHandle } from '../data/biz'
import {
  type Application,
  type CollabEvent,
  type CreatorField,
  DEFAULT_TEMPLATE,
  type DmRecord,
  DM_STATUS_LABEL,
  type DmStatus,
  dmTarget,
  accountLabel,
  FIELD_LABEL,
  FIELDS,
  fillTemplate,
  formatClock,
  formatDateTime,
  formatFollowers,
  isClosed,
  PLACEHOLDERS,
  rankApplications,
  remainingLabel,
} from '../data/collab'
import { EXTRA_APPLICANTS } from '../data/collabSample'
import { copyText } from '../lib/clipboard'
import { useCollab } from '../hooks/useCollab'
import { saveNow } from '../hooks/useLocalStorage'
import { useToast } from '../hooks/useToast'

type View = 'dm' | 'apply'
type Collab = ReturnType<typeof useCollab>
type ShowToast = (text: string) => void

/** 매초 바뀌는 현재 시각 (마감 카운트다운용) */
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(t)
  }, [ms])
  return now
}

/** 기능: 행사 상세 — DM 발송, 선착순 신청자 */
export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const collab = useCollab()
  const toast = useToast()
  const now = useNow()
  const [editing, setEditing] = useState(false)
  const view: View = params.get('view') === 'apply' ? 'apply' : 'dm'
  const event = collab.events.find((e) => e.id === id)
  const back = () => navigate('/collab?tab=events')

  if (!event) {
    return (
      <div className="space-y-4">
        <EmptyState icon={<CalendarDays size={40} />} title="행사를 찾을 수 없어요" description="삭제되었거나 주소가 잘못되었어요" />
        <Button variant="secondary" full onClick={back}>
          행사 목록으로
        </Button>
      </div>
    )
  }

  const apps = collab.applications.filter((a) => a.eventId === event.id)
  const sentCount = collab.dms.filter((d) => d.eventId === event.id && d.status !== 'failed').length
  const closed = isClosed(event, now)

  const updateEvent = (patch: Partial<CollabEvent>) =>
    collab.setEvents((es) => es.map((e) => (e.id === event.id ? { ...e, ...patch } : e)))

  const removeEvent = () => {
    if (!confirm(`'${event.name}' 행사와 발송 기록·신청자를 모두 삭제할까요?`)) return
    const dms = collab.dms.filter((d) => d.eventId !== event.id)
    const applications = collab.applications.filter((a) => a.eventId !== event.id)
    saveNow('adcheckbiz.dms', dms)
    saveNow('adcheckbiz.applications', applications)
    collab.setDms(dms)
    collab.setApplications(applications)
    collab.setEventsNow(collab.events.filter((e) => e.id !== event.id))
    back()
  }

  return (
    <div className="space-y-5">
      <button onClick={back} className="-ml-1 flex min-h-10 items-center gap-1 text-sm font-semibold text-slate-500">
        <ChevronLeft size={18} /> 행사 목록
      </button>

      <Card className="space-y-2">
        <div className="flex items-start gap-2">
          <h2 className="flex-1 text-lg font-bold leading-snug">{event.name}</h2>
          <Badge color={closed ? 'slate' : 'green'}>{closed ? '마감' : '모집 중'}</Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-slate-600">
          <CalendarDays size={15} className="shrink-0 text-slate-400" /> {formatDateTime(event.startsAt)}
        </p>
        <p className="flex items-start gap-1.5 text-sm text-slate-600">
          <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" /> {event.place}
        </p>
        {event.description && <p className="text-sm text-slate-500">{event.description}</p>}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <span>
            모집 {event.capacity}명 · 신청 마감 {formatDateTime(event.deadline)}
          </span>
          <button onClick={() => setEditing(true)} className="flex min-h-9 items-center gap-1 rounded-lg px-2 font-semibold text-slate-950 underline-offset-2 hover:bg-slate-100">
            <Pencil size={14} /> 수정
          </button>
        </div>
      </Card>

      <ChoiceChips
        cols={2}
        value={view}
        onChange={(v) => setParams(v === 'apply' ? { view: 'apply' } : {}, { replace: true })}
        options={[
          { value: 'dm', label: `DM 발송 ${sentCount}` },
          { value: 'apply', label: `선착순 신청 ${apps.length}/${event.capacity}` },
        ]}
      />

      {view === 'dm' ? (
        <DmPanel event={event} collab={collab} onTemplate={(template) => updateEvent({ template })} toast={toast.show} />
      ) : (
        <ApplyPanel event={event} apps={apps} now={now} closed={closed} collab={collab} onUpdate={updateEvent} toast={toast.show} />
      )}

      <BottomSheet open={editing} onClose={() => setEditing(false)} title="행사 정보 수정">
        {editing && (
          <EventForm
            initial={event}
            onSave={(e) => {
              updateEvent(e)
              setEditing(false)
              toast.show('행사 정보를 수정했어요')
            }}
            onDelete={removeEvent}
          />
        )}
      </BottomSheet>
      <Toast message={toast.message} />
    </div>
  )
}

/* ───────────── DM 발송 ───────────── */

type FieldFilter = 'all' | CreatorField
const DM_COLOR: Record<DmStatus, BadgeColor> = { sent: 'brand', read: 'green', failed: 'red' }

function DmPanel({
  event,
  collab,
  onTemplate,
  toast,
}: {
  event: CollabEvent
  collab: Collab
  onTemplate: (t: string) => void
  toast: ShowToast
}) {
  const { creators, dms, setDms } = collab
  const [field, setField] = useState<FieldFilter>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [previewIdx, setPreviewIdx] = useState(0)
  const [sending, setSending] = useState<{ done: number; total: number } | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const history = dms.filter((d) => d.eventId === event.id).sort((a, b) => b.sentAt.localeCompare(a.sentAt))
  const sentIds = new Set(history.filter((d) => d.status !== 'failed').map((d) => d.creatorId))
  const filtered = creators.filter((c) => field === 'all' || c.field === field)
  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.id))
  const fieldOptions: { value: FieldFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    ...FIELDS.filter((f) => creators.some((c) => c.field === f)).map((f) => ({ value: f, label: FIELD_LABEL[f] })),
  ]

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleAll = () =>
    setSelected((s) =>
      allFilteredSelected ? s.filter((id) => !filtered.some((c) => c.id === id)) : [...new Set([...s, ...filtered.map((c) => c.id)])],
    )

  // 미리보기: 고른 사람 중 하나 (없으면 목록 첫 사람)
  const recipients = creators.filter((c) => selected.includes(c.id))
  const previewPool = recipients.length ? recipients : filtered.slice(0, 1)
  const idx = Math.min(previewIdx, Math.max(0, previewPool.length - 1))
  const previewCreator = previewPool[idx] ?? null
  const previewText = fillTemplate(event.template, event, previewCreator)
  const previewTarget = previewCreator ? dmTarget(previewCreator) : null

  const insert = (p: string) => {
    const el = textRef.current
    const t = event.template
    const at = el ? el.selectionStart : t.length
    const end = el ? el.selectionEnd : t.length
    onTemplate(t.slice(0, at) + p + t.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(at + p.length, at + p.length)
    })
  }

  const copy = async (text: string) => toast((await copyText(text)) ? '문구를 복사했어요' : '복사하지 못했어요. 길게 눌러 직접 복사해 주세요')

  const send = async () => {
    if (!recipients.length || sending) return
    const records: DmRecord[] = []
    setSending({ done: 0, total: recipients.length })
    for (const [i, c] of recipients.entries()) {
      await new Promise((r) => setTimeout(r, 180))
      const target = dmTarget(c)
      records.push({
        id: newId(),
        eventId: event.id,
        creatorId: c.id,
        creatorName: c.name,
        to: target ? accountLabel(target) : '',
        message: fillTemplate(event.template, event, c),
        sentAt: new Date().toISOString(),
        status: target ? 'sent' : 'failed',
      })
      setSending({ done: i + 1, total: recipients.length })
    }
    setDms((ds) => [...records, ...ds])
    setSending(null)
    setSelected([])
    setPreviewIdx(0)
    const failed = records.filter((r) => r.status === 'failed').length
    toast(failed ? `${records.length - failed}명 발송 완료, ${failed}명은 SNS 계정이 없어 실패했어요` : `${records.length}명에게 DM을 발송했어요`)
  }

  return (
    <div className="space-y-6">
      {/* 1. 받는 사람 */}
      <section>
        <SectionTitle
          action={
            <button onClick={toggleAll} disabled={!filtered.length} className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-slate-950 underline-offset-2 hover:bg-slate-100 disabled:opacity-40">
              <Check size={16} /> {allFilteredSelected ? '선택 해제' : '전체 선택'}
            </button>
          }
        >
          1. 받는 사람 <span className="text-slate-950">{selected.length}명</span>
        </SectionTitle>
        <ScrollChips options={fieldOptions} value={field} onChange={setField} />
        {creators.length === 0 ? (
          <EmptyState icon={<Users size={36} />} title="크리에이터 DB가 비어 있어요" description="협업 탭 → 크리에이터 DB에서 먼저 등록해 주세요" />
        ) : (
          <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
            {filtered.map((c) => {
              const on = selected.includes(c.id)
              const target = dmTarget(c)
              return (
                <button key={c.id} onClick={() => toggle(c.id)} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left active:bg-slate-50">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md ring-1 ${on ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white ring-slate-300'}`}
                  >
                    {on && <Check size={16} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <b className="truncate">{c.name}</b>
                      <span className="text-xs text-slate-400">
                        {FIELD_LABEL[c.field]} · {formatFollowers(c.followers)}
                      </span>
                    </span>
                    <span className={`block truncate text-xs ${target ? 'text-slate-500' : 'text-red-500'}`}>
                      {target ? accountLabel(target) : 'DM 보낼 SNS 계정 없음'}
                    </span>
                  </span>
                  {sentIds.has(c.id) && <Badge color="slate">보냄</Badge>}
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* 2. 문구 */}
      <section>
        <SectionTitle
          action={
            event.template !== DEFAULT_TEMPLATE && (
              <button onClick={() => onTemplate(DEFAULT_TEMPLATE)} className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                <RotateCcw size={14} /> 기본 문구
              </button>
            )
          }
        >
          2. DM 문구
        </SectionTitle>
        <Textarea ref={textRef} rows={9} value={event.template} onChange={(e) => onTemplate(e.target.value)} className="text-sm leading-relaxed" />
        <p className="mb-2 mt-3 text-xs font-medium text-slate-500">눌러서 넣기 — 받는 사람·행사 정보로 바뀌어요</p>
        <div className="flex flex-wrap gap-1.5">
          {PLACEHOLDERS.map((p) => (
            <button key={p} onClick={() => insert(p)} className="min-h-9 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-900 active:scale-95">
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 미리보기 */}
      <section>
        <SectionTitle>3. 미리보기</SectionTitle>
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 text-sm">
              <p className="truncate font-semibold">받는 사람: {previewCreator?.name ?? '(없음)'}</p>
              <p className="truncate text-xs text-slate-400">{previewTarget ? accountLabel(previewTarget) : 'SNS 계정 없음'}</p>
            </div>
            {previewPool.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <button aria-label="이전 사람" onClick={() => setPreviewIdx((idx - 1 + previewPool.length) % previewPool.length)} className="flex size-10 items-center justify-center rounded-full bg-slate-100 active:opacity-50">
                  <ChevronLeft size={16} />
                </button>
                {idx + 1}/{previewPool.length}
                <button aria-label="다음 사람" onClick={() => setPreviewIdx((idx + 1) % previewPool.length)} className="flex size-10 items-center justify-center rounded-full bg-slate-100 active:opacity-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
          <p className="whitespace-pre-wrap bg-slate-100 p-4 text-sm leading-relaxed text-slate-800">{previewText}</p>
          <Button variant="secondary" full onClick={() => copy(previewText)}>
            <Copy size={16} /> 문구 복사
          </Button>
        </Card>
      </section>

      {/* 발송 */}
      <section className="space-y-2">
        <Button full disabled={!recipients.length || !!sending} onClick={send}>
          <Send size={18} />
          {sending ? `발송 중… ${sending.done}/${sending.total}` : recipients.length ? `선택한 ${recipients.length}명에게 발송` : '받는 사람을 골라 주세요'}
        </Button>
        {sending && <ProgressBar value={(sending.done / sending.total) * 100} />}
        <p className="text-center text-xs text-slate-400">시연용: 실제 SNS로 보내지 않고 발송 기록만 남아요. 실제로 보낼 때는 문구 복사를 이용하세요.</p>
      </section>

      {/* 발송 기록 */}
      <section>
        <SectionTitle>발송 기록 {history.length}건</SectionTitle>
        {history.length === 0 ? (
          <EmptyState icon={<Send size={36} />} title="아직 보낸 DM이 없어요" description="받는 사람을 고르고 발송을 눌러 보세요" />
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
            {history.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5">
                    <b className="truncate text-sm">{d.creatorName}</b>
                    <Badge color={DM_COLOR[d.status]}>{DM_STATUS_LABEL[d.status]}</Badge>
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {d.to || '계정 없음'} · {formatDateTime(d.sentAt)}
                  </p>
                </div>
                <button aria-label={`${d.creatorName} 님에게 보낸 문구 복사`} onClick={() => copy(d.message)} className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                  <Copy size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/* ───────────── 선착순 신청 ───────────── */

function ApplyPanel({
  event,
  apps,
  now,
  closed,
  collab,
  onUpdate,
  toast,
}: {
  event: CollabEvent
  apps: Application[]
  now: number
  closed: boolean
  collab: Collab
  onUpdate: (patch: Partial<CollabEvent>) => void
  toast: ShowToast
}) {
  const { creators, setApplications } = collab
  const [manual, setManual] = useState(false)
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')

  const ranked = rankApplications(apps, event.capacity)
  const selectedList = ranked.filter((a) => a.selection === 'selected')
  const waitCount = ranked.length - selectedList.length
  const left = Math.max(0, event.capacity - apps.length)
  const deadlinePassed = now >= new Date(event.deadline).getTime()

  /** 새 신청을 받는다. 마감이면 막는다 */
  const accept = (newApps: Application[]) => {
    if (closed) {
      toast('신청이 마감되어 더 받을 수 없어요')
      return
    }
    const before = apps.length
    setApplications((as) => [...as, ...newApps])
    const after = before + newApps.length
    if (before < event.capacity && after >= event.capacity) toast(`모집 인원 ${event.capacity}명이 다 찼어요! 이후 신청은 대기로 받아요`)
    else if (after > event.capacity) toast(`${newApps.length}명 신청 → 대기 ${after - event.capacity}명`)
    else toast(`${newApps.map((a) => a.name).join(', ')} 님 신청 (선발 ${after}/${event.capacity})`)
  }

  /** 아직 신청하지 않은 크리에이터(DB 먼저, 다 하면 예비 명단)를 골라 신청시킨다 */
  const simulate = (count: number) => {
    const usedCreators = new Set(apps.map((a) => a.creatorId))
    const usedHandles = new Set(apps.map((a) => a.handle))
    type Candidate = { creatorId: string | null; name: string; handle: string }
    const shuffle = <T,>(xs: T[]) => xs.map((x) => ({ x, r: Math.random() })).sort((a, b) => a.r - b.r).map((o) => o.x)
    const pool: Candidate[] = [
      ...shuffle(
        creators
          .filter((c) => !usedCreators.has(c.id))
          .map((c) => ({ creatorId: c.id, name: c.name, handle: dmTarget(c)?.handle ?? c.accounts[0]?.handle ?? '' })),
      ),
      ...shuffle(EXTRA_APPLICANTS.filter((x) => !usedHandles.has(x.handle)).map((x) => ({ creatorId: null, ...x }))),
    ]
    const base = Date.now()
    const picked: Application[] = []
    let offset = 0
    for (let i = 0; i < count; i++) {
      const p = pool.shift() ?? { creatorId: null, name: `신청자 ${apps.length + i + 1}`, handle: '' }
      offset += i === 0 ? 0 : 40 + Math.floor(Math.random() * 900)
      picked.push({ id: newId(), eventId: event.id, ...p, appliedAt: new Date(base + offset).toISOString() })
    }
    accept(picked)
  }

  const addManual = () => {
    accept([{ id: newId(), eventId: event.id, creatorId: null, name: name.trim(), handle: normalizeHandle(handle), appliedAt: new Date().toISOString() }])
    setName('')
    setHandle('')
    setManual(false)
  }

  const cancel = (a: Application) => {
    if (!confirm(`${a.name} 님의 신청을 취소할까요? 대기 1번이 있으면 자동으로 선발돼요.`)) return
    setApplications((as) => as.filter((x) => x.id !== a.id))
    toast(`${a.name} 님 신청을 취소했어요`)
  }

  const copyWinners = async () => {
    const text = [
      `[${event.name}] 선발 명단 (선착순 ${event.capacity}명)`,
      ...selectedList.map((a) => `${a.rank}. ${a.name} ${a.handle}`.trim()),
    ].join('\n')
    toast((await copyText(text)) ? '선발 명단을 복사했어요' : '복사하지 못했어요')
  }

  return (
    <div className="space-y-6">
      {/* 카운터 */}
      <Card className="space-y-3">
        <div className="flex items-end justify-between">
          <p className="text-sm font-semibold text-slate-500">선착순 신청</p>
          <Badge color={closed ? 'slate' : 'green'}>{closed ? '마감' : remainingLabel(event.deadline, now)}</Badge>
        </div>
        <p className="text-center">
          <span className="text-4xl font-black tabular-nums text-slate-950">신청 {apps.length}명</span>
          <span className="ml-1.5 text-xl font-bold text-slate-400">/ 모집 {event.capacity}명</span>
        </p>
        <ProgressBar value={(apps.length / event.capacity) * 100} className="h-3" />
        <div className="grid grid-cols-3 text-center text-sm">
          <p>
            <b className="block text-lg text-green-700">{selectedList.length}</b>
            <span className="text-xs text-slate-400">선발</span>
          </p>
          <p>
            <b className="block text-lg text-amber-600">{waitCount}</b>
            <span className="text-xs text-slate-400">대기</span>
          </p>
          <p>
            <b className="block text-lg text-slate-700">{left}</b>
            <span className="text-xs text-slate-400">남은 자리</span>
          </p>
        </div>
      </Card>

      {/* 신청 받기 */}
      <section className="space-y-2">
        {closed ? (
          <div className="flex items-start gap-2 rounded-xl bg-slate-100 p-3.5 text-sm text-slate-600">
            <Lock size={16} className="mt-0.5 shrink-0" />
            <span>
              신청이 마감되어 더 받지 않아요.
              {deadlinePassed ? ' 마감 시각이 지났어요. 위의 수정에서 신청 마감을 늦추면 다시 받을 수 있어요.' : ''}
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => simulate(1)}>
                <UserPlus size={18} /> 신청 1명
              </Button>
              <Button variant="secondary" onClick={() => simulate(5)}>
                <Zap size={18} /> 5명 몰리기
              </Button>
            </div>
            <p className="text-center text-xs text-slate-400">시연용: DB의 크리에이터가 신청한 것처럼 추가해요</p>
            <Button variant="ghost" full onClick={() => setManual(true)}>
              <Pencil size={16} /> 신청 직접 접수 (DM 답장 받은 사람)
            </Button>
          </>
        )}
        {event.closedManually ? (
          <Button variant="secondary" full onClick={() => onUpdate({ closedManually: false })} disabled={deadlinePassed}>
            <RotateCcw size={16} /> 신청 다시 받기
          </Button>
        ) : (
          !closed && (
            <Button variant="secondary" full className="text-red-600" onClick={() => confirm('지금 신청을 마감할까요?') && onUpdate({ closedManually: true })}>
              <Lock size={16} /> 지금 마감하기
            </Button>
          )
        )}
      </section>

      {/* 신청자 목록 */}
      <section>
        <SectionTitle
          action={
            selectedList.length > 0 && (
              <button onClick={copyWinners} className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-slate-950 underline-offset-2 hover:bg-slate-100">
                <ClipboardCopy size={15} /> 선발 명단 복사
              </button>
            )
          }
        >
          신청 순서
        </SectionTitle>
        {ranked.length === 0 ? (
          <EmptyState icon={<Users size={36} />} title="아직 신청자가 없어요" description="DM을 보내고 신청을 받아 보세요" />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
            {ranked.map((a) => (
              <div key={a.id}>
                {a.rank === event.capacity + 1 && (
                  <p className="border-y border-dashed border-amber-300 bg-amber-50 py-1.5 text-center text-xs font-semibold text-amber-700">
                    모집 인원 {event.capacity}명 — 여기부터 대기
                  </p>
                )}
                <div className={`flex items-center gap-3 px-4 py-2.5 ${a.rank > 1 && a.rank !== event.capacity + 1 ? 'border-t border-slate-100' : ''}`}>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      a.selection === 'selected' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {a.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5">
                      <b className="truncate text-sm">{a.name}</b>
                      <Badge color={a.selection === 'selected' ? 'green' : 'amber'}>{a.selection === 'selected' ? '선발' : `대기 ${a.waitNo}`}</Badge>
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {a.handle && `${a.handle} · `}
                      <span className="tabular-nums">{formatClock(a.appliedAt)}</span>
                    </p>
                  </div>
                  <button aria-label={`${a.name} 님 신청 취소`} onClick={() => cancel(a)} className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-950">
                    <X size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-slate-400">신청 시각(밀리초까지) 순으로 자동 정렬돼요. 선발된 사람이 취소하면 대기 1번이 자동으로 선발돼요.</p>
      </section>

      <BottomSheet open={manual} onClose={() => setManual(false)} title="신청 직접 접수">
        <div className="space-y-4">
          <Input label="이름" placeholder="예: 김하린" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="SNS 계정 (선택)" placeholder="@계정" value={handle} onChange={(e) => setHandle(e.target.value)} />
          <p className="text-xs text-slate-400">지금 시각으로 접수돼요.</p>
          <Button full disabled={!name.trim()} onClick={addManual}>
            <UserPlus size={18} /> 접수하기
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
