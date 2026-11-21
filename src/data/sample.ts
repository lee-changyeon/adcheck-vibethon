import { runCheck } from './rules'
import type { CheckInput, CheckRecord } from './types'

/** 점검 화면의 "예시 글로 체험하기" 버튼 */
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
