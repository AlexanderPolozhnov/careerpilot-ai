# 🚀 CareerPilot AI - Подготовка к собеседованию (Java Middle FullStack Developer)
 
## Обзор проекта
 
**CareerPilot AI** — это приложение для управления поиском работы с AI-ассистентом, Kanban-бордом и аналитикой. Проект сделан как демонстрация для портфолио.
 
**Основная цель:** Собрать всё в одном месте — вместо бесконечных вкладок, таблиц и заметок теперь есть структурированный процесс с AI-помощником.
 
**Текущий статус:** v1.0.0-beta — задеплоен на **https://careerpilot-ai.ru** (Google Cloud Run, production). Mock-демо: https://careerpilot-ai-sigma.vercel.app.
 
**Ключевые функции:**
- Хранит вакансии (с тегами/навыками), компании и отклики
- Kanban-борд для отслеживания откликов с Drag-and-Drop и историей изменений статусов (Timeline)
- AI-ассистент: анализ вакансии, сравнение с резюме, сопроводительное письмо, вопросы к интервью, генерация резюме
- Поддержка нескольких AI-провайдеров: LOCAL (Ollama), CLOUD (OpenAI), BRING_YOUR_OWN_KEY (OpenAI / Google Gemini)
- Аналитика: воронка откликов, Skill Gaps, среднее время до интервью, активность по неделям
- Управление собеседованиями, задачами, резюме, профилем
- Глобальный поиск (Cmd+K) по всем сущностям
- Автоматические напоминания о задачах и собеседованиях (Scheduler + Email + In-App + Telegram)
- Telegram Bot: уведомления через Telegram с привязкой аккаунта через deep link, Strategy/Factory паттерн для провайдеров
- Авторизация: JWT + Refresh Token (HttpOnly Cookie) + OAuth2 Social Login (Google, GitHub)
- Работает на русском и английском языках
 
---
 
## Production Deployment & Hosting
 
**Production URL:** https://careerpilot-ai.ru
 
**Инфраструктура:**
 
| Компонент | Сервис | Регион |
|---|---|---|
| Frontend | Google Cloud Run `careerpilot-frontend` (nginx) | europe-west1 |
| Backend | Google Cloud Run `careerpilot-backend` (Spring Boot) | europe-west1 |
| База данных | Cloud SQL PostgreSQL `careerpilot-db` | europe-west3 |
| Docker образы | Google Artifact Registry `careerpilot-docker-repo` | europe-west1 |
 
**CD Pipeline:** `.github/workflows/cd.yml` — GitHub Actions → Docker build → Artifact Registry → Cloud Run.
Автодеплой при каждом push в `main`.
 
**Особенности:**
- Redis не используется (`SPRING_CACHE_TYPE=none`) — нужен VPC Connector для Google Memorystore.
- Backend подключается к Cloud SQL через Cloud SQL Socket Factory (JDBC, без открытых портов).
- OAuth2 Consent Screen верифицирован (Privacy Policy + Terms of Service на `/privacy` и `/terms`).
 
**Подробный гайд:** `private-notes/info-by-project/CLOUD_RUN_CD_DEPLOYMENT_GUIDE.md`
 
---
 
## Архитектура проекта
 
### Monorepo структура
 
```
careerpilot-ai/
├── backend/          Spring Boot 3 backend (Java 21)
├── frontend/         React + TypeScript + Vite frontend
├── docs/             Документация и API контракт
├── docker-compose.yml   Локальная инфраструктура
└── README.md, ROADMAP.md, LICENSE
```
 
### Архитектурный подход: модульный монолит
 
**Почему модульный монолит, а не микросервисы:**
- Для портфолио монолит проще — меньше мороки с деплоем
- Модули не дают коду превратиться в кашу
- Потом можно будет вынести модули в отдельные сервисы
- Тестировать и отлаживать проще
- Нет лишних сетевых вызовов
 
**Backend модули (по доменам):**
- `auth/` — авторизация: JWT, Refresh Token, OAuth2, сброс пароля, удаление аккаунта
- `user/` — управление пользователями
- `vacancy/` — вакансии (CRUD, теги, архивация, восстановление)
- `company/` — компании
- `application/` — отклики: Kanban, история статусов, статус-уведомления
- `interview/` — интервью
- `task/` — задачи (с приоритетами URGENT/HIGH/MEDIUM/LOW)
- `resume/` — резюме пользователей (CRUD, дефолтное резюме)
- `profile/` — профили пользователей (JSONB skills)
- `aiassistant/` — AI функции с провайдерами (Ollama/OpenAI/Gemini) и Rate Limiting
- `analytics/` — аналитика: воронка, Skill Gaps, Time to Interview
- `dashboard/` — главная страница с показателями
- `notification/` — In-App, Email и Telegram уведомления, запланированные напоминания, Strategy/Factory паттерн
- `telegram/` — Telegram Bot Handler (привязка аккаунта, команды /start и /help)
- `preferences/` — настройки пользователя (AI провайдер, уведомления, язык)
- `search/` — глобальный поиск по всем сущностям
- `audit/` — журнал критичных действий пользователей (@Auditable AOP)
- `common/` — общие компоненты (обработка ошибок, безопасность, Rate Limiting AOP)
 
**Frontend структура:**
```
frontend/src/
├── pages/           Страницы приложения
├── components/      Переиспользуемые компоненты
├── services/        API сервисы (axios-based)
├── context/         React Context (Auth, Theme)
├── types/           TypeScript типы
├── i18n/            Интернационализация (ru, en)
├── mock/            Mock данные для разработки
├── routes/          React Router конфигурация
└── styles/          Глобальные стили
```
 
---
 
## Backend Implementation
 
### Технологический стек
 
**Java 21** — последняя стабильная версия
- Виртуальные потоки, сопоставление с образцом, записи и улучшенный switch
- Используем современные фичи для чистого кода
 
**Spring Boot 3.5.14** — главный фреймворк
- Проверенная экосистема, всё настраивает сам, есть мониторинг и куча документации
- Версия 3.x поддерживает Jakarta EE 9+ (не javax.*)
 
**Spring Security** — безопасность
- JWT для авторизации (без хранения состояния)
- Аннотации для защиты методов
- Свой контекст безопасности для изоляции пользователей
 
**Spring Data JPA** — работа с базой данных
- Hibernate внутри
- Шаблон репозитория
- Поддержка страниц
 
**PostgreSQL 16** — основная база данных
- Надёжная реляционная база, транзакции, JSONB, проверенная временем
- Flyway для миграций
 
**Flyway** — управление миграциями
- Версионированные миграции (V1__init.sql, ..., V28__add_telegram_provider.sql)
- Эволюция схемы с обратной совместимостью
- 28 миграций применено (V1 — начальная схема, V28 — поддержка Telegram)
- Seed-данные в `db/seeds/` для демо-пользователя (расширенный тестовый набор)
 
**MapStruct 1.6.3** — конвертация Entity ↔ DTO
- Генерирует код при компиляции, проверяет типы, быстро
- Не пишем маппинг вручную и не используем reflection
 
**Bean Validation** — проверка данных
- Аннотации JSR-380 (@NotNull, @Size, @Email и т.д.)
- Свои валидаторы для бизнес-логики
 
**Redis 7** — кэширование
- Кэшируем результаты AI (хранится 24 часа)
- Резервный вариант если недоступен
- Интеграция через Spring Data Redis
 
**OpenAPI / Swagger (SpringDoc 2.8.6)** — документация API
- Генерируется автоматически из аннотаций
- Swagger UI на /swagger-ui.html
 
**JUnit 5 + Mockito + Testcontainers** — тестирование
- Юнит-тесты для сервисов
- Интеграционные тесты с Testcontainers для PostgreSQL
- Testcontainers запускает реальную базу в Docker
 
**JWT (jjwt 0.12.6)** — токены
- Токен доступа с настраиваемым сроком действия
- Секрет из environment в Base64
 
**Lombok** — меньше рутины
- @Data, @Builder, @Slf4j, @RequiredArgsConstructor
 
### Паттерны и архитектура backend
 
**Слоистая архитектура:**
```
Controller → Service → Repository → Entity
```

**Слой контроллера:**
- REST endpoints через Spring MVC
- Request/Response DTOs (не Entities!)
- Проверка на входе
- Обработчик ошибок для единообразной обработки

**Слой сервиса:**
- Бизнес-логика
- Транзакции через @Transactional
- MapStruct для конвертации Entity ↔ DTO
- Свои исключения для бизнес-логики

**Слой репозитория:**
- Spring Data JPA repositories
- Кастомные запросы через @Query если нужно
- Страницы через Pageable

**Безопасность:**
- ID пользователя только из контекста безопасности
- Никогда не из параметров запроса!
- Проверяем что данные принадлежат пользователю
- JWT без сохранения состояния

**Обработка ошибок:**
- Обработчик ловит все исключения
- Единый формат ответа с ошибкой
- Свои исключения для разных случаев (NotFoundException, ValidationException и т.д.)
 
### Детали реализации модулей
 
