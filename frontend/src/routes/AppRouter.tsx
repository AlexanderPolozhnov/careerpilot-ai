import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../context/useAuth'
import { LoadingState } from '@/components/LoadingState'
import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/services/settings.service'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

// Динамические импорты страниц (Code Splitting)
const LandingPage = lazy(() => import('../pages/LandingPage'))
const AuthPages = lazy(() => import('../pages/AuthPages'))
const OAuthCallbackPage = lazy(() => import('../pages/OAuthCallbackPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const VacanciesPage = lazy(() => import('../pages/VacanciesPage'))
const VacancyDetailPage = lazy(() => import('../pages/VacancyDetailPage'))
const ApplicationsPage = lazy(() => import('../pages/ApplicationsPage'))
const TasksPage = lazy(() => import('../pages/TasksPage'))
const InterviewsPage = lazy(() => import('../pages/InterviewsPage'))
const CompaniesPage = lazy(() => import('../pages/CompaniesPage'))
const AiAssistantPage = lazy(() => import('../pages/AiAssistantPage'))
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const ResumeSettingsPage = lazy(() => import('../pages/settings/ResumeSettingsPage'))
const MonitoringSettingsPage = lazy(() => import('../pages/settings/MonitoringSettingsPage'))
const PrivacyPolicyPage = lazy(() => import('../pages/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('../pages/TermsOfServicePage'))
const TelegramStarsPaywallPage = lazy(() => import('../pages/payment/TelegramStarsPaywallPage'))

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: settingsService.getPreferences,
    enabled: isAuthenticated
  })

  useEffect(() => {
    if (isAuthenticated) {
      const tg = (window as unknown as {
        Telegram?: {
          WebApp?: {
            initDataUnsafe?: {
              start_param?: string;
            };
          };
        };
      }).Telegram?.WebApp
      const startParam = tg?.initDataUnsafe?.start_param
      if (startParam && startParam.startsWith('pay_stars_')) {
        const paymentId = startParam.substring('pay_stars_'.length)
        if (tg?.initDataUnsafe) {
          tg.initDataUnsafe.start_param = ''
        }
        navigate(`/payment/stars?paymentId=${paymentId}`, { replace: true })
      }
    }
  }, [isAuthenticated, navigate])

  if (isLoading || (isAuthenticated && prefsLoading)) {
    return <LoadingState message={t('common.preparingWorkspace')} className="py-24" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <>
      {children}
      {preferences && !preferences.onboardingCompleted && <OnboardingWizard />}
    </>
  )
}

export function AppRouter() {
  const { t } = useTranslation()

  return (
    <Suspense fallback={<LoadingState message={t('common.loading')} className="min-h-[50vh] flex items-center justify-center" />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/auth/login" element={<AuthPages mode="login" />} />
        <Route path="/auth/register" element={<AuthPages mode="register" />} />
        <Route path="/auth/forgot-password" element={<AuthPages mode="forgot-password" />} />
        <Route path="/auth/reset-password" element={<AuthPages mode="reset-password" />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        <Route
          path="/payment/stars"
          element={
            <ProtectedRoute>
              <TelegramStarsPaywallPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vacancies" element={<VacanciesPage />} />
          <Route path="vacancies/:id" element={<VacancyDetailPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="interviews" element={<InterviewsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="ai-assistant" element={<AiAssistantPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/resume" element={<ResumeSettingsPage />} />
          <Route path="settings/monitoring" element={<MonitoringSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
