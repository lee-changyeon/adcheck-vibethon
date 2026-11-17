import type { CheckInput, CheckResult, Issue, Platform, Reward, Severity, Verdict } from './types'

/*
 * 광고 표시 점검 규칙 엔진 (화면과 분리된 순수 함수)
 * 근거: 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」의 표시 방법 요약
 *  - 대가(현금·무료 제품·할인 등)를 받았다면 광고라는 사실을 표시해야 한다
 *  - 소비자가 쉽게 알 수 있는 한글 표현으로, 글의 첫 부분에, 다른 내용에 묻히지 않게
 */

/** 인정되는 한글 표시 */
const DISCLOSURE = /유료\s?광고|광고|협찬|무상\s?(?:으로\s?)?제공|무료\s?(?:로\s?)?제공\s?받|제공\s?받아|원고료|대가\s?를?\s?받|소정의|지원\s?받아/g
/** 대가를 받았는데 쓰면 거짓이 되는 표현 */
const FALSE_CLAIM = /내돈내산|직접\s?구매|(?:협찬|광고)\s?(?:이|은|는|가)?\s?(?:아님|아닙니다|아니에요|아니고|없음|없는|[xX])/g
/** 애매하거나 외국어라 표시로 인정되기 어려운 표현 */
const VAGUE = /#?thanks\s?to\S*|#?땡스투\S*|#(?:ad|sponsored|gifted|pr)(?![a-z가-힣])|sponsored|gifted|#?체험단|#?서포터즈|#with\S+/gi
/** 받은 대가를 구체적으로 밝힌 표현 */
const SPECIFIC = /제공\s?받|원고료|대가|무상|무료\s?(?:로\s?)?제공|지원\s?받|할인|쿠폰|유료\s?광고/

const PENALTY: Record<Severity, number> = { danger: 35, warning: 15, tip: 5 }

/** 인스타그램은 '더보기' 전에 앞부분 약 2줄만 보인다 */
const INSTAGRAM_VISIBLE_CHARS = 40

/** 정규식에 걸린 부분을 같은 길이의 공백으로 지운다 (글자 위치 유지) */
function mask(text: string, re: RegExp) {
  return text.replace(re, (m) => ' '.repeat(m.length))
}

function allMatches(text: string, re: RegExp) {
  return [...text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))]
}

/** idx 위치의 단어가 해시태그(#...)인지 */
function isInHashtag(text: string, idx: number) {
  let i = idx
  while (i > 0 && !/\s/.test(text[i - 1])) i--
  return text[i] === '#'
}

/** idx가 몇 번째 내용 줄(빈 줄 제외, 0부터)에 있는지 */
function lineNoOf(text: string, idx: number) {
  return text
    .slice(0, idx)
    .split('\n')
    .slice(0, -1)
    .filter((l) => l.trim()).length
}

function isVisiblePosition(platform: Platform, text: string, idx: number) {
  if (platform === 'instagram') return idx < INSTAGRAM_VISIBLE_CHARS
  if (platform === 'blog') return lineNoOf(text, idx) <= 1 // 제목 또는 본문 첫 줄
  return lineNoOf(text, idx) === 0 // 유튜브: 제목(첫 줄)
}

const POSITION_HINT: Record<Platform, string> = {
  instagram: "인스타그램은 앞부분 약 2줄만 보여요. '더보기'를 누르지 않아도 보이는 첫 부분(40자 안)에 표시해야 해요.",
  blog: '블로그는 제목이나 본문 첫 부분에 표시해야 해요. 글 맨 끝의 안내 문구는 끝까지 읽은 사람만 볼 수 있어요.',
  youtube: '유튜브는 영상 제목(첫 줄)에 표시해야 해요. 설명란 아래쪽은 대부분 펼쳐 보지 않아요.',
}

