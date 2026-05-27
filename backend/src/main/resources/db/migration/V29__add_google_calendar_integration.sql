ALTER TABLE careerpilot.user_preferences 
ADD COLUMN google_calendar_refresh_token VARCHAR(255),
ADD COLUMN google_calendar_connected BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE careerpilot.interviews
ADD COLUMN google_calendar_event_id VARCHAR(255);
