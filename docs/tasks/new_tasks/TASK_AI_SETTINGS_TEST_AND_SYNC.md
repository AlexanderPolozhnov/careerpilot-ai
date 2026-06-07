# Task: AI Settings Test Connection and Model Sync

## Контекст и цель
Добавить возможность пользователю тестировать соединение с AI-провайдером (OpenAI, Gemini, Ollama) до сохранения настроек, а также синхронизировать список доступных моделей по ключу/URL. Это улучшит UX, избавляя от необходимости вводить названия моделей вручную и позволяя убедиться в работоспособности ключа.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/request/AiProviderConfigRequest.java` — DTO для передачи временных настроек провайдера.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/response/AiTestConnectionResponse.java` — DTO для результата теста (успех, сообщение, задержка).

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/LlmProvider.java` — добавить метод `getAvailableModels`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/OpenAiLlmProvider.java` — реализовать получение списка моделей.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/GeminiLlmProvider.java` — реализовать получение списка моделей.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/OllamaLlmProvider.java` — реализовать получение списка моделей.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/AiService.java` — добавить методы тестирования и синхронизации.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/AiServiceImpl.java` — реализация логики тестирования (запрос "Say OK") и вызов синхронизации.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/controller/AiController.java` — добавить POST эндпоинты.
- `docs/FRONTEND_BACKEND_CONTRACT.md` — задокументировать новые эндпоинты.
- `frontend/src/services/ai.service.ts` — добавить API-вызовы.
- `frontend/src/pages/SettingsPage.tsx` — добавить кнопки теста и синхронизации, интегрировать `CustomSelect` или `datalist` для моделей.
- `frontend/src/i18n/locales/ru.json` / `en.json` — добавить тексты кнопок и статусов.

## Backend: точная реализация

### Entity / DTO
`AiProviderConfigRequest.java`:
```java
public record AiProviderConfigRequest(
    @NotNull AiProviderMode aiProviderMode,
    CustomAiProvider customAiProvider,
    @Size(max = 255) String openAiApiKey,
    @Size(max = 50) String openAiModel,
    @Size(max = 255) String ollamaUrl,
    @Size(max = 50) String ollamaModel,
    @Size(max = 255) String geminiApiKey,
    @Size(max = 50) String geminiModel
) {}
```

`AiTestConnectionResponse.java`:
```java
public record AiTestConnectionResponse(
    boolean success,
    String message,
    Long latencyMs
) {}
```

### Service Interface (`LlmProvider.java`)
Добавить метод:
```java
List<String> getAvailableModels(PreferencesEntity preferences);
```

### Service Implementation (`*LlmProvider.java`)
- **OpenAiLlmProvider**: GET `https://api.openai.com/v1/models` с `Authorization: Bearer {key}`. Парсинг JSON `data[].id`.
- **GeminiLlmProvider**: GET `https://generativelanguage.googleapis.com/v1beta/models?key={key}`. Парсинг JSON `models[].name` (и убрать префикс `models/` если нужно, или оставить как есть, в зависимости от того, что принимает generateContent).
- **OllamaLlmProvider**: GET `{ollamaUrl}/api/tags`. Парсинг JSON `models[].name`.

### Service (`AiServiceImpl.java`)
Добавить методы:
```java
public AiTestConnectionResponse testConnection(AiProviderConfigRequest request) { ... }
public List<String> syncModels(AiProviderConfigRequest request) { ... }
```
Логика `testConnection`:
1. Маппинг `request` в transient `PreferencesEntity`.
2. Если модель не указана, подставить базовую (Ollama: `llama3`, OpenAI: `gpt-4o-mini`, Gemini: `gemini-1.5-flash`).
3. Получить провайдер через `LlmProviderFactory.getProvider(prefs)`.
4. Засечь время (`StopWatch`), вызвать `provider.generate("Say exactly: OK", prefs)`.
5. Вернуть `new AiTestConnectionResponse(true, "OK", latencyMs)`.
6. Обернуть в try-catch, при ошибке вернуть `success = false`, `message = e.getMessage()`.

