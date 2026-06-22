# Техническое задание (ТЗ): Интеграция hh.ru, Подписки, Оплаты и Телеграм Бот

Этот документ содержит детальное описание архитектуры, базы данных и кода для реализации расширения **CareerPilot AI**.

---

## 1. Архитектурная Схема

```text
                               +-----------------------------+
                               |    Telegram WebApp / TMA    |
                               | (React + @telegram-apps/sdk)|
                               +--------------+--------------+
                                              |
                                              | (REST / initData Auth)
                                              v
+------------------------+      +-------------+--------------+      +-----------------------+
|        hh.ru API       |<---->|    Spring Boot Backend     |<---->|  Telegram Bot API     |
|   (OAuth2, Resumes,    |      | (JWT, JPA, Spring Events,  |      |   (Webhook Handler,   |
|       Vacancies)       |      |     Flyway, Quartz)        |      | Admin Notifications)  |
+------------------------+      +-------------+--------------+      +-----------------------+
                                              |
                                              v
                               +--------------+--------------+
                               |    PostgreSQL Database      |
                               |   (careerpilot schema)      |
                               +-----------------------------+
```

---

## 2. База Данных: Схемы и Миграции

Создайте миграцию Flyway `V31__add_hh_and_subscriptions.sql` в директории `backend/src/main/resources/db/migration/`:

```sql
-- 1. Добавление поля telegram_username в предпочтения
ALTER TABLE careerpilot.user_preferences 
ADD COLUMN telegram_username VARCHAR(100) NULL;

CREATE INDEX idx_user_preferences_tg_username 
ON careerpilot.user_preferences(telegram_username);

-- 2. Таблица подписок
CREATE TABLE careerpilot.subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    plan VARCHAR(32) NOT NULL DEFAULT 'FREE', -- 'FREE', 'PREMIUM'
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPIRED', 'CANCELLED'
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_subscriptions_user_id ON careerpilot.subscriptions(user_id);

-- 3. Таблица истории оплат
CREATE TABLE careerpilot.payments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    provider VARCHAR(32) NOT NULL, -- 'STRIPE', 'YOOKASSA', 'CRYPTOBOT', 'STARS'
    provider_payment_id VARCHAR(256) UNIQUE NULL,
    status VARCHAR(32) NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- 4. Таблица токенов интеграции hh.ru
CREATE TABLE careerpilot.hh_integrations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    hh_user_id VARCHAR(128) NULL,
    access_token VARCHAR(512) NOT NULL, -- Будет зашифрован Converter-ом
    refresh_token VARCHAR(512) NULL,    -- Будет зашифрован Converter-ом
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
```

---

## 3. Бэкенд (Spring Boot)

### 3.1 Шифрование токенов hh.ru
Используйте существующий `EncryptionConverter` для защиты полей `accessToken` и `refreshToken` в сущности `HhIntegrationEntity`:

```java
package com.alexanderpolozhnov.careerpilot.integration.hh.entity;

import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import com.alexanderpolozhnov.careerpilot.common.util.EncryptionConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "hh_integrations", schema = "careerpilot")
@Getter
@Setter
public class HhIntegrationEntity extends BaseAuditableEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "hh_user_id")
    private String hhUserId;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "access_token", nullable = false, length = 512)
    private String accessToken;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;
}
```

### 3.2 Логика входа/связи в Telegram Bot (`TelegramBotHandler.java`)
Необходимо модифицировать метод `onWebhookUpdateReceived` и `handleStartCommand`, чтобы автоматически считывать и записывать `telegram_username` соискателей в базу данных:

```java
// Внутри handleStartCommand при успешной привязке токена:
String senderUsername = update.getMessage().getFrom().getUserName();
if (senderUsername != null) {
    prefs.setTelegramUsername(senderUsername.replace("@", "").trim().toLowerCase());
}
// Сохраняем настройки
preferencesRepository.save(prefs);
```

### 3.3 Портирование админских команд в `TelegramBotHandler.java`
Добавьте проверку прав админа и выполнение команд:

```java
// Проверка прав администратора
private boolean isAdmin(Update update) {
    if (!update.hasMessage()) return false;
    String username = update.getMessage().getFrom().getUserName();
    return username != null && username.equalsIgnoreCase("bigskvishik");
}

// Внутри onWebhookUpdateReceived:
if (isAdmin(update)) {
    String messageText = update.getMessage().getText().trim();
    Long chatId = update.getMessage().getChatId();

    if (messageText.startsWith("/admin")) {
        sendAdminHelp(chatId);
    } else if (messageText.startsWith("/send_messages")) {
        executeGlobalBroadcast(chatId, messageText);
    } else if (messageText.startsWith("/test_send_messages")) {
        executeTestBroadcast(chatId, messageText);
    } else if (messageText.startsWith("/users")) {
        executeFetchUsersStats(chatId);
    } else if (messageText.startsWith("/gift_subscription")) {
        startGiftSubscriptionFlow(chatId);
    }
}
```

*Пример реализации `/send_messages`:*
```java
private void executeGlobalBroadcast(Long adminChatId, String text) {
    String broadcastText = text.substring("/send_messages".length()).trim();
    if (broadcastText.isEmpty()) {
        sendMessage(adminChatId, "Использование: /send_messages <сообщение>");
        return;
    }
    
    // Получаем все chatId пользователей, привязавших Telegram
    List<String> chatIds = preferencesRepository.findAllTelegramChatIds();
    int count = 0;
    for (String targetChatId : chatIds) {
        try {
            sendMessage(Long.parseLong(targetChatId), broadcastText);
            count++;
        } catch (Exception e) {
            log.error("Failed to send broadcast to: " + targetChatId, e);
        }
    }
    sendMessage(adminChatId, "Рассылка завершена. Отправлено пользователям: " + count);
}
```

*Пример реализации `/gift_subscription` (Пошаговый стейт-машина):*
Используйте HashMap в памяти для хранения текущего шага админа (класс `AdminGiftState` с полями `targetUsername`, `plan`, `duration`):
```java
private final Map<Long, AdminGiftState> giftStates = new ConcurrentHashMap<>();
```
При вводе текста проверяйте, находится ли админ в состоянии `WAITING_FOR_USERNAME`. Если да — находите пользователя в БД через `preferencesRepository.findByTelegramUsernameIgnoreCase(username)`, сохраняйте `userId` и присылайте инлайн-кнопки выбора подписки.

### 3.4 Перенаправление Telegram Stars (Web -> TMA)
1. На фронтенде при выборе оплаты Stars генерируется запрос `POST /api/payments/stars/initiate`.
2. Бэкенд создает уникальный токен оплаты (UUID) в Redis/БД со статусом `PENDING`.
3. Бэкенд возвращает deep-link: `https://t.me/careerpilot_ai_bot/app?startapp=pay_stars_<payment_id>`.
4. Пользователь открывает эту ссылку. Mini App считывает параметр `startapp` через `@telegram-apps/sdk`.
5. Mini App шлет запрос на бэкенд для проверки `payment_id` и генерации нативного Telegram Stars инвойса (`createInvoiceLink`).

---

## 4. Фронтенд (React + TypeScript)

### 4.1 UI Синхронизации профиля с hh.ru
Создайте компонент `ProfileSyncModal.tsx` в `frontend/src/components/modals/`.

**Логика работы:**
- Отображает две колонки: "Текущие данные CareerPilot" и "Данные из hh.ru".
- Для каждого несовпадающего поля (Имя, Локация, Опыт работы, Навыки) рендерится чекбокс.
- Пользователь вручную отмечает галочками, какие поля обновить из hh.ru.
- При нажатии «Синхронизировать» на бэкенд уходит массив выбранных полей для обновления.

```typescript
interface SyncItemProps {
  fieldName: string;
  currentValue: string;
  hhValue: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

### 4.2 Страница оплаты и Paywall
Интегрируйте на фронтенде выбор платежных систем:
- ЮKassa (СБП/РФ карты): открывает платежную форму ЮKassa.
- Stripe (международные): редиректит на Stripe Checkout.
- CryptoBot API: выводит инвойс-ссылку на TON/USDT.
- Telegram Stars:
  - Если запущен внутри WebApp (TMA), вызывает `telegram.openInvoice()`.
  - Если запущен в обычном браузере, показывает QR-код и ссылку `t.me/bot/app?startapp=pay_stars_...`.
