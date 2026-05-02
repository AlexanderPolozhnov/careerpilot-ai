import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StatCard } from '@/components/StatCard'
import { BarChart3, Clock, MessageCircle, Target } from 'lucide-react'
import { LoadingState } from '@/components/LoadingState'
import { ErrorState } from '@/components/ErrorState'
import { analyticsService } from '@/services/analytics.service'
import type { AnalyticsSummary, ApplicationFunnel } from '@/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const summaryQuery = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsService.getSummary(),
  })
  const data: AnalyticsSummary | undefined = summaryQuery.data

  const maxFunnel = useMemo(() => {
    const f = data?.funnel ?? []
    return f.reduce((m, x) => Math.max(m, x.count), 1)
  }, [data])

  if (summaryQuery.isLoading) return <LoadingState message={t('analytics.overview')} />
  if (summaryQuery.error)
    return (
      <ErrorState
        title={t('analytics.title')}
        message={summaryQuery.error instanceof Error ? summaryQuery.error.message : t('messages.errorMessage')}
      />
    )
  if (!data) return null

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('analytics.responseRate')} value={pct(data.responseRate)} icon={MessageCircle} accent />
        <StatCard label={t('analytics.interviewRate')} value={pct(data.interviewRate)} icon={Target} />
        <StatCard label={t('analytics.offerRate')} value={pct(data.offerRate)} icon={BarChart3} />
        <StatCard label={t('analytics.avgDaysToInterview')} value={data.avgTimeToInterview} icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4 card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-ink">{t('analytics.funnelTitle')}</div>
              <p className="text-sm text-ink-muted mt-1">{t('analytics.funnelDescription')}</p>
            </div>
            <span className="pill">{t('analytics.totalApplications', { count: data.totalApplications })}</span>
          </div>

          <div className="mt-5 space-y-3">
            {data.funnel.map((f: ApplicationFunnel) => (
              <div key={f.status} className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-4 text-xs text-ink-dim uppercase tracking-wider">
                  {f.status.replace('_', ' ')}
                </div>
                <div className="col-span-6">
                  <div className="h-2 rounded-full bg-surface-3 overflow-hidden border border-border">
                    <div
                      className="h-full bg-accent/60"
                      style={{ width: `${Math.max(4, (f.count / maxFunnel) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-2 text-right text-xs text-ink-muted">
                  {f.count} · {Math.round(f.percentage)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-ink">Skill gaps</div>
                <p className="text-sm text-ink-muted mt-1">Most frequent missing requirements.</p>
              </div>
              <span className="pill">{data.topSkillGaps.length}</span>
            </div>
            <div className="mt-5 space-y-3">
              {data.topSkillGaps.map((g) => (
                <div key={g.skill} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-ink truncate">{g.skill}</div>
                    <div className="text-xs text-ink-dim mt-1">{g.frequency} {t('analytics.mentions')}</div>
                  </div>
                  <span
                    className={cn(
                      'pill',
                      g.hasSkill ? 'border-success/30 bg-success/10 text-ink' : 'border-warning/30 bg-warning/10 text-ink',
                    )}
                  >
                    {g.hasSkill ? t('analytics.youHaveIt') : t('analytics.gap')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="text-sm font-semibold text-ink">{t('analytics.weeklyActivityTitle')}</div>
            <p className="text-sm text-ink-muted mt-1">{t('analytics.weeklyActivityDescription')}</p>
            <div className="mt-5 space-y-3">
              {data.weeklyActivity.map((w) => (
                <div key={w.week} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-ink">{w.week}</div>
                  <div className="flex items-center gap-2">
                    <span className="pill">{t('analytics.appliedCount', { count: w.applied })}</span>
                    <span className="pill">{t('analytics.interviewsCount', { count: w.interviews })}</span>
                    <span className="pill">{t('analytics.offersCount', { count: w.offers })}</span>
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
