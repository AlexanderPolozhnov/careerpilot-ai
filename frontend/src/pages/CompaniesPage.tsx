import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { companyService } from '@/services/company.service'
import { vacancyService } from '@/services/vacancy.service'
import type { Company, Vacancy } from '@/types'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function CompaniesPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const companiesQuery = useQuery({
    queryKey: ['companies', { query }],
    queryFn: () => companyService.list({ search: query || undefined, page: 0, size: 100 }),
  })
  const vacanciesQuery = useQuery({
    queryKey: ['vacancies', { scope: 'all' }],
    queryFn: () => vacancyService.list({ page: 0, size: 200 }),
  })

  const companies: Company[] = companiesQuery.data?.content ?? []

  const related = useMemo(() => {
    const vacancies: Vacancy[] = vacanciesQuery.data?.content ?? []
    const map = new Map<string, Vacancy[]>()
    for (const v of vacancies) {
      const list = map.get(v.companyId) ?? []
      list.push(v)
      map.set(v.companyId, list)
    }
    return map
  }, [vacanciesQuery.data])

  // Stats calculations
  const totalVacancies = useMemo(() => {
    let count = 0
    related.forEach((v) => { count += v.length })
    return count
  }, [related])

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
              {t('companies.title')}
            </h1>
            <p className="text-sm text-[#6b7590] mt-0.5">{t('companies.description')}</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-xs text-[#6b7590]">Companies</span>
            <span className="text-sm font-medium text-[#e8eaed]">{companies.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
            <span className="text-xs text-[#6b7590]">Vacancies</span>
            <span className="text-sm font-medium text-violet-400">{totalVacancies}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7590] pointer-events-none">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('companies.searchPlaceholder')}
            className="w-full h-10 pl-11 pr-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b7590]">{companies.length} {t('companies.results')}</span>
        </div>
      </div>

      {/* Content */}
      {companiesQuery.isLoading || vacanciesQuery.isLoading ? (
        <LoadingState message={t('companies.loading')} />
      ) : companiesQuery.error || vacanciesQuery.error ? (
        <ErrorState
          title={t('companies.error')}
          message={
            (companiesQuery.error instanceof Error ? companiesQuery.error.message : null) ??
            (vacanciesQuery.error instanceof Error ? vacanciesQuery.error.message : null) ??
            t('messages.errorMessage')
          }
        />
      ) : companies.length === 0 ? (
        <EmptyState title={t('companies.noCompanies')} description={t('companies.description')} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((c, index) => (
            <div 
              key={c.id} 
              className="group relative flex flex-col p-5 rounded-2xl bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.06)] transition-all duration-300 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_32px_-8px_rgba(139,92,246,0.25)]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Top accent line */}
              <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-violet-600/0 via-violet-500/50 to-violet-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Header */}
              <div className="flex items-start gap-4">
                {/* Company Avatar */}
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 overflow-hidden group-hover:border-violet-500/30 transition-colors duration-300">
                  <span className="text-lg font-semibold text-[#8b8fa3] group-hover:text-violet-400 transition-colors duration-300">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#e8eaed] truncate group-hover:text-white transition-colors" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    {c.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6b7590]">
                    {c.industry && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                        {c.industry}
                      </span>
                    )}
                    {c.location && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {c.location}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Website Link */}
                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#6b7590] hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-200"
                    title="Visit website"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
              
              {/* Description */}
              {c.description && (
                <p className="mt-4 text-[13px] text-[#8b8fa3] leading-relaxed line-clamp-2">
                  {c.description}
                </p>
              )}
              
              {/* Divider */}
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent" />
              
              {/* Vacancies Section */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#6b7590] uppercase tracking-wider">Open Positions</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400">
                    {(related.get(c.id) ?? []).length}
                  </span>
                </div>
                
                {(related.get(c.id) ?? []).length > 0 ? (
                  <div className="space-y-2">
                    {(related.get(c.id) ?? []).slice(0, 2).map((v) => (
                      <Link
                        key={v.id}
                        to={`/app/vacancies/${v.id}`}
                        className="group/vacancy flex items-center justify-between p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-200 no-underline"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-[#e8eaed] truncate group-hover/vacancy:text-white transition-colors">
                            {v.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#6b7590]">
                            <span className="flex items-center gap-1">
                              {v.remote === 'REMOTE' && (
                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                              )}
                              {v.remote}
                            </span>
                            {v.location && (
                              <>
                                <span className="text-[#4a4e5a]">·</span>
                                <span className="truncate">{v.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-[#4a4e5a] group-hover/vacancy:text-violet-400 group-hover/vacancy:translate-x-0.5 transition-all duration-200 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                    
                    {(related.get(c.id) ?? []).length > 2 && (
                      <div className="text-center pt-1">
                        <span className="text-xs text-[#6b7590]">
                          +{(related.get(c.id) ?? []).length - 2} more positions
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-dashed border-[rgba(255,255,255,0.08)]">
                    <span className="text-xs text-[#4a4e5a]">No open positions</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
