import { api, setToken, clearToken } from '@/lib/api-client'
import type { User } from '@/types'
import { mockUser } from '@/mock/data'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface UpdatePasswordRequest {
  currentPassword?: string
  newPassword: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (USE_MOCKS) {
      const response: AuthResponse = { accessToken: 'mock_access_token', user: mockUser }
      setToken(response.accessToken)
      return Promise.resolve(response)
    }
    const response = await api.post<AuthResponse>('/auth/login', data)
    setToken(response.accessToken)
    return response
  },

  telegramWebAppAuth: async (initData: string): Promise<AuthResponse> => {
    if (USE_MOCKS) {
      const response: AuthResponse = { accessToken: 'mock_access_token', user: mockUser }
      setToken(response.accessToken)
      return Promise.resolve(response)
    }
    const response = await api.post<AuthResponse>('/auth/telegram-webapp', { initData })
    setToken(response.accessToken)
    return response
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    if (USE_MOCKS) {
      const response: AuthResponse = { accessToken: 'mock_access_token', user: { ...mockUser, name: data.name, email: data.email } }
      setToken(response.accessToken)
      return Promise.resolve(response)
    }
    const response = await api.post<AuthResponse>('/auth/register', data)
    setToken(response.accessToken)
    return response
  },

  logout: (): void => {
    if (!USE_MOCKS) {
      api.post<void>('/auth/logout').catch(e => console.error('Logout API call failed', e))
    }
    clearToken()
  },

  me: (): Promise<User> => api.get<User>('/auth/me'),

  forgotPassword: (email: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.post<void>('/auth/reset-password', { token, password }),

  updatePassword: (data: UpdatePasswordRequest): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.post<void>('/auth/password', data),

  validateToken: async (token: string): Promise<void> => {
    if (USE_MOCKS) {
      return Promise.resolve()
    }
    const originalToken = localStorage.getItem('cp_access_token')
    setToken(token)
    try {
      await api.get<User>('/auth/me')
    } catch (error) {
      clearToken()
      if (originalToken) {
        setToken(originalToken)
      }
      throw error
    }
  },
}


