import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { authService } from '@/services/auth.service'
import { setToken, clearToken } from '@/lib/api-client'

describe('authService (mock mode)', () => {
  beforeEach(() => {
    // Clear token before each test
    clearToken()
  })

  afterEach(() => {
    // Clean up after each test
    clearToken()
  })

  it('login() returns AuthResponse with mock_access_token and user.email', async () => {
    const response = await authService.login({ email: 'test@example.com', password: 'password' })
    expect(response.accessToken).toBe('mock_access_token')
    expect(response.user.email).toBeDefined()
  })

  it('login() saves token to localStorage', async () => {
    await authService.login({ email: 'test@example.com', password: 'password' })
    expect(localStorage.getItem('cp_access_token')).toBe('mock_access_token')
  })

  it('register() returns user.name matching input', async () => {
    const response = await authService.register({ name: 'Test User', email: 'test@example.com', password: 'password' })
    expect(response.user.name).toBe('Test User')
  })

  it('logout() clears token from localStorage', () => {
    setToken('test_token')
    expect(localStorage.getItem('cp_access_token')).toBe('test_token')
    authService.logout()
    expect(localStorage.getItem('cp_access_token')).toBeNull()
  })
})
