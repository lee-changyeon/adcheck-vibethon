import { ScanSearch } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartArt } from '../components/Art'
import { Card, EmptyState, HeroType, LinkButton, PageHero, Pill, SectionTitle } from '../components/ui'
import { ISSUE_SHORT, type IssueCode } from '../data/types'
import { useHistory } from '../hooks/useHistory'

/* recharts는 CSS 변수를 못 읽어서 index.css @theme 값을 그대로 옮겨 둔다 */
const BRAND = '#008a78' // brand-600: 가장 많이 틀린 항목만 진하게
const MUTED_BAR = '#bfe6de' // brand-200: 나머지 막대
const INK = '#191d1d' // slate-900: 항목 이름
const INK_MUTED = '#6b7474' // slate-500: 보조 글자색
const GRID = '#e3e8e8' // slate-200: 연한 선

const TIPS: Record<IssueCode, string> = {
  NO_DISCLOSURE: '대가를 받았다면 "광고"나 "협찬"을 꼭 적으세요.',
  FALSE_CLAIM: '협찬 글에는 "내돈내산"을 절대 쓰지 마세요.',
  LATE_POSITION: '표시는 글 맨 끝이 아니라 첫 줄에 넣으세요.',
  VAGUE_WORD: '"thanks to", "#ad" 대신 한글 "협찬"으로 쓰세요.',
  BURIED_HASHTAG: '#협찬을 해시태그 사이에 숨기지 말고 문장으로 쓰세요.',
  NOT_SPECIFIC: '"제품을 무상으로 제공받아"처럼 받은 것을 밝히세요.',
}

/** 기능 ③: 점검 통계 — "내가 가장 자주 틀리는 항목" */
export default function StatsPage() {
  const [history] = useHistory()

  const hero = (
    <PageHero
      pills={<Pill tone="sky">자주 틀리는 항목</Pill>}
      title={
        <>
          <HeroType>
            <span className="text-brand-sky">나의</span>
          </HeroType>
          <br />
          <HeroType>
            <span className="text-brand-500">점검</span> 통계
          </HeroType>
        </>
      }
      art={<ChartArt className="rotate-6" />}
    />
  )

  if (history.length === 0) {
    return (
      <div>
        {hero}
        <EmptyState
          icon={<ChartArt className="w-20" />}
          title="통계를 낼 점검 기록이 없어요"
          description="점검 탭에서 글을 점검하면 통계가 쌓여요"
          action={
            <LinkButton to="/check">
              <ScanSearch size={18} /> 점검하러 가기
            </LinkButton>
          }
        />
      </div>
    )
  }

  const total = history.length
  const passed = history.filter((r) => r.verdict === '적합').length
  const avg = Math.round(history.reduce((a, r) => a + r.score, 0) / total)

  const counts = (Object.keys(ISSUE_SHORT) as IssueCode[])
    .map((code) => ({ code, name: ISSUE_SHORT[code], 횟수: history.filter((r) => r.issueCodes.includes(code)).length }))
    .filter((d) => d.횟수 > 0)
    .sort((a, b) => b.횟수 - a.횟수)
  const top = counts[0]

  return (
    <div className="space-y-6">
      {hero}
      <section className="relative -mt-12 grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-xs text-slate-500">점검한 글</p>
          <p className="mt-1 text-3xl font-bold">{total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">평균 점수</p>
          <p className="mt-1 text-3xl font-bold">{avg}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">통과율</p>
          <p className="mt-1 text-3xl font-bold">{Math.round((passed / total) * 100)}%</p>
        </Card>
      </section>

      <section>
        <SectionTitle>내가 자주 틀리는 항목</SectionTitle>
        {counts.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-slate-500">모든 글이 규칙을 지켰어요 👏</p>
          </Card>
        ) : (
          <Card className="px-2 py-4">
            <div style={{ height: Math.max(140, counts.length * 48) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counts} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 8 }} barCategoryGap={12}>
                  <CartesianGrid horizontal={false} stroke={GRID} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: INK_MUTED }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 13, fill: INK, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,138,120,0.06)' }}
                    formatter={(value) => [`${value}회`, '틀린 횟수']}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${MUTED_BAR}`, fontSize: 13 }}
                  />
                  <Bar dataKey="횟수" animationDuration={500} radius={[0, 8, 8, 0]} label={{ position: 'right', fontSize: 12, fill: BRAND, formatter: (v: unknown) => `${v}회` }}>
                    {counts.map((d, i) => (
                      <Cell key={d.code} fill={i === 0 ? BRAND : MUTED_BAR} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </section>

      {top && (
        <section>
          <SectionTitle>다음 글에서 이것만 지키세요</SectionTitle>
          <div className="rounded-2xl bg-brand-700 p-5 text-white shadow-sm">
            <p className="text-sm text-white/80">
              가장 많이 틀린 항목은 <b>'{top.name}'</b> ({top.횟수}회)
            </p>
            <p className="mt-2 text-xl font-extrabold leading-snug">{TIPS[top.code]}</p>
          </div>
        </section>
      )}
    </div>
  )
}
