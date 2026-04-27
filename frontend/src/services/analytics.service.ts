import { api } from '@/lib/api-client'
import type { AnalyticsSummary } from '@/types'
import { mockAnalytics } from '@/mock/data'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true'

export const analyticsService = {
  getSummary: (): Promise<AnalyticsSummary> =>
    USE_MOCKS ? Promise.resolve(mockAnalytics) : api.get<AnalyticsSummary>('/analytics/summary'),
}
