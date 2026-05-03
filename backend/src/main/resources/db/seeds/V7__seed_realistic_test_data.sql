SET search_path TO careerpilot;

-- =========================
-- USERS
-- =========================
INSERT INTO users (id, email, password_hash, full_name, first_name, last_name, role, status, created_at, updated_at)
VALUES
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'anna.koval@demo.dev',   '$2a$10$seed.hash.anna',   'Anna Koval',         'Anna',   'Koval',     'USER', 'ACTIVE', '2026-01-10 09:15:00+00', '2026-01-10 09:15:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'maks.nowak@demo.dev',   '$2a$10$seed.hash.maks',   'Maks Nowak',         'Maks',   'Nowak',     'USER', 'ACTIVE', '2026-01-14 12:05:00+00', '2026-01-14 12:05:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'iryna.sidorova@demo.dev','$2a$10$seed.hash.iryna', 'Iryna Sidorova',     'Iryna',  'Sidorova',  'USER', 'ACTIVE', '2026-02-02 08:40:00+00', '2026-02-02 08:40:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'pavel.ivanov@demo.dev', '$2a$10$seed.hash.pavel',  'Pavel Ivanov',       'Pavel',  'Ivanov',    'USER', 'ACTIVE', '2026-02-20 15:22:00+00', '2026-02-20 15:22:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'sofia.horak@demo.dev',  '$2a$10$seed.hash.sofia',  'Sofia Horak',        'Sofia',  'Horak',     'ADMIN','ACTIVE', '2026-03-03 10:55:00+00', '2026-03-03 10:55:00+00')
ON CONFLICT (email) DO NOTHING;

-- =========================
-- USER PROFILES
-- =========================
INSERT INTO user_profiles (id, user_id, desired_position, experience_level, city, remote_preference, salary_expectation, summary, created_at, updated_at)
VALUES
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c101', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'Junior Java Developer',  'JUNIOR', 'Berlin', 'HYBRID', 2200, 'Junior backend developer focused on Java, Spring Boot and clean API design.', '2026-01-10 09:20:00+00', '2026-01-10 09:20:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c102', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'Backend Engineer',        'MIDDLE', 'Warsaw', 'REMOTE',  3200, 'Backend engineer with production experience in microservices and PostgreSQL tuning.', '2026-01-14 12:10:00+00', '2026-01-14 12:10:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c103', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'Java Developer',          'MIDDLE', 'Minsk',  'FLEXIBLE',2800, 'Java developer interested in distributed systems, messaging and cloud-native apps.', '2026-02-02 08:45:00+00', '2026-02-02 08:45:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c104', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'Full-Stack Developer',    'JUNIOR', 'Prague', 'OFFICE',  2400, 'Junior full-stack developer with React and Java fundamentals, eager to grow in product teams.', '2026-02-20 15:30:00+00', '2026-02-20 15:30:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c105', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Engineering Manager',     'MIDDLE', 'Remote', 'REMOTE',  4500, 'People-oriented engineer driving hiring, mentorship and platform quality.', '2026-03-03 11:00:00+00', '2026-03-03 11:00:00+00')
ON CONFLICT (user_id) DO NOTHING;

-- =========================
-- RESUMES (1-2 per user)
-- =========================
INSERT INTO resumes (id, user_id, title, file_url, text_content, is_active, created_at, updated_at)
VALUES
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd201', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'Anna Koval - Java Backend CV', 'https://cdn.demo.dev/resumes/anna-java.pdf', 'Java, Spring Boot, REST API, PostgreSQL, Docker. Built pet projects and internship API services.', TRUE,  '2026-01-11 10:00:00+00', '2026-01-11 10:00:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd202', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'Anna Koval - Internship CV',   'https://cdn.demo.dev/resumes/anna-intern.pdf', 'Motivated junior developer, CS degree, strong SQL and backend fundamentals.', FALSE, '2026-01-12 09:20:00+00', '2026-01-12 09:20:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd203', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'Maks Nowak - Backend Engineer', 'https://cdn.demo.dev/resumes/maks-backend.pdf', 'Java 17, Spring, Kafka, PostgreSQL, AWS. Delivered scalable APIs in fintech domain.', TRUE, '2026-01-16 13:10:00+00', '2026-01-16 13:10:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd204', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'Iryna Sidorova - Java CV',     'https://cdn.demo.dev/resumes/iryna-java.pdf', 'Spring Boot, Redis, RabbitMQ, observability with Grafana and Prometheus.', TRUE, '2026-02-04 09:35:00+00', '2026-02-04 09:35:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd205', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'Iryna Sidorova - Platform CV', 'https://cdn.demo.dev/resumes/iryna-platform.pdf', 'Platform mindset, CI/CD, containers, team mentoring and architecture docs.', FALSE, '2026-02-05 10:00:00+00', '2026-02-05 10:00:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd206', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'Pavel Ivanov - Fullstack CV',  'https://cdn.demo.dev/resumes/pavel-fullstack.pdf', 'React, TypeScript, Java, Spring, PostgreSQL. Built end-to-end dashboards and APIs.', TRUE, '2026-02-22 16:10:00+00', '2026-02-22 16:10:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd207', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Sofia Horak - Engineering Lead', 'https://cdn.demo.dev/resumes/sofia-lead.pdf', 'Hiring, architecture reviews, incident response and delivery leadership.', TRUE, '2026-03-05 09:45:00+00', '2026-03-05 09:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- COMPANIES
-- =========================
INSERT INTO companies (id, user_id, name, website, description, industry, company_size, location, linkedin_url, logo_url, created_at, updated_at)
VALUES
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'CloudForge Labs',    'https://cloudforge.example.com', 'Product company building developer productivity tools for cloud teams.', 'Developer Tools', 'STARTUP', 'Berlin', 'https://linkedin.com/company/cloudforge-labs', 'https://images.example.com/logos/cloudforge.png', '2026-03-10 08:20:00+00', '2026-03-10 08:20:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Vistula Payments',   'https://vistulapay.example.com',  'Fintech platform processing secure international B2B transactions.', 'FinTech',         'MEDIUM',  'Warsaw', 'https://linkedin.com/company/vistula-payments', 'https://images.example.com/logos/vistula.png',   '2026-03-10 08:40:00+00', '2026-03-10 08:40:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Prague Data Systems','https://praguedata.example.com', 'Data platform vendor delivering analytics pipelines for retail and logistics.', 'Data & Analytics','SMALL',   'Prague', 'https://linkedin.com/company/prague-data-systems', 'https://images.example.com/logos/pds.png',      '2026-03-10 09:00:00+00', '2026-03-10 09:00:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Nordic HealthTech',  'https://nordic-health.example.com','Digital health company building secure patient engagement services.', 'HealthTech',      'LARGE',   'Remote', 'https://linkedin.com/company/nordic-healthtech', 'https://images.example.com/logos/nordic-health.png', '2026-03-10 09:20:00+00', '2026-03-10 09:20:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Minsk Mobility AI',  'https://mobility-ai.example.com', 'AI-driven route optimization platform for urban mobility operators.', 'Transportation AI','SMALL',   'Minsk', 'https://linkedin.com/company/minsk-mobility-ai', 'https://images.example.com/logos/mobility-ai.png', '2026-03-10 09:35:00+00', '2026-03-10 09:35:00+00')
ON CONFLICT (user_id, name) DO NOTHING;

