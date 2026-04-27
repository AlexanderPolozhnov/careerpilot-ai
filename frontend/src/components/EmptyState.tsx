import type { ReactNode } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-ink-dim" />
      </div>
      <h3 className="text-base font-medium text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

