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
        <div className="min-h-dvh bg-bg text-ink grid place-items-center px-5 py-12">
            <div className="w-full max-w-[440px]">
                <div className="mb-5 flex items-center justify-between">
                    <Link to="/" className="text-sm text-ink-muted hover:text-ink transition-colors">
                        {t('landing.back')}
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                        <Link
                            to="/auth/login"
                            className={cn('px-2 py-1 rounded-lg border border-transparent text-ink-dim hover:text-ink', mode === 'login' && 'border-border bg-surface-2/60 text-ink')}
                        >
                            {t('auth.login')}
                        </Link>
                        <Link
                            to="/auth/register"
                            className={cn('px-2 py-1 rounded-lg border border-transparent text-ink-dim hover:text-ink', mode === 'register' && 'border-border bg-surface-2/60 text-ink')}
                        >
                            {t('auth.register')}
                        </Link>
                        <Link
                            to="/auth/forgot-password"
                            className={cn('px-2 py-1 rounded-lg border border-transparent text-ink-dim hover:text-ink', mode === 'forgot-password' && 'border-border bg-surface-2/60 text-ink')}
                        >
                            {t('auth.forgotPassword')}
                        </Link>
                    </div>
                </div>

                <div className="card p-5 md:p-6">
                    <h2 className="text-lg font-semibold text-ink">{meta.title}</h2>
                    <p className="text-sm text-ink-muted mt-2">{meta.description}</p>

                    {(serverError || success) && (
                        <div
                            className={cn(
                                'mt-4 rounded-xl border px-3 py-2 text-sm',
                                serverError
                                    ? 'border-danger/30 bg-danger/10 text-ink'
                                    : 'border-success/30 bg-success/10 text-ink',
                            )}
                        >
                            {serverError ?? success}
                        </div>
                    )}

                    <form
                        className="mt-5 space-y-4"
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
                            <div>
                                <label className="text-xs text-ink-dim">{t('auth.name')}</label>
                                <input className="input mt-1" {...form.register('name')} placeholder={t('auth.name')}/>
                                {form.formState.errors.name?.message && (
                                    <p className="text-xs text-danger mt-1">{String(form.formState.errors.name.message)}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-ink-dim">{t('auth.email')}</label>
                            <input className="input mt-1" {...form.register('email')} placeholder="you@company.com"/>
                            {form.formState.errors.email?.message && (
                                <p className="text-xs text-danger mt-1">{String(form.formState.errors.email.message)}</p>
                            )}
                        </div>

                        {mode !== 'forgot-password' && (
                            <div>
                                <label className="text-xs text-ink-dim">{t('auth.password')}</label>
                                <input
                                    className="input mt-1"
                                    type="password"
                                    {...form.register('password')}
                                    placeholder="••••••••"
                                />
                                {form.formState.errors.password?.message && (
                                    <p className="text-xs text-danger mt-1">{String(form.formState.errors.password.message)}</p>
                                )}
                            </div>
                        )}

                        {mode === 'register' && (
                            <div>
                                <label className="text-xs text-ink-dim">{t('auth.confirmPassword')}</label>
                                <input
                                    className="input mt-1"
                                    type="password"
                                    {...form.register('confirmPassword')}
                                    placeholder="••••••••"
                                />
                                {form.formState.errors.confirmPassword?.message && (
                                    <p className="text-xs text-danger mt-1">
                                        {String(form.formState.errors.confirmPassword.message)}
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className={cn(
                                'w-full inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                                form.formState.isSubmitting ? 'opacity-70' : 'hover:bg-accent-dim',
                            )}
                        >
                            {mode === 'login' && (form.formState.isSubmitting ? `${t('common.loading')}` : t('auth.login'))}
                            {mode === 'register' && (form.formState.isSubmitting ? `${t('common.loading')}` : t('auth.register'))}
                            {mode === 'forgot-password' && (form.formState.isSubmitting ? `${t('common.loading')}` : t('auth.forgotPassword'))}
                        </button>

                        <div className="flex items-center justify-between text-xs text-ink-dim">
                            <span>{t('auth.loginHint')}</span>
                            <button
                                type="button"
                                onClick={() => navigate('/app/dashboard')}
                                className="text-accent hover:text-accent-dim transition-colors"
                            >
                                {t('auth.skip')} →
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
