import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
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
  const query = searchValue ?? localQuery
  const setQuery = useMemo(
    () => (onSearchValueChange ? onSearchValueChange : setLocalQuery),
    [onSearchValueChange],
  )

  return (
    <header className="h-16 border-b border-border bg-surface-1/70 backdrop-blur flex items-center justify-between px-5 md:px-8 gap-4">
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-ink truncate">{title}</h1>
        <p className="text-xs text-ink-dim mt-0.5 hidden md:block">{t('dashboard.subtitle')}</p>
      </div>

      <div className="flex-1 hidden lg:block max-w-[560px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('vacancies.searchPlaceholder')}
            className={cn('input pl-9')}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <Link to="/" className="hidden sm:inline-flex btn-secondary text-sm">
          {t('navigation.landing')}
        </Link>

        <button type="button" onClick={logout} className="btn-secondary text-sm hidden md:inline-flex">
          {t('common.logout')}
        </button>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-3 py-2 hover:bg-surface-2 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/25 to-accent-2/20 border border-border flex items-center justify-center text-xs font-semibold text-ink">
            {(user?.name ?? 'Guest').slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-ink leading-none truncate max-w-[140px]">
              {user?.name ?? 'Guest'}
            </div>
            <div className="text-xs text-ink-dim mt-1">{t('common.account')}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-ink-dim" />
        </button>
      </div>
    </header>
  )
}
