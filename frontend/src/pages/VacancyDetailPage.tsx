import {Link, useNavigate, useParams} from 'react-router-dom'
import {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {EmptyState} from '@/components/EmptyState'
import {MatchScoreBadge, RemoteBadge, StatusBadge} from '@/components/StatusBadge'
import {AiInsightCard} from '@/components/AiInsightCard'
import {LoadingState} from '@/components/LoadingState'
import {ErrorState} from '@/components/ErrorState'
import {vacancyService} from '@/services/vacancy.service'
import {aiService} from '@/services/ai.service'
import {applicationService} from '@/services/application.service'
import type {AiResult, Vacancy} from '@/types'
import {cn, formatSalary} from '@/lib/utils'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {VacancyForm, type VacancyFormValues} from '@/components/VacancyForm'
import {toast} from '@/lib/toast'

// Icons
function ArrowLeftIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
    )
}

function CloseIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    )
}

function ExternalLinkIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
        </svg>
    )
}

function MapPinIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
        </svg>
    )
}

function BuildingIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>
        </svg>
    )
}

function CurrencyIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    )
}

function ClockIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
    )
}

function PencilIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
        </svg>
    )
}

function TrashIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
        </svg>
    )
}

function BookmarkIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
        </svg>
    )
}

function CheckIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
        </svg>
    )
}

function SparklesIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
        </svg>
    )
}

function GlobeIcon({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
        </svg>
    )
}

