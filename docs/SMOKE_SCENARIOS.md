# CareerPilot AI — Manual API Smoke Scenarios

Документ описывает ручные smoke-сценарии для каждого реализованного vertical slice.

**Предусловие для всех сценариев:** пользователь залогинен как demo user (`demo@careerpilot.ai` / `demo123`),
`cp_access_token` сохранён в `localStorage`, все запросы содержат заголовок `Authorization: Bearer <accessToken>`.

**Окружение:**

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`
- API base: `http://localhost:8080/api`
- `VITE_USE_MOCKS=false`

---

## Auth

**Предусловие:** пользователь не залогинен, backend запущен, БД доступна.

1. `POST /api/auth/register` — тело `{ "name": "Demo", "email": "new@test.com", "password": "secret123" }` → `200` +
   `{ accessToken, user }`.
2. `POST /api/auth/login` — тело `{ "email": "demo@careerpilot.ai", "password": "demo123" }` → `200` +
   `{ accessToken, user }`.
3. `GET /api/auth/me` — заголовок `Authorization: Bearer <accessToken>` → `200` + объект
   `{ id, email, name, avatarUrl, createdAt }`.
4. `GET /api/auth/me` без токена → `401 Unauthorized`.
5. `POST /api/auth/login` с неверным паролем → `401` + `{ message }`.

**Ожидаемый результат:** токен сохраняется в `localStorage` под ключом `cp_access_token`, защищённые маршруты
открываются, logout очищает токен.

✅ Verified manually

---

## Vacancies

**Предусловие:** demo user залогинен.

1. `GET /api/vacancies` → `200` + `PagedResponse<Vacancy>` (поля: `content`, `totalElements`, `totalPages`, `size`,
   `number`, `first`, `last`).
2. `POST /api/vacancies` — тело
   `{ "title": "Senior Java Developer", "location": "Remote", "remote": "REMOTE", "contractType": "FULL_TIME" }` →
   `201` + объект `Vacancy` с `id`.
3. `GET /api/vacancies/{id}` — id из шага 2 → `200` + объект `Vacancy`.
4. `PUT /api/vacancies/{id}` — тело `{ "title": "Lead Java Developer" }` → `200` + обновлённый `Vacancy`.
5. `DELETE /api/vacancies/{id}` → `204 No Content`.
6. `GET /api/vacancies/{id}` после удаления → `404 Not Found`.
7. `GET /api/vacancies` от другого пользователя → возвращает только его вакансии (ownership).

**Ожидаемый результат:** CRUD работает, данные сохраняются в PostgreSQL, пагинация соответствует контракту, пользователь
видит только свои вакансии.

✅ Verified manually

---

## Companies

**Предусловие:** demo user залогинен.

1. `GET /api/companies` → `200` + `PagedResponse<Company>`.
2. `POST /api/companies` — тело
   `{ "name": "Stripe", "website": "https://stripe.com", "industry": "FinTech", "size": "LARGE" }` → `201` + объект
   `Company` с `id`.
3. `GET /api/companies/{id}` — id из шага 2 → `200` + объект `Company`.
4. `PUT /api/companies/{id}` — тело `{ "name": "Stripe Inc." }` → `200` + обновлённый `Company`.
5. `DELETE /api/companies/{id}` → `204 No Content`.
6. `GET /api/companies/{id}` после удаления → `404 Not Found`.

**Ожидаемый результат:** CRUD работает, `CompanySize` enum принимает значения `STARTUP|SMALL|MEDIUM|LARGE|ENTERPRISE`,
ownership-проверка через `findByIdAndUserId`.

✅ Verified manually

---

## Applications

**Предусловие:** demo user залогинен, существует хотя бы одна вакансия.

1. `GET /api/applications/board` → `200` + объект с ключами всех статусов `ApplicationStatus` (`NEW`, `SAVED`,
   `APPLIED`, `HR_SCREEN`, `TECH_INTERVIEW`, `FINAL_ROUND`, `OFFER`, `REJECTED`).
2. `POST /api/applications` — тело `{ "vacancyId": "<id>", "status": "SAVED", "notes": "Interesting role" }` → `201` +
   объект `Application`.
3. `GET /api/applications` → `200` + `PagedResponse<Application>`.
4. `GET /api/applications/{id}` → `200` + объект `Application`.
5. `PATCH /api/applications/{id}/status` — тело `{ "status": "TECH_INTERVIEW" }` → `200` + обновлённый `Application`.
6. `PUT /api/applications/{id}` — тело `{ "notes": "Updated notes" }` → `200` + обновлённый `Application`.
7. `DELETE /api/applications/{id}` → `204 No Content`.
8. Drag-and-drop в Kanban board → статус обновляется через `PATCH /api/applications/{id}/status`, optimistic update без
   page refresh.

**Ожидаемый результат:** board возвращает 8 бакетов, CRUD работает, смена статуса через DnD сохраняется в PostgreSQL.

