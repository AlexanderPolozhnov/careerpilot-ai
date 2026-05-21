-- Add application_status_notifications to user_preferences
ALTER TABLE careerpilot.user_preferences ADD COLUMN application_status_notifications BOOLEAN NOT NULL DEFAULT TRUE;
