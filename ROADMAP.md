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
- [x] Vacancy pages: list и detail view, включая полные формы создания/редактирования.
- [x] Application board UI.
- [x] Applications Kanban DnD UX polish (`DragOverlay`, cleaner horizontal columns, compact cards).
- [x] Company pages.
- [x] AI assistant pages (с улучшенной валидацией).
- [x] Analytics UI (с интеграцией API для skill gaps).
- [x] i18n foundation: `ru` и `en` locale files, `LanguageSwitcher`, persistence в `localStorage`.
- [x] `DashboardPage`: заменить direct mock imports на backend-backed service.
- [x] `SettingsPage`: заменить mock/local-only поведение на backend-backed settings/preferences service.
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
- [x] Application API (POST /applications, GET/PUT/DELETE /applications/{id}).
- [x] AI provider abstraction и Ollama-oriented layer (с fallback-заглушкой).
- [x] Notification API alignment with frontend contract.
- [ ] Unified validation coverage across public endpoints.

## Phase 4 — Frontend/Backend Integration

- [x] Auth integration (JWT-based, token storage, protected routes, manual verification complete).
- [x] Vacancies integration (CRUD, pagination, ownership, frontend verified, включая формы).
- [x] Companies integration (CRUD, pagination, ownership, frontend verified).
- [x] Analytics integration (summary endpoint, frontend verified, включая skill gaps).
- [x] Applications integration (board + status change working, POST/GET/PUT/DELETE реализованы).
- [x] AI assistant integration (с улучшенной валидацией).
- [x] Dashboard integration (replacing mock data with backend services).
- [x] Settings/preferences integration.
- [x] Notifications integration.
- [x] Manual API smoke scenarios documented and verified (`docs/SMOKE_SCENARIOS.md`).

## Phase 5 — AI Features

- [x] Provider abstraction (LlmProvider interface + OllamaLlmProvider with fallback).
- [x] Ollama as default local provider.
- [x] AI response caching.
- [x] Prompt templates.
- [x] `POST /ai/analyze-vacancy` aligned with frontend contract.
- [x] `POST /ai/resume-match` aligned with frontend contract.
- [x] `POST /ai/cover-letter` aligned with frontend contract.
- [x] `POST /ai/interview-questions` aligned with frontend contract.
- [x] AI history endpoints (`GET /ai/history`, `GET /ai/history/{id}`).
- [ ] Cost/latency/error metrics for AI calls.

## Phase 6 — Production Readiness

- [ ] OpenAPI documentation reviewed against the frontend contract.
- [ ] Backend validation/error handling finalized.
- [ ] Testcontainers integration tests stable in local Docker environment.
- [x] Frontend error boundaries.
- [ ] Frontend tests.
- [x] CI pipeline with GitHub Actions.
- [ ] Full-stack Docker Compose setup.
- [ ] Deployment notes.
- [ ] Security hardening: refresh/revocation strategy, rate limits for AI endpoints, audit trail.

## Current Development Focus

- [x] Все основные vertical slices реализованы и базово проверены.
- [ ] Замена оставшихся mock-only зон реальными backend-backed сервисами.
- [ ] Устранение известных проблем (Known UX/Technical Issues).

## Known UX/Technical Issues (Post-release v0.1.0-alpha)

- [x] **Analytics:** Нет перевода "Week" в блоке "Активность за неделю".
- [ ] **Analytics:** Отклик может отображаться в неправильной неделе.
- [x] **Dashboard:** Неактивный dropdown аккаунта в header.
- [x] **Global Search:** Непонятное назначение глобального поиска в header (рекомендуется убрать до реализации).
- [x] **Sidebar:** Блок "Совет" показывает статичный текст.
- [x] **Vacancies:** Неверные названия кнопок действий ("Сохранить" -> "В избранное").
- [x] **Companies:** Нет UI для создания компании (хотя backend endpoint существует).
- [x] **AI Assistant:** Новый анализ перезаписывает предыдущий, нет истории.
- [x] **AI Assistant:** Лишняя кнопка "Сгенерировать" в панели AI на странице вакансии.

## Releases

### v0.2.0-alpha — UI Redesign & Polish

**Статус:** Релиз v0.2.0-alpha. Полная переработка интерфейса вдохновлена Linear / Vercel / Clerk.

Что нового:
- **Landing page:** hero section, bento features, CTA.
- **Auth:** split-screen layout с branding panel.
- **App Shell:** Sidebar, Topbar, Toast redesign.
- **Vacancies:** list/detail cards, полная форма создания/редактирования.
- **AI Assistant:** tool selector, dynamic form panel.
- **Analytics:** KPI cards, funnel, weekly chart.
- **Settings:** секции с gradient icons.
- **Companies:** реализована форма создания/редактирования компании.

**Тег:** `v0.2.0-alpha`
**Ветка:** `main`
**Live demo:** https://careerpilot-ai-sigma.vercel.app
