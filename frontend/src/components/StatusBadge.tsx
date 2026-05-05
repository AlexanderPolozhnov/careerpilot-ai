import { cn, getStatusMeta } from '@/lib/utils'
import type { ApplicationStatus, VacancyStatus } from '@/types'

interface StatusBadgeProps {
  status: ApplicationStatus | VacancyStatus
  kind?: 'application' | 'vacancy'
  className?: string
  size?: 'sm' | 'md' // size is no longer used by ds-badge but kept for prop compatibility
}

const getDesignSystemBadgeClass = (status: ApplicationStatus | VacancyStatus): string => {
  switch (status) {
    // Application Statuses
    case 'NEW':
    case 'SAVED':
      return 'ds-badge-neutral'
    case 'APPLIED':
    case 'HR_SCREEN':
      return 'ds-badge-primary'
    case 'TECH_INTERVIEW':
    case 'FINAL_ROUND':
      return 'ds-badge-warning'
    case 'OFFER':
      return 'ds-badge-success'
    case 'REJECTED':
      return 'ds-badge-danger'
    // Vacancy Statuses
    case 'ACTIVE':
      return 'ds-badge-success'
    case 'ARCHIVED':
    case 'EXPIRED':
      return 'ds-badge-neutral'
    default:
      return 'ds-badge-neutral'
  }
}

export function StatusBadge({ status, kind, className }: StatusBadgeProps) {
  const meta = getStatusMeta(status, kind)
  const badgeClass = getDesignSystemBadgeClass(status)

  return (
    <span className={cn('ds-badge', badgeClass, className)}>
      <span className="ds-badge-dot" />
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
