SET search_path TO careerpilot;

ALTER TABLE vacancies
    ADD COLUMN IF NOT EXISTS remote_type VARCHAR(50) NOT NULL DEFAULT 'REMOTE',
    ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;

UPDATE vacancies
SET status = CASE
                 WHEN status = 'ARCHIVED' THEN 'ARCHIVED'
                 WHEN status = 'REJECTED' THEN 'EXPIRED'
                 ELSE 'ACTIVE'
    END;

UPDATE vacancies
SET employment_type = 'INTERNSHIP'
WHERE employment_type = 'INTERN';

ALTER TABLE vacancies
    DROP CONSTRAINT IF EXISTS chk_vacancies_status,
    DROP CONSTRAINT IF EXISTS chk_vacancies_employment_type;

ALTER TABLE vacancies
    ADD CONSTRAINT chk_vacancies_status
        CHECK (status IN ('ACTIVE', 'ARCHIVED', 'EXPIRED')),
    ADD CONSTRAINT chk_vacancies_employment_type
        CHECK (employment_type IS NULL OR employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP')),
    ADD CONSTRAINT chk_vacancies_remote_type
        CHECK (remote_type IN ('REMOTE', 'HYBRID', 'ON_SITE'));

CREATE INDEX IF NOT EXISTS idx_vacancies_created_at ON vacancies (created_at);
CREATE INDEX IF NOT EXISTS idx_vacancies_title ON vacancies (title);
