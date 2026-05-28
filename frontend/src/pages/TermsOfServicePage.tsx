import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
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
                    Terms of Service
                </h1>
                <p className="text-sm text-[#6b7590] mb-12">Last updated: May 28, 2025</p>

                <div className="space-y-10 text-[#a0a8bc] leading-relaxed">

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using CareerPilot AI ("the Service") at{' '}
                            <span className="text-violet-400">careerpilot-ai.ru</span>, you agree to be bound by these Terms of
                            Service. If you do not agree, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">2. Description of Service</h2>
                        <p>
                            CareerPilot AI is a personal job search management tool that helps you track vacancies, applications,
                            interviews, and tasks. It may integrate with third-party services such as Google Calendar to enhance
                            your workflow.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">3. User Accounts</h2>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>You must provide accurate and complete information when registering.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You are responsible for all activity that occurs under your account.</li>
                            <li>You must be at least 16 years old to use the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">4. Acceptable Use</h2>
                        <p>You agree not to:</p>
                        <ul className="space-y-2 list-disc list-inside mt-3">
                            <li>Use the Service for any unlawful purpose.</li>
                            <li>Attempt to gain unauthorised access to the Service or other users' accounts.</li>
                            <li>Transmit harmful, offensive, or malicious content.</li>
                            <li>Reverse engineer, copy, or redistribute the Service without permission.</li>
                            <li>Use automated tools to scrape or overload the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">5. Third-Party Integrations</h2>
                        <p>
                            The Service may connect to third-party APIs (e.g., Google Calendar, GitHub). Your use of those
                            integrations is also governed by the respective third-party terms of service. We are not responsible
                            for the availability or content of third-party services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">6. Intellectual Property</h2>
                        <p>
                            All content, design, and code comprising the Service are the property of CareerPilot AI or its
                            licensors. You retain ownership of the data you create within the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">7. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided "as is" without warranties of any kind, either express or implied. We do not
                            guarantee that the Service will be uninterrupted, error-free, or meet your specific requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">8. Limitation of Liability</h2>
                        <p>
                            To the fullest extent permitted by law, CareerPilot AI shall not be liable for any indirect,
                            incidental, or consequential damages arising from your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">9. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your access to the Service at our discretion if you
                            violate these Terms. You may delete your account at any time from the Settings page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">10. Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the Service after changes constitutes
                            acceptance of the updated Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-[#e8eaed] mb-3">11. Contact</h2>
                        <p>
                            For questions about these Terms, please contact:{' '}
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
                        <Link to="/privacy" className="hover:text-[#e8eaed] transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-[#e8eaed] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
