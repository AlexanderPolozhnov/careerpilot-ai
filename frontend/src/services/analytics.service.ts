import { api } from '@/lib/api-client'
import type { AnalyticsSummary, CompanyAnalyticsItem, ActivityHeatmapItem } from '@/types'
import { generateMockHeatmap } from '@/mock/data'

export const analyticsService = {
  getSummary: (): Promise<AnalyticsSummary> => api.get<AnalyticsSummary>('/analytics/summary'),
  getCompanyAnalytics: async (): Promise<CompanyAnalyticsItem[]> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return []
    }
    return api.get<CompanyAnalyticsItem[]>('/analytics/companies')
  },
  getActivityHeatmap: async (): Promise<ActivityHeatmapItem[]> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return Promise.resolve(generateMockHeatmap())
    }
    return api.get<ActivityHeatmapItem[]>('/analytics/activity-heatmap')
  },
}
