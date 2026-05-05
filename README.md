# CareerPilot AI

CareerPilot AI - full-stack portfolio project для управления поиском работы как структурированным workflow: от вакансий
и откликов до AI-assisted анализа, напоминаний и аналитики.

> Статус: **В активной разработке**.  
> Это portfolio project с production-like architecture, но проект еще не является завершенным продуктом.

## Live Demo

🚀 [careerpilot-ai-sigma.vercel.app](https://careerpilot-ai-sigma.vercel.app)

> Demo работает в режиме mock data. Backend не подключён к Vercel-деплою.  
> Для полного функционала — локальный запуск (см. ниже).

**Demo аккаунт:** `sofia.horak@demo.dev` / `Demo123!@#`

## Какую проблему решает проект

Поиск работы быстро превращается в набор разрозненных вкладок, таблиц, заметок, писем и напоминаний. CareerPilot AI
собирает этот процесс в один понятный workflow:

- хранение вакансий и компаний;
- отслеживание этапов отклика;
- подготовка к интервью;
- AI-assisted vacancy analysis;
- сравнение резюме с вакансией;
- генерация cover letter и interview questions;
- аналитика прогресса поиска работы.

## Что уже реализовано

- **Monorepo-структура** `backend/`, `frontend/`, `docs/`.
- **Backend foundation** на `Java 21`, `Spring Boot 3`, `PostgreSQL`, `Flyway`, `Spring Security`, JWT.
- **Frontend foundation** на `React`, `TypeScript`, `Vite`, `Tailwind CSS`.
- **Docker Compose** для локальной инфраструктуры: PostgreSQL, Redis, optional MinIO и Ollama profiles.
- **i18n**: интерфейс на русском и английском.
- **Auth vertical slice:** endpoints register/login/me с JWT token-based auth.
- **Vacancies vertical slice:** полный CRUD, включая формы создания и редактирования, pagination, user ownership.
- **Companies vertical slice:** CRUD endpoints, user ownership, PagedResponse.
- **Applications vertical slice:** board endpoint, PATCH status, Kanban с drag-and-drop, DragOverlay preview, optimistic
  update.
- **Analytics vertical slice:** GET /api/analytics/summary, включая `topSkillGaps`.
- **AI Assistant slice:** инструменты для анализа, улучшения резюме и подготовки к интервью, с улучшенной валидацией форм.

## Известные ограничения и следующие шаги (v0.1.0-alpha)

На данный момент проект готовится к первому alpha-релизу. Некоторые функции запланированы к реализации после него:

- **Создание компаний:** В интерфейсе пока нет возможности создать компанию (хотя API для этого существует).
- **История анализов AI:** Повторный анализ вакансии перезаписывает предыдущий результат.
- **Мелкие UX-проблемы:**
    - Отсутствует dropdown меню у аватара пользователя в шапке.
    - Названия кнопок "Сохранить"/"Применить" на странице вакансии можно сделать более интуитивными.
    - Статичный блок "Совет" в боковой панели.
    - Глобальный поиск в шапке пока неактивен.
    - В еженедельной аналитике не переведены метки недель.

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

Секреты, local env files, build artifacts, IDE configs и dependency folders исключены через `.gitignore`.
