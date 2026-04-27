import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterBar } from '@/components/FilterBar'
import { SearchBar } from '@/components/SearchBar'
import { MatchScoreBadge, RemoteBadge, StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { vacancyService } from '@/services/vacancy.service'
import type { Vacancy, VacancyStatus, RemoteType } from '@/types'
import { useQuery } from '@tanstack/react-query'

export default function VacanciesPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<VacancyStatus | 'ALL'>('ALL')
  const [remote, setRemote] = useState<RemoteType | 'ALL'>('ALL')
  const [view, setView] = useState<'list' | 'table'>('list')
  const listQuery = useQuery({
    queryKey: ['vacancies', { query, status, remote }],
    queryFn: () =>
      vacancyService.list({
        search: query || undefined,
        status: status === 'ALL' ? undefined : status,
        remote: remote === 'ALL' ? undefined : remote,
        page: 0,
        size: 100,
      }),
  })

  const visibleItems = useMemo<Vacancy[]>(() => listQuery.data?.content ?? [], [listQuery.data])

  return (
    <section className="space-y-4">
      <FilterBar
        left={<SearchBar value={query} onValueChange={setQuery} placeholder={t('vacancies.searchPlaceholder')} />}
        right={
          <>
            <select
              className="input h-10 w-auto"
              value={status}
              onChange={(e) => setStatus(e.target.value as VacancyStatus | 'ALL')}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select
              className="input h-10 w-auto"
              value={remote}
              onChange={(e) => setRemote(e.target.value as RemoteType | 'ALL')}
            >
              <option value="ALL">All modes</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-site</option>
            </select>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => setView((v) => (v === 'list' ? 'table' : 'list'))}
            >
              {view === 'list' ? 'Table' : 'List'}
            </button>
            <span className="pill">{visibleItems.length} {t('vacancies.results')}</span>
            <button type="button" className="btn-secondary text-sm">
              Add vacancy
            </button>
          </>
        }
      />

      {listQuery.isLoading ? (
        <LoadingState message={t('vacancies.loading')} />
      ) : listQuery.error ? (
        <ErrorState
          title={t('vacancies.error')}
          message={listQuery.error instanceof Error ? listQuery.error.message : t('messages.errorMessage')}
        />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          title="No vacancies found"
          description="Try a different search query or add a new vacancy."
        />
      ) : (
        <>
          {view === 'list' ? (
            <div className="grid gap-3">
              {visibleItems.map((v) => (
                <Link
                  key={v.id}
                  to={`/app/vacancies/${v.id}`}
                  className="card card-hover p-4 block no-underline"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">{v.title}</div>
                      <div className="text-xs text-ink-dim mt-1 truncate">
                        {v.company?.name ?? 'Unknown company'} · {v.location ?? '—'}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={v.status} kind="vacancy" size="sm" />
                        <RemoteBadge remote={v.remote} />
                        {typeof v.matchScore === 'number' && <MatchScoreBadge score={v.matchScore} />}
                        {v.tags.slice(0, 3).map((t) => (
                          <span key={t.id} className="pill">
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-ink-dim shrink-0">View</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs text-ink-dim border-b border-border">
                <div className="col-span-5">Role</div>
                <div className="col-span-3">Company</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Match</div>
              </div>
              <div className="divide-y divide-border">
                {visibleItems.map((v) => (
                  <Link
                    key={v.id}
                    to={`/app/vacancies/${v.id}`}
                    className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-surface-3/40 transition-colors no-underline"
                  >
                    <div className="col-span-5 min-w-0">
                      <div className="text-sm text-ink truncate">{v.title}</div>
                      <div className="text-xs text-ink-dim mt-1 truncate">{v.location ?? '—'} · {v.remote}</div>
                    </div>
                    <div className="col-span-3 text-sm text-ink-muted truncate">{v.company?.name ?? '—'}</div>
                    <div className="col-span-2">
                      <StatusBadge status={v.status} kind="vacancy" size="sm" />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      {typeof v.matchScore === 'number' ? <MatchScoreBadge score={v.matchScore} /> : <span className="text-xs text-ink-dim">—</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
