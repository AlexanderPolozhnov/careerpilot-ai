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
- [x] **Interview Calendar Export:** экспорт собеседований в формат .ics для добавления в личные календари.
- [x] **Google Calendar Direct Sync:** возможность прямой синхронизации через Google API (OAuth2).

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
- [x] **Unified Contextual Help:** система всплывающих подсказок в настройках для объяснения работы AI и других модулей.

## 🚀 v1.0.0-beta — Product Readiness & Stability (Текущая версия)

- **Advanced Integrations:**
  - [x] Прямая синхронизация с Google Calendar (OAuth2).
  - [x] Расширенная аналитика эффективности по компаниям.
  - [x] Экспорт всех пользовательских данных в Excel (.xlsx).
- **UX & Branding:**
  - [x] Полный редизайн Topbar: группировка статусов интеграций, очистка от лишнего шума.
  - [x] Контекстная справка (Help System) во всех разделах настроек.
  - [x] Стандартизация локализации (EN/RU) и форматов времени (24h для RU).
- **Reliability:**
  - [x] Исправлены падения Backend CI из-за инициализации Telegram бота в тестах.
  - [x] Оптимизированы unit-тесты Preferences (изоляция SecurityContext).
  - [x] Стабилизация работы с Google API (обработка Refresh Tokens).

## Phase 6 — Architecture & Quality Polish

