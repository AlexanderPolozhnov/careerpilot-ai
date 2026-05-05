import {useEffect, useState} from 'react'
import {useForm, useWatch} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import type {PreferencesRequest, UserUpdateRequest} from '@/services/settings.service'
import {settingsService} from '@/services/settings.service'
import {cn, formatRelative} from '@/lib/utils'
import {notificationService} from '@/services/notification.service'
import {
    AlertTriangle,
    Bell,
    Check,
    Cloud,
    Cpu,
    Globe,
    Key,
    Mail,
    MapPin,
    Shield,
    Sparkles,
    Trash2,
    User,
} from 'lucide-react'

const profileSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    location: z.string().optional(),
})

const preferencesSchema = z.object({
    weeklyDigest: z.boolean(),
    interviewReminders: z.boolean(),
    aiProviderMode: z.enum(['LOCAL', 'CLOUD', 'BRING_YOUR_OWN_KEY']),
    language: z.enum(['ru', 'en']),
})

type ProfileValues = z.infer<typeof profileSchema>
type PreferencesValues = z.infer<typeof preferencesSchema>

// Toggle Switch Component
function Toggle({checked, onChange, disabled = false}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative h-6 w-11 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090d]',
                checked ? 'bg-violet-600' : 'bg-white/10',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            <span
                className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out',
                    checked && 'translate-x-5'
                )}
            />
        </button>
    )
}

// Section Header Component
function SectionHeader({icon: Icon, title, description}: { icon: typeof User; title: string; description: string }) {
    return (
        <div className="flex items-start gap-4 mb-6">
            <div
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400"/>
            </div>
            <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="text-sm text-white/40 mt-0.5">{description}</p>
            </div>
        </div>
    )
}

// Status Toast
function StatusToast({type, message}: { type: 'success' | 'error'; message: string }) {
    return (
        <div
            className={cn(
                'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm animate-slide-up',
                type === 'success' && 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
                type === 'error' && 'bg-red-500/10 border border-red-500/20 text-red-400'
            )}
        >
            {type === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3"/>
                </div>
            ) : (
                <AlertTriangle className="w-4 h-4"/>
            )}
            {message}
        </div>
    )
}

