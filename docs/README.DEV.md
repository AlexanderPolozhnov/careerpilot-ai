# CareerPilot AI — руководство разработчика

Этот документ описывает локальную разработку CareerPilot AI в monorepo-структуре. Он предназначен для быстрого onboarding, developer review и подготовки проекта к аккуратному публичному GitHub commit.

## Статус

Проект находится в активной разработке (v0.6.0-alpha). Архитектура построена как production-like portfolio project с полным frontend-backend интегрированием по документированному контракту.

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
- JWT
- Spring Data JPA
- Flyway
- MapStruct
- Bean Validation
- OpenAPI / Swagger
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
- `REDIS_HOST`
- `REDIS_PORT`

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
- **`OllamaLlmProvider`**: Локальный провайдер. Параметры (URL и Модель) теперь берутся из `PreferencesEntity` пользователя.
- **`OpenAiLlmProvider`**: Облачный провайдер. Может использовать либо системный API ключ (из `.env`), либо персональный ключ пользователя (`BRING_YOUR_OWN_KEY`).
- **`FallbackLlmGenerator`**: Компонент, обеспечивающий качественные mock-ответы при недоступности внешних сервисов или отсутствии ключей.

Для настройки через UI: `Settings -> AI Assistant Settings`.

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
10. **Analytics**: summary с воронкой, недельной активностью, skill gaps.
11. **Dashboard**: summary с KPI, интервью, задачами.
12. **Settings**: preferences, notifications, управление резюме.
13. **Search**: агрегированный поиск по вакансиям, компаниям, задачам, собеседованиям.

## Безопасность

- **Refresh Tokens**: автоматическое продление сессии через HttpOnly Cookies.
- **Rate Limiting**: ограничение частоты запросов для AI-эндпоинтов (Token Bucket, HTTP 429).
- **Audit Trail**: журналирование критичных действий в PostgreSQL.
- **OAuth2**: социальная авторизация через GitHub и Google.
- **Secure Account Deletion**: удаление аккаунта с проверкой пароля и подтверждением Email.
