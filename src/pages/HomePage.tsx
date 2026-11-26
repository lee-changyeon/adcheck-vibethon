import { ArrowRight, Landmark, Lock, Scale, ScanSearch } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookArt, BubbleArt, ChartArt, DocArt, MagnifierArt, PhoneArt, ShieldArt, Sparkle, TagArt } from '../components/Art'
import { Badge, HeroType, LinkButton, ListRow, Pill } from '../components/ui'
import { VERDICT_COLOR } from '../data/types'
import { useHistory } from '../hooks/useHistory'

/** 히어로 아래 흰 카드의 바로가기 4개 */
const QUICK: { to: string; label: string; art: ReactNode }[] = [
  { to: '/check', label: '점검', art: <MagnifierArt className="size-12" /> },
  { to: '/history', label: '이력', art: <DocArt className="size-12" /> },
  { to: '/stats', label: '통계', art: <ChartArt className="size-12" /> },
  { to: '/guide', label: '가이드', art: <BookArt className="size-12" /> },
]

const STEPS: { title: string; desc: string; art: ReactNode }[] = [
  { title: '글 붙여넣기', desc: '올릴 곳·받은 대가 고르고 붙여넣기', art: <PhoneArt className="h-12" /> },
  { title: '점수·문제 확인', desc: '0~100점과 뒷광고로 보일 표현까지', art: <ShieldArt className="h-11" /> },
  { title: '고친 글 복사', desc: '규칙에 맞게 고친 글 그대로 올리기', art: <TagArt className="w-13" /> },
]

const TRUST: { icon: ReactNode; text: string }[] = [
  { icon: <Lock size={15} />, text: '입력한 글과 기록은 이 휴대폰에만 저장돼요. 회원가입도 없어요.' },
  { icon: <Scale size={15} />, text: '공정위 심사지침을 바탕으로 한 참고용 점검이며, 법률 자문이 아니에요.' },
  { icon: <Landmark size={15} />, text: '정부 기관과 관계없는 개인 개발 앱이에요.' },
]