-- =========================
-- VACANCIES
-- =========================
INSERT INTO vacancies (
    id, user_id, company_id, title, source, source_url, location, employment_type, salary_from, salary_to, currency,
    description_raw, description_clean, status, remote_type, deadline, created_at, updated_at
)
VALUES
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'Junior Java Developer',      'LinkedIn', 'https://jobs.example.com/v1',  'Berlin',      'FULL_TIME',   2000, 2800, 'EUR', 'Junior backend role with mentorship and code reviews.', 'Build Spring Boot services, write tests and improve APIs.', 'ACTIVE', 'HYBRID',  '2026-06-15 23:59:00+00', '2026-04-01 08:00:00+00', '2026-04-01 08:00:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'Backend Engineer (Java)',    'Djinni',   'https://jobs.example.com/v2',  'Warsaw',      'FULL_TIME',   3200, 4200, 'EUR', 'Backend engineer for payments domain.', 'Design transaction processing APIs with reliability focus.', 'ACTIVE', 'REMOTE',  '2026-06-10 23:59:00+00', '2026-04-02 09:30:00+00', '2026-04-02 09:30:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'Spring Boot Developer',      'Company',  'https://jobs.example.com/v3',  'Prague',      'CONTRACT',    2800, 3600, 'EUR', 'Contract role in data platform team.', 'Implement REST integrations and optimize SQL performance.', 'ACTIVE', 'ON_SITE', '2026-06-30 23:59:00+00', '2026-04-03 11:10:00+00', '2026-04-03 11:10:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'Java Platform Engineer',     'Indeed',   'https://jobs.example.com/v4',  'Remote EU',   'FULL_TIME',   3500, 4800, 'EUR', 'Platform role for healthcare products.', 'Build secure microservices and maintain CI/CD standards.', 'ACTIVE', 'REMOTE',  '2026-06-20 23:59:00+00', '2026-04-04 10:00:00+00', '2026-04-04 10:00:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'Backend Engineer',            'LinkedIn', 'https://jobs.example.com/v5',  'Minsk',       'FULL_TIME',   2100, 3000, 'USD', 'Backend role in route optimization team.', 'Develop event-driven services and maintain PostgreSQL schemas.', 'ACTIVE', 'HYBRID', '2026-06-18 23:59:00+00', '2026-04-05 08:45:00+00', '2026-04-05 08:45:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'Java Intern',                 'Website',  'https://jobs.example.com/v6',  'Berlin',      'INTERNSHIP',   900, 1200, 'EUR', 'Internship with structured learning plan.', 'Work with senior mentors on internal tooling and tests.', 'ACTIVE', 'ON_SITE', '2026-05-30 23:59:00+00', '2026-04-06 09:15:00+00', '2026-04-06 09:15:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'Full-Stack Engineer',        'Referral', 'https://jobs.example.com/v7',  'Warsaw',      'FULL_TIME',   3000, 4100, 'EUR', 'Full-stack team handling customer portal.', 'Build React UI and Java APIs for account management.', 'ACTIVE', 'HYBRID',  '2026-06-25 23:59:00+00', '2026-04-07 12:20:00+00', '2026-04-07 12:20:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce408', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'Junior Backend Engineer',    'LinkedIn', 'https://jobs.example.com/v8',  'Prague',      'PART_TIME',   1400, 2000, 'EUR', 'Part-time backend role for students.', 'Contribute to API endpoints and basic data migrations.', 'ACTIVE', 'HYBRID',  '2026-06-05 23:59:00+00', '2026-04-08 07:55:00+00', '2026-04-08 07:55:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'SRE / Backend Engineer',     'Company',  'https://jobs.example.com/v9',  'Remote EU',   'CONTRACT',    3800, 5200, 'EUR', 'Reliability-focused backend position.', 'Own observability, incident tooling and backend stability.', 'ACTIVE', 'REMOTE',  '2026-07-01 23:59:00+00', '2026-04-09 10:35:00+00', '2026-04-09 10:35:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'React + Java Developer',     'Djinni',   'https://jobs.example.com/v10', 'Remote',      'FREELANCE',   2500, 3500, 'USD', 'Freelance role for feature delivery.', 'Ship user-facing features across frontend and backend stack.', 'ACTIVE', 'REMOTE',  '2026-06-12 23:59:00+00', '2026-04-10 14:00:00+00', '2026-04-10 14:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- VACANCY TAGS
-- =========================
INSERT INTO vacancy_tags (id, vacancy_id, tag, created_at)
VALUES
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df501', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'Java',        '2026-04-01 08:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df502', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'Spring',      '2026-04-01 08:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df503', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'PostgreSQL',  '2026-04-01 08:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df504', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'Java',        '2026-04-02 09:35:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df505', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'Docker',      '2026-04-02 09:35:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df506', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'AWS',         '2026-04-02 09:35:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df507', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'Spring',      '2026-04-03 11:15:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df508', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'PostgreSQL',  '2026-04-03 11:15:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df509', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'Java',        '2026-04-04 10:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df510', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'Kubernetes',  '2026-04-04 10:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df511', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'Java',        '2026-04-05 08:50:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df512', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'RabbitMQ',    '2026-04-05 08:50:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df513', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'Java',        '2026-04-06 09:20:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df514', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'SQL',         '2026-04-06 09:20:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df515', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'React',       '2026-04-07 12:25:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df516', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'Java',        '2026-04-07 12:25:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df517', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce408', 'Spring',      '2026-04-08 08:00:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df518', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'AWS',         '2026-04-09 10:40:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df519', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'Docker',      '2026-04-09 10:40:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df520', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'React',       '2026-04-10 14:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df521', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'PostgreSQL',  '2026-04-10 14:05:00+00')
ON CONFLICT (vacancy_id, tag) DO NOTHING;

