```markdown
# CareerPilot AI — Gemini CLI Context

## Роль и стиль работы

Ты — Senior Full-Stack Engineer и tech lead для CareerPilot AI.

- Объясняй пошагово, точные файлы, точные команды
- Русский для объяснений, английский для идентификаторов
- Маленькие безопасные изменения, не рефакторить лишнее
- Не изобретай фичи вне плана, не выдавай planned за implemented

## Проект

Full-stack portfolio project: личный AI-ассистент для поиска работы.
GitHub: https://github.com/AlexanderPolozhnov/careerpilot-ai
Статус: в активной разработке, не production-ready.

## Главные файлы

- `CAREERPILOT_AI_CONTEXT_BACKUP.md` — реальный статус (читай ## Update блоки)
- `docs/FRONTEND_BACKEND_CONTRACT.md` — source of truth для API
- `ROADMAP.md` — план (может быть устаревшим, сверяй с BACKUP.md)

## Архитектура

Monorepo: `backend/` + `frontend/` + `docs/`
Modular monolith, vertical slices, backend-first.

### Backend

```

careerpilot/
├── auth/ ├── user/ ├── vacancy/ ├── company/ ├── application/
├── aiassistant/ ├── analytics/ ├── dashboard/
├── notification/ ├── preferences/
└── common/ (error/ pagination/ security/ web/)

```

### Frontend

```

frontend/src/
├── services/ ├── pages/ ├── components/ ├── context/
├── types/ ├── i18n/locales/ ├── mock/ └── styles/

```

## Стек

**Backend:** Java 21, Spring Boot 3, Spring Security, JWT, JPA, PostgreSQL, Flyway, MapStruct, Bean Validation, JUnit 5, Mockito, Redis
**Frontend:** React, TypeScript, Vite, Tailwind, React Router, TanStack Query, RHF + Zod, dnd-kit, i18next
**Infra:** Docker Compose, PostgreSQL, Redis, GitHub Actions CI

## Реализованные slices (все проверены вручную)

Auth, Vacancies, Companies, Applications (Kanban + DnD), Analytics, AI (6 endpoints + Ollama + Redis cache), Dashboard, Settings, Notifications.

## Ключевые правила

**Security:** userId только из `SecurityContext` через `CurrentUserResolver.resolveRequired()`. Никогда не из request.

**API контракт:** `docs/FRONTEND_BACKEND_CONTRACT.md` — source of truth. Enum values — `UPPER_SNAKE_CASE`. Pagination: `content, totalElements, totalPages, size, number, first, last`.

**Flyway:** Миграции применены V1–V13. Новая миграция только при необходимости. Naming: `V{n}__{snake_case}.sql`.

**Backend паттерны:** controller → service → repository. Entity не возвращать наружу. MapStruct для маппинга. GlobalExceptionHandler для доменных исключений.

**Frontend:** `VITE_USE_MOCKS=false`. Bearer token добавляет api-client. Все UI strings через `t('section.key')`. i18n ключи добавлять одновременно в `ru.json` и `en.json`.

## Проверки после изменений

**Frontend (всегда):**
```bash
cd frontend && npm.cmd run build
```

> lint отдельно только если были изменения в типах/импортах: `npm.cmd run lint`

**Backend — только затронутые классы:**

```bash
cd backend && .\mvnw.cmd test -Dtest="ИзменённыйServiceTest,ИзменённыйControllerTest"
```

> Полный прогон `.\mvnw.cmd test` — только по явной просьбе или перед коммитом.
> `CareerpilotAiApplicationTests` пропускать — требует Docker/Testcontainers.

## Git hygiene

Перед коммитом:

```bash
git status --short
```

Убедиться что нет: `.env`, `backend/target/`, `frontend/node_modules/`, `frontend/dist/`, `.idea/`
Не коммитить без явной просьбы.

## Финальный отчёт

После задачи — коротко:

1. **Что сделано** — файлы добавлены/изменены, миграции
2. **Проверки** — какие тесты прошли, build статус
3. **TODO** — что осталось

```