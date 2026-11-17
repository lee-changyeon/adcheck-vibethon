import { runCheck } from './rules'
import type { CheckInput, CheckRecord } from './types'

/** 점검 화면의 "예시 글" 버튼 (시연용) */
export const EXAMPLES: { label: string; input: CheckInput }[] = [
  {
    label: '해시태그 끝에 #협찬',
    input: {
      platform: 'instagram',
      reward: 'product',
      brand: '베이글하우스',
      text: `대명동 골목에서 발견한 베이글 맛집 🥯
쪽파 크림치즈가 진짜 미쳤어요... 꼭 드셔 보세요!
주차는 근처 공영주차장 이용하면 편해요

#대구맛집 #대명동카페 #베이글맛집 #대구베이글 #빵스타그램 #협찬 #thanksto베이글하우스`,
    },
  },
  {
    label: '블로그 맨 끝에 안내',
    input: {
      platform: 'blog',
      reward: 'cash',
      brand: '레이크뷰브런치',
      text: `수성못 뷰 미쳤다! 신상 브런치 카페 솔직 후기
주말 아침에 수성못 산책하고 들른 브런치 카페예요.
2층 창가 자리에서 수성못이 한눈에 보여서 분위기가 정말 좋았어요.
리코타 샐러드와 프렌치토스트를 시켰는데 양도 넉넉하고 가격도 괜찮았어요.
평일 오전에는 웨이팅 없이 들어갈 수 있다고 하니 참고하세요!

본 포스팅은 업체로부터 원고료를 받아 작성되었습니다.`,
    },
  },
  {
    label: '협찬인데 내돈내산',
    input: {
      platform: 'instagram',
      reward: 'discount',
      brand: '글로우랩',
      text: `2주 동안 써 본 진정 앰플 찐후기 ✨
환절기마다 올라오던 볼 붉은기가 확실히 가라앉았어요.
끈적임 없이 흡수돼서 아침 화장 전에 쓰기 좋아요.

#내돈내산 #진정앰플 #수부지 #뷰티스타그램 #with글로우랩`,
    },
  },
  {
    label: '잘 쓴 글',
    input: {
      platform: 'instagram',
      reward: 'product',
      brand: '글로우랩',
      text: `[협찬] 글로우랩으로부터 제품을 무상으로 제공받아 작성한 글입니다.

2주 동안 써 본 진정 앰플 후기 ✨
환절기마다 올라오던 볼 붉은기가 확실히 가라앉았어요.

#진정앰플 #수부지 #뷰티스타그램`,
    },
  },
]

/** 이력·통계 화면에 처음 보여 줄 샘플 이력 (오늘 기준 며칠 전) */
const HISTORY_SEED: { daysAgo: number; input: CheckInput }[] = [
  { daysAgo: 6, input: EXAMPLES[1].input },
  {
    daysAgo: 6,
    input: {
      platform: 'instagram',
      reward: 'product',
      brand: '서문시장 납작만두',
      text: `서문시장 야시장 필수 코스 🥟
바삭한 납작만두에 양념 듬뿍! 줄 서도 먹을 가치 있어요

#대구여행 #서문시장 #야시장 #납작만두 #대구맛집 #먹스타그램 #협찬`,
    },
  },
  {
    daysAgo: 5,
    input: {
      platform: 'youtube',
      reward: 'cash',
      brand: '핏업짐',
      text: `대학생 3개월 헬스 브이로그 | 다이어트 전후 공개
설명란: 영상에 나온 헬스장 정보는 아래에 있어요.
이 영상은 핏업짐으로부터 소정의 원고료를 받아 제작되었습니다.`,
    },
  },
  { daysAgo: 4, input: EXAMPLES[2].input },
  {
    daysAgo: 3,
    input: {
      platform: 'instagram',
      reward: 'product',
      brand: '동성로 꽃집 플로라',
      text: `생일 선물로 받은 꽃다발 💐 색감이 너무 예뻐요
#thanksto플로라 #꽃스타그램 #동성로꽃집`,
    },
  },
  {
    daysAgo: 2,
    input: {
      platform: 'blog',
      reward: 'product',
      brand: '앞산 캠핑장',
      text: `[협찬] 앞산 글램핑 1박 후기 - 대구 근교 캠핑 추천
앞산 캠핑장으로부터 숙박을 무상으로 제공받아 작성한 글입니다.
도심에서 20분이면 도착하는데 공기가 완전히 달라요.`,
    },
  },
  { daysAgo: 1, input: EXAMPLES[3].input },
]

export function makeRecord(input: CheckInput, createdAt: Date = new Date()): CheckRecord {
  const r = runCheck(input)
  return {
    ...input,
    id: `${createdAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: createdAt.toISOString(),
    score: r.score,
    verdict: r.verdict,
    issueCodes: r.issues.map((i) => i.code),
  }
}

/** 최신순 샘플 이력 */
export function sampleHistory(): CheckRecord[] {
  const now = Date.now()
  return HISTORY_SEED.map(({ daysAgo, input }, i) => makeRecord(input, new Date(now - daysAgo * 86_400_000 - i * 3_600_000))).reverse()
}
