SET search_path TO careerpilot;

-- Ensure demo seeded users are able to login in local/dev environments.
UPDATE users
SET password_hash = crypt('Demo123!@#', gen_salt('bf')),
    updated_at = now()
WHERE email IN (
    'anna.koval@demo.dev',
    'maks.nowak@demo.dev',
    'iryna.sidorova@demo.dev',
    'pavel.ivanov@demo.dev',
    'sofia.horak@demo.dev'
);
