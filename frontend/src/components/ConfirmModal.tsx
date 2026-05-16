import { useTranslation } from 'react-i18next'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative w-full max-w-md bg-[#0c0c0e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-up">
        {/* Header with icon */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isDestructive ? "bg-red-500/10 text-red-400" : "bg-violet-500/10 text-violet-400"
            )}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
            {title}
          </h3>
          <p className="text-sm text-white/40 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg",
              isDestructive 
                ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/30" 
                : "bg-violet-500 text-white shadow-violet-500/20 hover:bg-violet-600 hover:shadow-violet-500/30",
              isLoading && "opacity-70 cursor-wait"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('common.loading')}
              </span>
            ) : (
              confirmText || t('common.delete')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
