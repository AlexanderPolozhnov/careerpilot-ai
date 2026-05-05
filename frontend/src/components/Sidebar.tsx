import { NavLink } from 'react-router-dom'
import { LayoutGrid, Briefcase, FileText, Building2, Sparkles, BarChart3, Settings, Lightbulb, Command } from 'lucide-react'
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
              {t('navigation.tipDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Keyboard shortcut hint */}
      <div className="px-5 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-[11px] text-white/30">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono">⌘</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono">K</kbd>
          <span className="ml-1">{t('navigation.search')}</span>
        </div>
      </div>
    </aside>
  )
}
