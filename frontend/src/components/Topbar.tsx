import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { LogOut, ExternalLink, ChevronDown, Bell, Settings, Search, FileSpreadsheet, Sparkles, Send } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { GlobalSearch } from './GlobalSearch'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000, // Poll every minute
  })
  
  const unreadCount = unreadData?.count || 0

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Handle keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsSearchOpen(true)
      }
      if (event.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    navigate('/auth/login')
  }

  const handleSettings = () => {
    setIsDropdownOpen(false)
    navigate('/app/settings')
  }

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-between px-5 md:px-6 gap-4 relative z-[60]">
      {/* Left - Page title */}
      <div className="min-w-0 flex items-center gap-3">
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">{title}</h1>
          <p className="text-[11px] text-white/40 mt-0.5 hidden md:block">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className={cn(
            "group relative flex items-center gap-2 h-9 px-2 md:px-3 rounded-lg",
            "bg-white/[0.03] border border-white/[0.06]",
            "hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200",
            "text-white/40 hover:text-white/70"
          )}
        >
          <Search className="w-4 h-4" />
          <span className="text-[13px] hidden xl:block">
            {t('search.placeholder')}
          </span>
          <span className="hidden sm:block text-[10px] font-mono bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.05] text-white/30 ml-1">
            {t('search.shortcut')}
          </span>
        </button>

        {/* Excel Data */}
        <button
          type="button"
          onClick={() => navigate('/app/settings#export-data')}
          className="group relative w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150"
        >
          <FileSpreadsheet className="w-[18px] h-[18px]" />
          <span className="absolute top-full right-0 mt-2 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[#1a1a1e] border border-white/10 text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100] shadow-xl">
            {t('settings.exportData')}
          </span>
        </button>

        {/* AI Provider */}
        <button
          type="button"
          onClick={() => navigate('/app/settings#ai-provider')}
          className="group relative w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150"
        >
          <Sparkles className="w-[18px] h-[18px]" />
          <span className="absolute top-full right-0 mt-2 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[#1a1a1e] border border-white/10 text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100] shadow-xl">
            {t('settings.aiProvider')}
          </span>
        </button>

        {/* Telegram */}
        <button
          type="button"
          onClick={() => navigate('/app/settings#telegram')}
          className="group relative w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150"
        >
          <Send className="w-[18px] h-[18px]" />
          <span className="absolute top-full right-0 mt-2 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[#1a1a1e] border border-white/10 text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100] shadow-xl">
            {t('settings.telegram')}
          </span>
        </button>

        {/* Notifications - subtle bell */}
        <button
          type="button"
          onClick={() => navigate('/app/settings#notifications')}
          className="group relative w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-150"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-violet-500 text-[9px] font-bold text-white border-2 border-[#08060d]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="absolute top-full right-0 mt-2 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-[#1a1a1e] border border-white/10 text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100] shadow-xl">
            {t('settings.notifications')}
          </span>
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

        {/* Divider */}
        <div className="w-px h-6 bg-white/[0.08] mx-1 hidden md:block" />

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              'group inline-flex items-center gap-2.5 rounded-lg px-2 py-1.5',
              'hover:bg-white/[0.04] transition-all duration-150',
              isDropdownOpen && 'bg-white/[0.06]'
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

            <ChevronDown className={cn(
              "w-4 h-4 text-white/30 group-hover:text-white/50 transition-all hidden md:block",
              isDropdownOpen && "rotate-180 text-white/70"
            )} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className={cn(
                'absolute top-full right-0 mt-2 w-64 rounded-xl border border-white/[0.1]',
                'bg-[#0f0f11]/98 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl',
                'origin-top opacity-100 translate-y-0 transition-all duration-150 ease-out z-[70]'
              )}
              onClick={() => setIsDropdownOpen(false)}
            >
              {/* User Identity Section */}
              <div
                className="px-3 py-3 border-b border-white/[0.06] mb-1"
                onClick={(e) => e.stopPropagation()} // Don't close when clicking identity info
              >
                <div className="text-[13px] font-semibold text-white truncate">
                  {user?.name ?? 'Guest User'}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5 truncate">
                  {user?.email ?? 'Not logged in'}
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-0.5">
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('common.settings')}</span>
                </button>

                <div className="h-px bg-white/[0.06] my-1 mx-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('common.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}

