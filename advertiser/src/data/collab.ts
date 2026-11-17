/* 협업 기능 타입과 계산: 크리에이터 DB, 행사, DM 발송 기록, 선착순 신청 */

export type SnsKind = 'instagram' | 'youtube' | 'blog' | 'tiktok'
export const SNS_LABEL: Record<SnsKind, string> = {
  instagram: '인스타',
  youtube: '유튜브',
  blog: '블로그',
  tiktok: '틱톡',
}

export type SnsAccount = { kind: SnsKind; handle: string }

export type CreatorField = 'food' | 'beauty' | 'fashion' | 'travel' | 'fitness' | 'parenting' | 'living' | 'tech'
export const FIELD_LABEL: Record<CreatorField, string> = {
  food: '맛집·카페',
  beauty: '뷰티',
  fashion: '패션',
  travel: '여행',
  fitness: '운동·건강',
  parenting: '육아',
  living: '리빙',
  tech: 'IT·테크',
}
export const FIELDS = Object.keys(FIELD_LABEL) as CreatorField[]

export type Creator = {
  id: string
  name: string
  accounts: SnsAccount[]
  field: CreatorField
  followers: number
  contact: string
  memo: string
  createdAt: string
}

export type CollabEvent = {
  id: string
  name: string
  /** 행사 일시 (datetime-local 형식 'YYYY-MM-DDTHH:mm', 기기 시간 기준) */
  startsAt: string
  place: string
  description: string
  capacity: number
  /** 신청 마감 (datetime-local 형식) */
  deadline: string
  /** 마감 전이라도 직접 마감했는지 */
  closedManually: boolean
  /** 이 행사의 DM 문구 템플릿 */
  template: string
  createdAt: string
}

/** 발송 완료 · 읽음 · 발송 실패(보낼 SNS 계정 없음) */
export type DmStatus = 'sent' | 'read' | 'failed'
export const DM_STATUS_LABEL: Record<DmStatus, string> = { sent: '발송 완료', read: '읽음', failed: '발송 실패' }

export type DmRecord = {
  id: string
  eventId: string
  creatorId: string
  creatorName: string
  /** 보낸 계정 (예: 인스타 @handle). 계정이 없으면 빈 문자열 */
  to: string
  message: string
  sentAt: string
  status: DmStatus
}

export type Application = {
  id: string
  eventId: string
  /** DB에 있는 크리에이터면 id, 직접 접수면 null */
  creatorId: string | null
  name: string
  handle: string
  /** 신청 시각 (ISO, 밀리초까지 — 선착순 기준) */
  appliedAt: string
}

export type Selection = 'selected' | 'waiting'
export type RankedApplication = Application & { rank: number; selection: Selection; waitNo: number }

/** 신청 시각 순으로 정렬해 모집 인원까지 '선발', 그 뒤는 '대기' */
export function rankApplications(apps: Application[], capacity: number): RankedApplication[] {
  return [...apps]
    .sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))
    .map((a, i) => ({
      ...a,
      rank: i + 1,
      selection: i < capacity ? 'selected' : 'waiting',
      waitNo: i < capacity ? 0 : i - capacity + 1,
    }))
}

export function isClosed(event: CollabEvent, now: number) {
  return event.closedManually || now >= new Date(event.deadline).getTime()
}

/** DM을 보낼 대표 계정: 인스타 → 틱톡 → 유튜브 → 블로그 순 */
export function dmTarget(c: Creator): SnsAccount | null {
  const order: SnsKind[] = ['instagram', 'tiktok', 'youtube', 'blog']
  for (const k of order) {
    const a = c.accounts.find((x) => x.kind === k && x.handle.trim())
    if (a) return a
  }
  return null
}

export const accountLabel = (a: SnsAccount) => `${SNS_LABEL[a.kind]} ${a.handle}`

/** 템플릿에 넣을 수 있는 칸 */
export const PLACEHOLDERS = ['{이름}', '{계정}', '{분야}', '{행사명}', '{일시}', '{장소}', '{내용}', '{모집인원}', '{마감}'] as const

export const DEFAULT_TEMPLATE = [
  '안녕하세요, {이름} 님!',
  '평소 {분야} 콘텐츠 잘 보고 있어요. 협업 행사에 초대드리고 싶어 연락드립니다.',
  '',
  '📌 {행사명}',
  '🗓 일시: {일시}',
  '📍 장소: {장소}',
  '📝 {내용}',
  '',
  '모집 인원은 {모집인원}명이며, 신청 순서대로 선착순 선발합니다.',
  '신청 마감: {마감}',
  "참여를 원하시면 이 메시지에 '신청'이라고 답장 주세요!",
].join('\n')

export function fillTemplate(template: string, event: CollabEvent, creator: Creator | null) {
  const target = creator ? dmTarget(creator) : null
  const values: Record<(typeof PLACEHOLDERS)[number], string> = {
    '{이름}': creator?.name ?? '크리에이터',
    '{계정}': target?.handle ?? '',
    '{분야}': creator ? FIELD_LABEL[creator.field] : '',
    '{행사명}': event.name,
    '{일시}': formatDateTime(event.startsAt),
    '{장소}': event.place,
    '{내용}': event.description,
    '{모집인원}': String(event.capacity),
    '{마감}': formatDateTime(event.deadline),
  }
  return PLACEHOLDERS.reduce((s, p) => s.split(p).join(values[p]), template)
}

/** 12000 → '1.2만', 850 → '850' */
export function formatFollowers(n: number) {
  if (n >= 10000) return `${Number((n / 10000).toFixed(1))}만`
  if (n >= 1000) return `${Number((n / 1000).toFixed(1))}천`
  return String(n)
}

/** '2026-11-20T14:00' → '11월 20일(금) 오후 2:00' */
export function formatDateTime(s: string) {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  const h = d.getHours()
  const ampm = h < 12 ? '오전' : '오후'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${'일월화수목금토'[d.getDay()]}) ${ampm} ${hh}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** 신청 시각 표시: 오늘이면 '14:03:27.512', 다른 날이면 '11/14 14:03:27.512' */
export function formatClock(iso: string) {
  const d = new Date(iso)
  const p = (n: number, l = 2) => String(n).padStart(l, '0')
  const day = d.toDateString() === new Date().toDateString() ? '' : `${d.getMonth() + 1}/${d.getDate()} `
  return `${day}${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`
}

/** Date → datetime-local 입력값 'YYYY-MM-DDTHH:mm' (기기 시간 기준) */
export function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 남은 시간 안내: '1일 3시간 남음', '25분 남음' */
export function remainingLabel(deadline: string, now: number) {
  const ms = new Date(deadline).getTime() - now
  if (ms <= 0) return '마감 시각 지남'
  const min = Math.floor(ms / 60000)
  const d = Math.floor(min / 1440)
  const h = Math.floor((min % 1440) / 60)
  const m = min % 60
  if (d > 0) return `${d}일 ${h}시간 남음`
  if (h > 0) return `${h}시간 ${m}분 남음`
  if (m > 0) return `${m}분 남음`
  return `${Math.ceil(ms / 1000)}초 남음`
}
