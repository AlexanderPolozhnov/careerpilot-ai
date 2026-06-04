# CareerPilot AI — Frontend/Backend Contract

This document establishes the official API contract between the frontend service layer (`frontend/src/services/*.ts`) and the Spring Boot REST API. Endpoint paths, HTTP methods, DTO names, enum values, and technical identifiers are left exactly as they appear in the code, while the explanations are provided in English.

This contract represents the expected system behavior when running the frontend in API mode (`VITE_USE_MOCKS=false`). It does not necessarily guarantee that every single endpoint has been fully implemented on the backend yet.

## Endpoint Statuses

- `USED BY FRONTEND` — Endpoint is actively invoked by the active frontend service layer.
- `USED BY FRONTEND SERVICE` — Endpoint is defined in the frontend service layer but may not yet have a route-level UI scenario.
- `TARGET/TODO` — Endpoint is designed to replace mock-only or local-only areas, but the frontend service layer does not yet trigger it.
- `FUTURE TODO` — Types are defined in the frontend, but the service calls and corresponding pages are not yet implemented.

## Conventions

- Base URL for the backend: `/api`.
- Frontend environment variable: `VITE_API_BASE_URL`. Default value in code: `http://localhost:8080/api`.
- All paths below are specified relative to `/api`.
- Authorization Header: `Authorization: Bearer <accessToken>`.
- Access token is persisted inside the browser's `localStorage` under the `cp_access_token` key.
- Request/Response Format: JSON.
- Date/Time Format: ISO-8601 string, e.g., `2026-04-27T05:00:00Z`.
- Pagination Query Parameters: `page` is 0-based (minimum `0`), `size` is the page size (minimum `1`, maximum `100`).
- Sorting Query Parameters: `sort`, `direction` (either `ASC` or `DESC`).
- Undefined/empty filters are stripped and not transmitted by the frontend.
- OpenAPI/Swagger UI is accessible locally at `/swagger-ui/index.html` when the backend is running.

## Error Response

The frontend renders the `message` field and respects the returned HTTP status. Additional properties are permitted.

```json
{
  "timestamp": "2026-04-27T05:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/vacancies"
}
```

## Pagination Response

The frontend expects a Spring-style `PagedResponse<T>` wrapper object.

```json
{
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true
}
```

## Auth Behavior

Frontend Source Files:
- `frontend/src/services/auth.service.ts`
- `frontend/src/context/AuthContext.tsx`

Current Behavior:
- `login` and `register` persist the `accessToken` via `setToken()`.
- `logout` is frontend-only: clears the `cp_access_token` key.
- If a valid token is present, `AuthContext` requests `GET /auth/me`.
- Refresh token flow is fully active using secure HttpOnly cookies, protecting the user from session expiration.
- `authService.me()` is bypass-resistant.

### `POST /auth/login` — USED BY FRONTEND

Request `LoginRequest`:

```json
{
  "email": "alexander@careerpilot.ai",
  "password": "secret123"
}
```

Response `AuthResponse`:

```json
{
  "accessToken": "jwt-access-token",
  "user": {
    "id": "user1",
    "email": "alexander@careerpilot.ai",
    "name": "Alexander",
    "avatarUrl": null,
    "createdAt": "2024-01-01T09:00:00Z"
  }
}
```

### `POST /auth/register` — USED BY FRONTEND

Request `RegisterRequest`:

```json
{
  "name": "Alexander",
  "email": "alexander@careerpilot.ai",
  "password": "secret123"
}
```

Response: `AuthResponse`.

### `GET /auth/me` — USED BY FRONTEND

Response: `User`.

### `POST /auth/forgot-password` — USED BY FRONTEND

Request:

```json
{
  "email": "alexander@careerpilot.ai"
}
```

Response: `204 No Content`.

### `POST /auth/reset-password` — USED BY FRONTEND

Request:

```json
{
  "token": "reset-token",
  "password": "new-secret123"
}
```

Response: `204 No Content`.

## Domain Types and Enum Values

Frontend Source: `frontend/src/types/index.ts`.

Enum values must match the backend precisely, as both the UI and service layers expect these exact strings.