/** 홈(대문): 큰 히어로로 앱을 소개하고 각 화면으로 들어가는 입구 */
export default function HomePage() {
  const [history] = useHistory()
  const count = history.length
  const last = history[0]

  return (
    <div className="space-y-5">
      {/* 히어로: 민트 그라데이션 + 입체 소품 + 아주 큰 두 색 제목 */}
      <section className="relative -mx-5 -mt-5 overflow-hidden bg-linear-to-b from-brand-100 via-brand-100 to-brand-50 px-5 pt-5 pb-24 text-center">
        <div aria-hidden className="absolute -top-10 left-1/2 size-80 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />

        <PhoneArt className="bob absolute top-24 -left-1 w-[76px] -rotate-12" />
        <TagArt className="bob-slow absolute top-14 -right-2 w-[92px] rotate-12" />
        <BubbleArt className="bob-slow absolute top-[228px] left-3 w-[62px] -rotate-6" />
        <ShieldArt className="bob absolute top-[214px] right-3 w-[66px] rotate-12" />
        <Sparkle className="absolute top-20 left-20 size-4" />
        <Sparkle className="absolute top-6 right-24 size-3" color="brand-sky" />

        <div className="relative flex items-center justify-center gap-1.5">
          <Pill>협찬 글도</Pill>
          <Pill tone="sky">후기 글도</Pill>
          <span className="-ml-1 -translate-y-2 rotate-12 rounded-2xl rounded-bl-sm bg-slate-900 px-2.5 py-1 text-sm font-black text-white shadow-sm">체크!</span>
        </div>

        <h2 className="relative mt-3 text-[92px] leading-[0.98]">
          <HeroType>
            <span className="text-brand-sky">애</span>
            <span className="text-brand-500">드</span>
          </HeroType>
          <br />
          <HeroType className="text-slate-800">체크</HeroType>
        </h2>

        <p className="relative mt-7 text-xl font-medium text-slate-700">올리기 전에 30초면 끝</p>
        <p className="relative mt-1 text-[27px] leading-tight font-black tracking-[-0.03em] text-slate-900">뒷광고 위험 무료 점검</p>

        <LinkButton to="/check" className="relative mt-6 min-h-14 px-9 text-lg">
          <ScanSearch size={22} /> 지금 점검하기
        </LinkButton>
      </section>

      {/* 바로가기 4개 */}
      <nav aria-label="바로가기" className="relative z-[1] -mt-20 grid grid-cols-4 rounded-3xl bg-white px-2 py-5 shadow-sm">
        {QUICK.map((q) => (
          <Link key={q.to} to={q.to} className="flex flex-col items-center gap-2 rounded-2xl py-1 transition active:scale-95 active:opacity-70">
            {q.art}
            <span className="text-[15px] font-bold text-slate-800">{q.label}</span>
          </Link>
        ))}
      </nav>

      {/* 최근 점검 */}
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-black tracking-[-0.02em]">최근 점검</h2>
          {count > 0 && <span className="text-sm font-bold text-slate-500">모두 {count}건</span>}
        </div>
        {last ? (
          <div className="mt-4 flex items-center gap-3">
            <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-full bg-brand-100 text-brand-800">
              <span className="text-xl leading-none font-black">{last.score}</span>
              <span className="text-[10px] font-bold">점</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold text-slate-900">{last.text.trim().split('\n')[0]}</span>
              <span className="mt-1 block">
                <Badge color={VERDICT_COLOR[last.verdict]}>{last.verdict}</Badge>
              </span>
            </span>
            <Link to="/history" className="flex min-h-11 shrink-0 items-center rounded-2xl bg-slate-100 px-4 text-[15px] font-bold text-slate-800 active:opacity-60">
              이력
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <MagnifierArt className="size-14 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-slate-900">아직 점검한 글이 없어요</span>
              <span className="mt-0.5 block text-sm font-bold text-brand-700">예시 글로 30초 체험해 보세요</span>
            </span>
            <Link to="/check" className="flex min-h-11 shrink-0 items-center rounded-2xl bg-slate-100 px-4 text-[15px] font-bold text-slate-800 active:opacity-60">
              체험
            </Link>
          </div>
        )}
      </section>

      {/* 이렇게 써요 */}
      <section className="rounded-3xl bg-white px-5 pt-6 pb-5 shadow-sm">
        <h2 className="text-[26px] font-black tracking-[-0.03em]">이렇게 써요</h2>
        <div className="mt-2">
          {STEPS.map((s, i) => (
            <ListRow key={s.title} thumb={s.art} title={`${i + 1}. ${s.title}`} subtitle={s.desc} tone={i === 1 ? 'sky' : 'brand'} />
          ))}
        </div>
        <LinkButton to="/guide" variant="secondary" className="mt-3 w-full bg-slate-100 font-medium text-slate-600 ring-0">
          꼭 지킬 4가지 전체 보기
        </LinkButton>
      </section>

      {/* 띠 배너 */}
      <Link to="/guide" className="-mx-5 flex items-center gap-3 bg-brand-600 px-6 py-4 text-white active:opacity-80">
        <span className="min-w-0 flex-1 text-[19px] leading-snug font-bold">
          대가 받았다면 <span className="font-black text-brand-sun-light">첫 줄에 #협찬</span>
        </span>
        <BubbleArt label="#협찬" className="w-16 shrink-0" />
        <ArrowRight size={20} className="shrink-0" />
      </Link>

      <section className="space-y-2 px-1 pt-2 pb-2">
        {TRUST.map((t) => (
          <p key={t.text} className="flex gap-2 text-[13px] leading-relaxed text-slate-500">
            <span className="mt-0.5 shrink-0">{t.icon}</span>
            {t.text}
          </p>
        ))}
      </section>
    </div>
  )
}