✅ Verified manually

---

## AI

**Предусловие:** demo user залогинен, backend запущен (Ollama опционален — при недоступности срабатывает fallback).

1. `POST /api/ai/analyze-vacancy` — тело `{ "vacancyId": "<id>" }` → `200` +
   `{ "result": { id, type, prompt, result, createdAt } }`.
2. `POST /api/ai/resume-match` — тело `{ "vacancyId": "<id>", "resumeText": "..." }` → `200` + `{ "result": { ... } }`.
3. `POST /api/ai/cover-letter` — тело `{ "vacancyId": "<id>", "tone": "PROFESSIONAL" }` → `200` +
   `{ "result": { ... } }`.
4. `POST /api/ai/interview-questions` — тело `{ "vacancyId": "<id>", "count": 5 }` → `200` + `{ "result": { ... } }`.
5. `GET /api/ai/history` → `200` + массив `AiResult[]` только текущего пользователя.
6. `GET /api/ai/history?type=VACANCY_ANALYSIS` → `200` + отфильтрованный массив.
7. `GET /api/ai/history/{id}` — id из шага 1 → `200` + объект `AiResult`.
8. `GET /api/ai/history/{id}` с чужим id → `404 Not Found`.

**Ожидаемый результат:** все 4 генерации возвращают markdown-текст (через Ollama или fallback), история сохраняется в
БД, ownership соблюдён.

✅ Verified manually

---

## Analytics

**Предусловие:** demo user залогинен, в БД есть данные (seed или созданные вручную).

1. `GET /api/analytics/summary` → `200` + объект `AnalyticsSummary` с полями: `totalApplications`, `activeApplications`,
   `interviewRate`, `offerRate`, `responseRate`, `avgTimeToInterview`, `funnel[]`, `weeklyActivity[]`, `topSkillGaps[]`.
2. `funnel` содержит записи для каждого статуса `ApplicationStatus` с полями `status`, `count`, `percentage`.

**Ожидаемый результат:** endpoint возвращает агрегированную статистику по текущему пользователю, `AnalyticsPage`
отображает данные без ошибок.

⚠️ Partial — endpoint реализован и возвращает данные (подтверждено в рамках seed diagnostics: funnel 8 statuses), полный
ручной UI smoke отдельно не задокументирован.

---

## Dashboard

**Предусловие:** demo user залогинен.

1. `GET /api/dashboard/summary` → `200` + объект с полями: `kpis` (`activeVacancies`, `activeApplications`,
   `interviewsScheduled`, `aiInsightsThisWeek`), `upcomingInterviews[]`, `tasks[]`, `aiInsights[]`, `notifications[]`.
2. `DashboardPage` открывается без ошибок, KPI-блоки отображают реальные данные из backend.
3. Кнопка "View All" (AI insights) → переход на `/ai-assistant`.

**Ожидаемый результат:** `DashboardPage` полностью подключён к `GET /api/dashboard/summary` через React Query, mock
imports удалены, skeleton-loading работает.

✅ Verified manually

---

## Settings

**Предусловие:** demo user залогинен.

1. `GET /api/users/me` → `200` + объект `User` с полями `id`, `email`, `name`, `avatarUrl`, `createdAt`, `location`.
2. `PUT /api/users/me` — тело `{ "name": "Demo Updated", "email": "demo@careerpilot.ai", "location": "Remote" }` →
   `200` + обновлённый `User`.
3. `GET /api/preferences` → `200` + объект `{ weeklyDigest, interviewReminders, aiProviderMode, language }`.
4. `PUT /api/preferences` — тело `{ "weeklyDigest": false, "aiProviderMode": "LOCAL", "language": "ru" }` → `200` +
   обновлённые preferences.
5. `SettingsPage` открывается, форма профиля и форма настроек заполнены реальными данными, сохранение показывает success
   feedback.

**Ожидаемый результат:** обе формы (`profileForm`, `prefsForm`) работают через React Query + useMutation, данные
сохраняются в PostgreSQL, mock/local-only поведение устранено.

✅ Verified manually

---

## Notifications

**Предусловие:** demo user залогинен, в БД есть уведомления (seed или созданные системой).

1. `GET /api/notifications` → `200` + `PagedResponse<Notification>` с полями `id`, `type`, `title`, `body`, `read`,
   `createdAt`.
2. `GET /api/notifications?read=false` → `200` + только непрочитанные уведомления.
3. `PATCH /api/notifications/{id}/read` → `200` + обновлённый объект `Notification` с `read: true`.
4. `PATCH /api/notifications/{id}/read` с чужим id → `404 Not Found`.
5. `SettingsPage` → блок Recent Notifications отображает реальные уведомления, кнопка "Mark read" обновляет статус через
   React Query.

**Ожидаемый результат:** пагинация и фильтр по `read` работают, ownership соблюдён, `mockNotifications` в `SettingsPage`
заменён на backend-backed данные.

✅ Verified manually
