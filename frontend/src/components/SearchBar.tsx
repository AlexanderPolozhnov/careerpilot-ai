import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function SearchBar({
  value,
  onValueChange,
  placeholder = 'Search…',
  className,
  inputClassName,
}: SearchBarProps) {
  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim" />
      <input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn('input pl-9', inputClassName)}
      />
    </div>
  )
}

