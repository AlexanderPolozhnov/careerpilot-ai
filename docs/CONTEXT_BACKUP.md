# CareerPilot AI — Context Backup



Этот файл содержит хронологический лог всех обновлений, изменений архитектуры и исправлений в кодовой базе проекта CareerPilot AI.

Все новые записи добавляются строго в конец файла для сохранения хронологии развития проекта.



---




## Update 2026-06-22: Telegram Webhook and Bot Payments Integration

### Что реализовано

**Backend — DTO & Services:**
- `TelegramPaymentWebhookRequest.java` — DTO для обработки входящих webhook-сообщений от серверов Telegram (Stars pre_checkout_query и успешные оплаты).
- `PaymentService.java` & `PaymentServiceImpl.java` — сервис для валидации pre_checkout_query (проверка существования платежа в БД), подтверждения оплаты, обработки успешных платежей с последующей автоматической активацией PREMIUM-подписки на 1 месяц, а также генерации нативных invoiceLink через Telegram API.
- `AdminCommandStateService.java` & `AdminCommandStateServiceImpl.java` — выделенный сервис в памяти для управления пошаговыми диалогами администратора бота (выдача подарочных подписок).

**Backend — Controllers & Config:**
- `PaymentController.java` — добавлены эндпоинты `POST /api/payments/webhook/telegram` для получения вебхуков и `GET /api/payments/stars/{paymentId}/invoice` для генерации счета Mini App.
- `TelegramBotHandler.java` — интегрирован `AdminCommandStateService` для управления административными состояниями.
- `SecurityConfig.java` — добавлен эндпоинт вебхука в список разрешенных без авторизации (`permitAll`).

**Frontend:**
- `integration.service.ts` — добавлен метод `getStarsInvoiceLink` для получения ссылки на оплату.
- `TelegramStarsPaywallPage.tsx` — компонент paywall для вызова нативного окна оплаты Telegram Stars (`Telegram.WebApp.openInvoice`).
- `AppRouter.tsx` — добавлен роут `/payment/stars`, а также глобальная обработка параметра `start_param` (формата `pay_stars_<id>`) с последующим автоматическим перенаправлением на paywall-экран.
- Добавлены новые i18n переводы для оплаты Stars в файлы локалей `ru.json` и `en.json`.

### Проверки
- `.\mvnw.cmd clean compile -q -DskipTests` — **BUILD SUCCESS**
- `pnpm run build` — **✓ built in 796ms**


## Update 2026-06-22: Smart Job Auto-Search & hh.ru Monitoring (Scraping/Public API)

### Что реализовано

**Backend — Flyway миграция:**
- `V32__add_hh_smart_monitoring.sql` — Добавлены таблицы `user_resumes` (для хранения сырого резюме и шаблона сопроводительного письма) и `user_vacancy_filters` (для хранения поисковых запросов и настроек зарплаты). Удалена старая неиспользуемая таблица `hh_integrations` из V31.

**Backend — JPA Entities & Repositories:**
- `UserResumeEntity` (OneToOne к `User`) + `UserResumeRepository` (`findByUserId`).
- `VacancyFilterEntity` (ManyToOne к `User`) + `VacancyFilterRepository` (`findByIsActiveTrue`, `findAllByUserId`, `findByIdAndUserId`).

**Backend — MapStruct & DTOs:**
- `UserResumeMapper`, `VacancyFilterMapper` для преобразования объектов в DTO.
- `UserResumeRequest`, `UserResumeResponse`, `VacancyFilterRequest`, `VacancyFilterResponse`.

**Backend — Services & Controllers:**
- `UserResumeService` + `UserResumeServiceImpl` — управление текстовым резюме пользователя и шаблоном письма.
- `VacancyFilterService` + `VacancyFilterServiceImpl` — CRUD-операции над фильтрами автопоиска.
- `UserResumeController` — эндпоинты `GET /api/resumes/mine` и `PUT /api/resumes/mine`.
- `VacancyFilterController` — эндпоинты `GET /api/vacancy-filters`, `POST /api/vacancy-filters`, `PUT /api/vacancy-filters/{id}`, `DELETE /api/vacancy-filters/{id}`.

