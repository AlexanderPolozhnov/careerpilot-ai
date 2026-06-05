import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useTranslation } from 'react-i18next'
import { isTelegramWebApp } from '@/lib/telegram'

const routeTitles: Record<string, string> = {
  '/app/dashboard': 'navigation.dashboard',
  '/app/vacancies': 'navigation.vacancies',
  '/app/applications': 'navigation.applications',
  '/app/companies': 'navigation.companies',
  '/app/ai-assistant': 'navigation.aiAssistant',
  '/app/analytics': 'navigation.analytics',
  '/app/settings': 'navigation.settings',
}

export function AppLayout() {
  const location = useLocation()
  const { t } = useTranslation()
  const title = t(routeTitles[location.pathname] ?? 'navigation.workspace')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isTg = isTelegramWebApp()

  return (
    <div className="h-dvh bg-[#08090b] text-white flex overflow-hidden">
      {!isTg && <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />}
      <div className="flex-1 min-w-0 flex flex-col">
        {!isTg && <Topbar title={title} onOpenMenu={() => setIsMobileMenuOpen(true)} />}
        <main className={`flex-1 min-h-0 overflow-y-auto bg-[#08090b] ${isTg ? 'p-4' : 'px-5 py-5 md:px-8 md:py-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
