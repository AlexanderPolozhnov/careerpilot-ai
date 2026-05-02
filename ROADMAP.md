# CareerPilot AI Roadmap

## Статус проекта

CareerPilot AI находится в активной разработке. Это full-stack portfolio project с production-like architecture для
управления поиском работы, AI-assisted анализа вакансий и отслеживания откликов.

Roadmap отражает текущее состояние перед первым публичным GitHub commit. Planned items не считаются реализованными.

## Legend

- `[x]` готово
- `[~]` в процессе
- `[ ]` запланировано

## Phase 1 — Project Foundation

- [x] Monorepo-структура `backend/`, `frontend/`, `docs/`.
- [x] Backend project initialized with Spring Boot.
- [x] Frontend project initialized with React, TypeScript и Vite.
- [x] PostgreSQL выбран как primary database.
- [x] Docker Compose добавлен для локальной инфраструктуры.
- [x] Frontend-backend API contract вынесен в `docs/FRONTEND_BACKEND_CONTRACT.md`.
- [x] Modular monolith выбран как архитектурный подход.
- [x] Корневой `.gitignore` защищает `.env`, build artifacts, IDE configs и dependency folders.
- [x] MIT `LICENSE` добавлен.

## Phase 2 — Frontend Foundation

- [x] Application layout и защищенный app shell.
- [x] Routing через React Router.
- [x] Auth screens: login, register, forgot password.
- [x] Vacancy pages: list и detail view.
- [x] Application board UI.
- [x] Applications Kanban DnD UX polish (`DragOverlay`, cleaner horizontal columns, compact cards).
- [x] Company pages.
- [x] AI assistant pages.
- [x] Analytics UI.
- [x] i18n foundation: `ru` и `en` locale files, `LanguageSwitcher`, persistence в `localStorage`.
- [~] `DashboardPage`: заменить direct mock imports на backend-backed service.
- [~] `SettingsPage`: заменить mock/local-only поведение на backend-backed settings/preferences service.
- [ ] Frontend test runner и базовые component/service tests.

## Phase 3 — Backend Foundation

- [x] Spring Boot application structure.
- [x] Java 21 / Maven wrapper.
- [x] PostgreSQL и Flyway setup.
- [x] Domain-oriented module structure.
- [x] Dependencies for Spring Security, Spring Data JPA, MapStruct, Bean Validation, OpenAPI / Swagger.
- [x] Test stack dependencies: JUnit 5, Mockito, Testcontainers.
- [x] Authentication API (register/login/me endpoints with JWT).
- [x] GlobalExceptionHandler и unified error response format.
- [x] Vacancy API (list/detail/create/update/delete, user ownership, pagination).
- [x] Company API (list/detail/create/update/delete, user ownership, pagination).
- [x] Application API (board, PATCH status).
- [x] Analytics API (GET /api/analytics/summary).
- [ ] Application API (POST /applications, GET/PUT/DELETE /applications/{id}).
- [ ] AI provider abstraction и Ollama-oriented layer.
- [ ] Notification API alignment with frontend contract.
- [ ] Unified validation coverage across public endpoints.

## Phase 4 — Frontend/Backend Integration

- [x] Auth integration (JWT-based, token storage, protected routes, manual verification complete).
- [x] Vacancies integration (CRUD, pagination, ownership, frontend verified).
- [x] Companies integration (CRUD, pagination, ownership, frontend verified).
- [x] Analytics integration (summary endpoint, frontend verified).
- [~] Applications integration (board + status change working, POST/GET/PUT/DELETE pending).
- [ ] AI assistant integration.
- [ ] Dashboard integration (replacing mock data with backend services).
- [ ] Settings/preferences integration.
- [ ] Notifications integration.
- [ ] Manual API smoke scenarios documented and verified.

## Phase 5 — AI Features

