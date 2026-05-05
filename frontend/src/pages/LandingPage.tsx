import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Custom hook for scroll-triggered animations
function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export default function LandingPage() {
  const { t } = useTranslation();

  const featureCards = ['vacancies', 'kanban', 'ai', 'analytics'];
  const howItWorksSteps = ['1', '2', '3'];

  // Scroll animation refs for each section
  const featuresSection = useScrollAnimation();
  const howItWorksSection = useScrollAnimation();
  const ctaSection = useScrollAnimation();
  const footerSection = useScrollAnimation(0.3);

  return (
    <div className="min-h-dvh bg-[#08080a] text-[#e8eaed] overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,8,10,0.8)] backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span
              className="text-[15px] font-semibold text-[#e8eaed] tracking-tight"
              style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
            >
              CareerPilot
            </span>
          </Link>
          <nav className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <Link 
              to="/auth/login" 
              className="px-4 py-2 text-[13px] font-medium text-[#8b8fa3] hover:text-[#e8eaed] transition-colors"
            >
              {t('landing.login')}
            </Link>
            <Link 
              to="/auth/register" 
              className="px-4 py-2.5 text-[13px] font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35"
            >
              {t('landing.hero.cta_primary')}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[100vh] flex items-center justify-center pt-16 pb-20 px-5 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            {/* Large gradient orb */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-500/15 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '80px 80px'
              }}
            />
            
            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#08080a_70%)]" />
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center pt-12">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(139,92,246,0.1)] border border-violet-500/25 rounded-full ds-anim-rise"
              style={{ animationDelay: '0ms' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span className="text-[13px] font-medium text-violet-300">{t('landing.badge')}</span>
            </div>

            {/* Headline */}
            <h1
              className="mt-8 text-5xl md:text-7xl lg:text-[80px] font-semibold tracking-[-0.03em] leading-[1.05] ds-anim-rise"
              style={{ fontFamily: 'Onest, system-ui, sans-serif', animationDelay: '80ms' }}
            >
              <span className="text-[#e8eaed]">{t('landing.hero.title')}</span>{' '}
              <span className="bg-gradient-to-r from-violet-400 via-violet-500 to-purple-500 bg-clip-text text-transparent">{t('landing.hero.titleAccent')}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="mt-6 text-lg md:text-xl text-[#8b8fa3] leading-relaxed max-w-2xl mx-auto ds-anim-rise"
              style={{ animationDelay: '160ms' }}
            >
              {t('landing.hero.subtitle')}
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 ds-anim-rise"
              style={{ animationDelay: '240ms' }}
            >
              <Link 
                to="/auth/register" 
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl hover:from-violet-500 hover:to-violet-400 transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                {t('landing.hero.cta_primary')}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link 
                to="/auth/login" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-medium text-[#e8eaed] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all w-full sm:w-auto"
              >
                {t('landing.hero.cta_secondary')}
              </Link>
            </div>

            {/* Stats/Facts */}
            <div
              className="mt-16 flex flex-wrap justify-center gap-3 ds-anim-rise"
              style={{ animationDelay: '320ms' }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[13px] text-[#8b8fa3]">{t('landing.hero.fact1')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[13px] text-[#8b8fa3]">{t('landing.hero.fact2')}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[13px] text-[#8b8fa3]">{t('landing.hero.fact3')}</span>
              </div>
            </div>
            
            {/* Abstract UI Preview */}
            <div 
              className="mt-20 relative ds-anim-rise"
              style={{ animationDelay: '400ms' }}
            >
              <div className="relative mx-auto max-w-3xl">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-50" />
                
                {/* Mock UI Card */}
                <div className="relative bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-1 backdrop-blur-sm">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28ca42]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="px-4 py-1 bg-[rgba(255,255,255,0.05)] rounded-md text-xs text-[#6b7590]">app.careerpilot.ai</div>
                    </div>
                    <div className="w-12" />
                  </div>
                  
                  {/* Mock dashboard content */}
                  <div className="p-6 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Applications', value: '24', color: 'violet' },
                        { label: 'Interviews', value: '8', color: 'blue' },
                        { label: 'Offers', value: '3', color: 'emerald' },
                        { label: 'AI Assists', value: '47', color: 'purple' },
                      ].map((stat, i) => (
                        <div key={i} className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl">
                          <div className={`text-2xl font-bold text-${stat.color}-400`} style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>{stat.value}</div>
                          <div className="text-xs text-[#6b7590] mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Kanban preview */}
                    <div className="grid grid-cols-3 gap-3">
                      {['Applied', 'Interview', 'Offer'].map((col, i) => (
                        <div key={i} className="space-y-2">
                          <div className="text-xs font-medium text-[#6b7590] px-1">{col}</div>
                          {[1, 2].map((card) => (
                            <div key={card} className="p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-lg">
                              <div className="h-2 w-3/4 bg-[rgba(255,255,255,0.1)] rounded" />
                              <div className="h-2 w-1/2 bg-[rgba(255,255,255,0.05)] rounded mt-2" />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresSection.ref as React.RefObject<HTMLElement>}
          className="relative py-28 md:py-36 px-5"
        >
          {/* Background accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px]" />
          
          <div className="relative mx-auto max-w-6xl">
            <div className={`text-center max-w-2xl mx-auto transition-all duration-700 ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(139,92,246,0.1)] border border-violet-500/20 rounded-full text-violet-400 uppercase tracking-[0.12em] text-[11px] font-semibold">
                {t('features.label')}
              </span>
              <h2
                className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#e8eaed] mt-6"
                style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
              >
                {t('features.title')}
              </h2>
            </div>
            
            {/* Feature cards - Bento Grid */}
            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureCards.map((feature, index) => (
                <div
                  key={feature}
                  className={`group relative flex flex-col p-6 min-h-[240px] bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.06)] rounded-2xl transition-all duration-500 hover:border-violet-500/40 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: featuresSection.isVisible ? `${200 + index * 100}ms` : '0ms' }}
                >
                  {/* Top accent line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon */}
                  <div className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/25 shadow-lg shadow-violet-500/10 group-hover:shadow-violet-500/25 transition-all duration-500 group-hover:scale-110">
                    {index === 0 && (
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    )}
                    {index === 1 && (
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    )}
                    {index === 2 && (
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                      </svg>
                    )}
                    {index === 3 && (
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Content */}
                  <h3 className="mt-5 text-[17px] font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    {t(`features.cards.${feature}.title`)}
                  </h3>
                  <p className="mt-2 text-[14px] text-[#6b7590] leading-relaxed flex-1">
                    {t(`features.cards.${feature}.description`)}
                  </p>
                  
                  {/* Bottom arrow indicator */}
                  <div className="mt-4 flex items-center gap-1.5 text-violet-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section 
          ref={howItWorksSection.ref as React.RefObject<HTMLElement>}
          className="relative py-28 md:py-36 px-5 overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(139,92,246,0.03)] to-transparent" />
          
          <div className="relative mx-auto max-w-6xl">
            <div className={`text-center max-w-2xl mx-auto transition-all duration-700 ${howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(139,92,246,0.1)] border border-violet-500/20 rounded-full text-violet-400 uppercase tracking-[0.12em] text-[11px] font-semibold">
                {t('howItWorks.label')}
              </span>
              <h2 
                className="text-4xl md:text-5xl font-semibold tracking-[-0.02em] text-[#e8eaed] mt-6"
                style={{ fontFamily: 'Onest, system-ui, sans-serif' }}
              >
                {t('howItWorks.title')}
              </h2>
            </div>
            
            {/* Steps */}
            <div className="mt-20 relative">
              {/* Connection line */}
              <div className={`hidden md:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent transition-all duration-1000 ${howItWorksSection.isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} style={{ transitionDelay: '300ms' }} />
              
              <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                {howItWorksSteps.map((step, index) => (
                  <div 
                    key={step} 
                    className={`relative text-center transition-all duration-700 ${howItWorksSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: howItWorksSection.isVisible ? `${200 + index * 150}ms` : '0ms' }}
                  >
                    {/* Step number */}
                    <div className="relative inline-flex">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center shadow-xl shadow-violet-500/10">
                        <span className="text-2xl font-bold text-violet-400" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                          0{step}
                        </span>
                      </div>
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-2xl border border-violet-500/20 animate-ping opacity-20" style={{ animationDuration: '2s' }} />
                    </div>
                    
                    <h3 className="mt-6 text-xl font-semibold text-[#e8eaed]" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                      {t(`howItWorks.steps.${step}.title`)}
                    </h3>
                    <p className="mt-3 text-[15px] text-[#6b7590] leading-relaxed max-w-xs mx-auto">
                      {t(`howItWorks.steps.${step}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={ctaSection.ref as React.RefObject<HTMLElement>}
          className="relative py-28 md:py-36 px-5"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 rounded-3xl blur-3xl transition-opacity duration-1000 ${ctaSection.isVisible ? 'opacity-100' : 'opacity-0'}`} />
            
            {/* CTA Card */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-transparent border border-[rgba(255,255,255,0.08)] p-12 md:p-16 transition-all duration-700 ${ctaSection.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.98]'}`}>
              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]" />
              
              <div className="relative text-center">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(139,92,246,0.1)] border border-violet-500/20 rounded-full text-violet-400 uppercase tracking-[0.12em] text-[11px] font-semibold transition-all duration-500 ${ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
                  {t('cta.label')}
                </span>
                
                <h2 
                  className={`mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-[#e8eaed] transition-all duration-700 ${ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                  style={{ fontFamily: 'Onest, system-ui, sans-serif', transitionDelay: '300ms' }}
                >
                  {t('cta.title')}
                </h2>
                
                <div className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ${ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '400ms' }}>
                  <Link
                    to="/auth/register"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl hover:from-violet-500 hover:to-violet-400 transition-all shadow-xl shadow-violet-500/30 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                  >
                    {t('cta.button')}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-10 flex items-center justify-center gap-6 text-sm text-[#6b7590]">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free forever
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    No credit card
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Setup in minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="relative border-t border-[rgba(255,255,255,0.06)]">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-[#6b7590]">© {new Date().getFullYear()} CareerPilot AI</span>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-[#6b7590]">
            <span>{t('landing.footerDetails')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
