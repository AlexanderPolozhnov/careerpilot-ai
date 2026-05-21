# Task: CI/CD Fixes (Frontend & Backend)

## Контекст и цель
Исправление ошибок, блокирующих CI/CD пайплайн.
1. Frontend: Ошибка типизации в `AuthContext.tsx` (`User | undefined` vs `User | null`).
2. Backend: Падение тестов `ReminderSchedulerTest` из-за рассинхронизации с обновленной логикой `ReminderScheduler`.

## Затрагиваемые файлы

### Изменить существующие
- `frontend/src/context/AuthContext.tsx` — исправить маппинг `user`
- `backend/src/test/java/com/alexanderpolozhnov/careerpilot/notification/service/ReminderSchedulerTest.java` — обновить моки и верификации

## Frontend: точная реализация

В `frontend/src/context/AuthContext.tsx`:
В объекте `value` провайдера заменить `user` на `user ?? null`.

```tsx
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        // ...
      }}
    >
      {children}
    </AuthContext.Provider>
  )
```

## Backend: точная реализация

Обновить `ReminderSchedulerTest.java`:
1. Добавить мок для `NotificationRepository`.
2. Обновить вызовы `verify(notificationCreator).createNotification(...)` — теперь они должны содержать 7 аргументов.
3. Добавить моки для новых вызовов репозиториев в `processOverdueItems` (окно `windowStart` до `now`).
4. В методе `setUp` добавить дефолтные моки для новых методов репозиториев, чтобы старые тесты не падали на пустых списках.

### Пример обновления верификации:
```java
verify(notificationCreator).createNotification(
    eq(user), 
    eq(NotificationType.INTERVIEW_REMINDER), 
    anyString(), 
    anyString(), 
    eq(interview.getId()), 
    eq("INTERVIEW"), 
    eq(false)
);
```

## Порядок реализации для SWE-1.6
1. Исправить типизацию в `frontend/src/context/AuthContext.tsx`.
2. В `backend/src/test/java/com/alexanderpolozhnov/careerpilot/notification/service/ReminderSchedulerTest.java`:
    - Добавить `@Mock private NotificationRepository notificationRepository;`.
    - Обновить все `verify` для `createNotification`.
    - Обновить `when` для репозиториев, так как теперь вызываются методы с разными окнами времени.
    - Добавить моки для `findAllByScheduledAtBetweenAndReminderSentTrue` и аналогичных.
3. Запустить тесты фронтенда: `cd frontend && npm run build`.
4. Запустить тесты бэкенда: `cd backend && .\mvnw.cmd test -Dtest="ReminderSchedulerTest"`.

## Риски и что проверить
- Убедиться, что `AuthContext` не ломает компоненты, которые полагались на `User | undefined` (хотя по контракту там должен быть `null`).
- В тестах бэкенда внимательно следить за `ArgumentMatchers` (`any()`, `eq()`), так как Mockito не позволяет смешивать сырые значения и матчеры в одном вызове.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="ReminderSchedulerTest"`
**Frontend:** `cd frontend && pnpm run build`
