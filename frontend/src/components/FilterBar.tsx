import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  left?: ReactNode
  right?: ReactNode
  className?: string
}

export function FilterBar({ left, right, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        'card px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2 justify-between md:justify-end">{right}</div>
    </div>
  )
}

