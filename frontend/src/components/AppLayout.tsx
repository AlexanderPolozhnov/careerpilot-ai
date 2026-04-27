import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const routeTitles: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/vacancies': 'Vacancies',
  '/app/applications': 'Applications',
  '/app/companies': 'Companies',
  '/app/ai-assistant': 'AI Assistant',
  '/app/analytics': 'Analytics',
  '/app/settings': 'Settings',
}

export function AppLayout() {
  const location = useLocation()
  const title = routeTitles[location.pathname] ?? 'Workspace'

  return (
    <div className="min-h-dvh bg-bg text-ink flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar title={title} />
        <main className="flex-1 px-5 py-5 md:px-8 md:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
