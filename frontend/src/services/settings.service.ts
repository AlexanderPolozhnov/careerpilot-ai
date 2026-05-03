import {api} from '@/lib/api-client'
import type {User} from '@/types'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

export interface UserUpdateRequest {
    name: string
    email: string
    location?: string
}

export interface UserWithLocation extends User {
    location?: string
}

export interface PreferencesResponse {
    weeklyDigest: boolean
    interviewReminders: boolean
    aiProviderMode: 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'
    language: string
}

export interface PreferencesRequest {
    weeklyDigest: boolean
    interviewReminders: boolean
    aiProviderMode: 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'
    language: string
}

const mockPreferences: PreferencesResponse = {
    weeklyDigest: true,
    interviewReminders: true,
    aiProviderMode: 'LOCAL',
    language: 'en',
}

export const settingsService = {
    getMe: (): Promise<UserWithLocation> =>
        USE_MOCKS
            ? Promise.resolve({
                id: 'mock',
                email: 'mock@example.com',
                name: 'Mock User',
                avatarUrl: null,
                createdAt: new Date().toISOString(),
                location: 'Remote'
            } as unknown as UserWithLocation)
            : api.get<UserWithLocation>('/users/me'),

    updateMe: (data: UserUpdateRequest): Promise<UserWithLocation> =>
        USE_MOCKS
            ? Promise.resolve({
                id: 'mock',
                email: data.email,
                name: data.name,
                avatarUrl: null,
                createdAt: new Date().toISOString(),
                location: data.location
            } as unknown as UserWithLocation)
            : api.put<UserWithLocation>('/users/me', data),

    getPreferences: (): Promise<PreferencesResponse> =>
        USE_MOCKS
            ? Promise.resolve(mockPreferences)
            : api.get<PreferencesResponse>('/preferences'),

    updatePreferences: (data: PreferencesRequest): Promise<PreferencesResponse> =>
        USE_MOCKS
            ? Promise.resolve(data)
            : api.put<PreferencesResponse>('/preferences', data),
}
