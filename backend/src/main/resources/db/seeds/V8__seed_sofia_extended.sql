SET search_path TO careerpilot;

-- =========================
-- APPLICATIONS для Sofia
-- (у неё уже есть одна: f6b23451...a609 = APPLIED)
-- =========================
INSERT INTO applications (id, user_id, vacancy_id, status, applied_at, next_follow_up_at, last_contact_at, notes,
                          created_at, updated_at)
VALUES
    -- NEW
    ('a0000001-0000-0000-0000-000000000001',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce401',
     'NEW', NULL, '2026-05-10 10:00:00+00', NULL,
     'Нашла вакансию, пока изучаю требования.',
     '2026-05-02 09:00:00+00', '2026-05-02 09:00:00+00'),

    ('a0000001-0000-0000-0000-000000000002',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce402',
     'NEW', NULL, '2026-05-11 10:00:00+00', NULL,
     'Интересная роль, нужно изучить стек.',
     '2026-05-02 11:00:00+00', '2026-05-02 11:00:00+00'),

    -- SAVED
    ('a0000001-0000-0000-0000-000000000003',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce403',
     'SAVED', NULL, '2026-05-12 09:00:00+00', NULL,
     'Сохранила, хочу обновить резюме перед откликом.',
     '2026-05-01 10:00:00+00', '2026-05-01 10:00:00+00'),

    ('a0000001-0000-0000-0000-000000000004',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce404',
     'SAVED', NULL, '2026-05-13 09:00:00+00', NULL,
     'Хорошая зарплата, сохранила для сравнения.',
     '2026-05-01 14:00:00+00', '2026-05-01 14:00:00+00'),

    -- APPLIED
    -- (уже есть f6b23451...a609 для вакансии v4)
    ('a0000001-0000-0000-0000-000000000005',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce405',
     'APPLIED', '2026-04-28 09:00:00+00', '2026-05-05 09:00:00+00', '2026-04-28 09:00:00+00',
     'Отправила резюме и cover letter.',
     '2026-04-28 09:00:00+00', '2026-04-28 09:00:00+00'),

    -- HR_SCREEN
    ('a0000001-0000-0000-0000-000000000006',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce406',
     'HR_SCREEN', '2026-04-20 10:00:00+00', '2026-04-28 10:00:00+00', '2026-04-25 09:00:00+00',
     'Рекрутер написал, назначен звонок на пятницу.',
     '2026-04-20 10:00:00+00', '2026-04-25 09:00:00+00'),

    ('a0000001-0000-0000-0000-000000000007',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce407',
     'HR_SCREEN', '2026-04-22 11:00:00+00', '2026-04-30 11:00:00+00', '2026-04-26 10:00:00+00',
     'HR позвонил, обсудили формат работы и зарплату.',
     '2026-04-22 11:00:00+00', '2026-04-26 10:00:00+00'),

    -- TECH_INTERVIEW
    ('a0000001-0000-0000-0000-000000000008',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce408',
     'TECH_INTERVIEW', '2026-04-15 08:00:00+00', '2026-04-29 13:00:00+00', '2026-04-26 12:00:00+00',
     'Прошла HR, назначено техническое интервью на следующей неделе.',
     '2026-04-15 08:00:00+00', '2026-04-26 12:00:00+00'),

    ('a0000001-0000-0000-0000-000000000009',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce409',
     'TECH_INTERVIEW', '2026-04-16 09:00:00+00', '2026-04-30 14:00:00+00', '2026-04-27 11:00:00+00',
     'Техническое интервью по системному дизайну и Java concurrency.',
     '2026-04-16 09:00:00+00', '2026-04-27 11:00:00+00'),

    -- FINAL
    ('a0000001-0000-0000-0000-000000000010',
     'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
     'd4f01231-15d0-4fa0-93b2-0a7e5c8ce410',
     'FINAL', '2026-04-10 10:00:00+00', '2026-05-01 10:00:00+00', '2026-04-28 14:00:00+00',
     'Финальное интервью с CTO, обсуждение архитектуры.',
     '2026-04-10 10:00:00+00', '2026-04-28 14:00:00+00')

ON CONFLICT (user_id, vacancy_id) DO NOTHING;

