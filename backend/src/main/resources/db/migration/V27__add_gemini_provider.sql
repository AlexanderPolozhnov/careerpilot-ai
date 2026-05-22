ALTER TABLE careerpilot.user_preferences
ADD COLUMN custom_ai_provider VARCHAR(50) DEFAULT 'OPENAI',
ADD COLUMN gemini_api_key VARCHAR(255),
ADD COLUMN gemini_model VARCHAR(50) DEFAULT 'gemini-1.5-flash';
