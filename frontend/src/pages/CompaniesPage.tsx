import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterBar } from '@/components/FilterBar'
import { SearchBar } from '@/components/SearchBar'
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

  return (
    <section className="space-y-4">
      <FilterBar
        left={<SearchBar value={query} onValueChange={setQuery} placeholder={t('companies.searchPlaceholder')} />}
        right={<span className="pill">{companies.length} {t('companies.results')}</span>}
      />

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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 ds-stagger">
          {companies.map((c) => (
            <div key={c.id} className="card card-hover p-4 ds-card ds-anim-rise">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{c.name}</div>
                  <div className="text-xs text-ink-dim mt-1 truncate">
                    {c.industry ?? '—'} · {c.location ?? '—'}
                  </div>
                </div>
                <a
                  className="text-xs text-accent hover:text-accent-dim transition-colors"
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Website
                </a>
              </div>
              {c.description && <p className="text-sm text-ink-muted mt-3 line-clamp-3">{c.description}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-ink-dim">Vacancies</span>
                <span className="pill">{(related.get(c.id) ?? []).length}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {(related.get(c.id) ?? []).slice(0, 2).map((v) => (
                  <Link
                    key={v.id}
                    to={`/app/vacancies/${v.id}`}
                    className="rounded-xl border border-border bg-surface-1/30 px-3 py-2 hover:bg-surface-1/50 transition-colors no-underline"
                  >
                    <div className="text-sm text-ink truncate">{v.title}</div>
                    <div className="text-xs text-ink-dim mt-1 truncate">{v.remote} · {v.location ?? '—'}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
