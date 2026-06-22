// ─── Core domain types for CareerPilot AI ───────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
  hasPassword: boolean
}

export interface Profile {
  id: string
  userId: string
  headline: string
  location: string
  yearsOfExperience: number
  skills: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
}

export interface Resume {
  id: string
  userId: string
  name: string
  fileUrl: string
  textContent?: string
  uploadedAt: string
  isDefault: boolean
}

// ─── Company ──────────────────────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  logoUrl?: string
  website?: string
  industry?: string
  size?: CompanySize
  location?: string
  description?: string
  notes?: string
  linkedinUrl?: string
  createdAt: string
  updatedAt: string
}

export type CompanySize =
  | 'STARTUP'
  | 'SMALL'
  | 'MEDIUM'
  | 'LARGE'
  | 'ENTERPRISE'

// ─── Vacancy ──────────────────────────────────────────────────────────────────

export interface VacancyCompany {
  id: string
  name: string
  industry?: string
  size?: CompanySize
  website?: string
  logoUrl?: string
  description?: string
  location?: string
}

export interface Vacancy {
  id: string
  title: string
  companyId: string
  company?: VacancyCompany
  url?: string
  description?: string
  location?: string
  remote: RemoteType
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  contractType?: ContractType
  tags: VacancyTag[]
  status: VacancyStatus
  matchScore?: number
  aiSummary?: string
  createdAt: string
  updatedAt: string
  deadline?: string
}

export interface VacancyTag {
  id: string
  label: string
  color?: string
}

export type VacancyStatus = 'ACTIVE' | 'ARCHIVED' | 'EXPIRED'
export type RemoteType = 'REMOTE' | 'HYBRID' | 'ON_SITE'
export type ContractType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP'

// ─── Application ──────────────────────────────────────────────────────────────

export interface Application {
  id: string
  vacancyId: string
  vacancy?: Vacancy
  status: ApplicationStatus
  appliedAt?: string
  notes?: string
  coverLetterUrl?: string
  resumeId?: string
  contacts?: string
  nextActionDate?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationStatus =
  | 'NEW'
  | 'SAVED'
  | 'APPLIED'
  | 'HR_SCREEN'
  | 'TECH_INTERVIEW'
  | 'FINAL_ROUND'
  | 'OFFER'
  | 'REJECTED'

// ─── Interview ────────────────────────────────────────────────────────────────

export type InterviewResult = 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED'

export interface Interview {
  id: string
  applicationId: string
  type: InterviewType
  scheduledAt: string
  timezone?: string
  meetingLink?: string
  result?: InterviewResult
  notes?: string
  isSyncedWithGoogleCalendar?: boolean
  // Additional fields from DashboardSummaryDto if needed
  companyName?: string
  vacancyTitle?: string
}

export type InterviewType =
  | 'HR_SCREEN'
  | 'TECH_SCREEN'
  | 'TECH_INTERVIEW'
  | 'FINAL'
  | 'OTHER'

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  description?: string
  dueAt?: string
  done: boolean
  priority: TaskPriority
  applicationId?: string
  createdAt: string
  updatedAt: string
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AiResult {
  id: string
  userId: string
  type: AiResultType
  prompt: string
  result: string
  vacancyId?: string
  createdAt: string
  tokensUsed?: number
  latencyMs?: number
  errorMessage?: string
  isFallback?: boolean
}

export type AiResultType =
  | 'VACANCY_ANALYSIS'
  | 'RESUME_MATCH'
  | 'COVER_LETTER'
  | 'INTERVIEW_QUESTIONS'
  | 'SKILL_GAP'
  | 'RESUME_GENERATION'

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}

export type NotificationType =
  | 'INTERVIEW_REMINDER'
  | 'TASK_DUE'
  | 'APPLICATION_STATUS'
  | 'AI_COMPLETE'
  | 'SYSTEM'
  | 'INTERVIEW_MISSED'
  | 'TASK_OVERDUE'

export type NotificationProvider = 'EMAIL' | 'TELEGRAM'

// ─── API Pagination ───────────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface SortParams {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface ApplicationFunnel {
  status: ApplicationStatus
  count: number
  percentage: number
}

export interface WeeklyActivity {
  week: string
  applied: number
  interviews: number
  offers: number
}

export interface SkillGap {
  skill: string
  frequency: number
  hasSkill: boolean
}

export interface AnalyticsSummary {
  totalApplications: number
  activeApplications: number
  interviewRate: number
  offerRate: number
  responseRate: number
  avgTimeToInterview: number
  funnel: ApplicationFunnel[]
  weeklyActivity: WeeklyActivity[]
  topSkillGaps: SkillGap[]
}

export interface CompanyAnalyticsItem {
  companyId: string
  companyName: string
  logoUrl?: string | null
  applicationCount: number
  interviewCount: number
  offerCount: number
  responseRate: number
  avgTimeToInterview: number
}

export interface ActivityHeatmapItem {
  date: string
  count: number
}

// ─── Smart Monitoring ─────────────────────────────────────────────────────────

export interface UserResume {
  id: string | null
  userId: string
  rawText: string
  coverLetterTemplate: string
  createdAt?: string
  updatedAt?: string
}

export interface VacancyFilter {
  id: string
  userId: string
  searchQuery: string
  targetSalary: number | null
  isActive: boolean
  lastPolledAt?: string
  createdAt: string
  updatedAt: string
}

