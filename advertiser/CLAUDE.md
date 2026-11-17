# 애드체크 비즈 (광고주용 웹앱)

2026 계명문화대학교 바이브톤(개인 참가, SNS마케팅 전공) 출품작 중 **광고주용 앱**. 시연은 **휴대폰 화면**에서 한다.
크리에이터용 짝 앱 **애드체크**는 상위 폴더(`../`)에 있다. 이 폴더는 광고주용 앱만 다룬다.
- 제출 마감: 2026-11-17 16:30

## 앱 한 줄 소개
체험단·협찬 캠페인을 운영하는 광고주가 인플루언서 게시물의 광고 표시를 공정위 「추천·보증 등에 관한 표시·광고 심사지침」 기준으로 **일괄 검수**하고, **수정 요청 메시지**를 만들어 보내고, 조치 상태를 관리한다.

## 기술 스택 (바꾸지 말 것)
- Vite + React 19 + TypeScript
- Tailwind CSS v4 (설정 파일 없음, `src/index.css`의 `@theme`에서 색/폰트 관리). 대표 색은 청록(brand-600 `#0f766e`)
- react-router-dom (BrowserRouter), 아이콘은 lucide-react, 차트는 recharts
- 글자 인식(OCR): tesseract.js 7.0.0 (브라우저 안에서 한글 인식, 서버·API 키 불필요)
- 데이터는 `useLocalStorage` 훅으로 브라우저에 저장 (키 접두어 `adcheckbiz.`)
- 서버가 꼭 필요할 때만 `api/` 폴더에 Vercel 서버리스 함수 추가. 키는 환경변수로만
- 새 라이브러리는 꼭 필요할 때만 추가하고, 추가하면 이유를 한 줄로 알려 줄 것

## 점검 규칙은 상위 앱과 공유 (중요)
- 원본: `../src/data/rules.ts`, `../src/data/types.ts` (크리에이터용 앱)
- 이 폴더의 `src/data/rules.ts`, `types.ts`는 **복사본**. 직접 고치지 말고 원본을 고친 뒤 `npm run sync-rules`로 복사
- 광고주용 타입·계산은 `src/data/biz.ts`

## 폴더 구조
- `src/App.tsx` — 하단 탭(NAV)과 라우트 목록. 페이지 추가 시 둘 다 한 줄씩 추가
- `src/components/AppShell.tsx` — 휴대폰 폭(max-w-md) 앱 틀 + ErrorBoundary
- `src/components/ui.tsx` — 공통 부품: Button, Card, Input, Textarea, Badge, ChoiceChips, ProgressBar, Fab, SectionTitle, EmptyState, BottomSheet
- `src/components/BizParts.tsx` — CampaignSwitcher, VerdictBadge, StatusBadge, IssueList
- `src/pages/` — 대시보드(/), 게시물(/posts), 화면 스캔(/scan), 캠페인(/campaigns)
- `src/data/` — biz.ts(캠페인·게시물 타입, 수정 요청 메시지), sample.ts(샘플 캠페인 2개·게시물 12개), rules.ts·types.ts(복사본)
- `src/hooks/useBiz.ts` — 캠페인·게시물·현재 캠페인 상태
- `src/lib/clipboard.ts` — 복사 (http에서도 동작), `src/lib/frames.ts` — 연속 촬영 프레임 점수·합성, `src/lib/ocr.ts` — 글자 인식(지연 로딩), `src/lib/demoFrames.ts` — 예시 화면 6장
- `docs/` — 이 앱의 기획·설계·작업·설명서 문서와 프롬프트 기록

## 문서 관리 (중요 — 심사·보고서에 그대로 쓰임)
`docs/` 문서는 개발과 함께 갱신한다. 따로 요청하지 않아도 아래 시점에 고칠 것.

| 문서 | 언제 갱신 |
|---|---|
| `01_기획서.md` | 기획이 바뀔 때 |
| `02_기술설계.md` | 데이터 구조·화면·외부 연동이 정해지거나 바뀔 때 |
| `03_작업목록.md` | 작업을 시작(🔄)·완료(✅)할 때마다, 완료 시각 기록 |
| `04_사용설명서.md` | 기능을 추가·변경할 때마다. 버전을 올리고 변경 이력에 한 줄 추가 |

- `docs/프롬프트기록.md`, `docs/prompt-log.jsonl`은 훅이 자동으로 쓰므로 **수정·삭제하지 말 것**

## 세션 운영
- 요청의 **주제가 바뀌면**(다른 앱, 다른 기능 묶음, 배포·보고서처럼 성격이 다른 작업 등) 바로 시작하지 말고 **"이 세션에서 계속할지, 새 세션을 열지"를 먼저 물어볼 것**
- 같은 주제의 수정·후속 질문은 묻지 않고 이어서 진행

## 오류 최소화 규칙
1. **작게 만들고 바로 검사:** 기능 하나 끝날 때마다 `npm run check`(타입 검사 + 린트 + 빌드). 작업 종료 시 훅이 자동으로도 검사한다
2. **타입 먼저:** 데이터 구조를 `src/data/`에 타입으로 먼저 정의하고 화면을 만든다. `any` 금지
3. **시연이 멈추지 않게:** 카메라·OCR·외부 요청이 실패하면 대체 경로(사진 불러오기, 직접 입력, 예시 화면) 제공. 로딩·빈 화면·오류 상태 모두 처리
4. **큰 변경 전에는 계획부터:** 여러 파일을 바꾸는 작업은 바꿀 파일 목록을 먼저 보여 줄 것
5. **같은 오류에 3번 실패하면** 접근을 바꾸고 이유를 설명할 것
6. 브라우저 확인은 375px 휴대폰 폭 기준
7. 카메라(getUserMedia)는 https 또는 localhost에서만 동작. 같은 와이파이 주소(http://172.x)로 휴대폰 접속 시에는 카메라 대신 사진 불러오기로 대체됨

## 디자인 규칙
- 화면은 `ui.tsx`·`BizParts.tsx` 부품을 먼저 쓰고, 없으면 그 파일에 부품을 추가해서 재사용
- 대표 색은 `brand-*` 클래스만 사용 (색 변경은 `index.css`의 `@theme`에서만)
- 버튼은 손가락으로 누르기 쉬운 크기, 모든 문구는 한국어
- 빈 화면에는 EmptyState로 안내 문구 표시
- 시연용 샘플 데이터는 그럴듯한 실제 예시로 채울 것 (lorem ipsum 금지)
- 통계·분석 화면은 recharts로 시각화 (한 차트에 한 가지 메시지, 축은 하나)

## 명령어 (이 폴더에서)
- `npm run dev -- --port 5176` — 개발 서버 (미리보기 설정 이름 `advertiser`)
- `npm run check` — 타입 검사 + 린트 + 빌드
- `npm run sync-rules` — 상위 앱의 점검 규칙 복사
- `npm run analyze` — 프롬프트 기록 분석 → `docs/analysis/`
- `npm run deploy` — 배포 (Vercel 프로젝트 `adcheck-biz-vibethon`)
