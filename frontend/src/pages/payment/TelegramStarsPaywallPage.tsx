import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles, CheckCircle2, XCircle, Star, Loader2, CreditCard } from 'lucide-react'
import { integrationService } from '@/services/integration.service'
import { isTelegramWebApp } from '@/lib/telegram'

interface TelegramWindow {
  Telegram?: {
    WebApp?: {
      initData?: string;
      initDataUnsafe?: {
        start_param?: string;
      };
      openInvoice: (url: string, callback: (status: string) => void) => void;
    };
  };
}

export default function TelegramStarsPaywallPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED'>('IDLE')
  
  const autoOpenedRef = useRef<boolean>(false)

  // Получаем paymentId из start_param или URL параметров во время рендера
  const tg = (window as unknown as TelegramWindow).Telegram?.WebApp
  const startParam = tg?.initDataUnsafe?.start_param || ''
  let paymentId = searchParams.get('paymentId')

  if (startParam && startParam.startsWith('pay_stars_')) {
    paymentId = startParam.substring('pay_stars_'.length)
  }

  // Опрос статуса платежа на бэкенде
  const pollPaymentStatus = useCallback(async () => {
    if (!paymentId) return

    let attempts = 0
    const maxAttempts = 10
    const interval = setInterval(async () => {
      try {
        attempts++
        const res = await integrationService.getStarsPaymentStatus(paymentId!)
        if (res.status === 'COMPLETED') {
          clearInterval(interval)
          setPaymentStatus('COMPLETED')
          // Перенаправляем на дашборд через 3 секунды
          setTimeout(() => {
            navigate('/app/dashboard')
          }, 3000)
        } else if (res.status === 'FAILED') {
          clearInterval(interval)
          setPaymentStatus('FAILED')
          setError('payment.stars.verificationFailed')
        } else if (attempts >= maxAttempts) {
          clearInterval(interval)
          setPaymentStatus('FAILED')
          setError('payment.stars.timeout')
        }
      } catch (e) {
        console.error('Error polling payment status', e)
      }
    }, 2000)
  }, [paymentId, navigate])

  // Открытие нативного окна оплаты Telegram
  const handleOpenInvoice = useCallback((link: string) => {
    const tgInstance = (window as unknown as TelegramWindow).Telegram?.WebApp
    if (!tgInstance) {
      setError('payment.stars.notInTma')
      return
    }

    setPaymentStatus('PENDING')
    tgInstance.openInvoice(link, (status: string) => {
      console.log('Telegram invoice status:', status)
      if (status === 'paid') {
        setPaymentStatus('PAID')
        pollPaymentStatus()
      } else if (status === 'cancelled') {
        setPaymentStatus('IDLE')
      } else {
        setPaymentStatus('FAILED')
        setError('payment.stars.paymentFailed')
      }
    })
  }, [pollPaymentStatus])

  // Запрос ссылки на инвойс
  const fetchInvoiceLink = useCallback(async (pId: string) => {
    try {
      setInvoiceLoading(true)
      setError(null)
      const data = await integrationService.getStarsInvoiceLink(pId)
      setInvoiceLink(data.invoiceLink)
      setInvoiceLoading(false)
      setLoading(false)
      
      // Автоматически открываем инвойс при загрузке (только один раз)
      if (!autoOpenedRef.current && isTelegramWebApp()) {
        autoOpenedRef.current = true
        // Открываем инвойс после завершения текущего рендера
        Promise.resolve().then(() => {
          handleOpenInvoice(data.invoiceLink)
        })
      }
    } catch (e: unknown) {
      console.error('Failed to get invoice link', e)
      setError('payment.stars.loadingError')
      setInvoiceLoading(false)
      setLoading(false)
    }
  }, [handleOpenInvoice])

  // Загружаем данные по изменению paymentId
  useEffect(() => {
    if (paymentId) {
      Promise.resolve().then(() => {
        fetchInvoiceLink(paymentId)
      })
    } else {
      // Откладываем обновление стейта, чтобы избежать предупреждений React о setState в эффекте
      Promise.resolve().then(() => {
        setLoading(false)
        setError('payment.stars.noPayment')
      })
    }
  }, [paymentId, fetchInvoiceLink])

  // Рендеринг загрузки
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">{t('payment.stars.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Декоративное свечение */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl" />

        {/* Заголовок */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20 mb-4 animate-pulse">
            <Star className="w-8 h-8 text-slate-950 fill-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {t('payment.stars.title')}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {t('payment.stars.premiumTitle')}
          </p>
        </div>

        {/* Текущее состояние */}
        <div className="relative z-10 mb-8">
          {error ? (
            <div className="flex flex-col items-center text-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <XCircle className="w-12 h-12 text-red-500 mb-2" />
              <p className="font-semibold text-red-200">{t(error)}</p>
              <p className="text-xs text-red-400 mt-1">{t('payment.stars.errorDesc')}</p>
              
              {paymentId && (
                <button
                  onClick={() => fetchInvoiceLink(paymentId!)}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold rounded-xl transition"
                >
                  {t('common.retry')}
                </button>
              )}
            </div>
          ) : paymentStatus === 'COMPLETED' ? (
            <div className="flex flex-col items-center text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
              <p className="font-semibold text-emerald-200">{t('payment.stars.statusSuccess')}</p>
              <p className="text-xs text-emerald-400 mt-1">{t('payment.stars.statusSuccessDesc')}</p>
            </div>
          ) : paymentStatus === 'PAID' ? (
            <div className="flex flex-col items-center text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-2" />
              <p className="font-semibold text-blue-200">{t('payment.stars.statusChecking')}</p>
              <p className="text-xs text-blue-400 mt-1">{t('payment.stars.statusCheckingDesc')}</p>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-200">{t('payment.stars.premiumTitle')}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {t('payment.stars.premiumDesc')}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800/60 pt-4 flex justify-between items-center text-sm">
                <span className="text-slate-400">{t('payment.stars.priceLabel')}</span>
                <span className="font-bold text-amber-400 flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                  200 Stars
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка оплаты */}
        {!error && paymentStatus === 'IDLE' && invoiceLink && (
          <button
            onClick={() => handleOpenInvoice(invoiceLink)}
            disabled={invoiceLoading}
            className="w-full relative z-10 py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 flex items-center justify-center space-x-2 transition-all duration-200"
          >
            {invoiceLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>{t('payment.stars.payButton')}</span>
              </>
            )}
          </button>
        )}

        {/* Не в TMA предупреждение */}
        {!isTelegramWebApp() && (
          <p className="text-xs text-center text-slate-500 mt-4 relative z-10">
            ⚠️ {t('payment.stars.notInTmaWarning')}
          </p>
        )}
      </div>
    </div>
  )
}
