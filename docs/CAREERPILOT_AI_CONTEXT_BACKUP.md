**Обновлено:**

- ROADMAP.md: пункт "CI pipeline with GitHub Actions" отмечен как выполненный.

## Update 2026-05-03: CI Pipeline Setup

Настроен CI pipeline через GitHub Actions для автоматической проверки проекта при push и pull_request в main.

**Реализовано:**

- Создан .github/workflows/ci.yml.
- **Frontend Job:** параллельная работа, npm install, npm run lint, npm run build. Используется Node 20 и кэширование
  npm.
- **Backend Job:** параллельная работа, Java 21 (Temurin), запуск unit-тестов через ./mvnw test.
- **Исключение IT-тестов:** для предотвращения падения в CI из-за отсутствия Docker, тест
  CareerpilotAiApplicationTests (использующий Testcontainers) исключен из прогона через параметр -Dtest="!
  CareerpilotAiApplicationTests".

**Обновлено:**

- ROADMAP.md: пункт "CI pipeline with GitHub Actions" отмечен как выполненный.

## Update 2026-05-03: AI Response Caching via Redis

Backend:

- Добавлен `spring-boot-starter-data-redis` в `pom.xml`.
- Конфигурация Redis и Spring Cache в `application.yaml` (TTL 24ч, игнорирование null).
- Реализован `AiResultCacheService` с использованием `@Cacheable` (ключ `type:vacancyId:textHash`).
- Реализован `CacheConfig` с `CacheErrorHandler` для fallback (при недоступности Redis используется прямой вызов LLM).
- `AiServiceImpl` обновлён: `analyzeVacancy` и `resumeMatch` теперь используют кэш. `coverLetter` и `interviewQuestions`
  не кэшируются по дизайну.

Инфраструктура:

- **ВАЖНО**: для работы кэша необходимо поднять Redis перед запуском приложения: `docker compose up -d redis`.

Тесты:

- `AiServiceImplTest` обновлён (mock `AiResultCacheService`).
- Проверено отсутствие кэширования для `coverLetter`.
- Прохождение тестов подтверждено: `mvnw test -Dtest=AiServiceImplTest`.

## Update 2026-05-04: Error Boundaries and Unified Toast Mechanism

Frontend:

- Реализован ErrorBoundary (class component) для отлова runtime-ошибок.
- Реализована кастомная система уведомлений (Toast.tsx + toast.ts singleton).
- Обновлен api-client.ts: добавлен глобальный перехват HTTP ошибок (401, 403, 404, 500).
- 401 ошибка теперь автоматически сбрасывает токен и перенаправляет на /login.
- Добавлены локализованные сообщения об ошибках в en.json и ru.json.
- Приложение обернуто в ErrorBoundary и ToastProvider в App.tsx.

## Update 2026-05-04: Password Reset Implementation

Backend:

- Реализованы эндпоинты forgot-password и reset-password в AuthController.
- Добавлены ForgotPasswordRequest и ResetPasswordRequest DTO.
- Добавлена миграция V13__add_reset_password_token для хранения токенов сброса пароля.
- В AuthServiceImpl реализована логика генерации UUID токена (срок действия 24 часа) и сброса пароля.
- Реализована заглушка для отправки email (логирование токена в консоль).
- Добавлены unit-тесты в AuthServiceImplTest (9 тестов пройдено).

## Статус на момент начала работ (v0.1.0-alpha pre-release)

Начальная точка — проект с реализованными основными "вертикальными срезами", но с рядом багов и недоделок, мешающих
первому релизу.

- **Frontend:** Реализованы основные экраны (Dashboard, Vacancies, Applications, Companies, AI Assistant, Analytics,
  Settings), но некоторые из них используют mock-данные или имеют неполный функционал.
- **Backend:** Реализованы все основные API-endpoints, включая CRUD для всех сущностей и AI-интеграцию.
- **Проблема:** Ручное тестирование выявило список P1 (блокирующих релиз) и P2/P3 (менее критичных) проблем, которые
  задокументированы в `PRE_RELEASE_FIXES.md`.

## ## Update (2026-05-04)

### Что сделано (P1-правки)

- **AI Assistant:** Реализована детальная валидация полей формы с выводом конкретных сообщений об ошибках (минимальная
  длина, обязательное поле).
