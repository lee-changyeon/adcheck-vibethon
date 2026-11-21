import { CheckCircle2, ChevronRight, ExternalLink, Trash2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, SectionTitle } from '../components/ui'
import { APP_INFO, STORAGE_PREFIX } from '../data/app'

const RULES: { title: string; desc: string; good: string; bad: string }[] = [
  {
    title: '① 대가를 받았다면 반드시 표시',
    desc: '현금(원고료)뿐 아니라 무료 제품·서비스, 할인, 쿠폰도 모두 대가예요.',
    good: '[협찬] 베이글하우스로부터 제품을 무상으로 제공받아 작성한 글입니다.',
    bad: '아무 표시 없이 "우연히 찾은 맛집!"',
  },
  {
    title: '② 누구나 아는 한글로',
    desc: '광고, 협찬, 유료 광고 포함, 제품을 제공받아 작성 처럼 바로 알 수 있는 말을 써요.',
    good: '광고 · 협찬 · 유료 광고 포함',
    bad: 'thanks to · with ○○ · #ad · #sponsored',
  },
  {
    title: '③ 첫 부분에, 눈에 띄게',
    desc: "'더보기'를 누르지 않아도 보이는 곳에 적어요. 블로그는 제목이나 본문 첫 부분, 유튜브는 제목과 영상 시작·끝.",
    good: '첫 줄에 [협찬] 표시',
    bad: '글 맨 끝, 댓글, 해시태그 30개 사이',
  },
  {
    title: '④ 거짓 표현 금지',
    desc: '대가를 받은 글에 "내돈내산", "협찬 아님"을 쓰면 소비자를 속이는 광고가 돼요.',
    good: '받은 대가를 솔직하게 밝히기',
    bad: '#내돈내산 #광고아님',
  },
]

/** 기능 ④: 표시 규칙 가이드 + 앱 정보 */
export default function GuidePage() {
  const reset = () => {
    if (confirm('점검 이력과 입력 중인 글을 모두 지울까요? 지운 기록은 되돌릴 수 없어요.')) {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(STORAGE_PREFIX))
          .forEach((k) => localStorage.removeItem(k))
      } catch {
        /* 저장소를 쓸 수 없는 환경이면 지울 것도 없다 */
      }
      location.assign('/')
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>뒷광고란?</SectionTitle>
        <Card className="text-sm leading-relaxed text-slate-600">
          업체에서 돈이나 제품을 받고 쓴 글인데, 광고라는 사실을 숨기고 <b className="text-slate-900">내돈내산 후기처럼</b> 올리는 것이에요.
          보는 사람은 순수한 후기로 믿기 때문에 소비자를 속이게 돼요. 공정거래위원회는 「추천·보증 등에 관한 표시·광고 심사지침」으로
          표시 방법을 정해 두었어요.
        </Card>
      </section>

      <section>
        <SectionTitle>꼭 지킬 4가지</SectionTitle>
        <div className="space-y-3">
          {RULES.map((r) => (
            <Card key={r.title} className="space-y-2">
              <p className="font-semibold text-slate-950">{r.title}</p>
              <p className="text-sm leading-relaxed text-slate-600">{r.desc}</p>
              <p className="flex gap-2 bg-white p-3 text-sm text-green-800 shadow-[inset_2px_0_0_var(--color-green-700)]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {r.good}
              </p>
              <p className="flex gap-2 bg-white p-3 text-sm text-red-800 shadow-[inset_2px_0_0_var(--color-red-600)]">
                <XCircle size={16} className="mt-0.5 shrink-0" /> {r.bad}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>점검 기준 출처</SectionTitle>
        <Card className="space-y-2 text-sm leading-relaxed text-slate-600">
          <p>
            점검 규칙은 공정거래위원회 고시 「추천·보증 등에 관한 표시·광고 심사지침」의 표시 방법을 요약해 만들었어요.
          </p>
          <a
            href={APP_INFO.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-1.5 font-semibold text-slate-900 underline underline-offset-2"
          >
            국가법령정보센터에서 원문 보기 <ExternalLink size={15} />
          </a>
          <p className="text-slate-500">
            {APP_INFO.name}는 공정거래위원회 등 정부 기관과 관계없는 개인 개발 앱이며, 정부를 대표하지 않아요.
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle>앱 정보</SectionTitle>
        <Card className="space-y-1 text-sm text-slate-600">
          <p>
            <b className="text-slate-900">{APP_INFO.name}</b> v{APP_INFO.version} · 뒷광고 예방 체크기
          </p>
          <p>이 앱의 점검 결과는 심사지침을 바탕으로 한 참고용이며, 법률 자문이 아니에요.</p>
          <p>
            문의:{' '}
            {APP_INFO.contactEmail ? (
              <a className="font-semibold text-slate-900 underline" href={`mailto:${APP_INFO.contactEmail}`}>
                {APP_INFO.contactEmail}
              </a>
            ) : (
              '준비 중'
            )}
          </p>
          <p className="text-slate-500">계명문화대학교 SNS마케팅 전공 · 2026 바이브톤에서 처음 만들었어요</p>
        </Card>
        <Link
          to="/privacy"
          className="mt-3 flex min-h-14 items-center justify-between border-y border-slate-300 text-base font-medium text-slate-950 active:opacity-50"
        >
          개인정보 처리방침 <ChevronRight size={18} className="text-slate-950" />
        </Link>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          입력한 글과 점검 기록은 이 휴대폰 안에만 저장되고 어디로도 보내지 않아요.
        </p>
        <Button variant="ghost" full onClick={reset} className="mt-2 text-red-600">
          <Trash2 size={16} /> 모든 기록 지우기
        </Button>
      </section>
    </div>
  )
}
