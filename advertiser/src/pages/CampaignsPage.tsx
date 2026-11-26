import { Check, Megaphone, Plus, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TagArt } from '../components/Art'
import { Button, Card, ChoiceChips, EmptyState, HeroType, Input, PageHero, Pill, SectionTitle } from '../components/ui'
import { evaluate, newId, PAID_REWARD_LABEL, type PaidReward } from '../data/biz'
import { useBiz } from '../hooks/useBiz'
import { COLLAB_KEYS } from '../hooks/useCollab'

const REWARDS = (Object.keys(PAID_REWARD_LABEL) as PaidReward[]).map((r) => ({ value: r, label: PAID_REWARD_LABEL[r] }))

/** 기능 ①: 캠페인 등록·선택 + 앱 정보 */
export default function CampaignsPage() {
  const { campaigns, setCampaigns, posts, current, setCurrentId } = useBiz()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [reward, setReward] = useState<PaidReward>('product')

  const add = () => {
    const c = { id: newId(), name: name.trim(), brand: brand.trim(), reward, createdAt: new Date().toISOString() }
    setCampaigns((cs) => [c, ...cs])
    setCurrentId(c.id)
    setName('')
    setBrand('')
    navigate('/posts')
  }

  const reset = () => {
    if (confirm('등록한 캠페인·게시물·크리에이터·행사를 지우고 샘플 데이터로 되돌릴까요?')) {
      for (const k of ['adcheckbiz.campaigns', 'adcheckbiz.posts', 'adcheckbiz.current', ...COLLAB_KEYS]) localStorage.removeItem(k)
      location.assign('/')
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        pills={
          <>
            <Pill>체험단·협찬</Pill>
          </>
        }
        title={
          <>
            <HeroType>
              <span className="text-brand-sky">캠페인</span>
            </HeroType>
            <br />
            <HeroType><span className="text-brand-500">관리</span></HeroType>
          </>
        }
        art={<TagArt label="#광고" className="w-28 rotate-12" />}
      />
      <section>
        <SectionTitle>캠페인 목록</SectionTitle>
        {campaigns.length === 0 ? (
          <EmptyState icon={<Megaphone size={40} />} title="등록된 캠페인이 없어요" description="아래에서 첫 캠페인을 만들어 보세요" />
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const ps = posts.filter((p) => p.campaignId === c.id)
              const ok = ps.filter((p) => evaluate(p, c).verdict === '적합').length
              const selected = current?.id === c.id
              return (
                <Card
                  key={c.id}
                  onClick={() => {
                    setCurrentId(c.id)
                    navigate('/')
                  }}
                  className={`flex items-center gap-3 ${selected ? 'ring-2 ring-inset ring-brand-600' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{c.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {c.brand} · {PAID_REWARD_LABEL[c.reward]} · 게시물 {ps.length}개 · 준수율 {ps.length ? Math.round((ok / ps.length) * 100) : 0}%
                    </p>
                  </div>
                  {selected && <Check size={20} className="text-brand-600" />}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>새 캠페인</SectionTitle>
        <Card className="space-y-4">
          <Input label="캠페인 이름" placeholder="예: 겨울 신메뉴 체험단" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="브랜드·가게 이름" placeholder="예: 베이글하우스" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <div>
            <p className="mb-1.5 text-sm font-medium text-slate-600">인플루언서에게 제공한 대가</p>
            <ChoiceChips options={REWARDS} value={reward} onChange={setReward} />
          </div>
          <Button full disabled={!name.trim() || !brand.trim()} onClick={add}>
            <Plus size={18} /> 캠페인 만들기
          </Button>
        </Card>
      </section>

      <section>
        <SectionTitle>앱 정보</SectionTitle>
        <Card className="space-y-1 text-sm text-slate-600">
          <p>
            <b className="text-slate-900">애드체크 비즈</b> v1.0 · 광고주용 뒷광고 검수
          </p>
          <p>인플루언서 게시물의 광고 표시를 공정위 「추천·보증 등에 관한 표시·광고 심사지침」 기준으로 검수해요. 결과는 참고용이며 법률 자문이 아니에요.</p>
          <p>글을 쓰는 인플루언서는 크리에이터용 <b className="text-slate-900">애드체크</b>로 올리기 전에 점검할 수 있어요.</p>
          <p className="text-slate-400">2026 계명문화대학교 바이브톤 출품작 · SNS마케팅 전공</p>
        </Card>
        <Button variant="secondary" full onClick={reset} className="mt-3">
          <RotateCcw size={16} /> 샘플 데이터로 초기화 (시연 전에 사용)
        </Button>
        <p className="mt-2 text-xs text-slate-400">데이터는 이 기기 브라우저에만 저장돼요.</p>
      </section>
    </div>
  )
}
