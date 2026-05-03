import {api} from '@/lib/api-client'

export interface DashboardKpis {
    activeVacancies: number
    activeApplications: number
    interviewsScheduled: number
    aiInsightsThisWeek: number
}

export interface DashboardInterview {
    id: string
    type: string
    scheduledAt: string
    meetingLink: string | null
    companyName: string | null
    vacancyTitle: string | null
}

export interface DashboardTask {
    id: string
    title: string
    priority: string
    done: boolean
    dueAt: string | null
}

export interface DashboardNotification {
    id: string
    title: string
    message: string
    status: string
    createdAt: string
}

export interface DashboardAiInsight {
    id: string
    type: string
    prompt: string | null
    result: string | null
    createdAt: string
}

export interface DashboardSummary {
    kpis: DashboardKpis
    upcomingInterviews: DashboardInterview[]
    tasks: DashboardTask[]
    aiInsights: DashboardAiInsight[]
    notifications: DashboardNotification[]
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    return api.get<DashboardSummary>('/dashboard/summary')
}
