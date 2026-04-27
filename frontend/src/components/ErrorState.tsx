import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-base font-medium text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary text-sm">
          Try again
        </button>
      )}
    </div>
  )
}

