import { cn, getStatusMeta } from '@/lib/utils'
import type { ApplicationStatus, VacancyStatus } from '@/types'

interface StatusBadgeProps {
  status: ApplicationStatus | VacancyStatus
  kind?: 'application' | 'vacancy'
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, kind, className, size = 'md' }: StatusBadgeProps) {
  const meta = getStatusMeta(status, kind)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        meta.bg,
        meta.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full bg-current opacity-80')} />
      {meta.label}
    </span>
  )
}

// Remote badge
interface RemoteBadgeProps {
  remote: string
  className?: string
}
export function RemoteBadge({ remote, className }: RemoteBadgeProps) {
  const config = {
    REMOTE: { label: 'Remote', classes: 'text-emerald-400 bg-emerald-500/10' },
    HYBRID: { label: 'Hybrid', classes: 'text-blue-400 bg-blue-500/10' },
    ON_SITE: { label: 'On-site', classes: 'text-ink-muted bg-surface-3' },
  }[remote] ?? { label: remote, classes: 'text-ink-muted bg-surface-3' }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

// Match score badge
interface MatchScoreBadgeProps {
  score: number
  className?: string
}
export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const color =
    score >= 80
      ? 'text-green-400 bg-green-500/10'
      : score >= 60
        ? 'text-amber-400 bg-amber-500/10'
        : 'text-red-400 bg-red-500/10'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-mono',
        color,
        className,
      )}
    >
      {score}% match
    </span>
  )
}
