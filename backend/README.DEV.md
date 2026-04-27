# Заметки по backend-модулю CareerPilot AI

Backend-модуль CareerPilot AI реализуется на Java 21 и Spring Boot 3. Это часть monorepo и разрабатывается как modular monolith с доменными модулями для auth, vacancies, applications, companies, AI, analytics и связанных workflow.

Полный общий dev guide находится здесь:

- [Руководство разработчика](../docs/README.DEV.md)
- [Контракт Frontend/Backend](../docs/FRONTEND_BACKEND_CONTRACT.md)

## Стек

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

## Команды

Запуск на Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Запуск на Unix-like системах:

```bash
./mvnw spring-boot:run
```

Тесты на Windows:

```powershell
.\mvnw.cmd test
```

Тесты на Unix-like системах:

```bash
./mvnw test
```

Тесты могут требовать Docker, потому что test configuration использует Testcontainers.

## Переменные окружения

Локальный пример находится в `.env.example`.

Реальные `.env` файлы не коммитятся. Для публичного репозитория должны оставаться только безопасные примеры вроде `.env.example`.

## Интеграционный фокус

Текущий приоритет backend - привести endpoints, DTO, enum values, pagination и error response к контракту, который ожидает frontend service layer.

Особенно важны:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/vacancies`
- `GET /api/applications/board`
- `GET /api/companies`
- `POST /api/ai/analyze-vacancy`
- `GET /api/analytics/summary`
