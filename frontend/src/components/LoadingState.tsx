import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="relative mb-4">
        <div className="absolute inset-0 blur-xl bg-violet-500/20 rounded-full animate-pulse" />
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-10 w-10 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute h-10 w-10 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
          <div className="h-4 w-4 rounded-full bg-violet-500/20" />
        </div>
      </div>
      <p className="text-xs text-white/40 font-medium">{message}</p>
    </div>
  )
}
