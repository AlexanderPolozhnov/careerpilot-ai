# CareerPilot AI — контракт Frontend/Backend

Документ фиксирует контракт между текущим frontend service layer (`frontend/src/services/*.ts`) и целевым Spring Boot REST API. Человекочитаемые пояснения написаны на русском, а endpoint paths, HTTP methods, DTO names, enum values и technical identifiers оставлены без перевода.

Контракт описывает ожидаемое поведение frontend при `VITE_USE_MOCKS=false`. Это не означает, что каждый endpoint уже полностью реализован в backend.

## Статусы endpoints

- `USED BY FRONTEND` - endpoint вызывается текущим frontend service layer.
- `USED BY FRONTEND SERVICE` - endpoint есть в service layer, но может не иметь route-level UI сценария прямо сейчас.
- `TARGET/TODO` - endpoint нужен для замены mock-only или local-only зон, но текущий frontend service layer его еще не вызывает.
- `FUTURE TODO` - типы уже есть во frontend, но pages/service calls пока отсутствуют.

## Conventions

- Base URL для backend: `/api`.
- Frontend env: `VITE_API_BASE_URL`, default in code: `http://localhost:8080/api`.
- Все paths ниже указаны относительно `/api`.
- Auth header: `Authorization: Bearer <accessToken>`.
- Access token хранится в `localStorage` под ключом `cp_access_token`.
- Request/response format: JSON.
- Date/time format: ISO-8601 string, например `2026-04-27T05:00:00Z`.
- Pagination query params: `page` is 0-based, `size` is page size.
- Sorting query params: `sort`, `direction` with `ASC` or `DESC`.
- Undefined/empty filters frontend не отправляет.

## Error response

Frontend отображает `message` и учитывает HTTP status. Дополнительные поля допустимы.

```json
{
  "timestamp": "2026-04-27T05:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/vacancies"
}
```

## Pagination response

Frontend ожидает Spring-style `PagedResponse<T>`.

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

## Auth behavior

Frontend source:

- `frontend/src/services/auth.service.ts`
- `frontend/src/context/AuthContext.tsx`

Текущее поведение:

- `login` и `register` сохраняют `accessToken` через `setToken()`.
- `logout` frontend-only: удаляет `cp_access_token`.
- При наличии token `AuthContext` вызывает `GET /auth/me`.
- Refresh token flow пока отсутствует: нет `refreshToken`, `/auth/refresh` и refresh retry logic.
- `authService.me()` сейчас не mock-aware.

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

## Domain types and enum values

Frontend source: `frontend/src/types/index.ts`.

Enum values должны совпадать с backend, потому что UI и service layer ожидают эти exact strings.

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

Frontend source: `frontend/src/services/vacancy.service.ts`.

### `GET /vacancies` — USED BY FRONTEND

Query params:

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

Frontend source: `frontend/src/services/application.service.ts`.

### `GET /applications` — USED BY FRONTEND SERVICE

Query params:

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

Response: object keyed by every `ApplicationStatus`.

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

Frontend source: `frontend/src/services/company.service.ts`.

### `GET /companies` — USED BY FRONTEND

Query params:

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

## AI assistant

Frontend source: `frontend/src/services/ai.service.ts`.

Response wrapper:

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

Allowed `tone`: `PROFESSIONAL`, `FRIENDLY`, `ENTHUSIASTIC`.

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

Optional query params:

- `type`: one `AiResultType`

Response: `AiResult[]`.

### `GET /ai/history/{id}` — USED BY FRONTEND SERVICE

Response: `AiResult`.

## Analytics

Frontend source: `frontend/src/services/analytics.service.ts`.

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

## Dashboard — TARGET/TODO

Текущее состояние:

- `DashboardPage` импортирует `mockDashboard`, `mockAiResults`, `mockInterviews`, `mockNotifications` и `mockTasks` напрямую из `src/mock/data.ts`.
- `dashboard.service.ts` сейчас отсутствует.
- Endpoint ниже нужен для замены direct mock imports.

### `GET /dashboard/summary` — TARGET/TODO

Target response:

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

## Settings, preferences, notifications — TARGET/TODO

Текущее состояние:

- `SettingsPage` использует `useAuth()` user data plus fallback `mockUser`.
- Сохранение настроек local-only.
- Recent notifications читаются из `mockNotifications`.
- Endpoints ниже пока не вызываются `src/services/*.ts`.

### `GET /users/me` — TARGET/TODO

Target response: `User` plus optional settings fields.

### `PUT /users/me` — TARGET/TODO

Target request:

```json
{
  "name": "Alexander",
  "email": "alexander@careerpilot.ai",
  "location": "Remote"
}
```

### `GET /preferences` — TARGET/TODO

Target response:

```json
{
  "weeklyDigest": true,
  "interviewReminders": true,
  "aiProviderMode": "CLOUD",
  "language": "ru"
}
```

### `PUT /preferences` — TARGET/TODO

Target request: same shape as `GET /preferences` response.

Allowed `aiProviderMode`: `LOCAL`, `CLOUD`, `BRING_YOUR_OWN_KEY`.

### `GET /notifications` — TARGET/TODO

Query params:

- `page`
- `size`
- `read`

Response: `PagedResponse<Notification>`.

### `PATCH /notifications/{id}/read` — TARGET/TODO

Response: `Notification`.

## Profile and resume — FUTURE TODO

Frontend state:

- `Profile` и `Resume` types есть в `frontend/src/types/index.ts`.
- Route-level pages и service calls для profile/resume сейчас отсутствуют.
- Эти endpoints не должны блокировать текущий frontend-backend merge.

### `GET /profile/me` — FUTURE TODO

Response: `Profile`.

### `PUT /profile/me` — FUTURE TODO

Request/response: `Profile`.

### `GET /resumes` — FUTURE TODO

Response: `Resume[]`.

### `POST /resumes` — FUTURE TODO

Request shape пока не финализирован во frontend.

### `PATCH /resumes/{id}/default` — FUTURE TODO

Response: `Resume`.

### `DELETE /resumes/{id}` — FUTURE TODO

Response: `204 No Content`.

## Page to endpoint mapping

| Page / module | Current API calls |
| --- | --- |
| `LandingPage` | none |
| `AuthPages` | `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password` |
| `AuthContext` | `GET /auth/me` when stored token exists |
| `DashboardPage` | direct mocks only; `GET /dashboard/summary` is `TARGET/TODO` |
| `VacanciesPage` | `GET /vacancies` |
| `VacancyDetailPage` | `GET /vacancies/{id}`, `GET /ai/history?type=VACANCY_ANALYSIS`, `POST /applications`, `POST /ai/analyze-vacancy` |
| `ApplicationsPage` | `GET /applications/board` |
| `CompaniesPage` | `GET /companies`, `GET /vacancies` |
| `AiAssistantPage` | `GET /ai/history`, `POST /ai/analyze-vacancy`, `POST /ai/resume-match`, `POST /ai/cover-letter`, `POST /ai/interview-questions` |
| `AnalyticsPage` | `GET /analytics/summary` |
| `SettingsPage` | direct mocks/local form state only; settings endpoints are `TARGET/TODO` |

## Merge readiness risks

- Backend enum values must match frontend UPPER_SNAKE_CASE values.
- Backend pagination fields must match `PagedResponse<T>`.
- Backend error payload should include `message`.
- `DashboardPage` and `SettingsPage` remain mock/local-only zones.
- `authService.me()` is not mock-aware.
- Frontend has no refresh-token handling.
- Frontend tests are not configured yet; current confidence relies on lint/build plus manual API testing.
