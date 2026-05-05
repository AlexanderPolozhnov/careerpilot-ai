import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function LandingPage() {
  const { t } = useTranslation();

  const featureCards = ['vacancies', 'kanban', 'ai', 'analytics'];
  const howItWorksSteps = ['1', '2', '3'];

  return (
    <div className="min-h-dvh bg-bg text-ink overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-surface-1/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/35 to-accent-2/20 border border-border flex items-center justify-center">
              <span className="text-sm font-semibold text-ink">CP</span>
            </div>
            <div
              className="text-sm font-semibold text-ink"
              style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
            >
              CareerPilot AI
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link to="/auth/login" className="ds-btn ds-btn-ghost text-sm px-4 py-2">
              {t('landing.login')}
            </Link>
            <Link to="/auth/register" className="ds-btn ds-btn-primary text-sm">
              {t('landing.hero.cta_primary')}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative text-center pt-20 pb-24 md:pt-28 md:pb-32 px-5 overflow-hidden">
          <div className="absolute -inset-20 bg-gradient-to-br from-accent/10 via-transparent to-accent-2/5 blur-3xl opacity-60"></div>
          <div className="relative max-w-3xl mx-auto">
            <div
              className="ds-badge ds-badge-neutral ds-anim-rise"
              style={{ animationDelay: '0ms' }}
            >
              <div className="ds-badge-dot bg-accent"></div>
              {t('landing.badge')}
            </div>

            <h1
              className="mt-6 text-4xl md:text-6xl font-semibold tracking-tighter ds-anim-rise"
              style={{ fontFamily: 'Onest, system-ui, sans-serif', animationDelay: '80ms' }}
            >
              {t('landing.hero.title')}{' '}
              <span className="text-accent">{t('landing.hero.titleAccent')}</span>
            </h1>

            <p
              className="mt-5 text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto ds-anim-rise"
              style={{ animationDelay: '160ms' }}
            >
              {t('landing.hero.subtitle')}
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 ds-anim-rise"
              style={{ animationDelay: '240ms' }}
            >
              <Link to="/auth/register" className="ds-btn ds-btn-primary w-full sm:w-auto">
                {t('landing.hero.cta_primary')}
              </Link>
              <Link to="/auth/login" className="ds-btn ds-btn-outline w-full sm:w-auto">
                {t('landing.hero.cta_secondary')}
              </Link>
            </div>

            <div
              className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 ds-anim-rise"
              style={{ animationDelay: '320ms' }}
            >
              <div className="ds-badge ds-badge-neutral">{t('landing.hero.fact1')}</div>
              <div className="ds-badge ds-badge-neutral">{t('landing.hero.fact2')}</div>
              <div className="ds-badge ds-badge-neutral">{t('landing.hero.fact3')}</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 px-5">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-violet-500 uppercase tracking-[0.12em] text-[11px] font-medium">
                {t('features.label')}
              </span>
              <h2
                className="text-3xl md:text-4xl font-semibold tracking-tight text-[#e7eaf1] mt-3"
                style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
              >
                {t('features.title')}
              </h2>
            </div>
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 ds-stagger">
              {featureCards.map((feature, index) => (
                <div
                  key={feature}
                  className="group relative flex flex-col p-5 pt-6 pb-7 min-h-[200px] ds-anim-rise bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] backdrop-blur-sm border border-[rgba(255,255,255,0.06)] rounded-2xl transition-all duration-300 hover:border-[rgba(139,92,246,0.5)] hover:shadow-[0_0_32px_-8px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(139,92,246,0.1)]"
                  style={{ animationDelay: `${index * 80}ms`}}
                >
                  {/* Top accent border - thicker and more visible */}
                  <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-violet-600/0 via-violet-500 to-violet-600/0 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon with gradient background */}
                  <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 via-violet-500/15 to-purple-600/25 border border-violet-500/30 shadow-[0_0_12px_-2px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_16px_-2px_rgba(139,92,246,0.5)] transition-shadow duration-300">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400/10 to-transparent" />
                    {index === 0 && (
                      <svg className="relative w-[18px] h-[18px] text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="relative w-[18px] h-[18px] text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="relative w-[18px] h-[18px] text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="relative w-[18px] h-[18px] text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Left-aligned text content */}
                  <h3 className="mt-4 font-semibold text-[15px] text-[#e8eaed] text-left tracking-[-0.01em]" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    {t(`features.cards.${feature}.title`)}
                  </h3>
                  <p className="mt-2 text-[13px] text-[#8b8fa3] text-left leading-[1.6]">
                    {t(`features.cards.${feature}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 md:py-28 px-5">
            <div className="mx-auto max-w-6xl">
                <div className="text-center max-w-2xl mx-auto">
                    <span className="text-violet-500 uppercase tracking-[0.12em] text-[11px] font-medium">
                      {t('howItWorks.label')}
                    </span>
                    <h2 
                        className="text-3xl md:text-4xl font-semibold tracking-tight text-[#e7eaf1] mt-3"
                        style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
                    >
                        {t('howItWorks.title')}
                    </h2>
                </div>
                <div className="mt-16 grid md:grid-cols-3 gap-8 md:gap-12">
                    {howItWorksSteps.map((step, index) => (
                        <div 
                            key={step} 
                            className="text-center md:text-left ds-anim-fade"
                            style={{ animationDelay: `${index * 150}ms`}}
                        >
                            <div className="flex justify-center md:justify-start items-baseline gap-3">
                                <span className="text-5xl font-bold text-violet-500/60" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                                    0{step}
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-[#e7eaf1]" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                                {t(`howItWorks.steps.${step}.title`)}
                            </h3>
                            <p className="mt-2 text-sm text-[#6b7590]">
                                {t(`howItWorks.steps.${step}.description`)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 px-5">
            <div className="relative rounded-[24px] bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.2)] p-10 md:p-16 max-w-4xl mx-auto text-center overflow-hidden">
                <div className="relative">
                    <span className="text-violet-500 uppercase tracking-[0.12em] text-[11px] font-medium">
                      {t('cta.label')}
                    </span>
                    <h2 
                        className="text-3xl md:text-4xl font-semibold tracking-tight ds-anim-rise text-[#e7eaf1] mt-3"
                        style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
                    >
                        {t('cta.title')}
                    </h2>
                    <div className="mt-8 ds-anim-rise" style={{ animationDelay: '100ms' }}>
                        <Link
                            to="/auth/register"
                            className="inline-block bg-violet-500 text-white font-medium px-8 py-3 rounded-[10px] hover:bg-violet-600 transition-colors"
                        >
                            {t('cta.button')}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border">
          <div
              className="mx-auto max-w-6xl px-5 md:px-8 py-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="text-xs text-ink-dim">© {new Date().getFullYear()} CareerPilot AI</div>
              <div className="text-xs text-ink-dim">{t('landing.footerDetails')}</div>
          </div>
      </footer>
    </div>
  );
}
