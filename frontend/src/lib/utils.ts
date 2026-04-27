import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { ApplicationStatus, ContractType, RemoteType, TaskPriority, VacancyStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy · HH:mm')
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  NEW: {
    label: 'New',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  SAVED: {
    label: 'Saved',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  APPLIED: {
    label: 'Applied',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  HR_SCREEN: {
    label: 'HR Screen',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  TECH_INTERVIEW: {
    label: 'Tech Interview',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  FINAL_ROUND: {
    label: 'Final Round',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  OFFER: {
    label: 'Offer 🎉',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
}

export const VACANCY_STATUS_META: Record<VacancyStatus, { label: string; color: string; bg: string }> =
  {
    ACTIVE: {
      label: 'Active',
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
    },
    ARCHIVED: {
      label: 'Archived',
      color: 'text-slate-300',
      bg: 'bg-slate-500/10',
    },
    EXPIRED: {
      label: 'Expired',
      color: 'text-rose-300',
      bg: 'bg-rose-500/10',
    },
  }

export function getStatusMeta(
  status: ApplicationStatus | VacancyStatus,
  kind?: 'application' | 'vacancy',
): { label: string; color: string; bg: string } {
  if (kind === 'application') return APPLICATION_STATUS_META[status as ApplicationStatus]
  if (kind === 'vacancy') return VACANCY_STATUS_META[status as VacancyStatus]

  return (
    (APPLICATION_STATUS_META as Record<string, { label: string; color: string; bg: string }>)[status] ??
    (VACANCY_STATUS_META as Record<string, { label: string; color: string; bg: string }>)[status] ?? {
      label: String(status),
      color: 'text-slate-300',
      bg: 'bg-slate-500/10',
    }
  )
}

export const REMOTE_TYPE_LABELS: Record<RemoteType, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ON_SITE: 'On-site',
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
}

export const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'text-ink-dim' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400' },
  HIGH: { label: 'High', color: 'text-red-400' },
}

// ─── Currency formatting ──────────────────────────────────────────────────────

export function formatSalary(min?: number, max?: number, currency = 'USD'): string {
  if (!min && !max) return '—'
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n)
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return '—'
}

// ─── Match score color ─────────────────────────────────────────────────────────

export function matchScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-amber-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}
