import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterBar } from '@/components/FilterBar'
import { SearchBar } from '@/components/SearchBar'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { applicationService } from '@/services/application.service'
import type { Application, ApplicationStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

const STATUS_ORDER: ApplicationStatus[] = [
  'NEW',
  'SAVED',
  'APPLIED',
  'HR_SCREEN',
  'TECH_INTERVIEW',
  'FINAL_ROUND',
  'OFFER',
  'REJECTED',
]

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  'NEW': 'applications.new',
  'SAVED': 'applications.saved',
  'APPLIED': 'applications.applied',
  'HR_SCREEN': 'applications.hrScreen',
  'TECH_INTERVIEW': 'applications.techInterview',
  'FINAL_ROUND': 'applications.finalRound',
  'OFFER': 'applications.offer',
  'REJECTED': 'applications.rejected',
}

export default function ApplicationsPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const boardQuery = useQuery({
    queryKey: ['applications', 'board'],
    queryFn: () => applicationService.board(),
  })
  const board = boardQuery.data ?? null

  const itemsFlat = useMemo(() => {
    if (!board) return []
    return STATUS_ORDER.flatMap((s) => board[s] ?? [])
  }, [board])

  const filteredFlat = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return itemsFlat
    return itemsFlat.filter((a) => {
      const v = a.vacancy
      const hay = `${v?.title ?? ''} ${v?.company?.name ?? ''} ${a.status}`.toLowerCase()
      return hay.includes(q)
    })
  }, [itemsFlat, query])

  const filteredBoard = useMemo(() => {
    if (!board) return null
    const ids = new Set(filteredFlat.map((a) => a.id))
    return STATUS_ORDER.reduce((acc, s) => {
      acc[s] = (board[s] ?? []).filter((a) => ids.has(a.id))
      return acc
    }, {} as Record<ApplicationStatus, Application[]>)
  }, [board, filteredFlat])

  return (
    <section className="space-y-4">
      <FilterBar
        left={<SearchBar value={query} onValueChange={setQuery} placeholder={t('applications.searchPlaceholder')} />}
        right={<span className="pill">{filteredFlat.length} {t('applications.results')}</span>}
      />

      {boardQuery.isLoading ? (
        <LoadingState message={t('applications.loading')} />
      ) : boardQuery.error ? (
        <ErrorState
          title={t('applications.error')}
          message={boardQuery.error instanceof Error ? boardQuery.error.message : t('messages.errorMessage')}
        />
      ) : filteredFlat.length === 0 ? (
        <EmptyState title={t('applications.noApplications')} description={t('applications.description')} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-4 xl:grid-cols-8">
          {STATUS_ORDER.map((s) => {
            const col = filteredBoard?.[s] ?? []
            return (
              <div key={s} className={cn('lg:col-span-1 xl:col-span-1', s === 'TECH_INTERVIEW' || s === 'FINAL_ROUND' ? 'xl:col-span-2' : '')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-ink uppercase tracking-wider">{t(STATUS_LABELS[s])}</div>
                  <span className="pill">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((a) => (
                    <div key={a.id} className="card p-3 hover:border-border-strong transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm text-ink truncate">{a.vacancy?.title ?? 'Vacancy'}</div>
                          <div className="text-xs text-ink-dim mt-1 truncate">
                            {a.vacancy?.company?.name ?? 'Company'} · {a.vacancy?.location ?? '—'}
                          </div>
                        </div>
                        <StatusBadge status={a.status} kind="application" size="sm" />
                      </div>
                      {a.notes && <div className="text-xs text-ink-muted mt-2 line-clamp-3">{a.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
