import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Building2, Briefcase, CheckSquare, Calendar } from 'lucide-react'
import { searchService, type SearchItem } from '@/services/search.service'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Debounced search query
  const debouncedQuery = query.trim()
  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: isOpen && debouncedQuery.length >= 2,
    staleTime: 30000,
  })

  const handleResultClick = (item: SearchItem) => {
    navigate(item.url)
    onClose()
    setQuery('')
  }

  const getTypeIcon = (type: SearchItem['type']) => {
    switch (type) {
      case 'VACANCY':
        return <Briefcase className="w-4 h-4" />
      case 'COMPANY':
        return <Building2 className="w-4 h-4" />
      case 'TASK':
        return <CheckSquare className="w-4 h-4" />
      case 'INTERVIEW':
        return <Calendar className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: SearchItem['type']) => {
    switch (type) {
      case 'VACANCY':
        return t('search.vacancies')
      case 'COMPANY':
        return t('search.companies')
      case 'TASK':
        return t('search.tasks')
      case 'INTERVIEW':
        return t('search.interviews')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-[#0f0f11]/98 border border-white/[0.1] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden">
          {/* Header with input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <Search className="w-5 h-5 text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-[15px]"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose()
              }}
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {query.length < 2 ? (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">{t('search.placeholder')}</p>
              </div>
            ) : searchQuery.isLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
              </div>
            ) : searchQuery.data?.results && searchQuery.data.results.length > 0 ? (
              <div className="py-2">
                {searchQuery.data.results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/50 group-hover:text-white/70 group-hover:bg-white/[0.06] transition-all">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-white truncate">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] text-white/40 truncate">
                          {item.subtitle}
                        </span>
                        {item.status && (
                          <>
                            <span className="text-white/20">·</span>
                            <span className="text-[12px] text-white/40">
                              {item.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-white/30 font-medium px-2 py-1 rounded bg-white/[0.04]">
                      {getTypeLabel(item.type)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">{t('search.noResults')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="text-[11px] text-white/30">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[10px]">
                ESC
              </kbd>{' '}
              {t('common.toClose')}
            </div>
            <div className="text-[11px] text-white/30">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              {t('common.toNavigate')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
