CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    application_id UUID NOT NULL REFERENCES applications (id) ON DELETE CASCADE,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_status_hist_app_id ON application_status_history (application_id);