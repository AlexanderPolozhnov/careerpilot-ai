import { api } from '@/lib/api-client'
import type { VacancyFilter } from '@/types'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

let mockFilters: VacancyFilter[] = [
  {
    id: 'f1',
    userId: 'user1',
    searchQuery: 'React Developer',
    targetSalary: 150000,
    isActive: true,
    lastPolledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'f2',
    userId: 'user1',
    searchQuery: 'Node.js Architect',
    targetSalary: 250000,
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const monitoringService = {
  getFilters: (): Promise<VacancyFilter[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(mockFilters)
    }
    return api.get<VacancyFilter[]>('/vacancy-filters')
  },

  createFilter: (data: {
    searchQuery: string
    targetSalary?: number | null
    experience?: string
    employment?: string
    schedule?: string
    area?: string
    onlyWithSalary?: boolean
    pollingInterval?: number
  }): Promise<VacancyFilter> => {
    if (USE_MOCKS) {
      const newFilter: VacancyFilter = {
        id: `f_mock_${Date.now()}`,
        userId: 'user1',
        searchQuery: data.searchQuery,
        targetSalary: data.targetSalary ?? null,
        isActive: true,
        experience: data.experience,
        employment: data.employment,
        schedule: data.schedule,
        area: data.area,
        onlyWithSalary: data.onlyWithSalary ?? false,
        pollingInterval: data.pollingInterval ?? 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockFilters.push(newFilter)
      return Promise.resolve(newFilter)
    }
    return api.post<VacancyFilter>('/vacancy-filters', data)
  },

  updateFilter: (
    id: string,
    data: {
      searchQuery?: string
      targetSalary?: number | null
      isActive?: boolean
      experience?: string
      employment?: string
      schedule?: string
      area?: string
      onlyWithSalary?: boolean
      pollingInterval?: number
    }
  ): Promise<VacancyFilter> => {
    if (USE_MOCKS) {
      const index = mockFilters.findIndex((f) => f.id === id)
      if (index !== -1) {
        mockFilters[index] = {
          ...mockFilters[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        return Promise.resolve(mockFilters[index])
      }
      return Promise.reject(new Error('Filter not found'))
    }
    return api.put<VacancyFilter>(`/vacancy-filters/${id}`, data)
  },

  deleteFilter: (id: string): Promise<void> => {
    if (USE_MOCKS) {
      mockFilters = mockFilters.filter((f) => f.id !== id)
      return Promise.resolve()
    }
    return api.delete<void>(`/vacancy-filters/${id}`)
  },
}
