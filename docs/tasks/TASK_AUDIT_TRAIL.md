# Task: Реализация Audit Trail (логирование действий пользователя)

## Контекст и цель
В рамках фазы "Production Readiness" и повышения безопасности (Security Hardening) необходимо внедрить механизм Audit Trail — журналирование критичных действий пользователей. В кодовой базе уже существует таблица `audit_logs` и сущность `AuditLogEntity`, которые используют паттерн `entityType`/`entityId` и `metadata` (JSONB) для сохранения логов. Необходимо использовать существующую инфраструктуру БД и сущности.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/audit/repository/AuditLogRepository.java` — Spring Data репозиторий
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/audit/service/AuditLogService.java` — сервис (с асинхронным сохранением)
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/audit/annotation/Auditable.java` — кастомная аннотация
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/audit/aspect/AuditAspect.java` — аспект для перехвата методов

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/CareerpilotAiApplication.java` — добавить `@EnableAsync`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/controller/AuthController.java` — добавить `@Auditable`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/controller/VacancyController.java` — добавить `@Auditable`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/controller/AiController.java` — добавить `@Auditable`

## Backend: точная реализация

### Flyway миграция
Не нужна. Таблица `audit_logs` уже создана в `V1__init.sql`.

### Entity (`AuditLogEntity.java`)
Сущность уже существует. Она использует поля: `user`, `action`, `entityType`, `entityId`, `metadata` (jsonb), `createdAt`. Оставить как есть.

### Annotation
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String action();
    String entityType() default "SYSTEM";
}
```

### Service
Метод `logAction(UUID userId, String action, String entityType, UUID entityId, String metadataJson)`. Должен быть аннотирован `@Async`, чтобы запись в БД не блокировала HTTP-ответ.

### Aspect
Аннотация `@AfterReturning(pointcut = "@annotation(auditable)", returning = "result")`.
- **User ID**: Безопасно получить из `SecurityContextHolder.getContext().getAuthentication()`. Если аутентификация есть, найти ID. Если нет (например, логин только что прошел успешно) — можно вытащить ID из возвращаемого объекта `AuthResponse`.
- **Entity ID**: Можно извлекать из возвращаемого объекта (например, если метод возвращает `VacancyResponse`, взять его `id`). Если ID извлечь сложно, оставить `null`.
- **Metadata**: IP адрес запроса `((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest().getRemoteAddr()`, можно сериализовать в JSON: `{"ipAddress": "127.0.0.1"}`.

Пример значений `action`: `USER_LOGIN`, `USER_REGISTER`, `VACANCY_CREATE`, `VACANCY_DELETE`, `AI_USE`.

## Frontend: точная реализация
Фронтенд изменения не требуются (бэкенд-only фича).

## Порядок реализации для SWE-1.6
1. Добавить `AuditLogRepository`.
2. Реализовать `AuditLogService` с `@Async` (не забудь добавить `@EnableAsync` в главный класс приложения). Для работы с `metadata` (jsonb) удобно передавать JSON-строку.
3. Создать аннотацию `@Auditable` и `AuditAspect`.
4. Аккуратно извлекать `userId` в аспекте. Обрати внимание, что при `USER_LOGIN` SecurityContext еще может быть пуст ДО выполнения метода, но ПОСЛЕ успешного метода (в Returning) пользователь уже известен.
5. IP-адрес лучше получать в начале аспекта (или передавать в сервис), так как Spring `@Async` выполняется в другом потоке.
6. Расставить аннотации `@Auditable` в `AuthController`, `VacancyController`, `AiController`.

## Риски и что проверить
- **Контекст в Async**: Обрати внимание, что Spring `@Async` выполняется в другом потоке, поэтому извлекать `HttpServletRequest` нужно строго ВНУТРИ аспекта до вызова сервиса, передавая в `logAction` уже готовые String значения (ipAddress).
- **Null Authentication**: При ошибках входа (BadCredentials) мы все равно можем хотеть писать аудит. Убедись, что аспект не падает с NullPointerException.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test`
**Manual:** Выполнить логин, зайти в БД `SELECT * FROM audit_logs;` и убедиться, что запись появилась с заполненными `entity_type` и `metadata`.