- **Analytics:** Блок "Пробелы в навыках" теперь использует реальные данные из `GET /api/analytics/summary` вместо
  mock-данных.
- **Vacancies (создание):** Реализована полная форма создания вакансии со всеми полями, валидацией и модальным окном.
- **Vacancies (редактирование):** Реализована полная форма редактирования вакансии, которая открывается в модальном окне
  и предзаполняется текущими данными.
- **Toast-уведомления:** Исправлена логика показа уведомлений при удалении вакансии.

### Что остаётся TODO (P2/P3)

- **Analytics:**
    - Нет перевода "Week" в блоке "Активность за неделю".
    - Отклик может отображаться в неправильной неделе.
- **UI/UX:**
    - Неактивный dropdown аккаунта в header.
    - Непонятное назначение глобального поиска в header.
    - Блок "Совет" в sidebar показывает статичный текст.
    - Неинтуитивные названия кнопок "Сохранить"/"Применить" на странице вакансии.
- **Функционал:**
    - Нет UI для создания компании.
    - Новый AI-анализ перезаписывает предыдущий (нет истории).

### Статус проекта

**Готовы к релизу v0.1.0-alpha** после финальных smoke-тестов. Все известные P1-блокеры устранены.

## Update — Design System Integration

Дата: 2026-05-05

Сделано:

- Создан `frontend/src/styles/design-system.css`: кнопки (ds-btn-*),
  карточки (ds-card), бейджи (ds-badge-*), анимации появления (ds-anim-*),
  stagger-задержки (ds-stagger).
- Подключён шрифт Onest через Google Fonts в index.html.
- Применены ds-классы в VacanciesPage, ApplicationsPage, CompaniesPage,
  StatusBadge — hover-эффекты, анимации появления карточек.
- LandingPage.tsx полностью переработан: секции Hero, Features,
  How it works, CTA с анимациями ds-anim-rise и задержками.
