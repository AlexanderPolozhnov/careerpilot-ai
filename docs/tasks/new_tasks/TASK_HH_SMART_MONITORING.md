# Task: Интеграция умного мониторинга вакансий hh.ru (Обходной путь)

## Контекст и цель
Из-за закрытия OAuth API hh.ru для соискателей, интеграция переводится на безопасный обходной путь (White-hat scraping / Public API). 
Цель: дать пользователю возможность сохранить текст своего резюме и шаблона сопроводительного письма в нашей БД, а также настроить фильтры для поиска. Бэкенд будет по расписанию (Quartz/`@Scheduled`) опрашивать публичное API hh.ru (`GET /vacancies`), находить новые вакансии, через ИИ сравнивать их с сохраненным резюме (match > 80%), и в случае успеха автоматически генерировать письмо и присылать уведомление со ссылкой в Telegram-бот.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V32__add_hh_smart_monitoring.sql` — миграция для новых таблиц (резюме и фильтры).
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/...` — Entity, Repository, Service, Controller для сохранения профиля/резюме соискателя.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/...` — Entity, Repository, Controller для фильтров + `@Scheduled` сервис поллинга hh.ru.
- `frontend/src/pages/settings/ResumeSettingsPage.tsx` — UI для сохранения текста резюме и сопроводительного письма.
- `frontend/src/pages/settings/MonitoringSettingsPage.tsx` — UI для управления фильтрами автопоиска.

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/integration/telegram/TelegramBotHandler.java` — Добавить метод для отправки уведомлений о новых подходящих вакансиях конкретному пользователю по `chatId`.
- `frontend/src/App.tsx` — Добавить новые роуты.

## Backend: точная реализация

### Flyway миграция (`V32__add_hh_smart_monitoring.sql`)
```sql
-- Удаляем старую таблицу для OAuth токенов, если она была создана в V31
DROP TABLE IF EXISTS careerpilot.hh_integrations;

-- Таблица для сохраненного резюме и шаблона письма
CREATE TABLE careerpilot.user_resumes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    raw_text TEXT NULL,
    cover_letter_template TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Таблица для фильтров мониторинга (job alerts)
CREATE TABLE careerpilot.user_vacancy_filters (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    search_query VARCHAR(256) NOT NULL,
    target_salary INT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_polled_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
```

### Entity / DTO
- `UserResumeEntity` (OneToOne к User), `UserResumeDto`, `UserResumeRequest`.
- `VacancyFilterEntity` (ManyToOne к User), `VacancyFilterDto`, `VacancyFilterRequest`.

### Repository
- `UserResumeRepository extends JpaRepository<UserResumeEntity, UUID>`: метод `Optional<UserResumeEntity> findByUserId(UUID userId)`.
- `VacancyFilterRepository extends JpaRepository<VacancyFilterEntity, UUID>`: метод `List<VacancyFilterEntity> findByIsActiveTrue()`.

### Service
- `UserResumeService`: CRUD операции для сохранения текста резюме.
- `VacancyFilterService`: CRUD для фильтров.
- `HhVacancyPollingService` (с аннотацией `@Scheduled(fixedRate = 1800000)` - раз в 30 мин):
  1. Достает все активные фильтры: `vacancyFilterRepository.findByIsActiveTrue()`.
  2. Делает запросы `GET https://api.hh.ru/vacancies?text={search_query}&salary={target_salary}&period=1`. (API hh.ru не требует авторизации для поиска).
  3. Для каждой найденной вакансии проверяет, не отправляли ли мы ее уже (нужно хранить кэш или ID отправленных в Redis/БД).
  4. Если вакансия новая, загружает `UserResumeEntity` пользователя.
  5. Отправляет в `AiAssistantService` промпт: "Сравни резюме и вакансию. Если подходят друг другу > 80%, сгенерируй сопроводительное письмо на основе шаблона. Ответ верни в JSON: {isMatch: boolean, coverLetter: string}".
  6. Если `isMatch == true`, вызывает `telegramBotHandler.sendVacancyAlert(user.getTelegramChatId(), vacancyUrl, coverLetter)`.

### Controller
- `UserResumeController`: `GET /api/resumes/mine`, `PUT /api/resumes/mine`.
- `VacancyFilterController`: `GET /api/vacancy-filters`, `POST /api/vacancy-filters`, `PUT /api/vacancy-filters/{id}`, `DELETE /api/vacancy-filters/{id}`.

## Frontend: точная реализация

### API-функции (services/resume.service.ts, monitoring.service.ts)
- `getMyResume`, `updateMyResume`.
- `getFilters`, `createFilter`, `updateFilter`, `deleteFilter`.

### Компоненты/страницы
- `ResumeSettingsPage.tsx`: Страница с двумя большими `textarea`: "Текст вашего резюме" и "Шаблон сопроводительного письма". Кнопка "Сохранить".
- `MonitoringSettingsPage.tsx`: Список карточек фильтров. Кнопка "Добавить фильтр" (открывает модалку с вводом строки поиска и ЗП). Тоггл (Switch) для включения/выключения фильтра.

## Порядок реализации для агента реализации
1. Создать миграцию `V32__add_hh_smart_monitoring.sql`. Скомпилировать бэкенд и проверить поднятие БД.
2. Реализовать Entity, DTO, Repository, Service и Controller для `UserResume`.
3. Реализовать Entity, DTO, Repository, Service и Controller для `VacancyFilter`.
4. Реализовать сервис фонового поллинга `HhVacancyPollingService` и интеграцию с AI + Telegram.
5. Написать frontend сервисы, типы, React Query хуки.
6. Сверстать `ResumeSettingsPage` и `MonitoringSettingsPage`.
7. Добавить новые страницы в роутер.

## Риски и что проверить
- Ограничение API hh.ru (rate limits). Обязательно делать паузы (`Thread.sleep` или аналог) между запросами к API hh.ru при поллинге, чтобы не получить бан по IP (рекомендуется не более 1 запроса в 1-2 секунды).
- Длинные промпты к LLM. Текст резюме и текст вакансии могут занимать много токенов. Обязательно использовать модель с большим контекстом (Flash или Sonnet).
- Уведомления в Telegram могут падать с ошибкой, если юзер заблокировал бота. Отправку нужно оборачивать в `try-catch`.

## Проверки после реализации
**Backend:** `mvnw spring-boot:run`, проверить создание таблиц в логах Flyway. Проверить эндпоинты через Swagger/Postman.
**Frontend:** `npm run build`
