import {Briefcase, CalendarDays, FileText, Sparkles} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {StatCard} from '@/components/StatCard'
import {AiInsightCard, AiInsightCardSkeleton} from '@/components/AiInsightCard'
import {StatusBadge} from '@/components/StatusBadge'
import type {DashboardAiInsight} from '@/services/dashboard.service'
import {getDashboardSummary} from '@/services/dashboard.service'
import {formatDateTime, formatRelative} from '@/lib/utils'
import {useTranslation} from 'react-i18next'
import type {AiResult} from '@/types'

function toAiResult(insight: DashboardAiInsight): AiResult {
    return {
        id: insight.id,
        userId: '',
        type: insight.type as AiResult['type'],
        prompt: insight.prompt ?? '',
        result: insight.result ?? '',
        createdAt: insight.createdAt,
        tokensUsed: undefined,
        vacancyId: undefined,
    }
}

export default function DashboardPage() {
    const {t} = useTranslation()
    const navigate = useNavigate()

    const {data, isLoading} = useQuery({
        queryKey: ['dashboard', 'summary'],
        queryFn: getDashboardSummary,
    })

    const kpis = data?.kpis
    const upcomingInterviews = data?.upcomingInterviews ?? []
    const tasks = data?.tasks ?? []
    const aiInsights = data?.aiInsights ?? []
    const notifications = data?.notifications ?? []

    return (
        <section className="space-y-6 w-full min-w-0">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 ds-stagger">
                <div className="ds-anim-rise">
                    <StatCard
                        label={t('dashboard.activeVacancies')}
                        value={kpis?.activeVacancies ?? '—'}
                        icon={Briefcase}
                        accent
                    />
                </div>
                <div className="ds-anim-rise">
                    <StatCard
                        label={t('dashboard.activeApplications')}
                        value={kpis?.activeApplications ?? '—'}
                        icon={FileText}
                    />
                </div>
                <div className="ds-anim-rise">
                    <StatCard
                        label={t('dashboard.interviewsScheduled')}
                        value={kpis?.interviewsScheduled ?? '—'}
                        icon={CalendarDays}
                    />
                </div>
                <div className="ds-anim-rise">
                    <StatCard
                        label={t('dashboard.aiInsights')}
                        value={kpis?.aiInsightsThisWeek ?? '—'}
                        icon={Sparkles}
                    />
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-ink">{t('dashboard.latestInsights')}</h2>
                    <button
                        type="button"
                        className="ds-btn ds-btn-ghost text-sm"
                        onClick={() => navigate('/ai-assistant')}
                    >
                        {t('dashboard.viewAll')}
                    </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 ds-stagger">
                    {isLoading
                        ? Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="ds-anim-rise">
                                <AiInsightCardSkeleton />
                            </div>
                        ))
                        : aiInsights.slice(0, 3).map((r) => (
                            <div key={r.id} className="ds-anim-rise">
                                <AiInsightCard result={toAiResult(r)}/>
                            </div>
                        ))}
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-ink">{t('dashboard.today')}</h2>
                    {/* TODO: quickAdd requires a dedicated endpoint — not yet implemented */}
                    <button type="button" className="ds-btn ds-btn-ghost text-sm">
                        {t('dashboard.quickAdd')}
                    </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 ds-stagger">
                    <div className="ds-card p-4 ds-anim-rise">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-ink">{t('dashboard.upcomingInterviews')}</div>
                            <span className="pill">{upcomingInterviews.length}</span>
                        </div>
                        <div className="mt-3 grid gap-2">
                            {upcomingInterviews.slice(0, 3).map((i) => (
                                <div
                                    key={i.id}
                                    className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-surface-3/50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm text-ink truncate">
                                            {i.companyName ?? 'Company'} · {i.type}
                                        </div>
                                        <div className="text-xs text-ink-dim mt-1">
                                            {formatDateTime(i.scheduledAt)} · {i.meetingLink ?? '—'}
                                        </div>
                                    </div>
                                    <div className="text-xs text-ink-dim shrink-0">{formatRelative(i.scheduledAt)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="ds-card p-4 ds-anim-rise">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-ink">{t('dashboard.tasks')}</div>
                            <span className="pill">{tasks.length}</span>
                        </div>
                        <div className="mt-3 grid gap-2">
                            {tasks.slice(0, 4).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-surface-3/50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm text-ink break-words">{task.title}</div>
                                        <div className="text-xs text-ink-dim mt-1">
                                            {t('dashboard.priority')}: <span
                                            className="text-ink-muted">{task.priority}</span> ·{' '}
                                            {t('dashboard.status')}:{' '}
                                            <span className="text-ink-muted">{task.done ? 'DONE' : 'PENDING'}</span>
                                        </div>
                                    </div>
                                    {/* TODO: open task detail requires a dedicated tasks page — not yet implemented */}
                                    <button type="button" className="ds-btn ds-btn-ghost text-xs px-2.5 py-1.5">
                                        {t('dashboard.open')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="ds-card p-4 ds-anim-rise">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-ink">{t('dashboard.notifications')}</div>
                            <span className="pill">
                                {notifications.filter((n) => n.status !== 'READ').length} {t('common.new')}
                            </span>
                        </div>
                        <div className="mt-3 grid gap-2">
                            {notifications.slice(0, 3).map((n) => (
                                <div
                                    key={n.id}
                                    className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-surface-3/50 transition-colors"
                                >
                                    <div className="flex flex-col gap-1 min-w-0 w-full">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm text-ink break-words">{n.title}</span>
                                            <span
                                                className="text-xs text-ink-dim shrink-0">{formatRelative(n.createdAt)}</span>
                                        </div>
                                        {n.status !== 'READ' && (
                                            <StatusBadge status={'NEW'} kind="application" size="sm"
                                                         className="opacity-80 self-start"/>
                                        )}
                                        <div className="text-xs text-ink-dim break-words">{n.message}</div>
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
