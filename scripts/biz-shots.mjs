// 애드체크 비즈 발표용 화면 캡처 7장 (375×812, 2배율 = 750×1624). 파일 이름은 발표 자료 속 그림 이름과 같다
// 사용: advertiser 개발 서버(npm run dev -- --port 5176)를 켠 뒤 node scripts/biz-shots.mjs <출력폴더(임시)> [base=http://localhost:5176]
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { openChrome, pageHelpers, sleep } from './lib/cdp.mjs'

const OUT = process.argv[2]
const BASE = process.argv[3] ?? 'http://localhost:5176'
mkdirSync(OUT, { recursive: true })
const page = await openChrome({ port: 9337, profileDir: join(OUT, '_profile') })
const { send, js } = page
const { go, scrollTo, click, waitFor, hasEnabled } = pageHelpers(page, BASE)
const shot = async (name) => {
  await sleep(600)
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'))
  console.log('saved', name)
}
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

// 샘플 데이터 상태로 시작
await go('/')
await js('localStorage.clear()')
await go('/', 2500)
await shot('image-5-1') // 대시보드 · 준수율 (표지 image-1-2와 같은 그림)

// 수정 요청 메시지: 위반 게시물 검수 시트
await go('/posts')
await click('main *', '@daegu_foodie')
await sleep(800)
await scrollTo('수정 요청 메시지', 90)
await shot('image-5-2')

// 화면 스캔: 예시 화면 → 장면 고르기
await go('/scan')
await click('button', '예시 화면으로 체험')
await waitFor(hasEnabled('이 장면으로 글자 읽기'), 30000)
await sleep(800)
await scrollTo('장면 고르기', 76)
await shot('image-6-1')

// 글자 읽기(OCR) → 등록 → 45점
await click('button', '이 장면으로 글자 읽기')
await waitFor(hasEnabled('게시물로 등록하고 검수'), 180000)
await click('button', '게시물로 등록하고 검수')
await sleep(1500)
await shot('image-6-2')

// 협업: 크리에이터 DB
await go('/collab')
await shot('image-7-1')

// 행사 상세: 받는 사람 2명 고르고 DM 미리보기
await go('/collab/events/ev-01')
await click('main button', '김하린')
await click('main button', '박도윤')
await sleep(500)
await scrollTo('3. 미리보기', 76)
await shot('image-7-2')

// 선착순: 5명 몰리기 → 선발 5 · 대기 3
await js('window.scrollTo(0, 0)')
await click('button', '선착순 신청')
await sleep(600)
await click('button', '5명 몰리기')
await sleep(2500)
await scrollTo('선착순 신청', 230)
await shot('image-7-3')

page.close()
