import { type Application, type CollabEvent, type Creator, DEFAULT_TEMPLATE, type DmRecord, fillTemplate, toLocalInput } from './collab'

/* 시연용 샘플: 협업 크리에이터 10명, 행사 2개(모집 중 1 · 마감 1), 발송 기록, 신청자.
   연락처는 실제 사람에게 닿지 않도록 example.com 주소를 쓴다. */

const T0 = '2026-11-10T09:00:00.000Z'

export const SAMPLE_CREATORS: Creator[] = [
  {
    id: 'cr-01', name: '김하린', field: 'food', followers: 48200,
    accounts: [{ kind: 'instagram', handle: '@harin_eats.dg' }, { kind: 'blog', handle: '@harin_food' }],
    contact: 'harin.eats@example.com', memo: '대구 동성로·삼덕동 카페 전문. 사진 퀄리티 좋음, 마감 잘 지킴', createdAt: T0,
  },
  {
    id: 'cr-02', name: '박도윤', field: 'food', followers: 126000,
    accounts: [{ kind: 'youtube', handle: '@doyun_mukbang' }, { kind: 'instagram', handle: '@doyun.eat' }],
    contact: 'doyun.biz@example.com', memo: '먹방 유튜버. 영상 편집 기간 2주 필요', createdAt: T0,
  },
  {
    id: 'cr-03', name: '이서아', field: 'beauty', followers: 83500,
    accounts: [{ kind: 'instagram', handle: '@seoa_glow' }, { kind: 'tiktok', handle: '@seoa.glow' }],
    contact: 'seoa.glow@example.com', memo: '민감성 피부 리뷰 위주. 글로우랩 세럼 캠페인 참여 이력', createdAt: T0,
  },
  {
    id: 'cr-04', name: '정유나', field: 'beauty', followers: 21400,
    accounts: [{ kind: 'instagram', handle: '@yuna_daily_makeup' }],
    contact: 'yuna.makeup@example.com', memo: '데일리 메이크업 릴스. 협찬 표시 늘 정확하게 함', createdAt: T0,
  },
  {
    id: 'cr-05', name: '최민준', field: 'fashion', followers: 57800,
    accounts: [{ kind: 'instagram', handle: '@minjun_ootd' }],
    contact: 'minjun.ootd@example.com', memo: '남성 캐주얼 코디. 대학생 팔로워 많음', createdAt: T0,
  },
  {
    id: 'cr-06', name: '한지우', field: 'travel', followers: 34100,
    accounts: [{ kind: 'blog', handle: '@jiwoo_trip' }, { kind: 'instagram', handle: '@jiwoo.trip' }],
    contact: 'jiwoo.trip@example.com', memo: '경북 근교 여행 블로그. 숙소·체험 리뷰', createdAt: T0,
  },
  {
    id: 'cr-07', name: '오세린', field: 'fitness', followers: 15600,
    accounts: [{ kind: 'instagram', handle: '@serin_pilates' }, { kind: 'youtube', handle: '@serinfit' }],
    contact: 'serin.fit@example.com', memo: '필라테스 강사. 단백질·건강식품 협업 가능', createdAt: T0,
  },
  {
    id: 'cr-08', name: '윤채원', field: 'parenting', followers: 92300,
    accounts: [{ kind: 'instagram', handle: '@chaewon_mom' }, { kind: 'blog', handle: '@chaewon_home' }],
    contact: 'chaewon.mom@example.com', memo: '두 아이 육아 일상. 주말 행사 참석 어려움', createdAt: T0,
  },
  {
    id: 'cr-09', name: '강태오', field: 'tech', followers: 210000,
    accounts: [{ kind: 'youtube', handle: '@taeo_review' }],
    contact: 'taeo.review@example.com', memo: '전자기기 리뷰 유튜버. 제품 대여 후 반납 조건 선호', createdAt: T0,
  },
  {
    id: 'cr-10', name: '서다은', field: 'living', followers: 8900,
    accounts: [{ kind: 'instagram', handle: '@daeun_roomlog' }],
    contact: 'daeun.room@example.com', memo: '자취방 인테리어. 팔로워는 적지만 저장 수 높음', createdAt: T0,
  },
]

