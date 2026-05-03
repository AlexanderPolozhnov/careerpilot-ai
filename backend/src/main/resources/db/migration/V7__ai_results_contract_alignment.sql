-- V7__ai_results_contract_alignment.sql
-- Adds contract-required columns to ai_results: prompt, result, vacancy_id, tokens_used

SET search_path TO careerpilot;

ALTER TABLE ai_results
    ADD COLUMN IF NOT EXISTS prompt      TEXT,
    ADD COLUMN IF NOT EXISTS result      TEXT,
    ADD COLUMN IF NOT EXISTS vacancy_id  UUID,
    ADD COLUMN IF NOT EXISTS tokens_used INTEGER;