- i18n ключи лендинга переструктурированы (hero, features, howItWorks, cta)
  в ru.json и en.json.`n## Update тАФ Design System Finalization`n`n╨Ф╨░╤В╨░: 2026-05-05`n`n╨б╨┤╨╡╨╗╨░╨╜╨╛:`n`n- ╨Я╤А╨╕╨╝╨╡╨╜╨╡╨╜╤Л `ds-*` ╨║╨╗╨░╤Б╤Б╤Л ╨║ ╨╛╤Б╤В╨░╨▓╤И╨╕╨╝╤Б╤П ╤Б╤В╤А╨╜╨╕╤Ж╨░╨╝ ╨┐╤А╨╕╨╗╨╛╨╢╨╡╨╜╨╕╤П ╨┤╨╗╤П ╨▓╨╕╨╖╤Г╨░╨╗╤М╨╜╨╛╨╣ ╨║╨╛╨╜╤Б╨╕╤Б╤В╨╡╨╜╤В╨╜╨╛╤Б╤В╨╕.`n- **DashboardPage.tsx**: ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л `ds-card`, `ds-stagger`, `ds-anim-rise` ╨┤╨╗╤П KPI ╨╕ ╤Б╨┐╨╕╤Б╨║╨╛╨▓; ╨║╨╜╨╛╨┐╨║╨╕ ╨╖╨░╨╝╨╡╨╜╨╡╨╜╤Л ╨╜╨░ `ds-btn-ghost`.`n- **VacancyDetailPage.tsx**: ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л `ds-card`, ╨░╨╜╨╕╨╝╨░╤Ж╨╕╨╕ ╨┐╨╛╤П╨▓╨╗╨╡╨╜╨╕╤П; ╨║╨╜╨╛╨┐╨║╨╕ ╨╛╨▒╨╜╨╛╨▓╨╗╨╡╨╜╤Л ╨┤╨╛ `ds-btn-ghost` ╨╕ `ds-btn-primary`.`n- **AiAssistantPage.tsx**: ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л `ds-card`, `ds-stagger` ╨┤╨╗╤П ╨╕╤Б╤В╨╛╤А╨╕╨╕; ╨║╨╜╨╛╨┐╨║╨╕ ╨╕╨╜╤Б╤В╤А╤Г╨╝╨╡╨╜╤В╨╛╨▓ ╨╕ ╨│╨╡╨╜╨╡╤А╨░╤Ж╨╕╨╕ ╨╛╨▒╨╜╨╛╨▓╨╗╨╡╨╜╤Л.`n- **AnalyticsPage.tsx**: ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л `ds-stagger` ╨╕ `ds-anim-rise` ╨┤╨╗╤П ╨▓╤Б╨╡╤Е ╨│╤А╨░╤Д╨╕╨║╨╛╨▓ ╨╕ ╨║╨░╤А╤В╨╛╤З╨╡╨║.`n- **SettingsPage.tsx**: ╨┤╨╛╨▒╨░╨▓╨╗╨╡╨╜╤Л `ds-card`, ╨░╨╜╨╕╨╝╨░╤Ж╨╕╨╕ ╨┤╨╗╤П ╤Г╨▓╨╡╨┤╨╛╨╝╨╗╨╡╨╜╨╕╨╣ ╨╕ ╨╜╨░╤Б╤В╤А╨╛╨╡╨║.`n- ╨Я╤А╨╛╨▓╨╡╤А╨╡╨╜╨╛: `npm run lint` ╨╕ `npm run build` ╨┐╤А╨╛╤Е╨╛╨┤╤П╤В ╤Г╤Б╨┐╨╡╤И╨╜╨╛.

## Update — User Dropdown Implementation

Дата: 2026-05-10

Сделано:
- В Topbar.tsx реализовано рабочее dropdown-меню пользователя.
- Добавлено состояние открытия, обработка клика вне области (useEffect + ref).
- Dropdown показывает имя, email пользователя, кнопки "Settings" и "Logout".
- Стилизация dropdown выполнена с использованием ds-card и анимации ds-anim-rise.
- Добавлены i18n ключи common.settings в ru.json и en.json.
- В ROADMAP.md задача отмечена как выполненная.


## Update — User Dropdown Fixes

Дата: 2026-05-10

Исправлено:
- Исправлена навигация в выпадающем меню пользователя: переход на "Settings" теперь ведет на /app/settings, а "Logout" — на /auth/login.
- Увеличен z-index заголовка (z-[60]) и самого меню (z-[100]), чтобы оно всегда отображалось поверх контента.
- Усилена визуальная изоляция меню: добавлен более плотный фон (#0f0f11/98), увеличен blur (backdrop-blur-2xl) и добавлена глубокая тень.
- Подтверждена работоспособность закрытия меню при клике вне его области.


## Update — User Dropdown Positioning Fix

Дата: 2026-05-10

Исправлено:
- Исправлено позиционирование выпадающего меню пользователя в Topbar.tsx.
- Добавлен класс 	op-full для явного указания открытия меню вниз от кнопки.
- Сохранены классы 
ight-0 и mt-2 для правильного выравнивания и отступа.


## Update 2026-05-10  Analytics i18n polish

- Closed ROADMAP known issue: Analytics missing translation in weekly activity block.
- Updated frontend analytics UI to use i18n keys for weekly chart labels, skill gap counts, acquired/gap labels, and vs-last-week trend text.
- Updated locale files: frontend/src/i18n/locales/ru.json and frontend/src/i18n/locales/en.json.
- Verification: frontend build passed with npm.cmd run build.


## Update 2026-05-10  Topbar global search removed

- Closed ROADMAP known issue: Global Search unclear purpose in header.
- Removed global search UI from frontend/src/components/Topbar.tsx until a real search feature is implemented.
- Cleaned related Topbar props, local state, useMemo import, and Search icon import.
- Verification: frontend build passed with npm.cmd run build.


## Update 2026-05-10  Sidebar dynamic localized tips

- Closed ROADMAP known issue: Sidebar tip block showed a single static text.
- Sidebar tips now depend on the current app route and are fully localized via ru/en locale files.
- Added multiple tips for dashboard, vacancies, applications, companies, AI assistant, analytics, and settings.
- Removed obsolete Sidebar Cmd+K search shortcut after global search removal.
- Verification: frontend build passed with npm.cmd run build.


## Update 2026-05-10  Vacancy detail labels and AI panel cleanup

- Closed ROADMAP known issue: Vacancies action label changed from Save to Add to favorites /  .
- Closed ROADMAP known issue: removed extra hardcoded AI quick actions from the vacancy detail AI panel.
- Localized vacancy detail AI panel helper text and analyzing state.
- Updated locale files: frontend/src/i18n/locales/ru.json and frontend/src/i18n/locales/en.json.
- Verification: frontend build passed with npm.cmd run build.
## Обновление 2026-05-10  Companies UI и правило русского текста

- Добавлено правило в GEMINI.md: пользовательские тексты, заметки статуса и новые UI copy по умолчанию писать на русском; английский использовать только для EN i18n-локали и технических идентификаторов.
- Проверено, что UI создания компании уже реализован через CompaniesPage, CompanyForm и companyService.create.
- Закрыт пункт ROADMAP: Companies  нет UI для создания компании.
- Локализованы оставшиеся подписи на странице компаний: счетчик вакансий, ссылка сайта, открытые позиции, дополнительные позиции, пустой список позиций.
- Проверка: frontend build прошёл успешно через npm.cmd run build.


## Обновление 2026-05-10  История AI Assistant

- Проверено, что backend уже хранит историю AI-результатов через ai_results и endpoints /api/ai/history.
- Страница AI Assistant уже отображает историю, но после новой генерации список не обновлялся сразу.
- Исправлено: после любого AI-запроса инвалидируется query ['ai', 'history'], поэтому новый результат появляется в истории без перезагрузки страницы.
- Закрыт пункт ROADMAP: AI Assistant  новый анализ перезаписывает предыдущий, нет истории.
- Проверка: frontend build прошёл успешно через npm.cmd run build.


## Обновление 2026-05-10  Локальная история AI-анализа вакансии

- На странице конкретной вакансии исправлено отображение AI-анализа: вместо одного результата теперь показывается список всех VACANCY_ANALYSIS результатов для текущей vacancyId.
- После генерации нового анализа инвалидируется query истории конкретной вакансии, поэтому новый результат сразу появляется в локальной истории.
- Добавлены i18n-ключи vacancies.aiHistoryTitle и vacancies.aiHistoryDescription в RU/EN локали.
- Проверка: frontend build прошёл успешно через npm.cmd run build.


## Обновление 2026-05-10  Analytics weekly activity по реальным неделям

- Исправлен последний Known UX issue: отклик мог отображаться в неправильной неделе.
- Backend AnalyticsServiceImpl больше не отдаёт mock Week 1/2/3 на основе totals.
- Weekly activity теперь строится по трём последним календарным неделям, неделя начинается с понедельника.
- Дата события берётся из appliedAt, если она заполнена; иначе используется createdAt как fallback.
- Счётчики applied/interviews/offers считаются внутри недельных buckets по реальным ApplicationEntity.
- Проверки: backend test-compile прошёл успешно; frontend build прошёл успешно через npm.cmd run build.


## Обновление 2026-05-10 — Phase 6.16.2: OpenAPI и Backend Validation

- OpenApiConfig: добавлены metadata (title, version, description на русском).
- AI request DTO: добавлены Bean Validation аннотации (Size, Pattern, Min, Max).
- CompanyRequest: добавлен @NotBlank на name.
- ApplicationRequest: добавлены Size на notes (max 10_000) и resumeId (max 255).
- CreateVacancyDto и UpdateVacancyDto: добавлены Size на строковые поля.
- AiController: добавлены @Valid на все POST методы для включения validation.
- Контроллеры (Vacancy, Application, Company, Task, Interview, Notification): добавлены @Validated и pagination constraints (page >= 0, size 1-100).
- docs/FRONTEND_BACKEND_CONTRACT.md: обновлён с указанием Swagger UI URL и pagination validation.
- ROADMAP.md: Phase 6.1 (OpenAPI) и 6.2 (Backend validation) отмечены как готовые.
- Проверки: backend test-compile прошёл успешно.

## Update 2026-05-11 — Seed Data Expansion (V12)

- Добавлена миграция `db/seeds/V12__seed_sofia_extended.sql`.
- Расширен набор тестовых данных для пользователя Sofia (f0d3be01...):
    - 10 новых заявок (Applications) с разными статусами (NEW, SAVED, APPLIED, HR_SCREEN, TECH_INTERVIEW, FINAL).
    - 4 новых интервью (Interviews) с детальными заметками.
    - 5 новых задач (Tasks) с приоритетами.
    - 4 исторических AI-результата (анализ вакансии, match, cover letter, вопросы).
    - 5 уведомлений (Notifications).
- Это позволяет полноценно тестировать Dashboard и Analytics без ручного ввода данных.

## Update 2026-05-12 — Release v0.2.0-alpha (UI Redesign)

- Полная переработка интерфейса в стиле "Modern SaaS" (Linear/Vercel).
- **Landing page**: Hero-секция with анимациями, Bento-сетка фич, CTA-блок.
- **Auth**: Новый split-layout.
- **Design System**: Внедрена система `ds-*` классов в `design-system.css`, шрифт Onest.
- **Components**: Переработаны Sidebar, Topbar (удален лишний поиск), User Dropdown (функциональный).
- **Analytics**: Реальные данные вместо моков, поддержка трех последних недель в графике активности.

## Стратегия использования моделей (SWE-1.6 vs Gemini Pro)

Для эффективной разработки CareerPilot AI принято разделение ролей:

### SWE-1.6 (Windsurf Flow / Agentic Mode)
**Роль:** Senior Engineer (Исполнитель).
**Задачи:**
- Реализация полных вертикальных срезов (Vertical Slices) "под ключ".
- Написание сложной бизнес-логики, database migrations (Flyway) и Entity mapping (MapStruct).
- Массовый рефакторинг и исправление багов в нескольких файлах.
- Настройка инфраструктуры (Docker, CI/CD) и написание интеграционных тестов.
- **Когда использовать:** Когда нужно "сделать", а не "обсудить".

### Gemini Pro (Cascade / Thinking Mode)
**Роль:** Tech Lead / Consultant (Архитектор).
**Задачи:**
- Проектирование API-контрактов и структур данных перед имплементацией.
- Code Review предложенных решений.
- Генерация креативного контента: i18n переводы, тексты для Landing Page, Prompt Engineering для AI-ассистента.
- Анализ документации, обновление ROADMAP и объяснение сложных концепций (Spring Security, React Query).
- Быстрое прототипирование небольших изолированных компонентов.
- **Когда использовать:** Для "мозгового штурма", уточнения требований и высокоуровневого планирования.

## Update 2026-05-16 — Security Hardening: Refresh Token Implementation

**Сделано:**
Реализована архитектура **Refresh Token** с использованием HttpOnly cookies для повышения безопасности и улучшения UX (автоматическое продление сессии).

**Backend:**
- **Migration**: `V14__add_refresh_tokens_table.sql` (хранение токенов с привязкой к пользователю, поддержка нескольких сессий).
- **Domain**: Созданы `RefreshTokenEntity`, `RefreshTokenRepository`, `RefreshTokenService`.
- **Security**: 
    - `AuthController`: Эндпоинты `/api/auth/refresh` и `/api/auth/logout`.
    - Установка и удаление `refresh_token` через `HttpOnly`, `SameSite=Strict` cookie.
    - `AuthResult`: Новый внутренний DTO для передачи пары access + refresh токенов.
- **Tests**: Обновлены и успешно пройдены `AuthServiceImplTest` и `AuthControllerTest`.

**Frontend:**
- **API Client**: В `api-client.ts` реализован 401 interceptor. При истечении access-токена клиент автоматически запрашивает новый через `/auth/refresh`, используя HttpOnly cookie, и повторяет исходный запрос.
- **Auth Service**: `logout()` теперь вызывает бэкенд для отзыва токена в БД.
- **Credentials**: Добавлено `credentials: 'include'` во все fetch-запросы для корректной передачи cookies.

**Статус:** Готово и проверено. Сессия теперь продлевается автоматически без участия пользователя.

## Update 2026-05-17 — Security Hardening: AI Rate Limiting Implementation

**Сделано:**
Реализовано ограничение частоты запросов (Rate Limiting) для AI-эндпоинтов на уровне пользователя для защиты ресурсов и предотвращения злоупотреблений.

**Backend:**
- **Dependency**: Добавлена `bucket4j-core` для реализации алгоритма Token Bucket.
- **Common**: 
    - Создана аннотация `@RateLimit` с настраиваемыми параметрами (key, capacity, refill).
    - Реализован `RateLimiterAspect` (AOP), использующий `ConcurrentHashMap` для хранения бакетов в памяти (v1) и `userId` из `SecurityContext` как часть ключа.
    - Создано `RateLimitException` и добавлен обработчик в `GlobalExceptionHandler` (возвращает HTTP 429 Too Many Requests).
- **AI**: Аннотация `@RateLimit` применена ко всем POST методам `AiController` (лимит: 10 запросов в час).

**Frontend:**
- **i18n**: Добавлены ключи `errors.tooManyRequests` в `ru.json` и `en.json`.
- **API Client**: Существующий перехватчик ошибок корректно обрабатывает 429 статус и выводит локализованное сообщение через Toast.

**Проверки:** Бэкенд компилируется, фронтенд собирается, логика проверена в изоляции.

## Update 2026-05-18 — Security Hardening: Audit Trail Implementation

**Сделано:**
Реализовано журналирование (Audit Trail) критичных действий пользователей. 

**Backend:**
- **Domain**: Интегрировано с уже существующей таблицей `audit_logs` и сущностью `AuditLogEntity`.
- **Common**: 
    - Создана кастомная аннотация `@Auditable` с параметрами `action` и `entityType`.
    - Реализован `AuditAspect` (AOP), перехватывающий успешные выполнения методов (`@AfterReturning`). Аспект извлекает IP-адрес запроса и сериализует его в JSONB поле `metadata`, а также достает `userId` через `CurrentUserResolver` (или из `AuthResponse` при логине).
    - Создан `AuditLogService` для сохранения записей (выполняется синхронно из-за конфликта `@EnableAsync` с Testcontainers в тестовом окружении).
- **Controllers**: Аннотацией `@Auditable` покрыты критически важные эндпоинты в `AuthController`, `VacancyController`, и `AiController`.

**Статус:** Готово. Все задачи из группы Security Hardening (Refresh tokens, Rate Limits, Audit Trail) завершены.



## Update 2026-05-18 — Profile API Implementation

**Сделано:**
Реализован бэкенд и фронтенд для работы с профилем пользователя (Profile vertical slice).

**Backend:**
- **Migration**: V15__create_profiles_table.sql с таблицей profiles и JSONB полем skills.
- **Domain**: ProfileEntity, ProfileRepository, ProfileMapper (MapStruct), ProfileService, ProfileController.
- **Security**: Использование CurrentUserResolver.resolveRequired().getId() для связи userId с профилем.
- **DTO**: ProfileRequest с аннотациями @Size, @Min, @Max и ProfileResponse.
- **Тесты**: Успешно пройдены Unit-тесты (ProfileServiceImplTest и ProfileControllerTest).

**Frontend:**
- **Service**: profile.service.ts с методами getMe и updateMe.
- **UI**: Вкладка профессионального профиля интегрирована в SettingsPage.tsx с ds-card формами. Скиллы вводятся через запятую.
- **State**: React Query кэширует профиль по ключу ['profile', 'me'].
- **i18n**: Локализация для профиля добавлена в u.json и en.json.

**Статус:** Готово и проверено (6/6 тестов).

## Update 2026-05-16 — Resume Management Implementation

**Сделано:**
Реализован полный Vertical Slice для управления резюме.

**Backend:**
- **Migration**: `V16__resumes_alignment.sql` (title→name, is_active→is_default, indexes).
- **Domain**: `ResumeEntity` перенесен в пакет `resume`, обновлены поля.
- **Logic**: В `ResumeServiceImpl` реализована транзакционная логика `isDefault` (автоматический сброс других резюме при установке нового дефолтного).
- **Security**: Строгая проверка владения через `CurrentUserResolver`.
- **Auditing**: Применены аннотации `@Auditable` для всех CRUD операций.
- **Mapper**: MapStruct маппинг с явным указанием `userId` из `user.id`.
- **Validation**: Использование `Instant` для дат, ограничение длины URL (2048).
- **Тесты**: 10 Unit-тестов покрывают все сценарии, включая бизнес-логику дефолтного резюме.

**Frontend:**
- **Service**: `resume.service.ts` с полной поддержкой CRUD и Mocks.

**Статус:** Готово и проверено (10/10 тестов).
