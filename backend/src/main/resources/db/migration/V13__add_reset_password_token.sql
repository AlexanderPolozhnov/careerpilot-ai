-- Add reset password token columns to users table
ALTER TABLE careerpilot.users
ADD COLUMN reset_password_token VARCHAR(255),
ADD COLUMN reset_password_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for token lookup
CREATE INDEX idx_users_reset_password_token ON careerpilot.users (reset_password_token);
