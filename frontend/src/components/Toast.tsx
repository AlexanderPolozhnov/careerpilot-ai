/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import type { ToastType } from '@/lib/toast'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, message, type, duration }])

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
    },
    [removeToast]
  )

  useEffect(() => {
    toast._setListener(showToast)
    return () => {
      toast._setListener(null)
    }
  }, [showToast])

  const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast])
  const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast])
  const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast])
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 w-full max-w-[380px] pointer-events-none">
        {toasts.map((toast, index) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)} 
            index={index}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose, index }: { toast: Toast; onClose: () => void; index: number }) {
  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/5',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      glowColor: 'shadow-rose-500/5',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/5',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/5',
    },
  }

  const { icon: Icon, iconColor, bgColor, borderColor, glowColor } = config[toast.type]

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl pointer-events-auto',
        'bg-[#0f0f10]/95 shadow-2xl',
        borderColor,
        glowColor,
        'animate-in slide-in-from-right-full fade-in duration-300 ease-out',
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)'
      }}
      role="alert"
    >
      {/* Icon container with subtle glow */}
      <div className={cn('shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', bgColor)}>
        <Icon className={cn('w-[18px] h-[18px]', iconColor)} />
      </div>
      
      {/* Message */}
      <div className="flex-1 pt-1">
        <p className="text-[13px] font-medium text-white/90 leading-relaxed whitespace-pre-wrap">
          {toast.message}
        </p>
      </div>
      
      {/* Close button */}
      <button
        onClick={onClose}
        className={cn(
          'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
          'text-white/30 hover:text-white/60 hover:bg-white/[0.06]',
          'transition-all duration-150'
        )}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full',
              toast.type === 'success' && 'bg-emerald-500/50',
              toast.type === 'error' && 'bg-rose-500/50',
              toast.type === 'info' && 'bg-blue-500/50',
              toast.type === 'warning' && 'bg-amber-500/50',
            )}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