```text
CompanySize: STARTUP | SMALL | MEDIUM | LARGE | ENTERPRISE
VacancyStatus: ACTIVE | ARCHIVED | EXPIRED
RemoteType: REMOTE | HYBRID | ON_SITE
ContractType: FULL_TIME | PART_TIME | CONTRACT | FREELANCE | INTERNSHIP
ApplicationStatus: NEW | SAVED | APPLIED | HR_SCREEN | TECH_INTERVIEW | FINAL_ROUND | OFFER | REJECTED
InterviewType: PHONE | HR | TECHNICAL | SYSTEM_DESIGN | CULTURE_FIT | FINAL | OTHER
TaskPriority: LOW | MEDIUM | HIGH
TaskStatus: PENDING | IN_PROGRESS | DONE
AiResultType: VACANCY_ANALYSIS | RESUME_MATCH | COVER_LETTER | INTERVIEW_QUESTIONS | SKILL_GAP
NotificationType: INTERVIEW_REMINDER | TASK_DUE | APPLICATION_STATUS | AI_COMPLETE | SYSTEM
```

## Vacancies

Frontend Source: `frontend/src/services/vacancy.service.ts`.

### `GET /vacancies` — USED BY FRONTEND

Query Parameters:
- `page`
- `size`
- `sort`
- `direction`
- `search`
- `status`
- `remote`
- `companyId`
- `tag`

Response: `PagedResponse<Vacancy>`.

### `GET /vacancies/{id}` — USED BY FRONTEND

Response: `Vacancy`.

### `POST /vacancies` — USED BY FRONTEND SERVICE

Request `CreateVacancyDto`:

```json
{
  "title": "Senior Frontend Engineer",
  "companyId": "c1",
  "url": "https://example.com/jobs/frontend",
  "description": "Role description",
  "location": "Remote",
  "remote": "REMOTE",
  "salaryMin": 160000,
  "salaryMax": 200000,
  "salaryCurrency": "USD",
  "contractType": "FULL_TIME",
  "tagIds": ["t1", "t2"],
  "deadline": "2026-06-01T00:00:00Z"
}
```

Response: `Vacancy`.

### `PUT /vacancies/{id}` — USED BY FRONTEND SERVICE

Request: partial `CreateVacancyDto`.

Response: `Vacancy`.

### `DELETE /vacancies/{id}` — USED BY FRONTEND SERVICE

Response: `204 No Content`.

### `PATCH /vacancies/{id}/archive` — USED BY FRONTEND SERVICE

Request:

```json
{}
```

Response: `Vacancy` with `status: "ARCHIVED"`.

## Applications

Frontend Source: `frontend/src/services/application.service.ts`.

### `GET /applications` — USED BY FRONTEND SERVICE

Query Parameters:
- `page`
- `size`
- `status`
- `vacancyId`

Response: `PagedResponse<Application>`.

### `GET /applications/{id}` — USED BY FRONTEND SERVICE

Response: `Application`.

### `POST /applications` — USED BY FRONTEND

Request `CreateApplicationDto`:

```json
{
  "vacancyId": "v1",
  "status": "SAVED",
  "notes": "Interesting role",
  "appliedAt": "2024-02-03T10:00:00Z",
  "resumeId": "r1"
}
```

Response: `Application`.

### `PATCH /applications/{id}/status` — USED BY FRONTEND SERVICE

Request `UpdateApplicationStatusDto`:

```json
{
  "status": "TECH_INTERVIEW"
}
```

Response: `Application`.

### `PUT /applications/{id}` — USED BY FRONTEND SERVICE

Request: partial `CreateApplicationDto`.

Response: `Application`.

### `DELETE /applications/{id}` — USED BY FRONTEND SERVICE

Response: `204 No Content`.

### `GET /applications/board` — USED BY FRONTEND

Response: Object keyed by every `ApplicationStatus`.

```json
{
  "NEW": [],
  "SAVED": [],
  "APPLIED": [],
  "HR_SCREEN": [],
  "TECH_INTERVIEW": [],
  "FINAL_ROUND": [],
  "OFFER": [],
  "REJECTED": []
}
```

## Companies

Frontend Source: `frontend/src/services/company.service.ts`.

### `GET /companies` — USED BY FRONTEND

