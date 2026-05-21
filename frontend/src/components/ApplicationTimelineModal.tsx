import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { applicationService, type ApplicationStatusHistory } from '@/services/application.service.ts'
import { formatRelative, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-[#0f0f11] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl">
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
  )
}

function TimelineItem({ item, isLast }: { item: ApplicationStatusHistory; isLast: boolean }) {
  const { t } = useTranslation()

  const getStatusLabel = (status: string | null) => {
    if (!status) return t('applications.timeline.initial')
    const key = `applications.${status.toLowerCase().replace('_', '')}`
    return t(key, status)
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
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#e8eaed]">
            {getStatusLabel(item.fromStatus)} → {getStatusLabel(item.toStatus)}
          </span>
          <span className="text-[11px] text-[#6b7590]">
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
