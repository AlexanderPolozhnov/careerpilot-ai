import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoadingState } from '@/components/LoadingState'

export default function OAuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const isProcessing = useRef(false)

    useEffect(() => {
        const processOAuth = () => {
            if (isProcessing.current) return
            isProcessing.current = true

            const token = searchParams.get('token')
            if (token) {
                localStorage.setItem('cp_access_token', token)
                // Force a full page reload so AuthProvider picks up the new token
                window.location.replace('/app/dashboard')
            } else {
                navigate('/login?error=missing_token', { replace: true })
            }
        }

        processOAuth()
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
            <LoadingState message="Completing authentication..." />
        </div>
    )
}
