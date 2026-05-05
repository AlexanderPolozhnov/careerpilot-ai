import {Link, useNavigate} from 'react-router-dom'
import {useMemo, useState} from 'react'
import type {Resolver} from 'react-hook-form'
import {useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useAuth} from '@/context/useAuth'
import {cn} from '@/lib/utils'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthPagesProps {
    mode: AuthMode
}


const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const registerSchema = z
    .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
    })
    .refine((v) => v.password === v.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    })

const forgotSchema = z.object({
    email: z.string().email(),
})

type AuthFormValues = {
    name?: string
    email: string
    password?: string
    confirmPassword?: string
}

// Icon components for each auth mode
function LoginIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    )
}

function RegisterIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
    )
}

function ForgotIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    )
}

export default function AuthPages({mode}: AuthPagesProps) {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const {login, register, forgotPassword} = useAuth()

    const pageMeta: Record<AuthMode, { title: string; description: string }> = {
        login: {
            title: t('auth.login'),
            description: t('auth.welcomeBack'),
        },
        register: {
            title: t('auth.register'),
            description: t('auth.createAccount'),
        },
        'forgot-password': {
            title: t('auth.forgotPassword'),
            description: t('auth.resetPassword'),
        },
    }

    const meta = pageMeta[mode]
    const [serverError, setServerError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const schema = useMemo(() => {
        if (mode === 'login') return loginSchema
        if (mode === 'register') return registerSchema
        return forgotSchema
    }, [mode])

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(schema) as unknown as Resolver<AuthFormValues>,
        defaultValues: {name: '', email: '', password: '', confirmPassword: ''},
        mode: 'onSubmit',
    })

    return (
        <div className="min-h-dvh bg-[#0a0a0b] text-[#e8eaed] flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-[#0a0a0b] to-[#0a0a0b]" />
                
                {/* Subtle grid pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '64px 64px'
                    }}
                />
                
                {/* Floating gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>CareerPilot</span>
                    </Link>
                    
                    {/* Middle content */}
                    <div className="space-y-6 max-w-md">
                        <h1 className="text-3xl xl:text-4xl font-semibold text-[#e8eaed] leading-tight tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                            {mode === 'login' && 'Welcome back to your career journey'}
                            {mode === 'register' && 'Start your AI-powered career journey'}
                            {mode === 'forgot-password' && 'Secure your account access'}
                        </h1>
                        <p className="text-[15px] text-[#8b8fa3] leading-relaxed">
                            {mode === 'login' && 'Continue tracking applications, managing interviews, and leveraging AI insights to land your dream job.'}
                            {mode === 'register' && 'Join thousands of professionals using intelligent tools to streamline their job search and career growth.'}
                            {mode === 'forgot-password' && 'No worries. Enter your email and we\'ll send you instructions to reset your password.'}
                        </p>
                    </div>
                    
                    {/* Bottom testimonial/stats */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 border-2 border-[#0a0a0b] flex items-center justify-center">
                                        <span className="text-[10px] text-violet-300">{String.fromCharCode(64 + i)}</span>
                                    </div>
                                ))}
                            </div>
                            <span className="text-sm text-[#6b7590]">Join 10,000+ professionals</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[#6b7590]">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                SOC 2 Compliant
                            </span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                GDPR Ready
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col min-h-dvh">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.06)]">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-base font-semibold text-[#e8eaed]" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>CareerPilot</span>
                    </Link>
                    <Link to="/" className="text-sm text-[#6b7590] hover:text-[#e8eaed] transition-colors">
                        {t('landing.back')}
                    </Link>
                </div>
                
                {/* Form container */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-10">
                    <div className="w-full max-w-[400px]">
                        {/* Mode tabs */}
                        <div className="flex items-center gap-1 p-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl mb-8">
                            <Link
                                to="/auth/login"
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                                    mode === 'login' 
                                        ? 'bg-[rgba(255,255,255,0.08)] text-[#e8eaed] shadow-sm' 
                                        : 'text-[#6b7590] hover:text-[#8b8fa3]'
                                )}
                            >
                                <LoginIcon />
                                {t('auth.login')}
                            </Link>
                            <Link
                                to="/auth/register"
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                                    mode === 'register' 
                                        ? 'bg-[rgba(255,255,255,0.08)] text-[#e8eaed] shadow-sm' 
                                        : 'text-[#6b7590] hover:text-[#8b8fa3]'
                                )}
                            >
                                <RegisterIcon />
                                {t('auth.register')}
                            </Link>
                        </div>
                        
                        {/* Forgot password link (subtle, below tabs) */}
                        {mode !== 'forgot-password' && (
                            <div className="flex justify-end -mt-5 mb-6">
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-xs text-[#6b7590] hover:text-violet-400 transition-colors"
                                >
                                    {t('auth.forgotPassword')}
                                </Link>
                            </div>
                        )}
                        
                        {mode === 'forgot-password' && (
                            <Link
                                to="/auth/login"
                                className="inline-flex items-center gap-1.5 text-sm text-[#6b7590] hover:text-[#e8eaed] transition-colors mb-6"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                {t('landing.back')}
                            </Link>
                        )}
                        
                        {/* Form header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn(
                                    'w-10 h-10 rounded-xl flex items-center justify-center',
                                    'bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20',
                                    'border border-violet-500/30 text-violet-400'
                                )}>
                                    {mode === 'login' && <LoginIcon />}
                                    {mode === 'register' && <RegisterIcon />}
                                    {mode === 'forgot-password' && <ForgotIcon />}
                                </div>
                            </div>
                            <h2 className="text-2xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                                {meta.title}
                            </h2>
                            <p className="text-sm text-[#6b7590] mt-2">{meta.description}</p>
                        </div>

                        {/* Error/Success messages */}
                        {(serverError || success) && (
                            <div
                                className={cn(
                                    'mb-6 rounded-xl border px-4 py-3 text-sm flex items-start gap-3',
                                    serverError
                                        ? 'border-red-500/30 bg-red-500/10 text-red-200'
                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                                )}
                            >
                                <svg className={cn('w-5 h-5 mt-0.5 shrink-0', serverError ? 'text-red-400' : 'text-emerald-400')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    {serverError ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                {serverError ?? success}
                            </div>
                        )}

                        {/* Form */}
                        <form
                            className="space-y-5"
                            onSubmit={form.handleSubmit(async (values) => {
                                setServerError(null)
                                setSuccess(null)
                                try {
                                    if (mode === 'login') {
                                        const v = values as z.infer<typeof loginSchema>
                                        await login(v.email, v.password)
                                        navigate('/app/dashboard')
                                        return
                                    }
                                    if (mode === 'register') {
                                        const v = values as z.infer<typeof registerSchema>
                                        await register(v.name, v.email, v.password)
                                        navigate('/app/dashboard')
                                        return
                                    }
                                    const v = values as z.infer<typeof forgotSchema>
                                    await forgotPassword(v.email)
                                    setSuccess(t('auth.resetPassword'))
                                } catch (e) {
                                    setServerError(e instanceof Error ? e.message : t('messages.errorMessage'))
                                }
                            })}
                        >
                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium text-[#8b8fa3]">{t('auth.name')}</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7590]">
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </div>
                                        <input 
                                            className="w-full h-11 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200" 
                                            {...form.register('name')} 
                                            placeholder={t('auth.name')}
                                        />
                                    </div>
                                    {form.formState.errors.name?.message && (
                                        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1.5">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {String(form.formState.errors.name.message)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[13px] font-medium text-[#8b8fa3]">{t('auth.email')}</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7590]">
                                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <input 
                                        className="w-full h-11 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200" 
                                        {...form.register('email')} 
                                        placeholder="you@company.com"
                                    />
                                </div>
                                {form.formState.errors.email?.message && (
                                    <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1.5">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {String(form.formState.errors.email.message)}
                                    </p>
                                )}
                            </div>

                            {mode !== 'forgot-password' && (
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium text-[#8b8fa3]">{t('auth.password')}</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7590]">
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <input
                                            className="w-full h-11 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                                            type="password"
                                            {...form.register('password')}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {form.formState.errors.password?.message && (
                                        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1.5">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {String(form.formState.errors.password.message)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {mode === 'register' && (
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-medium text-[#8b8fa3]">{t('auth.confirmPassword')}</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7590]">
                                            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                            </svg>
                                        </div>
                                        <input
                                            className="w-full h-11 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                                            type="password"
                                            {...form.register('confirmPassword')}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {form.formState.errors.confirmPassword?.message && (
                                        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1.5">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {String(form.formState.errors.confirmPassword.message)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className={cn(
                                    'w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all duration-200',
                                    'bg-gradient-to-r from-violet-600 to-violet-500 text-white',
                                    'hover:from-violet-500 hover:to-violet-400',
                                    'shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35',
                                    'border border-violet-400/20',
                                    form.formState.isSubmitting && 'opacity-70 cursor-not-allowed',
                                )}
                            >
                                {form.formState.isSubmitting && (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {mode === 'login' && (form.formState.isSubmitting ? t('common.loading') : t('auth.login'))}
                                {mode === 'register' && (form.formState.isSubmitting ? t('common.loading') : t('auth.register'))}
                                {mode === 'forgot-password' && (form.formState.isSubmitting ? t('common.loading') : t('auth.forgotPassword'))}
                            </button>

                            {/* Footer actions */}
                            <div className="flex items-center justify-between pt-2 text-[13px] text-[#6b7590]">
                                <span>{t('auth.loginHint')}</span>
                                <button
                                    type="button"
                                    onClick={() => navigate('/app/dashboard')}
                                    className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors font-medium"
                                >
                                    {t('auth.skip')}
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                        
                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-3 bg-[#0a0a0b] text-[12px] text-[#4a4e5a] uppercase tracking-wider">or continue with</span>
                            </div>
                        </div>
                        
                        {/* Social login buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="h-11 flex items-center justify-center gap-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[13px] font-medium text-[#8b8fa3] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:text-[#e8eaed] transition-all duration-200"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                className="h-11 flex items-center justify-center gap-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] text-[13px] font-medium text-[#8b8fa3] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:text-[#e8eaed] transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Desktop back link */}
                <div className="hidden lg:block p-6 text-center">
                    <Link to="/" className="text-[13px] text-[#6b7590] hover:text-[#e8eaed] transition-colors">
                        {t('landing.back')}
                    </Link>
                </div>
            </div>
        </div>
    )
}
