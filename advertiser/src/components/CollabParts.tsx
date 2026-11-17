import { Plus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { newId, normalizeHandle } from '../data/biz'
import {
  type CollabEvent,
  type Creator,
  type CreatorField,
  DEFAULT_TEMPLATE,
  FIELD_LABEL,
  FIELDS,
  SNS_LABEL,
  type SnsAccount,
  type SnsKind,
  toLocalInput,
} from '../data/collab'
import { Button, ChoiceChips, Input, Textarea } from './ui'

const FIELD_OPTIONS = FIELDS.map((f) => ({ value: f, label: FIELD_LABEL[f] }))
const SNS_KINDS = Object.keys(SNS_LABEL) as SnsKind[]

/** 크리에이터 계정들을 작은 글씨로: '인스타 @a · 유튜브 @b' */
export function AccountLine({ accounts }: { accounts: SnsAccount[] }) {
  if (accounts.length === 0) return <span className="text-slate-400">SNS 계정 없음</span>
  return (
    <span className="flex flex-wrap gap-x-2 gap-y-0.5">
      {accounts.map((a, i) => (
        <span key={i} className="whitespace-nowrap">
          <b className="font-semibold text-slate-500">{SNS_LABEL[a.kind]}</b> {a.handle}
        </span>
      ))}
    </span>
  )
}

/** 크리에이터 등록·수정 폼 (BottomSheet 안에서 사용) */
export function CreatorForm({
  initial,
  onSave,
  onDelete,
}: {
  initial: Creator | null
  onSave: (c: Creator) => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [field, setField] = useState<CreatorField>(initial?.field ?? 'food')
  const [followers, setFollowers] = useState(initial ? String(initial.followers) : '')
  const [accounts, setAccounts] = useState<SnsAccount[]>(initial?.accounts ?? [{ kind: 'instagram', handle: '' }])
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [memo, setMemo] = useState(initial?.memo ?? '')

  const setAccount = (i: number, patch: Partial<SnsAccount>) =>
    setAccounts((as) => as.map((a, j) => (j === i ? { ...a, ...patch } : a)))

  const save = () =>
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      field,
      followers: Math.max(0, Math.round(Number(followers.replace(/[^0-9]/g, '')) || 0)),
      accounts: accounts.map((a) => ({ ...a, handle: normalizeHandle(a.handle) })).filter((a) => a.handle),
      contact: contact.trim(),
      memo: memo.trim(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })

  return (
    <div className="space-y-4">
      <Input label="이름" placeholder="예: 김하린" value={name} onChange={(e) => setName(e.target.value)} />
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-600">분야</p>
        <ChoiceChips options={FIELD_OPTIONS} value={field} onChange={setField} cols={4} />
      </div>
      <Input
        label="팔로워 수"
        inputMode="numeric"
        placeholder="예: 48200"
        value={followers}
        onChange={(e) => setFollowers(e.target.value.replace(/[^0-9]/g, ''))}
      />
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-600">SNS 계정</p>
        <div className="space-y-2">
          {accounts.map((a, i) => (
            <div key={i} className="flex gap-2">
              <select
                aria-label="SNS 종류"
                value={a.kind}
                onChange={(e) => setAccount(i, { kind: e.target.value as SnsKind })}
                className="w-24 shrink-0 rounded-2xl border border-slate-300 bg-white px-2 text-base outline-none focus:border-slate-950"
              >
                {SNS_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {SNS_LABEL[k]}
                  </option>
                ))}
              </select>
              <input
                aria-label="계정 이름"
                placeholder="@계정"
                value={a.handle}
                onChange={(e) => setAccount(i, { handle: e.target.value })}
                className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
              <button
                type="button"
                aria-label="계정 빼기"
                onClick={() => setAccounts((as) => as.filter((_, j) => j !== i))}
                className="flex w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="mt-1 px-2" onClick={() => setAccounts((as) => [...as, { kind: 'youtube', handle: '' }])}>
          <Plus size={16} /> 계정 추가
        </Button>
      </div>
      <Input label="연락처" placeholder="이메일 또는 전화번호" value={contact} onChange={(e) => setContact(e.target.value)} />
      <Textarea label="메모" rows={3} placeholder="예: 마감 잘 지킴, 주말 촬영 가능" value={memo} onChange={(e) => setMemo(e.target.value)} />
      <div className="flex gap-2">
        {onDelete && (
          <Button variant="secondary" className="text-red-600" onClick={onDelete} aria-label="삭제">
            <Trash2 size={18} /> 삭제
          </Button>
        )}
        <Button full className="flex-1" disabled={!name.trim()} onClick={save}>
          <Save size={18} /> {initial ? '수정 저장' : '크리에이터 등록'}
        </Button>
      </div>
    </div>
  )
}

/** 오늘부터 며칠 뒤 몇 시 (datetime-local 값) */
function plusDays(days: number, hour: number) {
  const d = new Date(Date.now() + days * 86400000)
  d.setHours(hour, 0, 0, 0)
  return toLocalInput(d)
}

/** 협업 행사 만들기·수정 폼 */
export function EventForm({
  initial,
  onSave,
  onDelete,
}: {
  initial: CollabEvent | null
  onSave: (e: CollabEvent) => void
  onDelete?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [startsAt, setStartsAt] = useState(() => initial?.startsAt ?? plusDays(7, 14))
  const [place, setPlace] = useState(initial?.place ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : '5')
  const [deadline, setDeadline] = useState(() => initial?.deadline ?? plusDays(3, 18))

  const cap = Number(capacity)
  const deadlineAfterStart = deadline > startsAt
  const valid = name.trim() && place.trim() && startsAt && deadline && cap >= 1 && !deadlineAfterStart

  const save = () =>
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      startsAt,
      place: place.trim(),
      description: description.trim(),
      capacity: Math.round(cap),
      deadline,
      closedManually: initial?.closedManually ?? false,
      template: initial?.template ?? DEFAULT_TEMPLATE,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    })

  return (
    <div className="space-y-4">
      <Input label="행사 이름" placeholder="예: 겨울 신메뉴 시식회" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="행사 일시" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      <Input label="장소" placeholder="예: 베이글하우스 동성로점 2층" value={place} onChange={(e) => setPlace(e.target.value)} />
      <Textarea
        label="내용"
        rows={3}
        placeholder="예: 신메뉴 3종 시식 후 인스타그램 게시물 1건 업로드"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        label="모집 인원 (명)"
        inputMode="numeric"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value.replace(/[^0-9]/g, ''))}
      />
      <Input label="신청 마감" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      {deadlineAfterStart && <p className="text-sm font-medium text-red-600">신청 마감은 행사 일시보다 앞서야 해요.</p>}
      <div className="flex gap-2">
        {onDelete && (
          <Button variant="secondary" className="text-red-600" onClick={onDelete}>
            <Trash2 size={18} /> 삭제
          </Button>
        )}
        <Button full className="flex-1" disabled={!valid} onClick={save}>
          <Save size={18} /> {initial ? '수정 저장' : '행사 만들기'}
        </Button>
      </div>
    </div>
  )
}
