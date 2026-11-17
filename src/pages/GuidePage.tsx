import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { Button, Card, SectionTitle } from '../components/ui'

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
    if (confirm('점검 이력과 입력 중인 글을 지우고 샘플 데이터로 되돌릴까요?')) {
      localStorage.clear()
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
              <p className="font-bold">{r.title}</p>
              <p className="text-sm leading-relaxed text-slate-600">{r.desc}</p>
              <p className="flex gap-2 rounded-xl bg-green-50 p-2.5 text-sm text-green-800">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {r.good}
              </p>
              <p className="flex gap-2 rounded-xl bg-red-50 p-2.5 text-sm text-red-800">
                <XCircle size={16} className="mt-0.5 shrink-0" /> {r.bad}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>앱 정보</SectionTitle>
        <Card className="space-y-1 text-sm text-slate-600">
          <p>
            <b className="text-slate-900">애드체크</b> v1.0 · 뒷광고 예방 체크기
          </p>
          <p>이 앱의 점검 결과는 심사지침을 바탕으로 한 참고용이며, 법률 자문이 아니에요.</p>
          <p className="text-slate-400">2026 계명문화대학교 바이브톤 출품작 · SNS마케팅 전공</p>
        </Card>
        <Button variant="secondary" full onClick={reset} className="mt-3">
          <RotateCcw size={16} /> 샘플 데이터로 초기화 (시연 전에 사용)
        </Button>
        <p className="mt-2 text-xs text-slate-400">데이터는 이 휴대폰 브라우저에만 저장돼요.</p>
      </section>
    </div>
  )
}
