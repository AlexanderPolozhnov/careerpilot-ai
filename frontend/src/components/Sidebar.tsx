import { NavLink } from 'react-router-dom'
import { LayoutGrid, Briefcase, FileText, Building2, Sparkles, BarChart3, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { t } = useTranslation()

  const navItems = [
    { label: t('navigation.dashboard'), to: '/app/dashboard', icon: LayoutGrid },
    { label: t('navigation.vacancies'), to: '/app/vacancies', icon: Briefcase },
    { label: t('navigation.applications'), to: '/app/applications', icon: FileText },
    { label: t('navigation.companies'), to: '/app/companies', icon: Building2 },
    { label: t('navigation.aiAssistant'), to: '/app/ai-assistant', icon: Sparkles },
    { label: t('navigation.analytics'), to: '/app/analytics', icon: BarChart3 },
    { label: t('navigation.settings'), to: '/app/settings', icon: Settings },
  ]

  return (
    <aside className="w-[264px] shrink-0 border-r border-border bg-surface-1/70 backdrop-blur px-4 py-5 hidden md:flex md:flex-col">
      <div className="flex items-center gap-2 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/35 to-accent-2/20 border border-border flex items-center justify-center">
          <span className="text-sm font-semibold text-ink">CP</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink leading-none">CareerPilot AI</div>
          <div className="text-xs text-ink-dim mt-1">{t('navigation.workspace')}</div>
        </div>
      </div>

      <nav className="mt-6 grid gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/12 text-ink border border-accent/18'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-2/60 border border-transparent',
                )
              }
            >
              <Icon className="w-4 h-4 text-ink-dim group-hover:text-ink transition-colors" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto pt-5">
        <div className="card p-3">
          <div className="text-xs text-ink-dim">{t('navigation.tipTitle')}</div>
          <div className="text-sm text-ink mt-0.5">{t('navigation.tipDescription')}</div>
        </div>
      </div>
    </aside>
  )
}
