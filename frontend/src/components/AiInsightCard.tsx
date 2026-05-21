import { Sparkles, Search, FileText, PenLine, MessageSquare, Clock, Zap, FileEdit } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn, formatRelative } from '@/lib/utils'
import type { AiResult } from '@/types'

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
}

export function AiInsightCard({ result, compact, className }: AiInsightCardProps) {
  const cleanText = (result.result ?? '').replace(/[#*`_~]/g, '').trim()
  const preview = cleanText.slice(0, compact ? 100 : 400)
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
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1">
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                colorClass.split(' ')[0]
              )}
            >
              {result.type.replace(/_/g, ' ')}
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {(result.latencyMs !== undefined || result.tokensUsed !== undefined) && (
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/30">
                  {result.latencyMs !== undefined && (
                    <span className="flex items-center gap-0.5 text-violet-400">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDuration(result.latencyMs)}
                    </span>
                  )}
                  {result.tokensUsed !== undefined && result.tokensUsed > 0 && (
                    <span className="flex items-center gap-0.5 border-l border-white/10 pl-1.5">
                      <Zap className="h-2.5 w-2.5" />
                      {result.tokensUsed}
                    </span>
                  )}
                </div>
              )}
              <span className="text-[10px] text-white/20 whitespace-nowrap">{formatRelative(result.createdAt)}</span>
            </div>
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
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-2">
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                colorClass.split(' ')[0]
              )}
            >
              {result.type.replace(/_/g, ' ')}
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {(result.latencyMs !== undefined || result.tokensUsed !== undefined) && (
                <div className="flex items-center gap-3 text-[10px] font-medium text-white/20 uppercase tracking-widest">
                  {result.latencyMs !== undefined && (
                    <span className="flex items-center gap-1 text-violet-400">
                      <Clock className="h-3 w-3" />
                      {formatDuration(result.latencyMs)}
                    </span>
                  )}
                  {result.tokensUsed !== undefined && result.tokensUsed > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {result.tokensUsed}
                    </span>
                  )}
                </div>
              )}
              <span className="text-xs text-white/25 whitespace-nowrap">
                {formatRelative(result.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-white [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:text-white [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-5 [&>h3]:mb-2 [&>h3]:text-white [&>p]:mb-4 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 last:[&>ul]:mb-0 [&>ul>li]:mb-1.5 last:[&>ul>li]:mb-0 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 last:[&>ol]:mb-0 [&>ol>li]:mb-1.5 last:[&>ol>li]:mb-0 [&_strong]:text-white [&_strong]:font-semibold [&_a]:text-violet-400 [&_a]:underline">
            <ReactMarkdown>{result.result || ''}</ReactMarkdown>
          </div>
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
