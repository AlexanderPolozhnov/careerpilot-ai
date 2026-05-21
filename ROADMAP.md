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
- [x] Frontend test runner и базовые component/service tests.

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
- [x] OAuth2 Social Login.
- [x] Notification API alignment with frontend contract.
- [x] Unified validation coverage across public endpoints.

## Phase 4 — Frontend/Backend Integration

- [x] Auth integration (JWT-based, token storage, protected routes, manual verification complete).
- [x] Vacancies integration (CRUD, pagination, ownership, frontend verified, включая формы и поддержку тегов).
- [x] Companies integration (CRUD, pagination, ownership, frontend verified).
- [x] Analytics integration (summary endpoint, frontend verified, включая skill gaps и реальные метрики).
- [x] Applications integration (board + status change working, POST/GET/PUT/DELETE реализованы, включая отслеживание времени интервью).
- [x] AI assistant integration (с улучшенной валидацией).
- [x] Dashboard integration (replacing mock data with backend services).
- [x] Settings/preferences integration.
- [x] Notifications integration.
- [x] Profile API integration.
- [x] Resume Management (CRUD, default resume logic).
- [x] Resume UI implementation (Settings section).
- [x] Interview UI implementation (Dedicated page + CRUD).
- [x] Password Reset via Email (Full flow).
- [x] Manual API smoke scenarios documented and verified (`docs/SMOKE_SCENARIOS.md`).
- [x] **Real Analytics Metrics:** расчет Skill Gaps и среднего времени до интервью на основе реальных данных.
- [x] **Vacancy Tags UI:** поддержка добавления и редактирования тегов (навыков) в вакансиях.
- [x] **Application Status History:** запись и визуализация таймлайна изменения статусов отклика (Timeline).
- [x] **Timeline UI Polish:** i18n для всех статусов ApplicationStatus, мгновенные CSS-тултипы с i18n ключом, стилизация кнопки истории в фиолетовом акценте проекта.
- [x] **Analytics & UI Bugfixes:** исправлена ошибка LazyInitializationException, устранены React key warnings, оптимизирована загрузка данных (N+1).

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
- [x] Cost/latency/error metrics for AI calls.

## Phase 6 — Production Readiness

- [x] OpenAPI documentation reviewed against the frontend contract.
- [x] Backend validation/error handling finalized.
- [x] Testcontainers integration tests stable in local Docker environment.
- [x] Frontend error boundaries.
- [x] Frontend tests.
- [x] CI pipeline with GitHub Actions.
- [x] **Frontend Linting & Build Hardening:** полное устранение ошибок ESLint и предупреждений рендеринга.
- [x] Full-stack Docker Compose setup.
- [x] **Global Search:** единый поиск по всем сущностям (Cmd+K).
- [x] **Scheduled Notifications:** автоматические напоминания о задачах и собеседованиях.
- [x] Deployment notes.
- [x] Security hardening: refresh/revocation strategy [x], rate limits for AI endpoints [x], audit trail [x], password creation/update for OAuth2 users [x], secure account deletion [x].
- [x] **Application Status Notifications:** автоматические In-app и Email уведомления при изменении статуса отклика.

## Current Development Focus

- [x] Интеграция AI для генерации текстов резюме.
- [x] Оптимизация производительности фронтенда (Code Splitting).
- [x] AI Assistant UX Polish: выбор резюме, автозаполнение, улучшенная валидация, индивидуальные заголовки инструментов.

## Known UX/Technical Issues (Post-release v0.6.0-alpha)

Нет известных проблем.

## Releases

### v0.8.0-alpha — Dynamic AI Provider Configuration

**Статус:** Выпущено (Текущая версия).

Что нового:
- [x] **Dynamic AI Switching:** переключение между LOCAL (Ollama), CLOUD (System OpenAI) и BRING_YOUR_OWN_KEY в реальном времени.
- [x] **Personalized Settings:** сохранение API-ключей и кастомных URL для Ollama в профиле пользователя.
- [x] **Provider Factory:** архитектурный переход на фабрику провайдеров на бэкенде.
- [x] **Docker-ready AI:** возможность легко менять URL для Ollama прямо в UI для корректной работы внутри контейнеров.

**Тег:** `v0.8.0-alpha`
**Дата:** 2026-05-22

### v0.7.0-alpha — Advanced AI Prompting & Markdown

**Статус:** Выпущено (Текущая версия).

