-- V1__init.sql
-- Schema: careerpilot
-- Database: careerpilot_ai

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS careerpilot;

SET search_path TO careerpilot;

CREATE TABLE users (
                       id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email           VARCHAR(255) NOT NULL UNIQUE,
                       password_hash   VARCHAR(255) NOT NULL,
                       full_name       VARCHAR(255) NOT NULL,
                       role            VARCHAR(50)  NOT NULL DEFAULT 'USER',
                       status          VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
                       created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
                       updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

                       CONSTRAINT chk_users_role
                           CHECK (role IN ('USER', 'ADMIN')),

                       CONSTRAINT chk_users_status
                           CHECK (status IN ('ACTIVE', 'BLOCKED', 'DELETED'))
);

CREATE INDEX idx_users_email ON users (email);


CREATE TABLE user_profiles (
                               id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id             UUID NOT NULL UNIQUE,
                               desired_position    VARCHAR(255),
                               experience_level    VARCHAR(50),
                               city                VARCHAR(120),
                               remote_preference   VARCHAR(50),
                               salary_expectation  INTEGER,
                               summary             TEXT,
                               created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
                               updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

                               CONSTRAINT fk_user_profiles_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES users (id)
                                       ON DELETE CASCADE,

                               CONSTRAINT chk_user_profiles_experience_level
                                   CHECK (experience_level IS NULL OR experience_level IN ('INTERN', 'JUNIOR', 'JUNIOR_PLUS', 'MIDDLE', 'SENIOR')),

                               CONSTRAINT chk_user_profiles_remote_preference
                                   CHECK (remote_preference IS NULL OR remote_preference IN ('REMOTE', 'HYBRID', 'OFFICE', 'FLEXIBLE'))
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);


CREATE TABLE resumes (
                         id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id         UUID NOT NULL,
                         title           VARCHAR(255) NOT NULL,
                         file_url        TEXT,
                         text_content    TEXT,
                         is_active       BOOLEAN NOT NULL DEFAULT FALSE,
                         created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                         updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                         CONSTRAINT fk_resumes_user
                             FOREIGN KEY (user_id)
                                 REFERENCES users (id)
                                 ON DELETE CASCADE
);

CREATE INDEX idx_resumes_user_id ON resumes (user_id);
CREATE INDEX idx_resumes_active ON resumes (user_id, is_active);


CREATE TABLE companies (
                           id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           user_id         UUID NOT NULL,
                           name            VARCHAR(255) NOT NULL,
                           website         TEXT,
                           description     TEXT,
                           industry        VARCHAR(255),
                           created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                           updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                           CONSTRAINT fk_companies_user
                               FOREIGN KEY (user_id)
                                   REFERENCES users (id)
                                   ON DELETE CASCADE,

                           CONSTRAINT uq_companies_user_name
                               UNIQUE (user_id, name)
);

CREATE INDEX idx_companies_user_id ON companies (user_id);
CREATE INDEX idx_companies_name ON companies (name);


