# Deployment Guide

## Требования

- Docker 24+
- Docker Compose v2

## Быстрый старт

1. Скопируйте файл окружения:
```bash
cp .env.docker.example .env
```

2. Заполните секреты в `.env`:
- `DB_PASSWORD` — пароль PostgreSQL
- `JWT_SECRET` — секрет для JWT токенов (минимум 32 символа, base64)
- `MAIL_USERNAME` и `MAIL_PASSWORD` — учетные данные SMTP (рекомендуется Mailtrap для тестирования)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — для OAuth2 через GitHub (опционально)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — для OAuth2 через Google (опционально)

3. Запустите весь стек:
```bash
docker compose up -d --build
```

4. Приложение будет доступно по адресу:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html

## AI (Ollama)

Для локального AI через Ollama:

1. Запустите Ollama сервис:
```bash
docker compose --profile ai up -d ollama
```

2. Загрузите модель (например, llama3):
```bash
docker exec careerpilot-ollama ollama pull llama3
```

3. В настройках приложения выберите режим AI: "Local".

## OAuth2

Для работы входа через OAuth2 нужно зарегистрировать redirect URI на стороне провайдера:

**GitHub:**
- Redirect URI: `http://localhost/login/oauth2/code/github`
- Настройки: Settings → Developer settings → OAuth Apps → New OAuth App

**Google:**
- Redirect URI: `http://localhost/login/oauth2/code/google`
- Настройки: Google Cloud Console → Credentials → OAuth 2.0 Client ID

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|-----------|----------|----------------------|
| `DB_NAME` | Имя базы данных PostgreSQL | `careerpilot_ai` |
| `DB_USER` | Пользователь PostgreSQL | `postgres` |
| `DB_PASSWORD` | Пароль PostgreSQL | (обязательно заполнить) |
| `JWT_SECRET` | Секрет для JWT токенов | (обязательно заполнить) |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | Время жизни access токена (мс) | `3600000` (1 час) |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | Время жизни refresh токена (мс) | `604800000` (7 дней) |
| `MAIL_HOST` | SMTP хост | `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | SMTP порт | `2525` |
| `MAIL_USERNAME` | SMTP логин | (опционально) |
| `MAIL_PASSWORD` | SMTP пароль | (опционально) |
| `FRONTEND_URL` | URL фронтенда для CORS | `http://localhost` |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 Client ID | `placeholder` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 Client Secret | `placeholder` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | `placeholder` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | `placeholder` |

## Остановка

Остановка всех сервисов с сохранением данных:
```bash
docker compose down
```

Полная остановка с удалением данных (включая базу данных):
```bash
docker compose down -v
```

## Профили

Дополнительные сервисы запускаются через профили:

- **Storage** (MinIO):
```bash
docker compose --profile storage up -d
```

- **AI** (Ollama):
```bash
docker compose --profile ai up -d
```

## Healthchecks

Backend имеет healthcheck с периодом 90 секунд для прохождения Flyway миграций при первом запуске. Приложение считается здоровым, когда отвечает на `/swagger-ui/index.html`.

## Troubleshooting

**Backend не запускается:**
- Проверьте логи: `docker compose logs backend`
- Убедитесь, что PostgreSQL и Redis запущены и здоровы: `docker compose ps`
- Проверьте переменные окружения в `.env`

**Frontend показывает 502:**
- Убедитесь, что backend запущен и здоров
- Проверьте логи nginx в контейнере frontend

**OAuth2 не работает:**
- Убедитесь, что redirect URI зарегистрирован правильно
- Проверьте, что `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET` заполнены