- [x] **Asynchronous AI Integration:** Переход на `@Async` и `CompletableFuture` для неблокирующей генерации ответов ИИ.
- [x] **Event-Driven Architecture:** Внедрение Spring Events для развязки бизнес-логики и уведомлений.
- [x] **Performance Optimization:** Настройка пула соединений HikariCP и пакетной обработки Hibernate.
- [x] **Security Propagation:** Настройка передачи контекста безопасности (`SecurityContext`) в асинхронные потоки.
- [x] **Full-stack Docker Compose setup.**
- [x] **Deployment notes.**
- [x] **Frontend test framework и базовые тесты.**
- [x] **Stability:** Стабилизация интеграционных тестов с Testcontainers.
- [x] **Оптимизация производительности фронтенда:** Code Splitting (через `React.lazy` + `Suspense`) + `manualChunks` в Vite. Сокращение первоначального бандла.
- [x] **CD Pipeline (Google Cloud Run):** GitHub Actions → Google Artifact Registry → Cloud Run. Автодеплой при push в main.
- [x] **Production деплой:** Проект задеплоен на [careerpilot-ai.ru](https://careerpilot-ai.ru). Frontend + Backend — Google Cloud Run (`europe-west1`), БД — Cloud SQL PostgreSQL (`europe-west3`). Google OAuth Consent Screen верифицирован.

## 📅 Ближайшие планы (v1.1.0)

- [x] **Улучшение мобильной версии:** Mobile Drawer Sidebar (hamburger-меню, CSS-трансформация, overlay, блокировка scroll body), адаптивный `ApplicationsPage` (flex-wrap статистика, flex-col поиск, min-w Kanban-колонки).
- [x] **Telegram MiniApp:** Реализация входа через Telegram WebApp (HMAC-SHA256 `initData` validation, SDK integration, conditional UI).
- [x] **Интеграция Cloudflare:** Проксирование трафика для защиты от DDoS и WAF, автоматическое извлечение IP-адресов пользователей через заголовок `CF-Connecting-IP` в аспектах логирования аудита и лимитера запросов.
- [x] Поддержка файлов (PDF/DOCX) для загрузки резюме напрямую (загрузка и извлечение текста для AI).
- [x] Redis в production через GCP Memorystore + VPC Connector (AI кэширование в Cloud Run).
- [x] **Улучшение настроек AI провайдера:** Тестирование соединения, синхронизация моделей, улучшенная валидация, Toasts, фикс UI багов.

---

## 🎯 Цели v1.2.0

> Подробные идеи и обоснование — в [`docs/ideas/IDEAS_v1.2.md`](docs/ideas/IDEAS_v1.2.md).

### 🖥️ Визуальная часть (Frontend / UX)

- [x] **Onboarding Flow** — мастер первого запуска (3–4 шага): профиль → первая вакансия → настройка AI → знакомство с Kanban.
- [x] **Полная мобильная оптимизация** — адаптивные `AnalyticsPage` (charts), `VacancyDetailPage`, `InterviewsPage`; touch-friendly Kanban.
- [x] **PWA** — режим offline, кнопка «Установить приложение», поддержка Service Worker.
- [x] **Activity Heatmap** — тепловая карта активности в стиле GitHub (52 нед × 7 дней) на странице аналитики.

- [ ] **Kanban 2.0** — inline-редактирование заметок на карточке, фильтры по компании/дате, счётчик карточек в колонке, collapsed-режим.
- [ ] **DnD-сортировка задач** — drag-and-drop для ручной расстановки порядка задач (dnd-kit уже установлен; поле `sort_order` в таблице `tasks`).
- [ ] **Dark / Light Theme** — переключатель темы в Topbar; light mode палитра через CSS custom properties.
- [ ] **Markdown Preview для вакансий** — rich text preview для поля description/notes (использовать уже установленный `react-markdown`).
- [ ] **AI Chat / Copilot UI** — страница чата с typing-cursor анимацией и streaming-рендерингом markdown (SSE).
- [ ] **Application Health Score Badge** — цветной бейдж совместимости (0–100) на каждой Kanban-карточке.
- [ ] **Company Intelligence Page** — детальная страница компании с аналитикой: вакансии, отклики, timeline, response rate.

### ⚙️ Серверная часть (Backend / Infrastructure)

- [ ] **User Timezone Support** — поле `timezone` в `user_preferences`; все напоминания и расписания форматируются по часовому поясу пользователя (сейчас hardcoded `Europe/Moscow`).
- [ ] **Database Indexes Audit** — миграция V30: составные индексы на `applications(user_id, status)`, `vacancies(user_id, status)`, `notifications(user_id, status)`, `tasks(user_id, done, due_at)`.
- [ ] **File Upload (MinIO)** — хранение оригинальных PDF/DOCX резюме; MinIO уже объявлен в `docker-compose.yml` (`profile: storage`), но не подключён к приложению.
- [ ] **AI Chat endpoint (SSE streaming)** — `POST /ai/chat` с `text/event-stream`; новый тип `CHAT_SESSION` в `ai_results`.
- [ ] **Application Health Score (AI)** — фоновый `@Async` расчёт совместимости при `POST /applications`; поле `compatibility_score INT` в миграции V30.
- [ ] **AI Daily Briefing** — расширить `ReminderScheduler`; новый тип уведомления `DAILY_BRIEFING`; доставка через Email + in-app + Telegram.
- [ ] **AI Follow-up Scheduler** — автоматическое создание задачи для откликов без ответа >7 дней в статусе `APPLIED`; endpoint `POST /ai/follow-up`.
- [ ] **Salary Trend Analytics** — endpoint `GET /analytics/salary-trends`; агрегация по `salary_from`/`salary_to` вакансий за месяц.

- [x] **Activity Heatmap (backend)** — endpoint `GET /analytics/activity-heatmap`; группировка событий по дате (отклики + задачи + интервью).
- [ ] **Telegram Bot Enhanced Commands** — добавить команды `/morning`, `/tasks`, `/add [URL]` в существующий `TelegramWebhookBot`.
- [ ] **Real-time Notifications (SSE / WebSocket)** — `GET /notifications/stream` через SSE или Spring WebSocket + STOMP; замена polling каждые 60 сек.
- [ ] **OpenAPI Documentation Polish** — полноценные `@Operation`, `@ApiResponse`, `@Parameter` для всех 30+ контроллеров.
- [ ] **Backend Health Dashboard** — Spring Boot Actuator + Micrometer; эндпоинт `/admin/health` с метриками AI latency, cache hit rate, uptime.