**Auth Module:**
- Endpoints: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `POST /auth/password`
- Хеширование паролей BCrypt (10 rounds)
- **Refresh Token**: хранится в БД (таблица `refresh_tokens`), передаётся через HttpOnly SameSite=Strict Cookie. Axios interceptor на фронтенде автоматически обновляет сессию при 401, повторяет упавший запрос.
- **OAuth2 Social Login** (Google, GitHub): слияние аккаунтов по email, получение скрытых GitHub email через `/user/emails` API, `OAuth2SuccessHandler` генерирует JWT и редиректит на фронтенд.
- **Сброс пароля**: UUID-токен TTL 24ч, реальная отправка HTML-письма через SMTP (`@Async`).
- **Управление паролем**: смена для email-пользователей, создание первого пароля для OAuth2-пользователей (у которых `password_hash = null`).
- **Удаление аккаунта**: подтверждение через пароль + email, каскадное удаление всех данных из БД (`DELETE /users/me`).
- Исправлена утечка сессий OAuth2: `JwtAuthenticationFilter` очищает `SecurityContextHolder`, logout удаляет JSESSIONID cookie.
 
**Vacancy Module:**
- Полный CRUD с пагинацией, архивация (`PATCH /{id}/archive`) и восстановление (`PATCH /{id}/restore`)
- Статусы: ACTIVE, ARCHIVED, EXPIRED
- Типы контракта: FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP; формат: REMOTE, HYBRID, ON_SITE
- Теги навыков (many-to-many через `vacancy_tags`) — база для Skill Gaps аналитики
- `@EntityGraph(attributePaths = {"company","tags"})` на репозитории — устранение N+1
- Фильтры по status, remote, companyId, tag; `LocalDate` в DTO для поля deadline (→ `Instant` в сервисе)
 
**Company Module:**
- Полный CRUD с пагинацией
- Привязка к пользователю
- Поля: name, website, industry, size, location, description, linkedinUrl, logoUrl
- Размер: STARTUP, SMALL, MEDIUM, LARGE, ENTERPRISE
 
**Application Module:**
- Kanban board: `GET /applications/board` (сгруппировано по статусу)
- Статусы: NEW, SAVED, APPLIED, HR_SCREEN, TECH_INTERVIEW, FINAL_ROUND, OFFER, REJECTED
- История статусов: `GET /applications/{id}/history` → таблица `application_status_history`
- Автоматическая фиксация `first_interview_at` при первом переходе в статус интервью (база для аналитики)
- Уникальность: (user_id, vacancy_id); `LocalDate` в DTO для дат → `Instant` в сервисе
- In-App + Email уведомления при смене статуса (настраивается в Preferences)
 
**AI Assistant Module:**
- `LlmProvider` interface → реализации: `OllamaLlmProvider`, `OpenAiLlmProvider`, `GeminiLlmProvider`, `FallbackLlmGenerator`
- **`LlmProviderFactory`** выбирает провайдер по `PreferencesEntity` пользователя: LOCAL → Ollama, CLOUD → OpenAI (системный ключ), BRING_YOUR_OWN_KEY → OpenAI или Gemini (ключ из настроек)
- API-ключи пользователей шифруются AES-256-CBC через JPA `EncryptionConverter` (`ENCRYPTION_MASTER_KEY` в env), маскируются при отдаче в DTO (показывается `sk-...xxxx`)
- Промпты в Markdown-файлах (`resources/prompts/{ru,en}/*.md`), язык определяется по `Preferences.language` пользователя
- Fallback-режим: `isFallback=true` сохраняется в `ai_results`, отображается бейджем в UI
- Rate Limiting: 10 запросов/час через `@RateLimit` AOP + Bucket4j; хранение корзин в Redis
- Endpoints: `POST /ai/analyze-vacancy`, `/ai/resume-match`, `/ai/cover-letter`, `/ai/interview-questions`, `/ai/generate-resume`, `GET /ai/history`, `GET /ai/history/{id}`
- Кэш в Redis (TTL 24ч, ключ = SHA-256 от входных данных)
- Метрики: `latency_ms`, `tokens_used`, `error_message`, `is_fallback` в таблице `ai_results`
 
**Analytics Module:**
- `GET /analytics/summary`
- KPI: totalApplications, activeApplications, interviewRate, offerRate, responseRate, avgTimeToInterview (реальные расчёты)
- **Skill Gaps**: теги вакансий из откликов (статус > SAVED) vs навыки профиля пользователя, топ-10 по частоте
- **avgTimeToInterview**: среднее дней от `applied_at` до `first_interview_at` через `Duration.between()`
- График активности по неделям: отклики, интервью, офферы за каждую неделю
 
**Dashboard Module:**
- `GET /dashboard/summary`
- KPI: activeVacancies, activeApplications, interviewsScheduled, aiInsightsThisWeek
- Предстоящие интервью
- Задачи
- AI-инсайты
- Уведомления
 
**Notification Module:**
- Типы: INTERVIEW_REMINDER, TASK_DUE, APPLICATION_STATUS, AI_COMPLETE, SYSTEM
- Каналы: IN_APP, EMAIL, TELEGRAM
- Статусы: PENDING, SENT, FAILED, READ
- `GET /notifications/unread-count` → динамический бейдж в Topbar (polling каждые 60 сек)
- `reference_id` + `reference_type` для привязки к сущностям
- **`ReminderScheduler`** (`@Scheduled(cron)`, раз в час): создаёт In-App + Email/Telegram напоминания в окне 24 часов до события; флаг `reminder_sent` защищает от дублирования
- **Strategy/Factory паттерн**: интерфейс `NotificationSender` → `EmailNotificationSender` / `TelegramNotificationSender`; `NotificationSenderFactory` выбирает по `notification_provider` пользователя

**Telegram Module:**
- `TelegramBotHandler` (extends `TelegramLongPollingBot`): `/start {token}` — привязка, `/help` — справка
- Привязка через deep link `https://t.me/{botUsername}?start={UUID-token}`; токен генерируется в `PreferencesServiceImpl`
- Условный запуск через `@ConditionalOnProperty(name = "telegram.bot.enabled")`
- `GET /preferences/telegram-link` — эндпоинт генерации ссылки привязки
 
### Database Schema
 
**Основные таблицы (28 миграций V1-V28):**
 
1. **users** — пользователи
   - id (UUID, PK)
   - email (unique)
   - password_hash (BCrypt)
   - first_name, last_name
   - role (USER, ADMIN)
   - status (ACTIVE, BLOCKED, DELETED)
   - created_at, updated_at
 
2. **user_profiles** — профили пользователей
   - id, user_id (FK users, CASCADE)
   - desired_position, experience_level, city
   - remote_preference, salary_expectation, summary
 
3. **resumes** — резюме
   - id, user_id (FK users, CASCADE)
   - title, file_url, text_content
   - is_active (default false)
 
4. **companies** — компании
   - id, user_id (FK users, CASCADE)
   - name, website, description, industry
   - Unique constraint: (user_id, name)
 
5. **vacancies** — вакансии
   - id, user_id (FK users, CASCADE)
   - company_id (FK companies, SET NULL)
   - title, source, source_url, location
   - employment_type, remote_type, salary_from, salary_to, currency
   - description_raw, description_clean
   - status (ACTIVE, ARCHIVED, EXPIRED)
   - deadline
 
6. **vacancy_tags** — теги вакансий
   - id, vacancy_id (FK vacancies, CASCADE)
   - tag
   - Unique: (vacancy_id, tag)
 
7. **applications** — отклики
   - id, user_id (FK users, CASCADE)
   - vacancy_id (FK vacancies, CASCADE)
   - status (NEW, SAVED, APPLIED, HR_SCREEN, TECH_INTERVIEW, FINAL_ROUND, OFFER, REJECTED)
   - applied_at, next_follow_up_at, last_contact_at
   - notes
   - Unique: (user_id, vacancy_id)
 
8. **interviews** — интервью
   - id, application_id (FK applications, CASCADE)
   - type (HR_SCREEN, TECH_SCREEN, TECH_INTERVIEW, FINAL, OTHER)
   - scheduled_at, timezone, meeting_link
   - result (PENDING, PASSED, FAILED, CANCELLED)
   - notes
 
9. **tasks** — задачи
   - id, user_id (FK users, CASCADE)
   - application_id (FK applications, SET NULL)
   - title, description, due_at
   - done (boolean), priority (LOW, MEDIUM, HIGH, URGENT)
 
10. **ai_results** — результаты AI
    - id, user_id (FK users, CASCADE)
    - type (VACANCY_ANALYSIS, RESUME_MATCH, COVER_LETTER, INTERVIEW_QUESTIONS, SKILL_GAP)
    - input_hash (для кэша), input_payload, output_payload
    - created_at, expires_at
 
11. **notifications** — уведомления
    - id, user_id (FK users, CASCADE)
    - channel (IN_APP, TELEGRAM, EMAIL)
    - title, message, status (PENDING, SENT, FAILED, READ)
    - sent_at
 
12. **audit_logs** — аудит логи
    - id, user_id (FK users, SET NULL)
    - action, entity_type, entity_id
    - metadata (JSONB)
    - created_at
 
13. **preferences** — настройки пользователя
    - id, user_id (FK users, CASCADE)
    - weekly_digest, interview_reminders
    - ai_provider_mode (LOCAL, CLOUD, BRING_YOUR_OWN_KEY)
    - language
    - notification_provider (EMAIL/TELEGRAM, default EMAIL)
    - telegram_chat_id (VARCHAR) — ID чата после привязки
    - telegram_connect_token (UUID) — одноразовый токен deep link
 
**Indexes:** Все foreign keys, часто используемые поля для search (email, status, created_at, etc.)
 
**Constraints:** CHECK constraints для enums, UNIQUE constraints для бизнес-правил, FK constraints с CASCADE/SET NULL
 
---
 
## Frontend Implementation
 
### Технологический стек
 
