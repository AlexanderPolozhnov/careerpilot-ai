import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoadingState } from '@/components/LoadingState'
import { useAuth } from '@/context/useAuth'

type CallbackStatus = 'loading' | 'success' | 'error'
type ErrorType = 'missing_token' | 'invalid_token' | 'network' | 'unknown'

export default function OAuthCallbackPage() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { handleOAuthCallback } = useAuth()

    const [status, setStatus] = useState<CallbackStatus>('loading')
    const [errorType, setErrorType] = useState<ErrorType>('unknown')
    const [retryCount, setRetryCount] = useState(0)
    const maxRetries = 3

    useEffect(() => {
        const processOAuth = async () => {
            const token = searchParams.get('token')

            if (!token || token.length < 10) {
                setStatus('error')
                setErrorType('missing_token')
                return
            }

            try {
                await handleOAuthCallback(token)
                setStatus('success')
                setTimeout(() => {
                    navigate('/app/dashboard', { replace: true })
                }, 500)
            } catch (error) {
                const isNetworkError = error instanceof Error &&
                    (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('ECONNREFUSED'))
                const isAuthError = error instanceof Error &&
                    (error.message.includes('401') || error.message.includes('Unauthorized'))

                if (isAuthError) {
                    setStatus('error')
                    setErrorType('invalid_token')
                } else if (isNetworkError && retryCount < maxRetries) {
                    setRetryCount(prev => prev + 1)
                    setTimeout(() => processOAuth(), 1000)
                } else {
                    setStatus('error')
                    setErrorType(isNetworkError ? 'network' : 'unknown')
                }
            }
        }

        processOAuth()
    }, [searchParams, handleOAuthCallback, retryCount, navigate])

    const handleRetry = () => {
        setStatus('loading')
        setRetryCount(0)
    }

    const handleBackToLogin = () => {
        navigate('/auth/login', { replace: true })
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
                <LoadingState message={t('oauth.callbackLoading')} />
            </div>
        )
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
                <LoadingState message={t('oauth.callbackSuccess')} />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4">
            <div className="max-w-md w-full">
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold text-center text-[#e8eaed] mb-2" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                        {t('oauth.callbackTitle')}
                    </h2>

                    <p className="text-center text-sm text-[#6b7590] mb-8">
                        {errorType === 'missing_token' && t('oauth.errorMissingToken')}
                        {errorType === 'invalid_token' && t('oauth.errorInvalidToken')}
                        {errorType === 'network' && t('oauth.errorNetwork')}
                        {errorType === 'unknown' && t('oauth.errorSessionExpired')}
                    </p>

                    <div className="space-y-3">
                        {errorType === 'network' && retryCount < maxRetries && (
                            <button
                                onClick={handleRetry}
                                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all duration-200 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400"
                            >
                                {t('oauth.retryButton')}
                            </button>
                        )}

                        <button
                            onClick={handleBackToLogin}
                            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all duration-200 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#e8eaed] hover:bg-[rgba(255,255,255,0.08)]"
                        >
                            {t('oauth.backToLogin')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