-- =========================
-- APPLICATIONS
-- =========================
INSERT INTO applications (
    id, user_id, vacancy_id, status, applied_at, next_follow_up_at, last_contact_at, notes, created_at, updated_at
)
VALUES
    ('f6b23451-2309-4f39-9c82-d8bc32f3a601', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'APPLIED',        '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied with tailored Java resume.', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a602', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'HR_SCREEN',      '2026-04-12 10:15:00+00', '2026-04-20 10:30:00+00', '2026-04-16 08:45:00+00', 'Recruiter replied and requested quick intro call.', '2026-04-12 10:15:00+00', '2026-04-16 08:45:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a603', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'TECH_INTERVIEW', '2026-04-10 14:20:00+00', '2026-04-19 13:00:00+00', '2026-04-17 12:00:00+00', 'Passed HR round, scheduled technical interview.', '2026-04-10 14:20:00+00', '2026-04-17 12:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a604', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'SAVED',          NULL,                      '2026-04-21 11:00:00+00', NULL,                      'Saved for later after discussing contract details.', '2026-04-13 11:00:00+00', '2026-04-13 11:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a605', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'OFFER',          '2026-04-08 08:30:00+00', '2026-04-18 15:00:00+00', '2026-04-18 09:20:00+00', 'Received written offer, evaluating compensation.', '2026-04-08 08:30:00+00', '2026-04-18 09:20:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a606', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'REJECTED',       '2026-04-09 09:40:00+00', NULL,                      '2026-04-14 10:10:00+00', 'Rejected after final review due to team fit mismatch.', '2026-04-09 09:40:00+00', '2026-04-14 10:10:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a607', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'APPLIED',        '2026-04-15 16:40:00+00', '2026-04-22 09:00:00+00', '2026-04-15 16:40:00+00', 'Applied with full-stack portfolio links.', '2026-04-15 16:40:00+00', '2026-04-15 16:40:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a608', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce408', 'FINAL',          '2026-04-12 13:10:00+00', '2026-04-20 17:30:00+00', '2026-04-19 17:30:00+00', 'Final interview scheduled with engineering manager.', '2026-04-12 13:10:00+00', '2026-04-19 17:30:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a609', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'APPLIED',        '2026-04-07 10:00:00+00', '2026-04-16 10:00:00+00', '2026-04-12 09:00:00+00', 'Internal monitoring application for hiring workflow test.', '2026-04-07 10:00:00+00', '2026-04-12 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a610', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'ARCHIVED',       '2026-04-05 08:10:00+00', NULL,                      '2026-04-06 08:00:00+00', 'Archived because project scope changed to frontend-heavy.', '2026-04-05 08:10:00+00', '2026-04-06 08:00:00+00')
ON CONFLICT (user_id, vacancy_id) DO NOTHING;

