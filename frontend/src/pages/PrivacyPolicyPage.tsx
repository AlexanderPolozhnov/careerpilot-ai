import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyPage() {
    const { t } = useTranslation();
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
                    <Link to="/" className="text-sm text-[#6b7590] hover:text-[#e8eaed] transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-5 md:px-8 py-16">
                <h1 className="text-3xl font-bold text-[#e8eaed] mb-2" style={{ fontFamily: 'Onest, system-ui, sans-serif' }}>
                    Privacy Policy
                </h1>
                <p className="text-sm text-[#6b7590] mb-12">Last updated: May 28, 2025</p>

                <div className="space-y-10 text-[#a0a8bc] leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">1. Introduction</h2>
                        <p>
                            CareerPilot AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
                            explains how we collect, use, and safeguard your personal information when you use our job search
                            management platform at <span className="text-violet-400">careerpilot-ai.ru</span>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">2. Information We Collect</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            <li><span className="text-[#e8eaed] font-medium">Account information:</span> email address, name, and password (stored as a secure hash).</li>
                            <li><span className="text-[#e8eaed] font-medium">Job search data:</span> vacancies, applications, interviews, companies, and tasks you create within the app.</li>
                            <li><span className="text-[#e8eaed] font-medium">OAuth credentials:</span> when you sign in via Google or GitHub, we receive your public profile and email only.</li>
                            <li><span className="text-[#e8eaed] font-medium">Google Calendar tokens:</span> if you connect Google Calendar, we store a refresh token to create interview events on your behalf. We only use the <code className="bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded text-sm">calendar.events</code> scope.</li>
                            <li><span className="text-[#e8eaed] font-medium">Usage data:</span> technical logs such as timestamps and error reports, used solely for debugging.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">3. How We Use Your Information</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>To provide and operate the CareerPilot AI service.</li>
                            <li>To create Google Calendar events for your scheduled interviews (only when you explicitly connect your calendar).</li>
                            <li>To send transactional emails (e.g., password reset, email verification).</li>
                            <li>To improve the application based on aggregated, anonymised usage patterns.</li>
                        </ul>
                        <p className="mt-3">We do <span className="text-[#e8eaed] font-medium">not</span> sell, rent, or share your personal data with third parties for marketing purposes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">4. Google API Services</h2>
                        <p>
                            CareerPilot AI's use of information received from Google APIs adheres to the{' '}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors">
                                Google API Services User Data Policy
                            </a>
                            , including the Limited Use requirements.
                        </p>
                        <p className="mt-3">
                            Specifically, the Google Calendar refresh token stored for your account is used exclusively to create,
                            update, or delete calendar events related to your interviews within CareerPilot AI. This data is not
                            transferred to any third party or used for any other purpose.
                        </p>
                        <p className="mt-3">
                            You can disconnect Google Calendar at any time from <span className="text-[#e8eaed]">Settings → Integrations</span>, which
                            immediately deletes your stored token.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">5. Data Storage and Security</h2>
                        <p>
                            Your data is stored in a PostgreSQL database hosted on Google Cloud (Europe region). Sensitive values
                            such as API keys and OAuth tokens are encrypted at rest using AES encryption. We apply industry-standard
                            security practices including HTTPS-only transport and JWT-based authentication.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">6. Data Retention</h2>
                        <p>
                            We retain your data for as long as your account is active. You may request deletion of your account
                            and all associated data at any time by contacting us at the email below. Upon deletion, all personal
                            data is permanently removed within 30 days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">7. Your Rights</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Access or export your personal data.</li>
                            <li>Correct inaccurate information.</li>
                            <li>Request deletion of your account and data.</li>
                            <li>Revoke Google Calendar access at any time via the app or your Google Account settings.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">8. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by
                            updating the date at the top of this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">9. Contact</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at:{' '}
                            <a href="mailto:polozhnov.alex@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors">
                                polozhnov.alex@gmail.com
                            </a>
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