-- =========================
-- INTERVIEWS для Sofia
-- =========================
INSERT INTO interviews (id, application_id, type, scheduled_at, timezone, meeting_link, result, notes, created_at,
                        updated_at)
VALUES ('b0000001-0000-0000-0000-000000000001',
        'a0000001-0000-0000-0000-000000000006',
        'HR_SCREEN', '2026-04-28 10:00:00+00', 'Europe/Prague',
        'https://meet.example.com/hr-sofia-1', 'PASSED',
        'Обсудили мотивацию, remote-формат и зарплатные ожидания. Положительный результат.',
        '2026-04-25 09:05:00+00', '2026-04-28 11:00:00+00'),

       ('b0000001-0000-0000-0000-000000000002',
        'a0000001-0000-0000-0000-000000000008',
        'TECH_INTERVIEW', '2026-04-29 13:00:00+00', 'Europe/Berlin',
        'https://meet.example.com/tech-sofia-1', 'PENDING',
        'Задачи по Java concurrency, system design распределённой очереди.',
        '2026-04-26 12:05:00+00', '2026-04-26 12:05:00+00'),

       ('b0000001-0000-0000-0000-000000000003',
        'a0000001-0000-0000-0000-000000000009',
        'TECH_INTERVIEW', '2026-04-30 14:00:00+00', 'Europe/Warsaw',
        'https://meet.example.com/tech-sofia-2', 'PENDING',
        'Фокус на Spring internals, Kafka и observability.',
        '2026-04-27 11:05:00+00', '2026-04-27 11:05:00+00'),

       ('b0000001-0000-0000-0000-000000000004',
        'a0000001-0000-0000-0000-000000000010',
        'FINAL', '2026-05-01 10:00:00+00', 'Europe/Prague',
        'https://meet.example.com/final-sofia-1', 'PENDING',
        'Встреча с CTO и engineering lead. Обсуждение архитектурных решений и team fit.',
        '2026-04-28 14:05:00+00', '2026-04-28 14:05:00+00')

ON CONFLICT (id) DO NOTHING;

-- =========================
-- TASKS для Sofia
-- =========================
INSERT INTO tasks (id, user_id, application_id, title, description, due_at, done, priority, created_at, updated_at)
VALUES ('c0000001-0000-0000-0000-000000000001',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'a0000001-0000-0000-0000-000000000008',
        'Подготовить system design',
        'Нарисовать схему распределённой очереди сообщений с Kafka и Redis.',
        '2026-04-29 10:00:00+00', FALSE, 'HIGH',
        '2026-04-26 12:10:00+00', '2026-04-26 12:10:00+00'),

       ('c0000001-0000-0000-0000-000000000002',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'a0000001-0000-0000-0000-000000000009',
        'Повторить Kafka consumer groups',
        'Изучить offset management, partition rebalancing и at-least-once delivery.',
        '2026-04-30 12:00:00+00', FALSE, 'HIGH',
        '2026-04-27 11:10:00+00', '2026-04-27 11:10:00+00'),

       ('c0000001-0000-0000-0000-000000000003',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'a0000001-0000-0000-0000-000000000010',
        'Подготовить вопросы для CTO',
        'Список вопросов про tech roadmap, team structure и engineering culture.',
        '2026-05-01 08:00:00+00', FALSE, 'MEDIUM',
        '2026-04-28 14:10:00+00', '2026-04-28 14:10:00+00'),

       ('c0000001-0000-0000-0000-000000000004',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'a0000001-0000-0000-0000-000000000007',
        'Сравнить офферы',
        'Составить таблицу сравнения: зарплата, remote, стек, growth potential.',
        '2026-05-03 18:00:00+00', FALSE, 'HIGH',
        '2026-04-29 10:30:00+00', '2026-04-29 10:30:00+00'),

       ('c0000001-0000-0000-0000-000000000005',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'a0000001-0000-0000-0000-000000000006',
        'Обновить резюме перед HR звонком',
        'Добавить последние проекты и обновить summary секцию.',
        '2026-04-27 20:00:00+00', TRUE, 'MEDIUM',
        '2026-04-25 09:10:00+00', '2026-04-27 19:00:00+00')

ON CONFLICT (id) DO NOTHING;

