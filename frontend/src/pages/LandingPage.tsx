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
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 ds-stagger">
              {featureCards.map((feature, index) => (
                <div
                  key={feature}
                  className="group relative flex flex-col p-6 pb-8 ds-anim-rise bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl transition-all duration-300 hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.25)]"
                  style={{ animationDelay: `${index * 80}ms`}}
                >
                  {/* Top accent border */}
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                  
                  {/* Icon with gradient background */}
                  <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/30 border border-violet-500/20 text-violet-400">
                    {index === 0 && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Left-aligned text content */}
                  <h3 className="mt-5 font-semibold text-[15px] text-[#e7eaf1] text-left" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    {t(`features.cards.${feature}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b7590] text-left leading-relaxed">
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