/** 받침에 따라 '로' / '으로' */
function withRo(word: string) {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return `${word}로`
  const jong = (code - 0xac00) % 28
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`
}

const REWARD_PHRASE: Record<Exclude<Reward, 'none'>, string> = {
  cash: '원고료를 받아 작성한 글입니다.',
  product: '제품(서비스)을 무상으로 제공받아 작성한 글입니다.',
  discount: '할인 혜택을 받아 작성한 글입니다.',
}

/** 고친 글: 애매한·반대 표현과 해시태그 표시를 지우고, 첫 부분에 명확한 표시 문장을 넣는다 */
export function buildFixedText(input: CheckInput): string {
  const { platform, reward, brand } = input
  const text = input.text.trim()
  if (reward === 'none') return text

  const body = text
    .replace(/#?thanks\s?to\S*/gi, '')
    .replace(/#?땡스투\S*/g, '')
    .replace(/#(?:ad|sponsored|gifted|pr)(?![a-z가-힣])/gi, '')
    .replace(/#with\S+/gi, '')
    .replace(/#(?:유료광고|광고|협찬|체험단|서포터즈)(?=\s|$)/g, '')
    .replace(/#?내돈내산/g, '')
    .replace(/#직접구매/g, '')
    .split('\n')
    .map((l) => l.replace(/[ \t]{2,}/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const label = reward === 'cash' ? '[광고]' : '[협찬]'
  const from = brand.trim() ? `${withRo(brand.trim())}부터` : '업체로부터'
  const sentence = `${from} ${REWARD_PHRASE[reward]}`

  if (platform === 'instagram') return `${label} ${sentence}\n\n${body}`
  // 블로그·유튜브: 제목(첫 줄) 앞에 표시를 붙이고, 바로 아래에 안내 문장
  const [title, ...rest] = body.split('\n')
  return [`${label} ${title}`, sentence, ...rest].join('\n')
}

export function runCheck(input: CheckInput): CheckResult {
  const { platform, reward } = input
  const text = input.text.trim()
  const issues: Issue[] = []
  const reminders: string[] = []

  if (reward === 'none') {
    reminders.push('대가를 받지 않은 글은 광고 표시 의무가 없어요. 나중에 업체에서 대가를 받으면 그때부터는 표시해야 해요.')
    return { score: 100, verdict: '적합', issues, fixedText: text, reminders }
  }

  const falseClaims = allMatches(text, FALSE_CLAIM)
  const masked = mask(text, FALSE_CLAIM)
  const disclosures = allMatches(masked, DISCLOSURE)
  const vague = allMatches(text, VAGUE)
  const hashtagCount = (text.match(/#[^\s#]+/g) ?? []).length

  if (falseClaims.length > 0) {
    issues.push({
      code: 'FALSE_CLAIM',
      severity: 'danger',
      title: '대가를 받았는데 반대로 표현했어요',
      detail: '대가를 받은 글에 "내돈내산", "협찬 아님" 같은 표현을 쓰면 소비자를 속이는 광고가 돼요. 반드시 지워 주세요.',
      found: falseClaims[0][0].trim(),
    })
  }

  if (disclosures.length === 0) {
    issues.push({
      code: 'NO_DISCLOSURE',
      severity: 'danger',
      title: '광고·협찬 표시가 없어요',
      detail: '현금, 무료 제품, 할인 등 대가를 받았다면 "광고", "협찬", "제품을 무상으로 제공받아 작성" 같은 한글 표시가 꼭 있어야 해요.',
    })
    if (vague.length > 0) {
      issues.push({
        code: 'VAGUE_WORD',
        severity: 'warning',
        title: '광고로 인정되지 않는 표현이에요',
        detail: '"thanks to", "with", "#ad", "체험단" 같은 표현은 소비자가 광고인지 알기 어려워요. 누구나 아는 한글 표현으로 바꿔 주세요.',
        found: vague[0][0].trim(),
      })
    }
  } else {
    const first = disclosures[0]
    const firstIdx = first.index ?? 0
    if (!isVisiblePosition(platform, text, firstIdx)) {
      issues.push({
        code: 'LATE_POSITION',
        severity: 'danger',
        title: '표시가 너무 뒤쪽에 있어요',
        detail: POSITION_HINT[platform],
        found: first[0],
      })
    }
    const onlyHashtags = disclosures.every((m) => isInHashtag(text, m.index ?? 0))
    if (onlyHashtags && hashtagCount >= 5) {
      issues.push({
        code: 'BURIED_HASHTAG',
        severity: 'warning',
        title: '해시태그 사이에 묻혀 있어요',
        detail: `해시태그 ${hashtagCount}개 사이에 섞인 표시는 눈에 잘 띄지 않아요. 해시태그가 아닌 문장으로 따로 적어 주세요.`,
        found: `#${first[0]}`,
      })
    }
    if (vague.length > 0) {
      issues.push({
        code: 'VAGUE_WORD',
        severity: 'warning',
        title: '애매한 표현이 섞여 있어요',
        detail: '"thanks to", "#ad" 같은 표현은 광고 표시로 인정되지 않아요. 한글 표시만 남기는 게 명확해요.',
        found: vague[0][0].trim(),
      })
    }
    if (!SPECIFIC.test(masked)) {
      issues.push({
        code: 'NOT_SPECIFIC',
        severity: 'tip',
        title: '받은 대가를 구체적으로 적으면 더 좋아요',
        detail: '"협찬"만 쓰기보다 "○○로부터 제품을 무상으로 제공받아 작성"처럼 무엇을 받았는지 밝히면 더 신뢰를 얻어요.',
      })
    }
  }

  if (platform === 'youtube') {
    reminders.push("영상 시작과 끝에도 '유료 광고 포함'을 말이나 자막으로 알리고, 유튜브의 '유료 프로모션 포함' 설정을 켜 주세요.")
  }
  if (platform === 'instagram') {
    reminders.push("인스타그램의 '유료 파트너십' 라벨을 함께 쓰면 더 확실해요.")
  }

  const score = Math.max(0, 100 - issues.reduce((sum, i) => sum + PENALTY[i.severity], 0))
  const verdict: Verdict = issues.some((i) => i.severity === 'danger')
    ? '위반 위험'
    : issues.some((i) => i.severity === 'warning')
      ? '보완 필요'
      : '적합'

  const fixedText = issues.length === 0 ? text : buildFixedText(input)
  return { score, verdict, issues, fixedText, reminders }
}
