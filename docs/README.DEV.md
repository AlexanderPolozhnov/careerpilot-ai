# CareerPilot AI — руководство разработчика

Этот документ описывает локальную разработку CareerPilot AI в monorepo-структуре. Он предназначен для быстрого onboarding, developer review и подготовки проекта к аккуратному публичному GitHub commit.

## Статус

Проект находится в активной разработке (v1.0.0-beta pre-release). Архитектура построена как production-like portfolio project с полным frontend-backend интегрированием по документированному контракту.

## Monorepo-структура

```text
careerpilot-ai/
|-- backend/                 Spring Boot backend
|   |-- Dockerfile           multi-stage Maven + JRE21 build
|   `-- .env.example         пример env для локального dev
|-- frontend/                React + TypeScript frontend
|   |-- Dockerfile           multi-stage pnpm + nginx build
|   `-- nginx.conf           SPA fallback + /api/ + OAuth2 proxy
|-- docs/                    публичная документация и API contract
|   `-- DEPLOYMENT.md        руководство по Docker деплою
|-- docker-compose.yml       полный стек (backend + frontend + infra)
|-- .env.docker.example      шаблон env для Docker Compose
|-- README.md                публичная главная страница проекта
|-- ROADMAP.md               roadmap разработки
`-- LICENSE
```

## Настройка бэкенда

Backend находится в `backend/`.

Стек:

- Java 21
- Spring Boot 3
- Maven wrapper
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

Запуск на Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Запуск на Unix-like системах:

```bash
cd backend
./mvnw spring-boot:run
```

Тесты на Windows:

```powershell
cd backend
.\mvnw.cmd test
```

Тесты на Unix-like системах:

```bash
cd backend
./mvnw test
```

Важно: backend tests могут требовать Docker, потому что test configuration использует Testcontainers для PostgreSQL.

## Настройка фронтенда

Frontend находится в `frontend/`.

Стек:

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

Установка зависимостей (pnpm@9):

```bash
cd frontend
pnpm install
```

Сервер разработки:

```bash
pnpm run dev
```

Lint:

```bash
pnpm run lint
```

Тесты:

```bash
pnpm run test
```

Интерактивный режим (watch):

```bash
pnpm run test:watch
```

Сборка production-версии:

```bash
pnpm run build
```

Preview:

```bash
pnpm run preview
```

В PowerShell можно использовать `pnpm.cmd`, если локальная execution policy блокирует `pnpm.ps1`:

```powershell
pnpm.cmd run lint
pnpm.cmd run build
```

## Переменные окружения

### Бэкенд

Пример локальных backend variables находится в `backend/.env.example`.

Текущие переменные:

- `DB_PASSWORD`
- `DB_USER`
- `DB_NAME`
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`
- `JWT_SECRET` (base64 secret для подписи access token)
- `JWT_ACCESS_TOKEN_EXPIRATION_MS` (TTL access token в миллисекундах)
- `JWT_REFRESH_TOKEN_EXPIRATION_MS` (TTL refresh token в миллисекундах)
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_ID`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID`
- `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_CLIENT_ID` (из Google Console для интеграции)
- `GOOGLE_CALENDAR_CLIENT_SECRET` (из Google Console для интеграции)
- `REDIS_HOST`
- `REDIS_PORT`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `FRONTEND_URL`
- `SPRING_PROFILES_ACTIVE`
- `OLLAMA_BASE_URL`
- `OLLAMA_MODEL`
- `ENCRYPTION_MASTER_KEY` (AES-256, ровно 16/24/32 символа)
- `TELEGRAM_BOT_ENABLED` (true/false, по умолчанию false)
- `TELEGRAM_BOT_TOKEN` (токен бота от @BotFather)
- `TELEGRAM_BOT_USERNAME` (username бота без @)

Файлы `.env` и `.env.*` не должны попадать в Git. Для публичного репозитория коммитится только `.env.example`.

### Фронтенд

Frontend читает Vite env variables через `import.meta.env`.

- `VITE_API_BASE_URL` - base URL для REST API. Значение по умолчанию в коде: `http://localhost:8080/api`.
- `VITE_USE_MOCKS` - режим mock/API. По умолчанию service layer считает значение `true`.

Пример API mode:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

## Docker Compose

### Full-stack запуск (рекомендуется)

```bash
cp .env.docker.example .env
docker compose up -d --build
```

Frontend: `http://localhost` · Backend: `http://localhost:8080`

