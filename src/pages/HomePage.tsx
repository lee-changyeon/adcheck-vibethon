import { BarChart3, BookOpen, ClipboardPaste, Copy, Gauge, History, Landmark, Lock, Scale, ScanSearch } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MenuCard, SectionTitle } from '../components/ui'
import { useHistory } from '../hooks/useHistory'

const STEPS: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <ClipboardPaste size={20} />, title: '글 붙여넣기', desc: '올릴 곳과 받은 대가를 고르고 협찬 글을 그대로 붙여넣어요' },
  { icon: <Gauge size={20} />, title: '점수·문제 확인', desc: '0~100점 점수와 뒷광고로 보일 수 있는 표현을 알려 드려요' },
  { icon: <Copy size={20} />, title: '고친 글 복사', desc: '규칙에 맞게 고친 글을 복사해서 그대로 올리면 끝' },
]

const TRUST: { icon: ReactNode; text: string }[] = [
  { icon: <Lock size={16} />, text: '입력한 글과 기록은 이 휴대폰에만 저장돼요. 회원가입도 없어요.' },
  { icon: <Scale size={16} />, text: '공정위 심사지침을 바탕으로 한 참고용 점검이며, 법률 자문이 아니에요.' },
  { icon: <Landmark size={16} />, text: '정부 기관과 관계없는 개인 개발 앱이에요.' },
]

/** 홈(대문): 이 앱이 무엇인지 소개하고 각 화면으로 들어가는 입구 */
export default function HomePage() {
  const [history] = useHistory()
  const count = history.length
  const last = history[0]

  return (
    <div className="space-y-10">
      <section className="-mx-5 -mt-5 bg-slate-950 px-5 pt-8 pb-6 text-white">
        <img src="/icon.svg" alt="" className="size-12" />
        <h2 className="mt-6 text-[44px] leading-[0.95] font-black tracking-[-0.02em]">
          올리기 전에 30초,
          <br />
          <span className="underline decoration-4 underline-offset-[6px]">뒷광고</span> 점검
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-white/70">
          협찬 글을 붙여넣으면 공정거래위원회 광고 표시 기준으로 뒷광고 위험을 찾고, 고친 글까지 만들어 드려요. 인플루언서·블로거·유튜버를 위한 점검 앱이에요.
        </p>
        <Link
          to="/check"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-base font-medium text-slate-950 transition active:scale-[0.97] active:opacity-50"
        >
          <ScanSearch size={20} /> 지금 점검하기
        </Link>
      </section>

      <section>
        <SectionTitle>이렇게 써요</SectionTitle>
        <ol className="border-t border-slate-300">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 border-b border-slate-300 py-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-950">{s.icon}</span>
              <span className="min-w-0">
                <span className="block font-semibold text-slate-950">
                  {i + 1}. {s.title}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-slate-500">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>메뉴</SectionTitle>
        <div className="border-t border-slate-300">
          <MenuCard to="/check" icon={<ScanSearch size={22} />} title="점검" description="협찬 글의 광고 표시를 점검하고 고친 글 받기" />
          <MenuCard
            to="/history"
            icon={<History size={22} />}
            title="이력"
            meta={count > 0 ? `${count}건` : undefined}
            description={last ? `최근: ${last.score}점 · ${last.verdict}` : '점검한 글과 결과를 다시 보기'}
          />
          <MenuCard to="/stats" icon={<BarChart3 size={22} />} title="통계" description="내가 자주 틀리는 항목과 다음에 지킬 한 가지" />
          <MenuCard to="/guide" icon={<BookOpen size={22} />} title="가이드" description="뒷광고란? 꼭 지킬 4가지와 원문 출처" />
        </div>
      </section>

      <section className="space-y-2 pb-2">
        {TRUST.map((t) => (
          <p key={t.text} className="flex gap-2 text-sm leading-relaxed text-slate-500">
            <span className="mt-0.5 shrink-0">{t.icon}</span>
            {t.text}
          </p>
        ))}
      </section>
    </div>
  )
}
