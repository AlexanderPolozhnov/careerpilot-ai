# CareerPilot AI — Developer's Guide

This document describes the local development setup for CareerPilot AI inside its monorepo structure. It is designed for fast onboarding, developer review, and keeping the codebase ready for clean public GitHub commits.

## Status

The project is currently in active development (v1.0.0-beta pre-release). The architecture is designed as a production-like portfolio project featuring a full-stack integrated frontend and backend communicating via a documented API contract.

## Monorepo Structure

```text
careerpilot-ai/
|-- backend/                 Spring Boot backend
|   |-- Dockerfile           multi-stage Maven + JRE21 build
|   `-- .env.example         local development env example
|-- frontend/                React + TypeScript frontend
|   |-- Dockerfile           multi-stage pnpm + nginx build
|   `-- nginx.conf           SPA fallback + /api/ + OAuth2 proxy
|-- docs/                    public documentation and API contract
|   |-- DEPLOYMENT.md        Docker deployment guide
|   `-- en/                  English documentation (deployment, contracts, etc.)
|-- docker-compose.yml       full stack compose file (backend + frontend + infra)
|-- .env.docker.example      env variables template for Docker Compose
|-- README.md                public root page (English by default)
|-- README.ru.md             public root page (Russian copy)
|-- ROADMAP.md               roadmap (Russian)
|-- ROADMAP.en.md            roadmap (English)
`-- LICENSE
```

## Backend Setup

The backend module is located in `backend/`.

### Tech Stack:

- Java 21
- Spring Boot 3
- Maven Wrapper
- PostgreSQL
- Spring Security
- OAuth 2.0 (GitHub, Google)
- Google Calendar API (OAuth2)
- JWT
- Spring Data JPA
- Flyway
- MapStruct
- Bean Validation
- OpenAPI / Swagger
- Telegram Bots API
- Apache POI (Excel Export)
- JUnit 5
- Mockito
- Testcontainers
- Redis
- Bucket4j (Rate Limiting)

### Run locally (Windows):

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Run locally (Unix-like):

```bash
cd backend
./mvnw spring-boot:run
```

### Run tests (Windows):

```powershell
cd backend
.\mvnw.cmd test
```

### Run tests (Unix-like):

```bash
cd backend
./mvnw test
```

*Note: Backend tests might require a running Docker daemon because integration tests leverage Testcontainers to stand up a temporary PostgreSQL instance.*

## Frontend Setup

The frontend module is located in `frontend/`.

### Tech Stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- i18next
- dnd-kit (drag-and-drop)
- date-fns
- lucide-react

### Install dependencies (pnpm@9):

```bash
cd frontend
pnpm install
```

### Run dev server:

```bash
pnpm run dev
```

### Run Linter:

```bash
pnpm run lint
```

### Run Unit Tests:

```bash
pnpm run test
```

### Run Tests in interactive mode (watch):

```bash
pnpm run test:watch
```

### Build for Production:

```bash
pnpm run build
```

### Preview production build locally:

```bash
pnpm run preview
```

*For Windows PowerShell, you can invoke `pnpm.cmd` directly if your local script execution policy blocks `pnpm.ps1`:*

```powershell
pnpm.cmd run lint
pnpm.cmd run build
```

## Environment Variables

### Backend

A template for local backend environment configuration is placed at `backend/.env.example`.

Key environment variables:

- `DB_PASSWORD` — PostgreSQL password
- `DB_USER` — PostgreSQL user
- `DB_NAME` — PostgreSQL database name
- `MINIO_ROOT_USER` — MinIO admin login (optional)
- `MINIO_ROOT_PASSWORD` — MinIO admin password (optional)
- `JWT_SECRET` — Base64-encoded secret for JWT signature
- `JWT_ACCESS_TOKEN_EXPIRATION_MS` — Access token TTL (ms)
- `JWT_REFRESH_TOKEN_EXPIRATION_MS` — Refresh token TTL (ms)
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_CLIENT_ID` — Client ID from Google Cloud Console
- `GOOGLE_CALENDAR_CLIENT_SECRET` — Client Secret from Google Cloud Console
- `REDIS_HOST` — Redis server IP
- `REDIS_PORT` — Redis server Port
- `MAIL_HOST` — SMTP server host
- `MAIL_PORT` — SMTP server port
- `MAIL_USERNAME` — SMTP username
- `MAIL_PASSWORD` — SMTP password
- `FRONTEND_URL` — Frontend URL for CORS mapping
- `SPRING_PROFILES_ACTIVE` — Active Spring Profiles
- `OLLAMA_BASE_URL` — Local LLM base URL
- `OLLAMA_MODEL` — Local LLM model (e.g., `llama3`)
- `ENCRYPTION_MASTER_KEY` — AES-256 master key (exactly 16, 24, or 32 characters)
- `TELEGRAM_BOT_ENABLED` — Enable Telegram Integration (`true`/`false`, default is `false`)
- `TELEGRAM_BOT_TOKEN` — Bot Token from @BotFather
- `TELEGRAM_BOT_USERNAME` — Bot username without the `@` prefix

*Warning: Never commit `.env` or local secrets to git. Only `.env.example` should be checked into the repository.*

### Frontend

Vite compiles environment variables using `import.meta.env`.

- `VITE_API_BASE_URL` — REST API base endpoint. Defaults to `http://localhost:8080/api` in code.
- `VITE_USE_MOCKS` — Mock mode toggle. Defaults to `true` inside mock services.

To target the real backend:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

## Docker Compose

### Full-Stack Run (Recommended)

```bash
cp .env.docker.example .env
docker compose up -d --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`

*Detailed setup, OAuth2 credentials, and troubleshooting can be found in [docs/en/DEPLOYMENT.md](./DEPLOYMENT.md)*

### Infrastructure Only (Local Dev)

```bash
docker compose up -d postgres redis
```

Optional MinIO profile:

```bash
docker compose --profile storage up -d minio
```

Optional Ollama profile (local LLM):

```bash
docker compose --profile ai up -d ollama
```

Verify compose configuration:

```bash
docker compose config
```

## AI Provider Architecture

Starting from `v0.8.0-alpha`, the project supports dynamic, on-the-fly AI provider switching without restarting the backend service.

Key Components:
- **`LlmProviderFactory`**: Dynamically resolves the `LlmProvider` implementation matching the user's settings (`AiProviderMode`).
- **`OllamaLlmProvider`**: Local LLM handler. Retrieves URL and Model settings from the user's `PreferencesEntity`. Automatically falls back to standard values if left blank (`http://localhost:11434`, `llama3`).
- **`OpenAiLlmProvider`**: Cloud provider. Leverages either the global system key in `.env` or individual user keys (`BRING_YOUR_OWN_KEY`).
- **`EncryptionConverter`**: JPA AttributeConverter applying robust AES-256 encryption to sensitive database fields (such as user-provided `openAiApiKey`).
- **`FallbackLlmGenerator`**: Standby handler returning high-quality mock responses if remote services are offline or user credentials are missing. Sets `isFallback = true`.
- **`LlmResponse`**: DTO payload indicating fallback state to warn the client-side UI.
- **`AiEntity`**: Audited JPA entity preserving transaction records.

UI Configuration is accessible via: `Settings -> AI Assistant Settings`. Sensitive API keys are masked before sending to the client. New profiles are initialized with secure defaults.

## Frontend-Backend Contract

The source of truth for the API interface resides at:

- [Frontend/Backend Contract](./FRONTEND_BACKEND_CONTRACT.md)

This contract defines:
- Base path `/api`;
- Authentication expectations;
- Error handling payload schemes;
- Standard page pagination objects;
- Enum serialization structures;
- Target endpoints consumed by frontend hooks.

