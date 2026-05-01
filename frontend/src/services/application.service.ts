import { api, buildQuery } from '@/lib/api-client'
import type { Application, ApplicationStatus, PagedResponse } from '@/types'
import { mockApplications } from '@/mock/data'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

function toPaged<T>(items: T[], page = 0, size = 20): PagedResponse<T> {
  const start = page * size
  const content = items.slice(start, start + size)
  const totalElements = items.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  return {
    content,
    totalElements,
    totalPages,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
  }
}

const ALL_STATUSES: ApplicationStatus[] = [
  'NEW',
  'SAVED',
  'APPLIED',
  'HR_SCREEN',
  'TECH_INTERVIEW',
  'FINAL_ROUND',
  'OFFER',
  'REJECTED',
]

export interface ApplicationFilters {
  page?: number
  size?: number
  status?: ApplicationStatus
  vacancyId?: string
}

export interface CreateApplicationDto {
  vacancyId: string
  status?: ApplicationStatus
  notes?: string
  appliedAt?: string
  resumeId?: string
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus
}

export const applicationService = {
  list: (filters: ApplicationFilters = {}): Promise<PagedResponse<Application>> => {
    if (USE_MOCKS) {
      let items = mockApplications
      if (filters.status) items = items.filter((a) => a.status === filters.status)
      if (filters.vacancyId) items = items.filter((a) => a.vacancyId === filters.vacancyId)
      return Promise.resolve(toPaged(items, filters.page ?? 0, filters.size ?? 20))
    }
    return api.get<PagedResponse<Application>>(
      `/applications${buildQuery(filters as Record<string, string | number | boolean | undefined>)}`,
    )
  },

  getById: (id: string): Promise<Application> =>
    USE_MOCKS
      ? (() => {
          const found = mockApplications.find((a) => a.id === id)
          if (!found) return Promise.reject(new Error('Application not found'))
          return Promise.resolve(found)
        })()
      : api.get<Application>(`/applications/${id}`),

  create: (data: CreateApplicationDto): Promise<Application> =>
    USE_MOCKS
      ? Promise.resolve({
          id: `a_mock_${Date.now()}`,
          vacancyId: data.vacancyId,
          status: data.status ?? 'NEW',
          notes: data.notes,
          appliedAt: data.appliedAt,
          resumeId: data.resumeId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      : api.post<Application>('/applications', data),

  updateStatus: (id: string, data: UpdateApplicationStatusDto): Promise<Application> =>
    USE_MOCKS
      ? applicationService.getById(id).then((a) => ({
          ...a,
          status: data.status,
          updatedAt: new Date().toISOString(),
        }))
      : api.patch<Application>(`/applications/${id}/status`, data),

  update: (id: string, data: Partial<CreateApplicationDto>): Promise<Application> =>
    USE_MOCKS
      ? applicationService.getById(id).then((a) => ({ ...a, ...data, updatedAt: new Date().toISOString() }))
      : api.put<Application>(`/applications/${id}`, data),

  delete: (id: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.delete<void>(`/applications/${id}`),

  // Returns all applications grouped by status (for Kanban)
  board: (): Promise<Record<ApplicationStatus, Application[]>> =>
    USE_MOCKS
      ? Promise.resolve(
          ALL_STATUSES.reduce((acc, s) => {
            acc[s] = mockApplications.filter((a) => a.status === s)
            return acc
          }, {} as Record<ApplicationStatus, Application[]>),
        )
      : api.get<Record<ApplicationStatus, Application[]>>('/applications/board'),
}
