import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { applicationService, type ApplicationStatusHistory } from '@/services/application.service.ts'
import { formatRelative, formatDateTime, cn, APPLICATION_STATUS_KEYS, LEGACY_STATUS_MAP } from '@/lib/utils'
import type { ApplicationStatus } from '@/types'

interface ApplicationTimelineModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string | null
}

export default function ApplicationTimelineModal({ isOpen, onClose, applicationId }: ApplicationTimelineModalProps) {
  const { t } = useTranslation()

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['applicationHistory', applicationId],
    queryFn: () => (applicationId ? applicationService.getHistory(applicationId) : Promise.resolve([])),
    enabled: isOpen && !!applicationId,
  })

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop - higher z-index than topbar */}
      <div className="fixed inset-0 z-[90] m-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Modal content - even higher z-index */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-lg mx-4 bg-[#0f0f11] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.08)]">
            <h2 className="text-lg font-semibold text-[#e8eaed]">{t('applications.timeline.title')}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#6b7590] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.08)] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-[#6b7590]">
                {t('common.loading')}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#6b7590]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-[#6b7590]">{t('applications.timeline.noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-0">
                {history.map((item, index) => (
                  <TimelineItem key={item.id} item={item} isLast={index === history.length - 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function StatusWithTooltip({
  label,
  statusKey,
}: {
  label: string
  statusKey: string | null
}) {
  return (
    <span className="relative group/stip inline-flex items-center">
      <span className="font-medium text-[#e8eaed]">{label}</span>
      {statusKey && (
        <span className="absolute bottom-full left-0 mb-1.5 px-2 py-1.5 rounded-lg text-[10px] bg-[#1a1a1e] border border-violet-500/20 whitespace-nowrap pointer-events-none opacity-0 group-hover/stip:opacity-100 transition-opacity duration-75 z-20 shadow-lg shadow-black/40 min-w-max">
          <span className="block text-[#e8eaed]">{label}</span>
          <span className="block font-mono text-violet-400/70">{statusKey}</span>
        </span>
      )}
    </span>
  )
}

function TimelineItem({ item, isLast }: { item: ApplicationStatusHistory; isLast: boolean }) {
  const { t } = useTranslation()

  const getStatusKey = (status: string | null): string | null => {
    if (!status) return null
    // Handle legacy "FINAL" status that should be "FINAL_ROUND"
    const normalizedStatus = LEGACY_STATUS_MAP[status] ?? status
    return APPLICATION_STATUS_KEYS[normalizedStatus as ApplicationStatus] ?? null
  }

  const getStatusLabel = (status: string | null): string => {
    if (!status) return t('applications.timeline.initial')
    const key = getStatusKey(status)
    return key ? t(key) : status
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-slate-500'
    const colors: Record<string, string> = {
      NEW: 'bg-slate-500',
      SAVED: 'bg-blue-500',
      APPLIED: 'bg-violet-500',
      HR_SCREEN: 'bg-amber-500',
      TECH_INTERVIEW: 'bg-cyan-500',
      FINAL_ROUND: 'bg-purple-500',
      OFFER: 'bg-emerald-500',
      REJECTED: 'bg-red-500',
    }
    return colors[status] || 'bg-slate-500'
  }

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-[rgba(139,92,246,0.3)] to-transparent" />
      )}

      {/* Timeline dot */}
      <div className={cn(
        'absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-[#0f0f11] flex items-center justify-center',
        getStatusColor(item.toStatus)
      )}>
        <div className="w-2.5 h-2.5 rounded-full bg-current opacity-80" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <StatusWithTooltip label={getStatusLabel(item.fromStatus)} statusKey={getStatusKey(item.fromStatus)} />
          <span className="text-[#4a4e5a]">→</span>
          <StatusWithTooltip label={getStatusLabel(item.toStatus)} statusKey={getStatusKey(item.toStatus)} />
          <span className="text-[11px] text-[#6b7590] ml-auto">
            {formatRelative(item.createdAt)}
          </span>
        </div>

        {item.notes && (
          <p className="text-sm text-[#8b8fa3] italic bg-[rgba(255,255,255,0.02)] rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.04)]">
            "{item.notes}"
          </p>
        )}

        <div className="text-[11px] text-[#4a4e5a]">
          {formatDateTime(item.createdAt)}
        </div>
      </div>
    </div>
  )
}
