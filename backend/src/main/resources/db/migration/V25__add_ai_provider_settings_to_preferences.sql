ALTER TABLE careerpilot.user_preferences 
ADD COLUMN open_ai_api_key VARCHAR(255),
ADD COLUMN open_ai_model VARCHAR(50) DEFAULT 'gpt-4o',
ADD COLUMN ollama_url VARCHAR(255) DEFAULT 'http://localhost:11434',
ADD COLUMN ollama_model VARCHAR(50) DEFAULT 'llama3';
