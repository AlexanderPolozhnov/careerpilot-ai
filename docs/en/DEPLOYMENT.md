# Deployment Guide

## Prerequisites

- Docker 24+
- Docker Compose v2

## Quick Start

1. Copy the environment variables template:
```bash
cp .env.docker.example .env
```

2. Fill in the secrets in `.env`:
- `DB_PASSWORD` — PostgreSQL database password
- `JWT_SECRET` — Secret key for JWT tokens (at least 32 characters, base64 encoded)
- `MAIL_USERNAME` and `MAIL_PASSWORD` — SMTP credentials (we highly recommend Mailtrap for testing purposes)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — for OAuth2 via GitHub (optional)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — for OAuth2 via Google (optional)
- `TELEGRAM_BOT_TOKEN` — Telegram Bot Token for notification alerts and WebApp / MiniApp authentication (optional)
- `TELEGRAM_BOT_USERNAME` — Telegram Bot Username (optional)

3. Start the entire container stack:
```bash
docker compose up -d --build
```

4. The application will be accessible at:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html

## AI (Ollama & OpenAI)

Starting from version `v0.8.0-alpha`, AI provider settings are managed dynamically directly through the web application's user interface (**Settings -> AI Assistant Settings**).

### Fallback Mode and Default Values

- **Fallback Indication:** If the configured AI provider is unavailable, the system automatically falls back to generating mock responses. In the UI, a "Fallback Mode" badge is shown to indicate that mock data is currently in use.
- **Default Settings:** For new users, system automatically initializes default Ollama URL (`http://localhost:11434`) and Model (`llama3`).
- **Empty Field Handling:** If a user leaves Ollama URL/Model settings blank, the system automatically uses these standard fallback defaults.

### Operation Modes

1.  **Local (Ollama):** Uses a locally running LLM.
    *   If Ollama is running natively on your host machine: in the UI, specify the URL as `http://host.docker.internal:11434`.
    *   If Ollama is running via Docker Compose: in the UI, specify the URL as `http://careerpilot-ollama:11434`.
2.  **Cloud (OpenAI):** Uses the system-wide API key specified in `.env` (via the `OPENAI_API_KEY` variable).
3.  **Bring Your Own Key:** Allows individual users to enter their personal OpenAI API key directly within their settings UI.

### Launching Ollama via Docker Compose

1. Run the service using the `ai` compose profile:
```bash
docker compose --profile ai up -d ollama
```

2. Pull the desired model (e.g., `llama3`):
```bash
docker exec careerpilot-ollama ollama pull llama3
```

3. In the application settings UI, select "Local" mode and make sure the URL is pointed to `http://careerpilot-ollama:11434`.

## OAuth2 Setup

To enable social logins via OAuth2, you must register a redirect URI on the provider's developer console:

**GitHub:**
- Redirect URI: `http://localhost/login/oauth2/code/github`
- Setup: Settings → Developer settings → OAuth Apps → New OAuth App

**Google:**
- Redirect URI: `http://localhost/login/oauth2/code/google`
- Setup: Google Cloud Console → Credentials → OAuth 2.0 Client ID

## Environment Variables

| Variable | Description | Default Value |
|-----------|----------|----------------------|
| `DB_NAME` | PostgreSQL database name | `careerpilot_ai` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | (must be filled) |
| `JWT_SECRET` | Secret key for JWT tokens | (must be filled) |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | Access token lifetime (ms) | `3600000` (1 hour) |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | Refresh token lifetime (ms) | `604800000` (7 days) |
| `MAIL_HOST` | SMTP Host | `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | SMTP Port | `2525` |
| `MAIL_USERNAME` | SMTP login/username | (optional) |
| `MAIL_PASSWORD` | SMTP password | (optional) |
| `FRONTEND_URL` | Frontend URL for CORS mapping | `http://localhost` |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 Client ID | `placeholder` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 Client Secret | `placeholder` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | `placeholder` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | `placeholder` |
| `ENCRYPTION_MASTER_KEY` | AES Master Key for API key storage | (16, 24, or 32 characters) |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API Token | (optional) |
| `TELEGRAM_BOT_USERNAME` | Telegram Bot Username | (optional) |

## Stopping the Containers

Stop all services while keeping data intact:
```bash
docker compose down
```

Stop and completely destroy all containers, networks, and data volumes (warning: database data will be lost):
```bash
docker compose down -v
```

## Service Profiles

Additional optional services can be run using Docker Compose profiles:

- **Storage** (MinIO):
```bash
docker compose --profile storage up -d
```

- **AI** (Ollama):
```bash
docker compose --profile ai up -d
```

## Healthchecks

The backend container includes a health check running with a 90-second startup grace period to allow Flyway database migrations to execute successfully. The service is considered healthy as soon as it responds to HTTP requests at `/swagger-ui/index.html`.

## Troubleshooting

**Backend won't start:**
- Check logs: `docker compose logs backend`
- Check PostgreSQL and Redis status: `docker compose ps`
- Verify environment variables in `.env`

**Frontend displays 502 Bad Gateway:**
- Ensure the backend container is running and healthy
- Check nginx logs inside the frontend container

**OAuth2 doesn't work:**
- Make sure redirect URIs are registered correctly with your provider
- Double check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (or Google equivalents) are correctly set
