import type {
  Company,
  Vacancy,
  Application,
  Interview,
  Task,
  AiResult,
  AnalyticsSummary,
  Notification,
} from '@/types'

export const mockUser = {
  id: 'user1',
  email: 'alexander@careerpilot.ai',
  name: 'Alexander',
  createdAt: '2024-01-01T09:00:00Z',
}

// ─── Companies ────────────────────────────────────────────────────────────────

export const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'Linear',
    website: 'https://linear.app',
    industry: 'Developer Tools',
    size: 'STARTUP',
    location: 'San Francisco, CA',
    description: 'Linear is a project management tool built for high-performance teams.',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Vercel',
    website: 'https://vercel.com',
    industry: 'Cloud Infrastructure',
    size: 'MEDIUM',
    location: 'Remote',
    description: 'Vercel provides the developer experience and infrastructure to build, scale, and secure a faster, more personalized web.',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'c3',
    name: 'Stripe',
    website: 'https://stripe.com',
    industry: 'FinTech',
    size: 'LARGE',
    location: 'San Francisco, CA',
    description: 'Stripe is a technology company that builds economic infrastructure for the internet.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'c4',
    name: 'Notion',
    website: 'https://notion.so',
    industry: 'Productivity',
    size: 'MEDIUM',
    location: 'New York, NY',
    description: 'Notion is a new tool that blends your everyday work apps into one.',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
]

// ─── Vacancies ────────────────────────────────────────────────────────────────