### Auth v1 Integration Status:
- Implemented and verified endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/password`, `DELETE /api/users/me`.
- SPA automatically manages cookies and Bearer tokens.
- Secure session closing via DB invalidation on logout.
- Fully integrated GitHub and Google OAuth2 workflows.

### Vacancies v1 Integration Status:
- Fully functional: `GET /api/vacancies`, `GET /api/vacancies/{id}`, `POST /api/vacancies`, `PUT /api/vacancies/{id}`, `DELETE /api/vacancies/{id}`, `PATCH /api/vacancies/{id}/archive`.
- Enforces strict user ownership filters.
- Eliminates Hibernate N+1 queries via precise `@EntityGraph` definitions.

## Mock / API Modes on Frontend

- `VITE_USE_MOCKS=true` — Uses static localized JSON sets under `src/mock/data.ts`.
- `VITE_USE_MOCKS=false` — Directs all request hooks via `src/services/api-client.ts` to the backend.

*Note: `authService.me()` is bypass-resistant. If a valid `cp_access_token` exists in the local state, `AuthContext` will request `GET /auth/me` even if mock mode is active.*

## Known Limitations

- Testcontainers backend testing requires an active local Docker host.
- Full automation testing runs seamlessly on GitHub Actions on every push and PR to `main`.
- OAuth2 callback routing in containers expects domain alias redirecting to port 80.

## Production Deploy (Google Cloud Run)

The application is deployed live at [careerpilot-ai.ru](https://careerpilot-ai.ru) using highly efficient automated GitHub Actions.

### Infrastructure details:
- **Frontend:** Google Cloud Run `careerpilot-frontend` (nginx React server, `europe-west1`).
- **Backend:** Google Cloud Run `careerpilot-backend` (Spring Boot JVM, `europe-west1`).
- **Database:** Google Cloud SQL PostgreSQL `careerpilot-db` (`europe-west3`).
- **Container Registry:** Google Artifact Registry (`europe-west1`).
- **Continuous Deployment:** Managed in `.github/workflows/cd.yml`.

A comprehensive cloud-onboarding log can be accessed at: `private-notes/info-by-project/CLOUD_RUN_CD_DEPLOYMENT_GUIDE.md`.

## Merge Readiness Checklist

The codebase is primed for public showcase under the following assumptions:
- Acknowledge that the suite is currently in active beta;
- Ensure that system secrets (`.env`, `target/`, `node_modules/`, `dist/`) never pollute the git tree;
- Strictly align all REST endpoints with `docs/FRONTEND_BACKEND_CONTRACT.md`;
- Avoid structural database constraints adjustments without corresponding Flyway migration SQL.

## Implemented Vertical Slices

The following components are fully functional and integrated end-to-end:

1. **Auth:** Register, Login, Current User, Email Password Recovery, Refresh Tokens, Logout, Social OAuth2.
2. **Vacancies:** Full CRUD, pagination, filtering, archive/restore, N+1 optimized queries.
3. **Companies:** Full CRUD, search, lists.
4. **Applications:** Drag-and-drop Kanban Board, stage transitions, **Status Change History & Timeline**.
5. **Tasks:** Multi-filtering lists, completion toggles, association with Applications.
6. **Interviews:** Dedicated tracking, type classification, personal calendars.
7. **Resumes:** CRUD, transactional default resume settings.
8. **Profile:** Custom profile updates, JSONB-serialized professional skills storage.
9. **AI Assistant:** 5 cognitive tools (vacancy analysis, resume scoring, cover letters, etc.), cached with Redis.
10. **Analytics:** Performance metrics, Weekly activity charts, Conversion funnels, Skill Gaps calculation.
11. **Dashboard:** KPI summary widgets, tasks summary, context-driven AI Insights.
12. **Settings:** User settings, active integrations panel, **Unified Contextual Help**.
13. **Search:** Global Cmd+K full-text query aggregator.
14. **Notifications:** Email alerts, In-app badges, Telegram bot scheduled interview & task reminders.
15. **Integrations:** **Google Calendar (OAuth2)** direct sync, Excel data export, `.ics` files downloads, **Telegram MiniApp** (WebApp integration).

## Enterprise Security

- **Refresh Tokens:** Handled via HttpOnly secure Cookies.
- **Rate Limiting:** Protects expensive AI endpoints (Token Bucket algorithm, HTTP 429).
- **Audit Trail:** Aspect-oriented persistent action logging.
- **Secure Deletion:** Email authentication challenge required to destroy user accounts.
- **Encryption at Rest:** Transparent AES-256 database converter for third-party keys.
- **Telegram Bot:** Deep-linked authentication (`/start {token}`).