**React 19.2.5** — UI библиотека
- Компонентный подход, виртуальный DOM, огромная экосистема
- Хуки для управления состоянием
 
**TypeScript** — типизация
- Проверяет типы, лучше поддержка в IDE, ошибки на этапе компиляции
- Строгий режим включён
 
**Vite 8.0.10** — сборка
- Быстрый HMR, оптимизированная сборка, современные инструменты
- Замена Create React App
 
**Tailwind CSS 4.1.12** — утилитарный CSS
- Быстрая разработка, единый дизайн, маленький бандл
- Своя дизайн-система с фиолетовыми акцентами
 
**React Router 7.14.2** — маршрутизация
- Декларативная маршрутизация, вложенные роуты, разделение кода
- Защищённые роуты для авторизованных страниц
 
**TanStack Query (React Query) 5.100.5** — управление состоянием сервера
- Кэширование, инвалидация, оптимистичные обновления, состояния загрузки
- Заменяет ручной useState + useEffect для API вызовов
 
**React Hook Form 7.74.0 + Zod 4.3.6** — формы
- Производительность, минимум ререндеров, валидация
- Zod для валидации схем
 
**dnd-kit (@dnd-kit/core 6.3.1)** — drag-and-drop
- Современный API, доступность, производительность
- Используется для Kanban доски
 
**i18next 26.0.8** — интернационализация
- Зрелая, гибкая, поддержка пространств имён
- Русский и английский, сохраняется в localStorage
 
**lucide-react 1.11.0** — иконки
- Можно вырезать неиспользуемые, единый дизайн, на основе SVG
 
**date-fns 4.1.0** — работа с датами
- Неизменяемые, модульные, можно вырезать неиспользуемые
 
### Frontend архитектура
 
**Управление состоянием:**
- Состояние сервера: TanStack Query (React Query)
- Состояние клиента: React Context (Auth, Theme)
- Состояние форм: React Hook Form
- Состояние URL: React Router (search params)
 
**API клиент:**
- На основе axios с перехватчиками
- Автоматическая подстановка токена из localStorage
- Единая обработка ошибок с уведомлениями
- Переключение в тестовый режим через переменную окружения
 
**Структура компонентов:**
- Страницы (DashboardPage, VacanciesPage и т.д.)
- Лейауты (Sidebar, Topbar, AppShell)
- Фичи (VacancyCard, KanbanColumn, AIAssistantPanel)
- UI компоненты (Button, Input, Modal, Toast)
 
**Маршрутизация:**
- Публичные роуты: /, /login, /register, /forgot-password
- Защищённые роуты: /dashboard, /vacancies, /applications, /companies, /ai, /analytics, /settings
- Защита через контекст авторизации
 
**Стили:**
- Утилитарные классы Tailwind CSS
- Своя тема в tailwind.config
- CSS модули для специфичных стилей компонентов
- Тёмная тема с эффектом стекла
 
**Обработка ошибок:**
- Границы ошибок для ошибок в компонентах
- Глобальный перехватчик для ошибок API
- Уведомления для обратной связи
- Загрузка-скелет для асинхронных операций
 
**Производительность:**
- Разделение кода через React.lazy()
- Ленивая загрузка для тяжёлых компонентов
- Оптимизация изображений
- Кэширование TanStack Query
- Мемоизация (useMemo, useCallback) где нужно
 
### Детали реализации страниц
 
**Landing Page:**
- Главная секция с призывом к действию
- Сетка для фич
- Современный дизайн в стиле Linear/Vercel
 
**Auth страницы:**
- Разделённый экран с брендинг панелью
- Формы логина/регистрации с проверкой
- Сброс пароля (только UI, backend TODO)
 
**Дашборд:**
- Карточки с показателями (активные вакансии, отклики, интервью, AI инсайты)
- Список предстоящих интервью
- Список задач
- Сводка AI инсайтов
- Уведомления
- React Query для данных с backend
 
**Вакансии:**
- Список с страницами и фильтрами
- Детальная страница с полной информацией
- Формы создания/редактирования с проверкой
 
**Отклики (Kanban доска):**
- Drag-and-drop
- Колонки по статусу отклика
 
**Компании:**
- Список с поиском
- Детальная страница
- Формы создания/редактирования
- Связь с вакансиями
 
**AI ассистент:**
- Выбор инструмента (анализ вакансии, сравнение резюме, сопроводительное письмо, вопросы к интервью)
- Динамические формы в зависимости от инструмента
- История AI запросов
- Отображение markdown для ответов
- Состояния загрузки и обработка ошибок
 
**Аналитика:**
- Карточки с метриками
- Воронка по статусам
- График активности по неделям
- Топ пробелов в навыках
- Визуализация через Chart.js или custom SVG
 
**Настройки:**
- Редактирование профиля
- Настройки (еженедельная сводка, напоминания об интервью, режим AI провайдера)
- Переключатель провайдера уведомлений (Email / Telegram) с индикатором статуса привязки
- Модалка привязки Telegram: инструкция + кнопка открытия бота + кнопка подтверждения
- Переключатель языка
- Сохранение на backend
 
---
 
## API Design
 
### RESTful API Contract
 
**Base URL:** `/api`
 
**Authentication:** Bearer JWT token в header
```
Authorization: Bearer <accessToken>
```
 
**Pagination:** Spring-style PagedResponse
```json
{
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true
}
```
 
**Ошибка:** Единый формат
```json
{
  "timestamp": "2026-04-27T05:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/vacancies"
}
```
 
### Основные endpoints
 
**Авторизация:**
- `POST /auth/register` — регистрация
- `POST /auth/login` — логин (возвращает токен доступа)
- `GET /auth/me` — текущий пользователь
- `POST /auth/forgot-password` — запрос сброса пароля
- `POST /auth/reset-password` — сброс пароля
 
**Вакансии:**
- `GET /vacancies?page=0&size=20&search=&status=&remote=&companyId=&tag=` — список с фильтрами
- `GET /vacancies/{id}` — детальная вакансия
- `POST /vacancies` — создание
- `PUT /vacancies/{id}` — обновление
- `DELETE /vacancies/{id}` — удаление
- `PATCH /vacancies/{id}/archive` — архивация
 
**Компании:**
- `GET /companies?page=0&size=20&search=` — список
- `GET /companies/{id}` — детальная компания
- `POST /companies` — создание
- `PUT /companies/{id}` — обновление
- `DELETE /companies/{id}` — удаление
 
**Отклики:**
- `GET /applications/board` — Kanban доска (сгруппированы по статусу)
- `GET /applications?page=0&size=20&status=&vacancyId=` — список
- `GET /applications/{id}` — детальный отклик
- `POST /applications` — создание
- `PATCH /applications/{id}/status` — изменение статуса
- `PUT /applications/{id}` — обновление
- `DELETE /applications/{id}` — удаление
 
**AI:**
- `POST /ai/analyze-vacancy` — анализ вакансии
- `POST /ai/resume-match` — сравнение резюме
- `POST /ai/cover-letter` — генерация сопроводительного письма
- `POST /ai/interview-questions` — вопросы к интервью
- `GET /ai/history?type=` — история запросов
- `GET /ai/history/{id}` — детальный результат
 
**Аналитика:**
- `GET /analytics/summary` — сводка аналитики
 
**Дашборд:**
- `GET /dashboard/summary` — сводка дашборда
 
**Настройки:**
- `GET /users/me` — текущий пользователь
- `PUT /users/me` — обновление профиля
- `GET /preferences` — настройки
- `PUT /preferences` — обновление настроек

**Уведомления:**
- `GET /notifications?page=0&size=20&read=` — список
- `PATCH /notifications/{id}/read` — отметить прочитанным

**Telegram:**
- `GET /preferences/telegram-link` — генерация deep link для привязки бота

### API Contract Documentation

Полный контракт в `docs/FRONTEND_BACKEND_CONTRACT.md` — это источник истины для интеграции фронтенда и бэкенда.

Конвенции:
- Enum значения: UPPER_SNAKE_CASE (ACTIVE, ARCHIVED, REMOTE и т.д.)
- Дата/время: строки ISO-8601
- Пагинация: page начинается с 0, size от 1 до 100
- Сортировка: sort + direction (ASC/DESC)
- Пустые фильтры не отправляются

---
 
## Security Implementation
 
### Аутентификация

**Регистрация:**
1. Пользователь отправляет `POST /auth/register` с email, password, name
2. Backend валидирует, хеширует пароль (BCrypt)
3. Создаёт пользователя в БД
4. Возвращает accessToken и данные пользователя

**Логин:**
1. Пользователь отправляет `POST /auth/login` с email, password
2. Backend находит пользователя по email
3. Проверяет пароль (BCrypt.verify())
4. Генерирует JWT token
5. Возвращает accessToken и данные пользователя
6. Frontend сохраняет token в localStorage (cp_access_token)

**Авторизованные запросы:**
1. Frontend добавляет `Authorization: Bearer <token>` к каждому запросу
2. Backend проверяет JWT подпись и срок действия
3. Извлекает userId из token
4. Сохраняет в контексте безопасности
5. Контроллеры получают userId из контекста

**Изоляция пользователей:**
- Все entity имеют user_id foreign key
- Контроллеры проверяют владельца: `vacancy.getUserId().equals(currentUserId)`
- Никогда не доверяем userId из параметров запроса!
- Контекст безопасности — единственный источник истины для текущего пользователя
 
### Конфигурация Spring Security

