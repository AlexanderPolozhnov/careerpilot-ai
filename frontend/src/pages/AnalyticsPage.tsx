import {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Activity,
  BarChart3,
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
import {LoadingState} from '@/components/LoadingState'
import {ErrorState} from '@/components/ErrorState'
import {analyticsService} from '@/services/analytics.service'
import type {AnalyticsSummary, ApplicationFunnel} from '@/types'
import {cn} from '@/lib/utils'
import {useQuery} from '@tanstack/react-query'

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
    'NEW': {bar: 'bg-zinc-500', bg: 'bg-zinc-500/10', text: 'text-zinc-400'},
    'SAVED': {bar: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400'},
    'APPLIED': {bar: 'bg-violet-500', bg: 'bg-violet-500/10', text: 'text-violet-400'},
    'HR_SCREEN': {bar: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400'},
    'TECH_INTERVIEW': {bar: 'bg-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400'},
    'FINAL_ROUND': {bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400'},
    'OFFER': {bar: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400'},
    'REJECTED': {bar: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400'},
}

// KPI Card Component
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
            style={{animationDelay: `${delay}ms`}}
        >
            {/* Subtle glow on hover */}
            <div className={cn(
                'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                `shadow-2xl ${styles.glow}`
            )}/>

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
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400"/>
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-red-400"/>
                            )}
                            <span className={cn(
                                'text-xs font-medium',
                                trend.positive ? 'text-emerald-400' : 'text-red-400'
                            )}>
                {trend.positive ? '+' : ''}{trend.value}% vs last week
              </span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    styles.iconBg
                )}>
                    <Icon className={cn('w-6 h-6', styles.iconColor)}/>
                </div>
            </div>
        </div>
    )
}

// Funnel Bar Component
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
            style={{animationDelay: `${delay}ms`}}
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
                        style={{width: `${width}%`}}
                    />
                </div>
                {/* Sparkline overlay effect */}
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>

            <div className="w-24 shrink-0 text-right">
                <span className="text-sm font-medium text-white">{count}</span>
                <span className="text-xs text-white/30 ml-2">{Math.round(percentage)}%</span>
            </div>
        </div>
    )
}

// Skill Gap Item Component
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
    return (
        <div
            className="group flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 animate-slide-up"
            style={{animationDelay: `${delay}ms`}}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    hasSkill ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                )}>
                    {hasSkill ? (
                        <Check className="w-4 h-4 text-emerald-400"/>
                    ) : (
                        <X className="w-4 h-4 text-amber-400"/>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-white truncate">{skill}</p>
                    <p className="text-xs text-white/30">{frequency} mentions</p>
                </div>
            </div>

            <span className={cn(
                'shrink-0 px-2.5 py-1 rounded-full text-xs font-medium',
                hasSkill
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            )}>
        {hasSkill ? 'Acquired' : 'Gap'}
      </span>
        </div>
    )
}

// Weekly Activity Mini Chart
function WeeklyActivityChart({
                                 data
                             }: {
    data: Array<{ week: string; applied: number; interviews: number; offers: number }>
}) {
    const maxValue = Math.max(...data.flatMap(w => [w.applied, w.interviews * 5, w.offers * 10]), 1)

    return (
        <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500"/>
                    <span className="text-xs text-white/40">Applied</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500"/>
                    <span className="text-xs text-white/40">Interviews</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
                    <span className="text-xs text-white/40">Offers</span>
                </div>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-32">
                {data.map((week, i) => (
                    <div key={week.week} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full flex items-end justify-center gap-0.5 h-24">
                            {/* Applied bar */}
                            <div
                                className="w-2 bg-violet-500/80 rounded-t transition-all duration-500 group-hover:bg-violet-500"
                                style={{
                                    height: `${Math.max(4, (week.applied / maxValue) * 100)}%`,
                                    animationDelay: `${i * 100}ms`
                                }}
                            />
                            {/* Interviews bar */}
                            <div
                                className="w-2 bg-cyan-500/80 rounded-t transition-all duration-500 group-hover:bg-cyan-500"
                                style={{
                                    height: `${Math.max(4, ((week.interviews * 5) / maxValue) * 100)}%`,
                                    animationDelay: `${i * 100 + 50}ms`
                                }}
                            />
                            {/* Offers bar */}
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

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04]">
                {data.slice(-1).map(w => (
                    <>
                        <div key={`applied-${w.week}`} className="text-center">
                            <p className="text-lg font-semibold text-violet-400">{w.applied}</p>
                            <p className="text-[10px] text-white/30 uppercase">This week</p>
                        </div>
                        <div key={`interviews-${w.week}`} className="text-center">
                            <p className="text-lg font-semibold text-cyan-400">{w.interviews}</p>
                            <p className="text-[10px] text-white/30 uppercase">Interviews</p>
                        </div>
                        <div key={`offers-${w.week}`} className="text-center">
                            <p className="text-lg font-semibold text-emerald-400">{w.offers}</p>
                            <p className="text-[10px] text-white/30 uppercase">Offers</p>
                        </div>
                    </>
                ))}
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    const {t} = useTranslation()
    const summaryQuery = useQuery({
        queryKey: ['analytics', 'summary'],
        queryFn: () => analyticsService.getSummary(),
    })
    const data: AnalyticsSummary | undefined = summaryQuery.data

    const maxFunnel = useMemo(() => {
        const f = data?.funnel ?? []
        return f.reduce((m, x) => Math.max(m, x.count), 1)
    }, [data])

    const getStatusLabel = (status: string): string => {
        return t(statusKeyMap[status] || `applications.${status.toLowerCase()}`)
    }

    if (summaryQuery.isLoading) return <LoadingState message={t('analytics.overview')}/>
    if (summaryQuery.error)
        return (
            <ErrorState
                title={t('analytics.title')}
                message={summaryQuery.error instanceof Error ? summaryQuery.error.message : t('messages.errorMessage')}
            />
        )
    if (!data) return null

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">
                        {t('analytics.title')}
                    </h1>
                    <p className="text-sm text-white/40 mt-1">
                        {t('analytics.overview')}
                    </p>
                </div>

                {/* Time range selector (visual only) */}
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/60 transition-colors">
                        7d
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] text-white border border-white/[0.08]">
                        30d
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/60 transition-colors">
                        90d
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard
                    label={t('analytics.responseRate')}
                    value={pct(data.responseRate)}
                    icon={MessageCircle}
                    color="violet"
                    trend={{value: 12, positive: true}}
                    delay={0}
                />
                <KPICard
                    label={t('analytics.interviewRate')}
                    value={pct(data.interviewRate)}
                    icon={Target}
                    color="blue"
                    trend={{value: 8, positive: true}}
                    delay={50}
                />
                <KPICard
                    label={t('analytics.offerRate')}
                    value={pct(data.offerRate)}
                    icon={BarChart3}
                    color="emerald"
                    trend={{value: 3, positive: false}}
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Application Funnel - Large */}
                <div className="lg:col-span-7">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-violet-400"/>
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
                  {t('analytics.totalApplications', {count: data.totalApplications})}
                </span>
                            </div>
                        </div>

                        {/* Funnel Bars */}
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

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Weekly Activity */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-cyan-400"/>
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

                        <WeeklyActivityChart data={data.weeklyActivity}/>
                    </div>

                    {/* Skill Gaps */}
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-amber-400"/>
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
                {data.topSkillGaps.length} skills
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
        </div>
    )
}