Query Parameters:
- `page`
- `size`
- `search`

Response: `PagedResponse<Company>`.

### `GET /companies/{id}` — USED BY FRONTEND SERVICE

Response: `Company`.

### `POST /companies` — USED BY FRONTEND SERVICE

Request `CreateCompanyDto`:

```json
{
  "name": "Stripe",
  "website": "https://stripe.com",
  "industry": "FinTech",
  "size": "LARGE",
  "location": "San Francisco, CA",
  "description": "Economic infrastructure for the internet.",
  "linkedinUrl": "https://www.linkedin.com/company/stripe",
  "logoUrl": "https://example.com/stripe.png"
}
```

Response: `Company`.

### `PUT /companies/{id}` — USED BY FRONTEND SERVICE

Request: partial `CreateCompanyDto`.

Response: `Company`.

### `DELETE /companies/{id}` — USED BY FRONTEND SERVICE

Response: `204 No Content`.

## AI Assistant

Frontend Source: `frontend/src/services/ai.service.ts`.

Response Wrapper:

```json
{
  "result": {
    "id": "ai1",
    "userId": "user1",
    "type": "VACANCY_ANALYSIS",
    "prompt": "Analyze vacancy",
    "result": "Markdown response",
    "vacancyId": "v1",
    "createdAt": "2024-02-02T10:00:00Z",
    "tokensUsed": 842
  }
}
```

### `POST /ai/analyze-vacancy` — USED BY FRONTEND

Request `AiAnalyzeVacancyDto`:

```json
{
  "vacancyId": "v1",
  "vacancyText": "Optional vacancy text"
}
```

Response: `AiResponse`.

### `POST /ai/resume-match` — USED BY FRONTEND

Request `AiResumeMatchDto`:

```json
{
  "vacancyId": "v1",
  "vacancyText": "Optional vacancy text",
  "resumeId": "r1",
  "resumeText": "Resume text pasted by user"
}
```

Response: `AiResponse`.

### `POST /ai/cover-letter` — USED BY FRONTEND

Request `AiCoverLetterDto`:

```json
{
  "vacancyId": "v1",
  "vacancyText": "Optional vacancy text",
  "resumeId": "r1",
  "resumeText": "Optional resume text",
  "tone": "PROFESSIONAL",
  "additionalContext": "Emphasize design systems"
}
```

Allowed `tone` values: `PROFESSIONAL`, `FRIENDLY`, `ENTHUSIASTIC`.

Response: `AiResponse`.

### `POST /ai/interview-questions` — USED BY FRONTEND

Request `AiInterviewQuestionsDto`:

```json
{
  "vacancyId": "v1",
  "vacancyText": "Optional vacancy text",
  "focusArea": "React performance",
  "count": 5
}
```

Response: `AiResponse`.

### `GET /ai/history` — USED BY FRONTEND

Optional Query Parameters:
- `type`: one `AiResultType`

Response: `AiResult[]`.

### `GET /ai/history/{id}` — USED BY FRONTEND SERVICE

Response: `AiResult`.

## Analytics

Frontend Source: `frontend/src/services/analytics.service.ts`.

### `GET /analytics/summary` — USED BY FRONTEND

Response `AnalyticsSummary`:

```json
{
  "totalApplications": 24,
  "activeApplications": 8,
  "interviewRate": 0.42,
  "offerRate": 0.08,
  "responseRate": 0.54,
  "avgTimeToInterview": 8.5,
  "funnel": [
    { "status": "NEW", "count": 3, "percentage": 12.5 }
  ],
  "weeklyActivity": [
    { "week": "Jan 8", "applied": 3, "interviews": 0, "offers": 0 }
  ],
  "topSkillGaps": [
    { "skill": "GraphQL", "frequency": 12, "hasSkill": false }
  ]
}
```

### `GET /analytics/companies` — USED BY FRONTEND

Response `CompanyAnalyticsItem[]`:

```json
[
  {
    "companyId": "uuid",
    "companyName": "Stripe",
    "logoUrl": "https://example.com/logo.png",
    "applicationCount": 5,
    "interviewCount": 2,
    "offerCount": 1,
    "responseRate": 0.8,
    "avgTimeToInterview": 7.5
  }
]
```