- [~] Provider abstraction.
- [~] Ollama as default local provider.
- [~] AI response caching.
- [~] Prompt templates.
- [ ] `POST /ai/analyze-vacancy` aligned with frontend contract.
- [ ] `POST /ai/resume-match` aligned with frontend contract.
- [ ] `POST /ai/cover-letter` aligned with frontend contract.
- [ ] `POST /ai/interview-questions` aligned with frontend contract.
- [ ] AI history endpoints.
- [ ] Cost/latency/error metrics for AI calls.

## Phase 6 — Production Readiness

- [ ] OpenAPI documentation reviewed against the frontend contract.
- [ ] Backend validation/error handling finalized.
- [ ] Testcontainers integration tests stable in local Docker environment.
- [ ] Frontend error boundaries.
- [ ] Frontend tests.
- [ ] CI pipeline with GitHub Actions.
- [ ] Full-stack Docker Compose setup.
- [ ] Deployment notes.
- [ ] Security hardening: refresh/revocation strategy, rate limits for AI endpoints, audit trail.

## Current Development Focus

- [x] Auth vertical slice реализован и проверен.
- [x] Vacancies vertical slice реализован и проверен.
- [x] Companies vertical slice реализован и проверен.
- [x] Analytics vertical slice реализован и проверен.
- [~] Applications vertical slice в процессе (board + status ready, CRUD pending).
- [ ] Приоритет: Applications CRUD → AI → Dashboard/Settings.
- [ ] Каждый slice должен соответствовать контракту из `docs/FRONTEND_BACKEND_CONTRACT.md`.
- [ ] Замена mock-only зон реальными backend-backed сервисами.

## Backend endpoints first

### Auth

- [x] `POST /api/auth/login`
- [x] `POST /api/auth/register`
- [x] `GET /api/auth/me`
- [ ] `POST /api/auth/forgot-password`
- [ ] `POST /api/auth/reset-password`

### Vacancies

- [x] `GET /api/vacancies`
- [x] `GET /api/vacancies/{id}`
- [x] `POST /api/vacancies`
- [x] `PUT /api/vacancies/{id}`
- [x] `DELETE /api/vacancies/{id}`

### Companies

- [x] `GET /api/companies`
- [x] `GET /api/companies/{id}`
- [x] `POST /api/companies`
- [x] `PUT /api/companies/{id}`
- [x] `DELETE /api/companies/{id}`

### Applications

- [x] `GET /api/applications/board`
- [x] `PATCH /api/applications/{id}/status`
- [ ] `POST /api/applications`
- [ ] `GET /api/applications`
- [ ] `GET /api/applications/{id}`
- [ ] `PUT /api/applications/{id}`
- [ ] `DELETE /api/applications/{id}`

### Analytics

- [x] `GET /api/analytics/summary`

### AI

- [ ] `GET /api/ai/history`
- [ ] `POST /api/ai/analyze-vacancy`
- [ ] `POST /api/ai/resume-match`
- [ ] `POST /api/ai/cover-letter`
- [ ] `POST /api/ai/interview-questions`

### Dashboard

- [ ] `GET /api/dashboard/summary`

### Settings & Preferences

- [ ] `GET /api/preferences`
- [ ] `PUT /api/preferences`
- [ ] `GET /api/notifications`
- [ ] `PATCH /api/notifications/{id}/read`

## Known limitations

- [x] Часть frontend работает через `VITE_USE_MOCKS=true` и mock data.
- [x] `DashboardPage` напрямую использует mock data и пока не вызывает backend.
- [x] `SettingsPage` использует mock/local-only поведение и пока не сохраняет настройки через backend.
- [x] `authService.me()` не mock-aware: при сохраненном token может вызвать `GET /auth/me` даже в mock mode.
- [~] Некоторые backend controllers уже существуют, но еще не полностью совпадают с frontend contract (Auth
  login/register/me уже выровнен).
- [x] Backend tests зависят от Testcontainers и требуют доступный Docker runtime.
- [x] GitHub Actions пока запланирован, но не настроен.
