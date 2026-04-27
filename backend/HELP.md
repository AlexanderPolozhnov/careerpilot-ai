# Справка backend-модуля CareerPilot AI

Этот файл заменяет стандартный Spring Boot generated help и оставляет только полезные ссылки и заметки для backend-модуля.

## Основные команды

Windows:

```powershell
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
```

Unix-like:

```bash
./mvnw spring-boot:run
./mvnw test
```

## Локальная инфраструктура

PostgreSQL и Redis запускаются из корня репозитория:

```bash
docker compose up -d postgres redis
```

Optional profiles:

```bash
docker compose --profile storage up -d minio
docker compose --profile ai up -d ollama
```

## Testcontainers

Backend tests могут требовать доступный Docker runtime. Если Docker недоступен, `mvnw test` может падать на старте ApplicationContext с ошибкой Testcontainers о невозможности найти valid Docker environment.

## Полезные ссылки

- [Spring Boot Maven Plugin](https://docs.spring.io/spring-boot/maven-plugin/)
- [Spring Boot Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html)
- [Testcontainers PostgreSQL module](https://java.testcontainers.org/modules/databases/postgres/)
- [Spring Web](https://docs.spring.io/spring-boot/reference/web/servlet.html)
- [Spring Security](https://docs.spring.io/spring-boot/reference/web/spring-security.html)
- [Spring Data JPA](https://docs.spring.io/spring-boot/reference/data/sql.html)
- [Flyway](https://documentation.red-gate.com/fd)

## Документация проекта

- [Руководство разработчика](../docs/README.DEV.md)
- [Контракт Frontend/Backend](../docs/FRONTEND_BACKEND_CONTRACT.md)