## Dashboard — USED BY FRONTEND

Frontend Source Files:
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/services/dashboard.service.ts`

### `GET /dashboard/summary` — USED BY FRONTEND

Response:

```json
{
  "kpis": {
    "activeVacancies": 14,
    "activeApplications": 8,
    "interviewsScheduled": 2,
    "aiInsightsThisWeek": 5
  },
  "upcomingInterviews": [],
  "tasks": [],
  "aiInsights": [],
  "notifications": []
}
```

## Interviews — USED BY FRONTEND

Frontend Source: `frontend/src/services/interview.service.ts`.

### `GET /interviews` — USED BY FRONTEND

Query Parameters:
- `page`
- `size`
- `sortBy`
- `direction`
- `q` (search query)

Response: `PagedResponse<Interview>`.

### `GET /interviews/{id}` — USED BY FRONTEND

Response: `Interview`.

```json
{
  "id": "uuid",
  "applicationId": "app1",
  "type": "TECHNICAL",
  "scheduledAt": "2024-05-20T10:00:00Z",
  "timezone": "Europe/Moscow",
  "meetingLink": "https://zoom.us/j/123",
  "notes": "Preparation: study system design",
  "result": "PENDING",
  "isSyncedWithGoogleCalendar": false,
  "vacancyTitle": "Senior Frontend Engineer",
  "companyName": "Stripe"
}
```

### `POST /interviews` — USED BY FRONTEND

Request `InterviewRequest`:

```json
{
  "applicationId": "app1",
  "type": "TECHNICAL",
  "scheduledAt": "2024-05-20T10:00:00Z",
  "timezone": "Europe/Moscow",
  "meetingLink": "https://zoom.us/j/123",
  "notes": "Preparation: study system design",
  "result": "PENDING"
}
```

Response: `Interview`.

### `PUT /interviews/{id}` — USED BY FRONTEND

Request: partial `InterviewRequest`.

Response: `Interview`.

### `DELETE /interviews/{id}` — USED BY FRONTEND

Response: `204 No Content`.

### `GET /interviews/{id}/export/ics` — USED BY FRONTEND

Response: Binary ICS file (text/calendar).

Headers:
- `Content-Type: text/calendar`
- `Content-Disposition: attachment; filename="interview-{id}.ics"`

Description: Exports a specific interview to standard ICS file format.

### `POST /interviews/{id}/sync/google` — USED BY FRONTEND

Response: `Interview`.

Description: Direct sync with Google Calendar API.

## Integrations — USED BY FRONTEND

Frontend Source: `frontend/src/services/integration.service.ts`.

### `GET /integrations/google-calendar/auth-url` — USED BY FRONTEND

Response:

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth..."
}
```

### `DELETE /integrations/google-calendar` — USED BY FRONTEND

Response: `204 No Content`.

## Tasks — USED BY FRONTEND

Frontend Source: `frontend/src/services/task.service.ts`.

### `GET /tasks` — USED BY FRONTEND

Query Parameters:
- `page`
- `size`
- `sortBy`
- `direction`
- `q` (search query)

Response: `PagedResponse<Task>`.

### `GET /tasks/{id}` — USED BY FRONTEND

Response: `Task`.

### `POST /tasks` — USED BY FRONTEND

Request `TaskRequest`:

```json
{
  "title": "Update resume",
  "description": "Add new project",
  "dueAt": "2024-05-25T10:00:00Z",
  "done": false,
  "priority": "HIGH",
  "applicationId": "app1"
}
```

Response: `Task`.

### `PUT /tasks/{id}` — USED BY FRONTEND

Request: partial `TaskRequest`.

Response: `Task`.

### `DELETE /tasks/{id}` — USED BY FRONTEND

Response: `204 No Content`.

### `PATCH /tasks/{id}/toggle` — USED BY FRONTEND

Response: `Task` with toggled `done` status.

## Settings, Preferences, Notifications — USED BY FRONTEND

Frontend Source Files:
- `SettingsPage.tsx`
- `settings.service.ts`
- `notification.service.ts`

### `GET /users/me` — USED BY FRONTEND

Response: `User` model with configuration details.

