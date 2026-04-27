# CareerPilot AI — руководство разработчика

Этот документ описывает локальную разработку CareerPilot AI в monorepo-структуре. Он предназначен для быстрого onboarding, developer review и подготовки проекта к аккуратному публичному GitHub commit.

## Статус

Проект находится в активной разработке. Архитектура строится как production-like portfolio project, но часть функциональности еще использует mock data, а frontend-backend integration выполняется по документированному контракту.

## Monorepo-структура

```text
careerpilot-ai/
|-- backend/                 Spring Boot backend
|-- frontend/                React + TypeScript frontend
|-- docs/                    публичная документация и API contract
|-- docker-compose.yml       локальная инфраструктура
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
- Spring Data JPA
- Flyway
- MapStruct
- Bean Validation
- OpenAPI / Swagger
- JUnit 5
- Mockito
- Testcontainers

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

Установка зависимостей:

```bash
cd frontend
npm install
```

Сервер разработки:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Сборка production-версии:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

В PowerShell можно использовать `npm.cmd`, если локальная execution policy блокирует `npm.ps1`:

```powershell
npm.cmd run lint
npm.cmd run build
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

Корневой `docker-compose.yml` сейчас используется для локальной инфраструктуры.

Запуск PostgreSQL и Redis:

```bash
docker compose up -d postgres redis
```

Опциональный профиль MinIO:

```bash
docker compose --profile storage up -d minio
```

Опциональный профиль Ollama:

```bash
docker compose --profile ai up -d ollama
```

Проверка compose config:

```bash
docker compose config
```

В compose пока нет backend/frontend services. Это нормально для текущего этапа: backend и frontend запускаются локально через Maven wrapper и Vite.

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

- Реализованы backend endpoints `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- Frontend в API mode (`VITE_USE_MOCKS=false`) использует `cp_access_token` и `Authorization: Bearer <accessToken>`.
- Logout остаётся frontend-only и очищает `localStorage`.
- Password recovery endpoints (`/auth/forgot-password`, `/auth/reset-password`) остаются следующим шагом.

### Vacancies v1 интеграция (текущий статус)

- Реализованы backend endpoints `GET /api/vacancies`, `GET /api/vacancies/{id}`, `POST /api/vacancies`, `PUT /api/vacancies/{id}`, `DELETE /api/vacancies/{id}`.
- Все vacancy операции требуют JWT и scoped по владельцу (user ownership через `SecurityContext`).
- `PATCH /api/vacancies/{id}/archive` остается отдельным TODO шагом.

## Mock/API режим frontend

Основной переключатель:

- `VITE_USE_MOCKS=true` - service layer возвращает данные из `src/mock/data.ts`;
- `VITE_USE_MOCKS=false` - service layer вызывает backend через `src/services/api-client.ts`.

Известная особенность: `authService.me()` сейчас не mock-aware. Если в `localStorage` уже лежит `cp_access_token`, `AuthContext` может вызвать `GET /auth/me` даже при mock mode.

## Known limitations

- `DashboardPage` напрямую использует mock data.
- `SettingsPage` использует mock/local-only state для части данных и сохранения.
- Backend endpoints еще не полностью совпадают с frontend contract.
- Frontend test runner пока не настроен.
- CI через GitHub Actions запланирован, но не добавлен.
- Backend tests требуют доступный Docker runtime для Testcontainers.
- Документация по production deployment пока запланирована.

## Merge readiness

Проект готов к публичному review как portfolio project, если явно сохранять текущие ограничения:

- не утверждать, что система завершена;
- держать `.env`, `target/`, `node_modules/`, `dist/`, `.idea/` вне Git;
- проверять `git status --short` перед commit;
- сверять backend changes с `docs/FRONTEND_BACKEND_CONTRACT.md`;
- не менять enum values без одновременного обновления frontend и contract.

## Рекомендуемый порядок интеграции backend endpoints

1. Auth: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`.
2. Password flow: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
3. Vacancies: `GET /api/vacancies`, `GET /api/vacancies/{id}`.
4. Applications: `POST /api/applications`, `GET /api/applications/board`.
5. Companies: `GET /api/companies`.
6. AI: `GET /api/ai/history`, `POST /api/ai/analyze-vacancy`, `POST /api/ai/resume-match`, `POST /api/ai/cover-letter`, `POST /api/ai/interview-questions`.
7. Analytics: `GET /api/analytics/summary`.
8. Dashboard/settings/preferences/notifications endpoints для замены mock-only зон.
