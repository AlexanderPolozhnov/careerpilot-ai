-- V30__add_onboarding_completed.sql
ALTER TABLE careerpilot.user_preferences
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE careerpilot.user_preferences SET onboarding_completed = TRUE;
