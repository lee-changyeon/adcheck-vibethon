import { LayoutDashboard, ListChecks, Megaphone, ScanLine } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import AppShell, { type NavItem } from './components/AppShell'
import CampaignsPage from './pages/CampaignsPage'
import DashboardPage from './pages/DashboardPage'
import PostsPage from './pages/PostsPage'
import ScanPage from './pages/ScanPage'

// 하단 탭 메뉴. 페이지를 추가하면 여기와 <Routes>에 한 줄씩 추가한다.
const NAV: NavItem[] = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/posts', label: '게시물', icon: ListChecks },
  { to: '/scan', label: '화면 스캔', icon: ScanLine },
  { to: '/campaigns', label: '캠페인', icon: Megaphone },
]

export default function App() {
  return (
    <AppShell title="애드체크 비즈" nav={NAV}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
      </Routes>
    </AppShell>
  )
}
