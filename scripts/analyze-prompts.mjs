// 프롬프트 기록(docs/prompt-log.jsonl)을 분석해 보고서·발표용 이미지와 요약을 만든다.
//   npm run analyze
// 결과: docs/analysis/prompts-by-time.svg, prompts-by-type.svg, 요약.md
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const logPath = join(root, 'docs', 'prompt-log.jsonl')
const outDir = join(root, 'docs', 'analysis')

if (!existsSync(logPath)) {
  console.log('docs/prompt-log.jsonl 이 없습니다. Claude Code에서 프롬프트를 입력하면 자동으로 생깁니다.')
  process.exit(0)
}
mkdirSync(outDir, { recursive: true })

const logs = readFileSync(logPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))

// ── 프롬프트 유형 분류 (키워드 기준, 위에서부터 먼저 맞는 것) ──
const TYPES = [
  ['오류 수정', /오류|에러|error|안 ?돼|안 ?됨|깨져|버그|고쳐|수정해|fix/i],
  ['배포', /배포|vercel|netlify|deploy|링크|로그인|승인/i],
  ['문서·보고서', /문서|설명서|보고서|기록|발표|정리해|md\b/i],
  ['디자인', /디자인|색|폰트|예쁘|레이아웃|화면.*(다듬|바꿔)|모바일|반응형|아이콘|애니메이션/i],
  ['기획·설계', /주제|기획|계획|설계|구조|아이디어|어떻게 (만들|할)|화면 구성/i],
  ['기능 구현', /만들어|추가해|구현|기능|넣어|저장|검색|목록|버튼|페이지/i],
]
// 첫 프롬프트는 보통 주제 전달이므로 키워드가 없어도 기획·설계로 본다
const classify = (p, i) => TYPES.find(([, re]) => re.test(p))?.[0] ?? (i === 0 ? '기획·설계' : '기타')
const typeCounts = new Map([...TYPES.map(([t]) => [t, 0]), ['기타', 0]])
logs.forEach((l, i) => typeCounts.set(classify(l.prompt, i), typeCounts.get(classify(l.prompt, i)) + 1))

// ── 시간대별 (날짜 + 시) ──
const slotCounts = new Map()
for (const l of logs) {
  const [, m, d] = l.date.split('-')
  const key = `${Number(m)}/${Number(d)} ${l.time.slice(0, 2)}시`
  slotCounts.set(key, (slotCounts.get(key) ?? 0) + 1)
}

// ── SVG 막대 차트 (단일 계열이라 범례 없이 제목으로 설명) ──
const BAR = '#4f46e5' // 앱 brand-600 과 같은 색
const INK = '#0f172a'
const MUTED = '#64748b'
const GRID = '#e2e8f0'
const FONT = "'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif"
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** 아래쪽만 둥글지 않고 끝(데이터 쪽)만 4px 둥근 막대 경로 */
const roundEndBar = (x, y, w, h, horizontal) => {
  const r = Math.min(4, horizontal ? h / 2 : w / 2, horizontal ? w : h)
  if (w <= 0 || h <= 0) return ''
  return horizontal
    ? `M${x},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x} Z`
    : `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`
}

function verticalBars(title, subtitle, entries) {
  const W = 960, H = 480, L = 56, R = 24, T = 88, B = 64
  const max = Math.max(1, ...entries.map(([, v]) => v))
  const step = (W - L - R) / Math.max(1, entries.length)
  const bw = Math.min(48, step - 2)
  const y = (v) => T + (H - T - B) * (1 - v / max)
  const ticks = [0, Math.ceil(max / 2), max]
  let s = ''
  for (const t of ticks) {
    s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${GRID}" stroke-width="1"/>`
    s += `<text x="${L - 10}" y="${y(t) + 4}" text-anchor="end" font-size="13" fill="${MUTED}">${t}</text>`
  }
  entries.forEach(([label, v], i) => {
    const cx = L + step * i + step / 2
    s += `<path d="${roundEndBar(cx - bw / 2, y(v), bw, H - B - y(v), false)}" fill="${BAR}"><title>${esc(label)}: ${v}개</title></path>`
    s += `<text x="${cx}" y="${y(v) - 8}" text-anchor="middle" font-size="13" font-weight="600" fill="${INK}">${v}</text>`
    s += `<text x="${cx}" y="${H - B + 22}" text-anchor="middle" font-size="12" fill="${MUTED}">${esc(label)}</text>`
  })
  return frame(W, H, title, subtitle, s)
}

