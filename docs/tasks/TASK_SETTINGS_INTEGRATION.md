# Task: Settings & Preferences Vertical Integration

## Summary
Реализация полной вертикальной интеграции настроек пользователя (Preferences) между Frontend и Backend. 
Это включает в себя добавление недостающего поля `taskReminders` (напоминания о дедлайнах задач) во всю цепочку данных и перевод `SettingsPage` с моков на реальное API.

## Proposed Changes

### Backend

#### 1. DTO Updates
- **File:** `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/request/PreferencesRequest.java`
    - Добавить поле `boolean taskReminders`.
- **File:** `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/response/PreferencesResponse.java`
    - Добавить поле `boolean taskReminders`.

#### 2. Service Layer Mapping
- **File:** `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/service/PreferencesServiceImpl.java`
    - В методе `updatePreferences`: добавить `prefs.setTaskReminders(request.taskReminders())`.
    - В методе `toResponse`: добавить `prefs.isTaskReminders()` в конструктор `PreferencesResponse`.

### Frontend

#### 3. Service Interfaces
- **File:** `frontend/src/services/settings.service.ts`
    - Обновить интерфейсы `PreferencesRequest` и `PreferencesResponse`, добавив `taskReminders: boolean`.
    - Обновить `mockPreferences`, добавив `taskReminders: true`.

#### 4. i18n Locales
- **File:** `frontend/src/i18n/locales/en.json`
    - Добавить:
        ```json
        "taskReminders": "Task reminders",
        "taskRemindersDescription": "Get notified when tasks are reaching their deadlines"
        ```
- **File:** `frontend/src/i18n/locales/ru.json`
    - Добавить:
        ```json
        "taskReminders": "Напоминания о задачах",
        "taskRemindersDescription": "Получайте уведомления, когда срок выполнения задачи подходит к концу"
        ```

#### 5. UI Implementation (SettingsPage)
- **File:** `frontend/src/pages/SettingsPage.tsx`
    - **Zod Schema:** Добавить `taskReminders: z.boolean()` в `preferencesSchema`.
    - **Form Defaults:** Обновить `defaultValues` в `useForm<PreferencesValues>`.
    - **Effect:** Обновить `useEffect` для `prefsData`, чтобы корректно устанавливать `taskReminders`.
    - **Render:** Добавить новый блок с `Toggle` для `taskReminders` в секцию "Notifications" (аналогично `interviewReminders`).

## Verification Plan

### Automated Tests
1. **Backend Integration Test:**
    - Обновить или создать тест в `PreferencesControllerIT.java` (если существует) или проверить через Postman/Curl.
    - Убедиться, что `PUT /api/preferences` сохраняет `taskReminders` и `GET /api/preferences` возвращает его.

### Manual Verification
1. Открыть страницу настроек (`/settings`).
2. Убедиться, что текущие настройки загружаются с бэкенда.
3. Переключить тумблер "Напоминания о задачах".
4. Перезагрузить страницу и убедиться, что состояние сохранилось.
5. Проверить смену языка — ключи для новых настроек должны отображаться корректно.
6. Проверить интеграцию с AI — выбор провайдера должен корректно сохраняться и восстанавливаться.
