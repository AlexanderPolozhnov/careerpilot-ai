import { api } from '@/lib/api-client'
import type { Resume, UserResume } from '@/types'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

export interface CreateResumeDto {
  name: string
  fileUrl?: string
  textContent?: string
  isDefault?: boolean
}

const mockUserResume: UserResume = {
  id: 'ur1',
  userId: 'user1',
  rawText: '',
  coverLetterTemplate: 'Здравствуйте! Меня зовут Александр, меня очень заинтересовала ваша вакансия...'
}

export const resumeService = {
  list: (): Promise<Resume[]> => {
    if (USE_MOCKS) {
      return Promise.resolve([
        {
          id: 'r1',
          userId: 'user1',
          name: 'Software Engineer Resume',
          fileUrl: 'https://example.com/resume.pdf',
          uploadedAt: new Date().toISOString(),
          isDefault: true,
        },
      ])
    }
    return api.get<Resume[]>('/resumes')
  },

  getById: (id: string): Promise<Resume> =>
    USE_MOCKS
      ? Promise.resolve({
        id,
        userId: 'user1',
        name: 'Software Engineer Resume',
        fileUrl: 'https://example.com/resume.pdf',
        uploadedAt: new Date().toISOString(),
        isDefault: true,
      })
      : api.get<Resume>(`/resumes/${id}`),

  create: (data: CreateResumeDto): Promise<Resume> =>
    USE_MOCKS
      ? Promise.resolve({
        id: `r_mock_${Date.now()}`,
        userId: 'user1',
        name: data.name,
        fileUrl: data.fileUrl ?? '',
        uploadedAt: new Date().toISOString(),
        isDefault: data.isDefault ?? false,
      })
      : api.post<Resume>('/resumes', data),

  update: (id: string, data: Partial<CreateResumeDto>): Promise<Resume> =>
    USE_MOCKS
      ? resumeService.getById(id).then((r) => ({
        ...r,
        ...data,
        uploadedAt: r.uploadedAt,
      }))
      : api.put<Resume>(`/resumes/${id}`, data),

  setAsDefault: (id: string): Promise<Resume> =>
    USE_MOCKS
      ? resumeService.getById(id).then((r) => ({
        ...r,
        isDefault: true,
      }))
      : api.patch<Resume>(`/resumes/${id}/default`, {}),

  delete: (id: string): Promise<void> =>
    USE_MOCKS ? Promise.resolve() : api.delete<void>(`/resumes/${id}`),

  extractText: async (file: File): Promise<{ text: string }> => {
    if (USE_MOCKS) {
      return new Promise((resolve) => setTimeout(() => resolve({ text: 'Mock extracted resume text from ' + file.name }), 1500))
    }
    const formData = new FormData()
    formData.append('file', file)
    return api.postFormData<{ text: string }>('/resumes/extract', formData)
  },

  getMyResume: (): Promise<UserResume> => {
    if (USE_MOCKS) {
      return Promise.resolve(mockUserResume)
    }
    return api.get<UserResume>('/resumes/mine')
  },

  updateMyResume: (data: Partial<UserResume>): Promise<UserResume> => {
    if (USE_MOCKS) {
      Object.assign(mockUserResume, data)
      return Promise.resolve(mockUserResume)
    }
    return api.put<UserResume>('/resumes/mine', data)
  },
}
