# Task: AI Observability (Metrics: Latency, Tokens, Error Tracking)

## Контекст и цель
Добавить отслеживание метрик для всех AI-запросов: время выполнения (latency), количество использованных токенов (tokens) и логирование ошибок. Это необходимо для мониторинга производительности LLM и подготовки к расчету стоимости (cost) в будущем.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/dto/LlmResponse.java` — DTO для внутреннего обмена данными между провайдером и сервисом.

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/entity/AiEntity.java` — добавить поле `latencyMs`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/LlmProvider.java` — изменить сигнатуру `generate`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/OllamaLlmProvider.java` — реализовать извлечение метрик из ответа Ollama.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/AiServiceImpl.java` — сохранять метрики при создании записи.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/response/AiResultDto.java` — добавить новые поля для фронтенда.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/mapper/AiMapper.java` — обновить маппинг.
- `frontend/src/types/index.ts` — обновить интерфейс `AiResult`.
- `backend/src/main/resources/db/migration/V19__add_ai_metrics_columns.sql` — Flyway миграция.

## Backend: точная реализация

### Entity / DTO

**AiEntity.java**
```java
@Column(name = "latency_ms")
private Long latencyMs;

@Column(name = "error_message", columnDefinition = "TEXT")
private String errorMessage;
```

**LlmResponse.java (record)**
```java
public record LlmResponse(
    String text,
    Integer tokens,
    Long latencyMs,
    String errorMessage
) {}
```

### Service

**LlmProvider.java**
```java
LlmResponse generate(String prompt);
```

**OllamaLlmProvider.java**
Обновить метод `generate`, чтобы он извлекал `total_duration` (конвертировать наносекунды в миллисекунды), `prompt_eval_count` + `eval_count` для токенов.

**AiServiceImpl.java**
В методе `createAndSave` (и во всех вызывающих методах) принимать `LlmResponse` и заполнять поля сущности.

### Flyway миграция
**V19__add_ai_metrics_columns.sql**
```sql
ALTER TABLE careerpilot.ai_results ADD COLUMN latency_ms BIGINT;
ALTER TABLE careerpilot.ai_results ADD COLUMN error_message TEXT;
```

## Frontend: точная реализация

### TypeScript типы (types/index.ts)
```typescript
export interface AiResult {
  // ... existing
  tokensUsed?: number;
  latencyMs?: number;
  errorMessage?: string;
}
```

### i18n ключи
Добавить в `common.json` или `ai.json` (если есть) или `ru.json`:
```json
"ai": {
  "metrics": {
    "latency": "Задержка: {{ms}}мс",
    "tokens": "Токены: {{count}}"
  }
}
```

## Порядок реализации для SWE-1.6
1. Создать миграцию V19.
2. Создать `LlmResponse` record.
3. Изменить интерфейс `LlmProvider` и его реализацию `OllamaLlmProvider`.
4. Обновить `AiEntity`, `AiResultDto` и `AiMapper`.
5. Обновить `AiServiceImpl`, чтобы он замерял время (StopWatch) и сохранял все метрики.
6. Обновить типы на фронтенде.
7. (Бонус) Вывести метрики в `AiAssistantPage` в списке истории.

## Риски и что проверить
- **Ollama Fallback:** убедиться, что при fallback-режиме метрики (tokens, latency) заполняются дефолтными значениями (или 0), а не остаются null, если это критично.
- **Unit тесты:** обновить `AiServiceImplTest`, так как изменится сигнатура `LlmProvider.generate`.
- **N+1:** не применимо здесь.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="AiServiceImplTest"`
**Frontend:** `cd frontend && npm.cmd run build`
