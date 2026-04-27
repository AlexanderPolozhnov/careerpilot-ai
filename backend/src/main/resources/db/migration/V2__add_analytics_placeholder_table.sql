-- V2__add_analytics_placeholder_table.sql
-- Add placeholder table required by AnalyticsEntity.

SET search_path TO careerpilot;

CREATE TABLE IF NOT EXISTS analytics_placeholder (
    id UUID PRIMARY KEY
);
