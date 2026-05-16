-- Rename columns in resumes table to match API contract
ALTER TABLE careerpilot.resumes RENAME COLUMN title TO name;
ALTER TABLE careerpilot.resumes RENAME COLUMN is_active TO is_default;

-- Update index to use new column name
DROP INDEX IF EXISTS careerpilot.idx_resumes_active;
CREATE INDEX idx_resumes_default ON careerpilot.resumes(user_id, is_default);
