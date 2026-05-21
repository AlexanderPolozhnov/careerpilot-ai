import { describe, it, expect } from 'vitest'
import { APPLICATION_STATUS_KEYS, LEGACY_STATUS_MAP, translateStatusInText } from '@/lib/utils'

describe('APPLICATION_STATUS_KEYS', () => {
  it('maps NEW to correct i18n key', () => {
    expect(APPLICATION_STATUS_KEYS['NEW']).toBe('applications.new')
  })

  it('maps FINAL_ROUND to correct i18n key', () => {
    expect(APPLICATION_STATUS_KEYS['FINAL_ROUND']).toBe('applications.finalRound')
  })

  it('maps TECH_INTERVIEW to correct i18n key', () => {
    expect(APPLICATION_STATUS_KEYS['TECH_INTERVIEW']).toBe('applications.techInterview')
  })
})

describe('LEGACY_STATUS_MAP', () => {
  it('normalizes FINAL to FINAL_ROUND', () => {
    expect(LEGACY_STATUS_MAP['FINAL']).toBe('FINAL_ROUND')
  })
})

describe('translateStatusInText', () => {
  it('replaces status in text with i18n key', () => {
    const t = (key: string) => key
    const result = translateStatusInText('Статус изменён: APPLIED', t)
    expect(result).toBe('Статус изменён: applications.applied')
  })

  it('handles text without status unchanged', () => {
    const t = (key: string) => key
    const result = translateStatusInText('Просто текст', t)
    expect(result).toBe('Просто текст')
  })

  it('normalizes legacy status values', () => {
    const t = (key: string) => key
    const result = translateStatusInText('Статус изменён: FINAL', t)
    expect(result).toBe('Статус изменён: applications.finalRound')
  })
})
