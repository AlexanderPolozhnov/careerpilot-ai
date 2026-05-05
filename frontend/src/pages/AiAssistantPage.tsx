import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { aiService } from '@/services/ai.service'
import type { AiResult } from '@/types'
import { AiInsightCard } from '@/components/AiInsightCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import type { Resolver } from 'react-hook-form'
import {
  Sparkles,
  Search,
  FileText,
  PenLine,
  MessageSquare,
  Clock,
  ChevronRight,
  Zap,
} from 'lucide-react'

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

const toolConfig: Record<
  ToolKey,
  { icon: typeof Sparkles; gradient: string; description: string }
> = {
  analyze: {
    icon: Search,
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    description: 'Deep analysis of job requirements and key qualifications',
  },
  match: {
    icon: FileText,
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    description: 'Compare your resume against job requirements',
  },
  cover: {
    icon: PenLine,
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    description: 'Generate personalized cover letters instantly',
  },
  interview: {
    icon: MessageSquare,
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    description: 'Practice with AI-generated interview questions',
  },
}

export default function AiAssistantPage() {
  const { t } = useTranslation()
  const [tool, setTool] = useState<ToolKey>('analyze')
  const [result, setResult] = useState<AiResult | null>(null)

  const schemas = useMemo(() => {
    return {
      analyzeSchema: z.object({
        vacancyId: z.string().optional(),
        vacancyText: z.string().min(30, t('forms.validation.minLength', { length: 30 })).optional(),
      }),
      matchSchema: z.object({
        vacancyId: z.string().optional(),
        vacancyText: z.string().min(30, t('forms.validation.minLength', { length: 30 })).optional(),
        resumeText: z.string().min(80, t('forms.validation.minLength', { length: 80 })),
      }),
      coverLetterSchema: z.object({
        vacancyId: z.string().optional(),
        vacancyText: z.string().min(30, t('forms.validation.minLength', { length: 30 })).optional(),
        resumeText: z.string().min(80, t('forms.validation.minLength', { length: 80 })).optional(),
        tone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'ENTHUSIASTIC']).default('PROFESSIONAL'),
        additionalContext: z.string().optional(),
      }),
      interviewSchema: z.object({
        vacancyId: z.string().optional(),
        vacancyText: z.string().min(30, t('forms.validation.minLength', { length: 30 })).optional(),
        focusArea: z.string().optional(),
        count: z.coerce.number().int().min(3).max(15).default(5),
      }),
    }
  }, [t])

  const schema = useMemo(() => {
    if (tool === 'analyze') return schemas.analyzeSchema
    if (tool === 'match') return schemas.matchSchema
    if (tool === 'cover') return schemas.coverLetterSchema
    return schemas.interviewSchema
  }, [tool, schemas])

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

  const ToolIcon = toolConfig[tool].icon

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]" />
        <div className="relative px-6 py-10 md:px-10 md:py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-violet-500/30 rounded-full" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {t('aiAssistant.title')}
              </h1>
              <p className="text-sm text-white/50">{t('aiAssistant.subtitle')}</p>
            </div>
          </div>
          <p className="max-w-xl text-[15px] leading-relaxed text-white/40">
            {t('aiAssistant.heroDescription')}
          </p>
        </div>
      </header>

      <div className="px-6 py-8 md:px-10">
        {/* Tool Selector - Horizontal Pills */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {(Object.keys(toolConfig) as ToolKey[]).map((key) => {
              const config = toolConfig[key]
              const Icon = config.icon
              const isActive = tool === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTool(key)}
                  className={cn(
                    'group relative flex items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'bg-white/[0.08] text-white shadow-lg shadow-black/20'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/10 via-transparent to-transparent" />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-violet-400' : 'text-white/30 group-hover:text-white/50'
                    )}
                  />
                  <span className="relative">{t(`aiAssistant.tools.${key}`)}</span>
                  {isActive && (
                    <span className="ml-1 flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
                    </span>
                  )}
                </button>
              )
            })}
            <span className="ml-auto shrink-0 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/30 border border-white/[0.06]">
              {t('aiAssistant.mockMode')}
            </span>
          </div>
        </nav>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form Panel */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              {/* Dynamic gradient based on tool */}
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-50 transition-all duration-500',
                  toolConfig[tool].gradient
                )}
              />

              <div className="relative p-6 md:p-8">
                {/* Tool Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08]">
                    <ToolIcon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {t('aiAssistant.requestTitle')}
                    </h2>
                    <p className="text-sm text-white/40 mt-0.5">
                      {t('aiAssistant.requestDescription')}
                    </p>
                  </div>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={form.handleSubmit(async (values) => {
                    setResult(null)
                    if (tool === 'analyze') {
                      const v = values as z.infer<typeof schemas.analyzeSchema>
                      const res = await aiService.analyzeVacancy({
                        vacancyId: v.vacancyId || undefined,
                        vacancyText: v.vacancyText || undefined,
                      })
                      setResult(res.result)
                      return
                    }
                    if (tool === 'match') {
                      const v = values as z.infer<typeof schemas.matchSchema>
                      const res = await aiService.resumeMatch({
                        vacancyId: v.vacancyId || undefined,
                        vacancyText: v.vacancyText || undefined,
                        resumeText: v.resumeText,
                      })
                      setResult(res.result)
                      return
                    }
                    if (tool === 'cover') {
                      const v = values as z.infer<typeof schemas.coverLetterSchema>
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
                    const v = values as z.infer<typeof schemas.interviewSchema>
                    const res = await aiService.generateInterviewQuestions({
                      vacancyId: v.vacancyId || undefined,
                      vacancyText: v.vacancyText || undefined,
                      focusArea: v.focusArea || undefined,
                      count: v.count,
                    })
                    setResult(res.result)
                  })}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                        {t('aiAssistant.vacancyIdOptional')}
                      </label>
                      <input
                        className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
                        {...form.register('vacancyId')}
                        placeholder="v1"
                      />
                    </div>

                    {tool === 'interview' && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                          {t('aiAssistant.questionCount')}
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
                          type="number"
                          {...form.register('count')}
                        />
                      </div>
                    )}

                    {tool === 'interview' && (
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                          {t('aiAssistant.focusAreaOptional')}
                        </label>
                        <input
                          className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
                          {...form.register('focusArea')}
                          placeholder={t('aiAssistant.focusAreaPlaceholder')}
                        />
                      </div>
                    )}

                    {tool === 'cover' && (
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                          {t('aiAssistant.tone')}
                        </label>
                        <select
                          className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10 appearance-none cursor-pointer"
                          {...form.register('tone')}
                        >
                          <option value="PROFESSIONAL" className="bg-[#0a0f1a] text-white">
                            {t('aiAssistant.toneProfessional')}
                          </option>
                          <option value="FRIENDLY" className="bg-[#0a0f1a] text-white">
                            {t('aiAssistant.toneFriendly')}
                          </option>
                          <option value="ENTHUSIASTIC" className="bg-[#0a0f1a] text-white">
                            {t('aiAssistant.toneEnthusiastic')}
                          </option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                      {t('aiAssistant.vacancyTextOptional')}
                    </label>
                    <textarea
                      className="min-h-[120px] w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white leading-relaxed placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
                      {...form.register('vacancyText')}
                      placeholder={t('aiAssistant.vacancyTextPlaceholder')}
                    />
                    {form.formState.errors.vacancyText && (
                      <p className="text-xs text-rose-400 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-rose-400" />
                        {form.formState.errors.vacancyText.message}
                      </p>
                    )}
                  </div>

                  {(tool === 'match' || tool === 'cover') && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                        {tool === 'match'
                          ? t('aiAssistant.resumeText')
                          : t('aiAssistant.resumeTextOptional')}
                      </label>
                      <textarea
                        className="min-h-[120px] w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white leading-relaxed placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
                        {...form.register('resumeText')}
                        placeholder={t('aiAssistant.resumeTextPlaceholder')}
                      />
                      {form.formState.errors.resumeText && (
                        <p className="text-xs text-rose-400 flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-rose-400" />
                          {form.formState.errors.resumeText.message}
                        </p>
                      )}
                    </div>
                  )}

                  {tool === 'cover' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-white/30">
                        {t('aiAssistant.additionalContextOptional')}
                      </label>
                      <textarea
                        className="min-h-[90px] w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-white leading-relaxed placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-500/10"
                        {...form.register('additionalContext')}
                        placeholder={t('aiAssistant.additionalContextPlaceholder')}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className={cn(
                      'group relative w-full h-12 rounded-lg font-medium text-sm transition-all duration-300 overflow-hidden',
                      form.formState.isSubmitting
                        ? 'bg-white/[0.06] text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5'
                    )}
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {form.formState.isSubmitting ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                          {t('aiAssistant.generating')}
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          {t('aiAssistant.generate')}
                        </>
                      )}
                    </span>
                    {!form.formState.isSubmitting && (
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Results & History Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Result Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <Sparkles className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {t('aiAssistant.resultTitle')}
                    </h3>
                    <p className="text-xs text-white/30">{t('aiAssistant.resultDescription')}</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {result ? (
                  <AiInsightCard result={result} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 blur-2xl bg-violet-500/10 rounded-full" />
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                        <Sparkles className="h-6 w-6 text-white/20" />
                      </div>
                    </div>
                    <h4 className="text-sm font-medium text-white/60 mb-1">
                      {t('aiAssistant.noResultTitle')}
                    </h4>
                    <p className="text-xs text-white/30 max-w-[200px]">
                      {t('aiAssistant.noResultDescription')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* History Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                    <Clock className="h-4 w-4 text-white/40" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {t('aiAssistant.historyTitle')}
                    </h3>
                    <p className="text-xs text-white/30">{t('aiAssistant.historyDescription')}</p>
                  </div>
                </div>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white/[0.06] px-2 text-xs font-medium text-white/40">
                  {history.length}
                </span>
              </div>

              <div className="p-4">
                {isLoadingHistory ? (
                  <LoadingState message={t('aiAssistant.loadingHistory')} className="py-10" />
                ) : history.length === 0 ? (
                  <EmptyState
                    title={t('aiAssistant.noHistoryTitle')}
                    description={t('aiAssistant.noHistoryDescription')}
                    className="py-10"
                  />
                ) : (
                  <div className="space-y-3">
                    {history.slice(0, 4).map((r, idx) => (
                      <div
                        key={r.id}
                        className="group relative rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/[0.08] hover:bg-white/[0.04] cursor-pointer"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <AiInsightCard result={r} compact />
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 transition-all group-hover:text-white/30 group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .group:hover .animate-shimmer {
          animation: shimmer 1s ease-out;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
