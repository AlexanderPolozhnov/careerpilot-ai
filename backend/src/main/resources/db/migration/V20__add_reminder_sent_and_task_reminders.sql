-- Add reminder_sent flags to interviews and tasks tables
ALTER TABLE careerpilot.interviews ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE careerpilot.tasks ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- Add task_reminders to user_preferences
ALTER TABLE careerpilot.user_preferences ADD COLUMN task_reminders BOOLEAN NOT NULL DEFAULT TRUE;

-- Create indexes for efficient reminder queries
CREATE INDEX idx_interviews_reminder_sent ON careerpilot.interviews (reminder_sent, scheduled_at);
CREATE INDEX idx_tasks_reminder_sent ON careerpilot.tasks (reminder_sent, due_at);
