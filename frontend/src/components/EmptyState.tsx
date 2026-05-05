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
    <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 blur-2xl bg-white/[0.02] rounded-full" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <Icon className="h-6 w-6 text-white/20" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-white/60 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-white/30 max-w-[220px] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
