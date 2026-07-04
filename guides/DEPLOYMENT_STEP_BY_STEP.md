# Пошаговое руководство по продакшн-деплою Polozhnov Dev

Это подробная инструкция по развёртыванию сайта-портфолио **Александра Положнова** с ИИ-ассистентом на бесплатных облачных платформах.

---

## 🏗 Общая архитектура деплоя

| Компонент | Платформа | Роль | Тариф |
|---|---|---|---|
| **DNS & CDN & WAF** | **Cloudflare** | Защита от DDoS, SSL/TLS, проксирование трафика | Бесплатный (Free) |
| **Frontend** | **Vercel** | Хостинг Next.js 16 (App Router, SSR/Static) | Бесплатный (Hobby) |
| **Backend** | **Render** | Docker-контейнер со Spring Boot 3 (Java 21) | Бесплатный (Free Web Service) |
| **База данных** | **Neon** | Serverless PostgreSQL для хранения данных (вечный бесплатный тариф) | Бесплатный (Free) |

---

## 📌 Шаг 1. Подготовка домена и DNS в Cloudflare

Мы хотим, чтобы сервис был доступен по красивым адресам:
* Фронтенд: `https://polozhnov.xyz` (или `www.polozhnov.xyz`)
* Бэкенд API: `https://api.polozhnov.xyz`

