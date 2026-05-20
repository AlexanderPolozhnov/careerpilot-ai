ALTER TABLE careerpilot.applications
ADD COLUMN first_interview_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN careerpilot.applications.first_interview_at IS 'Timestamp of the first transition to an interview status (HR_SCREEN, TECH_INTERVIEW, etc.)';
