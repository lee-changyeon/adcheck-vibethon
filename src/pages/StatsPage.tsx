import { BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, EmptyState, SectionTitle } from '../components/ui'
import { ISSUE_SHORT, type IssueCode } from '../data/types'
import { useHistory } from '../hooks/useHistory'

const BRAND = '#4f46e5' // brand-600
const MUTED_BAR = '#c7d2fe' // brand-200 느낌의 연한 색
const INK_MUTED = '#64748b' // slate-500
const GRID = '#e2e8f0' // slate-200

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

  if (history.length === 0) {
    return <EmptyState icon={<BarChart3 size={40} />} title="통계를 낼 점검 기록이 없어요" description="점검 탭에서 글을 점검하면 통계가 쌓여요" />
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
      <section className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-xs text-slate-500">점검한 글</p>
          <p className="mt-1 text-2xl font-bold">{total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">평균 점수</p>
          <p className="mt-1 text-2xl font-bold text-brand-600">{avg}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">통과율</p>
          <p className="mt-1 text-2xl font-bold">{Math.round((passed / total) * 100)}%</p>
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
                  <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 13, fill: '#0f172a' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                    formatter={(value) => [`${value}회`, '틀린 횟수']}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${GRID}`, fontSize: 13 }}
                  />
                  <Bar dataKey="횟수" animationDuration={500} radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 12, fill: '#0f172a', formatter: (v: unknown) => `${v}회` }}>
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
          <Card className="bg-brand-50 ring-brand-100">
            <p className="text-sm text-brand-700">
              가장 많이 틀린 항목은 <b>'{top.name}'</b> ({top.횟수}회)
            </p>
            <p className="mt-1 font-semibold">{TIPS[top.code]}</p>
          </Card>
        </section>
      )}
    </div>
  )
}