**Backend — Background Scheduled Job & Integrations:**
- `HhVacancyPollingService` — сервис с аннотацией `@Scheduled(fixedRate = 1800000)` (раз в 30 мин). Извлекает активные фильтры, опрашивает публичный API вакансий hh.ru (`GET https://api.hh.ru/vacancies`), считывает подробное описание каждой вакансии, проверяет кэш отправленных вакансий через Spring CacheManager, сопоставляет резюме соискателя с вакансией с помощью ИИ (модели OpenAI/Gemini/Ollama, настроенные пользователем).
- `TelegramBotHandler` — добавлен метод `sendVacancyAlert(chatId, vacancyUrl, coverLetter)` для отправки уведомлений в Telegram с текстом сгенерированного сопроводительного письма и ссылкой на вакансию.

**Frontend — API Services & Routing:**
- `resume.service.ts` — добавлены методы `getMyResume` и `updateMyResume`.
- `monitoring.service.ts` — добавлен новый сервис для CRUD-операций над фильтрами поиска.
- `AppRouter.tsx` — добавлены новые пути `/app/settings/resume` и `/app/settings/monitoring`.
- `SettingsPage.tsx` — добавлены ссылки-карточки перехода к настройкам автопоиска в секцию "Интеграции".

**Frontend — UI Pages:**
- `ResumeSettingsPage.tsx` — интерфейс для ввода текстового резюме и шаблона сопроводительного письма со встроенными TanStack Query мутациями.
- `MonitoringSettingsPage.tsx` — панель управления фильтрами автопоиска (карточки, модальное окно добавления фильтра, тоггл активности, удаление).
- Добавлены новые i18n переводы в файлы локалей `ru.json` и `en.json`.
- Синхронизированы структуры ключей перевода через `js-scripts` утилиты.

### Проверки
- `.\mvnw.cmd clean compile -q -DskipTests` (в `backend`) — **BUILD SUCCESS**
- `pnpm run build` (в `frontend`) — **✓ built in 826ms**
- `.\verify-all.ps1` — **SUCCESS**

**Backend/Frontend — Очистка мертвого кода (Вариант Б):**
- Полностью удален неработоспособный старый OAuth2-код hh.ru (пакет `integration/hh/` на бэкенде, файлы `ProfileSyncModal.tsx`, методы в `integration.service.ts` и старые i18n ключи на фронтенде).
- Удалена временная миграция `V33__recreate_hh_integrations.sql`. База данных очищена от лишней таблицы `hh_integrations` (удаленной в V32), а бэкенд избавлен от неиспользуемых Java-сущностей и репозиториев, что исключило ошибки Hibernate валидации.

## Update 2026-06-23: Resume Extraction in Smart Search Settings

### Что реализовано

**Frontend:**
- **ResumeSettingsPage.tsx:** Реализована возможность выбора существующего резюме из списка сохраненных (`resumesList`) прямо на странице настройки автопоиска. Добавлена кнопка «Извлечь» для автоматического переноса текста выбранного резюме (`textContent`) в текстовое поле формы (`rawText`). Реализована очистка текстового поля формы перед загрузкой нового резюме (с таймаутом 200 мс для визуальной отзывчивости).
- **i18n:** Добавлены новые ключи локализации для интеграции списка резюме на страницу настройки автопоиска в `ru.json` и `en.json` (`myResumes`, `selectResumePlaceholder`, `extractButton`, `extractSuccess`, `extractEmpty`).

### Проверки
- `pnpm run build` (в `frontend`) — **✓ built in 1.04s** — сборка завершена успешно, без ошибок компиляции и типов.
- `.\verify-all.ps1` — **SUCCESS**


## Update 2026-06-23: Advanced hh.ru Auto-Search Filters and Leniency Matching Prompt

### Что реализовано

