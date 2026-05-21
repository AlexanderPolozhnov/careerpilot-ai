# Task: Уведомления об изменении статуса отклика (Application Status Notifications)

## Контекст и цель
Автоматизировать отправку уведомлений (In-app и Email) при изменении статуса отклика на вакансию. Это позволит пользователю отслеживать историю изменений и получать оперативные оповещения о продвижении по воронке найма.

## Затрагиваемые файлы

### Изменить существующие
- `backend/src/main/resources/db/migration/V22__add_application_status_notifications_pref.sql` — новая миграция
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/entity/PreferencesEntity.java` — добавить поле настройки
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/request/PreferencesRequest.java` — добавить поле в запрос
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/response/PreferencesResponse.java` — добавить поле в ответ
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/service/PreferencesServiceImpl.java` — логика сохранения настройки
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/notification/service/NotificationCreator.java` — поддержка Email для нового типа
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/service/ApplicationServiceImpl.java` — вызов создания уведомления
- `frontend/src/services/settings.service.ts` — обновить типы и моки
- `frontend/src/pages/SettingsPage.tsx` — добавить тумблер в интерфейс
- `frontend/src/i18n/locales/ru.json` / `en.json` — добавить локализацию

## Backend: точная реализация

### Entity / DTO
- **PreferencesEntity**: `private boolean applicationStatusNotifications = true;`
- **PreferencesRequest / Response**: `boolean applicationStatusNotifications`

### Service
- **NotificationCreator**:
    - В методе `createNotification` добавить условие для `NotificationType.APPLICATION_STATUS`.
    - Если `preferences.isApplicationStatusNotifications()` истинно, вызывать `emailService.sendReminderEmail`.
- **ApplicationServiceImpl**:
    - Внедрить `NotificationCreator`.
    - В методах `create` и `updateStatus` после сохранения сущности вызывать `notificationCreator.createNotification`.
    - **Title:** `t('notifications.application_status.title')` или фиксированная строка "Обновление статуса отклика".
    - **Message:** "Статус вашего отклика на вакансию {Title} в {Company} изменен на {Status}".

### Flyway миграция
```sql
ALTER TABLE careerpilot.user_preferences 
ADD COLUMN application_status_notifications BOOLEAN DEFAULT TRUE;
```

## Frontend: точная реализация

### TypeScript типы (services/settings.service.ts)
```typescript
export interface PreferencesResponse {
  // ...
  applicationStatusNotifications: boolean;
}
```

### Компонент/страница (SettingsPage.tsx)
- Добавить `applicationStatusNotifications` в `zod` схему формы настроек.
- Добавить `FormField` с компонентом `Switch` (или аналогичным тумблером) в секцию уведомлений.
- Label: `t('settings.notifications.applicationStatus')`
- Description: `t('settings.notifications.applicationStatusDescription')`

### i18n ключи
**ru.json:**
```json
{
  "settings": {
    "notifications": {
      "applicationStatus": "Уведомления о статусе откликов",
      "applicationStatusDescription": "Получать уведомления при изменении этапа найма по вашим откликам"
    }
  },
  "notifications": {
    "application_status": {
      "title": "Обновление статуса",
      "message": "Статус отклика на вакансию {{vacancy}} в {{company}} изменен на {{status}}"
    }
  }
}
```

## Порядок реализации для SWE-1.6
1. Создать SQL миграцию V22.
2. Обновить `PreferencesEntity` и связанные DTO/Mapper.
3. Обновить `NotificationCreator` для поддержки Email-уведомлений типа `APPLICATION_STATUS`.
4. Интегрировать вызов `NotificationCreator` в `ApplicationServiceImpl` (методы `create` и `updateStatus`).
5. Обновить фронтенд-сервис `settings.service.ts` (типы и моки).
6. Обновить `SettingsPage.tsx` и добавить ключи локализации.

## Риски и что проверить
- **N+1 при уведомлении:** Убедиться, что при создании уведомления в `ApplicationServiceImpl` данные вакансии и компании загружены (использовать существующие связи).
- **Локализация на бэкенде:** Поскольку `NotificationCreator` создает текстовое сообщение, для Email оно будет на языке, заданном в коде (обычно русском для этого проекта), либо нужно извлекать `preferences.getLanguage()`.
- **Дубликаты уведомлений:** При создании отклика (`create`) уведомление должно создаваться только если статус не `SAVED` (по желанию).

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="ApplicationServiceImplTest,PreferencesServiceImplTest,NotificationCreatorTest"`
**Frontend:** `cd frontend && npm.cmd run lint && npm.cmd run build`
