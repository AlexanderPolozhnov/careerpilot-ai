# Task: Full-Stack Docker Compose Setup

## Контекст и цель

Добавить production-like Docker Compose конфигурацию, которая запускает весь стек (PostgreSQL, Redis, Backend, Frontend) одной командой `docker compose up --build`. Текущий `docker-compose.yml` поднимает только инфраструктуру (postgres, redis). Backend и frontend запускаются вручную. Цель — устранить этот пробел, добавить Dockerfile для каждого сервиса и расширить compose-файл.

---

## Затрагиваемые файлы

### Создать новые

- `backend/Dockerfile` — multi-stage build: Maven compile + JRE 21 runtime
- `frontend/Dockerfile` — multi-stage build: pnpm/Node 20 build + nginx serve
- `frontend/nginx.conf` — nginx config: SPA fallback routing + reverse proxy `/api/` → backend
- `.env.docker.example` — пример всех переменных окружения для full-stack Docker запуска
- `docs/DEPLOYMENT.md` — инструкция по запуску и деплою

### Изменить существующие

- `docker-compose.yml` — добавить services `backend` и `frontend`
- `backend/src/main/resources/application.yaml` — параметризовать хост БД через `DB_HOST`
- `backend/.env.example` — добавить `DB_HOST=localhost`
- `backend/docker/README.md` — обновить статус с "Planned" на "Done"
- `ROADMAP.md` — отметить Full-stack Docker Compose как `[x]`

---

## Backend: точная реализация

### backend/Dockerfile

Два stage.

**Stage 1 — builder** (`eclipse-temurin:21-jdk-alpine` AS `builder`):
```
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src/ src/
RUN ./mvnw package -DskipTests -B
```

**Stage 2 — runtime** (`eclipse-temurin:21-jre-alpine`):
```
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

> Слой `dependency:go-offline` кэшируется отдельно — повторные сборки быстры, пока `pom.xml` не меняется.

### application.yaml — единственное изменение

Строка 8 в `application.yaml`:

```yaml
# Было:
url: jdbc:postgresql://localhost:5432/${DB_NAME}?currentSchema=careerpilot

# Стало:
url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME}?currentSchema=careerpilot
```

`DB_HOST` по умолчанию `localhost` — локальный dev не ломается. В Docker-compose передаётся `DB_HOST=postgres`.

### backend/.env.example — добавить строку

```env
DB_HOST=localhost
```

### docker-compose.yml — service backend

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: careerpilot-backend
  restart: unless-stopped
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  environment:
    DB_HOST: postgres
    DB_NAME: ${DB_NAME:-careerpilot_ai}
    DB_USER: ${DB_USER:-postgres}
    DB_PASSWORD: ${DB_PASSWORD:-postgres}
    REDIS_HOST: redis
    REDIS_PORT: 6379
    JWT_SECRET: ${JWT_SECRET}
    JWT_ACCESS_TOKEN_EXPIRATION_MS: ${JWT_ACCESS_TOKEN_EXPIRATION_MS:-3600000}
    JWT_REFRESH_TOKEN_EXPIRATION_MS: ${JWT_REFRESH_TOKEN_EXPIRATION_MS:-604800000}
    MAIL_HOST: ${MAIL_HOST:-sandbox.smtp.mailtrap.io}
    MAIL_PORT: ${MAIL_PORT:-2525}
    MAIL_USERNAME: ${MAIL_USERNAME:-}
    MAIL_PASSWORD: ${MAIL_PASSWORD:-}
    FRONTEND_URL: ${FRONTEND_URL:-http://localhost}
    GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:-placeholder}
    GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:-placeholder}
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-placeholder}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-placeholder}
    SPRING_PROFILES_ACTIVE: docker
  ports:
    - "8080:8080"
  healthcheck:
    test: ["CMD-SHELL", "wget -qO- http://localhost:8080/swagger-ui/index.html > /dev/null 2>&1 && exit 0 || exit 1"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 90s
```

> `start_period: 90s` нужен для прохождения Flyway-миграций при первом запуске.

---

## Frontend: точная реализация

### frontend/nginx.conf

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass         http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Nginx проксирует `/api/*` → `http://backend:8080/api/*` по внутренней Docker-сети. Фронтенд работает на порту 80, и у него нет необходимости знать внешний адрес backend.

### frontend/Dockerfile

Два stage.

**Stage 1 — builder** (`node:20-alpine` AS `builder`):
```
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
ARG VITE_API_BASE_URL=/api
ARG VITE_USE_MOCKS=false
COPY . .
RUN pnpm run build
```

