import type { ActionStatus, Campaign, Post } from './biz'
import type { Platform } from './types'

/** 시연용 샘플 캠페인 2개와 게시물 12개 (오늘 기준 며칠 전) */

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: 'c-bagel', name: '신메뉴 체험단 11월', brand: '베이글하우스', reward: 'product', createdAt: daysAgo(10) },
  { id: 'c-glow', name: '진정앰플 유료 광고', brand: '글로우랩', reward: 'cash', createdAt: daysAgo(20) },
]

type Seed = [campaignId: string, influencer: string, platform: Platform, status: ActionStatus, days: number, text: string]

const SEEDS: Seed[] = [
  [
    'c-bagel',
    '@daegu_foodie',
    'instagram',
    'open',
    1,
    `대명동 베이글 성지 발견 🥯
쪽파 크림치즈 진짜 미쳤다... 오픈런 각
#대구맛집 #대명동 #베이글`,
  ],
  [
    'c-bagel',
    '@bread_lover_jin',
    'instagram',
    'requested',
    2,
    `빵순이 필수 코스 베이글하우스 🥯
신메뉴 블루베리 크림치즈 베이글 촉촉하고 맛있어요
매장도 넓어서 공부하기 좋아요

#대구빵집 #대구카페 #베이글맛집 #빵스타그램 #대명동카페 #협찬`,
  ],
  [
    'c-bagel',
    '@dalseo_mom',
    'instagram',
    'open',
    2,
    `#내돈내산 아이랑 다녀온 베이글 카페 👶
아기 의자도 있고 직원분들이 친절해요
플레인 베이글은 아이 간식으로 딱!`,
  ],
  [
    'c-bagel',
    '@kmu_eats',
    'blog',
    'open',
    3,
    `계명대 근처 베이글 맛집 추천 | 베이글하우스 신메뉴 후기
계명대 정문에서 걸어서 10분 거리예요.
신메뉴 할라피뇨 크림치즈는 매콤해서 느끼하지 않았어요.

체험단으로 방문했습니다.`,
  ],
  [
    'c-bagel',
    '@suseong_vlog',
    'youtube',
    'resolved',
    3,
    `[협찬] 대구 베이글 투어 VLOG | 베이글하우스 신메뉴 먹방
베이글하우스로부터 제품을 무상으로 제공받아 제작했습니다.`,
  ],
  [
    'c-bagel',
    '@cafe_hopper_yu',
    'instagram',
    'open',
    4,
    `[협찬] 베이글하우스로부터 제품을 무상으로 제공받아 작성한 글입니다.

신메뉴 3종 다 먹어 봤는데 저는 쪽파가 최고 💚
#대구카페 #베이글`,
  ],
  [
    'c-bagel',
    '@daily_jiwoo',
    'instagram',
    'open',
    4,
    `협찬 받은 베이글하우스 신메뉴 후기!
블루베리 크림치즈 강추해요 🫐
#thanksto베이글하우스 #대구맛집`,
  ],
  [
    'c-bagel',
    '@foodie_minseo',
    'instagram',
    'resolved',
    5,
    `[협찬] 베이글하우스로부터 제품(서비스)을 무상으로 제공받아 작성한 글입니다.

주말 브런치로 다녀왔어요 ☀️ 커피랑 베이글 조합 최고
#대구브런치 #베이글하우스`,
  ],
  [
    'c-glow',
    '@beauty_hana',
    'instagram',
    'resolved',
    12,
    `[광고] 글로우랩으로부터 원고료를 받아 작성한 글입니다.

진정앰플 2주 사용 후기 ✨ 볼 붉은기가 확실히 줄었어요
#진정앰플 #수부지`,
  ],
  [
    'c-glow',
    '@skin_diary_su',
    'instagram',
    'requested',
    13,
    `진정앰플 찐후기 ✨
환절기마다 뒤집어지던 피부가 잠잠해졌어요
끈적임 없어서 아침에도 쓰기 좋아요

#광고 #진정앰플 #수부지 #뷰티스타그램 #데일리케어 #글로우랩`,
  ],
  [
    'c-glow',
    '@yuna_makeup',
    'youtube',
    'open',
    14,
    `환절기 진정 루틴 GRWM | 글로우랩 앰플 리뷰
#ad #sponsored`,
  ],
  [
    'c-glow',
    '@kmu_beauty',
    'blog',
    'resolved',
    15,
    `[광고] 글로우랩 진정앰플 한 달 사용기
글로우랩으로부터 원고료를 받아 작성한 글입니다.
한 달 동안 아침저녁으로 써 본 솔직한 기록이에요.`,
  ],
]

export function samplePosts(): Post[] {
  return SEEDS.map(([campaignId, influencer, platform, status, days, text], i) => ({
    id: `p-${i + 1}`,
    campaignId,
    influencer,
    platform,
    text,
    status,
    updatedAt: daysAgo(days),
  }))
}
