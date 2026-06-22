# CareerPilot AI — Context Backup



Этот файл содержит хронологический лог всех обновлений, изменений архитектуры и исправлений в кодовой базе проекта CareerPilot AI.

Все новые записи добавляются строго в конец файла для сохранения хронологии развития проекта.



---




## Update 2026-06-08: Activity Heatmap

- **Frontend:** Реализован UI-компонент Activity Heatmap в стиле GitHub на странице аналитики.
- **Contract:** Обновлен FRONTEND_BACKEND_CONTRACT.md с новым эндпоинтом /analytics/activity-heatmap.
- **Mocks:** Добавлена функция генерации моков за последние 365 дней.
- **Analytics:** Компонент встроен на страницу AnalyticsPage с использованием useQuery.
- **Backend:** Реализована серверная часть: разработан ActivityHeatmapItem DTO, AnalyticsService и AnalyticsServiceImpl для агрегации событий за 365 дней (отклики, задачи, интервью), создан и протестирован эндпоинт GET /api/analytics/activity-heatmap.

## Update 2026-06-08: Resend & Cloudflare Email Routing Integration

- **Backend:**
  - Added `app.mail.from` configuration variable to `application.yaml`, allowing dynamic configuration of the sender address with `support@careerpilot-ai.ru` as default.
  - Updated `EmailServiceImpl.java` to inject `app.mail.from` via `@Value` and set it on the JavaMailSender MimeMessageHelper instance, removing hardcoded `no-reply@careerpilot.ai`.
  - Documented `MAIL_FROM` in `backend/.env.example` and `.env.docker.example`.
- **Infrastructure & Deploy:**
  - Updated `.github/workflows/cd.yml` deployment script for Google Cloud Run to use Resend SMTP settings in production: `MAIL_HOST=smtp.resend.com`, `MAIL_PORT=587`, `MAIL_USERNAME=resend`, and `MAIL_FROM=support@careerpilot-ai.ru`.
  - Configured GCP Firewall rule `allow-cloudflare-only` to secure the origin backend instance by allowing traffic on ports `80, 443, 8080` only from Cloudflare's official IP ranges.
  - Set up Cloudflare Email Routing for receiving emails, forwarding all mail to `support@careerpilot-ai.ru` directly to personal Gmail, avoiding premium Google Workspace/Yandex subscription costs.

## Update 2026-06-22: hh.ru Integration, Telegram Bot Admin & Subscription System

### Что реализовано

**Backend — Flyway миграция:**
- `V31__add_hh_and_subscriptions.sql` — добавлены таблицы `subscription`, `payment`, `hh_integration`, колонка `telegram_username` в `preferences`.

**Backend — JPA Entities:**
- `SubscriptionEntity`, `PaymentEntity`, `HhIntegrationEntity` (токены через `EncryptionConverter`), поддерживающие enum: `SubscriptionPlan`, `SubscriptionStatus`, `PaymentStatus`, `PaymentProvider`.

**Backend — Repositories:**
- `SubscriptionRepository`, `PaymentRepository`, `HhIntegrationRepository`.

**Backend — Telegram Bot:**
- Обновлён `TelegramBotHandler`: auto-tracking `telegramUsername`, admin commands (`/admin`, `/send_messages`, `/test_send_messages`, `/users`, `/gift_subscription`), state machine через `ConcurrentHashMap<Long, AdminGiftState>`.
- Создан вспомогательный класс `AdminGiftState` для хранения пошагового состояния выдачи подарочной подписки.
- Обновлён `PreferencesRepository`: `findByTelegramUsernameIgnoreCase`, `findAllTelegramChatIds`.

**Backend — Subscription Service:**
- `SubscriptionService` (интерфейс) + `SubscriptionServiceImpl` — логика активации/продления подписки, проверки активного плана.

**Backend — hh.ru OAuth2 Integration:**
- `HhSyncService` (интерфейс) + `HhSyncServiceImpl` — OAuth2 flow (authorization URL, callback, token exchange), `/me`, `/resumes/mine`, preview extraction.
- `HhOAuthController` — эндпоинты: `GET /api/integration/hh/auth-url`, `GET /api/integration/hh/callback`, `GET /api/integration/hh/preview`, `POST /api/integration/hh/sync`, `DELETE /api/integration/hh`, `GET /api/integration/hh/status`.

**Backend — Payment Controller:**
- `PaymentController` — `POST /api/payments/stars/initiate` создаёт `PaymentEntity(PENDING)` и возвращает deep-link `https://t.me/bot/app?startapp=pay_stars_{id}`. `GET /api/payments/stars/{id}/status` — проверка статуса.

**Backend — application.yaml:**
- Добавлены секции `hh.client-id/client-secret/redirect-uri` и `telegram.miniapp.name`.

**Frontend:**
- Расширён `integration.service.ts` — добавлены методы `getHhAuthUrl`, `getHhStatus`, `getHhPreview`, `syncHhProfile`, `disconnectHh`, `initiateStarsPayment`, `getStarsPaymentStatus`.
- Создан компонент `ProfileSyncModal.tsx` — двухколоночный preview (CareerPilot vs hh.ru) с checkbox-выбором полей для синхронизации. Использует TanStack Query.
- Обновлён `SettingsPage.tsx` — добавлена карточка hh.ru в секции Integrations с кнопками Connect/Disconnect/Sync и монтированием `ProfileSyncModal`.
- Добавлены i18n ключи `settings.hh.*` и `hh.sync.*` в `ru.json` и `en.json`.

### Проверки
- `mvnw clean compile -DskipTests` — **BUILD SUCCESS** (только warnings по устаревшим API)
- `npm run build` — **✓ built in 1.05s** — без ошибок TypeScript

### Следующие шаги
- Зарегистрировать приложение на hh.ru и заполнить `HH_CLIENT_ID`, `HH_CLIENT_SECRET` в .env
- Реализовать Telegram Stars webhook обработку для подтверждения платежа (обновление `PaymentEntity` до `COMPLETED` и активация `SubscriptionEntity`)
- Настроить deep-link обработку в TMA (startapp параметр `pay_stars_<id>`)


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








