import { describe, it, expect } from 'vitest'
import { buildQuery } from '@/services/api-client'

describe('buildQuery', () => {
  it('returns empty string for empty object', () => {
    expect(buildQuery({})).toBe('')
  })

  it('builds correct query string with all values defined', () => {
    expect(buildQuery({ page: 0, size: 20 })).toBe('?page=0&size=20')
  })

  it('skips undefined and empty string values', () => {
    expect(buildQuery({ page: 0, size: undefined, search: '' })).toBe('?page=0')
  })

  it('converts numbers and booleans to string correctly', () => {
    expect(buildQuery({ page: 1, done: true })).toBe('?page=1&done=true')
  })
})
