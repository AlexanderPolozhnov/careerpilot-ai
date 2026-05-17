import { NavLink, useLocation } from 'react-router-dom'
import { LayoutGrid, Briefcase, FileText, Building2, Sparkles, BarChart3, Settings, Lightbulb, Command, Calendar, CheckSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const navItems = [
    { label: t('navigation.dashboard'), to: '/app/dashboard', icon: LayoutGrid },
    { label: t('navigation.vacancies'), to: '/app/vacancies', icon: Briefcase },
    { label: t('navigation.applications'), to: '/app/applications', icon: FileText },
    { label: t('navigation.tasks'), to: '/app/tasks', icon: CheckSquare },
    { label: t('navigation.interviews'), to: '/app/interviews', icon: Calendar },
    { label: t('navigation.companies'), to: '/app/companies', icon: Building2 },
    { label: t('navigation.aiAssistant'), to: '/app/ai-assistant', icon: Sparkles },
    { label: t('navigation.analytics'), to: '/app/analytics', icon: BarChart3 },
    { label: t('navigation.settings'), to: '/app/settings', icon: Settings },
  ]

  const tipsByRoute: Record<string, string[]> = {
    '/app/dashboard': [
      'navigation.tips.dashboard.0',
      'navigation.tips.dashboard.1',
      'navigation.tips.dashboard.2',
    ],
    '/app/vacancies': [
      'navigation.tips.vacancies.0',
      'navigation.tips.vacancies.1',
      'navigation.tips.vacancies.2',
    ],
    '/app/applications': [
      'navigation.tips.applications.0',
      'navigation.tips.applications.1',
      'navigation.tips.applications.2',
    ],
    '/app/tasks': [
      'navigation.tips.tasks.0',
      'navigation.tips.tasks.1',
      'navigation.tips.tasks.2',
    ],
    '/app/interviews': [
      'navigation.tips.interviews.0',
      'navigation.tips.interviews.1',
      'navigation.tips.interviews.2',
    ],
    '/app/companies': [
      'navigation.tips.companies.0',
      'navigation.tips.companies.1',
      'navigation.tips.companies.2',
    ],
    '/app/ai-assistant': [
      'navigation.tips.aiAssistant.0',
      'navigation.tips.aiAssistant.1',
      'navigation.tips.aiAssistant.2',
    ],
    '/app/analytics': [
      'navigation.tips.analytics.0',
      'navigation.tips.analytics.1',
      'navigation.tips.analytics.2',
    ],
    '/app/settings': [
      'navigation.tips.settings.0',
      'navigation.tips.settings.1',
      'navigation.tips.settings.2',
    ],
  }

  const currentTips = tipsByRoute[pathname] ?? tipsByRoute['/app/dashboard']
  const currentTipKey = currentTips[pathname.length % currentTips.length]

  return (
    <aside className="w-[260px] shrink-0 border-r border-white/[0.06] bg-[#0a0a0b] hidden md:flex md:flex-col">
      {/* Logo Section */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Command className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0b]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-white tracking-tight">CareerPilot AI</div>
          <div className="text-[11px] text-white/40 mt-0.5">{t('navigation.workspace')}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-violet-500" />
                  )}
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] transition-colors duration-150',
                      isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.icon === Sparkles && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-500/20 text-violet-400 uppercase tracking-wide">
                      AI
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Tip Card */}
      <div className="p-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.06] p-4">
          {/* Subtle glow */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                {t('navigation.tipTitle')}
              </span>
            </div>
            <p className="text-[13px] text-white/70 leading-relaxed">
              {t(currentTipKey)}
            </p>
          </div>
        </div>
      </div>

    </aside>
  )
}
