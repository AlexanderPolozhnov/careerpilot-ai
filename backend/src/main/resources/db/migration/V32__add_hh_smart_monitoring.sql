-- Удаляем старую таблицу для OAuth токенов, если она была создана в V31
DROP TABLE IF EXISTS careerpilot.hh_integrations;

-- Таблица для сохраненного резюме и шаблона письма
CREATE TABLE careerpilot.user_resumes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    raw_text TEXT NULL,
    cover_letter_template TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Таблица для фильтров мониторинга (job alerts)
CREATE TABLE careerpilot.user_vacancy_filters (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES careerpilot.users(id) ON DELETE CASCADE,
    search_query VARCHAR(256) NOT NULL,
    target_salary INT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_polled_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