**Backend — Flyway миграция:**
- `V33__add_extra_vacancy_filters_columns.sql` — Добавлены колонки `experience`, `employment`, `schedule`, `area`, `only_with_salary` и `polling_interval` в таблицу `user_vacancy_filters`.

**Backend — JPA Entity & DTOs:**
- Обновлен `VacancyFilterEntity` новыми полями: `experience`, `employment`, `schedule`, `area`, `onlyWithSalary`, `pollingInterval`.
- Обновлены DTO-запросы/ответы `VacancyFilterRequest` и `VacancyFilterResponse`.
- Обновлен `VacancyFilterServiceImpl` для инициализации дефолтных значений `pollingInterval=30` и `onlyWithSalary=false` в методе создания фильтра.

**Backend — Background Scheduled Job & AI Matching:**
- Перенастроен планировщик `HhVacancyPollingService` на запуск каждые 5 минут (`@Scheduled(fixedRate = 300000)`).
- Реализована проверка индивидуального интервала опроса каждого фильтра.
- Реализована передача расширенных параметров запроса (`experience`, `employment`, `schedule`, `area`, `only_with_salary`) в вызовы к API hh.ru.
- Внедрен лояльный промпт сопоставления ИИ (ленивые правила для названий должностей, разницы в опыте работы, игнорирования отсутствия высшего образования, гибкость стека).

**Frontend — Types & Services:**
- Обновлен интерфейс `VacancyFilter` в `types/index.ts`.
- Обновлены методы `createFilter` и `updateFilter` в `monitoring.service.ts` для отправки новых полей (с соответствующим обновлением мок-данных).

**Frontend — UI & i18n:**
- Переработано модальное окно создания фильтра в `MonitoringSettingsPage.tsx` в соответствии с дизайн-системой: скроллируемый контейнер полей с фиксированным хедером и статичным футером, использование стандартных инпутов/селектов, кнопка `Cancel` и `Create`.
- Старый кружок переключения активности фильтра в карточках заменен на системный компонент `Toggle` из настроек.
- В карточки фильтров добавлены компактные цветные бейджи для каждого из активных критериев (опыт, регион, график, зарплата, занятость, интервал).
- Добавлены новые i18n переводы для всех фильтров в `ru.json` и `en.json` (в плоской структуре во избежание nested keys runtime-ошибок).

### Проверки
- `.\mvnw.cmd clean compile -DskipTests` (в `backend`) — **BUILD SUCCESS**
- `pnpm run build` (в `frontend`) — **✓ built in 817ms**

**Update 2026-06-23: Расширенная География поиска (hh.ru Multi-region & Countries)**
- **Backend:** В `HhVacancyPollingService.java` реализована обработка перечисления регионов через запятую. Теперь строка `area` из фильтра парсится и подставляется как набор индивидуальных `queryParam("area", id)` в API hh.ru, что позволяет делать многорегиональный поиск.
- **Frontend:** Поле выбора городов переименовано в "География поиска" (`Search Geography`). В список селектора формы добавлены варианты выбора целых стран (Россия, Беларусь, Казахстан, Узбекистан, Грузия, Армения), комбинации двух столиц (Москва + Санкт-Петербург) и стран СНГ. Карточка фильтра адаптирована для вывода бейджей стран и групп.

## Update 2026-06-23: Proxy Authentication Required (407) Fix

- **Backend:** Исправлена ошибка `407 Proxy Authentication Required` при работе с API hh.ru через прокси.
  - Сетевые свойства JVM `jdk.http.auth.tunneling.disabledSchemes` и `jdk.http.auth.proxying.disabledSchemes` перенесены в статический инициализатор главного класса `CareerpilotAiApplication.java`, чтобы гарантировать их применение до инициализации сети другими компонентами.
  - В `HhVacancyPollingService.java` объект `RestTemplate` переведен на использование `JdkClientHttpRequestFactory` на базе современного `java.net.http.HttpClient` с локальной настройкой аутентификатора. Это изолирует учетные данные прокси от глобального состояния JVM.

