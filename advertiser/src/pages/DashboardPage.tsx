import { ChevronRight, ClipboardList, PartyPopper } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CampaignSwitcher, StatusBadge, VerdictBadge } from '../components/BizParts'
import { ShieldArt } from '../components/Art'
import { Card, EmptyState, HeroType, PageHero, Pill, SectionTitle } from '../components/ui'
import { evaluate, needsAction, PAID_REWARD_LABEL } from '../data/biz'
import { PLATFORM_LABEL, type Verdict } from '../data/types'
import { useBiz } from '../hooks/useBiz'

/* recharts는 CSS 변수를 못 읽어서 index.css @theme 값을 그대로 옮겨 둔다 */
const VERDICT_FILL: Record<Verdict, string> = { 적합: '#0a7444', '보완 필요': '#d97706', '위반 위험': '#d62828' } // green-700 · amber-600 · red-600
const INK = '#191d1d' // slate-900
const INK_MUTED = '#6b7474' // slate-500
const GRID = '#e3e8e8' // slate-200

/** 기능 ④: 캠페인 대시보드 */
export default function DashboardPage() {
  const { campaigns, current, currentPosts, setCurrentId } = useBiz()
  const navigate = useNavigate()

  if (!current) {
    return <EmptyState icon={<ClipboardList size={40} />} title="캠페인이 없어요" description="캠페인 탭에서 체험단·협찬 캠페인을 먼저 등록해 주세요" />
  }

  const rows = currentPosts.map((p) => ({ post: p, result: evaluate(p, current) }))
  const total = rows.length
  const passed = rows.filter((r) => r.result.verdict === '적합').length
  const todo = rows.filter((r) => needsAction(r.result, r.post.status))
  const rate = total ? Math.round((passed / total) * 100) : 0

  const verdicts: Verdict[] = ['위반 위험', '보완 필요', '적합']
  const chart = verdicts.map((v) => ({ name: v, 게시물: rows.filter((r) => r.result.verdict === v).length }))

  return (
    <div className="space-y-6">
      <PageHero
        pills={
          <>
            <Pill>광고주용</Pill>
            <Pill tone="sky">캠페인 검수</Pill>
          </>
        }
        title={
          <>
            <HeroType>
              <span className="text-brand-sky">캠페인</span> <span className="text-brand-500">검수</span>
            </HeroType>
            <br />
            <HeroType>한눈에</HeroType>
          </>
        }
        art={<ShieldArt className="rotate-12" />}
      />

      <Card className="relative -mt-14 space-y-2">
        <CampaignSwitcher campaigns={campaigns} value={current.id} onChange={setCurrentId} />
        <p className="px-1 text-xs font-bold text-brand-700">제공한 대가: {PAID_REWARD_LABEL[current.reward]}</p>
      </Card>

      <section className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-xs text-slate-500">게시물</p>
          <p className="mt-1 text-3xl font-black">{total}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">준수율</p>
          <p className="mt-1 text-3xl font-black text-brand-700">{rate}%</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-slate-500">조치 필요</p>
          <p className={`mt-1 text-3xl font-black ${todo.length ? 'text-red-600' : ''}`}>{todo.length}</p>
        </Card>
      </section>

      {total === 0 ? (
        <EmptyState icon={<ClipboardList size={40} />} title="아직 등록된 게시물이 없어요" description="게시물 탭에서 인플루언서 게시물을 붙여넣어 검수해 보세요" />
      ) : (
        <>
          <section>
            <SectionTitle>판정별 게시물 수</SectionTitle>
            <Card className="px-2 py-4">
              <div style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 8 }} barCategoryGap={10}>
                    <CartesianGrid horizontal={false} stroke={GRID} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: INK_MUTED }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 13, fill: INK }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v}개`, '게시물']} contentStyle={{ borderRadius: 12, border: `1px solid ${GRID}`, fontSize: 13 }} />
                    <Bar dataKey="게시물" animationDuration={500} radius={[0, 8, 8, 0]} label={{ position: 'right', fontSize: 12, fill: INK, formatter: (v: unknown) => `${v}개` }}>
                      {chart.map((d) => (
                        <Cell key={d.name} fill={VERDICT_FILL[d.name as Verdict]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section>
            <SectionTitle>조치가 필요한 게시물</SectionTitle>
            {todo.length === 0 ? (
              <Card className="flex items-center gap-3 text-sm text-slate-600">
                <PartyPopper size={22} className="text-brand-600" /> 모든 게시물이 규칙을 지키고 있어요.
              </Card>
            ) : (
              <div className="space-y-2">
                {todo.map(({ post, result }) => (
                  <Card key={post.id} onClick={() => navigate('/posts', { state: { openId: post.id } })} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold">{post.influencer}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {PLATFORM_LABEL[post.platform]} · {result.issues[0]?.title}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <VerdictBadge verdict={result.verdict} />
                      <StatusBadge status={post.status} />
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
