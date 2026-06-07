# CareerPilot AI Roadmap

## Project Status

CareerPilot AI is in active development. This is a full-stack portfolio project with a production-like architecture for job search management, AI-assisted vacancy analysis, and application tracking.

The roadmap reflects the current project status. Planned items are not yet implemented.

## Legend

- `[x]` completed
- `[~]` in progress
- `[ ]` planned

## Phase 1 — Project Foundation

- [x] Monorepo structure setup: `backend/`, `frontend/`, `docs/`.
- [x] Backend project initialized with Spring Boot.
- [x] Frontend project initialized with React, TypeScript, and Vite.
- [x] PostgreSQL selected as the primary database.
- [x] Docker Compose added for local infrastructure.
- [x] Frontend-backend API contract documented in `docs/FRONTEND_BACKEND_CONTRACT.md`.
- [x] Modular monolith chosen as the architectural pattern.
- [x] Root `.gitignore` configured to protect `.env`, build artifacts, IDE configs, and dependency folders.
- [x] MIT `LICENSE` added.

## Phase 2 — Frontend Foundation

- [x] Application layout and protected app shell.
- [x] Routing using React Router.
- [x] Auth screens: login, register, forgot password.
- [x] Vacancy pages: list and detail views, including full creation/editing forms.
- [x] Application board UI.
- [x] Applications Kanban DnD UX polish (`DragOverlay`, cleaner horizontal columns, compact cards).
- [x] Company pages.
- [x] AI assistant pages (with improved validation).
- [x] Analytics UI (integrated with API for skill gaps).
- [x] i18n foundation: `ru` and `en` locale files, `LanguageSwitcher`, persistence in `localStorage`.
- [x] `DashboardPage`: replace direct mock imports with backend-backed service.
- [x] `SettingsPage`: replace mock/local-only behavior with backend-backed settings/preferences service.
- [x] Frontend test runner and basic component/service tests.

## Phase 3 — Backend Foundation

- [x] Spring Boot application structure.
- [x] Java 21 / Maven wrapper.
- [x] PostgreSQL and Flyway setup.
- [x] Domain-oriented module structure.
- [x] Dependencies for Spring Security, Spring Data JPA, MapStruct, Bean Validation, OpenAPI / Swagger.
- [x] Test stack dependencies: JUnit 5, Mockito, Testcontainers.
- [x] Authentication API (register/login/me endpoints with JWT).
- [x] GlobalExceptionHandler and unified error response format.
- [x] Vacancy API (list/detail/create/update/delete, user ownership, pagination).
- [x] Company API (list/detail/create/update/delete, user ownership, pagination).
- [x] Application API (board, PATCH status).
- [x] Analytics API (GET /api/analytics/summary).
- [x] Application API (POST /applications, GET/PUT/DELETE /applications/{id}).
- [x] AI provider abstraction and Ollama-oriented layer (with fallback mock).
- [x] OAuth2 Social Login.
- [x] Notification API alignment with frontend contract.
- [x] Unified validation coverage across public endpoints.

## Phase 4 — Frontend/Backend Integration

- [x] Auth integration (JWT-based, token storage, protected routes, manually verified).
- [x] Vacancies integration (CRUD, pagination, ownership, frontend verified, including forms and tag support).
- [x] Companies integration (CRUD, pagination, ownership, frontend verified).
- [x] Analytics integration (summary endpoint, frontend verified, including skill gaps and real metrics).
- [x] Applications integration (board + status change working, POST/GET/PUT/DELETE implemented, including interview time tracking).
- [x] AI assistant integration (with improved validation).
- [x] Dashboard integration (replacing mock data with backend services).
- [x] Settings/preferences integration.
- [x] Notifications integration.
- [x] Profile API integration.
- [x] Resume Management (CRUD, default resume logic).
- [x] Resume UI implementation (Settings section).
- [x] Interview UI implementation (Dedicated page + CRUD).
- [x] Password Reset via Email (Full flow).
- [x] Manual API smoke scenarios documented and verified (`docs/SMOKE_SCENARIOS.md`).
- [x] **Real Analytics Metrics:** skill gaps calculation and average time to interview calculated from real database entries.
- [x] **Vacancy Tags UI:** support for adding and editing tags (skills) inside job vacancies.
- [x] **Application Status History:** recording and visualizing the history/timeline of application status changes.
- [x] **Timeline UI Polish:** i18n for all ApplicationStatus variants, instant CSS tooltips with localized keys, styled timeline history button in the project's signature violet accent.
- [x] **Analytics & UI Bugfixes:** resolved LazyInitializationException, removed React key warnings, optimized data fetching (no N+1 issues).
- [x] **Interview Calendar Export:** export scheduled interviews to .ics files to add to personal schedulers.
- [x] **Google Calendar Direct Sync:** direct two-way sync via official Google APIs (OAuth2).

