import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, RefreshCw, CheckSquare, Square, AlertCircle, Loader2 } from 'lucide-react'
import { integrationService, type HhPreviewData } from '@/services/integration.service'

interface SyncItemProps {
  fieldName: string
  currentValue: string
  hhValue: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function SyncItem({ fieldName, currentValue, hhValue, checked, onChange }: SyncItemProps) {
  const { t } = useTranslation()
  const hasChanged = currentValue !== hhValue && hhValue

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        checked
          ? 'border-violet-500/40 bg-violet-500/5'
          : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      } ${!hasChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => hasChanged && onChange(!checked)}
    >
      <div className="mt-0.5 shrink-0">
        {checked ? (
          <CheckSquare className="w-4 h-4 text-violet-400" />
        ) : (
          <Square className="w-4 h-4 text-white/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40 mb-1 font-medium uppercase tracking-wide">
          {t(`hh.sync.fields.${fieldName}`, { defaultValue: fieldName })}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[11px] text-white/30 mb-0.5">{t('hh.sync.current')}</p>
            <p className="text-xs text-white/60 truncate">
              {currentValue || <span className="text-white/20 italic">{t('hh.sync.empty')}</span>}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-violet-400/60 mb-0.5">{t('hh.sync.fromHh')}</p>
            <p className="text-xs text-white truncate">
              {hhValue || <span className="text-white/20 italic">{t('hh.sync.empty')}</span>}
            </p>
          </div>
        </div>
        {!hasChanged && (
          <p className="text-[10px] text-white/20 mt-1">{t('hh.sync.noChanges')}</p>
        )}
      </div>
    </div>
  )
}

interface ProfileSyncModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile?: {
    name?: string
    location?: string
    skills?: string[]
    yearsOfExperience?: number
    headline?: string
  }
}

export function ProfileSyncModal({ isOpen, onClose, currentProfile = {} }: ProfileSyncModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())

  const {
    data: hhData,
    isLoading,
    error,
  } = useQuery<HhPreviewData>({
    queryKey: ['hh-preview'],
    queryFn: () => integrationService.getHhPreview(),
    enabled: isOpen,
    staleTime: 60_000,
  })

  const syncMutation = useMutation({
    mutationFn: (fields: string[]) => integrationService.syncHhProfile(fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      onClose()
    },
  })

  if (!isOpen) return null

  const toggleField = (field: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const handleSync = () => {
    syncMutation.mutate(Array.from(selectedFields))
  }

  const formatSkills = (skills?: string[]) =>
    skills?.join(', ') || ''

  const fields: Array<{ key: keyof HhPreviewData; current: string; hh: string }> = [
    {
      key: 'name',
      current: currentProfile.name || '',
      hh: hhData?.name || '',
    },
    {
      key: 'location',
      current: currentProfile.location || '',
      hh: hhData?.location || '',
    },
    {
      key: 'headline',
      current: currentProfile.headline || '',
      hh: hhData?.headline || '',
    },
    {
      key: 'skills',
      current: formatSkills(currentProfile.skills),
      hh: formatSkills(hhData?.skills),
    },
    {
      key: 'yearsOfExperience',
      current: currentProfile.yearsOfExperience != null ? String(currentProfile.yearsOfExperience) : '',
      hh: hhData?.yearsOfExperience != null ? String(hhData.yearsOfExperience) : '',
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#d52b1e]/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-[#d52b1e]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{t('hh.sync.title')}</h2>
              <p className="text-xs text-white/40">{t('hh.sync.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-sm text-white/40">{t('hh.sync.loading')}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-white/60">{t('hh.sync.error')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-white/40 mb-3">{t('hh.sync.hint')}</p>
              {fields.map(({ key, current, hh }) => (
                <SyncItem
                  key={key}
                  fieldName={key}
                  currentValue={current}
                  hhValue={hh}
                  checked={selectedFields.has(key)}
                  onChange={() => toggleField(key)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-white/[0.06]">
          <p className="text-xs text-white/30">
            {t('hh.sync.selectedCount', { count: selectedFields.size })}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={selectedFields.size === 0 || syncMutation.isPending}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('hh.sync.syncButton')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
