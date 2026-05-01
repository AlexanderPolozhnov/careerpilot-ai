import { api, buildQuery } from '@/lib/api-client'
import type { Vacancy, PagedResponse, VacancyStatus } from '@/types'
import { mockVacancies } from '@/mock/data'

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

export interface VacancyFilters {
  page?: number
  size?: number
  sort?: string
  direction?: 'ASC' | 'DESC'
  search?: string
  status?: VacancyStatus
  remote?: string
  companyId?: string
  tag?: string
}

export interface CreateVacancyDto {
  title: string
  companyId: string
  url?: string
  description?: string
  location?: string
  remote: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  contractType?: string
  tagIds?: string[]
  deadline?: string
}

export const vacancyService = {
  list: (filters: VacancyFilters = {}): Promise<PagedResponse<Vacancy>> => {
    if (USE_MOCKS) {
      const q = (filters.search ?? '').trim().toLowerCase()
      let items = mockVacancies
      if (filters.status) items = items.filter((v) => v.status === filters.status)
      if (filters.remote) items = items.filter((v) => v.remote === filters.remote)
      if (filters.companyId) items = items.filter((v) => v.companyId === filters.companyId)
      if (filters.tag) items = items.filter((v) => v.tags.some((t) => t.label.toLowerCase() === String(filters.tag).toLowerCase()))
      if (q) {
        items = items.filter((v) => {
          const hay = `${v.title} ${v.company?.name ?? ''} ${v.location ?? ''}`.toLowerCase()
          return hay.includes(q)
        })
      }
      return Promise.resolve(toPaged(items, filters.page ?? 0, filters.size ?? 20))
    }
    return api.get<PagedResponse<Vacancy>>(
      `/vacancies${buildQuery(filters as Record<string, string | number | boolean | undefined>)}`,
    )
  },

  getById: (id: string): Promise<Vacancy> =>
    USE_MOCKS
      ? (() => {
          const found = mockVacancies.find((v) => v.id === id)
          if (!found) return Promise.reject(new Error('Vacancy not found'))
          return Promise.resolve(found)
        })()
      : api.get<Vacancy>(`/vacancies/${id}`),

  create: (data: CreateVacancyDto): Promise<Vacancy> =>
    USE_MOCKS
      ? Promise.resolve({
          id: `v_mock_${Date.now()}`,
          title: data.title,
          companyId: data.companyId,
          url: data.url,
          description: data.description,
          location: data.location,
          remote: data.remote as Vacancy['remote'],
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          salaryCurrency: data.salaryCurrency,
          contractType: data.contractType as Vacancy['contractType'],
          tags: [],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deadline: data.deadline,
        })
      : api.post<Vacancy>('/vacancies', data),

  update: (id: string, data: Partial<CreateVacancyDto>): Promise<Vacancy> =>
    USE_MOCKS
      ? vacancyService.getById(id).then((v) => ({
          ...v,
          ...data,
          remote: (data.remote as Vacancy['remote']) ?? v.remote,
          contractType: (data.contractType as Vacancy['contractType']) ?? v.contractType,
          updatedAt: new Date().toISOString(),
        }))
      : api.put<Vacancy>(`/vacancies/${id}`, data),

  delete: (id: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.delete<void>(`/vacancies/${id}`),

  archive: (id: string): Promise<Vacancy> =>
    USE_MOCKS
      ? vacancyService.getById(id).then((v) => ({
          ...v,
          status: 'ARCHIVED',
          updatedAt: new Date().toISOString(),
        }))
      : api.patch<Vacancy>(`/vacancies/${id}/archive`, {}),
}
