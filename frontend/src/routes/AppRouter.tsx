import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'
import { AppLayout } from '../components/AppLayout'
import { useAuth } from '../context/useAuth'
import LandingPage from '../pages/LandingPage'
import AuthPages from '../pages/AuthPages'
import DashboardPage from '../pages/DashboardPage'
import VacanciesPage from '../pages/VacanciesPage'
import VacancyDetailPage from '../pages/VacancyDetailPage'
import ApplicationsPage from '../pages/ApplicationsPage'
import CompaniesPage from '../pages/CompaniesPage'
import AiAssistantPage from '../pages/AiAssistantPage'
import AnalyticsPage from '../pages/AnalyticsPage'
import SettingsPage from '../pages/SettingsPage'
import { LoadingState } from '@/components/LoadingState'

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState message="Preparing workspace…" className="py-24" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return children
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<AuthPages mode="login" />} />
      <Route path="/auth/register" element={<AuthPages mode="register" />} />
      <Route path="/auth/forgot-password" element={<AuthPages mode="forgot-password" />} />

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
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="ai-assistant" element={<AiAssistantPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
