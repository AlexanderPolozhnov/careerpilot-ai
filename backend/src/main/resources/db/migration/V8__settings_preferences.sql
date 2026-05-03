SET search_path TO careerpilot;

ALTER TABLE careerpilot.users
    ADD COLUMN IF NOT EXISTS location VARCHAR(255);

CREATE TABLE IF NOT EXISTS careerpilot.user_preferences
(
    id                  UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID        NOT NULL UNIQUE REFERENCES careerpilot.users (id) ON DELETE CASCADE,
    weekly_digest       BOOLEAN     NOT NULL DEFAULT TRUE,
    interview_reminders BOOLEAN     NOT NULL DEFAULT TRUE,
    ai_provider_mode    VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    language            VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
