# Гайд: CD Pipeline + Деплой на Google Cloud Run

Пошаговое руководство по настройке CD-пайплайна и деплою full-stack приложения (Java Spring Boot + React) на Google Cloud Run.

**Пример проекта:** CareerPilot AI — `https://careerpilot-ai.ru`

---

## Архитектура

```
GitHub push → GitHub Actions CI/CD
  → Docker build (backend + frontend)
  → push в Google Artifact Registry
  → gcloud run deploy (два сервиса Cloud Run)
       ├── careerpilot-backend (Spring Boot, port 8080)
       └── careerpilot-frontend (nginx, port 80)
                  ↕ Cloud SQL PostgreSQL (Cloud SQL Auth Proxy)
```

---

## Шаг 1: Подготовка GCP проекта

### 1.1 Создать или выбрать проект
```bash
gcloud config set project YOUR_PROJECT_ID
```

### 1.2 Включить необходимые API
```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  serviceusage.googleapis.com \
  compute.googleapis.com
```

### 1.3 Создать Cloud SQL PostgreSQL инстанс
```bash
gcloud sql instances create careerpilot-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=europe-west3

# Создать базу данных
gcloud sql databases create careerpilot_ai --instance=careerpilot-db

# Создать пользователя
gcloud sql users create YOUR_DB_USER \
  --instance=careerpilot-db \
  --password=YOUR_DB_PASSWORD
```

> ⚠️ **Важно:** запомни точный регион Cloud SQL (`europe-west3`). Он пойдёт в JDBC URL, независимо от региона Cloud Run.

### 1.4 Создать Artifact Registry репозиторий
```bash
gcloud artifacts repositories create careerpilot-docker-repo \
  --repository-format=docker \
  --location=europe-west1 \
  --description="Docker images for CareerPilot AI"
```

---

## Шаг 2: Настройка Service Account для GitHub Actions

```bash
# Создать аккаунт
gcloud iam service-accounts create github-cd-sa \
  --display-name="GitHub CD Service Account"

# Назначить роли
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-cd-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-cd-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.developer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-cd-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Роль Cloud SQL Client для backend Cloud Run
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Сгенерировать JSON ключ
gcloud iam service-accounts keys create sa-key.json \
  --iam-account=github-cd-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

---

## Шаг 3: GitHub Secrets

В `Settings → Secrets and variables → Actions` добавить:

| Secret | Пример значения | Примечание |
|---|---|---|
| `GCP_PROJECT_ID` | `careerpilot-ai` | ID проекта GCP |
| `GCP_SA_KEY` | `{ "type": "service_account", ... }` | Содержимое `sa-key.json` |
| `GCP_REGION` | `europe-west1` | Регион Cloud Run |
| `DATABASE_USERNAME` | `postgres` | Пользователь Cloud SQL |
| `DATABASE_PASSWORD` | `...` | Пароль Cloud SQL |
| `REDIS_HOST` | `127.0.0.1` | Не используется без VPC Connector |
| `ENCRYPTION_MASTER_KEY` | 32 символа | AES-256 мастер-ключ |
| `JWT_SECRET` | Base64 строка | Секрет JWT |
| `GH_CLIENT_ID` | `Ov23li...` | GitHub OAuth App Client ID |
| `GH_CLIENT_SECRET` | `...` | GitHub OAuth App Client Secret |
| `GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google OAuth Client Secret |
| `TELEGRAM_BOT_TOKEN` | `123456:ABC...` | Telegram Bot Token |
| `MAIL_USERNAME` | `user@mailtrap.io` | SMTP username |
| `MAIL_PASSWORD` | `...` | SMTP password |

> ⚠️ **Никогда не используй `GITHUB_*` как имя секрета** — этот префикс зарезервирован GitHub Actions и вызовет ошибку "Secret name is invalid".

---

## Шаг 4: Dockerfile требования

### Backend Dockerfile
```dockerfile
# ОБЯЗАТЕЛЬНО: chmod +x mvnw перед первым вызовом
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
```

> Windows (NTFS) не сохраняет execute bit при `git commit`. Docker COPY копирует файл с правами `0644`. Без `chmod +x` сборка упадёт с `Permission denied`.