**Stage 2 — runtime** (`nginx:alpine`):
```
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

> `VITE_API_BASE_URL=/api` — относительный путь, работает за nginx-прокси без знания внешнего порта backend.

### docker-compose.yml — service frontend

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
    args:
      VITE_API_BASE_URL: /api
      VITE_USE_MOCKS: "false"
  container_name: careerpilot-frontend
  restart: unless-stopped
  depends_on:
    - backend
  ports:
    - "80:80"
```

---

## .env.docker.example — содержимое

```env
# Database
DB_NAME=careerpilot_ai
DB_USER=postgres
DB_PASSWORD=change_me_strong_password

# JWT
JWT_SECRET=change_me_to_a_strong_base64_secret_min_32_chars

# Mail (SMTP) — используй Mailtrap для тестирования
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password

# App
FRONTEND_URL=http://localhost

# OAuth2 — зарегистрировать redirect URI на стороне провайдера
# GitHub: http://localhost/login/oauth2/code/github
# Google:  http://localhost/login/oauth2/code/google
GITHUB_CLIENT_ID=placeholder
GITHUB_CLIENT_SECRET=placeholder
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
```

---

## docs/DEPLOYMENT.md — структура документа

Разделы:

1. **Требования** — Docker 24+, Docker Compose v2
2. **Быстрый старт**
   - `cp .env.docker.example .env` и заполнить секреты
   - `docker compose up -d --build`
   - Приложение: `http://localhost`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`
3. **AI (Ollama)** — `docker compose --profile ai up -d ollama`, затем pull нужной модели
4. **OAuth2** — настройка redirect URI на GitHub/Google
5. **Переменные окружения** — таблица всех переменных с описанием
6. **Остановка** — `docker compose down`, `docker compose down -v` (с удалением данных)

---

## Порядок реализации для SWE-1.6

1. Изменить `backend/src/main/resources/application.yaml` — добавить `${DB_HOST:localhost}` (1 строка).
2. Добавить `DB_HOST=localhost` в `backend/.env.example`.
3. Создать `backend/Dockerfile` (multi-stage Maven + JRE).
4. Создать `frontend/nginx.conf`.
5. Создать `frontend/Dockerfile` (multi-stage pnpm + nginx).
6. Обновить `docker-compose.yml` — добавить services `backend` и `frontend` в конец файла (перед `volumes:`).
7. Создать `.env.docker.example` в корне репозитория.
8. Создать `docs/DEPLOYMENT.md`.
9. Обновить `backend/docker/README.md` — заменить секцию Planned на Done.
10. Обновить `ROADMAP.md` — `[ ] Full-stack Docker Compose setup` → `[x]`.

---

## Риски и что проверить

- **pnpm версия**: CI использует `pnpm@9`. Dockerfile должен использовать ту же версию через `corepack prepare pnpm@9 --activate`. Несовпадение версий сломает `--frozen-lockfile`.
- **VITE_API_BASE_URL — build-time переменная**: значение бакается в JS-бандл. После сборки изменить без пересборки невозможно. При nginx-проксировании значение `/api` корректно и универсально.
- **OAuth2 redirect URI**: GitHub и Google требуют явной регистрации redirect URL. В Docker это `http://localhost/login/oauth2/code/github`. Без этого OAuth2-вход не работает. Задокументировать в `DEPLOYMENT.md`.
- **Flyway при первом запуске**: применяет миграции V1–V22+, что занимает 20–60 секунд. `start_period: 90s` в healthcheck обязателен, иначе compose считает сервис нездоровым и может его перезапустить.
- **Actuator не добавляется**: healthcheck использует `wget` к `/swagger-ui/index.html`. Если `springdoc` dependency убрать в будущем — healthcheck сломается. Альтернатива: добавить `spring-boot-starter-actuator` в `pom.xml` и использовать `/actuator/health` (рекомендуется).
- **CORS**: при nginx-проксировании frontend и backend работают на одном домене (`localhost:80`). CORS-конфигурация Spring Security (`app.frontend-url`) должна совпадать с `FRONTEND_URL=http://localhost`. Иначе OPTIONS preflight будет отклонён.
- **backend/.mvn/wrapper/maven-wrapper.jar**: Docker-build копирует `.mvn/`. Убедиться, что wrapper-jar есть в репозитории или используется `mvnw` с флагом `-Dmaven.wrapper.launchTipo`.

---

## Проверки после реализации

**Build:**
```bash
docker compose build
```

**Run:**
```bash
docker compose up -d
```

**Smoke checks:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost/          # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/auth/me  # 401 (not 502/504)
curl -s http://localhost:8080/swagger-ui/index.html | grep -q "Swagger"  # OK
```

**Backend unit tests (не зависят от Docker):**
```powershell
.\mvnw.cmd test -Dtest="!CareerpilotAiApplicationTests"
```
