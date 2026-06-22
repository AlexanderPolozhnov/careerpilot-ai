# Task: Интеграция Telegram Webhook и Админ-команд бота

## Контекст и цель
Необходимо завершить интеграцию с Telegram: реализовать обработку успешных оплат (Telegram Stars) через Webhook, настроить перехват username соискателей при старте бота и добавить админские команды для рассылок и выдачи подарочных подписок. Это обеспечит полный цикл подписок и управления пользователями через Telegram.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/integration/telegram/dto/TelegramPaymentWebhookRequest.java` — DTO для получения webhook'а от Telegram
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/integration/telegram/service/AdminCommandStateService.java` — сервис для управления стейт-машиной админских команд в памяти (подарочные подписки)
- `frontend/src/pages/payment/TelegramStarsPaywallPage.tsx` — TMA компонент для вызова нативного окна оплаты Telegram Stars (`telegram.openInvoice()`)

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/integration/telegram/TelegramBotHandler.java` — Добавление админских команд и сохранение username
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/payment/PaymentController.java` — Добавление эндпоинта для Telegram Webhook (`/webhook/telegram`)
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/payment/PaymentService.java` — Обработка изменения статуса платежа и выдача подписки
- `frontend/src/App.tsx` — Регистрация нового роута для TMA оплаты

## Backend: точная реализация

### Entity / DTO
- `TelegramPaymentWebhookRequest`: поля `update_id` (Long), `pre_checkout_query` (вложенный объект: `id`, `from`, `currency`, `total_amount`, `invoice_payload`), `message.successful_payment` (вложенный объект: `currency`, `total_amount`, `invoice_payload`, `telegram_payment_charge_id`, `provider_payment_charge_id`).

### Repository
- Добавить в `UserPreferencesRepository` (если нет): `Optional<UserPreferencesEntity> findByTelegramUsernameIgnoreCase(String username)`
- Добавить в `UserPreferencesRepository`: `@Query("SELECT p.telegramChatId FROM UserPreferences p WHERE p.telegramChatId IS NOT NULL") List<String> findAllTelegramChatIds()`

### Service
- `PaymentService.handleTelegramWebhook(TelegramPaymentWebhookRequest request)`: если это `pre_checkout_query`, подтверждаем оплату (отправляем `answerPreCheckoutQuery`). Если это `successful_payment`, парсим `invoice_payload` (в нем хранится `paymentId`), находим платеж в БД, меняем статус на `COMPLETED` и создаем/обновляем `SubscriptionEntity` для пользователя.
- `TelegramBotHandler`:
  - В `handleStartCommand`: сохранять `telegramUsername` из `update.getMessage().getFrom().getUserName()`.
  - В `onWebhookUpdateReceived`: проверка `isAdmin(update)` (username == "bigskvishik" и т.п. из конфигурации). Обработка команд `/admin`, `/send_messages`, `/users`, `/gift_subscription`.

### Controller
- `PaymentController`:
  - `POST /api/payments/webhook/telegram` (No Auth требуется, так как это webhook от Telegram серверов). Принимает `TelegramPaymentWebhookRequest`, вызывает `PaymentService.handleTelegramWebhook()`.

### Flyway миграция
Не нужна (все таблицы были добавлены в `V31__add_hh_and_subscriptions.sql` на предыдущем этапе).

## Frontend: точная реализация

### API-функция (services/)
- Существующих функций `initiateStarsPayment` и `getPaymentStatus` достаточно.

### Компонент/страница
- `TelegramStarsPaywallPage.tsx`: Страница, доступная только внутри Telegram Mini App.
  1. Читает `startapp` параметр из `window.Telegram.WebApp.initDataUnsafe`.
  2. Извлекает `paymentId` (формат `pay_stars_<paymentId>`).
  3. Делает GET-запрос на бэкенд для генерации `invoiceLink` (или бэкенд уже его сгенерировал в init?).
  4. Вызывает `window.Telegram.WebApp.openInvoice(invoiceLink, callback)`.
  5. По коллбеку (успех) редиректит пользователя на страницу успеха.

## Порядок реализации для агента реализации
1. Реализовать `TelegramPaymentWebhookRequest` DTO и эндпоинт `/api/payments/webhook/telegram` в контроллере.
2. Написать логику `PaymentService.handleTelegramWebhook` (подтверждение pre_checkout и обработка successful_payment с активацией подписки).
3. Обновить `TelegramBotHandler.java` для сохранения `telegramUsername` при старте бота.
4. Добавить админские команды (`/send_messages`, `/gift_subscription`) в `TelegramBotHandler.java`.
5. Создать фронтенд-компонент `TelegramStarsPaywallPage.tsx` и прописать роут.

## Риски и что проверить
- Webhook от Telegram приходит без авторизации (Bearer токена нашего приложения). Контроллер должен быть открыт в Spring Security (`/api/payments/webhook/**`).
- В `invoice_payload` нужно передавать именно `paymentId` (UUID), чтобы бэкенд мог найти платеж после успешной оплаты.
- `telegram_username` может быть null у некоторых пользователей, необходимо безопасно это обрабатывать.

## Проверки после реализации
**Backend:** Запустить бота и прислать `/start` — проверить что username сохранился в БД. Отправить админ команду `/users` и получить ответ.
**Frontend:** `cd frontend && npm run build`
