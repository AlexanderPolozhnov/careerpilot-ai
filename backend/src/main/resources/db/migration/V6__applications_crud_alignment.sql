-- Добавляем поле resume_id в таблицу applications
ALTER TABLE careerpilot.applications
    ADD COLUMN IF NOT EXISTS resume_id VARCHAR(255);

-- Обновляем CHECK constraint для статусов: добавляем FINAL_ROUND как алиас FINAL
-- Существующие значения FINAL и ARCHIVED остаются для обратной совместимости с board
ALTER TABLE careerpilot.applications
    DROP CONSTRAINT IF EXISTS chk_applications_status;

ALTER TABLE careerpilot.applications
    ADD CONSTRAINT chk_applications_status
        CHECK (status IN
               ('NEW', 'SAVED', 'APPLIED', 'HR_SCREEN', 'TECH_INTERVIEW', 'FINAL', 'OFFER', 'REJECTED', 'ARCHIVED'));
