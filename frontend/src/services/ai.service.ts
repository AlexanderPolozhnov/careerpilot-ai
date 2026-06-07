import { api } from '@/lib/api-client'
import type { AiResult, AiResultType } from '@/types'
import { mockAiResults, mockUser } from '@/mock/data'

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true'

function mkResult(type: AiResultType, prompt: string, result: string, vacancyId?: string): AiResult {
  return {
    id: `ai_mock_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    userId: mockUser.id,
    type,
    prompt,
    result,
    vacancyId,
    createdAt: new Date().toISOString(),
    tokensUsed: Math.floor(500 + Math.random() * 900),
  }
}

export interface AiAnalyzeVacancyDto {
  vacancyId?: string
  vacancyText?: string
}

export interface AiResumeMatchDto {
  vacancyId?: string
  vacancyText?: string
  resumeId?: string
  resumeText?: string
}

export interface AiCoverLetterDto {
  vacancyId?: string
  vacancyText?: string
  resumeId?: string
  resumeText?: string
  tone?: 'PROFESSIONAL' | 'FRIENDLY' | 'ENTHUSIASTIC'
  additionalContext?: string
}

export interface AiInterviewQuestionsDto {
  vacancyId?: string
  vacancyText?: string
  focusArea?: string
  count?: number
}

export interface AiResumeGenerationDto {
  vacancyId?: string
  vacancyText?: string
  resumeId?: string
  resumeText: string
  additionalContext?: string
}

export interface AiResponse {
  result: AiResult
}

export const aiService = {
  analyzeVacancy: (data: AiAnalyzeVacancyDto): Promise<AiResponse> =>
    USE_MOCKS
      ? Promise.resolve({
        result:
          mockAiResults.find((r) => r.type === 'VACANCY_ANALYSIS' && r.vacancyId === data.vacancyId) ??
          mkResult(
            'VACANCY_ANALYSIS',
            'Analyze vacancy',
            `## Vacancy Analysis\n\n**Summary:** Strong potential fit. Focus on TypeScript depth and design systems.\n\n### Suggested next steps\n- Tailor resume bullets to measurable UI impact\n- Prepare examples for performance and accessibility\n- Review GraphQL fundamentals if required`,
            data.vacancyId,
          ),
      })
      : api.post<AiResponse>('/ai/analyze-vacancy', data),

  resumeMatch: (data: AiResumeMatchDto): Promise<AiResponse> =>
    USE_MOCKS
      ? Promise.resolve({
        result: mkResult(
          'RESUME_MATCH',
          'Compare resume to vacancy',
          `## Resume Match\n\n**Estimated match:** 78%\n\n### Strengths\n- React + TypeScript experience aligns well\n- Strong UI craftsmanship signals\n\n### Gaps\n- Add one project emphasizing backend collaboration\n- Mention testing strategy and CI ownership\n\n### Rewrite suggestions\n- Turn 2–3 bullets into impact metrics (latency, conversion, UX)`,
          data.vacancyId,
        ),
      })
      : api.post<AiResponse>('/ai/resume-match', data),

  generateCoverLetter: (data: AiCoverLetterDto): Promise<AiResponse> =>
    USE_MOCKS
      ? Promise.resolve({
        result: mkResult(
          'COVER_LETTER',
          'Generate cover letter',
          `## Cover Letter (${data.tone ?? 'PROFESSIONAL'})\n\nHello team,\n\nI’m excited to apply for this role. I bring strong React + TypeScript experience, a focus on craft, and a track record of shipping polished product experiences.\n\nIn my recent work I:\n- built reusable design-system components\n- improved performance and accessibility\n- partnered closely with product and design\n\nI’d love to discuss how I can contribute.\n\nBest regards,\n${mockUser.name}`,
          data.vacancyId,
        ),
      })
      : api.post<AiResponse>('/ai/cover-letter', data),

  generateInterviewQuestions: (data: AiInterviewQuestionsDto): Promise<AiResponse> =>
    USE_MOCKS
      ? Promise.resolve({
        result: mkResult(
          'INTERVIEW_QUESTIONS',
          'Generate interview questions',
          `## Interview Questions\n\nFocus area: ${data.focusArea ?? 'General'}\n\n1. Describe a difficult UI performance issue you solved.\n2. How do you design a component API for long-term maintainability?\n3. What trade-offs do you make between speed of delivery and technical debt?\n4. Explain a time you improved accessibility beyond basic compliance.\n5. How do you approach debugging state-management issues?\n`,
          data.vacancyId,
        ),
      })
      : api.post<AiResponse>('/ai/interview-questions', data),

  generateResume: (data: AiResumeGenerationDto): Promise<AiResponse> =>
    USE_MOCKS
      ? Promise.resolve({
        result: mkResult(
          'RESUME_GENERATION',
          'Generate improved resume',
          `## Improved Resume (Tailored Version)\n\n### Professional Summary\nHighly skilled professional with proven impact. Tailored key accomplishments to align with target job requirements.\n\n### Key Achievements & Improvements\n- **Impact Metric:** Optimized slow application bottlenecks, reducing latency by **35%**.\n- **Relevance:** Highlighted TypeScript & React design system experiences.\n\n### Polished Experience\n**Senior Software Engineer** | Tech Corp\n- Architected reusable component library used by 15+ developers, saving ~200 engineering hours/month.`,
          data.vacancyId,
        ),
      })
      : api.post<AiResponse>('/ai/generate-resume', data),

  getHistory: (type?: AiResultType): Promise<AiResult[]> =>
    USE_MOCKS
      ? Promise.resolve(type ? mockAiResults.filter((r) => r.type === type) : mockAiResults)
      : api.get<AiResult[]>(`/ai/history${type ? `?type=${type}` : ''}`),

  getById: (id: string): Promise<AiResult> =>
    USE_MOCKS
      ? (() => {
        const found = mockAiResults.find((r) => r.id === id)
        if (!found) return Promise.reject(new Error('AI result not found'))
        return Promise.resolve(found)
      })()
      : api.get<AiResult>(`/ai/history/${id}`),

  testConnection: (data: AiProviderConfigRequest): Promise<AiTestConnectionResponse> =>
    USE_MOCKS
      ? Promise.resolve({ success: true, message: 'OK', latencyMs: 540 })
      : api.post<AiTestConnectionResponse>('/ai/test-connection', data),

  syncModels: (data: AiProviderConfigRequest): Promise<string[]> =>
    USE_MOCKS
      ? Promise.resolve(data.customAiProvider === 'OPENAI' ? ['gpt-4o', 'gpt-4o-mini'] : data.customAiProvider === 'OLLAMA' ? ['llama3', 'mistral'] : ['gemini-1.5-pro', 'gemini-1.5-flash'])
      : api.post<string[]>('/ai/models/sync', data),
}

export interface AiProviderConfigRequest {
  aiProviderMode: 'SYSTEM_DEFAULT' | 'BRING_YOUR_OWN_KEY'
  customAiProvider?: 'OPENAI' | 'OLLAMA' | 'GEMINI'
  openAiApiKey?: string
  openAiModel?: string
  ollamaUrl?: string
  ollamaModel?: string
  geminiApiKey?: string
  geminiModel?: string
}

export interface AiTestConnectionResponse {
  success: boolean
  message: string
  latencyMs?: number
}
