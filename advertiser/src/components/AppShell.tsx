import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShieldArt } from './Art'
import ErrorBoundary from './ErrorBoundary'

export type NavItem = { to: string; label: string; icon: LucideIcon }

const todayLabel = () => {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})`
}

/** 휴대폰 화면 크기의 앱 틀: 민트 상단 제목 + 본문 + 둥근 하단 탭 */
export default function AppShell({
  title,
  nav,
  children,
}: {
  title: string
  nav: NavItem[]
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col bg-brand-50">
      <header className="sticky top-0 z-30 flex min-h-14 items-center gap-2.5 bg-brand-100/85 px-5 py-2.5 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${title} 대시보드로`}>
          <ShieldArt className="w-7" />
          <h1 className="text-xl font-black tracking-[-0.03em] text-slate-900">{title}</h1>
        </Link>
        <span className="ml-auto rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-slate-600">{todayLabel()}</span>
      </header>

      <main className="flex-1 px-5 py-5 pb-28">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-10 grid w-full max-w-md -translate-x-1/2 grid-flow-col auto-cols-fr rounded-t-3xl bg-white px-1 shadow-[0_-8px_24px_-12px_rgb(18_53_47/0.2)] pb-[env(safe-area-inset-bottom)]">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-0.5 py-2 text-xs ${isActive ? 'font-extrabold text-slate-950' : 'font-medium text-slate-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${isActive ? 'bg-brand-100 text-brand-700' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
