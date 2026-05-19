import { api, buildQuery } from '@/services/api-client'

export type SearchItemType = 'VACANCY' | 'COMPANY' | 'TASK' | 'INTERVIEW'

export interface SearchItem {
  id: string
  type: SearchItemType
  title: string
  subtitle: string
  status: string
  url: string
}

export interface SearchResponse {
  results: SearchItem[]
}

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

export const searchService = {
  globalSearch: (query: string): Promise<SearchResponse> => {
    if (USE_MOCKS) {
      return Promise.resolve({ results: [] })
    }
    return api.get<SearchResponse>(`/search${buildQuery({ q: query })}`)
  },
}
