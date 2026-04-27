import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './routes/AppRouter'
import { AuthProvider } from './context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

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
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </I18nextProvider>
  )
}