## Phase 5 — AI Features

- [x] Provider abstraction (LlmProvider interface + OllamaLlmProvider with fallback).
- [x] Ollama as default local provider.
- [x] AI response caching.
- [x] Prompt templates.
- [x] `POST /ai/analyze-vacancy` aligned with frontend contract.
- [x] **Fallback Mode Indication:** added `isFallback` flag to visually indicate mock LLM data usage.
- [x] **Default AI Settings:** automatic initialization of Ollama URL/Model for new users.
- [x] **Empty Field Handling:** fallback to system defaults when Ollama settings fields are left blank.
- [x] `POST /ai/resume-match` aligned with frontend contract.
- [x] `POST /ai/cover-letter` aligned with frontend contract.
- [x] `POST /ai/interview-questions` aligned with frontend contract.
- [x] AI history endpoints (`GET /ai/history`, `GET /ai/history/{id}`).
- [x] **Unified Contextual Help:** tooltip help system in settings explaining the work of AI and other complex modules.

## 🚀 v1.0.0-beta — Product Readiness & Stability (Current Version)

- **Advanced Integrations:**
  - [x] Direct synchronization with Google Calendar (OAuth2).
  - [x] Advanced conversion & effectiveness analytics by company.
  - [x] User data export to Excel (.xlsx).
- **UX & Branding:**
  - [x] Complete Topbar redesign: grouped integration statuses, minimized visual noise.
  - [x] Contextual help system across all settings tabs.
  - [x] i18n and time formats standardization (24h for Russian locale).
- **Reliability:**
  - [x] Fixed Backend CI failures caused by Telegram bot initialization in tests.
  - [x] Optimized Preferences unit tests (isolated SecurityContext).
  - [x] Stabilized Google API integration (automatic Refresh Token handling).

## Phase 6 — Architecture & Quality Polish

- [x] **Asynchronous AI Integration:** migrated to `@Async` and `CompletableFuture` for non-blocking AI generation.
- [x] **Event-Driven Architecture:** implemented Spring Events to decouple core business logic from notification dispatching.
- [x] **Performance Optimization:** configured HikariCP connection pool and Hibernate batch processing.
- [x] **Security Propagation:** configured Spring Security Context propagation to asynchronous executor threads.
- [x] **Full-stack Docker Compose setup.**
- [x] **Deployment notes.**
- [x] **Frontend test framework and basic tests.**
- [x] **Stability:** stabilized integration tests using Testcontainers.
- [x] **Frontend Performance Optimization:** Code Splitting (via `React.lazy` + `Suspense`) + custom `manualChunks` in Vite config, drastically reducing initial bundle size.
- [x] **CD Pipeline (Google Cloud Run):** GitHub Actions → Google Artifact Registry → Cloud Run (auto-deploy on push to main).
- [x] **Production Deployment:** Deployed at [careerpilot-ai.ru](https://careerpilot-ai.ru) (Frontend/Backend — Google Cloud Run (`europe-west1`), Database — Cloud SQL PostgreSQL (`europe-west3`)). Google OAuth Consent Screen verified.

## 📅 Nearest Plans (v1.1.0)

- [x] Mobile view optimizations: Drawer Sidebar, adaptive grids and layouts.
- [x] Telegram MiniApp: WebApp integration with HMAC-SHA256 authentication and SDK support.
- [x] Cloudflare integration: secure traffic proxying for DDoS & WAF protection, restoring client IP addresses via `CF-Connecting-IP` header in Audit & Rate Limiting aspects.
- [x] **Onboarding Flow**: first-launch wizard (3-4 steps): profile -> first vacancy -> AI setup -> Kanban introduction.
- [x] **PWA**: offline mode, "Install App" button, Service Worker support.
- [ ] Direct file upload (PDF/DOCX) for resumes.
- [ ] Production Redis caching in Google Cloud via GCP Memorystore + VPC Connector.
