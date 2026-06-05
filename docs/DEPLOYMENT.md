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
- `TELEGRAM_BOT_TOKEN` — токен Telegram бота для уведомлений и аутентификации через WebApp / MiniApp (опционально)
- `TELEGRAM_BOT_USERNAME` — имя пользователя Telegram бота (опционально)

3. Запустите весь стек:
```bash
docker compose up -d --build
```

4. Приложение будет доступно по адресу:
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html

## AI (Ollama & OpenAI)

Начиная с версии `v0.8.0-alpha`, настройки провайдеров ИИ управляются динамически через интерфейс приложения (**Settings -> AI Assistant Settings**).

### Fallback Mode и Дефолтные Значения

- **Fallback Indication:** При недоступности AI-провайдера система автоматически переключается на mock-данные. В интерфейсе отображается бейдж "Fallback Mode" для индикации использования заглушек.
- **Default Settings:** Для новых пользователей автоматически инициализируются дефолтные значения Ollama URL (`http://localhost:11434`) и Model (`llama3`).
- **Empty Field Handling:** Если пользователь оставил поля Ollama URL/Model пустыми, система использует дефолтные значения.

### Режимы работы

1.  **Local (Ollama):** Использует локально запущенную LLM.
    *   Если Ollama запущен нативно на хосте: в UI укажите URL `http://host.docker.internal:11434`.
    *   Если Ollama запущен через Docker Compose: в UI укажите URL `http://careerpilot-ollama:11434`.
2.  **Cloud (OpenAI):** Использует системный API-ключ, указанный в `.env` (переменная `OPENAI_API_KEY`).
3.  **Bring Your Own Key:** Позволяет пользователю ввести свой собственный ключ OpenAI прямо в UI.

### Запуск Ollama через Docker Compose

1. Запустите сервис:
```bash
docker compose --profile ai up -d ollama
```

2. Загрузите модель:
```bash
docker exec careerpilot-ollama ollama pull llama3
```

3. В настройках приложения (UI) выберите режим "Local" и убедитесь, что URL указан как `http://careerpilot-ollama:11434`.

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
| `ENCRYPTION_MASTER_KEY` | Мастер-ключ для шифрования (AES) | (16, 24 или 32 символа) |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота для уведомлений | (опционально) |
| `TELEGRAM_BOT_USERNAME` | Имя пользователя Telegram бота | (опционально) |

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

## Интеграция с Cloudflare

В production-окружении трафик к приложению должен проксироваться через **Cloudflare** для защиты от DDoS, управления SSL-сертификатами и оптимизации производительности (WAF).

### Настройка Cloudflare
1. **Режим SSL/TLS:** В панели Cloudflare (раздел **SSL/TLS -> Overview**) установите режим **Full** или **Full (strict)**, так как Google Cloud Run ожидает зашифрованный HTTPS-трафик.
2. **Отключение кэширования для API:** В разделе **Rules -> Cache Rules** (или Page Rules) создайте правило для обхода кэширования динамических запросов:
   - Если URL совпадает с `careerpilot-ai.ru/api/*`
   - Действие (Cache Eligibility) -> **Bypass** (Обходить кэш).

### Определение реального IP пользователя
При проксировании трафика через Cloudflare стандартный метод `HttpServletRequest.getRemoteAddr()` на бэкенде возвращает IP-адрес серверов Cloudflare. 
Бэкенд CareerPilot AI автоматически извлекает оригинальный IP-адрес пользователя из HTTP-заголовка `CF-Connecting-IP` (это реализовано в аспектах логирования `AuditAspect` и защиты от спама `RateLimiterAspect`). Дополнительных настроек окружения не требуется.

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
