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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const message = (errorData as { message?: string })?.message ?? response.statusText
      
      handleHttpError(response.status, message)
      
      throw new ApiError(response.status, message, errorData)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network or unexpected errors
    toast.error(i18n.t('errors.networkError'))
    throw error
  }
}

function handleHttpError(status: number, message: string) {
  switch (status) {
    case 401:
      clearToken()
      // Redirect to login if not already there
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

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
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
