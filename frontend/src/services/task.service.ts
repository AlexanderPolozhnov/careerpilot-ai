import { api, buildQuery } from '@/lib/api-client'
import type { PagedResponse, Task, TaskPriority } from '@/types'

export interface TaskRequest {
  title: string
  description?: string
  dueAt?: string
  done: boolean
  priority: TaskPriority
  applicationId?: string
}

export interface TaskParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: string
  q?: string
}

export const taskService = {
  list: (params: TaskParams = {}) =>
    api.get<PagedResponse<Task>>(`/tasks${buildQuery(params as any)}`),

  get: (id: string) => api.get<Task>(`/tasks/${id}`),

  create: (data: TaskRequest) => api.post<Task>('/tasks', data),

  update: (id: string, data: TaskRequest) => api.put<Task>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/tasks/${id}`),

  toggleDone: (id: string) => api.patch<Task>(`/tasks/${id}/toggle`),
}
