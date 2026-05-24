import { api } from '@/lib/api-client'
import type { User, NotificationProvider } from '@/types'

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
    taskReminders: boolean
    applicationStatusNotifications: boolean
    aiProviderMode: 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'
    language: string
    openAiApiKey?: string
    openAiModel?: string
    ollamaUrl?: string
    ollamaModel?: string
    customAiProvider?: 'OPENAI' | 'GEMINI'
    geminiApiKey?: string
    geminiModel?: string
    notificationProvider: NotificationProvider
    telegramConnected: boolean
}

export interface PreferencesRequest {
    weeklyDigest: boolean
    interviewReminders: boolean
    taskReminders: boolean
    applicationStatusNotifications: boolean
    aiProviderMode: 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY'
    language: string
    openAiApiKey?: string
    openAiModel?: string
    ollamaUrl?: string
    ollamaModel?: string
    customAiProvider?: 'OPENAI' | 'GEMINI'
    geminiApiKey?: string
    geminiModel?: string
    notificationProvider: NotificationProvider
}

export interface DeleteAccountRequest {
    password?: string
    confirmation: string
}

const mockPreferences: PreferencesResponse = {
    weeklyDigest: true,
    interviewReminders: true,
    taskReminders: true,
    applicationStatusNotifications: true,
    aiProviderMode: 'LOCAL',
    language: 'en',
    openAiApiKey: '',
    openAiModel: 'gpt-4o',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3',
    customAiProvider: 'OPENAI',
    geminiApiKey: '',
    geminiModel: 'gemini-1.5-flash',
    notificationProvider: 'EMAIL',
    telegramConnected: false
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
            ? Promise.resolve({ ...mockPreferences, ...data })
            : api.put<PreferencesResponse>('/preferences', data),

    getTelegramLink: (): Promise<{ link: string }> =>
        USE_MOCKS
            ? Promise.resolve({ link: 'https://t.me/CareerPilotBot?start=mock-token' })
            : api.get<{ link: string }>('/preferences/telegram-link'),

    deleteAccount: (data: DeleteAccountRequest): Promise<void> =>
        USE_MOCKS
            ? Promise.resolve()
            : api.delete<void>('/users/me', data),
}
