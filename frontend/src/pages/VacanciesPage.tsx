import {Link} from 'react-router-dom'
import {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {MatchScoreBadge, RemoteBadge, StatusBadge} from '@/components/StatusBadge'
import {EmptyState} from '@/components/EmptyState'
import {LoadingState} from '@/components/LoadingState'
import {ErrorState} from '@/components/ErrorState'
import {vacancyService} from '@/services/vacancy.service'
import type {RemoteType, Vacancy, VacancyStatus} from '@/types'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {VacancyForm, type VacancyFormValues} from '@/components/VacancyForm'
import {toast} from '@/lib/toast'
import {cn} from '@/lib/utils'

// Icons
function SearchIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    )
}

function GridIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    )
}

function ListIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    )
}

function PlusIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    )
}

function CloseIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    )
}

function ChevronRightIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
    )
}

function BriefcaseIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
        </svg>
    )
}

function MapPinIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
    )
}

function BuildingIcon({className}: {className?: string}) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
    )
}

export default function VacanciesPage() {
    const {t} = useTranslation()
    const queryClient = useQueryClient()
    const [query, setQuery] = useState('')
    const [status, setStatus] = useState<VacancyStatus | 'ALL'>('ALL')
    const [remote, setRemote] = useState<RemoteType | 'ALL'>('ALL')
    const [view, setView] = useState<'list' | 'table'>('list')
    const [isFormOpen, setIsFormOpen] = useState(false)

    const listQuery = useQuery({
        queryKey: ['vacancies', {query, status, remote}],
        queryFn: () =>
            vacancyService.list({
                search: query || undefined,
                status: status === 'ALL' ? undefined : status,
                remote: remote === 'ALL' ? undefined : remote,
                page: 0,
                size: 100,
            }),
    })

    const createMutation = useMutation({
        mutationFn: (values: VacancyFormValues) => vacancyService.create(values),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['vacancies']})
            toast.success(t('vacancies.vacancyCreated'))
            setIsFormOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error(t('vacancies.vacancyCreateFailed'))
        },
    })

    const visibleItems = useMemo<Vacancy[]>(() => listQuery.data?.content ?? [], [listQuery.data])

    return (
        <section className="min-h-full">
            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsFormOpen(false)}
                    />
                    {/* Modal content */}
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0c0c0e] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl shadow-black/50">
                        {/* Modal header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0c0c0e]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)]">
                            <h3 className="text-lg font-semibold text-[#e8eaed]" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                                {t('vacancies.addVacancy')}
                            </h3>
                            <button 
                                onClick={() => setIsFormOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7590] hover:text-[#e8eaed] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Modal body */}
                        <div className="p-6">
                            <VacancyForm
                                onSubmit={async (values) => {
                                    await createMutation.mutateAsync(values)
                                }}
                                onCancel={() => setIsFormOpen(false)}
                                isSubmitting={createMutation.isPending}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Page header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/25 text-violet-400">
                        <BriefcaseIcon className="w-[18px] h-[18px]" />
                    </div>
                    <h1 className="text-2xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                        {t('vacancies.title')}
                    </h1>
                </div>
                <p className="text-sm text-[#6b7590] ml-12">{t('vacancies.subtitle')}</p>
            </div>

            {/* Filter bar */}
            <div className="mb-6 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7590]" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('vacancies.searchPlaceholder')}
                            className="w-full h-10 pl-11 pr-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[14px] text-[#e8eaed] placeholder:text-[#4a4e5a] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <select
                            className="h-10 px-3 pr-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-[#8b8fa3] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 appearance-none cursor-pointer"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as VacancyStatus | 'ALL')}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7590' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
                        >
                            <option value="ALL">{t('vacancies.allStatuses')}</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ARCHIVED">Archived</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                        <select
                            className="h-10 px-3 pr-8 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg text-[13px] text-[#8b8fa3] focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 appearance-none cursor-pointer"
                            value={remote}
                            onChange={(e) => setRemote(e.target.value as RemoteType | 'ALL')}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7590' stroke-width='1.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
                        >
                            <option value="ALL">{t('vacancies.allModes')}</option>
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ON_SITE">On-site</option>
                        </select>

                        {/* View toggle */}
                        <div className="flex items-center p-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className={cn(
                                    'w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200',
                                    view === 'list' 
                                        ? 'bg-[rgba(255,255,255,0.08)] text-[#e8eaed]' 
                                        : 'text-[#6b7590] hover:text-[#8b8fa3]'
                                )}
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setView('table')}
                                className={cn(
                                    'w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200',
                                    view === 'table' 
                                        ? 'bg-[rgba(255,255,255,0.08)] text-[#e8eaed]' 
                                        : 'text-[#6b7590] hover:text-[#8b8fa3]'
                                )}
                            >
                                <GridIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Results count */}
                        <span className="px-3 py-1.5 text-xs font-medium text-[#6b7590] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-full">
                            {visibleItems.length} {t('vacancies.results')}
                        </span>

                        {/* Add button */}
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(true)}
                            disabled={createMutation.isPending}
                            className="h-10 px-4 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-[13px] font-semibold rounded-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:from-violet-500 hover:to-violet-400 transition-all duration-200 disabled:opacity-60"
                        >
                            <PlusIcon className="w-4 h-4" />
                            {t('vacancies.addVacancy')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {listQuery.isLoading ? (
                <LoadingState message={t('vacancies.loading')}/>
            ) : listQuery.error ? (
                <ErrorState
                    title={t('vacancies.error')}
                    message={listQuery.error instanceof Error ? listQuery.error.message : t('messages.errorMessage')}
                />
            ) : visibleItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/20 text-violet-400 mb-4">
                        <BriefcaseIcon className="w-8 h-8" />
                    </div>
                    <EmptyState
                        title={t('vacancies.noVacancies')}
                        description={t('vacancies.noVacanciesDescription')}
                    />
                </div>
            ) : (
                <>
                    {view === 'list' ? (
                        <div className="grid gap-3">
                            {visibleItems.map((v, index) => (
                                <Link
                                    key={v.id}
                                    to={`/app/vacancies/${v.id}`}
                                    className="group relative flex items-center gap-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(139,92,246,0.3)] hover:shadow-[0_0_24px_-8px_rgba(139,92,246,0.2)] transition-all duration-300 no-underline"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    {/* Company avatar */}
                                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.08)] text-[#6b7590] group-hover:border-violet-500/30 group-hover:text-violet-400 transition-all duration-300">
                                        <BuildingIcon className="w-5 h-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[15px] font-semibold text-[#e8eaed] truncate group-hover:text-white transition-colors" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                                                {v.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[13px] text-[#6b7590]">
                                            <span className="flex items-center gap-1.5">
                                                <BuildingIcon className="w-3.5 h-3.5" />
                                                {v.company?.name ?? 'Unknown company'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPinIcon className="w-3.5 h-3.5" />
                                                {v.location ?? '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center gap-2 flex-wrap justify-end">
                                        <StatusBadge status={v.status} kind="vacancy" size="sm"/>
                                        <RemoteBadge remote={v.remote}/>
                                        {typeof v.matchScore === 'number' && <MatchScoreBadge score={v.matchScore}/>}
                                        {v.tags.slice(0, 2).map((tag) => (
                                            <span key={tag.id} className="px-2 py-0.5 text-xs font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-full">
                                                {tag.label}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Arrow */}
                                    <ChevronRightIcon className="w-5 h-5 text-[#4a4e5a] group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-semibold text-[#6b7590] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                                <div className="col-span-5">{t('vacancies.tableRole')}</div>
                                <div className="col-span-3">{t('vacancies.tableCompany')}</div>
                                <div className="col-span-2">{t('vacancies.tableStatus')}</div>
                                <div className="col-span-2 text-right">{t('vacancies.tableMatch')}</div>
                            </div>
                            {/* Table rows */}
                            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                                {visibleItems.map((v) => (
                                    <Link
                                        key={v.id}
                                        to={`/app/vacancies/${v.id}`}
                                        className="group grid grid-cols-12 gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors no-underline"
                                    >
                                        <div className="col-span-5 min-w-0">
                                            <div className="text-[14px] font-medium text-[#e8eaed] truncate group-hover:text-white transition-colors">{v.title}</div>
                                            <div className="flex items-center gap-2 mt-1 text-[12px] text-[#6b7590]">
                                                <span>{v.location ?? '—'}</span>
                                                <span className="text-[#4a4e5a]">·</span>
                                                <span>{v.remote}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex items-center text-[13px] text-[#8b8fa3] truncate">
                                            {v.company?.name ?? '—'}
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <StatusBadge status={v.status} kind="vacancy" size="sm"/>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            {typeof v.matchScore === 'number' ?
                                                <MatchScoreBadge score={v.matchScore}/> :
                                                <span className="text-xs text-[#4a4e5a]">—</span>}
                                            <ChevronRightIcon className="w-4 h-4 text-[#4a4e5a] group-hover:text-violet-400 transition-colors" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    )
}
