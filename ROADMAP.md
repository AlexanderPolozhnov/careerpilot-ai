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
- [x] **Fallback Mode Indication:** добавлен флаг `isFallback` для визуального отображения mock-данных AI.
- [x] **Default AI Settings:** инициализация дефолтных значений для Ollama URL/Model для новых пользователей.
- [x] **Empty Field Handling:** логика использования дефолтов при пустых настройках Ollama.
- [x] `POST /ai/resume-match` aligned with frontend contract.
- [x] `POST /ai/cover-letter` aligned with frontend contract.
- [x] `POST /ai/interview-questions` aligned with frontend contract.
- [x] AI history endpoints (`GET /ai/history`, `GET /ai/history/{id}`).

## 🚀 v0.9.0-alpha — Telegram & UX Polish (Текущая версия)

- **Telegram Integration:**
  - [x] Реализован TelegramBotHandler на базе `TelegramLongPollingBot`.
  - [x] Привязка аккаунта через deep link `/start {token}`.
  - [x] Интеграция TelegramNotificationSender в общую систему уведомлений.
  - [x] Автоматическое переключение NotificationProvider в Preferences.
- **UX & Branding:**
  - [x] Добавлен блок ключевых особенностей в README.md.
  - [x] Обновлена презентация проекта для работодателей.
- **Reliability:**
  - [x] Исправлены падения Backend CI из-за инициализации Telegram бота в тестах.
  - [x] Оптимизированы unit-тесты Preferences (изоляция SecurityContext).
  - [x] Интеграционные тесты (SpringBootTest) исключены из быстрого CI.

## 📅 Ближайшие планы (v1.0.0-beta)

- [ ] Расширенная аналитика по компаниям.
- [ ] Экспорт данных в PDF/Excel.
- [ ] Оптимизация производительности фронтенда.
- [ ] Улучшение мобильной версии.
