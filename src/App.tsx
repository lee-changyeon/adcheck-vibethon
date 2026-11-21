import { BarChart3, BookOpen, History, House, ScanSearch } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell, { type NavItem } from './components/AppShell'
import CheckPage from './pages/CheckPage'
import GuidePage from './pages/GuidePage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'

/** 통계 화면은 차트 라이브러리가 커서 탭을 열 때 따로 불러온다 (첫 화면을 가볍게) */
const StatsPage = lazy(() => import('./pages/StatsPage'))

// 하단 탭 메뉴. 페이지를 추가하면 여기와 <Routes>에 한 줄씩 추가한다.
const NAV: NavItem[] = [
  { to: '/', label: '홈', icon: House },
  { to: '/check', label: '점검', icon: ScanSearch },
  { to: '/history', label: '이력', icon: History },
  { to: '/stats', label: '통계', icon: BarChart3 },
  { to: '/guide', label: '가이드', icon: BookOpen },
]

export default function App() {
  return (
    <AppShell title="애드체크" nav={NAV}>
      <Suspense fallback={<p className="py-16 text-center text-sm text-slate-400">불러오는 중…</p>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/check" element={<CheckPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
