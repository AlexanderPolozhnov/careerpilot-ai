import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FilterBar } from '@/components/FilterBar'
import { cn } from '@/lib/utils'
import { aiService } from '@/services/ai.service'
import type { AiResult } from '@/types'
import { AiInsightCard } from '@/components/AiInsightCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import type { Resolver } from 'react-hook-form'

const analyzeSchema = z.object({
  vacancyId: z.string().optional(),
  vacancyText: z.string().min(30, 'Paste at least 30 characters').optional(),
})

const matchSchema = z.object({
  vacancyId: z.string().optional(),
  vacancyText: z.string().min(30, 'Paste at least 30 characters').optional(),
  resumeText: z.string().min(80, 'Paste at least 80 characters'),
})

const coverLetterSchema = z.object({
  vacancyId: z.string().optional(),
  vacancyText: z.string().min(30, 'Paste at least 30 characters').optional(),
  resumeText: z.string().min(80, 'Paste at least 80 characters').optional(),
  tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'ENTHUSIASTIC']).default('PROFESSIONAL'),
  additionalContext: z.string().optional(),
})

const interviewSchema = z.object({
  vacancyId: z.string().optional(),
  vacancyText: z.string().min(30, 'Paste at least 30 characters').optional(),
  focusArea: z.string().optional(),
  count: z.coerce.number().int().min(3).max(15).default(5),
})

type ToolKey = 'analyze' | 'match' | 'cover' | 'interview'

type AiFormValues = {
  vacancyId?: string
  vacancyText?: string
  resumeText?: string
  tone?: 'PROFESSIONAL' | 'FRIENDLY' | 'ENTHUSIASTIC'
  additionalContext?: string
  focusArea?: string
  count?: number
}

