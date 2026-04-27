import { cn } from '@/lib/utils'
export { EmptyState } from './EmptyState'
export { LoadingState } from './LoadingState'
export { ErrorState } from './ErrorState'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 rounded', className)} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-5 space-y-3', className)}>
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-2/3" />
      <SkeletonLine className="w-1/2" />
    </div>
  )
}
