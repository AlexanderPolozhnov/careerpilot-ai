export type ToastType = 'success' | 'error' | 'info' | 'warning'

type ToastListener = (message: string, type: ToastType, duration?: number) => void
let toastListener: ToastListener | null = null

export const toast = {
  show: (message: string, type: ToastType = 'info', duration?: number) => {
    toastListener?.(message, type, duration)
  },
  success: (message: string, duration?: number) => toastListener?.(message, 'success', duration),
  error: (message: string, duration?: number) => toastListener?.(message, 'error', duration),
  info: (message: string, duration?: number) => toastListener?.(message, 'info', duration),
  warning: (message: string, duration?: number) => toastListener?.(message, 'warning', duration),
  
  _setListener: (listener: ToastListener | null) => {
    toastListener = listener
  }
}
