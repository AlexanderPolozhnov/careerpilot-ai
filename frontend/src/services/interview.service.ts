import { api, buildQuery } from '@/lib/api-client'
import type { Interview, InterviewResult, InterviewType, PagedResponse } from '@/types'

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

const mockInterviews: Interview[] = []

export interface InterviewFilters {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'ASC' | 'DESC'
  q?: string
}

export interface CreateInterviewDto {
  applicationId: string
  type: InterviewType
  scheduledAt: string
  timezone?: string
  meetingLink?: string
  notes?: string
  result?: InterviewResult
}

export interface UpdateInterviewDto {
  applicationId?: string
  type?: InterviewType
  scheduledAt?: string
  timezone?: string
  meetingLink?: string
  notes?: string
  result?: InterviewResult
}

export type InterviewFormValues = CreateInterviewDto

export const interviewService = {
  list: (filters: InterviewFilters = {}): Promise<PagedResponse<Interview>> => {
    if (USE_MOCKS) {
      const items = mockInterviews
      return Promise.resolve(toPaged(items, filters.page ?? 0, filters.size ?? 20))
    }
    return api.get<PagedResponse<Interview>>(
      `/interviews${buildQuery(filters as Record<string, string | number | boolean | undefined>)}`,
    )
  },

  getById: (id: string): Promise<Interview> =>
    USE_MOCKS
      ? (() => {
        const found = mockInterviews.find((i) => i.id === id)
        if (!found) return Promise.reject(new Error('Interview not found'))
        return Promise.resolve(found)
      })()
      : api.get<Interview>(`/interviews/${id}`),

  create: (data: CreateInterviewDto): Promise<Interview> =>
    USE_MOCKS
      ? Promise.resolve({
        id: `i_mock_${Date.now()}`,
        ...data,
      })
      : api.post<Interview>('/interviews', data),

  update: (id: string, data: UpdateInterviewDto): Promise<Interview> =>
    USE_MOCKS
      ? interviewService.getById(id).then((i) => ({ ...i, ...data }))
      : api.put<Interview>(`/interviews/${id}`, data),

  delete: (id: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.delete<void>(`/interviews/${id}`),

  exportIcs: async (id: string): Promise<void> => {
    if (USE_MOCKS) {
      console.log('Mock: exportIcs for', id)
      // Simulate download for mock mode
      const blob = new Blob(['BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR'], { type: 'text/calendar' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `interview-mock-${id}.ics`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return
    }
    const token = localStorage.getItem('cp_access_token')
    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
    
    const response = await fetch(`${API_BASE}/interviews/${id}/export/ics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to export ICS')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `interview-${id}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
  syncWithGoogle: (id: string): Promise<Interview> => api.post<Interview>(`/interviews/${id}/sync/google`),
}