### Controller (`AiController.java`)
```java
@PostMapping("/test-connection")
public AiTestConnectionResponse testConnection(@Valid @RequestBody AiProviderConfigRequest request) {
    return aiService.testConnection(request);
}

@PostMapping("/models/sync")
public List<String> syncModels(@Valid @RequestBody AiProviderConfigRequest request) {
    return aiService.syncModels(request);
}
```

### Flyway миграция
Не нужна. Изменений схемы БД нет.

## Frontend: точная реализация

### API-функция (services/ai.service.ts)
```typescript
export interface AiProviderConfigRequest {
    aiProviderMode: 'LOCAL' | 'CLOUD' | 'BRING_YOUR_OWN_KEY';
    customAiProvider?: 'OPENAI' | 'GEMINI';
    openAiApiKey?: string;
    openAiModel?: string;
    ollamaUrl?: string;
    ollamaModel?: string;
    geminiApiKey?: string;
    geminiModel?: string;
}

export interface AiTestConnectionResponse {
    success: boolean;
    message: string;
    latencyMs?: number;
}

testConnection: async (req: AiProviderConfigRequest): Promise<AiTestConnectionResponse> => {
    const { data } = await api.post<AiTestConnectionResponse>('/ai/test-connection', req);
    return data;
},
syncModels: async (req: AiProviderConfigRequest): Promise<string[]> => {
    const { data } = await api.post<string[]>('/ai/models/sync', req);
    return data;
}
```

### Компонент/страница (`SettingsPage.tsx`)
- Добавить хуки `useMutation` для `testConnection` и `syncModels`.
- В блоках настройки провайдеров добавить ряд кнопок (Test Connection, Sync Models).
- При клике собирать текущие значения формы через `prefsForm.getValues()`.
- При успешном `syncModels` сохранять полученный список моделей в локальный state компонента (например `openaiModels`, `geminiModels`, `ollamaModels`).
- Заменить обычные `<input>` для моделей на `CustomSelect` (или `<input list="models">`), передавая в `options` синхронизированные списки.
- Если список не пуст и текущая модель пустая, автоматически подставить первую модель в `prefsForm.setValue`.
- Обработка токенов маскировки: если ключ содержит `...` (уже сохранённый маскированный), использовать реальный ключ при тестировании невозможно (т.к. фронтенд его не знает). Нужно предупредить пользователя (через i18n) или позволить бэкенду использовать текущий ключ из `CurrentUser`. Для простоты на бэкенде: если `apiKey` содержит `...`, загружаем ключ из БД для текущего пользователя.

### i18n ключи (ru.json / en.json)
- `settings.testConnection`: "Тест соединения" / "Test Connection"
- `settings.syncModels`: "Синхронизировать модели" / "Sync Models"
- `settings.testSuccess`: "Успешно! Задержка: {{ms}}мс" / "Success! Latency: {{ms}}ms"
- `settings.testFailed`: "Ошибка: {{message}}" / "Error: {{message}}"
- `settings.modelsSynced`: "Модели загружены" / "Models synced"

## Порядок реализации для агента реализации
1. Создание Request/Response DTO на бэкенде.
2. Обновление интерфейса `LlmProvider` и его реализаций для извлечения моделей.
3. Обновление `AiService` для `testConnection` (с обработкой маскированных ключей) и `syncModels`.
4. Создание эндпоинтов в `AiController`.
5. Добавление документации в `FRONTEND_BACKEND_CONTRACT.md`.
6. Обновление `ai.service.ts` на фронтенде с новыми типами и методами.
7. Добавление логики и UI кнопок в `SettingsPage.tsx`.
8. Добавление ключей локализации и проверка UI.

## Риски и что проверить
- Обработка маскированных ключей (`sk-...`): фронт не может отправить их для теста, бэкенд должен подтягивать из `PreferencesRepository` если видит маску.
- Запросы к сторонним API могут долго висеть (timeout) — на фронтенде нужно дизейблить кнопки и крутить лоадер.
- CORS для API сторонних сервисов не нужен, так как запросы идут с бэкенда.

## Проверки после реализации
**Backend:** `.\mvnw.cmd clean compile -DskipTests`
**Frontend:** `cd frontend && npm.cmd run build`
