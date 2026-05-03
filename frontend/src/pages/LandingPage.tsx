import {Link} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {LanguageSwitcher} from '@/components/LanguageSwitcher'

export default function LandingPage() {
    const {t} = useTranslation()

    return (
        <div className="min-h-dvh bg-bg text-ink">
            <header className="border-b border-border bg-surface-1/70 backdrop-blur">
                <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/35 to-accent-2/20 border border-border flex items-center justify-center">
                            <span className="text-sm font-semibold text-ink">CP</span>
                        </div>
                        <div className="text-sm font-semibold text-ink">CareerPilot AI</div>
                    </div>
                    <nav className="flex items-center gap-2">
                        <LanguageSwitcher/>
                        <Link to="/auth/login" className="btn-secondary text-sm">
                            {t('landing.login')}
                        </Link>
                        <Link
                            to="/auth/register"
                            className="inline-flex items-center justify-center rounded-xl bg-accent/16 border border-accent/20 px-3 py-2 text-sm font-semibold text-ink hover:bg-accent/20 transition-colors"
                        >
                            {t('landing.createAccount')}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 md:px-8 py-14 md:py-20">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                    <div>
                        <div
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1 text-xs text-ink-muted">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent"/>
                            {t('landing.badge')}
                        </div>
                        <h1 className="mt-5 text-4xl md:text-5xl font-semibold tracking-tight">
                            {t('landing.heading')}
                        </h1>
                        <p className="mt-4 text-base text-ink-muted leading-relaxed max-w-xl">
                            {t('landing.description')}
                        </p>
                        <div className="mt-7 flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/auth/register"
                                className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dim transition-colors"
                            >
                                {t('landing.startFree')}
                            </Link>
                            <Link to="/app/dashboard" className="btn-secondary text-sm px-4 py-2.5">
                                {t('landing.openDashboard')}
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            <div className="card p-4">
                                <div className="text-xs text-ink-dim">{t('landing.feature1')}</div>
                                <div className="text-sm text-ink mt-1">{t('landing.feature1Desc')}</div>
                            </div>
                            <div className="card p-4">
                                <div className="text-xs text-ink-dim">{t('landing.feature2')}</div>
                                <div className="text-sm text-ink mt-1">{t('landing.feature2Desc')}</div>
                            </div>
                            <div className="card p-4">
                                <div className="text-xs text-ink-dim">{t('landing.feature3')}</div>
                                <div className="text-sm text-ink mt-1">{t('landing.feature3Desc')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div
                            className="absolute -inset-6 bg-gradient-to-br from-accent/18 via-transparent to-accent-2/14 blur-2xl"/>
                        <div className="relative card p-5 md:p-6">
                            <div className="text-xs text-ink-dim">{t('landing.previewLabel')}</div>
                            <div
                                className="mt-2 text-sm font-semibold text-ink">{t('landing.dashboardPreviewTitle')}</div>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="card p-4 bg-surface-1/40">
                                    <div className="text-xs text-ink-dim">{t('dashboard.activeApplications')}</div>
                                    <div className="text-2xl font-semibold text-ink mt-1">8</div>
                                </div>
                                <div className="card p-4 bg-surface-1/40">
                                    <div className="text-xs text-ink-dim">{t('dashboard.interviewsScheduled')}</div>
                                    <div className="text-2xl font-semibold text-ink mt-1">2</div>
                                </div>
                                <div className="card p-4 bg-surface-1/40 md:col-span-2">
                                    <div className="text-xs text-ink-dim">{t('landing.latestAiInsight')}</div>
                                    <div className="mt-2 text-sm text-ink-muted leading-relaxed">
                                        {t('landing.latestAiInsightDescription')}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs text-ink-dim">{t('landing.mockMode')}</span>
                                <span className="pill">{t('landing.freeTrial')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-border">
                <div
                    className="mx-auto max-w-6xl px-5 md:px-8 py-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="text-xs text-ink-dim">© {new Date().getFullYear()} CareerPilot AI</div>
                    <div className="text-xs text-ink-dim">{t('landing.footerDetails')}</div>
                </div>
            </footer>
        </div>
    )
}
