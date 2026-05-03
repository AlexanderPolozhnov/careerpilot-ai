-- Добавляем resume_id в таблицу applications (тип VARCHAR для совместимости с frontend)
ALTER TABLE careerpilot.applications
    ADD COLUMN IF NOT EXISTS resume_id VARCHAR(255);