/** 신청 시뮬레이션에서 DB 크리에이터가 모두 신청했을 때 쓰는 이름 */
export const EXTRA_APPLICANTS: { name: string; handle: string }[] = [
  { name: '임소율', handle: '@soyul_cafe' },
  { name: '배현우', handle: '@hyunwoo.daily' },
  { name: '조나연', handle: '@nayeon_vlog' },
  { name: '신예준', handle: '@yejun_eats' },
  { name: '홍지아', handle: '@jia.lookbook' },
  { name: '문시우', handle: '@siwoo_trip' },
  { name: '양하윤', handle: '@hayoon_beauty' },
  { name: '권도현', handle: '@dohyun.fit' },
]

/** 샘플 행사: 처음 열 때의 시각을 기준으로 날짜를 잡는다 */
export function sampleCollab() {
  const now = Date.now()
  const at = (days: number, hour: number) => {
    const d = new Date(now + days * 86400000)
    d.setHours(hour, 0, 0, 0)
    return toLocalInput(d)
  }
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString()

  const open: CollabEvent = {
    id: 'ev-01',
    name: '베이글하우스 겨울 신메뉴 시식회',
    startsAt: at(5, 14),
    place: '베이글하우스 동성로점 2층 (대구 중구 동성로2길)',
    description: '신메뉴 3종(얼그레이 크림치즈, 고구마 라떼, 트러플 에그) 시식 후 인스타그램 게시물 1건 업로드',
    capacity: 5,
    deadline: at(2, 18),
    closedManually: false,
    template: DEFAULT_TEMPLATE,
    createdAt: iso(3 * 3600000),
  }
  const closed: CollabEvent = {
    id: 'ev-02',
    name: '글로우랩 세럼 런칭 팝업 초대',
    startsAt: at(3, 11),
    place: '더현대 대구 지하 1층 팝업존',
    description: '신제품 비타C 세럼 체험, 포토존 촬영, 릴스 또는 쇼츠 1건 업로드',
    capacity: 3,
    deadline: at(-1, 12),
    closedManually: false,
    template: DEFAULT_TEMPLATE,
    createdAt: iso(4 * 86400000),
  }

  const byId = (id: string) => SAMPLE_CREATORS.find((c) => c.id === id) ?? null
  const dm = (ev: CollabEvent, id: string, to: string, msAgo: number, status: DmRecord['status']): DmRecord => {
    const c = byId(id)
    return {
      id: `dm-${ev.id}-${id}`, eventId: ev.id, creatorId: id, creatorName: c?.name ?? '', to,
      message: fillTemplate(ev.template, ev, c), sentAt: iso(msAgo), status,
    }
  }
  const dms: DmRecord[] = [
    dm(open, 'cr-01', '인스타 @harin_eats.dg', 2 * 3600000, 'read'),
    dm(open, 'cr-02', '인스타 @doyun.eat', 2 * 3600000, 'read'),
    dm(open, 'cr-05', '인스타 @minjun_ootd', 2 * 3600000, 'sent'),
    dm(open, 'cr-06', '인스타 @jiwoo.trip', 2 * 3600000, 'read'),
    dm(closed, 'cr-03', '인스타 @seoa_glow', 3 * 86400000, 'read'),
    dm(closed, 'cr-04', '인스타 @yuna_daily_makeup', 3 * 86400000, 'read'),
    dm(closed, 'cr-07', '인스타 @serin_pilates', 3 * 86400000, 'read'),
    dm(closed, 'cr-10', '인스타 @daeun_roomlog', 3 * 86400000, 'sent'),
  ]

  const app = (ev: CollabEvent, id: string, msAgo: number): Application => {
    const c = byId(id)
    return {
      id: `ap-${ev.id}-${id}`, eventId: ev.id, creatorId: id, name: c?.name ?? '',
      handle: c?.accounts[0]?.handle ?? '', appliedAt: iso(msAgo),
    }
  }
  const applications: Application[] = [
    app(open, 'cr-01', 100 * 60000 + 412),
    app(open, 'cr-06', 95 * 60000 + 87),
    app(open, 'cr-02', 41 * 60000 + 903),
    app(closed, 'cr-04', 3 * 86400000 - 5 * 60000 + 120),
    app(closed, 'cr-03', 3 * 86400000 - 5 * 60000 + 954),
    app(closed, 'cr-07', 3 * 86400000 - 12 * 60000),
    app(closed, 'cr-10', 2 * 86400000),
  ]

  return { events: [open, closed], dms, applications }
}
