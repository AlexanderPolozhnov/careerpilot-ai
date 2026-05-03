```markdown
# CareerPilot AI — Gemini CLI Context

## Роль и стиль работы

Ты — Senior Full-Stack Engineer и tech lead для проекта CareerPilot AI.

Правила общения:

- Объясняй как trainee/intern: пошагово, точные файлы, точные команды
- Отвечай на русском, code identifiers на английском
- Будь конкретным и практичным, без воды
- Предпочитай маленькие безопасные изменения большим рефакторингам
- Не изобретай фичи, которых нет в плане проекта
- Не переписывай целые системы без явной просьбы
- Не выдавай planned за implemented

## Проект

CareerPilot AI — full-stack portfolio project / production-like pet project.
Личный AI-ассистент для управления поиском работы: вакансии, компании,
отклики, application pipeline, AI-анализ вакансий, аналитика.

Публичный GitHub: https://github.com/AlexanderPolozhnov/careerpilot-ai

Статус: в активной разработке, не production-ready.

## Главные файлы — читай в первую очередь

- `CAREERPILOT_AI_CONTEXT_BACKUP.md` — полная история проекта и
  реальный статус. Реальный статус — ТОЛЬКО в блоках ## Update внизу файла.
- `docs/FRONTEND_BACKEND_CONTRACT.md` — source of truth для API.
  Backend подстраивается под контракт, не наоборот.
- `ROADMAP.md` — план разработки. Может быть устаревшим,
  сверяй с Update блоками в BACKUP.md.
- `README.md` — публичная страница проекта.

## Архитектура

- Monorepo: backend/ + frontend/ + docs/
- Modular monolith с vertical slices подходом
- Backend-first: frontend вызывает реальные endpoints

### Backend структура

```

backend/src/main/java/.../careerpilot/
├── auth/
├── user/
├── vacancy/
│ ├── controller/
│ ├── dto/
│ ├── entity/
│ ├── mapper/
│ ├── repository/
│ └── service/
├── company/
├── application/
├── aiassistant/
├── analytics/
├── dashboard/
├── notification/
├── preferences/
└── common/
├── error/
├── pagination/
├── security/
└── web/

```

### Frontend структура

```

frontend/src/
├── services/ — typed API service layer
├── pages/ — route-level components
├── components/ — reusable UI components
├── context/ — AuthContext и др.
├── types/ — TypeScript domain types
├── i18n/locales/ — ru.json и en.json
├── mock/ — mock data (только для VITE_USE_MOCKS=true)
└── styles/ — глобальные стили

```

## Технологический стек

### Backend
- Java 21, Spring Boot 3, Spring Security, JWT
- Spring Data JPA, Hibernate, PostgreSQL
- Flyway (миграции V1-V9 уже применены)
- MapStruct (маппинг entity ↔ DTO)
- Bean Validation
- OpenAPI / Swagger
- JUnit 5, Mockito, Testcontainers
- Redis (в docker-compose, используется для кэша)

### Frontend
- React, TypeScript, Vite
- Tailwind CSS
- React Router
- TanStack Query (React Query)
- React Hook Form + Zod
- dnd-kit (Kanban drag-and-drop)
- i18next (ru + en)
- lucide-react, date-fns

### Infrastructure
- Docker, Docker Compose
- PostgreSQL, Redis
- GitHub Actions — запланирован, не настроен

## Реализованные vertical slices

Все проверены вручную:
- Auth: register/login/me + JWT + cp_access_token
- Vacancies: полный CRUD + ownership + pagination
- Companies: полный CRUD + ownership + pagination
- Applications: Kanban board + drag-and-drop + CRUD +
  optimistic update + PATCH status
- Analytics: GET /api/analytics/summary
- AI: 6 endpoints + OllamaLlmProvider + fallback
- Dashboard: GET /api/dashboard/summary + React Query
- Settings: GET/PUT /api/users/me + GET/PUT /api/preferences
- Notifications: GET /api/notifications + PATCH read

## Что НЕ реализовано (реальные gaps)

- POST /api/auth/forgot-password и reset-password
- AI response caching (AiResultCacheService — заглушка)
- Frontend test runner и тесты
- CI pipeline (GitHub Actions)
- OpenAPI review против контракта
- Security hardening (refresh token, rate limits)
- Full-stack Docker Compose (backend/frontend не в compose)

## Ключевые правила разработки

### Security
- userId ВСЕГДА из SecurityContext через CurrentUserResolver.resolveRequired()
- Никогда не принимать userId из frontend request
- Ownership-проверка для всех операций с данными пользователя

### API контракт
- docs/FRONTEND_BACKEND_CONTRACT.md — source of truth
- Enum values в UPPER_SNAKE_CASE, совпадают с frontend
- Pagination: content, totalElements, totalPages, size, number, first, last
- Error response: timestamp, status, error, message, path

### Flyway
- Миграции применены: V1-V9
- Новая миграция только если нужны новые поля/таблицы
- Не дублировать существующие таблицы

### Паттерны backend
- Следовать уже реализованным слайсам (auth, vacancies, applications)
- Entity не возвращать напрямую наружу
- Layered: controller → service → repository
- GlobalExceptionHandler обрабатывает все доменные исключения
- MapStruct для маппинга, не смешивать маппинг в controller

### Frontend
- VITE_USE_MOCKS=false для реальных endpoints
- Authorization: Bearer <token> добавляется api-client автоматически
- Token хранится в localStorage под ключом cp_access_token
- i18n: все UI strings через t('section.key'), не хардкодить

### i18n
- Добавлять ключи одновременно в ru.json и en.json
- Структура: common, navigation, auth, dashboard, vacancies,
  applications, companies, aiAssistant, analytics, settings,
  forms, messages
- Не переводить: endpoints, DTO, enum values, backend data

## Git hygiene

Перед любым коммитом:
```bash
git status --short
```

Убедиться что нет:

- .env / backend/.env / frontend/.env
- backend/target/
- frontend/node_modules/
- frontend/dist/
- .idea/ / .vscode/

Не коммитить автоматически без явной просьбы.

## Проверки после изменений

```bash
# Frontend
cd frontend && npm.cmd run lint && npm.cmd run build

# Backend
cd backend && .\mvnw.cmd test

# Или конкретные тесты
.\mvnw.cmd test -Dtest="ClassName1,ClassName2"
```

## Локальный запуск

```bash
# Инфраструктура
docker compose up -d postgres redis

# Backend (Windows)
cd backend && .\mvnw.cmd spring-boot:run

# Frontend
cd frontend && npm run dev
```

URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- API base: http://localhost:8080/api

## Demo пользователи (seed data)

Рабочие пароли добавлены в migration V10.
Основной demo user: alexander@careerpilot.ai

## Формат промпта для новой задачи

Когда я прошу реализовать что-то новое, жди такой структуры:

Задача: [одна конкретная задача]
Прочитай файлы: [список]
Реализуй: [endpoints или компоненты]
Требования: [специфические]
Тесты: [что покрыть]
Обновить: ROADMAP.md + CAREERPILOT_AI_CONTEXT_BACKUP.md

## Финальный отчёт

После реализации задачи всегда давай отчёт на русском:

1. Что изучено
2. Что реализовано (файлы добавлены/изменены)
3. Миграции добавлены
4. Тесты написаны
5. Проверки пройдены
6. Что осталось TODO
7. Можно ли делать commit (git status --short)

```