import { runCheck } from './rules'
import type { CheckInput, CheckRecord } from './types'

/** 점검 화면의 "예시 글로 체험하기" 목록 (드롭다운 순서 그대로) */
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
    label: '유튜브 설명란에만 안내',
    input: {
      platform: 'youtube',
      reward: 'cash',
      brand: '코어핏 필라테스',
      text: `직장인 퇴근 후 필라테스 4주 변화 | 거북목 교정 브이로그
설명란: 퇴근하고 일주일에 세 번, 4주 동안 다녀 본 솔직한 기록이에요.
수업 시간표와 위치는 아래에 정리해 두었어요.
이 영상은 코어핏 필라테스로부터 소정의 원고료를 받아 제작되었습니다.`,
    },
  },
  {
    label: '영어 #ad·#gifted만',
    input: {
      platform: 'instagram',
      reward: 'product',
      brand: '무드라이트',
      text: `요즘 퇴근하고 제일 먼저 켜는 무드등 🕯️
은은한 주황빛이라 눈이 편하고, 타이머 기능이 있어서 켜 놓고 잠들어도 돼요.

#ad #gifted #무드등 #자취방꾸미기 #인테리어소품`,
    },
  },
  {
    label: '할인받고 #체험단만',
    input: {
      platform: 'blog',
      reward: 'discount',
      brand: '네일루미',
      text: `범어동 네일샵 후기 - 겨울 자석젤 네일
퇴근길에 들르기 좋은 범어역 근처 네일샵이에요.
자석젤로 은은하게 반짝이는 겨울 네일을 받았는데 2주가 지나도 들뜬 곳이 없어요.
예약은 네이버 예약으로 하면 편해요.

#체험단 #범어동네일 #자석젤네일 #겨울네일`,
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
