import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PreferencesRequest, UserUpdateRequest, DeleteAccountRequest } from '@/services/settings.service'
import { settingsService } from '@/services/settings.service'
import { profileService } from '@/services/profile.service'
import { resumeService, type CreateResumeDto } from '@/services/resume.service'
import { authService, type UpdatePasswordRequest } from '@/services/auth.service'
import { cn, formatRelative } from '@/lib/utils'
import { notificationService } from '@/services/notification.service'
import { ResumeForm } from '@/components/ResumeForm'
import { ConfirmModal } from '@/components/ConfirmModal'
import { toast } from '@/lib/toast'
import type { Profile, Resume, User as UserType } from '@/types'
import {
    AlertTriangle,
    Bell,
    Check,
    Cloud,
    Cpu,
    FileText,
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
    name: z.string().min(2, { message: 'auth.nameMinLength' }),
    email: z.string().email({ message: 'auth.emailInvalid' }),
    location: z.string().optional(),
})

const preferencesSchema = z.object({
    weeklyDigest: z.boolean(),
    interviewReminders: z.boolean(),
    taskReminders: z.boolean(),
    aiProviderMode: z.enum(['LOCAL', 'CLOUD', 'BRING_YOUR_OWN_KEY']),
    language: z.enum(['ru', 'en']),
})

const professionalProfileSchema = z.object({
    headline: z.string().optional(),
    location: z.string().optional(),
    yearsOfExperience: z.preprocess(
        (val) => (val === '' || isNaN(Number(val)) ? undefined : Number(val)),
        z.number({ message: 'forms.validation.number' })
            .min(0, { message: 'forms.validation.min' })
            .max(50, { message: 'forms.validation.max' })
            .optional()
    ),
    skills: z.string().optional(),
    linkedinUrl: z.union([z.literal(''), z.string().url({ message: 'vacancies.form.errors.invalidUrl' })]).optional(),
    githubUrl: z.union([z.literal(''), z.string().url({ message: 'vacancies.form.errors.invalidUrl' })]).optional(),
    portfolioUrl: z.union([z.literal(''), z.string().url({ message: 'vacancies.form.errors.invalidUrl' })]).optional(),
})

type ProfileValues = z.infer<typeof profileSchema>
type PreferencesValues = z.infer<typeof preferencesSchema>
type ProfessionalProfileValues = z.infer<typeof professionalProfileSchema>

type PasswordValues = {
    currentPassword?: string
    newPassword: string
    confirmPassword: string
}

type DeleteAccountValues = {
    password?: string
    confirmation: string
}

const getPasswordSchema = (hasPassword: boolean) => {
    return z.object({
        currentPassword: hasPassword ? z.string().min(1, { message: 'settings.currentPasswordRequired' }) : z.string().optional(),
        newPassword: z.string().min(6, { message: 'auth.passwordMinLength' }),
        confirmPassword: z.string().min(6, { message: 'auth.passwordMinLength' }),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'auth.passwordMismatch',
        path: ['confirmPassword']
    })
}

const getDeleteAccountSchema = (hasPassword: boolean, userEmail: string) => {
    return z.object({
        password: hasPassword ? z.string().min(1, { message: 'settings.currentPasswordRequired' }) : z.string().optional(),
        confirmation: z.string().min(1, { message: 'forms.validation.required' }).refine((val) => val.toLowerCase() === userEmail.toLowerCase(), {
            message: 'settings.deleteAccountWrongConfirmation'
        })
    })
}

// Toggle Switch Component
function Toggle({ checked, onChange, disabled = false }: {
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
function SectionHeader({ icon: Icon, title, description }: { icon: typeof User | typeof Shield | typeof Globe | typeof Sparkles | typeof Bell | typeof Key; title: string; description: string }) {
    return (
        <div className="flex items-start gap-4 mb-6">
            <div
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
                <h2 className="text-base font-semibold text-white">{title}</h2>
                <p className="text-sm text-white/40 mt-0.5">{description}</p>
            </div>
        </div>
    )
}

// Status Toast
function StatusToast({ type, message }: { type: 'success' | 'error'; message: string }) {
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
                    <Check className="w-3 h-3" />
                </div>
            ) : (
                <AlertTriangle className="w-4 h-4" />
            )}
            {message}
        </div>
    )
}

