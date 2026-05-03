import {api, buildQuery} from '@/lib/api-client'
import type {Notification, PagedResponse} from '@/types'
import {mockNotifications} from '@/mock/data'

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

export interface NotificationFilters {
    page?: number
    size?: number
    read?: boolean
}

export const notificationService = {
    list: (filters: NotificationFilters = {}): Promise<PagedResponse<Notification>> => {
        if (USE_MOCKS) {
            let items = mockNotifications
            if (filters.read !== undefined) {
                items = items.filter((n) => n.read === filters.read)
            }
            return Promise.resolve(toPaged(items, filters.page ?? 0, filters.size ?? 20))
        }
        return api.get<PagedResponse<Notification>>(
            `/notifications${buildQuery(filters as Record<string, string | number | boolean | undefined>)}`,
        )
    },

    markAsRead: (id: string): Promise<Notification> => {
        if (USE_MOCKS) {
            const found = mockNotifications.find((n) => n.id === id)
            if (!found) return Promise.reject(new Error('Notification not found'))
            return Promise.resolve({...found, read: true})
        }
        return api.patch<Notification>(`/notifications/${id}/read`, {})
    },
}
