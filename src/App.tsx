import { BarChart3, BookOpen, History, ScanSearch } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import AppShell, { type NavItem } from './components/AppShell'
import CheckPage from './pages/CheckPage'
import GuidePage from './pages/GuidePage'
import HistoryPage from './pages/HistoryPage'
import StatsPage from './pages/StatsPage'

// 하단 탭 메뉴. 페이지를 추가하면 여기와 <Routes>에 한 줄씩 추가한다.
const NAV: NavItem[] = [
  { to: '/', label: '점검', icon: ScanSearch },
  { to: '/history', label: '이력', icon: History },
  { to: '/stats', label: '통계', icon: BarChart3 },
  { to: '/guide', label: '가이드', icon: BookOpen },
]

export default function App() {
  return (
    <AppShell title="애드체크" nav={NAV}>
      <Routes>
        <Route path="/" element={<CheckPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </AppShell>
  )
}