Что нового:
- [x] **Advanced Prompt Engineering:** Внедрение экспертных персон (recruiter, ATS, coach) и строгих правил форматирования для всех AI-инструментов.
- [x] **External Prompt Templates:** Перенос промптов в локализованные Markdown-файлы (`prompts/ru/*.md`) для легкого редактирования и 100% перевода заголовков.
- [x] **Markdown Rendering:** Полноценное отображение форматированных ответов ИИ на фронтенде с помощью `react-markdown`.
- [x] **Clean History Previews:** Автоматическая очистка Markdown-разметки в компактном списке истории запросов.
- [x] **Language Integration:** Автоматическое определение языка ответа на основе `Preferences` пользователя.

**Тег:** `v0.7.0-alpha`
**Дата:** 2026-05-22

### v0.6.0-alpha — Test Automation & Stability

**Статус:** Выпущено (Текущая версия).

Что нового:
- [x] **Backend Integration Testing:** Полностью стабилизированы интеграционные тесты с использованием Testcontainers (PostgreSQL, Redis).
- [x] **Frontend Test Runner:** Развернута и настроена среда тестирования для React-приложения (Vitest / Testing Library).
- [x] **Component & Service Coverage:** Добавлены базовые unit- и интеграционные тесты для критически важных фронтенд-сервисов (Auth, API Client) и UI-компонентов.
- [x] **CI/CD Hardening:** GitHub Actions теперь полностью запускает весь тестовый сценарий для фронтенда и бэкенда при каждом Pull Request.

**Тег:** `v0.6.0-alpha`
**Дата:** 2026-05-21

### v0.5.0-alpha — Observability & Quality Hardening

**Статус:** Выпущено.

Что нового:
- [x] **AI Observability:** сбор метрик (latency, tokens, error tracking) для всех AI-запросов.
- [x] **AI Assistant UX Polish:** замена ручного ввода ID вакансии на выбор из списка с автозаполнением описания.
- [x] **Scheduled Notifications:** фоновый процесс для создания напоминаний о дедлайнах задач и собеседований (In-app + Email).
- [x] **Settings Integration:** полная синхронизация настроек (Preferences) с бэкендом, включая новый тумблер управления напоминаниями о задачах (`taskReminders`).
- [x] **Vacancy Archive Endpoint:** реализован `PATCH /api/vacancies/{id}/archive` (закрыт последний `TODO` из контракта Vacancies).
- [x] **Vacancy UI Polish:** добавлена кнопка архивации, кнопка возврата из архива и визуальное "затухание" (dimming) для архивированных вакансий в списке.
- [x] **Secure Account Deletion:** реализован защищенный процесс удаления аккаунта с подтверждением пароля и email.
- [x] **CI/CD Fixes:** исправлены ошибки типизации TS в AuthContext и обновлены тесты ReminderScheduler.

**Тег:** `v0.5.0-alpha`
**Дата:** 2026-05-21

### v0.4.0-alpha — Email, Real Analytics & Tags

**Статус:** Выпущено (Текущая версия).

Что нового:
- **Password Reset:** полноценный флоу сброса пароля через реальный Email (SMTP + HTML шаблоны).
- **Real Analytics:** расчет Skill Gaps и Time to Interview на основе реальных данных профиля и откликов.
- **Vacancy Tags:** поддержка тегов в вакансиях для связи с аналитикой.
- **UI/UX Polish:** исправление десериализации дат, устранение ворнингов React, приведение тулбаров к единому стилю.
- **Security:** фикс утечки сессий OAuth2.

### v0.3.0-alpha — Tasks, Global Search & Security Hardening

**Статус:** Выпущено (Релиз v0.3.0-alpha опубликован на GitHub).

Что нового:
- **Tasks:** полноценный CRUD, пагинация, фильтры по приоритетам (включая URGENT), привязка к Applications.
- **Global Search:** единая система поиска по вакансиям, компаниям, задачам и собеседованиям с поддержкой горячих клавиш (`Cmd+K` / `Ctrl+K`).
- **Security Hardening:** поддержка Refresh Tokens через HttpOnly Cookies, ограничение частоты запросов к AI (Rate Limiting via Bucket4j), логирование действий пользователей (Audit Trail).
- **Dashboard:** интерактивный список задач с быстрым toggle done.
- **Sidebar:** новый раздел "Задачи".
- **Refactoring:** переход от mock-DTO к доменным структурам в модуле Tasks.
- **Bugfix:** исправлена ошибка десериализации дат (500 error) при создании вакансий и откликов.

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
