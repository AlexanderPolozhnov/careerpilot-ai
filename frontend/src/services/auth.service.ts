import { api, setToken, clearToken } from '@/lib/api-client'
import type { User } from '@/types'
import { mockUser } from '@/mock/data'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
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
    clearToken()
  },

  me: (): Promise<User> => api.get<User>('/auth/me'),

  forgotPassword: (email: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.post<void>('/auth/reset-password', { token, password }),
}
