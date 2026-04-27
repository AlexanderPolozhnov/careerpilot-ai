import React, { useState, useCallback, useEffect } from 'react'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'
import { AuthContext } from './auth-context'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  logout: () => void
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem('cp_access_token'))

  useEffect(() => {
    const token = localStorage.getItem('cp_access_token')
    if (!token) {
      return
    }
    authService
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login({ email, password })
    setUser(user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await authService.register({ name, email, password })
    setUser(user)
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
