import { Sparkles, Search, FileText, PenLine, MessageSquare, Clock, Zap, FileEdit, AlertTriangle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn, formatRelative } from '@/lib/utils'
import type { AiResult } from '@/types'
import { useTranslation } from 'react-i18next'

function formatDuration(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}с`
  }
  return `${ms}мс`
}

const typeIcons: Record<string, typeof Sparkles> = {
  VACANCY_ANALYSIS: Search,
  RESUME_MATCH: FileText,
  COVER_LETTER: PenLine,
  INTERVIEW_QUESTIONS: MessageSquare,
  RESUME_GENERATION: FileEdit,
}

const typeColors: Record<string, string> = {
  VACANCY_ANALYSIS: 'text-violet-400 bg-violet-500/10',
  RESUME_MATCH: 'text-blue-400 bg-blue-500/10',
  COVER_LETTER: 'text-emerald-400 bg-emerald-500/10',
  INTERVIEW_QUESTIONS: 'text-amber-400 bg-amber-500/10',
  RESUME_GENERATION: 'text-violet-400 bg-violet-500/10',
}

interface AiInsightCardProps {
  result: AiResult
  compact?: boolean
  className?: string
  dashboard?: boolean
}

export function AiInsightCard({ result, compact, className, dashboard }: AiInsightCardProps) {
  const { t } = useTranslation()
  const cleanText = (result.result ?? '').replace(/[#*`_~]/g, '').trim()
  const Icon = typeIcons[result.type] || Sparkles
  const colorClass = typeColors[result.type] || 'text-violet-400 bg-violet-500/10'

  const cardClasses = cn(
    'group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]',
    dashboard ? 'h-[260px] flex flex-col' : '',
    className
  )

  if (compact && !dashboard) {
    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            colorClass.split(' ')[1]
          )}
        >
          <Icon className={cn('h-4 w-4', colorClass.split(' ')[0])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider',
                  colorClass.split(' ')[0]
                )}
              >
                {t(`aiAssistant.types.${result.type}`)}
              </span>
              {result.isFallback && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-tighter">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {t('aiAssistant.fallbackMode')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {(result.latencyMs !== undefined || result.tokensUsed !== undefined) && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/30">
                  {result.latencyMs !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3 animate-clock-spin" />
                      <span className="text-violet-400">{formatDuration(result.latencyMs)}</span>
                    </span>
                  )}
                  {result.tokensUsed !== undefined && result.tokensUsed > 0 && (
                    <span className="flex items-center gap-0.5 border-l border-white/10 pl-1.5 text-violet-400/80">
                      <Zap className="h-2 w-2 animate-zap-glow" />
                      {result.tokensUsed}
                    </span>
                  )}
                </div>
              )}
              <span className="text-[10px] text-white/20 whitespace-nowrap">{formatRelative(result.createdAt)}</span>
            </div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
            {cleanText.slice(0, 100)}
            {cleanText.length > 100 ? '...' : ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClasses}>
      {/* Subtle glow */}
      {!dashboard && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      )}

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] transition-transform duration-300 group-hover:scale-105',
            colorClass.split(' ')[1]
          )}
        >
          <Icon className={cn('h-5 w-5', colorClass.split(' ')[0])} />
        </div>

        <div className="flex-1 min-w-0 flex items-center h-11">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 w-full">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  colorClass.split(' ')[0]
                )}
              >
                {t(`aiAssistant.types.${result.type}`)}
              </span>
              {result.isFallback && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase tracking-tighter">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {t('aiAssistant.fallbackMode')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium text-white/20 uppercase tracking-widest">
              {result.latencyMs !== undefined && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 animate-clock-spin" />
                  <span className="text-violet-400">{formatDuration(result.latencyMs)}</span>
                </span>
              )}
              {result.tokensUsed !== undefined && result.tokensUsed > 0 && (
                <span className="flex items-center gap-1 text-violet-400/80">
                  <Zap className="h-3 w-3 animate-zap-glow" />
                  {result.tokensUsed}
                </span>
              )}
              <span className="text-xs text-white/25 whitespace-nowrap lowercase tracking-normal">
                {formatRelative(result.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 mb-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className={cn(
        "text-sm text-white/70 leading-snug whitespace-pre-wrap overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-violet-500/10 [&::-webkit-scrollbar-thumb]:rounded-full [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-1 [&>h1]:text-white [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>h2]:text-white [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-0.5 [&>h3]:text-white [&>p]:mb-4 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-2 last:[&>ul]:mb-0 [&>ul>li]:mb-0.5 last:[&>ul>li]:mb-0 [&>ul]:mt-0 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-2 last:[&>ol]:mb-0 [&>ol>li]:mb-0.5 last:[&>ol>li]:mb-0 [&>ol]:mt-0 [&_strong]:text-white [&_strong]:font-semibold [&_a]:text-violet-400 [&_a]:underline",
        dashboard ? "flex-1 mt-2" : "max-h-[280px] mt-1"
      )}>
        <ReactMarkdown>{result.result || ''}</ReactMarkdown>
      </div>
    </div>
  )
}

export function AiInsightCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] bg-white/[0.02] p-5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-white/[0.04] animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-white/[0.04] animate-pulse" />
        </div>
      </div>
    </div>
  )
}
