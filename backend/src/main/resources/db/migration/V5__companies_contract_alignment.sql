SET search_path TO careerpilot;

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS company_size VARCHAR(50),
    ADD COLUMN IF NOT EXISTS location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE companies
    DROP CONSTRAINT IF EXISTS chk_companies_size;

ALTER TABLE companies
    ADD CONSTRAINT chk_companies_size
        CHECK (company_size IS NULL OR company_size IN ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'));

CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies (created_at);
CREATE INDEX IF NOT EXISTS idx_companies_updated_at ON companies (updated_at);