### `PUT /users/me` — USED BY FRONTEND

Request:

```json
{
  "name": "Alexander",
  "email": "alexander@careerpilot.ai",
  "location": "Remote"
}
```

### `DELETE /users/me` — USED BY FRONTEND

Request `DeleteAccountRequest`:

```json
{
  "password": "secret-password",
  "confirmation": "alexander@careerpilot.ai"
}
```

Response: `204 No Content`. Cascades and wipes out all associated data.

### `GET /preferences` — USED BY FRONTEND

Response:

```json
{
  "weeklyDigest": true,
  "interviewReminders": true,
  "aiProviderMode": "CLOUD",
  "language": "ru",
  "openAiApiKey": "sk-...",
  "openAiModel": "gpt-4o",
  "ollamaUrl": "http://localhost:11434",
  "ollamaModel": "llama3",
  "customAiProvider": "OPENAI",
  "geminiApiKey": "AIza...",
  "geminiModel": "gemini-1.5-flash"
}
```

Allowed `aiProviderMode` options: `LOCAL`, `CLOUD`, `BRING_YOUR_OWN_KEY`.

### `PUT /preferences` — USED BY FRONTEND

Request: partial values of `Preferences`.

Response: `Preferences`.

### `GET /notifications` — USED BY FRONTEND

Query Parameters:
- `page`
- `size`
- `read` (boolean filter)

Response: `PagedResponse<Notification>`.

### `PATCH /notifications/{id}/read` — USED BY FRONTEND

Response: `Notification` with read flag set to `true`.

## Profile and Resume

### `GET /resumes` — USED BY FRONTEND SERVICE

Response: `Resume[]`.

### `POST /resumes` — USED BY FRONTEND SERVICE

Request `ResumeRequest`:

```json
{
  "name": "Software Engineer Resume",
  "fileUrl": "https://example.com/resume.pdf",
  "textContent": "Resume text content",
  "isDefault": false
}
```

Response: `Resume`.

### `PATCH /resumes/{id}/default` — USED BY FRONTEND SERVICE

Response: `Resume` with `isDefault: true`.

### `DELETE /resumes/{id}` — USED BY FRONTEND SERVICE

Response: `204 No Content`.

## Export

### `GET /export/excel` — USED BY FRONTEND

Response: Binary Excel file (XLSX).

Headers:
- `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition: attachment; filename="careerpilot-export.xlsx"`

## Search

### `GET /search` — USED BY FRONTEND

Query Parameters:
- `q`: search query (minimum 2 chars)

Response `SearchResponse`:

```json
{
  "results": [
    {
      "id": "uuid",
      "type": "VACANCY",
      "title": "Senior Frontend Engineer",
      "subtitle": "Stripe",
      "status": "ACTIVE",
      "url": "/app/vacancies/uuid"
    }
  ]
}
```

## Page to Endpoint Mapping

| Page / Module | Active REST Requests |
| --- | --- |
| `LandingPage` | none |
| `AuthPages` | `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password` |
| `AuthContext` | `GET /auth/me` when valid JWT cookie exists |
| `DashboardPage` | `GET /dashboard/summary` |
| `VacanciesPage` | `GET /vacancies` |
| `VacancyDetailPage` | `GET /vacancies/{id}`, `GET /ai/history?type=VACANCY_ANALYSIS`, `POST /applications`, `POST /ai/analyze-vacancy` |
| `ApplicationsPage` | `GET /applications/board` |
| `TasksPage` | `GET /tasks`, `POST /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}` |
| `InterviewsPage` | `GET /interviews`, `POST /interviews`, `PUT /interviews/{id}`, `DELETE /interviews/{id}` |
| `CompaniesPage` | `GET /companies` |
| `AiAssistantPage` | `GET /ai/history`, `POST /ai/analyze-vacancy`, `POST /ai/resume-match`, `POST /ai/cover-letter`, `POST /ai/interview-questions` |
| `AnalyticsPage` | `GET /analytics/summary`, `GET /analytics/companies` |
| `SettingsPage` | `GET /users/me`, `PUT /users/me`, `GET /preferences`, `PUT /preferences`, `GET /resumes`, `POST /resumes`, `DELETE /resumes/{id}` |