Подробности, настройка OAuth2, troubleshooting — [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

### Только инфраструктура (локальный dev)

```bash
docker compose up -d postgres redis
```

Опциональный профиль MinIO:

```bash
docker compose --profile storage up -d minio
```

Опциональный профиль Ollama (локальный LLM):

```bash
docker compose --profile ai up -d ollama
```

Проверка compose config:

```bash
docker compose config
```

## AI Provider Architecture

Начиная с `v0.8.0-alpha`, проект поддерживает динамическое переключение ИИ-провайдеров без перезапуска бэкенда.

Ключевые компоненты:
- **`LlmProviderFactory`**: Фабрика, которая выбирает реализацию `LlmProvider` на основе настроек текущего пользователя (`AiProviderMode`).
- **`OllamaLlmProvider`**: Локальный провайдер. Параметры (URL и Модель) берутся из `PreferencesEntity` пользователя. При пустых полях используются дефолтные значения (`http://localhost:11434`, `llama3`).
- **`OpenAiLlmProvider`**: Облачный провайдер. Может использовать либо системный API ключ (из `.env`), либо персональный ключ пользователя (`BRING_YOUR_OWN_KEY`).
- **`EncryptionConverter`**: JPA AttributeConverter, реализующий AES-256 шифрование для чувствительных полей (например, `openAiApiKey`) в базе данных.
- **`FallbackLlmGenerator`**: Компонент, обеспечивающий качественные mock-ответы при недоступности внешних сервисов или отсутствии ключей. Всегда возвращает `isFallback = true`.
- **`LlmResponse`**: DTO с полем `isFallback` для индикации использования mock-данных.
- **`AiEntity`**: JPA сущность с полем `isFallback` для хранения в базе данных.

Для настройки через UI: `Settings -> AI Assistant Settings`. Sensitive поля (API ключи) маскируются при передаче на фронтенд. Новые пользователи получают дефолтные значения Ollama URL и Model. В интерфейсе отображается бейдж "Fallback Mode" при использовании mock-данных.

## Frontend-backend contract

Главный контракт находится здесь:

- [Контракт Frontend/Backend](./FRONTEND_BACKEND_CONTRACT.md)

Контракт описывает:

- base URL `/api`;
- auth behavior;
- error response format;
- pagination format;
- enum values;
- endpoints, которые вызывает frontend service layer;
- `TARGET/TODO` endpoints для mock-only зон;
- `FUTURE TODO` endpoints для profile/resume.

### Auth v1 интеграция (текущий статус)

- Реализованы backend endpoints `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/password`, `DELETE /api/users/me` (удаление аккаунта).
- Frontend в API mode (`VITE_USE_MOCKS=false`) использует `cp_access_token` (Bearer token) и refresh token через HttpOnly cookie.
- Logout вызывает backend endpoint для инвалидации сессии в БД.
- Реализована OAuth2 авторизация через GitHub и Google с автоматическим маппингом профилей.

### Vacancies v1 интеграция (текущий статус)

- Реализованы backend endpoints `GET /api/vacancies`, `GET /api/vacancies/{id}`, `POST /api/vacancies`, `PUT /api/vacancies/{id}`, `DELETE /api/vacancies/{id}`, `PATCH /api/vacancies/{id}/archive`.
- Все vacancy операции требуют JWT и scoped по владельцу (user ownership через `SecurityContext`).
- Данные компании загружаются без N+1 проблем через `@EntityGraph`.

## Mock/API режим frontend

Основной переключатель:

- `VITE_USE_MOCKS=true` - service layer возвращает данные из `src/mock/data.ts`;
- `VITE_USE_MOCKS=false` - service layer вызывает backend через `src/services/api-client.ts`.

Известная особенность: `authService.me()` не mock-aware. Если в `localStorage` уже лежит `cp_access_token`, `AuthContext` может вызвать `GET /auth/me` даже при mock mode.

## Known limitations

- Backend интеграционные тесты с Testcontainers требуют доступный Docker runtime.
- CI через GitHub Actions настроен и работает (frontend lint/test/build + backend unit-тесты).
- OAuth2 в Docker требует регистрации `http://localhost/login/oauth2/code/{provider}` в настройках GitHub/Google OAuth App (callback URL через nginx, порт 80).

## Production Deploy (Google Cloud Run)

Проект задеплоен на [careerpilot-ai.ru](https://careerpilot-ai.ru) через CD-пайплайн GitHub Actions.

**Инфраструктура:**
- Frontend: Google Cloud Run `careerpilot-frontend` (nginx + React SPA, `europe-west1`)
- Backend: Google Cloud Run `careerpilot-backend` (Spring Boot, `europe-west1`)
- База данных: Cloud SQL PostgreSQL `careerpilot-db` (`europe-west3`)
- Docker-образы: Google Artifact Registry `careerpilot-docker-repo` (`europe-west1`)
- CD: `.github/workflows/cd.yml` — автодеплой при push в `main`

**Ключевые особенности Cloud Run конфига:**
- Backend подключается к Cloud SQL через `--add-cloudsql-instances` + JDBC Socket Factory (без открытых портов).
- Redis НЕ используется в production (`SPRING_CACHE_TYPE=none`) — Cloud Run не имеет доступа к VPC без VPC Connector.
- `VITE_API_BASE_URL` статически задан в `cd.yml` как `https://careerpilot-backend-213199819151.europe-west1.run.app/api`.
- Nginx требует `resolver 169.254.169.254 valid=30s;` для работы с переменными при запуске в Cloud Run.
- CORS origins включают оба адреса: Cloud Run URL (`*.run.app`) и кастомный домен (`careerpilot-ai.ru`).

**GitHub Secrets, необходимые для CD:**

| Secret | Описание |
|---|---|
| `GCP_PROJECT_ID` | ID GCP проекта |
| `GCP_SA_KEY` | JSON ключ Service Account |
| `GCP_REGION` | `europe-west1` |
| `DATABASE_USERNAME` | Пользователь Cloud SQL |
| `DATABASE_PASSWORD` | Пароль Cloud SQL |
| `REDIS_HOST` | IP Redis (не используется, `SPRING_CACHE_TYPE=none`) |
| `ENCRYPTION_MASTER_KEY` | AES мастер-ключ (32 символа) |
| `JWT_SECRET` | Секрет JWT подписи |
| `GH_CLIENT_ID` / `GH_CLIENT_SECRET` | GitHub OAuth App (НЕ `GITHUB_*` — зарезервированный префикс!) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth Client |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | SMTP credentials and sender address |

Подробный пошаговый гайд: `private-notes/info-by-project/CLOUD_RUN_CD_DEPLOYMENT_GUIDE.md`

## Merge readiness

Проект готов к публичному review как portfolio project, если явно сохранять текущие ограничения:

- не утверждать, что система завершена;
- держать `.env`, `target/`, `node_modules/`, `dist/`, `.idea/` вне Git;
- проверять `git status --short` перед commit;
- сверять backend changes с `docs/FRONTEND_BACKEND_CONTRACT.md`;
- не менять enum values без одновременного обновления frontend и contract.

## Реализованные вертикальные срезы

Полностью реализованы и интегрированы:

1. **Auth**: login, register, me, forgot-password, reset-password, refresh, logout, OAuth2 (GitHub, Google).
2. **Vacancies**: полный CRUD с pagination, фильтрами, архивацией, загрузкой компании.
3. **Companies**: полный CRUD с pagination, поиском.
4. **Applications**: полный CRUD, Kanban-борд, status updates, **Status History (Timeline)**.
5. **Tasks**: полный CRUD, pagination, фильтрация, toggle done.
6. **Interviews**: полный CRUD, pagination, фильтрация по типу/результату.
7. **Resumes**: полный CRUD, транзакционная логика дефолтного резюме.
8. **Profile**: GET/PUT me с JSONB-полем скиллов.
9. **AI Assistant**: analyze-vacancy, resume-match, cover-letter, interview-questions, history с Redis-кэшированием.
10. **Analytics**: summary с воронкой, недельной активностью, skill gaps, **статистика по компаниям**, **тепловая карта активности (Activity Heatmap)**.
11. **Dashboard**: summary с KPI, интервью, задачами.
12. **Settings**: preferences, управление резюме, смена пароля, удаление аккаунта, **Contextual Help**.
13. **Search**: агрегированный поиск по вакансиям, компаниям, задачам, собеседованиям.
14. **Notifications**: In-app уведомления, Email (SMTP), Telegram Bot (Strategy/Factory паттерн). Scheduled напоминания о задачах и собеседованиях. Уведомления при смене статуса отклика.
15. **Integrations**: Прямая синхронизация с **Google Calendar (OAuth2)**, экспорт в **Excel**, экспорт собеседований в **ICS**, **Telegram MiniApp** (WebApp интеграция).
## Безопасность

- **Refresh Tokens**: автоматическое продление сессии через HttpOnly Cookies.
- **Rate Limiting**: ограничение частоты запросов для AI-эндпоинтов (Token Bucket, HTTP 429).
- **Audit Trail**: журналирование критичных действий в PostgreSQL.
- **OAuth2**: социальная авторизация через GitHub и Google.
- **Secure Account Deletion**: удаление аккаунта с проверкой пароля и подтверждением Email.
- **Encryption at Rest**: AES-256 шифрование чувствительных полей (OpenAI API ключи) через JPA `AttributeConverter`.
- **Telegram Bot**: уведомления через Telegram, привязка через deep link (`/start {token}`), условный запуск через `@ConditionalOnProperty`.
