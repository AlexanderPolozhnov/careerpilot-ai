# Task: Реализация Rate Limiting для AI-эндпоинтов

## Контекст и цель
AI-операции (анализ вакансий, генерация писем и т.д.) являются наиболее ресурсоемкими частями приложения. Чтобы предотвратить злоупотребление (abuse) и защитить систему от перегрузки (или лишних затрат в случае использования облачных LLM), необходимо внедрить ограничение частоты запросов (Rate Limiting) на уровне аутентифицированного пользователя.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/common/ratelimit/RateLimit.java` — аннотация для методов
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/common/ratelimit/RateLimiterAspect.java` — логика проверки лимитов через AOP
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/common/ratelimit/RateLimitException.java` — исключение при превышении лимита

### Изменить существующие
- `backend/pom.xml` — добавить зависимость `bucket4j-core`
- `backend/src/main/resources/application.yaml` — добавить параметры лимитов (например, 5 запросов в минуту для AI)
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/controller/AiController.java` — применить аннотацию `@RateLimit` к POST эндпоинтам
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/common/api/error/GlobalExceptionHandler.java` — добавить обработку `RateLimitException` (возвращать HTTP 429)

## Backend: точная реализация

### Аннотация `@RateLimit`
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    String key() default "default";
    int capacity() default 5;
    int refillTokens() default 5;
    int refillDurationMinutes() default 1;
}
```

### RateLimiterAspect
Должен использовать `userId` из `SecurityContext` и `Bucket4j`. Для простоты в v1 можно использовать In-memory хранилище (Map), либо Redis-backed хранилище, если планируется масштабирование. Учитывая наличие Redis, рекомендуется использовать `ProxyManager` из Bucket4j для Redis.

### Controller (AiController)
```java
@RateLimit(key = "ai_generation", capacity = 10, refillTokens = 10, refillDurationMinutes = 60)
@PostMapping("/analyze-vacancy")
public AiResponse analyzeVacancy(...) { ... }
```

### Flyway миграция
Не нужна.

## Frontend: точная реализация
Изменения во фронтенде не требуются, так как `api-client.ts` уже имеет глобальный перехват ошибок. При получении 429 ошибки пользователь увидит Toast с сообщением об ошибке (сообщение должно быть добавлено в i18n).

### i18n ключи
- `ru.json`: `"error.tooManyRequests": "Слишком много запросов. Пожалуйста, подождите."`
- `en.json`: `"error.tooManyRequests": "Too many requests. Please wait."`

## Порядок реализации для SWE-1.6
1. Добавить зависимость `bucket4j-core` (или `bucket4j-redis`) в `pom.xml`.
2. Создать аннотацию `@RateLimit` и исключение `RateLimitException`.
3. Реализовать `RateLimiterAspect`, который извлекает `userId` и применяет лимит.
4. Добавить обработчик `RateLimitException` в `GlobalExceptionHandler`.
5. Разметить методы в `AiController` аннотацией.
6. Протестировать, отправив серию запросов к AI эндпоинту.

## Риски и что проверить
- **Конкурентность**: Убедиться, что `Bucket` в Map создается атомарно (computeIfAbsent).
- **Redis**: Если используется Redis, проверить корректность сериализации и доступность при падении Redis (fallback).

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="AiControllerTest"` (добавить тест на 429 статус)
**Frontend:** `npm run build` (проверка i18n)
