# CareerPilot AI — Context Backup



Этот файл содержит хронологический лог всех обновлений, изменений архитектуры и исправлений в кодовой базе проекта CareerPilot AI.

Все новые записи добавляются строго в конец файла для сохранения хронологии развития проекта.



---




## Update 2026-06-07: Onboarding Flow Implementation

**Backend:**
- Created V30__add_onboarding_completed.sql to add onboarding_completed boolean field to preferences table.
- Updated PreferencesEntity, PreferencesRequest, and PreferencesResponse to include the onboardingCompleted field.
- Refactored PreferencesServiceImpl and its mapper methods to apply and save onboardingCompleted.

**Frontend:**
- Added onboardingCompleted into settings.service.ts along with completeOnboarding() API endpoint method.
- Added onboarding translations to en.json and u.json.
- Implemented OnboardingWizard, OnboardingStep1Profile, OnboardingStep2Vacancy, OnboardingStep3Ai, and OnboardingStep4Done components under src/components/onboarding/.
- Updated AppRouter.tsx to conditionally render OnboardingWizard overlay within ProtectedRoute if preferences.onboardingCompleted is false.
- Avoided displaying wizard in Telegram WebApp context.

**Status:** Backend and frontend implemented, compiled successfully.

## Update 2026-06-07: PWA Implementation

- **Frontend:** ����������� ��������� Progressive Web App (PWA) � ������� `vite-plugin-pwa`.
- **Features:** �������-����������� (GenerateSW), ������ ����������, UI-��������� `PwaInstallPrompt` � �������� ��� ��������� ����������.
- **Dependencies:** �������� ����� `workbox-window` ��� ���������� ������ `virtual:pwa-register` � ��������� pnpm.


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


