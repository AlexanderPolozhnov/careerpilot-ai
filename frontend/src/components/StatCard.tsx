import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  accent?: boolean
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'card card-hover p-5 relative overflow-hidden',
        accent && 'border-accent/25',
        className,
      )}
    >
      {accent && (
        <div className="absolute inset-0 bg-accent/6 pointer-events-none" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            {label}
          </p>
          <p
            className={cn(
              'text-3xl font-display font-medium tracking-tight',
              accent ? 'text-accent' : 'text-ink',
            )}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-1.5">
              {trend.value >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              )}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.value >= 0 ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            accent ? 'bg-accent/10' : 'bg-surface-3',
          )}
        >
          <Icon
            className={cn('w-5 h-5', accent ? 'text-accent' : 'text-ink-muted')}
          />
        </div>
      </div>
    </div>
  )
}
