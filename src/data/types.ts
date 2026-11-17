/* 애드체크 데이터 타입. 화면보다 먼저 정의한다. */

export type Platform = 'instagram' | 'blog' | 'youtube'
export type Reward = 'cash' | 'product' | 'discount' | 'none'
export type Severity = 'danger' | 'warning' | 'tip'
export type Verdict = '적합' | '보완 필요' | '위반 위험'

export type IssueCode = 'NO_DISCLOSURE' | 'FALSE_CLAIM' | 'LATE_POSITION' | 'VAGUE_WORD' | 'BURIED_HASHTAG' | 'NOT_SPECIFIC'

export type Issue = {
  code: IssueCode
  severity: Severity
  title: string
  detail: string
  /** 글에서 문제가 된 표현 (있으면 강조 표시) */
  found?: string
}

export type CheckInput = {
  platform: Platform
  reward: Reward
  brand: string
  text: string
}

export type CheckResult = {
  score: number
  verdict: Verdict
  issues: Issue[]
  /** 규칙에 맞게 고친 글 (문제가 없으면 원문 그대로) */
  fixedText: string
  /** 점수와 무관한 추가 안내 (예: 유튜브 영상 속 표시) */
  reminders: string[]
}

export type CheckRecord = CheckInput & {
  id: string
  createdAt: string // ISO 시각
  score: number
  verdict: Verdict
  issueCodes: IssueCode[]
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: '인스타그램',
  blog: '블로그',
  youtube: '유튜브',
}

export const REWARD_LABEL: Record<Reward, string> = {
  cash: '현금·원고료',
  product: '무료 제품·서비스',
  discount: '할인·쿠폰',
  none: '대가 없음 (내돈내산)',
}

export const VERDICT_COLOR: Record<Verdict, 'green' | 'amber' | 'red'> = { 적합: 'green', '보완 필요': 'amber', '위반 위험': 'red' }

/** 통계 차트 등에 쓰는 짧은 이름 */
export const ISSUE_SHORT: Record<IssueCode, string> = {
  NO_DISCLOSURE: '표시 없음',
  FALSE_CLAIM: '반대 표현',
  LATE_POSITION: '표시 위치',
  VAGUE_WORD: '애매한 표현',
  BURIED_HASHTAG: '해시태그에 묻힘',
  NOT_SPECIFIC: '대가 미기재',
}