export default function SettingsPage() {
    const { t, i18n } = useTranslation()
    const location = useLocation()
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
    const [showResumeModal, setShowResumeModal] = useState(false)
    const [editingResume, setEditingResume] = useState<Resume | null>(null)
    const [resumeToDeleteId, setResumeToDeleteId] = useState<string | null>(null)
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

    useEffect(() => {
        if (location.hash === '#notifications') {
            setTimeout(() => {
                const element = document.getElementById('notifications')
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                }
            }, 100)
        }
    }, [location.hash])

    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationService.list({ page: 0, size: 5 }),
    })

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const notifications = notificationsData?.content ?? []

    const { data: prefsData } = useQuery({
        queryKey: ['preferences'],
        queryFn: () => settingsService.getPreferences(),
    })

    const { data: profileData } = useQuery({
        queryKey: ['profile', 'me'],
        queryFn: () => profileService.getMe(),
    })

    const { data: resumesData } = useQuery({
        queryKey: ['resumes', 'list'],
        queryFn: () => resumeService.list(),
    })

    const profileForm = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: '', email: '', location: '' },
    })

    const prefsForm = useForm<PreferencesValues>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            weeklyDigest: true,
            interviewReminders: true,
            taskReminders: true,
            aiProviderMode: 'LOCAL',
            language: (i18n.language as 'ru' | 'en') || 'en',
        },
    })

    const professionalProfileForm = useForm<ProfessionalProfileValues>({
        resolver: zodResolver(professionalProfileSchema) as unknown as Resolver<ProfessionalProfileValues>,
        defaultValues: {
            headline: '',
            location: '',
            yearsOfExperience: undefined,
            skills: '',
            linkedinUrl: '',
            githubUrl: '',
            portfolioUrl: '',
        },
    })

    const passwordForm = useForm<PasswordValues>({
        resolver: zodResolver(getPasswordSchema(user?.hasPassword ?? false)) as unknown as Resolver<PasswordValues>,
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const deleteAccountForm = useForm<DeleteAccountValues>({
        resolver: zodResolver(getDeleteAccountSchema(user?.hasPassword ?? false, user?.email ?? '')) as unknown as Resolver<DeleteAccountValues>,
        defaultValues: {
            password: '',
            confirmation: '',
        },
    })

    const weeklyDigest = useWatch({ control: prefsForm.control, name: 'weeklyDigest' })
    const interviewReminders = useWatch({ control: prefsForm.control, name: 'interviewReminders' })
    const taskReminders = useWatch({ control: prefsForm.control, name: 'taskReminders' })

    useEffect(() => {
        if (user) {
            profileForm.reset({
                name: user.name,
                email: user.email,
                location: (user as UserType & { location?: string }).location ?? '',
            })
        }
    }, [user, profileForm])

    useEffect(() => {
        if (prefsData) {
            prefsForm.reset({
                weeklyDigest: prefsData.weeklyDigest,
                interviewReminders: prefsData.interviewReminders,
                taskReminders: prefsData.taskReminders,
                aiProviderMode: prefsData.aiProviderMode,
                language: (prefsData.language as 'ru' | 'en') || 'en',
            })
            i18n.changeLanguage(prefsData.language)
        } else {
            prefsForm.reset({
                weeklyDigest: true,
                interviewReminders: true,
                taskReminders: true,
                aiProviderMode: 'LOCAL',
                language: (i18n.language as 'ru' | 'en') || 'en',
            })
        }
    }, [prefsData, prefsForm, i18n])

    useEffect(() => {
        if (profileData) {
            professionalProfileForm.reset({
                headline: profileData.headline ?? '',
                location: profileData.location ?? '',
                yearsOfExperience: profileData.yearsOfExperience,
                skills: profileData.skills?.join(', ') ?? '',
                linkedinUrl: profileData.linkedinUrl ?? '',
                githubUrl: profileData.githubUrl ?? '',
                portfolioUrl: profileData.portfolioUrl ?? '',
            })
        } else {
            professionalProfileForm.reset({
                headline: '',
                location: '',
                yearsOfExperience: undefined,
                skills: '',
                linkedinUrl: '',
                githubUrl: '',
                portfolioUrl: '',
            })
        }
    }, [profileData, professionalProfileForm])

    useEffect(() => {
        if (user) {
            passwordForm.reset({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
        }
    }, [user, passwordForm])

    const updatePasswordMutation = useMutation({
        mutationFn: (data: UpdatePasswordRequest) => authService.updatePassword(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
            toast.success(t('settings.passwordUpdated'))
            passwordForm.reset()
        },
        onError: () => {
            toast.error(t('settings.passwordUpdateError'))
        }
    })

    const updateUserMutation = useMutation({
        mutationFn: (data: UserUpdateRequest) => settingsService.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
        },
    })

    const updatePrefsMutation = useMutation({
        mutationFn: (data: PreferencesRequest) => settingsService.updatePreferences(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] })
        },
    })

    const updateAiProviderMutation = useMutation({
        mutationFn: (data: PreferencesRequest) => settingsService.updatePreferences(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] })
        },
    })

    const deleteAccountMutation = useMutation({
        mutationFn: (data: DeleteAccountRequest) => settingsService.deleteAccount(data),
        onSuccess: async () => {
            toast.success(t('settings.deleteAccountSuccess'))
            setShowDeleteAccountModal(false)
            deleteAccountForm.reset()
            // Clear tokens and logout
            try {
                await authService.logout()
            } catch {
                // Ignore logout errors since account is already deleted
            }
            // Clear all query cache
            queryClient.clear()
            // Redirect to landing page
            window.location.href = '/'
        },
        onError: (error: { status?: number }) => {
            if (error.status === 401) {
                toast.error(t('settings.deleteAccountWrongPassword'))
            } else if (error.status === 400) {
                toast.error(t('settings.deleteAccountWrongConfirmation'))
            } else {
                toast.error(t('settings.deleteAccountError'))
            }
        }
    })

    const handleDeleteAccount = (data: DeleteAccountValues) => {
        deleteAccountMutation.mutate({
            password: data.password,
            confirmation: data.confirmation
        })
    }

    const updateProfileMutation = useMutation({
        mutationFn: (data: Partial<Profile>) => profileService.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
        },
    })

    const createResumeMutation = useMutation({
        mutationFn: (data: CreateResumeDto) => resumeService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resumes', 'list'] })
            toast.success(t('settings.resumes.created'))
            setShowResumeModal(false)
            setEditingResume(null)
        },
        onError: () => {
            toast.error(t('settings.resumes.error'))
        }
    })

    const updateResumeMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateResumeDto> }) => resumeService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resumes', 'list'] })
            toast.success(t('settings.resumes.updated'))
            setShowResumeModal(false)
            setEditingResume(null)
        },
        onError: () => {
            toast.error(t('settings.resumes.error'))
        }
    })

    const deleteResumeMutation = useMutation({
        mutationFn: (id: string) => resumeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resumes', 'list'] })
            toast.success(t('settings.resumes.deleted'))
            setIsConfirmDeleteOpen(false)
            setResumeToDeleteId(null)
        },
        onError: () => {
            toast.error(t('settings.resumes.error'))
        }
    })

    const setDefaultResumeMutation = useMutation({
        mutationFn: (id: string) => resumeService.setAsDefault(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resumes', 'list'] })
            toast.success(t('settings.resumes.defaultSet'))
        },
        onError: () => {
            toast.error(t('settings.resumes.error'))
        }
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

    const handleProfessionalProfileSubmit = professionalProfileForm.handleSubmit(async (values) => {
        const payload: Partial<Profile> = {
            headline: values.headline,
            location: values.location,
            yearsOfExperience: values.yearsOfExperience,
            skills: values.skills ? values.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
            linkedinUrl: values.linkedinUrl,
            githubUrl: values.githubUrl,
            portfolioUrl: values.portfolioUrl,
        }
        await updateProfileMutation.mutateAsync(payload)
    })

    const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
        const payload: UpdatePasswordRequest = {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
        }
        await updatePasswordMutation.mutateAsync(payload)
    })

    const handleLanguageChange = (newLanguage: 'ru' | 'en') => {
        i18n.changeLanguage(newLanguage)
        prefsForm.setValue('language', newLanguage)
        const current = prefsForm.getValues()
        updatePrefsMutation.mutate({ ...current, language: newLanguage })
    }

    const handleResumeSubmit = async (values: CreateResumeDto) => {
        if (editingResume) {
            await updateResumeMutation.mutateAsync({ id: editingResume.id, data: values })
        } else {
            await createResumeMutation.mutateAsync(values)
        }
    }

    const handleEditResume = (resume: Resume) => {
        setEditingResume(resume)
        setShowResumeModal(true)
    }

    const handleDeleteResume = (id: string) => {
        setResumeToDeleteId(id)
        setIsConfirmDeleteOpen(true)
    }

    const handleSetDefaultResume = (id: string) => {
        setDefaultResumeMutation.mutate(id)
    }

    const handleOpenResumeModal = () => {
        setEditingResume(null)
        setShowResumeModal(true)
    }

    const handleCloseResumeModal = () => {
        setShowResumeModal(false)
        setEditingResume(null)
    }

    const profileSuccess = updateUserMutation.isSuccess
    const profileError = updateUserMutation.isError
    const prefsSuccess = updatePrefsMutation.isSuccess
    const prefsError = updatePrefsMutation.isError
    const professionalProfileSuccess = updateProfileMutation.isSuccess
    const professionalProfileError = updateProfileMutation.isError
    const aiProviderSuccess = updateAiProviderMutation.isSuccess
    const aiProviderError = updateAiProviderMutation.isError
    const aiProviderMode = useWatch({
        control: prefsForm.control,
        name: 'aiProviderMode',
    })

    const aiProviderOptions = [
        {
            value: 'CLOUD',
            label: t('settings.aiProviderCloud'),
            icon: Cloud,
            description: t('settings.aiProviderCloudDescriptionFull')
        },
        {
            value: 'LOCAL',
            label: t('settings.aiProviderLocal'),
            icon: Cpu,
            description: t('settings.aiProviderLocalDescriptionFull')
        },
        {
            value: 'BRING_YOUR_OWN_KEY',
            label: t('settings.aiProviderCustom'),
            icon: Key,
            description: t('settings.aiProviderCustomDescriptionFull')
        },
    ]

    return (
        <div className="min-h-full pb-20">
            {/* Header */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-10 animate-slide-up">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                            {t('settings.title')}
                        </h1>
                        <p className="text-sm text-[#6b7590] mt-0.5">{t('settings.subtitle')}</p>
                    </div>
                </div>
            </div>

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
                            <div className="mb-5"><StatusToast type="success" message={t('settings.saved')} /></div>}
                        {profileError &&
                            <div className="mb-5"><StatusToast type="error" message={t('settings.saveError')} /></div>}

                        <form onSubmit={handleProfileSubmit} className="space-y-5">
                            {/* Avatar placeholder */}
                            <div className="flex items-center gap-5 pb-5 border-b border-white/[0.06]">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center text-2xl font-semibold text-white shadow-lg shadow-violet-500/20">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{user?.email}</p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5" />
                                        {t('settings.name')}
                                    </label>
                                    <input
                                        className="input"
                                        {...profileForm.register('name')}
                                    />
                                    {profileForm.formState.errors.name?.message && (
                                        <p className="text-xs text-red-400">{t(profileForm.formState.errors.name.message as string)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <Mail className="w-3.5 h-3.5" />
                                        {t('settings.email')}
                                    </label>
                                    <input
                                        className="input"
                                        {...profileForm.register('email')}
                                    />
                                    {profileForm.formState.errors.email?.message && (
                                        <p className="text-xs text-red-400">{t(profileForm.formState.errors.email.message as string)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    <MapPin className="w-3.5 h-3.5" />
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
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        t('settings.saveSettings')
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Password/Security Section */}
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={Shield}
                            title={user?.hasPassword ? t('settings.changePassword') : t('settings.createPassword')}
                            description={user?.hasPassword ? t('settings.changePasswordDescription') : t('settings.createPasswordDescription')}
                        />

                        {updatePasswordMutation.isSuccess && (
                            <div className="mb-5"><StatusToast type="success" message={t('settings.passwordUpdated')} /></div>
                        )}
                        {updatePasswordMutation.isError && (
                            <div className="mb-5"><StatusToast type="error" message={t('settings.passwordUpdateError')} /></div>
                        )}

                        {!user?.hasPassword && (
                            <div className="mb-5 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <p className="text-sm text-blue-300">{t('settings.oauth2Hint')}</p>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            {user?.hasPassword && (
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <Key className="w-3.5 h-3.5" />
                                        {t('settings.currentPassword')}
                                    </label>
                                    <input
                                        type="password"
                                        className="input"
                                        {...passwordForm.register('currentPassword')}
                                    />
                                    {passwordForm.formState.errors.currentPassword?.message && (
                                        <p className="text-xs text-red-400">{t(passwordForm.formState.errors.currentPassword.message as string)}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    <Key className="w-3.5 h-3.5" />
                                    {t('settings.newPassword')}
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    {...passwordForm.register('newPassword')}
                                />
                                {passwordForm.formState.errors.newPassword?.message && (
                                    <p className="text-xs text-red-400">{t(passwordForm.formState.errors.newPassword.message as string)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    <Key className="w-3.5 h-3.5" />
                                    {t('settings.confirmPassword')}
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    {...passwordForm.register('confirmPassword')}
                                />
                                {passwordForm.formState.errors.confirmPassword?.message && (
                                    <p className="text-xs text-red-400">{t(passwordForm.formState.errors.confirmPassword.message as string)}</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={updatePasswordMutation.isPending}
                                    className={cn(
                                        'btn-primary px-5',
                                        updatePasswordMutation.isPending && 'opacity-70 cursor-not-allowed'
                                    )}
                                >
                                    {updatePasswordMutation.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        user?.hasPassword ? t('settings.changePassword') : t('settings.createPassword')
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Professional Profile Section */}
                    <section className="ds-card ds-anim-rise rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={User}
                            title={t('settings.professionalProfile')}
                            description={t('settings.professionalProfileDescription') || 'Manage your professional information'}
                        />

                        {professionalProfileSuccess &&
                            <div className="mb-5"><StatusToast type="success" message={t('settings.profileSaved') || 'Profile saved successfully'} /></div>}
                        {(professionalProfileError || Object.keys(professionalProfileForm.formState.errors).length > 0) &&
                            <div className="mb-5">
                                <StatusToast
                                    type="error"
                                    message={professionalProfileError ? (t('settings.profileError') || 'Error saving profile') : (t('aiAssistant.fixFields') || 'Please fix the fields.')}
                                />
                            </div>}

                        <form onSubmit={handleProfessionalProfileSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    {t('settings.headline') || 'Headline / Position'}
                                </label>
                                <input
                                    className="input"
                                    {...professionalProfileForm.register('headline')}
                                    placeholder={t('settings.headlinePlaceholder') || 'e.g. Senior Frontend Engineer'}
                                />
                                {professionalProfileForm.formState.errors.headline?.message && (
                                    <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.headline.message as string)}</p>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {t('settings.location') || 'Location'}
                                    </label>
                                    <input
                                        className="input"
                                        {...professionalProfileForm.register('location')}
                                        placeholder={t('settings.locationPlaceholder') || 'e.g. Remote, San Francisco'}
                                    />
                                    {professionalProfileForm.formState.errors.location?.message && (
                                        <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.location.message as string)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        {t('settings.yearsOfExperience') || 'Years of Experience'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        className="input"
                                        {...professionalProfileForm.register('yearsOfExperience', { valueAsNumber: true })}
                                        placeholder="3"
                                    />
                                    {professionalProfileForm.formState.errors.yearsOfExperience?.message && (
                                        <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.yearsOfExperience.message as string, { min: 0, max: 50 })}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                    {t('settings.skills') || 'Skills'}
                                </label>
                                <input
                                    className="input"
                                    {...professionalProfileForm.register('skills')}
                                    placeholder={t('settings.skillsPlaceholder') || 'React, TypeScript, Node.js'}
                                />
                                <p className="text-xs text-white/30">{t('settings.skillsHint') || 'Separate skills with commas'}</p>
                                {professionalProfileForm.formState.errors.skills?.message && (
                                    <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.skills.message as string)}</p>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        {t('settings.linkedinUrl') || 'LinkedIn'}
                                    </label>
                                    <input
                                        className="input"
                                        {...professionalProfileForm.register('linkedinUrl')}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                    {professionalProfileForm.formState.errors.linkedinUrl?.message && (
                                        <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.linkedinUrl.message as string)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        {t('settings.githubUrl') || 'GitHub'}
                                    </label>
                                    <input
                                        className="input"
                                        {...professionalProfileForm.register('githubUrl')}
                                        placeholder="https://github.com/..."
                                    />
                                    {professionalProfileForm.formState.errors.githubUrl?.message && (
                                        <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.githubUrl.message as string)}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label
                                        className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                        {t('settings.portfolioUrl') || 'Portfolio'}
                                    </label>
                                    <input
                                        className="input"
                                        {...professionalProfileForm.register('portfolioUrl')}
                                        placeholder="https://..."
                                    />
                                    {professionalProfileForm.formState.errors.portfolioUrl?.message && (
                                        <p className="text-xs text-red-400">{t(professionalProfileForm.formState.errors.portfolioUrl.message as string)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={professionalProfileForm.formState.isSubmitting}
                                    className={cn(
                                        'btn-primary px-5',
                                        professionalProfileForm.formState.isSubmitting && 'opacity-70 cursor-not-allowed'
                                    )}
                                >
                                    {professionalProfileForm.formState.isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        t('settings.saveProfile') || 'Save Profile'
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Resumes Section */}
                    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                        <SectionHeader
                            icon={FileText}
                            title={t('settings.resumes.title')}
                            description={t('settings.resumes.description')}
                        />

                        <div className="space-y-3">
                            {resumesData && resumesData.length > 0 ? (
                                resumesData.map((resume) => (
                                    <div
                                        key={resume.id}
                                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white truncate">{resume.name}</p>
                                                {resume.isDefault && (
                                                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-xs font-medium text-violet-400">
                                                        {t('settings.resumes.defaultBadge')}
                                                    </span>
                                                )}
                                            </div>
                                            {resume.fileUrl && (
                                                <p className="text-xs text-white/40 mt-0.5 truncate">{resume.fileUrl}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                            {!resume.isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDefaultResume(resume.id)}
                                                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                                >
                                                    {t('settings.resumes.makeDefault')}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleEditResume(resume)}
                                                className="text-xs text-white/60 hover:text-white transition-colors"
                                            >
                                                {t('vacancies.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteResume(resume.id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                {t('vacancies.delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-white/40 text-center py-4">
                                    {t('settings.resumes.description')}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleOpenResumeModal}
                            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] px-4 py-3 text-sm text-white/60 hover:text-white hover:border-white/[0.24] hover:bg-white/[0.02] transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            {t('settings.resumes.addResume')}
                        </button>
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
                                <div>
                                    <p className="text-sm font-medium">{t('settings.languageEN')}</p>
                                </div>
                                {i18n.language === 'en' && (
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
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
                                <div>
                                    <p className="text-sm font-medium">{t('settings.languageRU')}</p>
                                </div>
                                {i18n.language === 'ru' && (
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
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

                        {aiProviderSuccess &&
                            <div className="mb-5"><StatusToast type="success" message={t('settings.aiProviderSaved')} /></div>}
                        {aiProviderError &&
                            <div className="mb-5"><StatusToast type="error" message={t('settings.aiProviderSaveError')} /></div>}

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
                                            updateAiProviderMutation.mutate({ ...current, aiProviderMode: val })
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
                                                className={cn('w-5 h-5', isActive ? 'text-violet-400' : 'text-white/40')} />
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
                                            {isActive && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section id="notifications" className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm scroll-mt-24">
                        <SectionHeader
                            icon={Bell}
                            title={t('settings.notifications')}
                            description={t('settings.notificationsDescription')}
                        />

                        {prefsSuccess &&
                            <div className="mb-5"><StatusToast type="success" message={t('settings.saved')} /></div>}
                        {prefsError &&
                            <div className="mb-5"><StatusToast type="error" message={t('settings.saveError')} /></div>}

                        <form onSubmit={handlePrefsSubmit} className="space-y-3">
                            <div
                                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{t('settings.weeklyDigest')}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{t('settings.weeklyDigestDescription')}</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={weeklyDigest}
                                    onChange={(v) => {
                                        prefsForm.setValue('weeklyDigest', v)
                                        const current = prefsForm.getValues()
                                        updatePrefsMutation.mutate({ ...current, weeklyDigest: v })
                                    }}
                                />
                            </div>

                            <div
                                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Bell className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{t('settings.interviewReminders')}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{t('settings.interviewRemindersDescription')}</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={interviewReminders}
                                    onChange={(v) => {
                                        prefsForm.setValue('interviewReminders', v)
                                        const current = prefsForm.getValues()
                                        updatePrefsMutation.mutate({ ...current, interviewReminders: v })
                                    }}
                                />
                            </div>

                            <div
                                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{t('settings.taskReminders')}</p>
                                        <p className="text-xs text-white/40 mt-0.5">{t('settings.taskRemindersDescription')}</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={taskReminders}
                                    onChange={(v) => {
                                        prefsForm.setValue('taskReminders', v)
                                        const current = prefsForm.getValues()
                                        updatePrefsMutation.mutate({ ...current, taskReminders: v })
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
                                <Shield className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">{t('settings.dangerZone')}</h2>
                                <p className="text-sm text-white/40 mt-0.5">{t('settings.dangerZoneDescription')}</p>
                            </div>
                        </div>

                        <div
                            className="flex items-center justify-between rounded-xl border border-red-500/10 bg-red-500/[0.03] px-4 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{t('settings.deleteAccount')}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{t('settings.deleteAccountDescription')}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteAccountModal(true)
                                    deleteAccountForm.reset()
                                }}
                                className="px-4 py-2 rounded-lg border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                {t('settings.delete')}
                            </button>
                        </div>
                    </section>

                    {/* Delete Account Modal */}
                    {showDeleteAccountModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-[#0f1014] rounded-2xl border border-red-500/20 w-full max-w-md p-6">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <Trash2 className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white">{t('settings.deleteAccountModalTitle')}</h2>
                                        <p className="text-sm text-white/40 mt-0.5">{t('settings.deleteAccountModalDescription')}</p>
                                    </div>
                                </div>

                                <form onSubmit={deleteAccountForm.handleSubmit(handleDeleteAccount)} className="space-y-4">
                                    {user?.hasPassword && (
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">
                                                {t('settings.deleteAccountPasswordLabel')}
                                            </label>
                                            <input
                                                type="password"
                                                {...deleteAccountForm.register('password')}
                                                placeholder={t('settings.deleteAccountPasswordPlaceholder')}
                                                className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                                            />
                                            {deleteAccountForm.formState.errors.password && (
                                                <p className="text-xs text-red-400 mt-1">{t(deleteAccountForm.formState.errors.password.message as string)}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">
                                            {t('settings.deleteAccountConfirmationLabel')}
                                        </label>
                                        <input
                                            type="text"
                                            {...deleteAccountForm.register('confirmation')}
                                            placeholder={t('settings.deleteAccountConfirmationPlaceholder')}
                                            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                                        />
                                        {deleteAccountForm.formState.errors.confirmation && (
                                            <p className="text-xs text-red-400 mt-1">{t(deleteAccountForm.formState.errors.confirmation.message as string)}</p>
                                        )}
                                        <p className="text-xs text-white/30 mt-1">{user?.email}</p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteAccountModal(false)}
                                            className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/[0.02] transition-colors"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={deleteAccountMutation.isPending}
                                            className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {deleteAccountMutation.isPending ? t('common.loading') : t('settings.deleteAccountConfirmButton')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Resume Modal */}
                    {showResumeModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={handleCloseResumeModal}
                            />
                            <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0b0f] p-6 shadow-2xl">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    {editingResume ? t('vacancies.edit') : t('settings.resumes.addResume')}
                                </h3>
                                <ResumeForm
                                    onSubmit={handleResumeSubmit}
                                    onCancel={handleCloseResumeModal}
                                    initialValues={editingResume ? {
                                        name: editingResume.name,
                                        fileUrl: editingResume.fileUrl,
                                        textContent: editingResume.textContent,
                                        isDefault: editingResume.isDefault,
                                    } : undefined}
                                    isSubmitting={createResumeMutation.isPending || updateResumeMutation.isPending}
                                />
                            </div>
                        </div>
                    )}

                    {/* Deletion Confirmation Modal */}
                    <ConfirmModal
                        isOpen={isConfirmDeleteOpen}
                        onClose={() => setIsConfirmDeleteOpen(false)}
                        onConfirm={() => resumeToDeleteId && deleteResumeMutation.mutate(resumeToDeleteId)}
                        title={t('settings.resumes.deleteTitle')}
                        description={t('settings.resumes.deleteConfirm')}
                        isLoading={deleteResumeMutation.isPending}
                    />
                </div>
            </div>
        </div>
    )
}
