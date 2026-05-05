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
            <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 ds-stagger">
              {featureCards.map((feature, index) => (
                <div
                  key={feature}
                  className="p-6 text-center ds-anim-rise bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl hover:border-[rgba(139,92,246,0.35)] transition-colors duration-200"
                  style={{ animationDelay: `${index * 80}ms`}}
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 flex items-center justify-center bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)] rounded-xl text-2xl">
                        {index === 0 && '📋'}
                        {index === 1 && '🎯'}
                        {index === 2 && '🤖'}
                        {index === 3 && '📊'}
                    </div>
                  </div>
                  <h3 className="mt-5 font-semibold text-base text-[#e7eaf1]" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    {t(`features.cards.${feature}.title`)}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b7590]">
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