1. **Зарегистрируйтесь в [Cloudflare](https://dash.cloudflare.com/)**.
2. Нажмите **Add Site** и введите ваш домен (например, `polozhnov.xyz`). Выберите бесплатный тариф (Free Plan).
3. Cloudflare выдаст вам два DNS-сервера (Nameservers).
4. Зайдите к вашему регистратору домена (Reg.ru, Namecheap и т.д.) и укажите эти NS-серверы для домена.
5. В Cloudflare перейдите в раздел **SSL/TLS -> Overview** и выберите режим **Full (strict)**. Это гарантирует сквозное шифрование от клиента до Vercel/Render.

---

## 📌 Шаг 2. Создание базы данных PostgreSQL

Мы используем **Neon** (Serverless Postgres), так как у него **вечный бесплатный тариф** (база не удаляется через 90 дней, как у Render) и она мгновенно "просыпается" при обращении.

1. Зарегистрируйтесь на [Neon](https://neon.tech/).
2. Создайте новый проект:
   * **Project Name:** `polozhnov-db`
   * **Postgres Version:** 16 (или выше)
   * **Region:** Франкфурт (Frankfurt / EU Central) или ближайший к вашему бэкенду.
3. Нажмите **Create project**.
4. В дашборде проекта в блоке **Connection Details** скопируйте строку подключения (Connection string). Убедитесь, что галочка *Pooled connection* включена. Формат будет примерно такой:
   `postgresql://neondb_owner:password@ep-cool-cloud-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require`

> 💡 *Примечание:* Наш бэкенд умеет автоматически распознавать единый URL подключения (даже если он начинается с `postgresql://...` или `postgres://...`), поэтому вам достаточно скопировать готовую строку подключения напрямую из панели Neon!

---

## 📌 Шаг 3. Создание и настройка Telegram Бота в @BotFather

Наш бот выступает в роли ИИ-ассистента и поддерживает команды.

### 3.1. Регистрация бота
1. Откройте Telegram и найдите официального бота **[@BotFather](https://t.me/BotFather)**.
2. Отправьте команду `/newbot`.
3. Введите название бота, например: `Alexdev Assistant`.
4. Введите юзернейм бота, например: `alexdev_assistant_bot`.
5. BotFather выдаст вам **HTTP API Token** (например, `8995012044:AAEb...`). Скопируйте и сохраните его.

### 3.2. Настройка меню
Отправьте в @BotFather команду `/setmenubutton`, выберите вашего бота и укажите ваш URL фронтенда `https://polozhnov.xyz` с текстом кнопки "Открыть Портфолио".

---

## 📌 Шаг 4. Деплой Бэкенда (Spring Boot 3) на Render

Бэкенд собирается и запускается в Docker-контейнере. В корне проекта уже настроен `Dockerfile` (в папке `backend/`).

1. В [Render Dashboard](https://dashboard.render.com/) нажмите **New -> Web Service**.
2. Подключите ваш GitHub-репозиторий.
3. Настройте параметры сервиса:
   * **Name:** `polozhnov-backend`
   * **Region:** Тот же, где создана БД (Frankfurt / EU Central).
   * **Root Directory:** `backend`
   * **Environment:** `Docker`
   * **Instance Type:** Free.
   * **Health Check Path:** `/actuator/health` (Spring Boot Actuator отдаст статус 200 OK)
4. В разделе **Environment Variables (Переменные окружения)** добавьте базовые ключи:

| Ключ | Пример значения | Описание |
|---|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:pass@ep-cool...neon.tech/neondb` | Полный URL базы данных из Neon |
| `SPRING_PROFILES_ACTIVE` | `prod` | Включает продакшн-режим Spring Boot |
| `SERVER_PORT` | `8080` | Порт, который слушает приложение в контейнере |
| `CORS_ALLOWED_ORIGIN` | `https://polozhnov.xyz,https://www.polozhnov.xyz` | Точный URL вашего фронтенда |
| `TELEGRAM_BOT_TOKEN` | `8995012044:AAEb...` | Токен вашего бота из @BotFather |
| `TELEGRAM_BOT_USERNAME` | `@alexdev_assistant_bot` | Юзернейм бота |
| `TELEGRAM_WEBAPP_URL` | `https://polozhnov.xyz` | Ссылка на ваш фронт для бота |
| `GCP_PROJECT_ID` | `ваше-название-проекта` | ID вашего проекта в Google Cloud Console |
| `GCP_LOCATION` | `us-central1` | Регион размещения Vertex AI |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Название модели (например, gemini-3.1-flash-lite) |

5. **Настройка Google Cloud Vertex AI (Secret File):**
   Так как мы используем Enterprise-версию Vertex AI, нам нужен сервисный аккаунт:
   * Зайдите в [Google Cloud Console](https://console.cloud.google.com/).
   * Создайте Service Account с ролью `Vertex AI User`.
   * Создайте и скачайте JSON-ключ для этого аккаунта.
   * Вернитесь в настройки вашего Web Service на **Render** -> раздел **Secret Files**.
   * Добавьте новый файл:
     - **Filename:** `gcp-credentials.json`
     - **Contents:** Вставьте всё содержимое скачанного JSON-файла.
   * Вернитесь в **Environment Variables** и добавьте переменную:
     - `GOOGLE_APPLICATION_CREDENTIALS` = `/etc/secrets/gcp-credentials.json`

6. Нажмите **Create Web Service**. Дождитесь завершения сборки Docker-образа. Render выдаст URL сервиса: `https://polozhnov-backend.onrender.com`.

---

## 📌 Шаг 5. Деплой Фронтенда (Next.js 16) на Vercel

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard).
2. Нажмите **Add New -> Project** и импортируйте ваш репозиторий с GitHub.
3. В настройках проекта:
   * **Framework Preset:** Next.js.
   * **Root Directory:** выберите папку `frontend`.
4. Раскройте секцию **Environment Variables** и добавьте переменную:

| Имя переменной | Значение |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://polozhnov-backend.onrender.com/api/v1` (или ваш поддомен `https://api.polozhnov.xyz/api/v1`) |

5. Нажмите **Deploy**. Vercel выдаст ссылку вида `https://polozhnov-dev.vercel.app`.

---

## 📌 Шаг 6. Привязка доменов и проксирование через Cloudflare

Теперь свяжем Vercel и Render с вашим красивым доменом через Cloudflare.

### 6.1. Домен для Фронтенда (`polozhnov.xyz` и `www.polozhnov.xyz`)
1. В Vercel перейдите в **Settings -> Domains** вашего проекта и добавьте домены.
2. Vercel покажет записи, которые нужно добавить в DNS.
3. Откройте **Cloudflare -> DNS -> Records** и добавьте записи:
   * **Type:** `CNAME`
   * **Name:** `polozhnov.xyz` (и `www`)
   * **Target:** `cname.vercel-dns.com`
   * **Proxy status:** ☁️ **DNS only (Серое облачко ОБЯЗАТЕЛЬНО!)**. Vercel выпускает SSL-сертификаты Let's Encrypt сам.

### 6.2. Поддомен для Бэкенда (`api.polozhnov.xyz`)
1. В панели Render перейдите в настройки вашего Web Service -> **Settings -> Custom Domains** и добавьте `api.polozhnov.xyz`.
2. Откройте **Cloudflare -> DNS -> Records** и добавьте запись:
   * **Type:** `CNAME`
   * **Name:** `api`
   * **Target:** `ваш-сервис.onrender.com` (адрес из панели Render без `https://`)
   * **Proxy status:** ☁️ **DNS only (Серое облачко)** при первом добавлении, чтобы Render мог успешно проверить DNS и выпустить SSL-сертификат.

---

## 📌 Шаг 7. Проверка работоспособности

1. Откройте в браузере `https://polozhnov.xyz`.
2. Откройте ИИ-виджет в углу экрана и попробуйте задать вопрос.
3. Проверьте, что бот в Telegram также реагирует на команду `/start`.

---

## 📌 Шаг 8. Предотвращение засыпания бэкенда (UptimeRobot)

На бесплатном тарифе Render (**Free Web Service**) контейнер засыпает после 15 минут простоя. Холодный старт Spring Boot (Java 21) занимает 30–50 секунд. Чтобы бэкенд отвечал мгновенно 24/7 бесплатно:

1. Зарегистрируйтесь на [UptimeRobot](https://uptimerobot.com/) (Free Plan).
2. Нажмите **+ Add New Monitor**.
3. Укажите параметры мониторинга:
   * **Monitor Type:** `HTTP(s)`
   * **Friendly Name:** `Polozhnov Backend`
   * **URL (или IP):** `https://api.polozhnov.xyz/api/v1/ai/chat` *(или открытый эндпоинт)*
   * **Monitoring Interval:** `5 minutes`
4. Нажмите **Create Monitor**.

Каждые 5 минут UptimeRobot будет опрашивать API, предотвращая переход контейнера в спящий режим и обеспечивая мгновенный отклик (50–100 мс).

🎉 **Ваш проект успешно развёрнут в Production-среде и работает 24/7!**
