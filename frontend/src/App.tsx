import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ToastProvider>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <AppRouter />
              </AuthProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </ToastProvider>
      </I18nextProvider>
    </ErrorBoundary>
  )
}