export default function AiAssistantPage() {
  const { t } = useTranslation()
  const [tool, setTool] = useState<ToolKey>('analyze')
  const [result, setResult] = useState<AiResult | null>(null)

  const schema = useMemo(() => {
    if (tool === 'analyze') return analyzeSchema
    if (tool === 'match') return matchSchema
    if (tool === 'cover') return coverLetterSchema
    return interviewSchema
  }, [tool])

  const form = useForm<AiFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<AiFormValues>,
    defaultValues: {
      vacancyId: '',
      vacancyText: '',
      resumeText: '',
      tone: 'PROFESSIONAL',
      additionalContext: '',
      focusArea: '',
      count: 5,
    },
  })

  const historyQuery = useQuery({
    queryKey: ['ai', 'history'],
    queryFn: () => aiService.getHistory(),
  })

  const history = historyQuery.data ?? []
  const isLoadingHistory = historyQuery.isLoading

  return (
    <section className="space-y-4">
      <FilterBar
        left={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={cn('btn-secondary text-sm', tool === 'analyze' && 'border-accent/25 bg-accent/12')} onClick={() => setTool('analyze')}>
              {t('aiAssistant.tools.analyze')}
            </button>
            <button type="button" className={cn('btn-secondary text-sm', tool === 'match' && 'border-accent/25 bg-accent/12')} onClick={() => setTool('match')}>
              {t('aiAssistant.tools.match')}
            </button>
            <button type="button" className={cn('btn-secondary text-sm', tool === 'cover' && 'border-accent/25 bg-accent/12')} onClick={() => setTool('cover')}>
              {t('aiAssistant.tools.cover')}
            </button>
            <button type="button" className={cn('btn-secondary text-sm', tool === 'interview' && 'border-accent/25 bg-accent/12')} onClick={() => setTool('interview')}>
              {t('aiAssistant.tools.interview')}
            </button>
          </div>
        }
        right={<span className="pill">{t('aiAssistant.mockMode')}</span>}
      />

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 card p-5">
          <div className="text-sm font-semibold text-ink">{t('aiAssistant.requestTitle')}</div>
          <p className="text-sm text-ink-muted mt-2">
            {t('aiAssistant.requestDescription')}
          </p>

          <form
            className="mt-5 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setResult(null)
              if (tool === 'analyze') {
                const v = values as z.infer<typeof analyzeSchema>
                const res = await aiService.analyzeVacancy({ vacancyId: v.vacancyId || undefined, vacancyText: v.vacancyText || undefined })
                setResult(res.result)
                return
              }
              if (tool === 'match') {
                const v = values as z.infer<typeof matchSchema>
                const res = await aiService.resumeMatch({
                  vacancyId: v.vacancyId || undefined,
                  vacancyText: v.vacancyText || undefined,
                  resumeText: v.resumeText,
                })
                setResult(res.result)
                return
              }
              if (tool === 'cover') {
                const v = values as z.infer<typeof coverLetterSchema>
                const res = await aiService.generateCoverLetter({
                  vacancyId: v.vacancyId || undefined,
                  vacancyText: v.vacancyText || undefined,
                  resumeText: v.resumeText || undefined,
                  tone: v.tone,
                  additionalContext: v.additionalContext || undefined,
                })
                setResult(res.result)
                return
              }
              const v = values as z.infer<typeof interviewSchema>
              const res = await aiService.generateInterviewQuestions({
                vacancyId: v.vacancyId || undefined,
                vacancyText: v.vacancyText || undefined,
                focusArea: v.focusArea || undefined,
                count: v.count,
              })
              setResult(res.result)
            })}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
              <label className="text-xs text-ink-dim">{t('aiAssistant.vacancyIdOptional')}</label>
              <input className="input mt-1" {...form.register('vacancyId')} placeholder="v1" />
            </div>
            {tool === 'interview' && (
                <div>
                  <label className="text-xs text-ink-dim">{t('aiAssistant.questionCount')}</label>
                  <input className="input mt-1" type="number" {...form.register('count')} />
                </div>
              )}
              {tool === 'interview' && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-ink-dim">{t('aiAssistant.focusAreaOptional')}</label>
                  <input className="input mt-1" {...form.register('focusArea')} placeholder={t('aiAssistant.focusAreaPlaceholder')} />
                </div>
              )}
              {tool === 'cover' && (
                <div className="sm:col-span-2">
                  <label className="text-xs text-ink-dim">{t('aiAssistant.tone')}</label>
                  <select className="input mt-1" {...form.register('tone')}>
                    <option value="PROFESSIONAL">{t('aiAssistant.toneProfessional')}</option>
                    <option value="FRIENDLY">{t('aiAssistant.toneFriendly')}</option>
                    <option value="ENTHUSIASTIC">{t('aiAssistant.toneEnthusiastic')}</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-ink-dim">{t('aiAssistant.vacancyTextOptional')}</label>
              <textarea className="input mt-1 h-28 py-2" {...form.register('vacancyText')} placeholder={t('aiAssistant.vacancyTextPlaceholder')} />
            </div>

            {(tool === 'match' || tool === 'cover') && (
              <div>
                <label className="text-xs text-ink-dim">
                  {tool === 'match' ? t('aiAssistant.resumeText') : t('aiAssistant.resumeTextOptional')}
                </label>
                <textarea className="input mt-1 h-28 py-2" {...form.register('resumeText')} placeholder={t('aiAssistant.resumeTextPlaceholder')} />
              </div>
            )}

            {tool === 'cover' && (
              <div>
                <label className="text-xs text-ink-dim">{t('aiAssistant.additionalContextOptional')}</label>
                <textarea className="input mt-1 h-20 py-2" {...form.register('additionalContext')} placeholder={t('aiAssistant.additionalContextPlaceholder')} />
              </div>
            )}

            {Object.keys(form.formState.errors).length > 0 && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-ink">
                {t('aiAssistant.fixFields')}
              </div>
            )}

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className={cn(
                'w-full inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                form.formState.isSubmitting ? 'opacity-70' : 'hover:bg-accent-dim',
              )}
            >
              {form.formState.isSubmitting ? t('aiAssistant.generating') : t('aiAssistant.generate')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="card p-5">
            <div className="text-sm font-semibold text-ink">{t('aiAssistant.resultTitle')}</div>
            <p className="text-sm text-ink-muted mt-2">{t('aiAssistant.resultDescription')}</p>
            <div className="mt-4">
              {result ? (
                <AiInsightCard result={result} />
              ) : (
                <EmptyState title={t('aiAssistant.noResultTitle')} description={t('aiAssistant.noResultDescription')} />
              )}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">{t('aiAssistant.historyTitle')}</div>
                <p className="text-sm text-ink-muted mt-1">{t('aiAssistant.historyDescription')}</p>
              </div>
              <span className="pill">{history.length}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {isLoadingHistory ? (
                <LoadingState message={t('aiAssistant.loadingHistory')} className="py-8" />
              ) : history.length === 0 ? (
                <EmptyState title={t('aiAssistant.noHistoryTitle')} description={t('aiAssistant.noHistoryDescription')} />
              ) : (
                history.slice(0, 3).map((r) => <AiInsightCard key={r.id} result={r} compact />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
