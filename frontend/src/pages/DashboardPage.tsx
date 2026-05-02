import { Briefcase, FileText, CalendarDays, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { AiInsightCard } from '@/components/AiInsightCard'
import { mockAiResults, mockDashboard, mockInterviews, mockNotifications, mockTasks } from '@/mock/data'
import { formatDateTime, formatRelative } from '@/lib/utils'
import { StatusBadge } from '@/components/StatusBadge'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard.activeVacancies')}
          value={mockDashboard.kpis.activeVacancies}
          icon={Briefcase}
          accent
        />
        <StatCard
          label={t('dashboard.activeApplications')}
          value={mockDashboard.kpis.activeApplications}
          icon={FileText}
        />
        <StatCard
          label={t('dashboard.interviewsScheduled')}
          value={mockDashboard.kpis.interviewsScheduled}
          icon={CalendarDays}
        />
        <StatCard
          label={t('dashboard.aiInsights')}
          value={mockDashboard.kpis.aiInsightsThisWeek}
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">{t('dashboard.latestInsights')}</h2>
            <button type="button" className="btn-secondary text-sm">
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="grid gap-3">
            {mockAiResults.slice(0, 3).map((r) => (
              <AiInsightCard key={r.id} result={r} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">{t('dashboard.today')}</h2>
            <button type="button" className="btn-secondary text-sm">
              {t('dashboard.quickAdd')}
            </button>
          </div>

          <div className="grid gap-3">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">{t('dashboard.upcomingInterviews')}</div>
                <span className="pill">{mockInterviews.length}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {mockInterviews.slice(0, 3).map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-surface-3/50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm text-ink truncate">
                        {i.application?.vacancy?.company?.name ?? 'Company'} · {i.type}
                      </div>
                      <div className="text-xs text-ink-dim mt-1">
                        {formatDateTime(i.scheduledAt)} · {i.location ?? '—'}
                      </div>
                    </div>
                    <div className="text-xs text-ink-dim shrink-0">{formatRelative(i.scheduledAt)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">{t('dashboard.tasks')}</div>
                <span className="pill">{mockTasks.length}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {mockTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-surface-3/50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm text-ink truncate">{task.title}</div>
                      <div className="text-xs text-ink-dim mt-1">
                        {t('dashboard.priority')}: <span className="text-ink-muted">{task.priority}</span> · {t('dashboard.status')}:{' '}
                        <span className="text-ink-muted">{task.status}</span>
                      </div>
                    </div>
                    <button type="button" className="btn-secondary text-xs px-2.5 py-1.5">
                      {t('dashboard.open')}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">{t('dashboard.notifications')}</div>
                <span className="pill">{mockNotifications.filter((n) => !n.read).length} {t('common.new')}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {mockNotifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 hover:bg-surface-3/50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-sm text-ink truncate">{n.title}</div>
                      <div className="text-xs text-ink-dim mt-1 truncate">{n.body}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.read && <StatusBadge status={'NEW'} kind="application" size="sm" className="opacity-80" />}
                      <span className="text-xs text-ink-dim">{formatRelative(n.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
