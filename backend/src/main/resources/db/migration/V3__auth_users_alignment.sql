SET search_path TO careerpilot;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS last_name VARCHAR(120);

UPDATE users
SET first_name = COALESCE(first_name, split_part(full_name, ' ', 1)),
    last_name  = COALESCE(
            last_name,
            NULLIF(trim(substr(full_name, length(split_part(full_name, ' ', 1)) + 1)), '')
                 );