-- =========================
-- INTERVIEWS
-- =========================
INSERT INTO interviews (
    id, application_id, type, scheduled_at, timezone, meeting_link, result, notes, created_at, updated_at
)
VALUES
    ('07134561-8f6c-4f31-a591-700d4f21a701', 'f6b23451-2309-4f39-9c82-d8bc32f3a602', 'HR_SCREEN',      '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr-anna',   'PENDING', '30-minute recruiter call to discuss motivation and salary expectations.', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a702', 'f6b23451-2309-4f39-9c82-d8bc32f3a603', 'TECH_INTERVIEW', '2026-04-19 13:00:00+00', 'Europe/Warsaw', 'https://meet.example.com/tech-maks',  'PENDING', 'Live coding on Spring transactions and SQL optimization.', '2026-04-17 12:05:00+00', '2026-04-17 12:05:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a703', 'f6b23451-2309-4f39-9c82-d8bc32f3a605', 'FINAL',          '2026-04-17 09:00:00+00', 'Europe/Prague', 'https://meet.example.com/final-iryna','PASSED',  'Final round completed successfully, offer prepared.', '2026-04-11 10:10:00+00', '2026-04-17 11:30:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a704', 'f6b23451-2309-4f39-9c82-d8bc32f3a608', 'TECH_SCREEN',    '2026-04-16 15:00:00+00', 'Europe/Prague', 'https://meet.example.com/tech-pavel', 'PASSED',  'Strong API fundamentals and good React state management discussion.', '2026-04-13 09:40:00+00', '2026-04-16 16:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- TASKS
-- =========================
INSERT INTO tasks (id, user_id, application_id, title, description, due_at, done, priority, created_at, updated_at)
VALUES
    ('18245671-9711-4b79-9cb2-a22ef6f7a801', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'f6b23451-2309-4f39-9c82-d8bc32f3a602', 'Prepare for interview',     'Review Spring Boot basics and common HR questions.', '2026-04-19 18:00:00+00', FALSE, 'HIGH',   '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a802', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'f6b23451-2309-4f39-9c82-d8bc32f3a603', 'Complete take-home test',  'Implement transaction-safe endpoint and add integration tests.', '2026-04-21 20:00:00+00', FALSE, 'URGENT', '2026-04-17 12:10:00+00', '2026-04-17 12:10:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a803', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'f6b23451-2309-4f39-9c82-d8bc32f3a605', 'Send follow-up email',     'Thank the panel and clarify preferred start date.', '2026-04-18 12:00:00+00', TRUE,  'MEDIUM', '2026-04-17 12:00:00+00', '2026-04-18 07:30:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a804', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'f6b23451-2309-4f39-9c82-d8bc32f3a608', 'Prepare final presentation','Create short walkthrough of previous full-stack project.', '2026-04-20 14:00:00+00', FALSE, 'HIGH',   '2026-04-18 10:30:00+00', '2026-04-18 10:30:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a805', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'f6b23451-2309-4f39-9c82-d8bc32f3a609', 'Review hiring pipeline',  'Validate SLA timings and status transitions in dashboard.', '2026-04-19 09:00:00+00', FALSE, 'LOW',    '2026-04-12 09:10:00+00', '2026-04-12 09:10:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- AI RESULTS
-- =========================
INSERT INTO ai_results (id, user_id, type, input_hash, input_payload, output_payload, created_at, expires_at)
VALUES
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a901', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'RESUME_ANALYSIS', 'seed-hash-resume-anna-001',
     '{"resume_id":"b2df0f21-4b66-4605-87a7-48cf6d8fd201","focus":"java_backend"}',
     '{"score":82,"strengths":["Spring basics","clear project examples"],"improvements":["add production metrics","expand testing details"]}',
     '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a902', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'COVER_LETTER_GENERATION', 'seed-hash-cover-maks-001',
     '{"vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402","tone":"professional"}',
     '{"text":"I am excited to apply my backend experience in payments and distributed systems to Vistula Payments..."}',
     '2026-04-10 15:00:00+00', '2026-10-10 15:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a903', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'INTERVIEW_QUESTION_GENERATION', 'seed-hash-interview-iryna-001',
     '{"application_id":"f6b23451-2309-4f39-9c82-d8bc32f3a605","round":"final"}',
     '{"questions":["Explain transaction isolation levels","How would you scale a notification service?","How do you handle backward-compatible API changes?"]}',
     '2026-04-16 17:00:00+00', '2026-10-16 17:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a904', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'RESUME_ANALYSIS', 'seed-hash-resume-pavel-001',
     '{"resume_id":"b2df0f21-4b66-4605-87a7-48cf6d8fd206","focus":"fullstack"}',
     '{"score":78,"strengths":["strong frontend examples","clear architecture notes"],"improvements":["add CI/CD achievements","quantify outcomes"]}',
     '2026-04-15 17:20:00+00', '2026-10-15 17:20:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a905', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'HIRING_PIPELINE_SUMMARY', 'seed-hash-hiring-sofia-001',
     '{"scope":"monthly_hiring_metrics","month":"2026-04"}',
     '{"summary":"7 active applications in pipeline, 2 interviews this week, median response time 2.3 days."}',
     '2026-04-18 08:00:00+00', '2026-10-18 08:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- NOTIFICATIONS
-- =========================
INSERT INTO notifications (id, user_id, channel, title, message, status, sent_at, created_at)
VALUES
    ('3a467891-c9da-47e2-a8b1-32297f56ba01', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'IN_APP', 'Interview scheduled',          'Your HR screen for Junior Java Developer is scheduled for Apr 20, 10:30 (Berlin).', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba02', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'EMAIL',  'Application moved to interview', 'Your application for Backend Engineer (Java) moved to technical interview stage.',      'SENT', '2026-04-17 12:10:00+00', '2026-04-17 12:08:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba03', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'IN_APP', 'Offer received',                'Congratulations! You received an offer from Prague Data Systems.',                      'READ', '2026-04-18 09:25:00+00', '2026-04-18 09:22:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba04', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'TELEGRAM','Task reminder',                 'Reminder: prepare your final presentation for tomorrow''s interview.',                   'SENT', '2026-04-19 08:00:00+00', '2026-04-19 07:55:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba05', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'IN_APP', 'Status changed',                'Application for Java Platform Engineer changed to APPLIED.',                            'PENDING', NULL, '2026-04-12 09:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- AUDIT LOGS
-- =========================
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
VALUES
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb01', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'RESUME_CREATED',               'RESUME',      'b2df0f21-4b66-4605-87a7-48cf6d8fd201', '{"source":"seed","title":"Anna Koval - Java Backend CV"}', '2026-01-11 10:01:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb02', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'APPLICATION_CREATED',          'APPLICATION', 'f6b23451-2309-4f39-9c82-d8bc32f3a603', '{"source":"seed","vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402"}', '2026-04-10 14:21:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb03', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'APPLICATION_STATUS_CHANGED',   'APPLICATION', 'f6b23451-2309-4f39-9c82-d8bc32f3a605', '{"from":"FINAL","to":"OFFER","source":"seed"}', '2026-04-18 09:20:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb04', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'COMPANY_CREATED',              'COMPANY',     'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', '{"source":"seed","company_name":"CloudForge Labs"}', '2026-03-10 08:21:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb05', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'VACANCY_CREATED',              'VACANCY',     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', '{"source":"seed","title":"Java Platform Engineer"}', '2026-04-04 10:02:00+00')
ON CONFLICT (id) DO NOTHING;
SET search_path TO careerpilot;

-- =========================
-- USERS
-- =========================
INSERT INTO users (id, email, password_hash, full_name, first_name, last_name, role, status, created_at, updated_at)
VALUES
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'anna.koval@demo.dev',   '$2a$10$seed.hash.anna',   'Anna Koval',         'Anna',   'Koval',     'USER', 'ACTIVE', '2026-01-10 09:15:00+00', '2026-01-10 09:15:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'maks.nowak@demo.dev',   '$2a$10$seed.hash.maks',   'Maks Nowak',         'Maks',   'Nowak',     'USER', 'ACTIVE', '2026-01-14 12:05:00+00', '2026-01-14 12:05:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'iryna.sidorova@demo.dev','$2a$10$seed.hash.iryna', 'Iryna Sidorova',     'Iryna',  'Sidorova',  'USER', 'ACTIVE', '2026-02-02 08:40:00+00', '2026-02-02 08:40:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'pavel.ivanov@demo.dev', '$2a$10$seed.hash.pavel',  'Pavel Ivanov',       'Pavel',  'Ivanov',    'USER', 'ACTIVE', '2026-02-20 15:22:00+00', '2026-02-20 15:22:00+00'),
    ('f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'sofia.horak@demo.dev',  '$2a$10$seed.hash.sofia',  'Sofia Horak',        'Sofia',  'Horak',     'ADMIN','ACTIVE', '2026-03-03 10:55:00+00', '2026-03-03 10:55:00+00')
ON CONFLICT (email) DO NOTHING;

-- =========================
-- USER PROFILES
-- =========================
INSERT INTO user_profiles (id, user_id, desired_position, experience_level, city, remote_preference, salary_expectation, summary, created_at, updated_at)
VALUES
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c101', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'Junior Java Developer',  'JUNIOR', 'Berlin', 'HYBRID', 2200, 'Junior backend developer focused on Java, Spring Boot and clean API design.', '2026-01-10 09:20:00+00', '2026-01-10 09:20:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c102', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'Backend Engineer',        'MIDDLE', 'Warsaw', 'REMOTE',  3200, 'Backend engineer with production experience in microservices and PostgreSQL tuning.', '2026-01-14 12:10:00+00', '2026-01-14 12:10:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c103', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'Java Developer',          'MIDDLE', 'Minsk',  'FLEXIBLE',2800, 'Java developer interested in distributed systems, messaging and cloud-native apps.', '2026-02-02 08:45:00+00', '2026-02-02 08:45:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c104', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'Full-Stack Developer',    'JUNIOR', 'Prague', 'OFFICE',  2400, 'Junior full-stack developer with React and Java fundamentals, eager to grow in product teams.', '2026-02-20 15:30:00+00', '2026-02-20 15:30:00+00'),
    ('a1c3fe11-8ec0-4ef7-9f21-42b98d57c105', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Engineering Manager',     'MIDDLE', 'Remote', 'REMOTE',  4500, 'People-oriented engineer driving hiring, mentorship and platform quality.', '2026-03-03 11:00:00+00', '2026-03-03 11:00:00+00')
ON CONFLICT (user_id) DO NOTHING;

-- =========================
-- RESUMES (1-2 per user)
-- =========================
INSERT INTO resumes (id, user_id, title, file_url, text_content, is_active, created_at, updated_at)
VALUES
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd201', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'Anna Koval - Java Backend CV', 'https://cdn.demo.dev/resumes/anna-java.pdf', 'Java, Spring Boot, REST API, PostgreSQL, Docker. Built pet projects and internship API services.', TRUE,  '2026-01-11 10:00:00+00', '2026-01-11 10:00:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd202', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'Anna Koval - Internship CV',   'https://cdn.demo.dev/resumes/anna-intern.pdf', 'Motivated junior developer, CS degree, strong SQL and backend fundamentals.', FALSE, '2026-01-12 09:20:00+00', '2026-01-12 09:20:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd203', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'Maks Nowak - Backend Engineer', 'https://cdn.demo.dev/resumes/maks-backend.pdf', 'Java 17, Spring, Kafka, PostgreSQL, AWS. Delivered scalable APIs in fintech domain.', TRUE, '2026-01-16 13:10:00+00', '2026-01-16 13:10:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd204', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'Iryna Sidorova - Java CV',     'https://cdn.demo.dev/resumes/iryna-java.pdf', 'Spring Boot, Redis, RabbitMQ, observability with Grafana and Prometheus.', TRUE, '2026-02-04 09:35:00+00', '2026-02-04 09:35:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd205', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'Iryna Sidorova - Platform CV', 'https://cdn.demo.dev/resumes/iryna-platform.pdf', 'Platform mindset, CI/CD, containers, team mentoring and architecture docs.', FALSE, '2026-02-05 10:00:00+00', '2026-02-05 10:00:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd206', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'Pavel Ivanov - Fullstack CV',  'https://cdn.demo.dev/resumes/pavel-fullstack.pdf', 'React, TypeScript, Java, Spring, PostgreSQL. Built end-to-end dashboards and APIs.', TRUE, '2026-02-22 16:10:00+00', '2026-02-22 16:10:00+00'),
    ('b2df0f21-4b66-4605-87a7-48cf6d8fd207', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Sofia Horak - Engineering Lead', 'https://cdn.demo.dev/resumes/sofia-lead.pdf', 'Hiring, architecture reviews, incident response and delivery leadership.', TRUE, '2026-03-05 09:45:00+00', '2026-03-05 09:45:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- COMPANIES
-- =========================
INSERT INTO companies (id, user_id, name, website, description, industry, company_size, location, linkedin_url, logo_url, created_at, updated_at)
VALUES
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'CloudForge Labs',    'https://cloudforge.example.com', 'Product company building developer productivity tools for cloud teams.', 'Developer Tools', 'STARTUP', 'Berlin', 'https://linkedin.com/company/cloudforge-labs', 'https://images.example.com/logos/cloudforge.png', '2026-03-10 08:20:00+00', '2026-03-10 08:20:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Vistula Payments',   'https://vistulapay.example.com',  'Fintech platform processing secure international B2B transactions.', 'FinTech',         'MEDIUM',  'Warsaw', 'https://linkedin.com/company/vistula-payments', 'https://images.example.com/logos/vistula.png',   '2026-03-10 08:40:00+00', '2026-03-10 08:40:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Prague Data Systems','https://praguedata.example.com', 'Data platform vendor delivering analytics pipelines for retail and logistics.', 'Data & Analytics','SMALL',   'Prague', 'https://linkedin.com/company/prague-data-systems', 'https://images.example.com/logos/pds.png',      '2026-03-10 09:00:00+00', '2026-03-10 09:00:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Nordic HealthTech',  'https://nordic-health.example.com','Digital health company building secure patient engagement services.', 'HealthTech',      'LARGE',   'Remote', 'https://linkedin.com/company/nordic-healthtech', 'https://images.example.com/logos/nordic-health.png', '2026-03-10 09:20:00+00', '2026-03-10 09:20:00+00'),
    ('c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'Minsk Mobility AI',  'https://mobility-ai.example.com', 'AI-driven route optimization platform for urban mobility operators.', 'Transportation AI','SMALL',   'Minsk', 'https://linkedin.com/company/minsk-mobility-ai', 'https://images.example.com/logos/mobility-ai.png', '2026-03-10 09:35:00+00', '2026-03-10 09:35:00+00')
ON CONFLICT (user_id, name) DO NOTHING;

-- =========================
-- VACANCIES
-- =========================
INSERT INTO vacancies (
    id, user_id, company_id, title, source, source_url, location, employment_type, salary_from, salary_to, currency,
    description_raw, description_clean, status, remote_type, deadline, created_at, updated_at
)
VALUES
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'Junior Java Developer',      'LinkedIn', 'https://jobs.example.com/v1',  'Berlin',      'FULL_TIME',   2000, 2800, 'EUR', 'Junior backend role with mentorship and code reviews.', 'Build Spring Boot services, write tests and improve APIs.', 'ACTIVE', 'HYBRID',  '2026-06-15 23:59:00+00', '2026-04-01 08:00:00+00', '2026-04-01 08:00:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'Backend Engineer (Java)',    'Djinni',   'https://jobs.example.com/v2',  'Warsaw',      'FULL_TIME',   3200, 4200, 'EUR', 'Backend engineer for payments domain.', 'Design transaction processing APIs with reliability focus.', 'ACTIVE', 'REMOTE',  '2026-06-10 23:59:00+00', '2026-04-02 09:30:00+00', '2026-04-02 09:30:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'Spring Boot Developer',      'Company',  'https://jobs.example.com/v3',  'Prague',      'CONTRACT',    2800, 3600, 'EUR', 'Contract role in data platform team.', 'Implement REST integrations and optimize SQL performance.', 'ACTIVE', 'ON_SITE', '2026-06-30 23:59:00+00', '2026-04-03 11:10:00+00', '2026-04-03 11:10:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'Java Platform Engineer',     'Indeed',   'https://jobs.example.com/v4',  'Remote EU',   'FULL_TIME',   3500, 4800, 'EUR', 'Platform role for healthcare products.', 'Build secure microservices and maintain CI/CD standards.', 'ACTIVE', 'REMOTE',  '2026-06-20 23:59:00+00', '2026-04-04 10:00:00+00', '2026-04-04 10:00:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'Backend Engineer',            'LinkedIn', 'https://jobs.example.com/v5',  'Minsk',       'FULL_TIME',   2100, 3000, 'USD', 'Backend role in route optimization team.', 'Develop event-driven services and maintain PostgreSQL schemas.', 'ACTIVE', 'HYBRID', '2026-06-18 23:59:00+00', '2026-04-05 08:45:00+00', '2026-04-05 08:45:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', 'Java Intern',                 'Website',  'https://jobs.example.com/v6',  'Berlin',      'INTERNSHIP',   900, 1200, 'EUR', 'Internship with structured learning plan.', 'Work with senior mentors on internal tooling and tests.', 'ACTIVE', 'ON_SITE', '2026-05-30 23:59:00+00', '2026-04-06 09:15:00+00', '2026-04-06 09:15:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba302', 'Full-Stack Engineer',        'Referral', 'https://jobs.example.com/v7',  'Warsaw',      'FULL_TIME',   3000, 4100, 'EUR', 'Full-stack team handling customer portal.', 'Build React UI and Java APIs for account management.', 'ACTIVE', 'HYBRID',  '2026-06-25 23:59:00+00', '2026-04-07 12:20:00+00', '2026-04-07 12:20:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce408', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba303', 'Junior Backend Engineer',    'LinkedIn', 'https://jobs.example.com/v8',  'Prague',      'PART_TIME',   1400, 2000, 'EUR', 'Part-time backend role for students.', 'Contribute to API endpoints and basic data migrations.', 'ACTIVE', 'HYBRID',  '2026-06-05 23:59:00+00', '2026-04-08 07:55:00+00', '2026-04-08 07:55:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba304', 'SRE / Backend Engineer',     'Company',  'https://jobs.example.com/v9',  'Remote EU',   'CONTRACT',    3800, 5200, 'EUR', 'Reliability-focused backend position.', 'Own observability, incident tooling and backend stability.', 'ACTIVE', 'REMOTE',  '2026-07-01 23:59:00+00', '2026-04-09 10:35:00+00', '2026-04-09 10:35:00+00'),
    ('d4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'c3ef1021-266a-4b88-bd6f-d7f07e7ba305', 'React + Java Developer',     'Djinni',   'https://jobs.example.com/v10', 'Remote',      'FREELANCE',   2500, 3500, 'USD', 'Freelance role for feature delivery.', 'Ship user-facing features across frontend and backend stack.', 'ACTIVE', 'REMOTE',  '2026-06-12 23:59:00+00', '2026-04-10 14:00:00+00', '2026-04-10 14:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- VACANCY TAGS
-- =========================
INSERT INTO vacancy_tags (id, vacancy_id, tag, created_at)
VALUES
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df501', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'Java',        '2026-04-01 08:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df502', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'Spring',      '2026-04-01 08:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df503', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'PostgreSQL',  '2026-04-01 08:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df504', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'Java',        '2026-04-02 09:35:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df505', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'Docker',      '2026-04-02 09:35:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df506', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'AWS',         '2026-04-02 09:35:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df507', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'Spring',      '2026-04-03 11:15:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df508', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'PostgreSQL',  '2026-04-03 11:15:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df509', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'Java',        '2026-04-04 10:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df510', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'Kubernetes',  '2026-04-04 10:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df511', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'Java',        '2026-04-05 08:50:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df512', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'RabbitMQ',    '2026-04-05 08:50:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df513', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'Java',        '2026-04-06 09:20:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df514', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'SQL',         '2026-04-06 09:20:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df515', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'React',       '2026-04-07 12:25:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df516', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'Java',        '2026-04-07 12:25:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df517', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce408', 'Spring',      '2026-04-08 08:00:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df518', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'AWS',         '2026-04-09 10:40:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df519', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'Docker',      '2026-04-09 10:40:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df520', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'React',       '2026-04-10 14:05:00+00'),
    ('e5a12341-7f6e-47c5-82a1-6eb8be1df521', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'PostgreSQL',  '2026-04-10 14:05:00+00')
ON CONFLICT (vacancy_id, tag) DO NOTHING;

-- =========================
-- APPLICATIONS
-- =========================
INSERT INTO applications (
    id, user_id, vacancy_id, status, applied_at, next_follow_up_at, last_contact_at, notes, created_at, updated_at
)
VALUES
    ('f6b23451-2309-4f39-9c82-d8bc32f3a601', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401', 'APPLIED',        '2026-04-11 09:00:00+00', '2026-04-18 09:00:00+00', '2026-04-11 09:00:00+00', 'Applied with tailored Java resume.', '2026-04-11 09:00:00+00', '2026-04-11 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a602', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406', 'HR_SCREEN',      '2026-04-12 10:15:00+00', '2026-04-20 10:30:00+00', '2026-04-16 08:45:00+00', 'Recruiter replied and requested quick intro call.', '2026-04-12 10:15:00+00', '2026-04-16 08:45:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a603', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402', 'TECH_INTERVIEW', '2026-04-10 14:20:00+00', '2026-04-19 13:00:00+00', '2026-04-17 12:00:00+00', 'Passed HR round, scheduled technical interview.', '2026-04-10 14:20:00+00', '2026-04-17 12:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a604', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409', 'SAVED',          NULL,                      '2026-04-21 11:00:00+00', NULL,                      'Saved for later after discussing contract details.', '2026-04-13 11:00:00+00', '2026-04-13 11:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a605', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403', 'OFFER',          '2026-04-08 08:30:00+00', '2026-04-18 15:00:00+00', '2026-04-18 09:20:00+00', 'Received written offer, evaluating compensation.', '2026-04-08 08:30:00+00', '2026-04-18 09:20:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a606', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405', 'REJECTED',       '2026-04-09 09:40:00+00', NULL,                      '2026-04-14 10:10:00+00', 'Rejected after final review due to team fit mismatch.', '2026-04-09 09:40:00+00', '2026-04-14 10:10:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a607', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407', 'APPLIED',        '2026-04-15 16:40:00+00', '2026-04-22 09:00:00+00', '2026-04-15 16:40:00+00', 'Applied with full-stack portfolio links.', '2026-04-15 16:40:00+00', '2026-04-15 16:40:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a608', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce408', 'FINAL',          '2026-04-12 13:10:00+00', '2026-04-20 17:30:00+00', '2026-04-19 17:30:00+00', 'Final interview scheduled with engineering manager.', '2026-04-12 13:10:00+00', '2026-04-19 17:30:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a609', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', 'APPLIED',        '2026-04-07 10:00:00+00', '2026-04-16 10:00:00+00', '2026-04-12 09:00:00+00', 'Internal monitoring application for hiring workflow test.', '2026-04-07 10:00:00+00', '2026-04-12 09:00:00+00'),
    ('f6b23451-2309-4f39-9c82-d8bc32f3a610', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410', 'ARCHIVED',       '2026-04-05 08:10:00+00', NULL,                      '2026-04-06 08:00:00+00', 'Archived because project scope changed to frontend-heavy.', '2026-04-05 08:10:00+00', '2026-04-06 08:00:00+00')
ON CONFLICT (user_id, vacancy_id) DO NOTHING;

-- =========================
-- INTERVIEWS
-- =========================
INSERT INTO interviews (
    id, application_id, type, scheduled_at, timezone, meeting_link, result, notes, created_at, updated_at
)
VALUES
    ('07134561-8f6c-4f31-a591-700d4f21a701', 'f6b23451-2309-4f39-9c82-d8bc32f3a602', 'HR_SCREEN',      '2026-04-20 10:30:00+00', 'Europe/Berlin', 'https://meet.example.com/hr-anna',   'PENDING', '30-minute recruiter call to discuss motivation and salary expectations.', '2026-04-16 08:50:00+00', '2026-04-16 08:50:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a702', 'f6b23451-2309-4f39-9c82-d8bc32f3a603', 'TECH_INTERVIEW', '2026-04-19 13:00:00+00', 'Europe/Warsaw', 'https://meet.example.com/tech-maks',  'PENDING', 'Live coding on Spring transactions and SQL optimization.', '2026-04-17 12:05:00+00', '2026-04-17 12:05:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a703', 'f6b23451-2309-4f39-9c82-d8bc32f3a605', 'FINAL',          '2026-04-17 09:00:00+00', 'Europe/Prague', 'https://meet.example.com/final-iryna','PASSED',  'Final round completed successfully, offer prepared.', '2026-04-11 10:10:00+00', '2026-04-17 11:30:00+00'),
    ('07134561-8f6c-4f31-a591-700d4f21a704', 'f6b23451-2309-4f39-9c82-d8bc32f3a608', 'TECH_SCREEN',    '2026-04-16 15:00:00+00', 'Europe/Prague', 'https://meet.example.com/tech-pavel', 'PASSED',  'Strong API fundamentals and good React state management discussion.', '2026-04-13 09:40:00+00', '2026-04-16 16:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- TASKS
-- =========================
INSERT INTO tasks (id, user_id, application_id, title, description, due_at, done, priority, created_at, updated_at)
VALUES
    ('18245671-9711-4b79-9cb2-a22ef6f7a801', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'f6b23451-2309-4f39-9c82-d8bc32f3a602', 'Prepare for interview',     'Review Spring Boot basics and common HR questions.', '2026-04-19 18:00:00+00', FALSE, 'HIGH',   '2026-04-16 09:00:00+00', '2026-04-16 09:00:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a802', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'f6b23451-2309-4f39-9c82-d8bc32f3a603', 'Complete take-home test',  'Implement transaction-safe endpoint and add integration tests.', '2026-04-21 20:00:00+00', FALSE, 'URGENT', '2026-04-17 12:10:00+00', '2026-04-17 12:10:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a803', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'f6b23451-2309-4f39-9c82-d8bc32f3a605', 'Send follow-up email',     'Thank the panel and clarify preferred start date.', '2026-04-18 12:00:00+00', TRUE,  'MEDIUM', '2026-04-17 12:00:00+00', '2026-04-18 07:30:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a804', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'f6b23451-2309-4f39-9c82-d8bc32f3a608', 'Prepare final presentation','Create short walkthrough of previous full-stack project.', '2026-04-20 14:00:00+00', FALSE, 'HIGH',   '2026-04-18 10:30:00+00', '2026-04-18 10:30:00+00'),
    ('18245671-9711-4b79-9cb2-a22ef6f7a805', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'f6b23451-2309-4f39-9c82-d8bc32f3a609', 'Review hiring pipeline',  'Validate SLA timings and status transitions in dashboard.', '2026-04-19 09:00:00+00', FALSE, 'LOW',    '2026-04-12 09:10:00+00', '2026-04-12 09:10:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- AI RESULTS
-- =========================
INSERT INTO ai_results (id, user_id, type, input_hash, input_payload, output_payload, created_at, expires_at)
VALUES
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a901', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'RESUME_ANALYSIS', 'seed-hash-resume-anna-001',
     '{"resume_id":"b2df0f21-4b66-4605-87a7-48cf6d8fd201","focus":"java_backend"}',
     '{"score":82,"strengths":["Spring basics","clear project examples"],"improvements":["add production metrics","expand testing details"]}',
     '2026-04-11 11:00:00+00', '2026-10-11 11:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a902', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'COVER_LETTER_GENERATION', 'seed-hash-cover-maks-001',
     '{"vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402","tone":"professional"}',
     '{"text":"I am excited to apply my backend experience in payments and distributed systems to Vistula Payments..."}',
     '2026-04-10 15:00:00+00', '2026-10-10 15:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a903', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'INTERVIEW_QUESTION_GENERATION', 'seed-hash-interview-iryna-001',
     '{"application_id":"f6b23451-2309-4f39-9c82-d8bc32f3a605","round":"final"}',
     '{"questions":["Explain transaction isolation levels","How would you scale a notification service?","How do you handle backward-compatible API changes?"]}',
     '2026-04-16 17:00:00+00', '2026-10-16 17:00:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a904', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'RESUME_ANALYSIS', 'seed-hash-resume-pavel-001',
     '{"resume_id":"b2df0f21-4b66-4605-87a7-48cf6d8fd206","focus":"fullstack"}',
     '{"score":78,"strengths":["strong frontend examples","clear architecture notes"],"improvements":["add CI/CD achievements","quantify outcomes"]}',
     '2026-04-15 17:20:00+00', '2026-10-15 17:20:00+00'),
    ('29356781-a6a9-4b7d-8bb2-41bf53f3a905', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'HIRING_PIPELINE_SUMMARY', 'seed-hash-hiring-sofia-001',
     '{"scope":"monthly_hiring_metrics","month":"2026-04"}',
     '{"summary":"7 active applications in pipeline, 2 interviews this week, median response time 2.3 days."}',
     '2026-04-18 08:00:00+00', '2026-10-18 08:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- NOTIFICATIONS
-- =========================
INSERT INTO notifications (id, user_id, channel, title, message, status, sent_at, created_at)
VALUES
    ('3a467891-c9da-47e2-a8b1-32297f56ba01', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'IN_APP', 'Interview scheduled',          'Your HR screen for Junior Java Developer is scheduled for Apr 20, 10:30 (Berlin).', 'SENT', '2026-04-16 09:05:00+00', '2026-04-16 09:00:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba02', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'EMAIL',  'Application moved to interview', 'Your application for Backend Engineer (Java) moved to technical interview stage.',      'SENT', '2026-04-17 12:10:00+00', '2026-04-17 12:08:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba03', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'IN_APP', 'Offer received',                'Congratulations! You received an offer from Prague Data Systems.',                      'READ', '2026-04-18 09:25:00+00', '2026-04-18 09:22:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba04', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a004', 'TELEGRAM','Task reminder',                 'Reminder: prepare your final presentation for tomorrow''s interview.',                   'SENT', '2026-04-19 08:00:00+00', '2026-04-19 07:55:00+00'),
    ('3a467891-c9da-47e2-a8b1-32297f56ba05', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'IN_APP', 'Status changed',                'Application for Java Platform Engineer changed to APPLIED.',                            'PENDING', NULL, '2026-04-12 09:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- =========================
-- AUDIT LOGS
-- =========================
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at)
VALUES
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb01', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a001', 'RESUME_CREATED',               'RESUME',      'b2df0f21-4b66-4605-87a7-48cf6d8fd201', '{"source":"seed","title":"Anna Koval - Java Backend CV"}', '2026-01-11 10:01:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb02', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a002', 'APPLICATION_CREATED',          'APPLICATION', 'f6b23451-2309-4f39-9c82-d8bc32f3a603', '{"source":"seed","vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402"}', '2026-04-10 14:21:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb03', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a003', 'APPLICATION_STATUS_CHANGED',   'APPLICATION', 'f6b23451-2309-4f39-9c82-d8bc32f3a605', '{"from":"FINAL","to":"OFFER","source":"seed"}', '2026-04-18 09:20:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb04', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'COMPANY_CREATED',              'COMPANY',     'c3ef1021-266a-4b88-bd6f-d7f07e7ba301', '{"source":"seed","company_name":"CloudForge Labs"}', '2026-03-10 08:21:00+00'),
    ('4b5789a1-d0eb-4b31-9222-9ea87167cb05', 'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005', 'VACANCY_CREATED',              'VACANCY',     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404', '{"source":"seed","title":"Java Platform Engineer"}', '2026-04-04 10:02:00+00')
ON CONFLICT (id) DO NOTHING;
