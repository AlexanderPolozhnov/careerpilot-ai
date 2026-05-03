import { api } from '@/lib/api-client'
import type { AnalyticsSummary } from '@/types'

export const analyticsService = {
  getSummary: (): Promise<AnalyticsSummary> => api.get<AnalyticsSummary>('/analytics/summary'),
}
