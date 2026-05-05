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
import { VacancyForm, type VacancyFormValues } from '@/components/VacancyForm'
import { toast } from '@/lib/toast'
import { X } from 'lucide-react'

export default function VacancyDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [insight, setInsight] = useState<AiResult | null>(null)
  const [isEditing, setIsEditing] = useState(false)

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
    mutationFn: (values: VacancyFormValues) =>
      vacancyService.update(id as string, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacancies', 'detail', { id }] })
      toast.success(t('vacancies.vacancyUpdated'))
      setIsEditing(false)
    },
    onError: () => {
      toast.error(t('vacancies.vacancyUpdateFailed'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (vacancyId: string) => vacancyService.delete(vacancyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vacancies'] })
      toast.success(t('vacancies.vacancyDeleted')) // Assuming this key exists or will be added
      navigate('/app/vacancies')
    },
    onError: () => {
      toast.error(t('vacancies.vacancyDeleteFailed'))
    }
  })

  const initialFormValues = useMemo((): Partial<VacancyFormValues> | undefined => {
    if (!vacancy) return undefined
    return {
      title: vacancy.title,
      companyId: vacancy.companyId,
      url: vacancy.url,
      description: vacancy.description,
      location: vacancy.location,
      remote: vacancy.remote,
      contractType: vacancy.contractType,
      salaryMin: vacancy.salaryMin,
      salaryMax: vacancy.salaryMax,
      salaryCurrency: vacancy.salaryCurrency,
      deadline: vacancy.deadline ? vacancy.deadline.split('T')[0] : undefined,
    }
  }, [vacancy])

  return (
    <section className="space-y-4">
       {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-2 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
             <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-ink-dim hover:text-ink transition-colors">
               <X size={20} />
             </button>
            <h3 className="text-lg font-semibold text-ink">{t('vacancies.edit')}</h3>
            <div className="mt-4">
              <VacancyForm
                onSubmit={async (values) => {
                  await updateMutation.mutateAsync(values)
                }}
                onCancel={() => setIsEditing(false)}
                isSubmitting={updateMutation.isPending}
                initialValues={initialFormValues}
              />
            </div>
          </div>
        </div>
      )}

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
        <div className="grid gap-4 lg:grid-cols-5 ds-stagger">
          <div className="lg:col-span-3 space-y-3 ds-anim-rise">
            <div className="ds-card p-5">
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
                    className="ds-btn ds-btn-ghost text-sm"
                  >
                    {t('vacancies.openPosting')}
                  </a>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="ds-card p-4 bg-surface-1/40">
                  <div className="text-xs text-ink-dim">{t('vacancies.salary')}</div>
                  <div className="text-sm text-ink mt-1">
                    {formatSalary(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryCurrency ?? 'USD')}
                  </div>
                </div>
                <div className="ds-card p-4 bg-surface-1/40">
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

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="ds-btn ds-btn-ghost text-sm"
                  disabled={updateMutation.isPending}
                  onClick={() => setIsEditing(true)}
                >
                  {t('vacancies.edit')}
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-ghost text-sm"
                  disabled={deleteMutation.isPending}
                  onClick={async () => {
                    if (!id || !window.confirm(t('vacancies.deleteConfirmation'))) {
                      return
                    }
                    await deleteMutation.mutateAsync(id)
                  }}
                >
                  {t('vacancies.delete')}
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-ghost text-sm"
                  onClick={async () => {
                    await applicationService.create({ vacancyId: vacancy.id, status: 'SAVED' })
                    toast.info(t('vacancies.savedToApplications'))
                  }}
                >
                  {t('vacancies.save')}
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-primary text-sm"
                  onClick={async () => {
                    await applicationService.create({ vacancyId: vacancy.id, status: 'APPLIED', appliedAt: new Date().toISOString() })
                    toast.info(t('vacancies.markedAsApplied'))
                  }}
                >
                  {t('vacancies.apply')}
                </button>
                <button
                  type="button"
                  className="ds-btn ds-btn-ghost text-sm"
                  onClick={async () => {
                    const res = await aiService.analyzeVacancy({ vacancyId: vacancy.id })
                    setInsight(res.result)
                    toast.info(t('vacancies.aiAnalysisGenerated'))
                  }}
                >
                  {t('vacancies.generateAnalysis')}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3 ds-anim-rise">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">{t('vacancies.aiInsight')}</h2>
              <button type="button" className="ds-btn ds-btn-ghost text-sm">
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