### Frontend nginx.conf
```nginx
server {
    listen 80;

    # ОБЯЗАТЕЛЬНО для Cloud Run: динамический DNS резолвер
    resolver 169.254.169.254 valid=30s;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

> Без `resolver 169.254.169.254` nginx не стартует в Cloud Run при использовании переменных в `proxy_pass`.

---

## Шаг 5: Структура cd.yml

```yaml
name: CD Pipeline (Google Cloud Run)

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # 1. Аутентификация GCP
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Docker Auth
        run: gcloud auth configure-docker ${{ secrets.GCP_REGION }}-docker.pkg.dev --quiet

      # 2. Backend build (контекст — КОРЕНЬ проекта, не backend/)
      - name: Build and Push Backend
        run: |
          IMAGE="${{ secrets.GCP_REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/careerpilot-docker-repo/backend:latest"
          docker build -t $IMAGE -f backend/Dockerfile .
          docker push $IMAGE

      # 3. Backend deploy
      - name: Deploy Backend
        run: |
          gcloud run deploy careerpilot-backend \
            --image=... \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --allow-unauthenticated \
            --add-cloudsql-instances=${{ secrets.GCP_PROJECT_ID }}:CLOUD_SQL_REGION:careerpilot-db \
            --set-env-vars="SPRING_PROFILES_ACTIVE=prod,\
          SERVER_PORT=8080,\
          SPRING_CACHE_TYPE=none,\
          SPRING_DATASOURCE_URL=jdbc:postgresql:///careerpilot_ai?socketFactory=com.google.cloud.sql.postgres.SocketFactory&cloudSqlInstance=${{ secrets.GCP_PROJECT_ID }}:CLOUD_SQL_REGION:careerpilot-db&currentSchema=careerpilot,\
          SPRING_DATASOURCE_USERNAME=${{ secrets.DATABASE_USERNAME }},\
          SPRING_DATASOURCE_PASSWORD=${{ secrets.DATABASE_PASSWORD }},\
          FRONTEND_URL=https://YOUR_DOMAIN,\
          JWT_SECRET=${{ secrets.JWT_SECRET }},\
          ENCRYPTION_MASTER_KEY=${{ secrets.ENCRYPTION_MASTER_KEY }},\
          GITHUB_CLIENT_ID=${{ secrets.GH_CLIENT_ID }},\
          GITHUB_CLIENT_SECRET=${{ secrets.GH_CLIENT_SECRET }},\
          GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }},\
          GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }},\
          GOOGLE_CALENDAR_REDIRECT_URI=https://YOUR_BACKEND_URL/api/integrations/google-calendar/callback,\
          TELEGRAM_BOT_ENABLED=true,\
          TELEGRAM_BOT_TOKEN=${{ secrets.TELEGRAM_BOT_TOKEN }},\
          MAIL_HOST=sandbox.smtp.mailtrap.io,\
          MAIL_PORT=2525,\
          MAIL_USERNAME=${{ secrets.MAIL_USERNAME }},\
          MAIL_PASSWORD=${{ secrets.MAIL_PASSWORD }}"

      # 4. Frontend build (передаём статический URL backend)
      - name: Build and Push Frontend
        run: |
          IMAGE="${{ secrets.GCP_REGION }}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/careerpilot-docker-repo/frontend:latest"
          docker build \
            --build-arg VITE_API_BASE_URL=https://YOUR_BACKEND_URL/api \
            -t $IMAGE \
            -f frontend/Dockerfile \
            frontend/
          docker push $IMAGE

      # 5. Frontend deploy
      - name: Deploy Frontend
        run: |
          gcloud run deploy careerpilot-frontend \
            --image=... \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --allow-unauthenticated \
            --port=80
```

---

## Шаг 6: Настройка CORS на бэкенде

В `SecurityConfig.java` (или `WebMvcConfig`) добавь оба источника:

```java
configuration.setAllowedOrigins(List.of(
    "https://YOUR_FRONTEND_CLOUD_RUN_URL.run.app",  // Cloud Run URL
    "https://YOUR_CUSTOM_DOMAIN.ru",                // кастомный домен
    "http://localhost",                              // локальная разработка
    "http://localhost:5173"
));
```

> Браузер отправляет `Origin` с тем адресом, через который открыт сайт. Если адреса нет в списке — CORS ошибка на все API запросы.

---

## Шаг 7: Spring Boot — настройка для Cloud Run

### application.yaml (prod profile)
```yaml
spring:
  cache:
    type: ${SPRING_CACHE_TYPE:redis}  # none в Cloud Run без VPC
  security:
    oauth2:
      # forward-headers для работы OAuth2 за proxy
  server:
    forward-headers-strategy: native  # обязательно при работе за nginx/load balancer
```

### pom.xml — Cloud SQL dependency
```xml
<dependency>
    <groupId>com.google.cloud.sql</groupId>
    <artifactId>postgres-socket-factory</artifactId>
    <version>1.15.0</version>
</dependency>
```

---

## Типичные ошибки и решения

| Ошибка | Причина | Решение |
|---|---|---|
| `Permission denied: ./mvnw` | Docker COPY не сохраняет execute bit | Добавь `RUN chmod +x mvnw` в Dockerfile |
| `host not found in upstream` | nginx не может резолвить переменную при старте | Добавь `resolver 169.254.169.254 valid=30s;` в nginx.conf |
| 404 на все API запросы | `VITE_API_BASE_URL` без суффикса `/api` | Добавь `/api` в конец URL |
| Container failed to start (timeout) | Redis недоступен — бэкенд завис при подключении | Установи `SPRING_CACHE_TYPE=none` |
| Cloud SQL connection timeout | Неправильный регион в JDBC URL | Используй регион инстанса Cloud SQL, а не Cloud Run сервиса |
| CORS error в браузере | Кастомный домен не в allowedOrigins | Добавь оба URL (Cloud Run + кастомный домен) в CORS конфиг |
| `Secret name GITHUB_CLIENT_ID is invalid` | Зарезервированный префикс GitHub | Переименуй секреты: `GH_CLIENT_ID` / `GH_CLIENT_SECRET` |
| Env var исчезает после деплоя | `--set-env-vars` полностью заменяет env | Всегда перечисляй ВСЕ env vars в cd.yml явно |
| OAuth2 redirect_uri_mismatch | `forward-headers-strategy` не настроен | Добавь `server.forward-headers-strategy: native` в yaml |

---

## Публичный доступ (allUsers)

Если в GCP организации включена политика `Domain Restricted Sharing`, `--allow-unauthenticated` упадёт. Решение:

```bash
gcloud run services add-iam-policy-binding SERVICE_NAME \
  --region=REGION \
  --member="allUsers" \
  --role="roles/run.invoker"
```

---

## Кастомный домен

После деплоя в Cloud Console:
1. Cloud Run → сервис `careerpilot-frontend` → Manage Custom Domains
2. Добавить домен → верифицировать через DNS TXT-запись
3. Прописать CNAME/A запись у регистратора домена

---

## Проверка деплоя

```bash
# Посмотреть логи backend
gcloud run services logs read careerpilot-backend --region=europe-west1 --limit=50

# Статус сервисов
gcloud run services list --region=europe-west1

# Проверить URL backend
curl https://YOUR_BACKEND_URL/api/actuator/health
```
