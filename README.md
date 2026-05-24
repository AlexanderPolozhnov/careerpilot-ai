# CareerPilot AI

<div align="center">

**Управление поиском работы как структурированным workflow — с AI-ассистентом, Kanban-бордом, задачами, собеседованиями и аналитикой.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-careerpilot--ai-violet?style=for-the-badge&logo=vercel)](https://careerpilot-ai-sigma.vercel.app)
[![Release](https://img.shields.io/badge/Release-v0.8.0--alpha-orange?style=for-the-badge)](https://github.com/AlexanderPolozhnov/careerpilot-ai/releases)
[![Java](https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-green?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-TypeScript-blue?style=for-the-badge&logo=react)](https://react.dev/)

> **Статус:** В активной разработке · Portfolio project с production-like архитектурой · Не production-ready

</div>

---

## 🖼️ Скриншоты

### Лендинг

![Landing Page](./docs/assets/screenshot-landing.png)

---

### Авторизация

![Auth Page](./docs/assets/screenshot-auth.png)

---

### Dashboard

![Dashboard](./docs/assets/screenshot-dashboard.png)

---

### Вакансии

![Vacancies](./docs/assets/screenshot-vacancies.png)

---

### Вакансии — детальная страница

![Vacancy Detail](./docs/assets/screenshot-vacancy-detail.png)

---

### Заявки — Kanban-борд

![Applications Kanban](./docs/assets/screenshot-kanban.png)

---

### Задачи

![Tasks](./docs/assets/screenshot-tasks.png)

---

### Собеседования

![Interviews](./docs/assets/screenshot-interviews.png)

---

### Компании

![Companies](./docs/assets/screenshot-companies.png)

---

### AI-помощник

![AI Assistant](./docs/assets/screenshot-ai.png)

---

### Аналитика

![Analytics](./docs/assets/screenshot-analytics.png)

---

### Настройки

![Settings](./docs/assets/screenshot-settings.png)

---

## 🚀 Live Demo

**[careerpilot-ai-sigma.vercel.app](https://careerpilot-ai-sigma.vercel.app)**

Demo-аккаунт для входа:

| Поле   | Значение               |
|--------|------------------------|
| Email  | `sofia.horak@demo.dev` |
| Пароль | `Demo123!@#`           |

> ⚠️ Live demo работает в режиме **mock data** — backend не подключён к Vercel-деплою.
> Данные сбрасываются при перезагрузке страницы, изменения не сохраняются.
> Для полного функционала с PostgreSQL — локальный запуск (см. ниже).

---

## О проекте

Поиск работы быстро превращается в набор разрозненных вкладок, таблиц, заметок и напоминаний.
CareerPilot AI собирает этот процесс в один понятный workflow:

- хранение вакансий и компаний;
- отслеживание этапов откликов через Kanban-борд с drag-and-drop;
- планирование задач (Tasks) и отслеживание собеседований (Interviews);
- AI-анализ вакансий, сравнение резюме, генерация cover letter и вопросов к интервью;
- единый глобальный поиск по всем сущностям (с поддержкой горячих клавиш);
- аналитика прогресса поиска работы;
- интерфейс на русском и английском.

---

## ✅ Что реализовано

### Backend (REST API)

| Slice         | Эндпоинты                                                                                                     | Статус |
|---------------|---------------------------------------------------------------------------------------------------------------|--------|
| Auth          | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/password`, `POST /auth/refresh`, `POST /auth/logout` | ✅      |
| OAuth2        | Авторизация через GitHub / Google, автоматический маппинг профилей, поддержка приватных email                 | ✅      |
| Vacancies     | Полный CRUD, pagination, user ownership, загрузка данных компании без N+1                                     | ✅      |
| Companies     | Полный CRUD, pagination, user ownership                                                                       | ✅      |
| Applications  | Board, PATCH status, полный CRUD, **Status History (Timeline)**                                               | ✅      |
| Tasks         | Полный CRUD, pagination, фильтрация, toggle статуса выполнения, связь с Applications                          | ✅      |
| Interviews    | Полный CRUD, pagination, фильтрация по типу/результату, связь с Applications                                  | ✅      |
| Resumes       | Полный CRUD, транзакционная логика установки дефолтного резюме, валидация URL                                 | ✅      |
| Search        | `GET /api/search` — агрегированный полнотекстовый поиск по вакансиям, компаниям, задачам и собеседованиям     | ✅      |
| Analytics     | `GET /analytics/summary` с воронкой откликов, недельной активностью и top skill gaps                         | ✅      |
| AI Assistant  | analyze-vacancy, resume-match, cover-letter, interview-questions, history                                     | ✅      |
| Dashboard     | `GET /dashboard/summary` (KPI, предстоящие интервью, AI инсайты, список задач)                                | ✅      |
| Profile       | `GET /profiles/me`, `PUT /profiles/me` с JSONB-полем скиллов                                                  | ✅      |
| Settings      | `GET/PUT /users/me`, `GET/PUT /preferences`, `DELETE /users/me` (Secure Deletion)                              | ✅      |
| Notifications | `GET /notifications` (pagination, read filter), `PATCH /{id}/read`, **Telegram Integration** (Strategy/Factory pattern) | ✅      |

### Frontend

- World-class UI redesign в стиле **Linear / Vercel / Clerk** — тёмная тема, glassmorphism, violet-акценты.
- **Kanban-борд** с drag-and-drop (dnd-kit), DragOverlay-preview, optimistic update.
- **Интерактивные задачи & Собеседования** — полноценный CRUD, фильтрация, приведение к стандартам дизайн-системы.
- **Глобальный поиск (Cmd+K / Ctrl+K)** — модальное окно с дебаунсом и быстрым переходом к любой сущности.
- **AI-ассистент** — 5 инструментов с динамическими формами, выбором резюме/вакансий с автозаполнением, улучшенной валидацией и индивидуальными заголовками, автообновление истории запросов.
- **Analytics** — KPI-карточки, воронка (funnel), график активности по реальным неделям, skill gaps.
- **Dashboard** — подключён к backend через React Query, skeleton-loading, быстрый toggle задач.
- **Settings** — профиль (ввод навыков), управление резюме (Zod-валидация), управление паролями (в т.ч. создание для OAuth2 пользователей).
- React Query (TanStack Query) для кэширования и инвалидации.
- Error boundaries + unified Toast-система с перехватом HTTP-ошибок.
- i18n: `ru` + `en`, переключатель языка, автоматическая локализация дат (`date-fns`).

### Безопасность и Инфраструктура

- **Refresh Tokens:** Автоматическое продление сессии через HttpOnly Cookies, безопасный выход с очисткой сессий в БД.
- **Rate Limiting:** Ограничение частоты запросов для AI-эндпоинтов с использованием алгоритма Token Bucket (Bucket4j, HTTP 429).
- **Audit Trail:** Журналирование критичных действий пользователей (логин, изменения сущностей, AI-запросы) в PostgreSQL.
- **Secure Key Storage:** Прозрачное шифрование (AES-256) OpenAI API ключей пользователей при хранении в базе данных.
- **Full-Stack Docker Compose:** Весь стек (backend + frontend + PostgreSQL + Redis + optional MinIO/Ollama) поднимается одной командой `docker compose up -d --build`. Nginx проксирует API и OAuth2 callbacks.
- **AI Integration:** Ollama как local provider с автоматическим fallback на mock-ответы.
- **Redis Cache:** Кэширование AI-результатов (TTL 24ч, с автоматическим обходом при сбоях Redis).
- **CI Pipeline:** GitHub Actions — frontend lint/build + backend unit-тесты при push и PR в main.

---

## 🔧 Стек технологий

### Бэкенд

`Java 21` · `Spring Boot 3` · `Spring Security` · `OAuth 2.0` · `JWT` · `Spring Data JPA` · `PostgreSQL` · `Flyway` · `MapStruct` ·
`Bean Validation` · `OpenAPI / Swagger` · `JUnit 5` · `Mockito` · `Testcontainers` · `Redis` · `Bucket4j`

### Фронтенд

`React` · `TypeScript` · `Vite` · `Tailwind CSS` · `React Router` · `TanStack Query` · `React Hook Form` · `Zod` ·
`dnd-kit` · `i18next` · `lucide-react` · `date-fns`

### Инфраструктура

`Docker` · `Docker Compose` · `PostgreSQL` · `Redis` · `GitHub Actions`

---

## ⚠️ Известные ограничения

Актуально для `v0.6.0-alpha`:

- **Backend:** Интеграционные тесты с Testcontainers требуют работающего локального Docker-окружения.

Полный список и статус задач: [ROADMAP.md](./ROADMAP.md).

---

## 🗂️ Структура репозитория

```text
careerpilot-ai/
├── backend/          Spring Boot backend
├── frontend/         React + TypeScript frontend
├── docs/             Документация и API-контракт
│   └── assets/       Скриншоты для README
├── docker-compose.yml
├── README.md
├── ROADMAP.md
└── LICENSE
```

---

## 🖥️ Локальный запуск

### 0. Full-stack Docker (рекомендуется)

```bash
cp .env.docker.example .env   # заполнить секреты
docker compose up -d --build
```

Frontend: `http://localhost` · Backend Swagger: `http://localhost:8080/swagger-ui.html`

Подробнее: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

### 1. Инфраструктура (локальный dev)

```bash
docker compose up -d postgres redis
```

Опциональные профили:

```bash
docker compose --profile ai up -d ollama      # локальный LLM
docker compose --profile storage up -d minio  # файловое хранилище
```

### 2. Backend

**Windows:**

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

**Unix-like:**

```bash
cd backend
./mvnw spring-boot:run
```

Backend запускается на `http://localhost:8080`. Swagger UI: `http://localhost:8080/swagger-ui.html`.

Переменные окружения — см. `backend/.env.example`. Реальный `.env` не коммитится.

### 3. Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Frontend запускается на `http://localhost:5173`.

Основные переменные окружения:

| Переменная          | Описание                 | Default                     |
|---------------------|--------------------------|-----------------------------|
| `VITE_API_BASE_URL` | Base URL для REST API    | `http://localhost:8080/api` |
| `VITE_USE_MOCKS`    | Mock-режим (без backend) | `false`                     |

### 4. Проверки

```bash
# Frontend
cd frontend && pnpm run lint && pnpm run build

# Backend
cd backend && ./mvnw test
```

---

## 📚 Документация

| Документ                                                                 | Содержание                     |
|--------------------------------------------------------------------------|--------------------------------|
| [ROADMAP.md](./ROADMAP.md)                                               | Фазы разработки и статусы      |
| [docs/README.DEV.md](./docs/README.DEV.md)                               | Руководство разработчика       |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)                               | Деплой через Docker Compose    |
| [docs/FRONTEND_BACKEND_CONTRACT.md](./docs/FRONTEND_BACKEND_CONTRACT.md) | API-контракт (source of truth) |
| [docs/I18N_IMPLEMENTATION.md](./docs/I18N_IMPLEMENTATION.md)             | Реализация i18n                |

---

## 📝 Примечание

Секреты, `.env`-файлы, build artifacts, IDE configs и dependency folders исключены через `.gitignore`.
Для публичного репозитория коммитятся только `.env.example` и `.env.docker.example`.