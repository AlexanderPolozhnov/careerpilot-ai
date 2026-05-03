import {Outlet, useLocation} from 'react-router-dom'
import {Sidebar} from './Sidebar'
import {Topbar} from './Topbar'
import {useTranslation} from 'react-i18next'

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
    const {t} = useTranslation()
    const title = t(routeTitles[location.pathname] ?? 'navigation.workspace')

    return (
        <div className="min-h-dvh bg-bg text-ink flex">
            <Sidebar/>
            <div className="flex-1 min-w-0 flex flex-col">
                <Topbar title={title}/>
                <main className="flex-1 px-5 py-5 md:px-8 md:py-7">
                    <Outlet/>
                </main>
            </div>
        </div>
    )
}