export const mockVacancies: Vacancy[] = [
  {
    id: 'v1',
    title: 'Senior Frontend Engineer',
    companyId: 'c1',
    company: mockCompanies[0],
    url: 'https://linear.app/jobs/frontend',
    description: 'We are looking for a Senior Frontend Engineer to join our product team. You will work closely with our design and backend teams to build exceptional user experiences.',
    location: 'Remote',
    remote: 'REMOTE',
    salaryMin: 160000,
    salaryMax: 200000,
    salaryCurrency: 'USD',
    contractType: 'FULL_TIME',
    tags: [
      { id: 't1', label: 'React', color: '#61DAFB' },
      { id: 't2', label: 'TypeScript', color: '#3178C6' },
      { id: 't3', label: 'GraphQL', color: '#E10098' },
    ],
    status: 'ACTIVE',
    matchScore: 87,
    aiSummary: 'Strong match. Requires deep React expertise and TypeScript. GraphQL experience is a plus. Company culture aligns with your profile.',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    deadline: '2024-03-15T00:00:00Z',
  },
  {
    id: 'v2',
    title: 'Staff Software Engineer',
    companyId: 'c2',
    company: mockCompanies[1],
    url: 'https://vercel.com/careers',
    description: 'Join Vercel\'s engineering team to build the platform that powers the modern web.',
    location: 'Remote',
    remote: 'REMOTE',
    salaryMin: 200000,
    salaryMax: 280000,
    salaryCurrency: 'USD',
    contractType: 'FULL_TIME',
    tags: [
      { id: 't2', label: 'TypeScript', color: '#3178C6' },
      { id: 't4', label: 'Node.js', color: '#339933' },
      { id: 't5', label: 'Rust', color: '#DEA584' },
    ],
    status: 'ACTIVE',
    matchScore: 74,
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
  {
    id: 'v3',
    title: 'Frontend Lead',
    companyId: 'c3',
    company: mockCompanies[2],
    url: 'https://stripe.com/jobs',
    description: 'Lead the frontend engineering efforts for Stripe\'s dashboard products.',
    location: 'San Francisco, CA',
    remote: 'HYBRID',
    salaryMin: 220000,
    salaryMax: 300000,
    salaryCurrency: 'USD',
    contractType: 'FULL_TIME',
    tags: [
      { id: 't1', label: 'React', color: '#61DAFB' },
      { id: 't6', label: 'Leadership', color: '#F5A623' },
    ],
    status: 'ACTIVE',
    matchScore: 68,
    createdAt: '2024-02-08T10:00:00Z',
    updatedAt: '2024-02-08T10:00:00Z',
  },
  {
    id: 'v4',
    title: 'Product Engineer',
    companyId: 'c4',
    company: mockCompanies[3],
    url: 'https://notion.so/jobs',
    description: 'Build the future of productivity tools at Notion.',
    location: 'New York, NY',
    remote: 'HYBRID',
    salaryMin: 150000,
    salaryMax: 190000,
    salaryCurrency: 'USD',
    contractType: 'FULL_TIME',
    tags: [
      { id: 't1', label: 'React', color: '#61DAFB' },
      { id: 't2', label: 'TypeScript', color: '#3178C6' },
    ],
    status: 'ACTIVE',
    matchScore: 91,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
]

// ─── Applications ─────────────────────────────────────────────────────────────

export const mockApplications: Application[] = [
  {
    id: 'a1',
    vacancyId: 'v1',
    vacancy: mockVacancies[0],
    status: 'TECH_INTERVIEW',
    appliedAt: '2024-02-03T10:00:00Z',
    notes: 'Great culture fit. Prepare system design questions.',
    nextActionDate: '2024-02-20T14:00:00Z',
    createdAt: '2024-02-03T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'a2',
    vacancyId: 'v2',
    vacancy: mockVacancies[1],
    status: 'APPLIED',
    appliedAt: '2024-02-06T10:00:00Z',
    notes: 'Submitted via company site. Awaiting response.',
    createdAt: '2024-02-06T10:00:00Z',
    updatedAt: '2024-02-06T10:00:00Z',
  },
  {
    id: 'a3',
    vacancyId: 'v3',
    vacancy: mockVacancies[2],
    status: 'HR_SCREEN',
    appliedAt: '2024-02-09T10:00:00Z',
    notes: 'HR call scheduled for Feb 20.',
    nextActionDate: '2024-02-20T10:00:00Z',
    createdAt: '2024-02-09T10:00:00Z',
    updatedAt: '2024-02-14T10:00:00Z',
  },
  {
    id: 'a4',
    vacancyId: 'v4',
    vacancy: mockVacancies[3],
    status: 'SAVED',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'a5',
    vacancyId: 'v1',
    vacancy: mockVacancies[0],
    status: 'NEW',
    createdAt: '2024-02-12T10:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
  },
]

// ─── Interviews ───────────────────────────────────────────────────────────────

export const mockInterviews: Interview[] = [
  {
    id: 'i1',
    applicationId: 'a1',
    application: mockApplications[0],
    type: 'TECHNICAL',
    scheduledAt: '2024-02-20T14:00:00Z',
    duration: 60,
    location: 'Google Meet',
    notes: 'Focus on React internals and TypeScript generics',
    createdAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'i2',
    applicationId: 'a3',
    application: mockApplications[2],
    type: 'HR',
    scheduledAt: '2024-02-20T10:00:00Z',
    duration: 30,
    location: 'Zoom',
    createdAt: '2024-02-14T10:00:00Z',
  },
]

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const mockTasks: Task[] = [
  {
    id: 'task1',
    userId: 'user1',
    title: 'Prepare technical portfolio for Linear',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueDate: '2024-02-19T00:00:00Z',
    applicationId: 'a1',
    createdAt: '2024-02-12T10:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
  },
  {
    id: 'task2',
    userId: 'user1',
    title: 'Send thank-you note to Stripe HR',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '2024-02-16T00:00:00Z',
    applicationId: 'a3',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'task3',
    userId: 'user1',
    title: 'Update resume with recent project',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: '2024-02-18T00:00:00Z',
    createdAt: '2024-02-13T10:00:00Z',
    updatedAt: '2024-02-13T10:00:00Z',
  },
]

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'user1',
    type: 'INTERVIEW_REMINDER',
    title: 'Interview in 2 hours',
    body: 'Technical interview with Linear at 14:00',
    read: false,
    createdAt: '2024-02-20T12:00:00Z',
    link: '/applications/a1',
  },
  {
    id: 'n2',
    userId: 'user1',
    type: 'APPLICATION_STATUS',
    title: 'Application updated',
    body: 'Your Stripe application moved to HR Screen',
    read: false,
    createdAt: '2024-02-14T10:00:00Z',
    link: '/applications/a3',
  },
  {
    id: 'n3',
    userId: 'user1',
    type: 'AI_COMPLETE',
    title: 'AI analysis ready',
    body: 'Vacancy analysis for Vercel Staff Engineer is ready',
    read: true,
    createdAt: '2024-02-06T11:00:00Z',
  },
]

