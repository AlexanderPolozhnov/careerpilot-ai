import i18n from '@/i18n'
import { toast } from '@/lib/toast'

// ─── API Client ───────────────────────────────────────────────────────────────
// Designed to connect to a Spring Boot REST API backend.
// Base URL is configurable via VITE_API_BASE_URL environment variable.

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'
const TOKEN_KEY = 'cp_access_token'

export class ApiError extends Error {
  status: number
  override message: string
  data?: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.message = message
    this.data = data
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

async function request<T>(
  path: string,
  options: RequestInit & { _retry?: boolean } = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // Needed for HttpOnly refresh_token cookie
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, fetchOptions)
    const text = await response.text()
    const data = text ? JSON.parse(text) : undefined

    if (!response.ok) {
      if (response.status === 401 && !options._retry && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include' // Send the cookie
          })
            .then(async (res) => {
              if (!res.ok) throw new Error('Refresh failed')
              const refreshText = await res.text()
              const refreshData = refreshText ? JSON.parse(refreshText) : {}
              setToken(refreshData.accessToken)
              return refreshData.accessToken
            })
            .finally(() => {
              isRefreshing = false
            })
        }

        try {
          await refreshPromise
          // Retry the original request
          return request<T>(path, { ...options, _retry: true })
        } catch {
          clearToken()
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth')) {
            window.location.href = '/login'
          }
          throw new ApiError(401, 'Session expired')
        }
      }

      const message = (data as { message?: string })?.message ?? response.statusText
      
      // Skip global 401 handling (logout/redirect) for functional errors.
      // A functional 401 happens if:
      // 1. It's a login attempt (refresh is skipped).
      // 2. It's a retry after a successful refresh (token is fresh, but request still fails - e.g. wrong password).
      const isFunctional401 = response.status === 401 && (options._retry || path.includes('/auth/login'))
      
      if (!isFunctional401) {
        handleHttpError(response.status, message)
      }
      
      throw new ApiError(response.status, message, data)
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network or unexpected errors
    let message = error instanceof Error ? error.message : String(error)
    
    // "Failed to fetch" is a standard browser error when server is unreachable
    if (message === 'Failed to fetch') {
      message = i18n.t('errors.backendOffline')
    }
    
    throw new Error(message)
  }
}

function handleHttpError(status: number, message: string) {
  switch (status) {
    case 401:
      // In case 401 leaks through (e.g. from /auth/refresh)
      clearToken()
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/login'
      }
      break
    case 403:
      toast.error(i18n.t('errors.accessDenied'))
      break
    case 404:
      // Often handled locally, but we can toast if it's an unexpected API 404
      toast.error(i18n.t('errors.notFound'))
      break
    case 500:
      toast.error(i18n.t('errors.serverError'))
      break
    default:
      // For other errors, we might want to show the message from backend if it's safe
      if (status >= 400 && status < 500) {
        toast.warning(message || i18n.t('errors.unexpected'))
      } else if (status >= 500) {
        toast.error(i18n.t('errors.serverError'))
      }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}

// ─── Query string builder ─────────────────────────────────────────────────────

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      q.set(key, String(value))
    }
  }
  const str = q.toString()
  return str ? `?${str}` : ''
}
