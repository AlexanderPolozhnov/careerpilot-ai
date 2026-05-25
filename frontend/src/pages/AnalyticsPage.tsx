import { useMemo, Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Activity,
    BarChart3,
    Building2,
    Check,
    Clock,
    Layers,
    MessageCircle,
    Target,
    TrendingDown,
    TrendingUp,
    X,
    Zap
} from 'lucide-react'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { analyticsService } from '@/services/analytics.service'
import type { AnalyticsSummary, ApplicationFunnel, CompanyAnalyticsItem } from '@/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

function pct(n: number) {
    return `${Math.round(n * 100)}%`
}

const statusKeyMap: Record<string, string> = {
    'NEW': 'applications.new',
    'SAVED': 'applications.saved',
    'APPLIED': 'applications.applied',
    'HR_SCREEN': 'applications.hrScreen',
    'TECH_INTERVIEW': 'applications.techInterview',
    'FINAL_ROUND': 'applications.finalRound',
    'OFFER': 'applications.offer',
    'REJECTED': 'applications.rejected',
}

const statusColors: Record<string, { bar: string; bg: string; text: string }> = {
    'NEW': { bar: 'bg-zinc-500', bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
    'SAVED': { bar: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
    'APPLIED': { bar: 'bg-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-400' },
    'HR_SCREEN': { bar: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    'TECH_INTERVIEW': { bar: 'bg-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    'FINAL_ROUND': { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    'OFFER': { bar: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
    'REJECTED': { bar: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
}

function CompanyLogo({ url, name }: { url?: string | null; name: string }) {
    const [error, setError] = useState(false)
    if (!url || error) {
        return (
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-white/40" />
            </div>
        )
    }
    return (
        <img
            src={url}
            alt={name}
            onError={() => setError(true)}
            className="w-8 h-8 rounded-lg object-cover shrink-0 bg-white/[0.02]"
        />
    )
}

function KPICard({
    label,
    value,
    icon: Icon,
    color = 'violet',
    trend,
    delay = 0
}: {
    label: string
    value: string | number
    icon: React.ElementType
    color?: 'violet' | 'blue' | 'emerald' | 'amber'
    trend?: { value: number; positive: boolean }
    delay?: number
}) {
    const { t } = useTranslation()
    const colorStyles = {
        violet: {
            iconBg: 'bg-violet-500/10',
            iconColor: 'text-violet-400',
            glow: 'shadow-violet-500/5',
            border: 'hover:border-violet-500/20',
        },
        blue: {
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
            glow: 'shadow-blue-500/5',
            border: 'hover:border-blue-500/20',
        },
        emerald: {
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            glow: 'shadow-emerald-500/5',
            border: 'hover:border-emerald-500/20',
        },
        amber: {
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
            glow: 'shadow-amber-500/5',
            border: 'hover:border-amber-500/20',
        },
    }

    const styles = colorStyles[color]

    return (
        <div
            className={cn(
                'group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6',
                'transition-all duration-300 hover:bg-white/[0.04]',
                styles.border,
                'animate-slide-up'
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={cn(
                'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                `shadow-2xl ${styles.glow}`
            )} />

            <div className="relative flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                        {label}
                    </p>
                    <p className="text-4xl font-semibold tracking-tight text-white">
                        {value}
                    </p>
                    {trend && (
                        <div className="flex items-center gap-1.5 mt-3">
                            {trend.positive ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className={cn(
                                'text-xs font-medium',
                                trend.positive ? 'text-emerald-400' : 'text-red-400'
                            )}>
                                {t('analytics.vsLastWeek', { value: `${trend.positive ? '+' : ''}${trend.value}` })}
                            </span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    styles.iconBg
                )}>
                    <Icon className={cn('w-6 h-6', styles.iconColor)} />
                </div>
            </div>
        </div>
    )
}

function FunnelBar({
    label,
    count,
    percentage,
    max,
    status,
    delay = 0
}: {
    label: string
    count: number
    percentage: number
    max: number
    status: string
    delay?: number
}) {
    const colors = statusColors[status] || statusColors['NEW']
    const width = Math.max(8, (count / max) * 100)

    return (
        <div
            className="group flex items-center gap-4 animate-slide-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="w-32 shrink-0">
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                    {label}
                </span>
            </div>

            <div className="flex-1 relative">
                <div className="h-8 rounded-lg bg-white/[0.04] overflow-hidden">
                    <div
                        className={cn(
                            'h-full rounded-lg transition-all duration-700 ease-out',
                            colors.bar
                        )}
                        style={{ width: `${width}%` }}
                    />
                </div>
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="w-24 shrink-0 text-right">
                <span className="text-sm font-medium text-white">{count}</span>
                <span className="text-xs text-white/30 ml-2">{Math.round(percentage)}%</span>
            </div>
        </div>
    )
}

function SkillGapItem({
    skill,
    frequency,
    hasSkill,
    delay = 0
}: {
    skill: string
    frequency: number
    hasSkill: boolean
    delay?: number
}) {
    const { t } = useTranslation()
    return (
        <div
            className="group flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 animate-slide-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    hasSkill ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                )}>
                    {hasSkill ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <X className="w-4 h-4 text-amber-400" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-white truncate">{skill}</p>
                    <p className="text-xs text-white/30">{t('analytics.mentionsCount', { count: frequency })}</p>
                </div>
            </div>

            <span className={cn(
                'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium',
                hasSkill
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            )}>
                {hasSkill ? t('analytics.acquired') : t('analytics.gap')}
            </span>
        </div>
    )
}

function WeeklyActivityChart({
    data
}: {
    data: Array<{ week: string; applied: number; interviews: number; offers: number }>
}) {
    const { t } = useTranslation()
    const maxValue = Math.max(...data.flatMap(w => [w.applied, w.interviews * 5, w.offers * 10]), 1)

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    <span className="text-xs text-white/40">{t('analytics.applied')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span className="text-xs text-white/40">{t('analytics.interviews')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-white/40">{t('analytics.offers')}</span>
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-32">
                {data.map((week, i) => (
                    <div key={week.week} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex items-end justify-center gap-0.5 h-24">
                            <div
                                className="w-2 bg-violet-500/80 rounded-t transition-all duration-500 group-hover:bg-violet-500"
                                style={{
                                    height: `${Math.max(4, (week.applied / maxValue) * 100)}%`,
                                    animationDelay: `${i * 100}ms`
                                }}
                            />
                            <div
                                className="w-2 bg-cyan-500/80 rounded-t transition-all duration-500 group-hover:bg-cyan-500"
                                style={{
                                    height: `${Math.max(4, ((week.interviews * 5) / maxValue) * 100)}%`,
                                    animationDelay: `${i * 100 + 50}ms`
                                }}
                            />
                            <div
                                className="w-2 bg-emerald-500/80 rounded-t transition-all duration-500 group-hover:bg-emerald-500"
                                style={{
                                    height: `${Math.max(4, ((week.offers * 10) / maxValue) * 100)}%`,
                                    animationDelay: `${i * 100 + 100}ms`
                                }}
                            />
                        </div>
                        <span className="text-[10px] text-white/30 truncate max-w-full">
                            {week.week.slice(0, 5)}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04]">
                {data.slice(-1).map(w => (
                    <Fragment key={`summary-${w.week}`}>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-violet-400">{w.applied}</p>
                            <p className="text-[10px] text-white/30 uppercase">{t('analytics.thisWeek')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-cyan-400">{w.interviews}</p>
                            <p className="text-[10px] text-white/30 uppercase">{t('analytics.interviews')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-emerald-400">{w.offers}</p>
                            <p className="text-[10px] text-white/30 uppercase">{t('analytics.offers')}</p>
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<'overview' | 'companies'>('overview')

    const summaryQuery = useQuery({
        queryKey: ['analytics', 'summary'],
        queryFn: () => analyticsService.getSummary(),
    })
    const companiesQuery = useQuery({
        queryKey: ['analytics', 'companies'],
        queryFn: () => analyticsService.getCompanyAnalytics(),
    })
    const data: AnalyticsSummary | undefined = summaryQuery.data
    const companiesData: CompanyAnalyticsItem[] | undefined = companiesQuery.data

    const maxFunnel = useMemo(() => {
        const f = data?.funnel ?? []
        return f.reduce((m, x) => Math.max(m, x.count), 1)
    }, [data])

    const getStatusLabel = (status: string): string => {
        return t(statusKeyMap[status] || `applications.${status.toLowerCase()}`)
    }

    if (summaryQuery.isLoading && activeTab === 'overview') return <LoadingState message={t('analytics.overview')} />
    if (companiesQuery.isLoading && activeTab === 'companies') return <LoadingState message={t('analytics.tabs.companies')} />
    if (summaryQuery.error && activeTab === 'overview')
        return (
            <ErrorState
                title={t('analytics.title')}
                message={summaryQuery.error instanceof Error ? summaryQuery.error.message : t('messages.errorMessage')}
            />
        )
    if (companiesQuery.error && activeTab === 'companies')
        return (
            <ErrorState
                title={t('analytics.title')}
                message={companiesQuery.error instanceof Error ? companiesQuery.error.message : t('messages.errorMessage')}
            />
        )
    if (!data && activeTab === 'overview') return null
    if (!companiesData && activeTab === 'companies') return null

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-purple-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                            {t('analytics.title')}
                        </h1>
                        <p className="text-sm text-[#6b7590] mt-0.5">
                            {t('analytics.overview')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            activeTab === 'overview'
                                ? 'bg-white/[0.06] text-white border border-white/[0.08]'
                                : 'text-white/40 hover:text-white/60'
                        )}
                    >
                        {t('analytics.tabs.overview')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('companies')}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                            activeTab === 'companies'
                                ? 'bg-white/[0.06] text-white border border-white/[0.08]'
                                : 'text-white/40 hover:text-white/60'
                        )}
                    >
                        {t('analytics.tabs.companies')}
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <KPICard
                            label={t('analytics.responseRate')}
                            value={pct(data.responseRate)}
                            icon={MessageCircle}
                            color="violet"
                            trend={{ value: 12, positive: true }}
                            delay={0}
                        />
                        <KPICard
                            label={t('analytics.interviewRate')}
                            value={pct(data.interviewRate)}
                            icon={Target}
                            color="blue"
                            trend={{ value: 8, positive: true }}
                            delay={50}
                        />
                        <KPICard
                            label={t('analytics.offerRate')}
                            value={pct(data.offerRate)}
                            icon={BarChart3}
                            color="emerald"
                            trend={{ value: 3, positive: false }}
                            delay={100}
                        />
                        <KPICard
                            label={t('analytics.avgDaysToInterview')}
                            value={`${data.avgTimeToInterview}d`}
                            icon={Clock}
                            color="amber"
                            delay={150}
                        />
                    </div>
                </>
            )}

            {activeTab === 'overview' && data ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white">
                                            {t('analytics.funnelTitle')}
                                        </h2>
                                        <p className="text-xs text-white/40">
                                            {t('analytics.funnelDescription')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400">
                                        {t('analytics.totalApplications', { count: data.totalApplications })}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {data.funnel.map((f: ApplicationFunnel, i: number) => (
                                    <FunnelBar
                                        key={f.status}
                                        label={getStatusLabel(f.status)}
                                        count={f.count}
                                        percentage={f.percentage}
                                        max={maxFunnel}
                                        status={f.status}
                                        delay={i * 50}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-white">
                                        {t('analytics.weeklyActivityTitle')}
                                    </h2>
                                    <p className="text-xs text-white/40">
                                        {t('analytics.weeklyActivityDescription')}
                                    </p>
                                </div>
                            </div>

                            <WeeklyActivityChart data={data.weeklyActivity} />
                        </div>

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white">
                                            {t('analytics.skillGapsTitle')}
                                        </h2>
                                        <p className="text-xs text-white/40">
                                            {t('analytics.skillGapsDescription')}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="px-2.5 py-1 rounded-full bg-white/[0.06] text-xs font-medium text-white/50">
                                    {t('analytics.skillsCount', { count: data.topSkillGaps.length })}
                                </span>
                            </div>

                            <div className="max-h-64 overflow-y-auto scrollbar-hide">
                                {data.topSkillGaps.map((g, i) => (
                                    <SkillGapItem
                                        key={g.skill}
                                        skill={g.skill}
                                        frequency={g.frequency}
                                        hasSkill={g.hasSkill}
                                        delay={i * 50}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                {t('analytics.tabs.companies')}
                            </h2>
                            <p className="text-xs text-white/40">
                                {t('analytics.companies.description')}
                            </p>
                        </div>
                    </div>

                    {companiesData && companiesData.length > 0 ? (
                        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-semibold text-[#6b7590] uppercase tracking-wider border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                                <div className="col-span-4">{t('analytics.companies.name')}</div>
                                <div className="col-span-2">{t('analytics.companies.applications')}</div>
                                <div className="col-span-2">{t('analytics.companies.interviews')}</div>
                                <div className="col-span-2">{t('analytics.companies.offers')}</div>
                                <div className="col-span-1 text-right">{t('analytics.companies.responseRate')}</div>
                                <div className="col-span-1 text-right">{t('analytics.companies.avgTimeToInterview')}</div>
                            </div>
                            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                                {companiesData.map((company) => (
                                    <div
                                        key={company.companyId}
                                        className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                                    >
                                        <div className="col-span-4 flex items-center gap-3">
                                            <CompanyLogo url={company.logoUrl} name={company.companyName} />
                                            <span className="text-sm text-white font-medium">{company.companyName}</span>
                                        </div>
                                        <div className="col-span-2 text-sm text-white/60">{company.applicationCount}</div>
                                        <div className="col-span-2 text-sm text-white/60">{company.interviewCount}</div>
                                        <div className="col-span-2 text-sm text-white/60">{company.offerCount}</div>
                                        <div className="col-span-1 text-sm text-right text-white/60">{pct(company.responseRate)}</div>
                                        <div className="col-span-1 text-sm text-right text-white/60">{company.avgTimeToInterview.toFixed(1)}d</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-sm text-white/40">{t('analytics.noData')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
