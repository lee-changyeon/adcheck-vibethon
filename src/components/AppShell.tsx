import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
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
    <div className="mx-auto flex min-h-svh max-w-md flex-col bg-slate-50 shadow-xl">
      <header className="sticky top-0 z-10 flex items-center gap-2.5 border-b border-slate-200 bg-white/90 px-5 py-3.5 backdrop-blur">
        <img src="/icon.svg" alt="" className="size-8 rounded-lg" />
        <h1 className="text-lg font-bold">{title}</h1>
        <span className="ml-auto text-sm font-medium text-slate-400">{todayLabel()}</span>
      </header>

      <main className="flex-1 px-5 py-5 pb-28">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-10 grid w-full max-w-md -translate-x-1/2 grid-flow-col auto-cols-fr border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                isActive ? 'text-brand-600' : 'text-slate-400'
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