-- =========================
-- AI RESULTS для Sofia
-- =========================
INSERT INTO ai_results (id, user_id, type, input_hash, input_payload, output_payload, created_at, expires_at)
VALUES ('d0000001-0000-0000-0000-000000000001',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'VACANCY_ANALYSIS', 'seed-hash-vacancy-sofia-001',
        '{"vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402"}',
        '{"summary":"Strong fintech backend role. Key requirements: Java 17+, Spring, Kafka, PostgreSQL. Remote-friendly. Salary competitive for Warsaw market.","match_score":88,"red_flags":[],"recommendations":["Emphasize Kafka experience","Mention distributed systems projects"]}',
        '2026-04-25 10:00:00+00', '2026-10-25 10:00:00+00'),

       ('d0000001-0000-0000-0000-000000000002',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'RESUME_MATCH', 'seed-hash-match-sofia-001',
        '{"vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402","resume_id":"b2df0f21-4b66-4605-87a7-48cf6d8fd207"}',
        '{"match_score":84,"matched_skills":["Java","Spring Boot","PostgreSQL","Docker","leadership"],"missing_skills":["Kafka","AWS"],"recommendation":"Strong match. Consider adding Kafka pet project to resume."}',
        '2026-04-25 10:30:00+00', '2026-10-25 10:30:00+00'),

       ('d0000001-0000-0000-0000-000000000003',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'COVER_LETTER', 'seed-hash-cover-sofia-001',
        '{"vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce402","tone":"PROFESSIONAL"}',
        '{"text":"Dear Hiring Team, I am excited to bring my experience in distributed backend systems and engineering leadership to Vistula Payments. Having led platform quality initiatives and hiring pipelines, I am confident in my ability to contribute to your fintech infrastructure from day one..."}',
        '2026-04-26 09:00:00+00', '2026-10-26 09:00:00+00'),

       ('d0000001-0000-0000-0000-000000000004',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'INTERVIEW_QUESTIONS', 'seed-hash-interview-sofia-001',
        '{"vacancy_id":"d4f01231-15d0-4fa0-93b2-0a7e5c8ce408","focus_area":"system design","count":5}',
        '{"questions":["How would you design a horizontally scalable job queue?","Explain CAP theorem and how it applies to your last project","How do you handle database migrations in a zero-downtime deployment?","Describe your approach to incident response and post-mortem","How would you mentor a junior developer struggling with concurrency?"]}',
        '2026-04-27 11:30:00+00', '2026-10-27 11:30:00+00')

ON CONFLICT (id) DO NOTHING;

-- =========================
-- NOTIFICATIONS для Sofia
-- =========================
INSERT INTO notifications (id, user_id, channel, title, message, status, sent_at, created_at)
VALUES ('e0000001-0000-0000-0000-000000000001',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'IN_APP', 'Техническое интервью завтра',
        'Напоминание: техническое интервью в CloudForge Labs завтра в 13:00.',
        'SENT', '2026-04-28 09:00:00+00', '2026-04-28 09:00:00+00'),

       ('e0000001-0000-0000-0000-000000000002',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'IN_APP', 'Получен оффер',
        'Поздравляем! Vistula Payments прислали письменный оффер. Проверьте детали.',
        'READ', '2026-04-29 10:05:00+00', '2026-04-29 10:00:00+00'),

       ('e0000001-0000-0000-0000-000000000003',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'IN_APP', 'AI анализ готов',
        'Анализ вакансии Backend Engineer (Java) завершён. Match score: 84%.',
        'READ', '2026-04-25 10:35:00+00', '2026-04-25 10:30:00+00'),

       ('e0000001-0000-0000-0000-000000000004',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'IN_APP', 'Финальное интервью завтра',
        'Напоминание: финальное интервью с CTO в Prague Data Systems завтра в 10:00.',
        'SENT', '2026-04-30 09:00:00+00', '2026-04-30 09:00:00+00'),

       ('e0000001-0000-0000-0000-000000000005',
        'f0d3be01-6dc1-4e11-8b78-52a2f7b9a005',
        'IN_APP', 'Задача просрочена',
        'Задача "Сравнить офферы" требует внимания — дедлайн сегодня.',
        'PENDING', NULL, '2026-05-03 08:00:00+00')

ON CONFLICT (id) DO NOTHING;