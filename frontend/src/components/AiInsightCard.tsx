import { useTranslation } from 'react-i18next'
import { ChevronRight, Sparkles, Search, FileText, PenLine, MessageSquare } from 'lucide-react'
import { cn, formatRelative } from '@/lib/utils'
import type { AiResult } from '@/types'

const typeIcons: Record<string, typeof Sparkles> = {
  VACANCY_ANALYSIS: Search,
  RESUME_MATCH: FileText,
  COVER_LETTER: PenLine,
  INTERVIEW_QUESTIONS: MessageSquare,
}

const typeColors: Record<string, string> = {
  VACANCY_ANALYSIS: 'text-violet-400 bg-violet-500/10',
  RESUME_MATCH: 'text-blue-400 bg-blue-500/10',
  COVER_LETTER: 'text-emerald-400 bg-emerald-500/10',
  INTERVIEW_QUESTIONS: 'text-amber-400 bg-amber-500/10',
}

interface AiInsightCardProps {
  result: AiResult
  compact?: boolean
  className?: string
}

export function AiInsightCard({ result, compact, className }: AiInsightCardProps) {
  const { t } = useTranslation()
  const preview = (result.result ?? '').slice(0, compact ? 100 : 400)
  const Icon = typeIcons[result.type] || Sparkles
  const colorClass = typeColors[result.type] || 'text-violet-400 bg-violet-500/10'

  if (compact) {
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
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                colorClass.split(' ')[0]
              )}
            >
              {result.type.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] text-white/20">{formatRelative(result.createdAt)}</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
            {preview}
            {(result.result ?? '').length > preview.length ? '...' : ''}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]',
        className
      )}
    >
      {/* Subtle glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] transition-transform duration-300 group-hover:scale-105',
            colorClass.split(' ')[1]
          )}
        >
          <Icon className={cn('h-5 w-5', colorClass.split(' ')[0])} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                colorClass.split(' ')[0]
              )}
            >
              {result.type.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-white/25 shrink-0">
              {formatRelative(result.createdAt)}
            </span>
          </div>

          <p className="text-sm text-white/60 leading-relaxed line-clamp-4">
            {preview}
            {(result.result ?? '').length > preview.length ? '...' : ''}
          </p>

          <button className="mt-4 flex items-center gap-1.5 text-xs font-medium text-violet-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-violet-300">
            {t('aiAssistant.viewFullAnalysis')}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
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
