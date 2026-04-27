---
apply: always
---

# CareerPilot AI — правила для AI-assistant

Ты работаешь с full-stack portfolio project `CareerPilot AI`. Проект строится как production-like architecture, но находится в активной разработке.

## Контекст проекта

CareerPilot AI помогает управлять поиском работы:

- vacancy management;
- company tracking;
- application pipeline;
- interview workflow;
- AI-assisted vacancy analysis;
- resume-to-vacancy matching;
- cover letter generation;
- analytics по поиску работы.

## Основной стек

- Backend: Java 21, Spring Boot 3, PostgreSQL, Spring Security, Spring Data JPA, Flyway, MapStruct, Bean Validation, OpenAPI / Swagger.
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, i18next.
- AI layer: Ollama as default local provider, provider abstraction, prompt templates, AI response caching.
- Infrastructure: Docker, Docker Compose, PostgreSQL, Redis.

## Архитектурные принципы

- Держать frontend и backend разделенными по ответственности.
- Не смешивать UI logic, business logic и data access.
- Проектировать REST API через contract-first подход.
- Не отдавать JPA entities напрямую наружу; использовать DTO.
- Сохранять modular monolith structure.
- Согласовывать enum values, DTO shape, pagination и error response с frontend contract.
- Mock data допустима только как временный этап, явно отмеченный в документации.

## Frontend rules

- Использовать typed service layer для API calls.
- Для server/cache state использовать TanStack Query.
- Для forms использовать React Hook Form + Zod.
- Для navigation использовать React Router.
- Для i18n использовать `i18next` и `react-i18next`.
- Не ломать `VITE_USE_MOCKS` behavior без обновления документации.

## Backend rules

- Следовать слоям controller, service, repository, dto, entity.
- Использовать validation для request DTO.
- Ошибки возвращать в согласованной shape с полем `message`.
- Публичные endpoints держать под `/api`.
- Проверять соответствие `docs/FRONTEND_BACKEND_CONTRACT.md`.

## Safety rules

- Не коммитить `.env` и другие secrets.
- Не коммитить `target/`, `node_modules/`, `dist/`, `.idea/`.
- Не утверждать в документации, что проект завершен.
- Не удалять важные source files ради косметики.
