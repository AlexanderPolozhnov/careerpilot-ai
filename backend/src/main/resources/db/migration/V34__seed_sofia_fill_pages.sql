SET search_path TO careerpilot;

-- Ensure Sofia exists
INSERT INTO users (id, email, password_hash, full_name, first_name, last_name, role, status, created_at, updated_at)
VALUES ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'sofia.horak@demo.dev', '$2a$10$seed.hash.sofia', 'Sofia Horak', 'Sofia', 'Horak', 'ADMIN', 'ACTIVE', '2026-03-03 10:55:00+00', '2026-03-03 10:55:00+00')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (id, user_id, desired_position, experience_level, city, remote_preference, salary_expectation, summary, created_at, updated_at)
VALUES ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c105', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Engineering Manager', 'MIDDLE', 'Remote', 'REMOTE', 4500, 'People-oriented engineer driving hiring, mentorship and platform quality.', '2026-03-03 11:00:00+00', '2026-03-03 11:00:00+00')
ON CONFLICT (user_id) DO NOTHING;

-- Resumes: Sofia needs at least 5-6 total.
-- V16 renamed title -> name, is_active -> is_default
INSERT INTO resumes (id, user_id, name, file_url, text_content, is_default, created_at, updated_at)
VALUES
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd207', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Sofia Horak - Engineering Lead', 'https://cdn.demo.dev/resumes/sofia-lead.pdf', 'Hiring, architecture reviews, incident response and delivery leadership.', TRUE, '2026-03-05 09:45:00+00', '2026-03-05 09:45:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd208', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Sofia Horak - Engineering Manager', 'https://cdn.demo.dev/resumes/sofia-manager.pdf', 'Engineering Manager with a strong background in leading high-performing teams.', FALSE, '2026-03-06 09:45:00+00', '2026-03-06 09:45:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd209', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Sofia Horak - Director of Engineering', 'https://cdn.demo.dev/resumes/sofia-director.pdf', 'Experienced Director of Engineering scaling up cloud infrastructure teams.', FALSE, '2026-03-07 09:45:00+00', '2026-03-07 09:45:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd210', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Sofia Horak - VP of Engineering', 'https://cdn.demo.dev/resumes/sofia-vp.pdf', 'VP of Engineering focused on organizational structure, hiring, and culture.', FALSE, '2026-03-08 09:45:00+00', '2026-03-08 09:45:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd211', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Sofia Horak - Technical Lead', 'https://cdn.demo.dev/resumes/sofia-tech-lead.pdf', 'Tech Lead bridging the gap between product requirements and technical implementation.', FALSE, '2026-03-09 09:45:00+00', '2026-03-09 09:45:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd212', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Sofia Horak - Architect', 'https://cdn.demo.dev/resumes/sofia-architect.pdf', 'System Architect specialized in distributed systems and microservices design.', FALSE, '2026-03-10 09:45:00+00', '2026-03-10 09:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- Companies: Sofia already has some, but let's make sure we insert 6.
INSERT INTO companies (id, user_id, name, website, description, industry, company_size, location, linkedin_url, logo_url, created_at, updated_at)
VALUES
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba301', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'CloudForge Labs', 'https://cloudforge.example.com', 'Product company building developer productivity tools for cloud teams.', 'Developer Tools', 'STARTUP', 'Berlin', 'https://linkedin.com/company/cloudforge-labs', 'https://images.example.com/logos/cloudforge.png', '2026-03-10 08:20:00+00', '2026-03-10 08:20:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba302', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Vistula Payments', 'https://vistulapay.example.com', 'Fintech platform processing secure international B2B transactions.', 'FinTech', 'MEDIUM', 'Warsaw', 'https://linkedin.com/company/vistula-payments', 'https://images.example.com/logos/vistula.png', '2026-03-10 08:40:00+00', '2026-03-10 08:40:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba303', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Prague Data Systems', 'https://praguedata.example.com', 'Data platform vendor delivering analytics pipelines for retail and logistics.', 'Data & Analytics', 'SMALL', 'Prague', 'https://linkedin.com/company/prague-data-systems', 'https://images.example.com/logos/pds.png', '2026-03-10 09:00:00+00', '2026-03-10 09:00:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba304', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Nordic HealthTech', 'https://nordic-health.example.com', 'Digital health company building secure patient engagement services.', 'HealthTech', 'LARGE', 'Remote', 'https://linkedin.com/company/nordic-healthtech', 'https://images.example.com/logos/nordic-health.png', '2026-03-10 09:20:00+00', '2026-03-10 09:20:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba305', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Minsk Mobility AI', 'https://mobility-ai.example.com', 'AI-driven route optimization platform for urban mobility operators.', 'Transportation AI', 'SMALL', 'Minsk', 'https://linkedin.com/company/minsk-mobility-ai', 'https://images.example.com/logos/mobility-ai.png', '2026-03-10 09:35:00+00', '2026-03-10 09:35:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba306', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'Future Tech Corp', 'https://future.example.com', 'Future Tech Corp Description', 'Tech', 'LARGE', 'Berlin', 'https://linkedin.com', 'https://logo', '2026-03-10 08:20:00+00', '2026-03-10 08:20:00+00')
ON CONFLICT (id) DO NOTHING;