**JWT фильтр:**
- `OncePerRequestFilter` перехватывает все запросы
- Извлекает Bearer token из Authorization header
- Проверяет token через jjwt
- Устанавливает authentication в контекст безопасности

**Конфигурация безопасности:**
- CSRF отключён (stateless API)
- CORS конфигурация для фронтенда
- Публичные endpoints: /auth/register, /auth/login, /swagger-ui/**
- Защищённые endpoints: все остальные требуют аутентификации

**Безопасность паролей:**
- BCrypt с силой по умолчанию (10 rounds)
- Никогда не храним пароли в открытом виде
- Токены сброса пароля (TODO)
 
### Авторизация

**Ролевой доступ:**
- Роли: USER, ADMIN
- Аннотации @PreAuthorize на методах контроллеров
- Сейчас в основном USER, ADMIN зарезервирован на будущее

**Безопасность на уровне методов:**
- @PreAuthorize("hasRole('ADMIN')") для админских endpoints
- Свои выражения для проверки владельца
### Архитектура AI

**Абстракция провайдера:**
```java
interface LlmProvider {
    String generate(String prompt);
}
```

**Ollama провайдер:**
- Локальный LLM провайдер (Ollama в Docker)
- HTTP клиент к Ollama API
- Конфигурация модели (llama2, mistral и т.д.)
- Резервный вариант на тестовые ответы если недоступен

**Промпт инженеринг:**
- Шаблоны промптов для каждого типа запроса
- Внедрение контекста (описание вакансии, текст резюме)
- Системные промпты для определения роли
- Конфигурация температуры и других параметров
 
### Стратегия кэширования

**Redis кэш:**
- Ключ: `ai:{type}:{input_hash}`
- Значение: AI ответ (JSON)
- TTL: 24 часа
- Резервный вариант: если Redis недоступен, вызываем AI провайдер напрямую

**Хеширование входа:**
- SHA-256 hash от нормализованного input
- Дедупликация одинаковых запросов
- Проверка кэша перед вызовом AI
 
### AI endpoints

**Анализ вакансии:**
- Выделяет ключевые требования из описания
- Определяет необходимые навыки и технологии
- Подсвечивает потенциальные красные флаги
- Даёт общую оценку

**Сравнение резюме:**
- Сравнивает резюме с требованиями вакансии
- Рассчитывает совпадение
- Выявляет пробелы в навыках
- Предлагает улучшения

**Генерация сопроводительного письма:**
- Генерирует персонализированное письмо
- Тон: PROFESSIONAL, FRIENDLY, ENTHUSIASTIC
- Включает дополнительный контекст
- Адаптировано под конкретную вакансию

**Вопросы к интервью:**
- Генерирует релевантные вопросы
- Фокус на конкретной области (например, производительность React)
- Настраиваемое количество вопросов
- Включает предложенные ответы
 
### Детали реализации

**Сервисный слой:**
- `AiService` — основной сервис
- `VacancyAnalysisService` — анализ вакансий
- `ResumeMatchService` — сравнение резюме
- `CoverLetterGenerationService` — генерация сопроводительного письма
- `InterviewPrepService` — подготовка к интервью
- `PromptBuilder` — построение промптов
- `AiResultCacheService` — кэширование в Redis

**Обработка ошибок:**
- Плавное снижение если AI провайдер недоступен
- Тестовые ответы как резервный вариант
- Таймаут для AI вызовов
- Повтор с экспоненциальной задержкой
 
---
 
## Интеграция AI

**Интеграция AI:**
- AI для анализа вакансий и резюме
- Используем Ollama как локальный LLM провайдер
- Промпт инженеринг для каждого типа запроса
- Кэширование результатов в Redis для быстрого доступа

**Преимущества:**
- Быстрый анализ вакансий и резюме
- Персонализированные рекомендации
- Улучшенная точность
- Быстрая генерация сопроводительных писем и вопросов к интервью

**Реализация:**
- Используем Spring Boot для создания RESTful API
### Docker Compose

**Сервисы:**
- **PostgreSQL 16-alpine** — основная база данных
  - Port: 5432
  - Volume: postgres_data
  - Healthcheck: pg_isready
- **Redis 7-alpine** — кэширование
  - Port: 6379
- **Ollama** (опционально, profile: ai) — локальный LLM
  - Port: 11434
  - Volume: ollama_data
- **MinIO** (опционально, profile: storage) — файловое хранилище
  - Ports: 9000 (API), 9001 (Console)
  - Volume: minio_data

**Запуск:**
```bash
docker compose up -d postgres redis
docker compose --profile ai up -d ollama
docker compose --profile storage up -d minio
```

### Переменные окружения

**Backend (.env):**
- `DB_PASSWORD`, `DB_USER`, `DB_NAME` — данные для PostgreSQL
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` — данные для MinIO
- `JWT_SECRET` — Base64 secret для JWT подписи
- `JWT_ACCESS_TOKEN_EXPIRATION_MS` — TTL токена доступа

**Frontend (.env):**
- `VITE_API_BASE_URL` — URL Backend API (по умолчанию: http://localhost:8080/api)
- `VITE_USE_MOCKS` — переключатель тестового режима (по умолчанию: false)
### Kanban доска
 
**Frontend:**
- dnd-kit для drag-and-drop
- DragOverlay для превью во время перетаскивания
- Оптимистичные обновления (UI меняется до ответа от backend)
- Columns по ApplicationStatus enum
- Компактные карточки с ключевой информацией
 
**Backend:**
- `GET /applications/board` — сгруппировано по статусу
- `PATCH /applications/{id}/status` — изменение статуса
- Валидация для корректных переходов статуса
- Проверка владельца
 
### Analytics
 
**Метрики:**
- Всего откликов
- Активные отклики (не отклонённые/архивные)
- Rate интервью (интервью / отклики)
- Rate офферов (офферы / отклики)
- Rate ответов (ответы / отклики)
- Среднее время до интервью
 
**Визуализации:**
- Funnel chart по статусам откликов
- График активности по неделям
- Top skill gaps из AI analysis
 
**Реализация:**
- SQL агрегирующие запросы
- Window functions для еженедельной активности
- Кэширование для дорогих вычислений
 
### AI ассистент
 
**Выбор инструмента:**
- 4 инструмента: анализ вакансии, сравнение резюме, сопроводительное письмо, вопросы к интервью
- Динамические формы в зависимости от инструмента
- Валидация обязательных полей
 
**История:**
- `GET /ai/history` — все AI запросы
- `GET /ai/history/{id}` — детальный результат
- Фильтр по типу
- Pagination
 
**Integration:**
- React Query для data fetching
- Loading states и error handling
- Markdown rendering для AI responses
- Copy to clipboard functionality
 
---
 
## Технические решения и причины
 
### Почему Java 21?
- Последняя стабильная версия с современными фичами (виртуальные потоки, сопоставление с образцом)
- Улучшенная производительность
- Лучшая сборка мусора
- Стандарт для корпоративных приложений
 
### Почему Spring Boot 3?
- Проверенная экосистема с обширной документацией
- Авто-конфигурация уменьшает рутину
- Actuator для мониторинга
- Большое сообщество и долгосрочная поддержка
- Jakarta EE 9+ (не javax.*)
 
### Почему PostgreSQL?
- Реляционная база с транзакциями
- Продвинутые возможности (JSONB, оконные функции, CTEs)
- Проверенная и готовая к продакшену
- Хорошая производительность для чтения
- Отличные инструменты (pgAdmin, DBeaver)
 
### Почему React + TypeScript?
- Компонентная архитектура
- Огромная экосистема и сообщество
- TypeScript для проверки типов
- Vite для быстрой разработки
- React Query для эффективного управления состоянием сервера
 
### Почему модульный монолит?
- Проще чем микросервисы для портфолио
- Чёткие границы модулей
- Легко деплоить и отлаживать
- Можно вынести модули в микросервисы позже
- Меньше накладных расходов на сетевые вызовы
 
### Почему Redis для кэширования?
- Кэш в памяти для быстрого доступа
- Поддержка TTL для автоматического истечения
- Возможности сохранения
- Интеграция Spring Data Redis
- Хорош для кэширования результатов AI
 
### Почему Ollama для AI?
- Локальный провайдер LLM (приватность)
- Нет затрат на API
- Деплой на основе Docker
- Поддержка множества моделей
- Резервный вариант на тестовые ответы
 
### Почему Flyway?
- Версионированные миграции с чёткой историей
- Отслеживание эволюции схемы
- Поддержка отката
- Хорошо работает с Spring Boot
- Лучше чем ручные SQL скрипты
 
### Почему MapStruct?
- Генерация при компиляции (производительность)
- Проверка типов при маппинге
- Нет накладных расходов reflection
- Чёткий код маппинга
- Лучше чем ручной маппинг или Dozer
 
---
 
## Проблемы и решения
 
### Проблема 1: Изоляция пользователей в многопользовательской системе
 
**Проблема:** Как гарантировать, что пользователи видят только свои данные?
 
**Решение:**
- Контекст безопасности как единственный источник истины для userId
- Всегда проверяем владельца в сервисном слое
- Никогда не доверяем userId из параметров запроса
- Ограничения внешних ключей на уровне базы данных с CASCADE
 
### Проблема 2: Кэширование AI ответов
 
**Проблема:** AI вызовы медленные и дорогие, нужно кэшировать результаты
 
**Решение:**
- Redis для распределённого кэширования
- Хеш входа для дедупликации
- TTL 24 часа для автоматического истечения
- Резервный вариант при недоступности Redis
- Сначала проверяем кэш перед вызовом AI
 
### Проблема 3: Drag-and-drop на Kanban доске
 
**Проблема:** Плавный drag-and-drop с оптимистичными обновлениями
 
**Решение:**
- dnd-kit для современного DnD API
- DragOverlay для визуальной обратной связи
- Оптимистичные обновления (UI обновляется сразу)
- Откат при ошибке
- Проверка на backend для корректных переходов
 
### Проблема 4: Синхронизация контракта между frontend и backend
 
**Проблема:** Frontend и backend должны синхронизироваться по API контракту
 
**Решение:**
- `docs/FRONTEND_BACKEND_CONTRACT.md` как источник истины
- Enum значения в UPPER_SNAKE_CASE
- Стандартизированный формат пагинации
- Единый формат ответа с ошибкой
- Ручная проверка smoke сценариев
 
### Проблема 5: Эволюция схемы базы данных
 
**Проблема:** Изменения схемы без поломки существующих данных
 
**Решение:**
- Flyway для версионированных миграций
- Обратно совместимые изменения
- Тест миграций на staging
- Скрипты отката для критических миграций
- Начальные данные для разработки
 
### Проблема 6: Тестовые vs реальные данные
 
**Проблема:** Frontend должен работать без backend для разработки
 
**Решение:**
- Переменная окружения `VITE_USE_MOCKS`
- Тестовые данные в `frontend/src/mock/data.ts`
- Абстракция сервисного слоя
- Лёгкое переключение между тестовыми и реальными данными
- Специальная обработка AuthContext для me() endpoint
 
---
 

## Архитектурная оптимизация (v0.9.5-alpha)

### Асинхронность и производительность
- **Async AI Integration:** Неблокирующая генерация через @Async и CompletableFuture.
- **SecurityContext Propagation:** Проброс контекста в асинхронные потоки.
- **Event-Driven Architecture (EDA):** Использование ApplicationStatusChangedEvent для развязки логики.
- **Database Tuning:** Оптимизация HikariCP и пакетная обработка Hibernate (batch_size: 25).

## Качество кода
 
### Тестирование
 
**Backend:**
- Unit tests для service layer (JUnit 5 + Mockito)
- Integration tests с Testcontainers для PostgreSQL
- Repository tests с real database
- Controller tests с MockMvc
- Test coverage для critical paths
 
**Frontend:**
- TODO: Тесты компонентов с React Testing Library
- TODO: Тесты сервисного слоя
- Ручное тестирование с документированными smoke сценариями
- Проверка кода с ESLint
 
### Валидация
 
**Backend:**
- Аннотации Bean Validation на DTOs (@NotNull, @Size, @Email)
- Свои валидаторы для бизнес-логики
- Валидация на сервисном слое
- Ограничения базы данных (CHECK, UNIQUE, FK)

**Frontend:**
- React Hook Form + Zod для валидации схем
- Клиентская валидация перед отправкой
- Сообщения об ошибках через i18n
- Визуальная обратная связь для ошибок валидации
 
### Обработка ошибок
 
**Backend:**
- Глобальный обработчик исключений для единообразного ответа с ошибкой
- Свои классы исключений (NotFoundException, ValidationException и т.д.)
- HTTP коды статуса подходящие для типов ошибок
- Логирование с правильными уровнями
- Чувствительные данные не показываются в сообщениях об ошибках

**Frontend:**
- Границы ошибок для ошибок компонентов React
- Глобальный перехватчик для ошибок API
- Уведомления для обратной связи с пользователем
- Логика повторов где уместно
- Плавное снижение для опциональных функций
 
### Стиль кода
 
**Backend:**
- Lombok для уменьшения рутины
- Согласованные соглашения об именовании
- Структура пакетов по доменным модулям
- Javadoc для публичных API
- Принципы чистого кода (SRP, DRY, KISS)

**Frontend:**
- ESLint для проверки кода
- Prettier для форматирования кода
- Согласованная структура компонентов
- Строгий режим TypeScript
- Правильная типизация пропсов
 
---
 
## Известные ограничения и будущие улучшения
 
### Текущие ограничения (v0.8.0-alpha)
 
**Файловое хранилище:**
- Загрузка бинарных файлов (резюме PDF, логотипы компаний) не реализована — хранятся как URL-ссылки
 
**AI:**
- Gemini провайдер интегрирован, но не покрыт интеграционными тестами так же глубоко, как Ollama/OpenAI
- Стоимость вызовов LLM не отслеживается
 
**Frontend:**
- Покрытие тестами базовое: утилиты, сервисы, несколько компонентов (23 теста). Основная верификация — ручное smoke-тестирование
 
**Infrastructure:**
- Тесты с Testcontainers требуют Docker
- Scheduled notifications форматируют время в Europe/Moscow; пользовательский timezone не поддерживается
 
### Планируемые улучшения
 
**Ближайшее:**
- Сделать обновление токена
- Закончить восстановление пароля
- Настроить тесты на фронтенде
- Сделать интерфейс для создания компании
- Улучшить историю AI запросов
 
**Среднесрочное:**
- OAuth интеграция
- Загрузка файлов (резюме, логотипы)
- Расширенная аналитика с выбором дат
- Email уведомления
- Лимиты на запросы к API
- Улучшить журнал изменений
 
**Долгосрочное:**
- Выделить AI в отдельный микросервис
- Обновления в реальном времени через WebSocket
- Мобильное приложение
- Продвинутые функции AI (анализ голоса, подготовка к видео-интервью)
- Мультиарендность для SaaS
- Инструкции по продакшн деплою
- Мониторинг и наблюдаемость
 
---
 
## Interview Q&A
 
### Q: Расскажите о проекте CareerPilot AI
 
**A:** CareerPilot AI — приложение для поиска работы с AI-помощником. Можно хранить вакансии и компании, вести Kanban-доску откликов, анализировать вакансии через AI, генерировать сопроводительные письма и вопросы для интервью, смотреть аналитику прогресса. Сделано как портфолио с почти боевой архитектурой: бэкенд на Java 21 + Spring Boot 3, фронтенд на React + TypeScript, PostgreSQL для базы, Redis для кэша, Docker Compose для локальной инфраструктуры. Архитектура — модульный монолит, каждый модуль отвечает за свою область (авторизация, вакансии, компании, отклики, AI, аналитика и т.д.).
 
### Q: Почему выбрали Modular Monolith архитектуру?
 
**A:** Для портфолио монолит проще в разработке и деплое, чем микросервисы. Модульная структура не даёт превратиться в «кашу» — у каждого модуля чёткие границы (контроллер, сервис, репозиторий, сущность). В будущем можно будет легко вынести модули в отдельные сервисы, если понадобится масштабироваться. Тестировать и отлаживать тоже проще — меньше возни с сетевыми вызовами между сервисами.
 
### Q: Как реализована аутентификация и авторизация?
 
**A:** У нас построена надежная и современная гибридная схема:
1. **JWT Access Token**: Хранится на фронтенде в localStorage, передается в заголовке `Authorization: Bearer <token>` и используется для авторизации REST-запросов.
2. **Refresh Token**: Для повышения безопасности реализованы Refresh-токены. При логине бэкенд сохраняет токен в базе данных с привязкой к сессии, а пользователю отдает его через защищенную **HttpOnly, SameSite=Strict** Cookie. На фронтенде настроен axios interceptor, который при получении 429 или 401 ошибки (истечение access токена) автоматически делает запрос к `/auth/refresh`, продлевает сессию без участия пользователя и повторяет упавший запрос.
3. **OAuth2 Social Login**: Реализована бесшовная авторизация через GitHub и Google с автоматическим маппингом профилей, слиянием аккаунтов по email и корректной обработкой приватных email у пользователей GitHub.
 
### Q: Как работает user isolation?
 
**A:** ID пользователя всегда берём из SecurityContext через `CurrentUserResolver.resolveRequired()`. Это единственный источник правды о текущем пользователе. В сервисах проверяем владение: например, `vacancy.getUserId().equals(currentUserId)`. На уровне базы внешние ключи с CASCADE гарантируют целостность. Никогда не верим ID из параметров запроса — это дыра в безопасности.
 
### Q: Как реализована интеграция с AI?
 
**A:** Сделан интерфейс `LlmProvider` с реализацией для локальной модели через Ollama. Если Ollama недоступен, подставляются заглушки. Результаты AI кэшируются в Redis на 24 часа, ключ делается как хеш от входных данных, чтобы не дублировать запросы. Реализовано 4 endpoint для AI: анализ вакансии, сравнение с резюме, генерация сопроводительного письма, вопросы для интервью. У каждого свой шаблон промпта и сервис. История запросов сохраняется в базе.
Для защиты ресурсов от злоупотреблений реализован **Rate Limiting** на основе библиотеки `bucket4j-core` через кастомный AOP-аспект `@RateLimit`. Лимит составляет 10 запросов в час на одного авторизованного пользователя. При превышении отдается HTTP 429 Too Many Requests с локализованным уведомлением.
 
### Q: Как работает Kanban board?
 
**A:** На фронтенде используется библиотека dnd-kit для перетаскивания. Endpoint `GET /applications/board` отдаёт данные сгруппированные по статусу. Смена статуса через `PATCH /applications/{id}/status`. Фронтенд делает оптимистичное обновление — интерфейс меняется сразу, не дожидаясь ответа от бэкенда. Если бэкенд возвращает ошибку, интерфейс откатывается. DragOverlay показывает визуальный предпросмотр во время перетаскивания. Бэкенд проверяет, что переход между статусами корректный.
 
### Q: Как работает кэширование?
 
**A:** Redis используется для кэша результатов AI. Формат ключа: `ai:{type}:{input_hash}`, значение — JSON ответ. TTL 24 часа для автоматического удаления. Перед вызовом AI проверяем кэш — если есть, отдаём закэшированный результат. Если Redis недоступен, идём напрямую к AI. Хеш входных данных (SHA-256) используется, чтобы не дублировать одинаковые запросы.
 
### Q: Как управляются миграции базы данных?
 
**A:** Используем Flyway для миграций. Каждая миграция имеет имя типа `V{n}__{description}.sql` (например, V1__init.sql, V4__vacancies_contract_alignment.sql). Flyway отслеживает применённые миграции в таблице `flyway_schema_history`. Миграции применяются автоматически при старте. Текущая версия — V13. Тестовые данные для разработки лежат в папке `seeds/`.
 
### Q: Как работает frontend-backend интеграция?
 
**A:** Контракт между фронтендом и бэкендом задокументирован в `docs/FRONTEND_BACKEND_CONTRACT.md` — это истина в последней инстанции. Фронтенд использует TanStack Query (React Query) для вызовов API с автоматическим кэшированием и инвалидацией. API клиент на axios с перехватчиками для добавления токена и обработки ошибок. Можно переключаться между моками и реальным API через переменную `VITE_USE_MOCKS`. Значения перечислений стандартизированы в UPPER_SNAKE_CASE (ACTIVE, ARCHIVED, REMOTE и т.д.).
 
### Q: Как обрабатываются ошибки?
 
**A:** На бэкенде есть GlobalExceptionHandler, который перехватывает все исключения и возвращает унифицированный ответ с сообщением, временем, статусом и путём. Кастомные классы исключений для ошибок предметной области (NotFoundException, ValidationException, AiException). На фронтенде есть error boundaries для ошибок компонентов и глобальный перехватчик для ошибок API, который показывает всплывающие уведомления. Чувствительные данные не попадают в сообщения об ошибках.
 
### Q: Как работает валидация?
 
**A:** На бэкенде используются аннотации Bean Validation на DTO (@NotNull, @Size, @Email и т.д.) и кастомные валидаторы для бизнес-логики. Сервисы делают дополнительную проверку. Ограничения базы данных (CHECK, UNIQUE, FK) гарантируют целостность. На фронтенде используется React Hook Form + Zod для валидации на клиенте с визуальной обратной связью перед отправкой на бэкенд.
 
### Q: Почему выбрали конкретные технологии?
 
**A:** 
- **Java 21:** Последняя LTS с современными фичами (виртуальные потоки, сопоставление с образцом)
- **Spring Boot 3:** Зрелая экосистема, автоконфигурация, хорошая документация
- **PostgreSQL:** Реляционная база с транзакциями ACID, продвинутые возможности (JSONB, оконные функции)
- **React + TypeScript:** Компонентная архитектура, типобезопасность, огромная экосистема
- **Vite:** Быстрая горячая замена модулей, оптимизированная сборка, современные инструменты
- **Tailwind CSS:** Быстрая разработка, консистентный дизайн, маленький бандл
- **TanStack Query:** Эффективное управление состоянием сервера с кэшированием
- **Redis:** Кэш в памяти для быстрого доступа, поддержка TTL
- **Flyway:** Версионированные миграции, отслеживание эволюции схемы
- **MapStruct:** Маппинг на этапе компиляции, типобезопасность, производительность
 
### Q: Какие паттерны используете в backend?
 
**A:** Слоистая архитектура (Контроллер → Сервис → Репозиторий), паттерн репозиторий для доступа к данным, паттерн DTO для передачи данных (сущности не возвращаются наружу), паттерн строитель для сложных объектов, паттерн стратегия для AI провайдеров (интерфейс LlmProvider), паттерн одиночка для сервисов (Spring beans по умолчанию), паттерн шаблонный метод в базовых классах.
 
### Q: Как тестируете приложение?
 
**A:** Бэкенд: юнит-тесты для сервисов на JUnit 5 + Mockito, интеграционные тесты с Testcontainers для PostgreSQL (настоящая база в Docker), тесты репозиториев с реальной базой, тесты контроллеров с MockMvc. Фронтенд: TODO — тесты компонентов с React Testing Library, тесты сервисов. Ручное тестирование с дымовыми сценариями в `docs/SMOKE_SCENARIOS.md`. Линтинг с ESLint для фронтенда.
 
### Q: Как работает интернационализация?
 
**A:** На фронтенде используется библиотека i18next. Файлы локалей в `frontend/src/i18n/locales/` для русского и английского. Компонент LanguageSwitcher для переключения языка, выбор сохраняется в localStorage. Все строки интерфейса через `t('section.key')`. На бэкенде интернационализации пока нет — все сообщения на русском, это на будущее.
 
### Q: Как оптимизируете performance?
 
**A:** Backend: Database indexes на часто используемых полях, caching с Redis для AI results, pagination для больших datasets, lazy loading для JPA associations. Frontend: Code splitting с React.lazy(), lazy loading для heavy components, TanStack Query caching, memoization (useMemo, useCallback) где нужно, image optimization, skeleton loading states.
 
### Q: Какие проблемы столкнулись при разработке?
 
**A:** 
1. **Изоляция пользователей:** Решили через SecurityContext как единственный источник правды
2. **Кэширование AI:** Redis с хешем входных данных для дедупликации
3. **Kanban перетаскивание:** dnd-kit с оптимистичными обновлениями и откатом при ошибке
4. **Синхронизация фронтенда и бэкенда:** Документация контракта как источник правды
5. **Эволюция схемы:** Версионированные миграции Flyway с обратной совместимостью
6. **Моки против реальных данных:** Переключение через переменную окружения
 
### Q: Что бы улучшили в проекте?
 
**A:** 
- Обновление токена для лучшей безопасности
- Настроить тесты на фронтенде
- Расширенная аналитика с выбором дат
- OAuth интеграция (Google, GitHub)
- Загрузка файлов для резюме и логотипов
- Email уведомления
- Лимиты на запросы к API
- Улучшить журнал изменений
 
### Q: Как работает Docker Compose setup?
 
**A:** Docker Compose запускает PostgreSQL, Redis, опционально MinIO (для файлов) и Ollama (для AI). PostgreSQL и Redis обязательны для базовой работы. MinIO для хранения файлов (на будущее), Ollama для локальной языковой модели. Бэкенд и фронтенд запускаются локально через Maven wrapper и Vite, не в Docker — так проще разрабатывать. Томы для сохранения данных (postgres_data, redis_data и т.д.). Проверки здоровья, чтобы убедиться, что сервисы готовы.
 
### Q: Как настроен CI/CD?
 
**A:** GitHub Actions: при пуше в main запускается линтинг и сборка фронтенда, а также юнит-тесты бэкенда. Сборка фронтенда проверяет, что код компилируется без ошибок. Юнит-тесты бэкенда проверяют сервисный слой. Интеграционные тесты с Testcontainers требуют Docker. Кэширование артефактов для ускорения сборок. На будущее: автоматический деплой на staging и production.
 
### Q: Как работает MapStruct?
 
**A:** MapStruct — генератор кода на этапе компиляции для маппинга между сущностями и DTO. Добавляем зависимость и процессор аннотаций в pom.xml. Создаём интерфейс с аннотацией @Mapper, MapStruct генерирует реализацию при компиляции. Используем @Mapping для кастомного маппинга полей. Преимущества: типобезопасность, производительность (без рефлексии), проверка ошибок при компиляции. Пример: `VacancyMapper` для маппинга между `VacancyEntity` и `VacancyDto`.
 
### Q: Как работает Spring Security в проекте?
 
**A:** JWT фильтр (OncePerRequestFilter) перехватывает запросы, достаёт токен из заголовка Authorization, проверяет подпись и срок действия через библиотеку jjwt, устанавливает аутентификацию в SecurityContext. Конфигурация безопасности: CSRF отключён (stateless API), настроен CORS для фронтенда, публичные endpoint (/auth/register, /auth/login, /swagger-ui/**), защищённые endpoint требуют аутентификации. Аннотации @PreAuthorize для безопасности на уровне методов.
 
### Q: Как работает pagination?
 
**A:** Backend использует Spring Data JPA Pageable interface. Controller принимает page, size, sort, direction parameters. Repository возвращает Page<T> с content, totalElements, totalPages, size, number, first, last. Frontend ожидает этот формат в PagedResponse<T>. Page is 0-based, size min 1 max 100. TanStack Query на frontend для управления pagination state.
 
### Q: Как работает React Query?
 
**A:** TanStack Query (React Query) для управления состоянием сервера. useQuery для получения данных с автоматическим кэшированием, обновлением и состояниями загрузки. useMutation для изменений данных (POST, PUT, DELETE) с оптимистичными обновлениями. QueryClient настроен с временем устаревания по умолчанию. Ключи запросов для инвалидации кэша (например, ['vacancies'] для списка вакансий). Преимущества: меньше шаблонного кода чем useState + useEffect, автоматическое кэширование, фоновое обновление, оптимистичные обновления.
 
### Q: Как работает dnd-kit для Kanban?
 
**A:** dnd-kit — современная библиотека для перетаскивания. DndContext провайдер с сенсорами (мышь, тач). Draggable компоненты для карточек, Droppable для колонок. DragOverlay для предпросмотра во время перетаскивания. useSensors для настройки. Обработчик onDragEnd для обновления статуса. Оптимистичное обновление: интерфейс меняется сразу, затем вызываем API, откат при ошибке. SortableContext для упорядочивания внутри колонок.
 
### Q: Какие database indexes созданы?
 
**A:** Индексы на внешних ключах (user_id, company_id, vacancy_id и т.д.), часто используемых полях для поиска (email, status, created_at), составные индексы для сложных запросов (user_id + is_active для резюме), уникальные индексы для бизнес-ограничений (user_id + vacancy_id для откликов). Индексы созданы в миграциях для оптимизации производительности.
 
### Q: Как работает транзакционная целостность?
 
**A:** Аннотация @Transactional на методах сервисов для управления транзакциями. Spring управляет границами транзакций. Распространение по умолчанию REQUIRED. Откат при RuntimeException. Ограничения базы данных (FK, CHECK, UNIQUE) гарантируют целостность. Миграции Flyway в отдельных транзакциях. Пул соединений через HikariCP (по умолчанию в Spring Boot).
 
### Q: Как работает logging?
 
**A:** Аннотация Lombok @Slf4j для логгера. Фасад SLF4J с реализацией Logback. Уровни логирования: ERROR для ошибок, WARN для предупреждений, INFO для важных событий, DEBUG для детальной трассировки. Чувствительные данные (пароли, токены) не логируются. Структурированное логирование можно добавить на будущее. Агрегацию логов можно сделать для продакшена.
 
### Q: Как работает environment configuration?
 
**A:** На бэкенде используется библиотека spring-dotenv для файлов .env. .env.example коммитится в Git, настоящий .env не коммитится (в .gitignore). Переменные: DB_PASSWORD, DB_USER, DB_NAME, JWT_SECRET, JWT_ACCESS_TOKEN_EXPIRATION_MS, реквизиты MINIO. На фронтенде переменные окружения Vite: VITE_API_BASE_URL, VITE_USE_MOCKS. .env.local не коммитится.
 
### Q: Как работает OpenAPI/Swagger?
 
**A:** SpringDoc OpenAPI starter для автоматической генерации документации OpenAPI из аннотаций. Аннотации @Operation, @ApiResponse на контроллерах для кастомизации. Swagger UI доступен на /swagger-ui.html. Интерактивная документация API для тестирования endpoint. Документация синхронизирована с контрактом фронтенда в `docs/FRONTEND_BACKEND_CONTRACT.md`.
 
### Q: Как работает React Hook Form + Zod?
 
**A:** React Hook Form для управления состоянием форм с минимальными перерисовками. Zod для валидации схем. @hookform/resolvers для интеграции RHF с Zod. Хук useForm с резолвером: zodResolver(schema). Ошибки валидации отображаются в интерфейсе. Обработчик onSubmit для отправки формы. Преимущества: производительность, типобезопасная валидация, чистый код.
 
### Q: Как работает i18next?
 
**A:** i18next для интернационализации. initReactI18next для интеграции с React. Файлы локалей в locales/ (ru.json, en.json). Хук useTranslation для доступа к переводам. Функция t('key') для строк переводов. Компонент LanguageSwitcher для смены языка. Предпочтение языка сохраняется в localStorage. Поддержка пространств имён для организации.
 
### Q: Какие design patterns используете в frontend?
 
**A:** Паттерн Контейнер/Презентация для компонентов, кастомные хуки для переиспользуемой логики (useAuth, useVacancies), компоненты высшего порядка (HOC) для сквозных задач, Context API для глобального состояния (AuthContext, ThemeContext), паттерн render props для гибких компонентов, составные компоненты для сложного UI (Kanban доска).
 
### Q: Как работает state management в frontend?
 
**A:** Состояние сервера: TanStack Query (React Query) для данных API с кэшированием и инвалидацией. Состояние клиента: React Context для глобального состояния (пользователь, тема). Состояние форм: React Hook Form. Состояние URL: параметры поиска React Router для фильтров. Локальное состояние: useState для состояния компонента. Redux не используем — React Query достаточно для состояния сервера.
 
### Q: Как работает error boundary в React?
 
**A:** Компонент error boundary перехватывает ошибки в дереве компонентов. Метод жизненного цикла componentDidCatch для логирования. Запасной UI для отображения при ошибке. Размещается на верхнем уровне, чтобы ловить все ошибки. Не ловит ошибки в обработчиках событий и асинхронном коде — для этого нужен try-catch и обработка ошибок в промисах.
 
### Q: Как работает code splitting?
 
**A:** React.lazy() для ленивой загрузки компонентов. Suspense для запасного UI во время загрузки. Разделение по маршрутам в конфигурации React Router. Пример: `const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))`. Уменьшает начальный размер бандла, улучшает время загрузки. Vite автоматически разделяет код на чанки.
 
### Q: Как работает Tailwind CSS?
 
**A:** CSS фреймворк с утилитарными классами. Утилитарные классы для стилей (flex, p-4, text-xl и т.д.). Конфигурация Tailwind в tailwind.config.js для кастомной темы (цвета, шрифты и т.д.). Директивы @tailwind в CSS файле. PostCSS для обработки. JIT режим для генерации только используемых классов. Кастомные компоненты в styles/ для переиспользуемых паттернов.
 
### Q: Как работает TypeScript в проекте?
 
**A:** Строгий режим включён для типобезопасности. Определения интерфейсов в types/ для типов предметной области (Vacancy, Company, Application и т.д.). Обобщённые типы для переиспользуемых компонентов. Вывод типов где возможно. Защитники типов для проверки типов во время выполнения. Пакеты @types для JavaScript библиотек. tsconfig.json для опций компилятора. Линтинг с typescript-eslint.
 
### Q: Какие основные endpoints реализованы?
 
**A:** Auth: register, login, me, forgot-password, reset-password. Vacancies: list, detail, create, update, delete, archive. Companies: list, detail, create, update, delete. Applications: board, list, detail, create, update status, update, delete. AI: analyze-vacancy, resume-match, cover-letter, interview-questions, history, history/{id}. Analytics: summary. Dashboard: summary. Settings: users/me, preferences. Notifications: list, mark read.
 
### Q: Как работает data flow в приложении?
 
**A:** Действие пользователя → Компонент фронтенда → Сервисный слой (React Query) → API клиент (axios) → Контроллер бэкенда → Сервисный слой → Репозиторий → База → Ответ обратно по цепочке → Обновление кэша React Query → Перерисовка компонента. Оптимистичные обновления: интерфейс меняется сразу, затем вызов API, откат при ошибке. Инвалидация кэша: React Query инвалидировал запросы после изменений.
 
### Q: Какие security best practices применены?
 
**A:** JWT аутентификация без состояния, хеширование паролей BCrypt, проверка владения пользователем, защита от SQL инъекций (параметризованные запросы JPA), защита от XSS (экранирование React), CSRF отключён (stateless API), конфигурация CORS, чувствительные данные в переменных окружения, файлы .env не коммитятся, валидация входных данных на обоих концах, лимиты запросов можно добавить на будущее, HTTPS можно сделать для продакшена.
 
### Q: Как работает database connection pooling?
 
**A:** HikariCP как пул соединений по умолчанию в Spring Boot. Конфигурация в application.properties: максимальный размер пула, таймаут соединения, таймаут простоя. Переиспользование соединений для производительности. Автоматическая очистка простаивающих соединений. Метрики мониторинга через Spring Actuator. Пул соединений критичен для производительности базы.
 
### Q: Как работает lazy loading в JPA?
 
**A:** Связи JPA по умолчанию загружаются лениво (@ManyToOne, @OneToMany). FetchType.LAZY для оптимизации. Проблема N+1 решается через запросы JOIN FETCH или @EntityGraph. Паттерн open session in view можно рассмотреть, но не использовали. Границы транзакций важны для ленивой загрузки вне транзакции.
 
### Q: Какие database relationship types используются?
 
**A:** @OneToOne (user ↔ user_profile), @OneToMany (user ↔ vacancies, user ↔ companies), @ManyToOne (vacancy ↔ company, application ↔ vacancy), @ManyToMany (vacancy ↔ tags через @JoinTable). Типы каскадирования: CASCADE для дочерних сущностей (DELETE), SET NULL для необязательных связей. orphanRemoval можно рассмотреть для композиции.
 
### Q: Как работает audit logging?
 
**A:** Для журналирования действий пользователей реализована полноценная система аудита с использованием Spring AOP. Создана кастомная аннотация `@Auditable(action, entityType)`. Написанный аспект перехватывает успешные вызовы критически важных методов (создание вакансий, изменение статусов, входы, AI генерации), автоматически извлекает IP-адрес запроса и `userId` текущего пользователя, сериализует контекст операции в JSONB-поле `metadata` базы данных PostgreSQL и сохраняет лог в таблицу `audit_logs`.
 
### Q: Как работает notification system?
 
**A:** Таблица `notifications` для уведомлений. Типы: INTERVIEW_REMINDER, TASK_DUE, APPLICATION_STATUS, AI_COMPLETE, SYSTEM. Каналы: IN_APP, EMAIL, TELEGRAM. Статусы: PENDING → SENT → FAILED/READ. Реализован **Strategy/Factory паттерн**: интерфейс `NotificationSender` с реализациями `EmailNotificationSender` и `TelegramNotificationSender`. `NotificationSenderFactory` выбирает провайдер по полю `notification_provider` из `PreferencesEntity` пользователя. `NotificationCreator` определяет адресат: для EMAIL — email пользователя, для TELEGRAM — `telegram_chat_id`. Привязка Telegram аккаунта: пользователь нажимает кнопку в Settings → получает deep link `https://t.me/{botUsername}?start={token}` → открывает бот → бот находит запись по UUID-токену, сохраняет `telegram_chat_id`, очищает токен. На будущее: push в реальном времени через WebSocket.
 
### Q: Какие metrics собираются в analytics?
 
**A:** Общее количество откликов, активные отклики (не отклонённые/архивные), доля интервью (интервью/отклики), доля офферов (офферы/отклики), доля ответов (ответы/отклики), среднее время до интервью (дни). Воронка по статусам откликов. График активности по неделям (отклики, интервью, офферы за неделю). Топ навыков, которых не хватает, из AI анализа.
 
### Q: Как работает prompt engineering для AI?
 
**A:** Класс PromptBuilder для построения промптов. Системный промпт для определения роли («You are a career advisor...»). Внедрение контекста (описание вакансии, текст резюме). Переменные шаблона для динамического контента. Конфигурация температуры и других параметров. Разные промпты для разных типов запросов (анализ, сравнение, сопроводительное письмо, вопросы для интервью). Итеративное улучшение для качества.
 
### Q: Как работает fallback для AI provider?
 
**A:** Интерфейс LlmProvider с реализацией OllamaLlmProvider. Fallback на заглушки, если Ollama недоступен или возвращает ошибку. Try-catch в сервисном слое. Заготовленные заглушки для разработки. Плавное ухудшение — AI функции опциональны, основная функциональность работает без AI. Конфигурация для включения/отключения AI функций.
 
### Q: Какие performance optimizations применены?
 
**A:** Database indexes на часто используемых полях, Redis caching для AI results, Pagination для больших datasets, Code splitting в frontend, Lazy loading для components, TanStack Query caching, Memoization (useMemo, useCallback), Image optimization, Skeleton loading states, Connection pooling, N+1 query prevention с JOIN FETCH, Batch operations где возможно.
 
### Q: Как работает monitoring?
 
**A:** Spring Boot Actuator для проверок здоровья и метрик. Endpoint: /actuator/health, /actuator/metrics. Метрики Prometheus можно добавить на будущее. Логирование с правильными уровнями. Фронтенд: error boundaries, отслеживание ошибок можно добавить (Sentry). Мониторинг производительности можно добавить (Lighthouse). APM можно добавить для продакшена (New Relic, Datadog).
 
### Q: Какие известные bugs/limitations есть?
 
**A:** На текущем этапе (v0.8.0-alpha) основные функциональные блоки реализованы и верифицированы вручную. Известные ограничения:
- **Файловое хранилище**: Резюме и логотипы компаний хранятся в виде ссылок (URL). Загрузка бинарных файлов напрямую в MinIO/S3 не реализована — это запланировано как следующий шаг.
- **Frontend тесты**: Покрыты базовые сервисы и утилиты (23 теста). Покрытие UI-компонентов неполное — основная верификация через ручное smoke-тестирование.
- **Интеграционные тесты**: Testcontainers-тесты требуют работающего локального Docker — в CI они стабилизированы, но локально зависят от окружения.
- **Scheduled notifications timezone**: Напоминания форматируются в Europe/Moscow. Пользовательский timezone в настройках не поддерживается — запланировано.
- **Gemini**: Gemini провайдер интегрирован, но не покрыт интеграционными тестами так же глубоко, как Ollama/OpenAI.
 
### Q: Как защищены персональные API-ключи пользователей?
 
**A:** Реализован JPA `AttributeConverter` — класс `EncryptionConverter` — на основе алгоритма **AES-256-CBC**. Поле `openAiApiKey` (и аналогичное для Gemini) в `PreferencesEntity` помечено аннотацией `@Convert(converter = EncryptionConverter.class)`. При записи в БД значение автоматически шифруется, при чтении — расшифровывается. Это прозрачно для сервисного слоя. Мастер-ключ берётся из переменной окружения `ENCRYPTION_MASTER_KEY` (16, 24 или 32 символа). При отдаче данных на фронтенд ключ маскируется в `PreferencesServiceImpl` до вида `sk-...4a2b` — реальное значение никогда не покидает сервер. Отдельно реализована защита от случайной перезаписи: если в запросе на сохранение пришла маскированная строка (содержит `...`), она игнорируется и реальный ключ в БД остаётся нетронутым.
 
### Q: Как реализован выбор AI-провайдера?
 
**A:** Применён паттерн **Factory + Strategy**. Интерфейс `LlmProvider` с четырьмя реализациями: `OllamaLlmProvider`, `OpenAiLlmProvider`, `GeminiLlmProvider` и `FallbackLlmGenerator`. Класс `LlmProviderFactory` принимает `PreferencesEntity` текущего пользователя и выбирает нужную реализацию: `LOCAL` → Ollama (URL и модель берутся из настроек пользователя, при пустых полях — дефолты `http://localhost:11434`, `llama3`), `CLOUD` → OpenAI с системным ключом из `.env`, `BRING_YOUR_OWN_KEY` → OpenAI или Gemini в зависимости от поля `customAiProvider`. Переключение работает в реальном времени без перезапуска backend — пользователь меняет режим в UI Settings, следующий AI-запрос уже идёт через новый провайдер. Если провайдер недоступен или ключ не задан, `FallbackLlmGenerator` возвращает качественный mock-ответ с флагом `isFallback=true`, который сохраняется в БД и отображается бейджем в интерфейсе.
 
### Q: Как работают scheduled уведомления?
 
**A:** Реализован `ReminderScheduler` с аннотацией `@Scheduled(cron)`, который запускается раз в час. Логика: ищет интервью и задачи в окне ближайших 24 часов через соответствующие репозитории. Флаг `reminder_sent` (boolean) в таблицах `interviews` и `tasks` защищает от повторной отправки — при первой отправке он ставится в `true`. `NotificationCreator` создаёт In-App уведомление и отправляет его через **нужный провайдер**. Для EMAIL — HTML письмо через `EmailService` (`@Async`). Для TELEGRAM — сообщение через `TelegramNotificationSender` с `telegram_chat_id` из настроек пользователя. Выбор провайдера делает `NotificationSenderFactory`. При недоступности канала — ошибка логируется (graceful degradation). Scheduler можно отключить через флаг `reminder.scheduler.enabled=false` в `application.yaml` — полезно для тестов.
 
### Q: Как реализована история статусов отклика (Timeline)?
 
**A:** При каждом изменении статуса отклика `ApplicationServiceImpl` создаёт запись в таблице `application_status_history` (миграция V23). Запись содержит: `application_id`, `status` (новый), `changed_at` (timestamp). Реализован отдельный endpoint `GET /api/applications/{id}/history`, возвращающий `List<ApplicationStatusHistoryResponse>`. На фронтенде компонент `ApplicationTimelineModal.tsx` визуализирует историю в виде вертикального timeline с локализованными названиями статусов и датами. Для корректного отображения добавлена константа `APPLICATION_STATUS_KEYS` в `utils.ts` — маппинг enum-значений на i18n-ключи — и обработка legacy-значения `FINAL` через `LEGACY_STATUS_MAP` для обратной совместимости с ранними данными.
 
### Q: Как работает deployment pipeline?
 
**A:** Сейчас: GitHub Actions для CI (lint + сборка + тесты). Ручной деплой. На будущее: автоматический деплой на staging и production, Docker образы для бэкенда и фронтенда, оркестрация Kubernetes можно рассмотреть, blue-green деплой можно рассмотреть, стратегия отката. Конфигурация для разных окружений через переменные окружения. Миграции базы применяются автоматически при старте.
 
### Q: Какие lessons learned из проекта?
 
**A:** Модульный монолит — хороший старт для портфолио, можно позже выделить в микросервисы. Документация контракта между фронтендом и бэкендом критически важна для интеграции. Изоляция пользователей должна быть enforced на всех уровнях (код, база). Кэширование значительно улучшает производительность для дорогих операций (AI). Тестирование с Testcontainers даёт уверенность во взаимодействии с базой. Типобезопасность (TypeScript, Bean Validation) предотвращает многие баги.
 
### Q: Как бы вы масштабировали приложение?
 
**A:** Ближайшее: вертикальное масштабирование (больше ресурсов), настройка пула соединений, расширение кэширования. Среднесрочное: реплики чтения для базы, CDN для статических ресурсов, балансировка нагрузки для нескольких инстансов. Долгосрочное: выделение микросервисов (AI сервис отдельно), событийная архитектура с Kafka, шардинг базы, географическое распределение. Мониторинг и наблюдаемость критичны для масштабирования.
 
---
 
## Заключение
 
CareerPilot AI — это full-stack проект, демонстрирующий понимание современных практик разработки ПО. Проект включает:
 
- **Backend:** Java 21, Spring Boot 3, PostgreSQL, Redis, Modular Monolith architecture
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Infrastructure:** Docker Compose, GitHub Actions CI
- **AI Integration:** Ollama, Redis caching, prompt engineering
- **Security:** JWT authentication, user isolation, input validation, AES-256 key encryption
- **Notifications:** In-App, Email, Telegram Bot (Strategy/Factory pattern, deep link linking, фиксы синхронизации состояния UI и включения бота)
- **Quality:** Testing, validation, error handling, code style
 
Проект готов для обсуждения на собеседовании как демонстрация технических навыков, архитектурного мышления и способности писать почти боевой код.
 