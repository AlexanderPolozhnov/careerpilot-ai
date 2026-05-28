import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function PrivacyPolicyPage() {
    const { t } = useTranslation();
    const email = 'polozhnov.alex@gmail.com';
    const url = 'careerpilot-ai.ru';
    const scope = 'calendar.events';
    const policy = 'Google API Services User Data Policy';
    const settings = 'Settings → Integrations';

    return (
        <div className="min-h-dvh bg-[#08080a] text-[#e8eaed]">
            {/* Header */}
            <header className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(8,8,10,0.8)] backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto max-w-3xl px-5 md:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-shadow">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold text-[#e8eaed] tracking-tight" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                            CareerPilot AI
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <Link to="/" className="text-sm text-[#6b7590] hover:text-[#e8eaed] transition-colors">
                            {t('privacyPolicy.backToHome')}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-5 md:px-8 py-16">
                <h1 className="text-3xl font-bold text-[#e8eaed] mb-2" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    {t('privacyPolicy.title')}
                </h1>
                <p className="text-sm text-[#6b7590] mb-12">{t('privacyPolicy.lastUpdated')}</p>

                <div className="space-y-10 text-[#a0a8bc] leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.introduction.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.introduction.content', { url })}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.informationWeCollect.title')}</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            <li><span className="text-[#e8eaed] font-medium">{t('privacyPolicy.sections.informationWeCollect.items.account')}</span></li>
                            <li><span className="text-[#e8eaed] font-medium">{t('privacyPolicy.sections.informationWeCollect.items.jobSearch')}</span></li>
                            <li><span className="text-[#e8eaed] font-medium">{t('privacyPolicy.sections.informationWeCollect.items.oauth')}</span></li>
                            <li><span className="text-[#e8eaed] font-medium">{t('privacyPolicy.sections.informationWeCollect.items.googleCalendar', { scope })}</span></li>
                            <li><span className="text-[#e8eaed] font-medium">{t('privacyPolicy.sections.informationWeCollect.items.usage')}</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.howWeUseInformation.title')}</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            {t('privacyPolicy.sections.howWeUseInformation.items', { returnObjects: true }).map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <p className="mt-3">{t('privacyPolicy.sections.howWeUseInformation.note', { not: <span className="text-[#e8eaed] font-medium">not</span> })}</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.googleApiServices.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.googleApiServices.content', { policy })}
                        </p>
                        <p className="mt-3">
                            {t('privacyPolicy.sections.googleApiServices.specific')}
                        </p>
                        <p className="mt-3">
                            {t('privacyPolicy.sections.googleApiServices.disconnect', { settings })}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.dataStorageAndSecurity.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.dataStorageAndSecurity.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.dataRetention.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.dataRetention.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.yourRights.title')}</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            {t('privacyPolicy.sections.yourRights.items', { returnObjects: true }).map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.changesToPolicy.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.changesToPolicy.content')}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">{t('privacyPolicy.sections.contact.title')}</h2>
                        <p>
                            {t('privacyPolicy.sections.contact.content', { email })}
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[rgba(255,255,255,0.06)] mt-16">
                <div className="mx-auto max-w-3xl px-5 md:px-8 py-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    <span className="text-sm text-[#6b7590]">© {new Date().getFullYear()} CareerPilot AI</span>
                    <div className="flex items-center gap-6 text-sm text-[#6b7590]">
                        <Link to="/privacy" className="hover:text-[#e8eaed] transition-colors">{t('landing.privacyPolicy')}</Link>
                        <Link to="/terms" className="hover:text-[#e8eaed] transition-colors">{t('landing.termsOfService')}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