CREATE TABLE vacancies (
                           id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           user_id             UUID NOT NULL,
                           company_id          UUID,
                           title               VARCHAR(255) NOT NULL,
                           source              VARCHAR(100),
                           source_url          TEXT,
                           location            VARCHAR(255),
                           employment_type     VARCHAR(50),
                           salary_from         INTEGER,
                           salary_to           INTEGER,
                           currency            VARCHAR(10),
                           description_raw     TEXT,
                           description_clean   TEXT,
                           status              VARCHAR(50) NOT NULL DEFAULT 'NEW',
                           created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
                           updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

                           CONSTRAINT fk_vacancies_user
                               FOREIGN KEY (user_id)
                                   REFERENCES users (id)
                                   ON DELETE CASCADE,

                           CONSTRAINT fk_vacancies_company
                               FOREIGN KEY (company_id)
                                   REFERENCES companies (id)
                                   ON DELETE SET NULL,

                           CONSTRAINT chk_vacancies_status
                               CHECK (status IN ('NEW', 'SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'ARCHIVED')),

                           CONSTRAINT chk_vacancies_employment_type
                               CHECK (employment_type IS NULL OR employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE'))
);

CREATE INDEX idx_vacancies_user_id ON vacancies (user_id);
CREATE INDEX idx_vacancies_company_id ON vacancies (company_id);
CREATE INDEX idx_vacancies_status ON vacancies (status);


CREATE TABLE vacancy_tags (
                              id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              vacancy_id      UUID NOT NULL,
                              tag             VARCHAR(100) NOT NULL,
                              created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                              CONSTRAINT fk_vacancy_tags_vacancy
                                  FOREIGN KEY (vacancy_id)
                                      REFERENCES vacancies (id)
                                      ON DELETE CASCADE,

                              CONSTRAINT uq_vacancy_tags_vacancy_tag
                                  UNIQUE (vacancy_id, tag)
);

CREATE INDEX idx_vacancy_tags_vacancy_id ON vacancy_tags (vacancy_id);
CREATE INDEX idx_vacancy_tags_tag ON vacancy_tags (tag);


CREATE TABLE applications (
                              id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              user_id             UUID NOT NULL,
                              vacancy_id          UUID NOT NULL,
                              status              VARCHAR(50) NOT NULL DEFAULT 'NEW',
                              applied_at          TIMESTAMPTZ,
                              next_follow_up_at   TIMESTAMPTZ,
                              last_contact_at     TIMESTAMPTZ,
                              notes               TEXT,
                              created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
                              updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

                              CONSTRAINT fk_applications_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES users (id)
                                      ON DELETE CASCADE,

                              CONSTRAINT fk_applications_vacancy
                                  FOREIGN KEY (vacancy_id)
                                      REFERENCES vacancies (id)
                                      ON DELETE CASCADE,

                              CONSTRAINT chk_applications_status
                                  CHECK (status IN ('NEW', 'SAVED', 'APPLIED', 'HR_SCREEN', 'TECH_INTERVIEW', 'FINAL', 'OFFER', 'REJECTED', 'ARCHIVED')),

                              CONSTRAINT uq_applications_user_vacancy
                                  UNIQUE (user_id, vacancy_id)
);

CREATE INDEX idx_applications_user_id ON applications (user_id);
CREATE INDEX idx_applications_vacancy_id ON applications (vacancy_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_next_follow_up_at ON applications (next_follow_up_at);


CREATE TABLE interviews (
                            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            application_id  UUID NOT NULL,
                            type            VARCHAR(50) NOT NULL,
                            scheduled_at    TIMESTAMPTZ NOT NULL,
                            timezone        VARCHAR(100),
                            meeting_link    TEXT,
                            result          VARCHAR(50),
                            notes           TEXT,
                            created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                            updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                            CONSTRAINT fk_interviews_application
                                FOREIGN KEY (application_id)
                                    REFERENCES applications (id)
                                    ON DELETE CASCADE,

                            CONSTRAINT chk_interviews_type
                                CHECK (type IN ('HR_SCREEN', 'TECH_SCREEN', 'TECH_INTERVIEW', 'FINAL', 'OTHER')),

                            CONSTRAINT chk_interviews_result
                                CHECK (result IS NULL OR result IN ('PENDING', 'PASSED', 'FAILED', 'CANCELLED'))
);

CREATE INDEX idx_interviews_application_id ON interviews (application_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews (scheduled_at);


CREATE TABLE tasks (
                       id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       user_id         UUID NOT NULL,
                       application_id  UUID,
                       title           VARCHAR(255) NOT NULL,
                       description     TEXT,
                       due_at          TIMESTAMPTZ,
                       done            BOOLEAN NOT NULL DEFAULT FALSE,
                       priority        VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
                       created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                       CONSTRAINT fk_tasks_user
                           FOREIGN KEY (user_id)
                               REFERENCES users (id)
                               ON DELETE CASCADE,

                       CONSTRAINT fk_tasks_application
                           FOREIGN KEY (application_id)
                               REFERENCES applications (id)
                               ON DELETE SET NULL,

                       CONSTRAINT chk_tasks_priority
                           CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'))
);

CREATE INDEX idx_tasks_user_id ON tasks (user_id);
CREATE INDEX idx_tasks_application_id ON tasks (application_id);
CREATE INDEX idx_tasks_due_at ON tasks (due_at);
CREATE INDEX idx_tasks_done ON tasks (done);


CREATE TABLE ai_results (
                            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            user_id         UUID NOT NULL,
                            type            VARCHAR(100) NOT NULL,
                            input_hash      VARCHAR(128) NOT NULL,
                            input_payload   TEXT NOT NULL,
                            output_payload  TEXT NOT NULL,
                            created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                            expires_at      TIMESTAMPTZ,

                            CONSTRAINT fk_ai_results_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users (id)
                                    ON DELETE CASCADE
);

CREATE INDEX idx_ai_results_user_id ON ai_results (user_id);
CREATE INDEX idx_ai_results_type ON ai_results (type);
CREATE INDEX idx_ai_results_input_hash ON ai_results (input_hash);
CREATE INDEX idx_ai_results_created_at ON ai_results (created_at);


CREATE TABLE notifications (
                               id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id         UUID NOT NULL,
                               channel         VARCHAR(50) NOT NULL,
                               title           VARCHAR(255) NOT NULL,
                               message         TEXT NOT NULL,
                               status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                               sent_at         TIMESTAMPTZ,
                               created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                               CONSTRAINT fk_notifications_user
                                   FOREIGN KEY (user_id)
                                       REFERENCES users (id)
                                       ON DELETE CASCADE,

                               CONSTRAINT chk_notifications_channel
                                   CHECK (channel IN ('IN_APP', 'TELEGRAM', 'EMAIL')),

                               CONSTRAINT chk_notifications_status
                                   CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'READ'))
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_status ON notifications (status);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);


CREATE TABLE audit_logs (
                            id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            user_id         UUID,
                            action          VARCHAR(100) NOT NULL,
                            entity_type     VARCHAR(100) NOT NULL,
                            entity_id       UUID,
                            metadata        JSONB,
                            created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

                            CONSTRAINT fk_audit_logs_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users (id)
                                    ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs (entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs (entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);