-- Vacancies: Sofia needs vacancies to apply to.
INSERT INTO vacancies (
    id, user_id, company_id, title, source, source_url, location, employment_type, salary_from, salary_to, currency,
    description_raw, description_clean, status, remote_type, deadline, created_at, updated_at
)
VALUES
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce401', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'Junior Java Developer', 'LinkedIn', 'https://jobs.example.com/v1', 'Berlin', 'FULL_TIME', 2000, 2800, 'EUR', 'Junior backend role with mentorship and code reviews.', 'Build Spring Boot services, write tests and improve APIs.', 'ACTIVE', 'HYBRID', '2026-06-15 23:59:00+00', '2026-04-01 08:00:00+00', '2026-04-01 08:00:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce402', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'Backend Engineer (Java)', 'Djinni', 'https://jobs.example.com/v2', 'Warsaw', 'FULL_TIME', 3200, 4200, 'EUR', 'Backend engineer for payments domain.', 'Design transaction processing APIs with reliability focus.', 'ACTIVE', 'REMOTE', '2026-06-10 23:59:00+00', '2026-04-02 09:30:00+00', '2026-04-02 09:30:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce403', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'Spring Boot Developer', 'Company', 'https://jobs.example.com/v3', 'Prague', 'CONTRACT', 2800, 3600, 'EUR', 'Contract role in data platform team.', 'Implement REST integrations and optimize SQL performance.', 'ACTIVE', 'ON_SITE', '2026-06-30 23:59:00+00', '2026-04-03 11:10:00+00', '2026-04-03 11:10:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce404', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'Java Platform Engineer', 'Indeed', 'https://jobs.example.com/v4', 'Remote EU', 'FULL_TIME', 3500, 4800, 'EUR', 'Platform role for healthcare products.', 'Build secure microservices and maintain CI/CD standards.', 'ACTIVE', 'REMOTE', '2026-06-20 23:59:00+00', '2026-04-04 10:00:00+00', '2026-04-04 10:00:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce405', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'Backend Engineer', 'LinkedIn', 'https://jobs.example.com/v5', 'Minsk', 'FULL_TIME', 2100, 3000, 'USD', 'Backend role in route optimization team.', 'Develop event-driven services and maintain PostgreSQL schemas.', 'ACTIVE', 'HYBRID', '2026-06-18 23:59:00+00', '2026-04-05 08:45:00+00', '2026-04-05 08:45:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce406', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'Java Intern', 'Website', 'https://jobs.example.com/v6', 'Berlin', 'INTERNSHIP', 900, 1200, 'EUR', 'Internship with structured learning plan.', 'Work with senior mentors on internal tooling and tests.', 'ACTIVE', 'ON_SITE', '2026-05-30 23:59:00+00', '2026-04-06 09:15:00+00', '2026-04-06 09:15:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce407', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'Full-Stack Engineer', 'Referral', 'https://jobs.example.com/v7', 'Warsaw', 'FULL_TIME', 3000, 4100, 'EUR', 'Full-stack team handling customer portal.', 'Build React UI and Java APIs for account management.', 'ACTIVE', 'HYBRID', '2026-06-25 23:59:00+00', '2026-04-07 12:20:00+00', '2026-04-07 12:20:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce408', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'Junior Backend Engineer', 'LinkedIn', 'https://jobs.example.com/v8', 'Prague', 'PART_TIME', 1400, 2000, 'EUR', 'Part-time backend role for students.', 'Contribute to API endpoints and basic data migrations.', 'ACTIVE', 'HYBRID', '2026-06-05 23:59:00+00', '2026-04-08 07:55:00+00', '2026-04-08 07:55:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce409', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'SRE / Backend Engineer', 'Company', 'https://jobs.example.com/v9', 'Remote EU', 'CONTRACT', 3800, 5200, 'EUR', 'Reliability-focused backend position.', 'Own observability, incident tooling and backend stability.', 'ACTIVE', 'REMOTE', '2026-07-01 23:59:00+00', '2026-04-09 10:35:00+00', '2026-04-09 10:35:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce410', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'React + Java Developer', 'Djinni', 'https://jobs.example.com/v10', 'Remote', 'FREELANCE', 2500, 3500, 'USD', 'Freelance role for feature delivery.', 'Ship user-facing features across frontend and backend stack.', 'ACTIVE', 'REMOTE', '2026-06-12 23:59:00+00', '2026-04-10 14:00:00+00', '2026-04-10 14:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Applications: We need at least 6. Unique target is (user_id, vacancy_id).
INSERT INTO applications (
    id, user_id, vacancy_id, status, applied_at, next_follow_up_at, last_contact_at, notes, created_at, updated_at
)
VALUES
    ('f6b23451-2309-4f39-9c82-d8bc32f3a609', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'APPLIED', '2026-04-07 10:00:00+00', '2026-04-16 10:00:00+00', '2026-04-12 09:00:00+00', 'Internal monitoring application for hiring workflow test.', '2026-04-07 10:00:00+00', '2026-04-12 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a611', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'APPLIED', '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied note 11', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a612', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'APPLIED', '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied note 12', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a613', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'APPLIED', '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied note 13', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a614', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'APPLIED', '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied note 14', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a615', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'APPLIED', '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied note 15', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00')
ON CONFLICT (user_id, vacancy_id) DO NOTHING;

-- Interviews: We need at least 6.
INSERT INTO interviews (
    id, application_id, type, scheduled_at, timezone, meeting_link, result, notes, created_at, updated_at
)
VALUES
    ('07134561-8f6c-4f31-a591-700d4f21a705', 'f6b23451-2309-4f39-9c82-d8bc32f3a611', 'HR_SCREEN', '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr', 'PENDING', 'Notes 5', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a706', 'f6b23451-2309-4f39-9c82-d8bc32f3a612', 'HR_SCREEN', '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr', 'PENDING', 'Notes 6', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a707', 'f6b23451-2309-4f39-9c82-d8bc32f3a613', 'HR_SCREEN', '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr', 'PENDING', 'Notes 7', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a708', 'f6b23451-2309-4f39-9c82-d8bc32f3a614', 'HR_SCREEN', '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr', 'PENDING', 'Notes 8', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a709', 'f6b23451-2309-4f39-9c82-d8bc32f3a615', 'HR_SCREEN', '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr', 'PENDING', 'Notes 9', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a710', 'f6b23451-2309-4f39-9c82-d8bc32f3a609', 'HR_SCREEN', '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr', 'PENDING', 'Notes 10', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00')
ON CONFLICT (id) DO NOTHING;

-- Tasks: Sofia needs 6.
INSERT INTO tasks (id, user_id, application_id, title, description, due_at, done, priority, created_at, updated_at)
VALUES
    ('18245671-9711-4b79-9cb2-a22ef6f7a805', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'f6b23451-2309-4f39-9c82-d8bc32f3a609', 'Review hiring pipeline', 'Validate SLA timings and status transitions in dashboard.', '2026-04-19 09:00:00+00', FALSE, 'LOW', '2026-04-12 09:10:00+00', '2026-04-12 09:10:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a806', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'f6b23451-2309-4f39-9c82-d8bc32f3a611', 'Task 6', 'Description 6', '2026-04-19 18:00:00+00', FALSE, 'HIGH', '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a807', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'f6b23451-2309-4f39-9c82-d8bc32f3a612', 'Task 7', 'Description 7', '2026-04-19 18:00:00+00', FALSE, 'HIGH', '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a808', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'f6b23451-2309-4f39-9c82-d8bc32f3a613', 'Task 8', 'Description 8', '2026-04-19 18:00:00+00', FALSE, 'HIGH', '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a809', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'f6b23451-2309-4f39-9c82-d8bc32f3a614', 'Task 9', 'Description 9', '2026-04-19 18:00:00+00', FALSE, 'HIGH', '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a810', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'f6b23451-2309-4f39-9c82-d8bc32f3a615', 'Task 10', 'Description 10', '2026-04-19 18:00:00+00', FALSE, 'HIGH', '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- AI Results: Sofia needs 6.
INSERT INTO ai_results (id, user_id, type, input_hash, input_payload, output_payload, created_at, expires_at)
VALUES
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a905', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'HIRING_PIPELINE_SUMMARY', 'seed-hash-hiring-sofia-001', '{"scope":"monthly_hiring_metrics","month":"2026-04"}', '{"summary":"7 active applications in pipeline, 2 interviews this week, median response time 2.3 days."}', '2026-04-18 08:00:00+00', '2026-10-18 08:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a906', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'RESUME_ANALYSIS', 'hash-6', '{}', '{}', '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a907', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'RESUME_ANALYSIS', 'hash-7', '{}', '{}', '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a908', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'RESUME_ANALYSIS', 'hash-8', '{}', '{}', '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a909', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'RESUME_ANALYSIS', 'hash-9', '{}', '{}', '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a910', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'RESUME_ANALYSIS', 'hash-10', '{}', '{}', '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Notifications: Sofia needs 6.
INSERT INTO notifications (id, user_id, channel, title, message, status, sent_at, created_at)
VALUES
    ('3a467891-c9da-47e2-a8b1-32297f56ba05', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'IN_APP', 'Status changed', 'Application for Java Platform Engineer changed to APPLIED.', 'PENDING', NULL, '2026-04-12 09:15:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba06', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'IN_APP', 'Title 6', 'Message 6', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba07', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'IN_APP', 'Title 7', 'Message 7', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba08', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'IN_APP', 'Title 8', 'Message 8', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba09', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'IN_APP', 'Title 9', 'Message 9', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba10', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'IN_APP', 'Title 10', 'Message 10', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Audit logs: Sofia needs 6.
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
VALUES
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb04', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'COMPANY_CREATED', 'COMPANY', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', '{"source":"seed","company_name":"CloudForge Labs"}', '2026-03-10 08:21:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb05', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'VACANCY_CREATED', 'VACANCY', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', '{"source":"seed","title":"Java Platform Engineer"}', '2026-04-04 10:02:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb06', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'ACTION_6', 'RESUME', 'b2df0f21-4b66-4605-87a7-48cf6d8fd201', '{}', '2026-01-11 10:01:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb07', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'ACTION_7', 'RESUME', 'b2df0f21-4b66-4605-87a7-48cf6d8fd201', '{}', '2026-01-11 10:01:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb08', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'ACTION_8', 'RESUME', 'b2df0f21-4b66-4605-87a7-48cf6d8fd201', '{}', '2026-01-11 10:01:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb09', (SELECT id FROM users WHERE email = 'sofia.horak@demo.dev'), 'ACTION_9', 'RESUME', 'b2df0f21-4b66-4605-87a7-48cf6d8fd201', '{}', '2026-01-11 10:01:00+00')
ON CONFLICT (id) DO NOTHING;
