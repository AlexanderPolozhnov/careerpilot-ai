# ИНСТРУКЦИЯ ДЛЯ АГЕНТА-ИСПОЛНИТЕЛЯ (AGENT INSTRUCTIONS)

> 🚨 **Рекомендуемая модель для выполнения:** 
> 🥇 **Claude 3.5 Sonnet (с включенным режимом Thinking)** — наилучший выбор для глубокого рефакторинга Spring Security, работы со сложной логикой конечного автомата в боте и написания React UI компонентов.
> 🥈 **Gemini 1.5 Pro / 3.1 Pro (High)** — отличный выбор, если требуется загрузить в контекст большой объем файлов проекта сразу.
> *Не рекомендуется использовать Flash-модели для этого этапа, так как задача требует высокой концентрации на деталях безопасности, конвертерах JPA и AOP-аспектах.*

---

## 🎯 Суть задачи
Тебе предстоит расширить проект **CareerPilot AI** следующим функционалом:
1. Интеграция с **hh.ru API** (OAuth2 авторизация + синхронизация резюме соискателя).
2. Создание системы **подписок и транзакций оплат** (Stripe, YooKassa, CryptoBot API, Telegram Stars).
3. Реализация логики редиректа оплаты Stars: с веб-версии сайта по deep-link в Telegram Mini App.
4. Доработка Telegram-бота: автосохранение `telegram_username`, отправка уведомлений о платежах/регистрациях админу (`bigskvishik`), рассылки и интерактивная команда `/gift_subscription` (выдача подписки по юзернейму).

---

## 📂 Где лежат файлы, спецификации и примеры
Перед началом работы обязательно изучи файлы в папке `/hh-integration-pack/`:
* [hh_integration_spec.md](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/hh_integration_spec.md) — архитектура бэкенда, структура БД (миграция Flyway), логика оплат/звезд и фронтенд-компонентов.
* [hh_registration_guide.md](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/hh_registration_guide.md) — детальное руководство по регистрации OAuth-приложения на hh.ru.

### 📚 Справочные файлы и примеры реализации (из проекта Kopilo):
* `/hh-integration-pack/docs/`
  * [KOPILO_ARCHITECTURAL_RULES.md](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/docs/KOPILO_ARCHITECTURAL_RULES.md) — **КРИТИЧНО К ИЗУЧЕНИЮ!** Свод правил по работе с датами (strictly `Instant`), финансовыми BigDecimal числами в БД/Java, безопасности Security Context и обходу багов отрисовки (WebKit iOS black screen) при переходах.
* `/hh-integration-pack/examples/`
  * [KopiloTelegramBotAdminReference.java](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/examples/KopiloTelegramBotAdminReference.java) — пример реализации логики админ-команд бота, рассылок и диалога `/gift_subscription` на основе инлайн-кнопок.
  * [KopiloSubscriptionServiceReference.java](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/examples/KopiloSubscriptionServiceReference.java) — пример бэкенд-сервиса формирования инвойс-ссылок и вычисления цены в Telegram Stars (XTR) по формуле Kopilo.
* `/hh-integration-pack/js-scripts/`
  * [add_missing_keys.js](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/js-scripts/add_missing_keys.js) — JS-утилита синхронизации структуры новых ключей локализации по всем файлам фронтенда.
  * [check_locales.js](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/hh-integration-pack/js-scripts/check_locales.js) — JS-утилита валидации полноты перевода перед билдом.

---

## 🛠️ Пошаговый план реализации (Чек-лист для Агента)

### Шаг 1: Миграция базы данных и сущности (Database & JPA)
1. Создай SQL-файл миграции Flyway `V31__add_hh_and_subscriptions.sql` в `backend/src/main/resources/db/migration/`.
2. Обнови сущность `PreferencesEntity.java`: добавь поле `telegramUsername` и аннотируй его.
3. Создай сущности `SubscriptionEntity.java`, `PaymentEntity.java` и `HhIntegrationEntity.java` в соответствующих пакетах бэкенда.
4. Создай Spring Data JPA репозитории для этих сущностей.

### Шаг 2: Модификация Telegram-бота (User Username Tracking)
1. Внеси изменения в `TelegramBotHandler.java`. При получении любого сообщения (`Update`) проверяй наличие Telegram Username у отправителя.
2. Если имя пользователя присутствует (например, `alex_dev`), находи его `PreferencesEntity` по `chatId` и сохраняй юзернейм в БД (в нижнем регистре для удобства поиска).
3. Добавь метод проверки прав администратора: сверяй username отправителя с константой или настройкой `telegram.admin.username` (значение по умолчанию: `bigskvishik`).

### Шаг 3: Перенос Админ-команд из Kopilo
Используй кодовую базу Kopilo (`KopiloTelegramBotAdminReference.java`) как образец и реализуй в `TelegramBotHandler` следующие команды для админа `bigskvishik`:
- `/admin` — справка по командам.
- `/send_messages <сообщение>` — рассылка по всем пользователям, привязавшим Telegram (используй `preferencesRepository`).
- `/test_send_messages <сообщение>` — отправка сообщения только админу на его `chatId` для теста верстки.
- `/users` — вывод количества юзеров в БД и списка последних регистраций.
- `/gift_subscription` — интерактивный стейт-машина в диалоге с инлайн кнопками (выбор тарифа -> выбор длительности -> ввод причины -> подтверждение через слово `ПОДТВЕРЖДАЮ`). После подтверждения вызывай метод активации подписки и отправляй пользователю сообщение о подарке с кнопкой открытия Mini App.

### Шаг 4: hh.ru OAuth2 и Импорт резюме (Backend)
1. Создай OAuth2-клиент для hh.ru. Настрой endpoints для обмена авторизационного кода на access/refresh токены.
2. Реализуй контроллер `/api/integration/hh/callback` для обработки коллбэков от hh.ru.
3. Создай `HhSyncService`, который запрашивает данные о резюме пользователя из API hh.ru (`https://api.hh.ru/resumes/mine`) с использованием сохраненного `accessToken`.
4. Реализуй REST API эндпоинт `GET /api/integration/hh/preview` для получения свежих данных из hh.ru перед их сохранением.

### Шаг 5: Интерфейс синхронизации (Frontend)
1. Создай UI-вкладку "Integrations" в настройках (`SettingsPage`).
2. Добавь кнопку привязки hh.ru.
3. Реализуй модальное окно `ProfileSyncModal.tsx`. Оно должно делать запрос к `/preview` API, показывать сравнительную таблицу полей и давать пользователю возможность выбрать чекбоксами, какие именно поля импортировать в профиль CareerPilot.

### Шаг 6: Реализация оплат и Stars-редиректа
1. Создай сервисы интеграции платежей: YooKassa, Stripe, CryptoBot API.
2. Реализуй REST эндпоинт `POST /api/payments/stars/initiate` для генерации платежной сессии.
3. В `TelegramBotHandler` добавь обработку параметров `startapp`: при запуске Mini App со значением `pay_stars_<payment_id>` бэкенд должен проверять платеж и отдавать инвойс для оплаты нативными Telegram Stars (`createInvoiceLink`).

---

## 🔍 Инструкция по проверке и тестированию
1. Запусти локальное окружение: `docker compose up -d postgres redis`.
2. Примени миграции бэкенда с помощью `./mvnw spring-boot:run`. Убедись, что таблицы успешно созданы.
3. Проверь регистрацию вебхука бота в логах `TelegramWebhookRegistrar`.
4. Открой туннель: `npx untun@latest tunnel http://localhost:5173`.
5. Убедись, что команды `/admin` и рассылки корректно работают только для пользователя `@bigskvishik`.
