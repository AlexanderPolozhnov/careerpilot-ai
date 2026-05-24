ALTER TABLE careerpilot.user_preferences
ADD COLUMN notification_provider VARCHAR(50) DEFAULT 'EMAIL' NOT NULL,
ADD COLUMN telegram_chat_id VARCHAR(100),
ADD COLUMN telegram_connect_token UUID;
