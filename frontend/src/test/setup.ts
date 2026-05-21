import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Set environment variable for mock mode
process.env.VITE_USE_MOCKS = 'true'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts) {
        return Object.entries(opts).reduce(
          (s, [k, v]) => s.replace(`{{${k}}}`, String(v)),
          key,
        )
      }
      return key
    },
    i18n: { language: 'ru', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  Trans: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))
