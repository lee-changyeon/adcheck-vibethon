import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { APP_INFO } from '../data/app'

function Item({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-1">
      <h3 className="font-semibold text-slate-950">
        {n}. {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

/** 개인정보 처리방침 (스토어 등록용 URL: /privacy) */
export default function PrivacyPage() {
  const navigate = useNavigate()
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/guide'))

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={goBack} className="-ml-3">
        <ArrowLeft size={18} /> 돌아가기
      </Button>

      <div>
        <h2 className="text-2xl font-bold text-slate-950">개인정보 처리방침</h2>
        <p className="mt-1 text-sm text-slate-500">시행일: {APP_INFO.privacyEffectiveDate}</p>
      </div>

      <Card className="space-y-5">
        <Item n={1} title="수집하는 개인정보: 없음">
          {APP_INFO.name}는 회원가입·로그인이 없으며, 이름·연락처·위치·기기 식별자 등 어떤 개인정보도 수집하지 않습니다.
        </Item>
        <Item n={2} title="입력한 글과 점검 기록의 저장 위치">
          점검하려고 입력한 글, 업체·브랜드 이름, 점검 결과와 이력은 <b className="text-slate-900">사용자의 휴대폰(브라우저 저장소) 안에만 저장</b>되며,
          개발자나 다른 서버로 전송되지 않습니다. 점검은 휴대폰 안에서 계산됩니다.
        </Item>
        <Item n={3} title="삭제 방법">
          [가이드] 탭의 [모든 기록 지우기]를 누르거나, 앱을 삭제하거나 브라우저의 사이트 데이터를 지우면 모든 기록이 삭제됩니다. 개발자는 이
          기록에 접근할 수 없으므로 대신 삭제해 드릴 수 없습니다.
        </Item>
        <Item n={4} title="제3자 제공·처리 위탁: 없음">
          광고, 분석 도구, 외부 API를 사용하지 않으며 어떤 정보도 제3자에게 제공하지 않습니다.
        </Item>
        <Item n={5} title="앱 파일 전송 과정의 접속 기록">
          앱 화면 파일은 호스팅 업체(Vercel)를 통해 전달되며, 이 과정에서 호스팅 업체가 접속 IP·시간 등 일반적인 접속 기록을 보안·운영 목적으로
          처리할 수 있습니다. 한 번 받은 앱 파일은 휴대폰에 저장되어 이후에는 인터넷 없이도 쓸 수 있습니다.
        </Item>
        <Item n={6} title="클립보드">
          [고친 글 복사]를 누를 때만 클립보드에 글을 넣으며, 클립보드 내용을 읽지 않습니다.
        </Item>
        <Item n={7} title="아동의 개인정보">
          만 14세 미만 아동의 개인정보도 수집하지 않습니다.
        </Item>
        <Item n={8} title="안내">
          점검 결과는 공정거래위원회 「추천·보증 등에 관한 표시·광고 심사지침」을 바탕으로 한 참고용이며 법률 자문이 아닙니다. {APP_INFO.name}는
          공정거래위원회 등 정부 기관과 관계없는 개인 개발 앱입니다.
        </Item>
        <Item n={9} title="문의">
          {APP_INFO.contactEmail ? (
            <a className="font-semibold text-slate-900 underline" href={`mailto:${APP_INFO.contactEmail}`}>
              {APP_INFO.contactEmail}
            </a>
          ) : (
            '연락처 이메일 준비 중'
          )}
        </Item>
        <Item n={10} title="방침의 변경">
          이 방침이 바뀌면 앱 안의 이 화면에서 시행일과 함께 알립니다.
        </Item>
      </Card>
    </div>
  )
}
