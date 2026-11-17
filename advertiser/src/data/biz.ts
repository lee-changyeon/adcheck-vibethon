import { runCheck } from './rules'
import type { CheckResult, Platform, Reward } from './types'

/* 광고주용 데이터 타입과 계산 함수. 점검 규칙은 rules.ts(원본 복사본)를 그대로 쓴다. */

export type PaidReward = Exclude<Reward, 'none'>

export type Campaign = {
  id: string
  name: string
  brand: string
  reward: PaidReward
  createdAt: string
}

/** 미조치 · 수정 요청함 · 확인 완료 */
export type ActionStatus = 'open' | 'requested' | 'resolved'

export type Post = {
  id: string
  campaignId: string
  influencer: string
  platform: Platform
  text: string
  status: ActionStatus
  updatedAt: string
}

export const STATUS_LABEL: Record<ActionStatus, string> = {
  open: '미조치',
  requested: '수정 요청함',
  resolved: '확인 완료',
}

export const PAID_REWARD_LABEL: Record<PaidReward, string> = {
  cash: '현금·원고료',
  product: '무료 제품·서비스',
  discount: '할인·쿠폰',
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** 계정 이름을 @로 시작하게 맞춘다 */
export function normalizeHandle(s: string) {
  const t = s.trim().replace(/^@+/, '')
  return t ? `@${t}` : ''
}

export function evaluate(post: Post, campaign: Campaign): CheckResult {
  return runCheck({ platform: post.platform, reward: campaign.reward, brand: campaign.brand, text: post.text })
}

/** 조치가 필요한가: 적합이 아니고 아직 확인 완료가 아님 */
export function needsAction(result: CheckResult, status: ActionStatus) {
  return result.verdict !== '적합' && status !== 'resolved'
}

/** 인플루언서에게 보낼 수정 요청 메시지 */
export function buildRequestMessage(post: Post, campaign: Campaign, result: CheckResult) {
  const problems = result.issues
    .filter((i) => i.severity !== 'tip')
    .map((i) => `• ${i.title}${i.found ? ` (문제 표현: ${i.found})` : ''}`)
    .join('\n')
  return [
    `${post.influencer} 님, 안녕하세요. ${campaign.brand} '${campaign.name}' 담당자입니다.`,
    '올려 주신 게시물의 광고 표시를 검수한 결과, 아래 부분의 수정을 부탁드립니다.',
    '',
    problems,
    '',
    '[수정 예시]',
    result.fixedText,
    '',
    '공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」에 따라 협찬 사실은 글 첫 부분에 누구나 알 수 있는 한글로 표시해야 합니다.',
    '수정 후 알려 주시면 다시 확인하겠습니다. 감사합니다!',
  ].join('\n')
}
