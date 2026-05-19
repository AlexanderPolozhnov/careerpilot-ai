SET search_path TO careerpilot;

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);