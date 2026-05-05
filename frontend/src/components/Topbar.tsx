import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Search, LogOut, ExternalLink, ChevronDown, Bell } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

interface TopbarProps {
  title: string
  searchValue?: string
  onSearchValueChange?: (value: string) => void
}

export function Topbar({ title, searchValue, onSearchValueChange }: TopbarProps) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [localQuery, setLocalQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const query = searchValue ?? localQuery
  const setQuery = useMemo(
    () => (onSearchValueChange ? onSearchValueChange : setLocalQuery),
    [onSearchValueChange],
  )

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-between px-5 md:px-6 gap-4">
      {/* Left - Page title */}
      <div className="min-w-0 flex items-center gap-3">
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">{title}</h1>
          <p className="text-[11px] text-white/40 mt-0.5 hidden md:block">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 hidden lg:flex justify-center max-w-xl">
        <div 
          className={cn(
            'relative w-full max-w-md transition-all duration-200',
            searchFocused && 'max-w-lg'
          )}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={t('vacancies.searchPlaceholder')}
            className={cn(
              'w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] pl-10 pr-4',
              'text-[13px] text-white placeholder:text-white/30',
              'transition-all duration-200 outline-none',
              'hover:bg-white/[0.06] hover:border-white/[0.08]',
              'focus:bg-white/[0.06] focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20'
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/30 font-mono">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications - subtle bell */}
        <button 
          type="button"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Landing link */}
        <Link 
          to="/" 
          className={cn(
            'hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg',
            'text-[13px] font-medium text-white/50 hover:text-white/80',
            'hover:bg-white/[0.04] transition-all duration-150'
          )}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('navigation.landing')}</span>
        </Link>

        {/* Logout */}
        <button 
          type="button" 
          onClick={logout} 
          className={cn(
            'hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg',
            'text-[13px] font-medium text-white/50 hover:text-white/80',
            'hover:bg-white/[0.04] transition-all duration-150'
          )}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('common.logout')}</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.08] mx-1 hidden md:block" />

        {/* User menu */}
        <button
          type="button"
          className={cn(
            'group inline-flex items-center gap-2.5 rounded-lg px-2 py-1.5',
            'hover:bg-white/[0.04] transition-all duration-150'
          )}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[13px] font-semibold text-white shadow-lg shadow-violet-500/20">
              {(user?.name ?? 'Guest').slice(0, 1).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0b]" />
          </div>
          
          {/* User info */}
          <div className="hidden md:block text-left">
            <div className="text-[13px] font-medium text-white leading-none truncate max-w-[120px]">
              {user?.name ?? 'Guest'}
            </div>
            <div className="text-[11px] text-white/40 mt-1">{t('common.account')}</div>
          </div>
          
          <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors hidden md:block" />
        </button>
      </div>
    </header>
  )
}
