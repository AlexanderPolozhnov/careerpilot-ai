import {useTranslation} from 'react-i18next'
import {ChevronRight, Sparkles} from 'lucide-react'
import {cn, formatRelative} from '@/lib/utils'
import type {AiResult} from '@/types'

interface AiInsightCardProps {
    result: AiResult
    compact?: boolean
    className?: string
}

export function AiInsightCard({result, compact, className}: AiInsightCardProps) {
    const {t} = useTranslation()
    const preview = (result.result ?? '').slice(0, compact ? 120 : 300)

    return (
        <div
            className={cn(
                'card card-hover p-5 relative overflow-hidden cursor-pointer group',
                className,
            )}
        >
            {/* Glow accent */}
            <div
                className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent/60 via-accent/30 to-transparent"/>

            <div className="flex items-start gap-3">
                <div
                    className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-accent"/>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              AI {result.type.replace('_', ' ')}
            </span>
                        <span className="text-xs text-ink-dim">{formatRelative(result.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed line-clamp-3">
                        {preview}
                        {(result.result ?? '').length > preview.length ? '…' : ''}
                    </p>
                    {!compact && (
                        <button
                            className="mt-3 flex items-center gap-1 text-xs text-accent hover:text-accent-dim transition-colors">
                            {t('aiAssistant.viewFullAnalysis')} <ChevronRight className="w-3 h-3"/>
                        </button>
                    )}
                </div>
                {compact && (
                    <ChevronRight
                        className="w-4 h-4 text-ink-dim group-hover:text-ink transition-colors flex-shrink-0 mt-1"/>
                )}
            </div>
        </div>
    )
}

// Simple loading placeholder
export function AiInsightCardSkeleton({className}: { className?: string }) {
    return (
        <div className={cn('card p-5', className)}>
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-3 animate-pulse flex-shrink-0"/>
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-24"/>
                    <div className="skeleton h-3 w-full"/>
                    <div className="skeleton h-3 w-3/4"/>
                </div>
            </div>
        </div>
    )
}
