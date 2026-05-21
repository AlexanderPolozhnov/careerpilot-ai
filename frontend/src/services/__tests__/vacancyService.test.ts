import { describe, it, expect } from 'vitest'
import { vacancyService } from '@/services/vacancy.service'
import { mockVacancies } from '@/mock/data'

describe('vacancyService (mock mode)', () => {
  it('list({}) returns PagedResponse with content, totalElements > 0, first: true', async () => {
    const response = await vacancyService.list({})
    expect(response.content).toBeInstanceOf(Array)
    expect(response.totalElements).toBeGreaterThan(0)
    expect(response.first).toBe(true)
  })

  it('list({ status: "ACTIVE" }) filters correctly', async () => {
    const response = await vacancyService.list({ status: 'ACTIVE' })
    expect(response.content.every((v) => v.status === 'ACTIVE')).toBe(true)
  })

  it('list({ search: "NONEXISTENT_XYZ_123" }) returns empty content', async () => {
    const response = await vacancyService.list({ search: 'NONEXISTENT_XYZ_123' })
    expect(response.content).toHaveLength(0)
  })

  it('getById(existing_id) returns object with correct id', async () => {
    const firstVacancy = mockVacancies[0]
    if (mockVacancies.length === 0) {
      return
    }
    const vacancy = await vacancyService.getById(firstVacancy.id)
    expect(vacancy.id).toBe(firstVacancy.id)
  })

  it('getById("not-found") rejects with error', async () => {
    await expect(vacancyService.getById('not-found')).rejects.toThrow()
  })
})
