import { api, buildQuery } from '@/lib/api-client'
import type { Company, PagedResponse } from '@/types'
import { mockCompanies } from '@/mock/data'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true'

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

export interface CompanyFilters {
  page?: number
  size?: number
  search?: string
}

export interface CreateCompanyDto {
  name: string
  website?: string
  industry?: string
  size?: string
  location?: string
  description?: string
  linkedinUrl?: string
  logoUrl?: string
}

export const companyService = {
  list: (filters: CompanyFilters = {}): Promise<PagedResponse<Company>> => {
    if (USE_MOCKS) {
      const q = (filters.search ?? '').trim().toLowerCase()
      const items = q
        ? mockCompanies.filter((c) =>
            `${c.name} ${c.industry ?? ''} ${c.location ?? ''}`.toLowerCase().includes(q),
          )
        : mockCompanies
      return Promise.resolve(toPaged(items, filters.page ?? 0, filters.size ?? 20))
    }
    return api.get<PagedResponse<Company>>(
      `/companies${buildQuery(filters as Record<string, string | number | boolean | undefined>)}`,
    )
  },

  getById: (id: string): Promise<Company> =>
    USE_MOCKS
      ? (() => {
          const found = mockCompanies.find((c) => c.id === id)
          if (!found) return Promise.reject(new Error('Company not found'))
          return Promise.resolve(found)
        })()
      : api.get<Company>(`/companies/${id}`),

  create: (data: CreateCompanyDto): Promise<Company> =>
    USE_MOCKS
      ? Promise.resolve({
          id: `c_mock_${Date.now()}`,
          name: data.name,
          website: data.website,
          industry: data.industry,
          size: data.size as Company['size'],
          location: data.location,
          description: data.description,
          linkedinUrl: data.linkedinUrl,
          logoUrl: data.logoUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      : api.post<Company>('/companies', data),

  update: (id: string, data: Partial<CreateCompanyDto>): Promise<Company> =>
    USE_MOCKS
      ? companyService.getById(id).then((c) => ({
          ...c,
          ...data,
          size: (data.size as Company['size']) ?? c.size,
          updatedAt: new Date().toISOString(),
        }))
      : api.put<Company>(`/companies/${id}`, data),

  delete: (id: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.delete<void>(`/companies/${id}`),
}
