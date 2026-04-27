import { useParams, Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { MatchScoreBadge, RemoteBadge, StatusBadge } from '@/components/StatusBadge'
import { AiInsightCard } from '@/components/AiInsightCard'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { vacancyService } from '@/services/vacancy.service'
import { aiService } from '@/services/ai.service'
import { applicationService } from '@/services/application.service'
import type { AiResult, Vacancy } from '@/types'
import { formatSalary } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

export default function VacancyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [insight, setInsight] = useState<AiResult | null>(null)
  const [actionNote, setActionNote] = useState<string | null>(null)

  const vacancyQuery = useQuery({
    queryKey: ['vacancies', 'detail', { id }],
    enabled: !!id,
    queryFn: () => vacancyService.getById(id as string),
  })

  const insightQuery = useQuery({
    queryKey: ['ai', 'history', { type: 'VACANCY_ANALYSIS', vacancyId: id }],
    enabled: !!id,
    queryFn: async () => {
      const items = await aiService.getHistory('VACANCY_ANALYSIS')
      return items.find((r) => r.vacancyId === id) ?? null
    },
  })

  const vacancy: Vacancy | null = vacancyQuery.data ?? null
  const aiInsight = insight ?? insightQuery.data ?? null
  const company = useMemo(() => vacancy?.company, [vacancy])

  return (
    <section className="space-y-4">
      <Link to="/app/vacancies" className="text-sm text-ink-muted hover:text-ink transition-colors">
        ← Back to vacancies
      </Link>

      {vacancyQuery.isLoading ? (
        <LoadingState message="Loading vacancy…" />
      ) : vacancyQuery.error ? (
        <ErrorState
          title="Unable to load vacancy"
          message={vacancyQuery.error instanceof Error ? vacancyQuery.error.message : 'Failed to load vacancy'}
        />
      ) : !vacancy ? (
        <EmptyState title="Vacancy not found" description={`No vacancy exists for id: ${id ?? '—'}`} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-ink">{vacancy.title}</div>
                  <div className="text-sm text-ink-dim mt-1">
                    {company?.name ?? 'Company'} · {vacancy.location ?? '—'}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={vacancy.status} kind="vacancy" />
                    <RemoteBadge remote={vacancy.remote} />
                    {typeof vacancy.matchScore === 'number' && <MatchScoreBadge score={vacancy.matchScore} />}
                    {vacancy.tags.map((t) => (
                      <span key={t.id} className="pill">
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
                {vacancy.url && (
                  <a
                    href={vacancy.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-sm"
                  >
                    Open posting
                  </a>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="card p-4 bg-surface-1/40">
                  <div className="text-xs text-ink-dim">Salary</div>
                  <div className="text-sm text-ink mt-1">
                    {formatSalary(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryCurrency ?? 'USD')}
                  </div>
                </div>
                <div className="card p-4 bg-surface-1/40">
                  <div className="text-xs text-ink-dim">Contract</div>
                  <div className="text-sm text-ink mt-1">{vacancy.contractType ?? '—'}</div>
                </div>
              </div>

              {vacancy.description && (
                <p className="text-sm text-ink-muted mt-4 leading-relaxed">{vacancy.description}</p>
              )}

              {company && (
                <div className="mt-5 border-t border-border pt-4">
                  <div className="text-sm font-semibold text-ink">Company</div>
                  <div className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {company.description ?? '—'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.industry && <span className="pill">{company.industry}</span>}
                    {company.location && <span className="pill">{company.location}</span>}
                    {company.size && <span className="pill">{company.size}</span>}
                    {company.website && (
                      <a className="pill hover:border-border-strong transition-colors" href={company.website} target="_blank" rel="noreferrer">
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {actionNote && (
                <div className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-ink">
                  {actionNote}
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={async () => {
                    await applicationService.create({ vacancyId: vacancy.id, status: 'SAVED' })
                    setActionNote('Saved to applications (mock).')
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim transition-colors"
                  onClick={async () => {
                    await applicationService.create({ vacancyId: vacancy.id, status: 'APPLIED', appliedAt: new Date().toISOString() })
                    setActionNote('Marked as applied (mock).')
                  }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={async () => {
                    const res = await aiService.analyzeVacancy({ vacancyId: vacancy.id })
                    setInsight(res.result)
                    setActionNote('AI analysis generated (mock).')
                  }}
                >
                  Generate AI analysis
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">AI insight</h2>
              <button type="button" className="btn-secondary text-sm">
                Generate
              </button>
            </div>
            {aiInsight ? (
              <AiInsightCard result={aiInsight} compact />
            ) : (
              <EmptyState
                title="No AI insight yet"
                description="Generate a vacancy analysis to get tailored recommendations."
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