export default function SettingsPage() {
    const {t, i18n} = useTranslation()
    const queryClient = useQueryClient()
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const {data: notificationsData} = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.list({page: 0, size: 5}),
    })

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notifications']})
        },
    })

    const notifications = notificationsData?.content ?? []

    const {data: userData} = useQuery({
        queryKey: ['users', 'me'],
        queryFn: () => settingsService.getMe(),
    })

    const {data: prefsData} = useQuery({
        queryKey: ['preferences'],
        queryFn: () => settingsService.getPreferences(),
    })

    const profileForm = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {name: '', email: '', location: ''},
    })

    const prefsForm = useForm<PreferencesValues>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            weeklyDigest: true,
            interviewReminders: true,
            aiProviderMode: 'LOCAL',
            language: (i18n.language as 'ru' | 'en') || 'en',
        },
    })

    useEffect(() => {
        if (userData) {
            profileForm.reset({
                name: userData.name,
                email: userData.email,
                location: userData.location ?? '',
            })
        }
    }, [userData, profileForm])

    useEffect(() => {
        if (prefsData) {
            prefsForm.reset({
                weeklyDigest: prefsData.weeklyDigest,
                interviewReminders: prefsData.interviewReminders,
                aiProviderMode: prefsData.aiProviderMode,
                language: (prefsData.language as 'ru' | 'en') || 'en',
            })
            i18n.changeLanguage(prefsData.language)
        }
    }, [prefsData, prefsForm, i18n])

    const updateUserMutation = useMutation({
        mutationFn: (data: UserUpdateRequest) => settingsService.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['users', 'me']})
        },
    })

    const updatePrefsMutation = useMutation({
        mutationFn: (data: PreferencesRequest) => settingsService.updatePreferences(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['preferences']})
        },
    })

    const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
        await updateUserMutation.mutateAsync({
            name: values.name,
            email: values.email,
            location: values.location,
        })
    })

    const handlePrefsSubmit = prefsForm.handleSubmit(async (values) => {
        await updatePrefsMutation.mutateAsync(values)
        i18n.changeLanguage(values.language)
    })

    const handleLanguageChange = (newLanguage: 'ru' | 'en') => {
        i18n.changeLanguage(newLanguage)
        prefsForm.setValue('language', newLanguage)
        const current = prefsForm.getValues()
        updatePrefsMutation.mutate({...current, language: newLanguage})
    }

    const profileSuccess = updateUserMutation.isSuccess
    const profileError = updateUserMutation.isError
    const prefsSuccess = updatePrefsMutation.isSuccess
    const prefsError = updatePrefsMutation.isError
    const aiProviderMode = useWatch({
        control: prefsForm.control,
        name: 'aiProviderMode',
    })

    const aiProviderOptions = [
        {
            value: 'CLOUD',
            label: t('settings.aiProviderCloud'),
            icon: Cloud,
            description: 'Fast, reliable cloud inference'
        },
        {
            value: 'LOCAL',
            label: t('settings.aiProviderLocal'),
            icon: Cpu,
            description: 'Privacy-first local processing'
        },
        {
            value: 'BRING_YOUR_OWN_KEY',
            label: t('settings.aiProviderCustom'),
            icon: Key,
            description: 'Use your own API key'
        },
    ]

    return (
        <div className="min-h-full pb-20">
            {/* Header */}
            <header className="mb-10 animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                    <div
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-violet-400"/>
                    </div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">{t('settings.title')}</h1>
                </div>
                <p className="text-white/40 text-sm ml-11">Manage your account preferences and settings</p>
            </header>

            <div className="max-w-4xl">
                <div className="grid gap-8 stagger-children">
                    {/* Profile Section */}
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={User}
                            title={t('settings.profile')}
                            description={t('settings.profileDescription')}
                        />

                        {profileSuccess &&
                            <div className="mb-5"><StatusToast type="success" message={t('settings.saved')}/></div>}
                        {profileError &&
                            <div className="mb-5"><StatusToast type="error" message={t('settings.saveError')}/></div>}

                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            {/* Avatar placeholder */}
                            <div className="flex items-center gap-5 pb-5 border-b border-white/[0.06]">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-2xl font-semibold text-white shadow-lg shadow-violet-500/20">
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{userData?.name || 'User'}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{userData?.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5"/>
                                        {t('settings.name')}
                                    </label>
                                    <input
                                        className="input"
                                        {...profileForm.register('name')}
                                    />
                                    {profileForm.formState.errors.name?.message && (
                                        <p className="text-xs text-red-400">{String(profileForm.formState.errors.name.message)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <Mail className="w-3.5 h-3.5"/>
                                        {t('settings.email')}
                                    </label>
                                    <input
                                        className="input"
                                        {...profileForm.register('email')}
                                    />
                                    {profileForm.formState.errors.email?.message && (
                                        <p className="text-xs text-red-400">{String(profileForm.formState.errors.email.message)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5"/>
                                    {t('settings.location')}
                                </label>
                                <input
                                    className="input"
                                    {...profileForm.register('location')}
                                    placeholder={t('settings.locationPlaceholder')}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.formState.isSubmitting}
                                    className={cn(
                                        'btn-primary px-5',
                                        profileForm.formState.isSubmitting && 'opacity-70 cursor-not-allowed'
                                    )}
                                >
                                    {profileForm.formState.isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                            Saving...
                                        </span>
                                    ) : (
                                        t('settings.saveSettings')
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Language Section */}
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={Globe}
                            title={t('settings.language')}
                            description={t('settings.selectLanguage')}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('en')}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                                    i18n.language === 'en'
                                        ? 'bg-violet-500/10 border-violet-500/30 text-white'
                                        : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] text-white/60'
                                )}
                            >
                                <span className="text-xl">🇬🇧</span>
                                <div>
                                    <p className="text-sm font-medium">{t('settings.languageEN')}</p>
                                </div>
                                {i18n.language === 'en' && (
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white"/>
                                    </div>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('ru')}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                                    i18n.language === 'ru'
                                        ? 'bg-violet-500/10 border-violet-500/30 text-white'
                                        : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] text-white/60'
                                )}
                            >
                                <span className="text-xl">🇷🇺</span>
                                <div>
                                    <p className="text-sm font-medium">{t('settings.languageRU')}</p>
                                </div>
                                {i18n.language === 'ru' && (
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white"/>
                                    </div>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* AI Provider Section */}
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={Sparkles}
                            title={t('settings.aiProvider')}
                            description={t('settings.aiProviderDescription')}
                        />

                        <div className="space-y-2">
                            {aiProviderOptions.map((option) => {
                                const Icon = option.icon
                                const isActive = aiProviderMode === option.value
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            const val = option.value as 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'
                                            prefsForm.setValue('aiProviderMode', val)
                                            const current = prefsForm.getValues()
                                            updatePrefsMutation.mutate({...current, aiProviderMode: val})
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200',
                                            isActive
                                                ? 'bg-violet-500/10 border-violet-500/30'
                                                : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]'
                                        )}
                                    >
                                        <div className={cn(
                                            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                                            isActive ? 'bg-violet-500/20' : 'bg-white/[0.04]'
                                        )}>
                                            <Icon
                                                className={cn('w-5 h-5', isActive ? 'text-violet-400' : 'text-white/40')}/>
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-white/70')}>
                                                {option.label}
                                            </p>
                                            <p className="text-xs text-white/40 mt-0.5">{option.description}</p>
                                        </div>
                                        <div className={cn(
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                            isActive ? 'border-violet-500 bg-violet-500' : 'border-white/20'
                                        )}>
                                            {isActive && <Check className="w-3 h-3 text-white"/>}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={Bell}
                            title={t('settings.notifications')}
                            description={t('settings.notificationsDescription')}
                        />

                        {prefsSuccess &&
                            <div className="mb-5"><StatusToast type="success" message={t('settings.saved')}/></div>}
                        {prefsError &&
                            <div className="mb-5"><StatusToast type="error" message={t('settings.saveError')}/></div>}

                        <form onSubmit={handlePrefsSubmit} className="space-y-3">
                            <div
                                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-400"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{t('settings.weeklyDigest')}</p>
                                        <p className="text-xs text-white/40 mt-0.5">Receive a weekly summary of your job
                                            search</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={prefsForm.watch('weeklyDigest')}
                                    onChange={(v) => {
                                        prefsForm.setValue('weeklyDigest', v)
                                        const current = prefsForm.getValues()
                                        updatePrefsMutation.mutate({...current, weeklyDigest: v})
                                    }}
                                />
                            </div>

                            <div
                                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-amber-400"/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{t('settings.interviewReminders')}</p>
                                        <p className="text-xs text-white/40 mt-0.5">Get reminded before scheduled
                                            interviews</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={prefsForm.watch('interviewReminders')}
                                    onChange={(v) => {
                                        prefsForm.setValue('interviewReminders', v)
                                        const current = prefsForm.getValues()
                                        updatePrefsMutation.mutate({...current, interviewReminders: v})
                                    }}
                                />
                            </div>
                        </form>

                        {/* Recent Notifications */}
                        {notifications.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-white/[0.06]">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-medium text-white">{t('settings.recentNotifications')}</p>
                                    <span
                                        className="px-2 py-0.5 rounded-full bg-violet-500/10 text-xs font-medium text-violet-400">
                                        {notifications.filter((n) => !n.read).length} {t('common.new')}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                'flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-colors',
                                                n.read ? 'border-white/[0.04] bg-transparent' : 'border-white/[0.08] bg-white/[0.02]'
                                            )}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className={cn('text-sm truncate', n.read ? 'text-white/60' : 'text-white')}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-white/40 mt-0.5 truncate">{n.body}</p>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span
                                                    className="text-xs text-white/30">{formatRelative(n.createdAt)}</span>
                                                {!n.read && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markAsReadMutation.mutate(n.id)}
                                                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                                    >
                                                        {t('common.markRead')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Danger Zone */}
                    <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.02] p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div
                                className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-red-400"/>
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">Danger Zone</h2>
                                <p className="text-sm text-white/40 mt-0.5">Irreversible and destructive actions</p>
                            </div>
                        </div>

                        <div
                            className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/[0.03] px-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-400"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Delete account</p>
                                    <p className="text-xs text-white/40 mt-0.5">Permanently remove your account and all
                                        data</p>
                                </div>
                            </div>
                            {!deleteConfirm ? (
                                <button
                                    type="button"
                                    onClick={() => setDeleteConfirm(true)}
                                    className="px-4 py-2 rounded-lg border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    Delete
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirm(false)}
                                        className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
