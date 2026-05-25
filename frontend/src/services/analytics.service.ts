import { api } from '@/lib/api-client'
import type { AnalyticsSummary, CompanyAnalyticsItem } from '@/types'

export const analyticsService = {
  getSummary: (): Promise<AnalyticsSummary> => api.get<AnalyticsSummary>('/analytics/summary'),
  getCompanyAnalytics: async (): Promise<CompanyAnalyticsItem[]> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return []
    }
    return api.get<CompanyAnalyticsItem[]>('/analytics/companies')
  },
}
