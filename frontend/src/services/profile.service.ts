import { api } from '@/services/api-client'
import type { Profile } from '@/types'

export const profileService = {
  getMe: async (): Promise<Profile> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return {
        id: 'mock-id',
        userId: 'user1',
        headline: 'Frontend Engineer',
        location: 'Remote',
        yearsOfExperience: 3,
        skills: ['React', 'TypeScript'],
      }
    }
    return api.get<Profile>('/profile/me')
  },

  updateMe: async (payload: Partial<Profile>): Promise<Profile> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return payload as Profile
    }
    return api.put<Profile>('/profile/me', payload)
  }
}
