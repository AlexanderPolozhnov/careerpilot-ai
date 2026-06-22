-- V31: Add hh.ru integration, subscriptions, payments, and telegram_username field

-- 1. Добавление поля telegram_username в предпочтения пользователя
ALTER TABLE careerpilot.user_preferences
    ADD COLUMN telegram_username VARCHAR(100) NULL;

CREATE INDEX idx_user_preferences_tg_username
    ON careerpilot.user_preferences(telegram_username);

-- 2. Таблица подписок пользователей
CREATE TABLE careerpilot.subscriptions
(
    id         UUID         NOT NULL PRIMARY KEY,
    user_id    UUID         NOT NULL UNIQUE REFERENCES careerpilot.users (id) ON DELETE CASCADE,
    plan       VARCHAR(32)  NOT NULL DEFAULT 'FREE',
    status     VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ  NULL,
    created_at TIMESTAMPTZ  NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL,
    CONSTRAINT chk_subscription_plan CHECK (plan IN ('FREE', 'PREMIUM')),
    CONSTRAINT chk_subscription_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED'))
);

CREATE INDEX idx_subscriptions_user_id ON careerpilot.subscriptions (user_id);

-- 3. Таблица истории платежей
CREATE TABLE careerpilot.payments
(
    id                  UUID           NOT NULL PRIMARY KEY,
    user_id             UUID           NOT NULL REFERENCES careerpilot.users (id) ON DELETE CASCADE,
    amount              NUMERIC(10, 2) NOT NULL,
    currency            VARCHAR(10)    NOT NULL,
    provider            VARCHAR(32)    NOT NULL,
    provider_payment_id VARCHAR(256)   UNIQUE NULL,
    status              VARCHAR(32)    NOT NULL,
    created_at          TIMESTAMPTZ    NOT NULL,
    updated_at          TIMESTAMPTZ    NOT NULL,
    CONSTRAINT chk_payment_provider CHECK (provider IN ('STRIPE', 'YOOKASSA', 'CRYPTOBOT', 'STARS', 'ADMIN')),
    CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

CREATE INDEX idx_payments_user_id ON careerpilot.payments (user_id);
CREATE INDEX idx_payments_status ON careerpilot.payments (status);

-- 4. Таблица токенов интеграции hh.ru (токены хранятся в зашифрованном виде через EncryptionConverter)
CREATE TABLE careerpilot.hh_integrations
(
    id            UUID         NOT NULL PRIMARY KEY,
    user_id       UUID         NOT NULL UNIQUE REFERENCES careerpilot.users (id) ON DELETE CASCADE,
    hh_user_id    VARCHAR(128) NULL,
    access_token  VARCHAR(512) NOT NULL,
    refresh_token VARCHAR(512) NULL,
    expires_at    TIMESTAMPTZ  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL,
    updated_at    TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_hh_integrations_user_id ON careerpilot.hh_integrations (user_id);