// ─── AI Results ───────────────────────────────────────────────────────────────

export const mockAiResults: AiResult[] = [
  {
    id: 'ai1',
    userId: 'user1',
    type: 'VACANCY_ANALYSIS',
    prompt: 'Analyze this senior frontend engineer role at Linear',
    result: `## Vacancy Analysis: Senior Frontend Engineer @ Linear

**Overall Assessment:** Strong fit — this role aligns well with your profile.

### Key Requirements
- 5+ years React experience (✓ You have 6)
- TypeScript proficiency (✓ Strong match)
- GraphQL experience (⚠ Limited — worth brushing up)
- Design systems knowledge (✓ Good match)

### Salary Range
$160K–$200K is competitive for the Remote market. Your target range overlaps well.

### Culture Signals
Linear values speed, craft, and autonomy. Their engineering blog shows a strong bias for action. This matches your described work style.

### Red Flags
None significant. The role mentions "managing IC work" which could mean some tech lead expectations.

### Recommended Action
Apply. Tailor your cover letter to emphasize your design system contributions and TypeScript expertise.`,
    vacancyId: 'v1',
    createdAt: '2024-02-02T10:00:00Z',
    tokensUsed: 842,
  },
]

export const mockDashboard = {
  kpis: {
    activeVacancies: 14,
    activeApplications: 8,
    interviewsScheduled: 2,
    aiInsightsThisWeek: 5,
  },
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const mockAnalytics: AnalyticsSummary = {
  totalApplications: 24,
  activeApplications: 8,
  interviewRate: 0.42,
  offerRate: 0.08,
  responseRate: 0.54,
  avgTimeToInterview: 8.5,
  funnel: [
    { status: 'NEW', count: 3, percentage: 12.5 },
    { status: 'SAVED', count: 4, percentage: 16.7 },
    { status: 'APPLIED', count: 8, percentage: 33.3 },
    { status: 'HR_SCREEN', count: 4, percentage: 16.7 },
    { status: 'TECH_INTERVIEW', count: 3, percentage: 12.5 },
    { status: 'FINAL_ROUND', count: 1, percentage: 4.2 },
    { status: 'OFFER', count: 1, percentage: 4.2 },
    { status: 'REJECTED', count: 5, percentage: 20.8 },
  ],
  weeklyActivity: [
    { week: 'Jan 8', applied: 3, interviews: 0, offers: 0 },
    { week: 'Jan 15', applied: 5, interviews: 1, offers: 0 },
    { week: 'Jan 22', applied: 4, interviews: 2, offers: 0 },
    { week: 'Jan 29', applied: 6, interviews: 3, offers: 0 },
    { week: 'Feb 5', applied: 4, interviews: 2, offers: 1 },
    { week: 'Feb 12', applied: 2, interviews: 2, offers: 0 },
  ],
  topSkillGaps: [
    { skill: 'Rust', frequency: 8, hasSkill: false },
    { skill: 'GraphQL', frequency: 12, hasSkill: false },
    { skill: 'System Design', frequency: 15, hasSkill: true },
    { skill: 'AWS', frequency: 10, hasSkill: false },
    { skill: 'Docker', frequency: 9, hasSkill: true },
  ],
}
