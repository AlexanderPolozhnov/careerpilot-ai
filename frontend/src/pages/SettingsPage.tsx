import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useTranslation} from 'react-i18next'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import type {PreferencesRequest, UserUpdateRequest} from '@/services/settings.service'
import {settingsService} from '@/services/settings.service'
import {cn, formatRelative} from '@/lib/utils'
import {notificationService} from '@/services/notification.service'

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

export default function SettingsPage() {
    const {t, i18n} = useTranslation()
    const queryClient = useQueryClient()

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

    return (
        <section className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-7">
                <div className="lg:col-span-4 space-y-4">
                    <div className="card p-5">
                        <div className="text-sm font-semibold text-ink">{t('settings.profile')}</div>
                        <p className="text-sm text-ink-muted mt-1">{t('settings.profileDescription')}</p>

                        {profileSuccess && (
                            <div
                                className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-ink">
                                {t('settings.saved')}
                            </div>
                        )}
                        {profileError && (
                            <div
                                className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-ink">
                                {t('settings.saveError')}
                            </div>
                        )}

                        <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs text-ink-dim">{t('settings.name')}</label>
                                    <input className="input mt-1" {...profileForm.register('name')} />
                                    {profileForm.formState.errors.name?.message && (
                                        <p className="text-xs text-danger mt-1">{String(profileForm.formState.errors.name.message)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-ink-dim">{t('settings.email')}</label>
                                    <input className="input mt-1" {...profileForm.register('email')} />
                                    {profileForm.formState.errors.email?.message && (
                                        <p className="text-xs text-danger mt-1">{String(profileForm.formState.errors.email.message)}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-ink-dim">{t('settings.location')}</label>
                                <input className="input mt-1" {...profileForm.register('location')}
                                       placeholder={t('settings.locationPlaceholder')}/>
                            </div>

                            <button
                                type="submit"
                                className={cn(
                                    'inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim transition-colors',
                                    profileForm.formState.isSubmitting && 'opacity-70',
                                )}
                            >
                                {t('settings.saveSettings')}
                            </button>
                        </form>
                    </div>

                    <div className="card p-5">
                        <div className="text-sm font-semibold text-ink">{t('settings.notifications')}</div>
                        <p className="text-sm text-ink-muted mt-1">{t('settings.notificationsDescription')}</p>

                        {prefsSuccess && (
                            <div
                                className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-ink">
                                {t('settings.saved')}
                            </div>
                        )}
                        {prefsError && (
                            <div
                                className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-ink">
                                {t('settings.saveError')}
                            </div>
                        )}

                        <form className="mt-5 space-y-3" onSubmit={handlePrefsSubmit}>
                            <label
                                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-1/30 px-3 py-2.5">
                                <div>
                                    <div className="text-sm text-ink">{t('settings.weeklyDigest')}</div>
                                    <div className="text-xs text-ink-dim mt-1">{t('settings.weeklyDigest')}</div>
                                </div>
                                <input type="checkbox" {...prefsForm.register('weeklyDigest')} />
                            </label>

                            <label
                                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-1/30 px-3 py-2.5">
                                <div>
                                    <div className="text-sm text-ink">{t('settings.interviewReminders')}</div>
                                    <div className="text-xs text-ink-dim mt-1">{t('settings.interviewReminders')}</div>
                                </div>
                                <input type="checkbox" {...prefsForm.register('interviewReminders')} />
                            </label>

                            <button
                                type="submit"
                                className={cn(
                                    'inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim transition-colors',
                                    prefsForm.formState.isSubmitting && 'opacity-70',
                                )}
                            >
                                {t('settings.saveSettings')}
                            </button>
                        </form>
                    </div>

                    <div className="card p-5">
                        <div className="text-sm font-semibold text-ink">{t('settings.language')}</div>
                        <p className="text-sm text-ink-muted mt-1">{t('settings.selectLanguage')}</p>
                        <div className="mt-4 space-y-2">
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('ru')}
                                className={cn(
                                    'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors',
                                    i18n.language === 'ru'
                                        ? 'bg-accent/12 border-accent/30 text-ink font-semibold'
                                        : 'border-border hover:bg-surface-2/60 text-ink-muted'
                                )}
                            >
                                {t('settings.languageRU')}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleLanguageChange('en')}
                                className={cn(
                                    'w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors',
                                    i18n.language === 'en'
                                        ? 'bg-accent/12 border-accent/30 text-ink font-semibold'
                                        : 'border-border hover:bg-surface-2/60 text-ink-muted'
                                )}
                            >
                                {t('settings.languageEN')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <div className="card p-5">
                        <div className="text-sm font-semibold text-ink">{t('settings.aiProvider')}</div>
                        <p className="text-sm text-ink-muted mt-1">{t('settings.aiProviderDescription')}</p>
                        <div className="mt-3">
                            <label className="text-xs text-ink-dim">{t('settings.aiProviderMode')}</label>
                            <select
                                className="input mt-1"
                                value={prefsForm.watch('aiProviderMode')}
                                onChange={(e) => {
                                    const val = e.target.value as 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'
                                    prefsForm.setValue('aiProviderMode', val)
                                    const current = prefsForm.getValues()
                                    updatePrefsMutation.mutate({...current, aiProviderMode: val})
                                }}
                            >
                                <option value="CLOUD">{t('settings.aiProviderCloud')}</option>
                                <option value="LOCAL">{t('settings.aiProviderLocal')}</option>
                                <option value="BRING_YOUR_OWN_KEY">{t('settings.aiProviderCustom')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <div
                                    className="text-sm font-semibold text-ink">{t('settings.recentNotifications')}</div>
                                <p className="text-sm text-ink-muted mt-1">{t('settings.mockFeed')}</p>
                            </div>
                            <span
                                className="pill">{notifications.filter((n) => !n.read).length} {t('common.new')}</span>
                        </div>
                        <div className="mt-4 space-y-2">
                            {notifications.map((n) => (
                                <div key={n.id}
                                     className={cn('rounded-xl border border-border px-3 py-2.5', n.read ? 'bg-surface-1/20' : 'bg-surface-1/50')}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm text-ink truncate">{n.title}</div>
                                            <div className="text-xs text-ink-dim mt-1 truncate">{n.body}</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="text-xs text-ink-dim">{formatRelative(n.createdAt)}</div>
                                            {!n.read && (
                                                <button
                                                    type="button"
                                                    onClick={() => markAsReadMutation.mutate(n.id)}
                                                    className="text-xs text-accent hover:underline"
                                                >
                                                    {t('common.markRead')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