export default function VacancyDetailPage() {
    const {t} = useTranslation()
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [insight, setInsight] = useState<AiResult | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    const vacancyQuery = useQuery({
        queryKey: ['vacancies', 'detail', {id}],
        enabled: !!id,
        queryFn: () => vacancyService.getById(id as string),
    })

    const insightQuery = useQuery({
        queryKey: ['ai', 'history', {type: 'VACANCY_ANALYSIS', vacancyId: id}],
        enabled: !!id,
        queryFn: async () => {
            const items = await aiService.getHistory('VACANCY_ANALYSIS')
            return items.find((r) => r.vacancyId === id) ?? null
        },
    })

    const vacancy: Vacancy | null = vacancyQuery.data ?? null
    const aiInsight = insight ?? insightQuery.data ?? null
    const company = useMemo(() => vacancy?.company, [vacancy])

    const updateMutation = useMutation({
        mutationFn: (values: VacancyFormValues) =>
            vacancyService.update(id as string, values),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vacancies', 'detail', {id}]})
            toast.success(t('vacancies.vacancyUpdated'))
            setIsEditing(false)
        },
        onError: () => {
            toast.error(t('vacancies.vacancyUpdateFailed'))
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (vacancyId: string) => vacancyService.delete(vacancyId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['vacancies']})
            toast.success(t('vacancies.vacancyDeleted'))
            navigate('/app/vacancies')
        },
        onError: () => {
            toast.error(t('vacancies.vacancyDeleteFailed'))
        }
    })

    const initialFormValues = useMemo((): Partial<VacancyFormValues> | undefined => {
        if (!vacancy) return undefined
        return {
            title: vacancy.title,
            companyId: vacancy.companyId,
            url: vacancy.url,
            description: vacancy.description,
            location: vacancy.location,
            remote: vacancy.remote,
            contractType: vacancy.contractType,
            salaryMin: vacancy.salaryMin,
            salaryMax: vacancy.salaryMax,
            salaryCurrency: vacancy.salaryCurrency,
            deadline: vacancy.deadline ? vacancy.deadline.split('T')[0] : undefined,
        }
    }, [vacancy])

    return (
        <section className="min-h-full">
            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsEditing(false)}
                    />
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0c0e] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl shadow-black/50">
                        <div
                            className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0c0c0e]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)]">
                            <h3 className="text-lg font-semibold text-[#e8eaed]"
                                style={{fontFamily: 'Onest, system-ui, sans-serif'}}>
                                {t('vacancies.edit')}
                            </h3>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7590] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
                            >
                                <CloseIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="p-6">
                            <VacancyForm
                                onSubmit={async (values) => {
                                    await updateMutation.mutateAsync(values)
                                }}
                                onCancel={() => setIsEditing(false)}
                                isSubmitting={updateMutation.isPending}
                                initialValues={initialFormValues}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Back link */}
            <Link
                to="/app/vacancies"
                className="inline-flex items-center gap-2 text-[13px] text-[#6b7590] hover:text-[#e8eaed] transition-colors mb-6 no-underline"
            >
                <ArrowLeftIcon className="w-4 h-4"/>
                {t('vacancies.backToVacancies')}
            </Link>

            {vacancyQuery.isLoading ? (
                <LoadingState message={t('vacancies.loadingDetail')}/>
            ) : vacancyQuery.error ? (
                <ErrorState
                    title={t('vacancies.loadError')}
                    message={vacancyQuery.error instanceof Error ? vacancyQuery.error.message : t('vacancies.loadErrorMessage')}
                />
            ) : !vacancy ? (
                <EmptyState title={t('vacancies.notFoundTitle')}
                            description={t('vacancies.notFoundDescription', {id: id ?? '—'})}/>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Header card */}
                        <div
                            className="relative p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
                            {/* Gradient accent */}
                            <div
                                className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"/>

                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 min-w-0">
                                    {/* Company avatar */}
                                    <div
                                        className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/25 text-violet-400 shrink-0">
                                        <BuildingIcon className="w-6 h-6"/>
                                    </div>

                                    <div className="min-w-0">
                                        <h1 className="text-xl font-semibold text-[#e8eaed] mb-1"
                                            style={{fontFamily: 'Onest, system-ui, sans-serif'}}>
                                            {vacancy.title}
                                        </h1>
                                        <div className="flex items-center gap-3 text-[14px] text-[#6b7590]">
                      <span className="flex items-center gap-1.5">
                        <BuildingIcon className="w-4 h-4"/>
                          {company?.name ?? t('vacancies.companyLabel')}
                      </span>
                                            <span className="text-[#4a4e5a]">·</span>
                                            <span className="flex items-center gap-1.5">
                        <MapPinIcon className="w-4 h-4"/>
                                                {vacancy.location ?? '—'}
                      </span>
                                        </div>

                                        {/* Badges */}
                                        <div className="mt-4 flex flex-wrap items-center gap-2">
                                            <StatusBadge status={vacancy.status} kind="vacancy"/>
                                            <RemoteBadge remote={vacancy.remote}/>
                                            {typeof vacancy.matchScore === 'number' &&
                                                <MatchScoreBadge score={vacancy.matchScore}/>}
                                            {vacancy.tags.map((tag) => (
                                                <span key={tag.id}
                                                      className="px-2.5 py-1 text-xs font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-full">
                          {tag.label}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {vacancy.url && (
                                    <a
                                        href={vacancy.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg hover:bg-[rgba(255,255,255,0.06)] hover:text-[#e8eaed] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200 no-underline shrink-0"
                                    >
                                        {t('vacancies.openPosting')}
                                        <ExternalLinkIcon className="w-3.5 h-3.5"/>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                <div className="flex items-center gap-2 text-[12px] text-[#6b7590] mb-2">
                                    <CurrencyIcon className="w-4 h-4"/>
                                    {t('vacancies.salary')}
                                </div>
                                <div className="text-[15px] font-medium text-[#e8eaed]">
                                    {formatSalary(vacancy.salaryMin, vacancy.salaryMax, vacancy.salaryCurrency ?? 'USD')}
                                </div>
                            </div>
                            <div
                                className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                <div className="flex items-center gap-2 text-[12px] text-[#6b7590] mb-2">
                                    <ClockIcon className="w-4 h-4"/>
                                    {t('vacancies.contract')}
                                </div>
                                <div className="text-[15px] font-medium text-[#e8eaed]">
                                    {vacancy.contractType ?? '—'}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {vacancy.description && (
                            <div
                                className="p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                <h2 className="text-[14px] font-semibold text-[#e8eaed] mb-3"
                                    style={{fontFamily: 'Onest, system-ui, sans-serif'}}>
                                    {t('vacancies.descriptionLabel')}
                                </h2>
                                <p className="text-[14px] text-[#8b8fa3] leading-relaxed whitespace-pre-wrap">
                                    {vacancy.description}
                                </p>
                            </div>
                        )}

                        {/* Company info */}
                        {company && (
                            <div
                                className="p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                <h2 className="text-[14px] font-semibold text-[#e8eaed] mb-4"
                                    style={{fontFamily: 'Onest, system-ui, sans-serif'}}>
                                    {t('vacancies.companyLabel')}
                                </h2>
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#6b7590]">
                                        <BuildingIcon className="w-5 h-5"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-[15px] font-medium text-[#e8eaed] mb-1">{company.name}</div>
                                        {company.description && (
                                            <p className="text-[13px] text-[#6b7590] leading-relaxed mb-3">{company.description}</p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {company.industry && (
                                                <span
                                                    className="px-2.5 py-1 text-xs font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-full">
                          {company.industry}
                        </span>
                                            )}
                                            {company.location && (
                                                <span
                                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-full">
                          <MapPinIcon className="w-3 h-3"/>
                                                    {company.location}
                        </span>
                                            )}
                                            {company.size && (
                                                <span
                                                    className="px-2.5 py-1 text-xs font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-full">
                          {company.size}
                        </span>
                                            )}
                                            {company.website && (
                                                <a
                                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full hover:bg-violet-500/15 transition-colors no-underline"
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <GlobeIcon className="w-3 h-3"/>
                                                    {t('vacancies.website')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[rgba(255,255,255,0.06)] hover:text-[#e8eaed] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
                            >
                                <PencilIcon className="w-4 h-4"/>
                                {t('vacancies.edit')}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (!id || !window.confirm(t('vacancies.deleteConfirmation'))) return
                                    await deleteMutation.mutateAsync(id)
                                }}
                                disabled={deleteMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/15 hover:border-red-500/30 transition-all duration-200"
                            >
                                <TrashIcon className="w-4 h-4"/>
                                {t('vacancies.delete')}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await applicationService.create({vacancyId: vacancy.id, status: 'SAVED'})
                                    toast.info(t('vacancies.savedToApplications'))
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[rgba(255,255,255,0.06)] hover:text-[#e8eaed] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
                            >
                                <BookmarkIcon className="w-4 h-4"/>
                                {t('vacancies.save')}
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await applicationService.create({
                                        vacancyId: vacancy.id,
                                        status: 'APPLIED',
                                        appliedAt: new Date().toISOString()
                                    })
                                    toast.info(t('vacancies.markedAsApplied'))
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-violet-400 transition-all duration-200"
                            >
                                <CheckIcon className="w-4 h-4"/>
                                {t('vacancies.apply')}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar - AI Insights */}
                    <div className="space-y-5">
                        {/* AI Analysis panel */}
                        <div
                            className="relative p-5 bg-gradient-to-br from-violet-500/10 via-[rgba(255,255,255,0.02)] to-purple-600/10 border border-violet-500/20 rounded-2xl overflow-hidden">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"/>

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-500/30 text-violet-400">
                                        <SparklesIcon className="w-[18px] h-[18px]"/>
                                    </div>
                                    <div>
                                        <h2 className="text-[14px] font-semibold text-[#e8eaed]"
                                            style={{fontFamily: 'Onest, system-ui, sans-serif'}}>
                                            {t('vacancies.aiInsight')}
                                        </h2>
                                        <p className="text-[12px] text-[#6b7590]">AI-powered analysis</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsAnalyzing(true)
                                        try {
                                            const res = await aiService.analyzeVacancy({vacancyId: vacancy.id})
                                            setInsight(res.result)
                                            toast.info(t('vacancies.aiAnalysisGenerated'))
                                        } finally {
                                            setIsAnalyzing(false)
                                        }
                                    }}
                                    disabled={isAnalyzing}
                                    className={cn(
                                        'w-full flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold rounded-xl transition-all duration-200',
                                        isAnalyzing
                                            ? 'bg-violet-500/20 text-violet-300 cursor-wait'
                                            : 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-violet-400'
                                    )}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-4 h-4"/>
                                            {t('vacancies.generateAnalysis')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* AI Insight result */}
                        {aiInsight ? (
                            <div
                                className="p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                                <AiInsightCard result={aiInsight} compact/>
                            </div>
                        ) : (
                            <div
                                className="p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl text-center">
                                <div
                                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] text-[#4a4e5a] mx-auto mb-3">
                                    <SparklesIcon className="w-6 h-6"/>
                                </div>
                                <h3 className="text-[14px] font-medium text-[#6b7590] mb-1">
                                    {t('vacancies.noAiInsightTitle')}
                                </h3>
                                <p className="text-[13px] text-[#4a4e5a]">
                                    {t('vacancies.noAiInsightDescription')}
                                </p>
                            </div>
                        )}

                        {/* Quick actions */}
                        <div
                            className="p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                            <h3 className="text-[13px] font-semibold text-[#6b7590] uppercase tracking-wider mb-3">Quick
                                Actions</h3>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#8b8fa3] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-all duration-200 text-left"
                                >
                                    <SparklesIcon className="w-4 h-4 text-violet-400"/>
                                    Generate cover letter
                                </button>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#8b8fa3] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-all duration-200 text-left"
                                >
                                    <SparklesIcon className="w-4 h-4 text-violet-400"/>
                                    Match resume skills
                                </button>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#8b8fa3] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-all duration-200 text-left"
                                >
                                    <SparklesIcon className="w-4 h-4 text-violet-400"/>
                                    Prepare interview questions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
