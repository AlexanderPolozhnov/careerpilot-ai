import React, { useState, useCallback, useEffect } from 'react'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'
import { AuthContext } from './auth-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  logout: () => void
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cp_access_token'))

  // Listen for storage changes (e.g., login/logout in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('cp_access_token'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const { data: user, isLoading: isQueryLoading, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.me(),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Authenticated state is true ONLY if we have a token AND a user object.
  // We use isFetched to ensure we don't flash 'unauthenticated' while the first check is happening.
  const isLoading = !!token && !isFetched && isQueryLoading
  const isAuthenticated = !!user

  const login = useCallback(async (email: string, password: string) => {
    const { user, accessToken } = await authService.login({ email, password })
    setToken(accessToken)
    queryClient.setQueryData(['auth', 'me'], user)
  }, [queryClient])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user, accessToken } = await authService.register({ name, email, password })
    setToken(accessToken)
    queryClient.setQueryData(['auth', 'me'], user)
  }, [queryClient])

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword(email)
  }, [])

  const resetPassword = useCallback(async (token: string, password: string) => {
    await authService.resetPassword(token, password)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setToken(null)
    queryClient.setQueryData(['auth', 'me'], null)
    queryClient.clear()
  }, [queryClient])


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
