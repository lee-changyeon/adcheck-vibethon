import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'

export type NavItem = { to: string; label: string; icon: LucideIcon }

const todayLabel = () => {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${'일월화수목금토'[d.getDay()]})`
}

/** 휴대폰 화면 크기의 앱 틀: 상단 제목 + 본문 + 하단 탭 */
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
    <div className="mx-auto flex min-h-svh max-w-md flex-col bg-white">
      <header className="sticky top-0 z-10 flex min-h-14 items-center gap-2.5 bg-white px-5 py-2.5 shadow-[inset_0_-1px_0_var(--color-slate-200)]">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${title} 홈으로`}>
          <img src="/icon.svg" alt="" className="size-8 rounded-lg" />
          <h1 className="text-xl font-bold text-slate-950">{title}</h1>
        </Link>
        <span className="ml-auto text-sm font-medium text-slate-500">{todayLabel()}</span>
      </header>

      <main className="flex-1 px-5 py-5 pb-28">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-10 grid w-full max-w-md -translate-x-1/2 grid-flow-col auto-cols-fr bg-white shadow-[inset_0_1px_0_var(--color-slate-200)] pb-[env(safe-area-inset-bottom)]">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-xs ${
                isActive ? 'font-bold text-brand-600 shadow-[inset_0_2px_0_var(--color-brand-600)]' : 'font-medium text-slate-500'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
