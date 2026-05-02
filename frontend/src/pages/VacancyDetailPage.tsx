import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function VacancyDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

  const updateMutation = useMutation({
    mutationFn: ({ vacancyId, title }: { vacancyId: string; title: string }) =>
      vacancyService.update(vacancyId, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vacancies'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (vacancyId: string) => vacancyService.delete(vacancyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      navigate('/app/vacancies')
    },
  })

  return (
    <section className="space-y-4">
      <Link to="/app/vacancies" className="text-sm text-ink-muted hover:text-ink transition-colors">
        {t('vacancies.backToVacancies')}
      </Link>

      {vacancyQuery.isLoading ? (
        <LoadingState message={t('vacancies.loadingDetail')} />
      ) : vacancyQuery.error ? (
        <ErrorState
          title={t('vacancies.loadError')}
          message={vacancyQuery.error instanceof Error ? vacancyQuery.error.message : t('vacancies.loadErrorMessage')}
        />
      ) : !vacancy ? (
        <EmptyState title={t('vacancies.notFoundTitle')} description={t('vacancies.notFoundDescription', { id: id ?? '—' })} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-ink">{vacancy.title}</div>
                  <div className="text-sm text-ink-dim mt-1">
                    {company?.name ?? t('vacancies.companyLabel')} · {vacancy.location ?? '—'}
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
                    {t('vacancies.openPosting')}
                  </a>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="card p-4 bg-surface-1/40">
                  <div className="text-xs text-ink-dim">{t('vacancies.salary')}</div>
                  <div className="text-sm text-ink mt-1">
                    {formatSalary(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryCurrency ?? 'USD')}
                  </div>
                </div>
                <div className="card p-4 bg-surface-1/40">
                  <div className="text-xs text-ink-dim">{t('vacancies.contract')}</div>
                  <div className="text-sm text-ink mt-1">{vacancy.contractType ?? '—'}</div>
                </div>
              </div>

              {vacancy.description && (
                <p className="text-sm text-ink-muted mt-4 leading-relaxed">{vacancy.description}</p>
              )}

              {company && (
                <div className="mt-5 border-t border-border pt-4">
                  <div className="text-sm font-semibold text-ink">{t('vacancies.companyLabel')}</div>
                  <div className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {company.description ?? '—'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.industry && <span className="pill">{company.industry}</span>}
                    {company.location && <span className="pill">{company.location}</span>}
                    {company.size && <span className="pill">{company.size}</span>}
                    {company.website && (
                      <a className="pill hover:border-border-strong transition-colors" href={company.website} target="_blank" rel="noreferrer">
                        {t('vacancies.website')}
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
                  disabled={updateMutation.isPending}
                  onClick={async () => {
                    const nextTitle = window.prompt(t('vacancies.newTitlePrompt'), vacancy.title)
                    if (!nextTitle || !nextTitle.trim() || !id) {
                      return
                    }
                    try {
                      await updateMutation.mutateAsync({ vacancyId: id, title: nextTitle.trim() })
                      setActionNote(t('vacancies.vacancyUpdated'))
                    } catch (error) {
                      setActionNote(error instanceof Error ? error.message : t('vacancies.vacancyUpdateFailed'))
                    }
                  }}
                >
                  {t('vacancies.editTitle')}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  disabled={deleteMutation.isPending}
                  onClick={async () => {
                    if (!id || !window.confirm(t('vacancies.deleteConfirmation'))) {
                      return
                    }
                    try {
                      await deleteMutation.mutateAsync(id)
                    } catch (error) {
                      setActionNote(error instanceof Error ? error.message : t('vacancies.vacancyDeleteFailed'))
                    }
                  }}
                >
                  {t('vacancies.delete')}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={async () => {
                    await applicationService.create({ vacancyId: vacancy.id, status: 'SAVED' })
                    setActionNote(t('vacancies.savedToApplications'))
                  }}
                >
                  {t('vacancies.save')}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim transition-colors"
                  onClick={async () => {
                    await applicationService.create({ vacancyId: vacancy.id, status: 'APPLIED', appliedAt: new Date().toISOString() })
                    setActionNote(t('vacancies.markedAsApplied'))
                  }}
                >
                  {t('vacancies.apply')}
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm"
                  onClick={async () => {
                    const res = await aiService.analyzeVacancy({ vacancyId: vacancy.id })
                    setInsight(res.result)
                    setActionNote(t('vacancies.aiAnalysisGenerated'))
                  }}
                >
                  {t('vacancies.generateAnalysis')}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">{t('vacancies.aiInsight')}</h2>
              <button type="button" className="btn-secondary text-sm">
                {t('vacancies.generate')}
              </button>
            </div>
            {aiInsight ? (
              <AiInsightCard result={aiInsight} compact />
            ) : (
              <EmptyState
                title={t('vacancies.noAiInsightTitle')}
                description={t('vacancies.noAiInsightDescription')}
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
