ALTER TABLE careerpilot.notifications
    ADD COLUMN reference_id UUID,
    ADD COLUMN reference_type VARCHAR(50);

CREATE INDEX idx_notifications_reference ON careerpilot.notifications (reference_id, reference_type);
