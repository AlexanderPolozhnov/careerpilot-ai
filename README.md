# CareerPilot AI

CareerPilot AI - full-stack portfolio project для управления поиском работы как структурированным workflow: от вакансий и откликов до AI-assisted анализа, напоминаний и аналитики.

> Статус: **В активной разработке**.  
> Это portfolio project с production-like architecture, но проект еще не является завершенным продуктом.

## Какую проблему решает проект

Поиск работы быстро превращается в набор разрозненных вкладок, таблиц, заметок, писем и напоминаний. CareerPilot AI собирает этот процесс в один понятный workflow:

- хранение вакансий и компаний;
- отслеживание этапов отклика;
- подготовка к интервью;
- AI-assisted vacancy analysis;
- сравнение резюме с вакансией;
- генерация cover letter и interview questions;
- аналитика прогресса поиска работы.

## Ключевые возможности

- Vacancy management: список, детали, фильтры, статусы и архивирование.
- Company tracking: карточки компаний и связь с вакансиями.
- Application pipeline: отклики и Kanban-представление по `ApplicationStatus`.
- AI assistant: анализ вакансии, resume match, cover letter, interview questions.
- Analytics dashboard: funnel, weekly activity, response/interview/offer rates.
- Auth flow: login/register и token-based frontend session.
- i18n: интерфейс на русском и английском через `i18next`.

Часть frontend пока использует mock data. Это осознанный этап интеграции: frontend-backend integration выполняется по документированному контракту.

## Текущий статус

- Статус проекта: **В активной разработке**.
- Архитектурный подход: modular monolith.
- Backend и frontend находятся в одном monorepo.
- Основная текущая задача: согласование frontend service layer с Spring Boot REST API.
- `DashboardPage` и `SettingsPage` пока частично используют mock/local state.
- Backend tests могут требовать доступный Docker runtime из-за Testcontainers.

## Что уже реализовано

- Monorepo-структура `backend/`, `frontend/`, `docs/`.
- Backend foundation на `Java 21`, `Spring Boot 3`, `PostgreSQL`, `Flyway`.
- Domain-oriented backend modules: auth, vacancy, application, company, AI, analytics и смежные модули.
- Frontend foundation на `React`, `TypeScript`, `Vite`, `Tailwind CSS`.
- Typed frontend service layer для REST API.
- Базовая i18n-инфраструктура с `ru` и `en` locale files.
- Docker Compose для локальной инфраструктуры: PostgreSQL, Redis, optional MinIO и Ollama profiles.
- Документированный frontend-backend contract.

## Что в разработке

- Доведение backend endpoints до контрактов, которые ожидает frontend.
- Замена mock-only зон dashboard/settings на backend-backed services.
- Полная интеграция AI endpoints с provider abstraction.
- Расширение test coverage и CI через GitHub Actions.
- Документация по deployment и production hardening.

## Почему проект интересен для review

- Показывает full-stack мышление: frontend UX, backend API, database, infrastructure и AI layer.
- Использует contract-first подход между frontend и backend.
- Демонстрирует modular monolith вместо хаотичного CRUD.
- Имеет честный roadmap и явно отмеченные ограничения.
- Подходит для обсуждения архитектурных trade-off на техническом интервью.

## Стек технологий

### Бэкенд

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- MapStruct
- Bean Validation
- OpenAPI / Swagger
- JUnit 5
- Mockito
- Testcontainers

### Фронтенд

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- i18next

### AI-слой

- Ollama как default local provider
- provider abstraction
- AI response caching
- prompt templates

### Инфраструктура

- Docker
- Docker Compose
- PostgreSQL
- Redis
- GitHub Actions — запланировано

## Структура репозитория

```text
careerpilot-ai/
|-- backend/
|-- frontend/
|-- docs/
|-- docker-compose.yml
|-- README.md
|-- ROADMAP.md
|-- LICENSE
`-- .gitignore
```

## Локальный запуск

### Инфраструктура

```bash
docker compose up -d postgres redis
```

Опциональные профили:

```bash
docker compose --profile storage up -d minio
docker compose --profile ai up -d ollama
```

### Бэкенд

Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Unix-like:

```bash
cd backend
./mvnw spring-boot:run
```

Тесты:

```powershell
cd backend
.\mvnw.cmd test
```

Backend использует `.env.example` как пример локальных переменных. Реальные `.env` файлы не коммитятся.

### Фронтенд

```bash
cd frontend
npm install
npm run dev
```

Проверки:

```bash
npm run lint
npm run build
```

Основные переменные окружения фронтенда:

- `VITE_API_BASE_URL`
- `VITE_USE_MOCKS`

## Документация

- [Roadmap проекта](./ROADMAP.md)
- [Руководство разработчика](./docs/README.DEV.md)
- [Контракт Frontend/Backend](./docs/FRONTEND_BACKEND_CONTRACT.md)
- [Реализация i18n](./docs/I18N_IMPLEMENTATION.md)

## Примечание о публичном репозитории

Секреты, local env files, build artifacts, IDE configs и dependency folders исключены через `.gitignore`. Перед первым commit стоит проверить `git status --short` и убедиться, что в candidate files не попали `.env`, `node_modules`, `dist`, `target` и `.idea`.
