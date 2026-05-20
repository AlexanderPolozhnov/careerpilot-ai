# Task: Scheduled Notifications (Reminders for Tasks and Interviews)

## Контекст и цель
Текущая система уведомлений позволяет просматривать список уведомлений, но они не создаются автоматически при приближении дедлайнов задач или времени собеседований. Необходимо реализовать фоновый процесс (Scheduler), который будет проверять предстоящие события и генерировать внутренние уведомления, а также отправлять Email-напоминания (согласно предпочтениям пользователя).

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/notification/service/ReminderScheduler.java` — планировщик, запускающий проверку по расписанию.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/notification/service/NotificationCreator.java` — внутренний сервис для создания уведомлений разных типов.

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/config/AsyncConfig.java` — добавить `@EnableScheduling`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/interview/entity/InterviewEntity.java` — добавить поле `reminderSent`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/task/entity/TaskEntity.java` — добавить поле `reminderSent`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/interview/repository/InterviewRepository.java` — добавить метод поиска предстоящих собеседований без отправленного напоминания.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/task/repository/TaskRepository.java` — добавить метод поиска предстоящих задач без отправленного напоминания.
- `backend/src/main/resources/db/migration/V20__add_reminder_sent_flags.sql` — Flyway миграция для новых полей.

## Backend: точная реализация

### Entity / DTO

**InterviewEntity.java / TaskEntity.java**
```java
@Column(name = "reminder_sent", nullable = false)
private boolean reminderSent = false;
```

### Repository

**InterviewRepository.java**
```java
List<InterviewEntity> findAllByScheduledAtBetweenAndReminderSentFalse(Instant from, Instant to);
```

**TaskRepository.java**
```java
List<InterviewEntity> findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(Instant from, Instant to);
```

### Service

**NotificationCreator.java**
Метод `createNotification(User user, NotificationType type, String title, String message, String targetUrl)`.
Этот сервис инкапсулирует логику:
1. Сохранение `NotificationEntity`.
2. Проверка `PreferencesEntity` пользователя.
3. Если `interviewReminders == true` (для собеседований) и это тип напоминания — вызов `EmailService.sendHtmlMessage`.

**ReminderScheduler.java**
Метод с аннотацией `@Scheduled(cron = "0 0 * * * *")` (раз в час).
Логика:
1. Определить окно: `Instant.now()` до `Instant.now().plus(Duration.ofHours(24))`.
2. Найти все `InterviewEntity` в этом окне с `reminderSent == false`.
3. Для каждого: 
   - Вызвать `NotificationCreator`.
   - `interview.setReminderSent(true)`.
   - `interviewRepository.save(interview)`.
4. Аналогично для `TaskEntity`.

### Flyway миграция
**V20__add_reminder_sent_flags.sql**
```sql
ALTER TABLE careerpilot.interviews ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE careerpilot.tasks ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_interviews_reminder_sent ON careerpilot.interviews (reminder_sent, scheduled_at);
CREATE INDEX idx_tasks_reminder_sent ON careerpilot.tasks (reminder_sent, due_at);
```

## Порядок реализации для SWE-1.6
1. Создать миграцию V20.
2. Добавить `@EnableScheduling` в `AsyncConfig` (или создать `SchedulingConfig`).
3. Обновить `InterviewEntity` и `TaskEntity`, добавить поля и обновить репозитории.
4. Создать `NotificationCreator` для удобного создания уведомлений и интеграции с Email.
5. Реализовать `ReminderScheduler` с логикой проверки окна в 24 часа.
6. Проверить работу через Unit-тест планировщика (мокнуть репозитории и проверить вызовы).

## Риски и что проверить
- **Timezones:** Помнить, что в БД всё в `Instant` (UTC). Проверка `ScheduledAtBetween` должна учитывать это.
- **Transactionality:** Каждый цикл обработки одной сущности в планировщике должен быть в своей транзакции (или весь метод), чтобы `reminderSent = true` зафиксировалось и не было дублей.
- **Email Rate Limits:** Если пользователей много, массовая рассылка может забить поток. `@Async` в `EmailService` поможет, но нужно следить за очередью.

## Проверки после реализации
**Backend:** `.\mvnw.cmd clean compile`
**Unit Test:** Создать `ReminderSchedulerTest` и проверить, что при наличии записи в окне вызывается `notificationRepository.save` и `emailService.send`.
**Manual:** Можно временно выставить cron на `*/10 * * * * *` (каждые 10 сек) и создать задачу с дедлайном через 5 минут.