function horizontalBars(title, subtitle, entries) {
  const W = 960, rowH = 44, L = 140, R = 72, T = 88
  const H = T + rowH * entries.length + 24
  const max = Math.max(1, ...entries.map(([, v]) => v))
  const x = (v) => (W - L - R) * (v / max)
  let s = `<line x1="${L}" x2="${L}" y1="${T - 8}" y2="${H - 24}" stroke="${GRID}" stroke-width="1"/>`
  entries.forEach(([label, v], i) => {
    const top = T + rowH * i
    s += `<text x="${L - 14}" y="${top + rowH / 2 + 5}" text-anchor="end" font-size="15" fill="${INK}">${esc(label)}</text>`
    s += `<path d="${roundEndBar(L, top + 10, x(v), rowH - 20, true)}" fill="${BAR}"><title>${esc(label)}: ${v}개</title></path>`
    s += `<text x="${L + x(v) + 10}" y="${top + rowH / 2 + 5}" font-size="14" font-weight="600" fill="${INK}">${v}</text>`
  })
  return frame(W, H, title, subtitle, s)
}

function frame(W, H, title, subtitle, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">
<rect width="${W}" height="${H}" fill="#ffffff"/>
<text x="24" y="40" font-size="22" font-weight="700" fill="${INK}">${esc(title)}</text>
<text x="24" y="64" font-size="14" fill="${MUTED}">${esc(subtitle)}</text>
${body}
</svg>`
}

const total = logs.length
const timeEntries = [...slotCounts.entries()]
const typeEntries = [...typeCounts.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])

writeFileSync(join(outDir, 'prompts-by-time.svg'), verticalBars('시간대별 프롬프트 수', `총 ${total}개 · 1시간 단위`, timeEntries))
writeFileSync(join(outDir, 'prompts-by-type.svg'), horizontalBars('프롬프트 유형', `총 ${total}개 · 키워드 기준 자동 분류`, typeEntries))

// ── 요약 ──
const first = logs[0], last = logs[logs.length - 1]
const minutes = Math.round((new Date(last.ts) - new Date(first.ts)) / 60000)
const avgChars = Math.round(logs.reduce((a, l) => a + l.chars, 0) / total)
const longest = [...logs].sort((a, b) => b.chars - a.chars).slice(0, 3)

const summary = `# 개발 과정 분석 요약 (자동 생성)

| 항목 | 값 |
|---|---|
| 총 프롬프트 수 | ${total}개 |
| 기간 | ${first.date} ${first.time.slice(0, 5)} ~ ${last.date} ${last.time.slice(0, 5)} (약 ${Math.floor(minutes / 60)}시간 ${minutes % 60}분) |
| 평균 프롬프트 길이 | ${avgChars}자 |

## 유형별
| 유형 | 개수 | 비율 |
|---|---|---|
${typeEntries.map(([t, v]) => `| ${t} | ${v} | ${Math.round((v / total) * 100)}% |`).join('\n')}

## 시간대별
| 시간 | 개수 |
|---|---|
${timeEntries.map(([t, v]) => `| ${t} | ${v} |`).join('\n')}

## 가장 자세했던 프롬프트 (보고서 사례 후보)
${longest.map((l) => `- #${l.no} (${l.chars}자): ${l.prompt.replace(/\s+/g, ' ').slice(0, 120)}${l.chars > 120 ? '…' : ''}`).join('\n')}

![시간대별](prompts-by-time.svg)
![유형별](prompts-by-type.svg)
`
writeFileSync(join(outDir, '요약.md'), summary)
console.log(`분석 완료: 프롬프트 ${total}개 → docs/analysis/ (차트 2개, 요약.md)`)
