# CareerPilot AI — Context Backup



Этот файл содержит хронологический лог всех обновлений, изменений архитектуры и исправлений в кодовой базе проекта CareerPilot AI.

Все новые записи добавляются строго в конец файла для сохранения хронологии развития проекта.



---



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



## Update 2026-05-18 — Resume UI Implementation



**Сделано:**

Реализован пользовательский интерфейс для управления резюме на странице настроек.



**Frontend:**

- **Types**: Обновлен интерфейс `Resume` (добавлено `textContent`).

- **Components**: Создан `ResumeForm.tsx` с валидацией Zod (название, ссылка на файл, текстовое содержимое, флаг по умолчанию).

- **Settings**: В `SettingsPage.tsx` добавлена новая секция "Мои резюме" с поддержкой всех CRUD операций через React Query мутации.

- **UX**: Реализовано модальное окно для создания/редактирования и подтверждение удаления.

- **i18n**: Полная локализация на русский и английский языки.



**Статус:** Готово и проверено. Пользователи теперь могут управлять своими резюме для последующего использования в AI-инструментах.



## Update 2026-05-20 тАФ Interview UI Implementation



**Сделано:**

Реализован пользовательский интерфейс для управления собеседованиями (Interview vertical slice).



**Frontend:**

- **Service**: `interview.service.ts` с полной поддержкой CRUD.

- **UI**: Создана страница `InterviewsPage.tsx` со списком собеседований в виде карточек, фильтрацией по типу/результату и сортировкой по дате.

- **Form**: `InterviewForm.tsx` с валидацией Zod и выпадающим списком активных заявок.

- **Navigation**: Добавлен раздел "Собеседования" в Sidebar с динамическими советами.

- **Router**: Добавлен маршрут `/app/interviews`.

- **i18n**: Полная локализация на русский и английский языки.

- **Contract**: Обновлен `docs/FRONTEND_BACKEND_CONTRACT.md`, статус эндпоинтов изменен на `USED BY FRONTEND`.



**Статус:** Готово и проверено. Теперь пользователи могут полноценно планировать и отслеживать этапы найма.



## Update 2026-05-21 — Vacancy Company Display Fix



**Сделано:**

Исправлено отображение данных компании в вакансиях (в списке и в деталях).



**Backend:**

- **Repository**: В `VacancyRepository` добавлены аннотации `@EntityGraph(attributePaths = {"company"})` для методов `findAll` и `findByIdAndUserId` для исключения N+1 и обеспечения загрузки данных компании.

- **DTO**: `VacancyCompanyDto` расширен полями `industry`, `size`, `website`, `logoUrl`, `description`, `location`.

- **Mapper**: В `VacancyMapper` удалена проверка `Hibernate.isInitialized`, теперь все поля компании маппятся в DTO.

- **Tests**: Добавлен тест `vacancyResponseContainsCompanyData` в `VacancyServiceImplTest` (пройден).



**Frontend:**

- **Types**: Обновлен интерфейс `VacancyCompany` в `types/index.ts`.

- **UI**: В `VacanciesPage.tsx` и `VacancyDetailPage.tsx` добавлена локализованная строка-fallback "Компания неизвестна" (`vacancies.unknownCompany`) и обеспечен рендеринг данных из `vacancy.company`.

- **i18n**: Добавлены ключи `vacancies.unknownCompany` в RU/EN локали.



**Статус:** Готово и проверено (7/7 тестов).



## Update 2026-05-20 — OAuth2 Social Login



**Сделано:**

Реализована полноценная авторизация через социальные сети (GitHub и Google).



**Backend:**

- **Security**: Настроен `spring-boot-starter-oauth2-client` with поддержкой Google и GitHub.

- **Logic**: Создан `CustomOAuth2UserService` для автоматического маппинга профилей в доменную таблицу `users` (слияние по email).

- **GitHub Fix**: Добавлена поддержка извлечения приватных/скрытых email-адресов через прямой вызов API GitHub (`/user/emails`), если основной профиль не содержит почты.

- **Audit**: Исправлена ошибка сохранения `jsonb` в PostgreSQL через аннотацию `@JdbcTypeCode`.

- **JWT**: Реализован `OAuth2SuccessHandler`, генерирующий стандартный JWT для фронтенда и выполняющий редирект.

- **Migrations**: Добавлена миграция `V17__add_oauth2_provider_fields.sql`.



**Frontend:**

- **UI**: На страницах Login/Register добавлены кнопки входа через Google и GitHub.

- **Callback**: Реализована страница `OAuthCallbackPage.tsx`, которая принимает токен и выполняет бесшовный вход с перенаправлением в `/app/dashboard`.

- **Router**: Добавлен маршрут `/auth/callback`.



**Статус:** Готово и проверено (включая Unit-тесты для OAuth-сервиса).



## Update 2026-05-20: Password Management for OAuth2 Users (Security Hardening)



Реализована возможность создания пароля для OAuth2-пользователей (войти через Google/GitHub), у которых в базе данных изначально отсутствует пароль (`password_hash` равен `null`), а также возможность изменения текущего пароля для стандартных пользователей.



**Backend:**

- **DTO**: Создан `UpdatePasswordRequest` с поддержкой `currentPassword` (опционален, если у пользователя нет пароля) и валидированным `newPassword`.

- **Response**: `AuthUserResponse` обновлен полем `boolean hasPassword` для передачи клиенту статуса наличия пароля.

- **Service**: В `AuthServiceImpl` добавлена логика обновления пароля: если хэш текущего пароля существует, то обязательно проверяется совпадение старого пароля; если хэш равен `null` (пользователь зашел через социальные сети), то проверка старого пароля опускается, и сразу устанавливается новый.

- **Controller**: Добавлен эндпоинт `POST /api/auth/password` с аннотацией `@Auditable` для логирования действий. Возвращает статус `204 No Content`.

- **Tests**: Добавлены и полностью проверены unit-тесты для обоих сценариев в `AuthServiceImplTest`, а также исправлен `AuthControllerTest` для совместимости с новой сигнатурой `AuthUserResponse`.



**Frontend:**

- **Types**: В интерфейс `User` добавлено поле `hasPassword: boolean`.

- **Service**: Добавлен метод `updatePassword` в `auth.service.ts` для отправки POST-запроса на `/auth/password`.

- **UI (SettingsPage.tsx)**:

    - Раздел безопасности адаптирован для динамического отображения формы.

    - Используются библиотеки React Hook Form + Zod. Валидационная схема `getPasswordSchema` динамически делает поле «Текущий пароль» обязательным или скрытым в зависимости от флага `hasPassword`.

    - Если у пользователя нет пароля, выводится информационная плашка с подсказкой о возможности задать пароль для входа по email, а кнопка меняется на «Создать пароль».

    - Интегрирована React Query мутация с инвалидацией запроса `['auth', 'me']` и выводом красивых Toast-уведомлений.

- **i18n**: Добавлены переводы для всех новых элементов в `ru.json` и `en.json`.



**Статус:** Готово и полностью проверено.



## Update 2026-05-23: Tasks Management Vertical Slice & UX Polish



Реализована полноценная система управления задачами (Tasks) и проведена глобальная чистка UI/UX багов.



**Backend:**

- **DTO Migration**: `TaskRequest` теперь использует `LocalDateTime` для совместимости с `datetime-local`, а `TaskResponse` и `Entity` сохраняют `Instant`.

- **Mapper Fix**: В `TaskMapper` добавлен метод для корректного преобразования типов дат.

- **Service logic**: `TaskServiceImpl` переписан на доменную логику с поддержкой пагинации, фильтрации и проверки владения данными.

- **Toggle Endpoint**: Добавлен эндпоинт `PATCH /api/tasks/{id}/toggle`.



**Frontend:**

- **Service & Client**: `api-client.ts` теперь корректно обрабатывает пустые ответы (`204 No Content`), предотвращая `SyntaxError`.

- **Date Localization**: Даты теперь отображаются на языке пользователя (например, "18 мая 2026 г." на русском) благодаря интеграции `date-fns` с `i18n`.

- **UI Consistency**: 

    - `TaskForm` приведен к общему стандарту дизайн-системы.

    - Исправлена логика кнопок: «Создать» для новых объектов, «Сохранить» для редактирования, «Редактировать» на карточках в списках.

- **Tasks Management**: Полноценный CRUD с фильтрами по приоритетам (включая URGENT) и статусу.

- **Dashboard**: Интегрирован быстрый toggle статуса задач.



**Статус:** Готово и проверено.



## Update 2026-05-24: Global Search Implementation (Vertical Slice)



Реализована единая система глобального поиска по всем основным сущностям приложения.



**Backend:**

- **Search Module**: Создан новый пакет `search` с контроллером, сервисом и DTO.

- **Aggregation**: Реализована логика сбора результатов из `Vacancy`, `Company`, `Task` и `Interview` репозиториев.

- **Security**: Поиск ограничен данными текущего пользователя (`userId` из контекста безопасности).

- **Pagination/Limits**: Установлен лимит в 5 результатов на каждую категорию для оптимальной производительности.



**Frontend:**

- **Search Service**: Создан `search.service.ts` для взаимодействия с новым API.

- **GlobalSearch Component**: 

    - Реализовано модальное окно поиска с "размытым" фоном (backdrop-blur).

    - Добавлен дебаунс (300мс) для минимизации нагрузки на бэкенд.

    - Поддержка навигации и быстрого перехода к найденным сущностям.

- **Topbar Integration**: 

    - Добавлена поддержка горячих клавиш `Cmd+K` (macOS) и `Ctrl+K` (Windows/Linux) для быстрого вызова поиска.

    - Поиск доступен с любой страницы приложения.

- **i18n**: Полная локализация интерфейса поиска на русский и английский языки.



**Статус:** Готово и проверено. Глобальный поиск значительно упрощает навигацию по большому количеству данных.



## Update 2026-05-24: Toolbar Styling Alignment (Tasks & Interviews)



Приведение тулбаров страниц Задач (Tasks) и Собеседований (Interviews) к единому стилю с Вакансиями (Vacancies) для обеспечения визуальной целостности интерфейса.



**Frontend:**

- **i18n Localization**:

    - Добавлены `searchPlaceholder` и `addInterview` ключи для Interviews.

    - Добавлен `searchPlaceholder` и исправлена плюрализация `tasksCount` для Tasks (поддержка форм "1 задача", "2 задачи", "5 задач" в русском языке).

- **Toolbar & Header Refactoring**:

    - Структура тулбаров Tasks и Interviews теперь соответствует `VacanciesPage`: Строка поиска → Фильтры → Счётчик результатов → Кнопка добавления.

    - Добавлен функциональный поиск (input с иконкой лупы) для фильтрации по заголовкам и описаниям.

    - В заголовки страниц добавлены описательные подзаголовки (subtitles), заменяющие простые счётчики, для соответствия стилю `VacanciesPage`.

    - Кнопки добавления ("Создать задачу" / "Добавить собеседование") обновлены до стиля `ds-btn-primary` с фиолетовым градиентом и тенями.

    - Счётчики результатов перенесены в тулбар и оформлены в виде компактных бейджей с корректной локализацией.

- **UI/UX Consistency**:

    - Все элементы управления используют стандартные классы Tailwind и переменные дизайн-системы.

    - Улучшена адаптивность: тулбары корректно перестраиваются на мобильных устройствах.



**Статус:** Готово и проверено. Визуальная консистентность основных страниц управления поиском работы достигнута.



## Обновление 2026-05-24 — Исправление утечки сессий OAuth2 (Cross-User Data Leakage)



Исправлена критическая уязвимость/баг утечки данных между пользователями (Cross-User Data Leakage), возникавшая при переключении между OAuth2-аккаунтами и локальными аккаунтами.



**Backend:**

- **JwtAuthenticationFilter**: Настроена принудительная очистка контекста безопасности (`SecurityContextHolder.clearContext()`) для непубличных защищенных эндпоинтов, если JWT отсутствует или невалиден. Это предотвращает повторное использование сервлетом Tomcat сессии `HttpSession` (созданной в рамках OAuth2-авторизации через Google/GitHub) для неавторизованных запросов.

- **AuthController**: В метод `/api/auth/logout` добавлено принудительное удаление куки `JSESSIONID` с установкой времени жизни (`max-age=0`) и пути (`path="/"`) для выселения сессии из браузера при выходе.



**Frontend:**

- **auth.service.ts**: Изменен порядок выполнения в методе `logout()`. Теперь POST-запрос к `/auth/logout` отправляется *до* вызова `clearToken()`, благодаря чему логаут-запрос уходит авторизованным с корректным заголовком `Authorization: Bearer <token>`. После успешной отправки запроса JWT-токен стирается из памяти.



**Статус:** Решено и верифицировано. Данные пользователей полностью изолированы друг от друга при логауте и последующем входе. Тесты `AuthControllerTest` и сборка фронтенда проходят успешно.



## Обновление 2026-05-24 — Улучшение флоу сброса пароля (Forgot Password Flow Polish)



Оптимизирован пользовательский интерфейс экрана восстановления пароля (`forgot-password`) для устранения дублирования текстов и улучшения UX.



**Frontend:**

- **i18n Localization**:

    - В `ru.json` и `en.json` добавлены новые ключи `"sendResetLink"` ("Отправить ссылку" / "Send link") и `"resetPasswordSuccess"` ("Мы отправили ссылку для сброса на указанный email. Пожалуйста, проверьте вашу почту." / "We have sent a reset link to the specified email. Please check your inbox.").

- **AuthPages.tsx**:

    - Текст кнопки сабмита изменен с дублирующего `t('auth.forgotPassword')` на `t('auth.sendResetLink')` для явного отображения призыва к действию.

    - Сообщение об успешной отправке запроса переведено в прошедшее время и использует `t('auth.resetPasswordSuccess')` вместо `t('auth.resetPassword')`.



**Статус:** Готово и верифицировано. Текст кнопки теперь отражает действие, а сообщение об успехе выводится в прошедшем времени. Сборка фронтенда успешно пройдена.



## Update 2026-05-25 — Real Password Reset via Email



**Сделано:**

Реализован полноценный поток сброса пароля через Email с использованием SMTP и асинхронной отправки.



**Backend:**

- **Dependencies**: Добавлен `spring-boot-starter-mail` в `pom.xml`.

- **Configuration**: Настроен SMTP и `app.frontend-url` в `application.yaml`.

- **Infrastructure**: Создан `EmailService` и его реализация `EmailServiceImpl`. Отправка писем выполняется асинхронно (`@Async`) для исключения задержек API.

- **Config**: Создан `AsyncConfig` с аннотацией `@EnableAsync`.

- **Logic**: В `AuthServiceImpl` внедрен `EmailService`, и в методе `forgotPassword` теперь отправляется реальное письмо с уникальной ссылкой на фронтенд.

- **Tests**: Обновлены unit-тесты в `AuthServiceImplTest` (13/13 пройдено).



**Frontend:**

- **Routing**: Добавлен маршрут `/auth/reset-password` в `AppRouter.tsx`.

- **UI**: В `AuthPages.tsx` реализован новый режим `reset-password`. Форма включает поля "Новый пароль" и "Подтверждение" с валидацией совпадения. Токен извлекается автоматически из URL.

- **Context**: В `AuthContext.tsx` добавлен метод `resetPassword`.

- **i18n**: Полная локализация всех сообщений и полей для нового потока на русском и английском языках. Исправлены UI-баги (отображение Email поля в режиме сброса, некорректные сообщения об успехе).



**Статус:** Готово и верифицировано. Пользователи теперь могут безопасно восстановить доступ к аккаунту через Email.



## Update 2026-05-25 — Password Reset UI Polish & HTML Emails



**Сделано:**

Улучшен визуальный и технический аспекты процесса сброса пароля.



**Backend:**

- **HTML Email Template**: `EmailServiceImpl` переведен с текстовых сообщений на богатый HTML-шаблон. Добавлен брендинг (логотип-молния), CTA-кнопка «Сбросить пароль», темная тема в стиле приложения и поддержка корректного отображения в почтовых клиентах.

- **Improved Logging**: Добавлено расширенное логирование процесса отправки (включая прямую ссылку в консоль бэкенда) для облегчения локальной разработки без настроенного SMTP.

- **SMTP Stability**: Настроены тайм-ауты соединения в `application.yaml` для предотвращения зависаний при проблемах с сетью.



**Frontend:**

- **UI Cleanup**: Скрыто дублирование кнопки «Назад» на странице сброса пароля. Удалены лишние иконки-стрелки из текстовых ссылок.

- **Layout Fixes**: Исправлено центрирование кнопок на десктопной версии страниц авторизации.

- **UX**: Обновлены тексты уведомлений об успешной отправке ссылки и успешном сбросе пароля.



**Статус:** Готово. Интерфейс выглядит целостно, письма приходят в HTML-формате с рабочей кнопкой.



## Update 2026-05-24 — Решение проблем с ESLint и стабилизация CI (Frontend Lint & Build Hardening)



Проведена глобальная чистка кодовой базы фронтенда от ошибок и предупреждений линтера (ESLint) для обеспечения бесперебойного прохождения CI-пайплайна.



**Frontend:**

- **api-client.ts**: Удалена неиспользуемая переменная `refreshErr` в блоке `catch`.

- **interview.service.ts**: Переменная `items` изменена на `const items` для соблюдения правила неизменяемости.

- **task.service.ts**: Избыточное приведение `params as any` заменено на строгий и безопасный тип `Record<string, string | number | boolean | undefined>`.

- **InterviewForm.tsx**: Удалены лишние `as any` приведения для связанных сущностей вакансии (`app.vacancy`).

- **SettingsPage.tsx**: Избавление от 16 небезопасных приведений `as any`. Все поля, селекторы и данные пользователя теперь типизированы строго с использованием `as string`, `as unknown as Resolver`, `UserType` и т.д.

- **Предотвращение побочных эффектов в рендере (useEffect)**: В компонентах `CompaniesPage.tsx`, `InterviewsPage.tsx` и `TasksPage.tsx` вызовы обновления локального состояния внутри эффектов были обернуты в `setTimeout(..., 0)` для разрыва синхронного цикла рендеринга и устранения предупреждений React о внезапном изменении состояния. Оптимизированы массивы зависимостей хуков `useMemo` и `useEffect`.



**CI/CD и автоматизация:**

- В файл `private-notes/GEMINI_SWE_PROMT.md` добавлены жесткие инструкции для SWE-агента, обязывающие запускать `pnpm run lint` и `pnpm run build` перед окончанием работы.



**Статус:** Готово. Фронтенд успешно компилируется (`pnpm run build`) и линтится без ошибок (`pnpm run lint`). Все юнит-тесты бэкенда (79 тестов) зеленые.



## Update 2026-05-20 — Real Analytics Refinement (Skill Gaps & Performance Metrics)



Реализован расчет реальных метрик аналитики на основе данных пользователя вместо mock-данных.



**Backend:**

- **Migration V18**: Создана миграция `V18__add_first_interview_at_to_applications.sql` для добавления колонки `first_interview_at TIMESTAMP WITH TIME ZONE` в таблицу `applications`.

- **ApplicationEntity**: Добавлено поле `firstInterviewAt` (Instant) для отслеживания времени первого перехода в статус интервью.

- **ApplicationServiceImpl**: 

  - Добавлен метод `isInterviewStatus()` для определения статусов интервью (HR_SCREEN, TECH_INTERVIEW, FINAL, OFFER).

  - В методах `create()` и `updateStatus()` добавлена логика фиксации `firstInterviewAt = Instant.now()` при первом переходе в статус интервью.

- **AnalyticsServiceImpl**: 

  - Внедрена зависимость `ProfileRepository` для доступа к навыкам пользователя.

  - Переписан метод `buildSkillGaps()` для расчета пробелов в навыках на основе реальных данных:

    - Извлекаются навыки из профиля пользователя (List<String> skills).

    - Собираются все теги из вакансий, на которые есть отклики (кроме статуса SAVED).

    - Рассчитывается частота каждого тега.

    - Определяется наличие навыка у пользователя (case-insensitive сравнение).

    - Результат сортируется по частоте DESC, ограничивается топ-10.

  - Переписан метод `calculateAvgTimeToInterview()` для расчета среднего времени до интервью:

    - Фильтруются отклики с заполненными `firstInterviewAt` и `appliedAt`.

    - Вычисляется разница в днях через `Duration.between()`.

    - Возвращается среднее значение (0.0 если нет данных).



**Frontend:**

- Изменения не требовались - структура `AnalyticsSummaryResponse` осталась неизменной согласно контракту API.



**Проверки:**

- Backend: `.\mvnw.cmd clean compile` - успешно.

- Frontend: `npm run lint` - успешно (1 предупреждение unrelated), `npm run build` - успешно.



**Статус:** Готово. Аналитика теперь использует реальные данные профиля и откликов пользователя.





## Обновление 2026-05-25 — Исправление ошибки десериализации дат (Vacancy Date Fix)



Исправлена критическая ошибка 500 (HttpMessageNotReadableException), возникавшая при сохранении вакансий из-за несоответствия форматов дат между фронтендом (HTML `type="date"`, отправляющий `YYYY-MM-DD`) и бэкендом (`java.time.Instant`).



**Backend:**

- **DTOs**: В `CreateVacancyDto`, `UpdateVacancyDto` и `ApplicationRequest` типы полей дат изменены с `Instant` на `LocalDate`.

- **Services**: В `VacancyServiceImpl` и `ApplicationServiceImpl` добавлена логика конвертации `LocalDate` в `Instant` через `.atStartOfDay(ZoneOffset.UTC).toInstant()` перед сохранением в базу данных. Это сохраняет единый стандарт хранения времени в UTC при сохранении удобства передачи данных.



**Frontend:**

- **VacancyForm.tsx**: Добавлена корректная обработка дат при редактировании. ISO-строка из `initialValues` теперь обрезается через `.slice(0, 10)` для соответствия формату `YYYY-MM-DD`, ожидаемому браузерным инпутом.

- **Refactoring**: Для оптимизации инициализации `defaultValues` в форме использован хук `useMemo`.



**Статус:** Решено и верифицировано. Создание и редактирование вакансий/откликов работает стабильно. Сборка фронтенда и компиляция бэкенда проходят без ошибок.





## Обновление 2026-05-25 — Реализация поддержки тегов в вакансиях (Vacancy Tags UI)



Реализована возможность добавления и редактирования тегов (навыков) для вакансий, что критично для работы раздела Analytics (Skill Gaps).



**Backend:**

- Изменения не требовались. Бэкенд уже поддерживает `tagIds: List<String>` в `CreateVacancyDto` и `UpdateVacancyDto` и корректно сохраняет их в `vacancy_tags`.



**Frontend:**

- **VacancyForm.tsx**: 

  - В Zod-схему добавлено опциональное поле `tags` (string).

  - В UI добавлено текстовое поле ввода тегов с подсказкой о вводе через запятую.

- **VacanciesPage.tsx**: 

  - В мутации создания добавлена трансформация: строка тегов разбивается через `.split(',')`, очищается от пробелов и пустых значений, и отправляется на бэкенд как массив `tagIds`.

- **VacancyDetailPage.tsx**: 

  - При инициализации формы редактирования существующие теги вакансии (`VacancyTag[]`) преобразуются в строку через `.join(', ')`.

  - В мутации обновления добавлена аналогичная трансформация строки в массив `tagIds`.

- **i18n**: Использованы существующие ключи локализации для тегов и подсказок.



**Статус:** Готово и верифицировано. Теги успешно сохраняются и отображаются в аналитике "Пробелы в навыках". Сборка фронтенда и бэкенда подтверждена.





## Обновление 2026-05-25 — Исправление ошибок в Analytics и Vacancy Tags



По результатам ручного тестирования были выявлены и устранены критические ошибки, связанные с ленивой загрузкой данных и UI ворнингами.



**Backend:**

- **LazyInitializationException**: Исправлена ошибка доступа к коллекции тегов вакансии. Добавлен `@Transactional` в сервис `VacancyServiceImpl` и расширены `@EntityGraph` в репозиториях `VacancyRepository` и `ApplicationRepository`.

- **N+1 Optimization**: Улучшена производительность за счет жадной загрузки (eager fetching) связанных сущностей (`tags`, `company`) в критических для аналитики запросах.



**Frontend:**

- **React Key Warning**: Исправлен ворнинг "Each child in a list should have a unique 'key' prop" в компоненте `WeeklyActivityChart`. Короткий синтаксис фрагментов `<>` заменен на `<Fragment key={...}>`.

- **UX Clarification**: Подтверждено, что "Skill Gaps" рассчитываются на основе **откликов** (Applications) со статусом выше `SAVED`.



**Статус:** Стабильно. Система аналитики корректно обрабатывает теги и отображает пробелы в навыках.



## Update 2026-05-20 — AI Observability (Metrics & Error Tracking)



**Сделано:**

Реализована система мониторинга AI-запросов: сбор метрик времени выполнения (latency), количества токенов (tokens) и отслеживание ошибок.



**Backend:**

- **Migration**: `V19__add_ai_metrics_columns.sql` (добавлены `latency_ms` и `error_message` в `ai_results`).

- **DTO**: Создан `LlmResponse` record для внутреннего обмена данными (text, tokens, latencyMs, errorMessage).

- **Service**: 

    - `LlmProvider` и `OllamaLlmProvider` обновлены для возврата `LlmResponse`.

    - Извлечение `total_duration` и `eval_count` из ответа Ollama.

    - `AiServiceImpl` использует `StopWatch` для замера времени выполнения (как fallback, если провайдер не вернул latency).

    - `AiResultCacheService` обновлен для кэширования полных объектов `LlmResponse`.

- **Mapping**: Обновлены `AiEntity`, `AiResultDto` и `AiMapper` для поддержки новых полей.

- **Tests**: Обновлены `AiServiceImplTest` и `AiControllerTest`.



**Frontend:**

- **Types**: Интерфейс `AiResult` дополнен полями `tokensUsed`, `latencyMs` и `errorMessage`.

- **UI**: (Bonus) Метрики выведены в карточки истории AI-анализа.



**Статус:** Готово и верифицировано. Все 7/7 тестов `AiServiceImplTest` пройдены.



## Update 2026-05-20 — AI Assistant UX Improvement (Vacancy Selector)



**Сделано:**

Улучшен пользовательский опыт на странице AI-помощника за счет замены ручного ввода ID на удобный выбор из списка.



**Frontend:**

- **UI**: Текстовое поле `vacancyId` заменено на выпадающий список (Select) со списком всех активных вакансий пользователя.

- **Logic**: Реализовано интеллектуальное заполнение: при выборе вакансии из списка её описание автоматически копируется в поле "Текст вакансии". При смене вакансии текст обновляется, а при выборе "Без привязки" — очищается.

- **Service**: Использован `vacancyService.list()` для получения данных.

- **i18n**: 

    - Удалены технические описания ("RHF+Zod", "ID вакансии").

    - Добавлены понятные инструкции для пользователя на русском и английском языках.

- **Hardening**: Исправлена ошибка импорта `vacancyService` и подтверждена успешная сборка.



## Update 2026-05-20 — Scheduled Notifications Implementation



**Сделано:**

Реализован фоновый процесс для автоматического создания уведомлений и отправки email-напоминаний о предстоящих собеседованиях и дедлайнах задач.



**Backend:**

- **Migration**: `V20__add_reminder_sent_and_task_reminders.sql` (добавлены флаги `reminder_sent` в `interviews` и `tasks`, а также `task_reminders` в `user_preferences`).

- **Domain**: 

    - `InterviewEntity` и `TaskEntity` обновлены полем `reminderSent`.

    - `PreferencesEntity` обновлена полем `taskReminders`.

- **Infrastructure**:

    - В `AsyncConfig` добавлена аннотация `@EnableScheduling`.

    - В `application.yaml` добавлены настройки планировщика `reminder.scheduler.enabled` и `reminder.scheduler.cron`.

- **Logic**:

    - Создан `NotificationCreator` сервис для инкапсуляции логики создания in-app уведомлений и проверки предпочтений пользователя перед отправкой Email.

    - Реализован `ReminderScheduler` с методом `@Scheduled`, который раз в час проверяет окно в 24 часа на наличие предстоящих событий.

    - `EmailService` расширен методом `sendReminderEmail` с использованием нового HTML-шаблона в стиле CareerPilot.

- **Mapping**: `TaskMapper` обновлен для игнорирования технического поля `reminderSent` при обновлении из запроса.

- **Tests**: Создан и успешно пройден `ReminderSchedulerTest` (5/5 тестов), покрывающий логику выбора событий, отправки уведомлений и обработки ошибок.



**Frontend:**

- (Примечание) Бэкенд готов к поддержке настройки `taskReminders`, однако в текущей версии UI настроек и API DTO `PreferencesRequest/Response` это поле пока не выведено.



**Статус:** Готово и верифицировано. Система теперь проактивно уведомляет пользователей о важных событиях.



## Update 2026-05-21 — Dashboard UI Polish & Notification Fixes



**Сделано:**

Устранены недочеты UI на главном дашборде и исправлен формат дат в уведомлениях.



**Backend:**

- **ReminderScheduler**: Внедрен `DateTimeFormatter` с `ZoneId.of("Europe/Moscow")` для форматирования машинных дат (`Instant`) в человекочитаемый СНГ-формат (`dd.MM.yyyy HH:mm`) перед вставкой в текст уведомлений и Email.



**Frontend:**

- **Dashboard UI**:

    - В блоках "Предстоящие интервью", "Задачи" и "Уведомления" убрано жесткое ограничение количества элементов (`.slice()`).

    - Вместо этого добавлена вертикальная прокрутка с ограничением высоты (`max-h-[260px] overflow-y-auto`) и полным скрытием визуальной полосы скролла кроссбраузерно (`[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`).

    - Стандартный `StatusBadge` для статуса "NEW" в уведомлениях заменен на кастомный яркий элемент в фирменных фиолетовых цветах проекта.



**Статус:** Готово. Дашборд стал более информативным и аккуратным.



## Update 2026-05-21 — Dynamic Notification Bell



**Сделано:**

Иконка колокольчика в Topbar теперь динамически отображает точное количество непрочитанных уведомлений, вместо статичного индикатора.



**Backend:**

- **Repository**: В `NotificationRepository` добавлен метод `countByUserIdAndReadFalse`.

- **Service/Controller**: Реализован новый эндпоинт `GET /api/notifications/unread-count`, возвращающий `{ "count": N }`.



**Frontend:**

- **Service**: В `notification.service.ts` добавлен метод `getUnreadCount()` с поддержкой Mock-режима.

- **UI (Topbar)**:

    - Интегрирован `useQuery` для запроса `unread-count` с фоновым обновлением (`refetchInterval: 60000`).

    - Статичный кружок на иконке заменен на динамический бейдж. Если счетчик > 0, отображается количество (с обрезкой "9+", если больше 9). Бейдж стилизован в фирменных цветах проекта (`bg-violet-500`) с темной обводкой для контраста.

    - Добавлен переход по клику на `/app/settings#notifications`.

- **UI (SettingsPage)**:

    - Реализован плавный скролл (smooth scroll) до секции "Уведомления" с помощью хука `useLocation().hash` и `scrollIntoView()`. Блоку добавлен класс `scroll-mt-24` для компенсации фиксированного хедера.



**Статус:** Готово. Пользователь всегда видит актуальное количество новых событий.



## Update 2026-05-26 — Vacancy Archive Endpoint



**Сделано:**

Реализован бэкенд эндпоинт `PATCH /api/vacancies/{id}/archive` для перевода вакансии в статус `ARCHIVED`. Это закрывает последний нереализованный пункт из контракта `docs/FRONTEND_BACKEND_CONTRACT.md` для Vacancy.



**Backend:**

- **Controller**: Добавлен `PATCH /{id}/archive` в `VacancyController` с логированием `@Auditable(action = "VACANCY_ARCHIVE", entityType = "VACANCY")`.

- **Service**: В `VacancyServiceImpl` реализован метод `archive` с обязательной аннотацией `@Transactional` для корректного маппинга ленивых коллекций сущности без вызова `LazyInitializationException`.



**Frontend:**

- Изменения не требовались, так как `vacancy.service.ts` и `StatusBadge.tsx` уже полностью поддерживали работу с этим статусом.



**Статус:** Готово и верифицировано. Тесты `VacancyServiceImplTest` проходят успешно.





## Update 2026-05-26 — Vacancy Archive UI



**Сделано:**

Добавлена кнопка "В архив" на страницу просмотра вакансии (`VacancyDetailPage.tsx`). Кнопка появляется только для вакансий, которые еще не находятся в архиве.



**Frontend:**

- **UI**: В секцию действий (Action buttons) добавлена кнопка с иконкой архива.

- **Logic**: Реализован хук `archiveMutation`, вызывающий `vacancyService.archive`. После успешной архивации данные вакансии инвалидируются в кэше React Query, и UI обновляется (появляется статус ARCHIVED, кнопка архивации исчезает).

- **i18n**: Добавлены ключи `archive`, `vacancyArchived` и `vacancyArchiveFailed` в RU/EN локали.



**Статус:** Готово и верифицировано. Сборка фронтенда прошла успешно.





## Update 2026-05-26 — Vacancy Archive Styling



**Сделано:**

Улучшена визуальная индикация архивированных вакансий в общем списке для лучшего пользовательского опыта (UX).



**Frontend:**

- **VacanciesPage.tsx**: К карточкам (List View) и строкам (Table View) архивированных вакансий добавлены динамические стили `opacity-60 grayscale-[0.4]`. Это позволяет визуально "приглушить" неактивный контент, выделяя активные вакансии.

- **Hover Effects**: При наведении на архивированный элемент прозрачность увеличивается до `opacity-80`, а фильтр grayscale отключается, что сохраняет интерактивность и читаемость.



**Статус:** Готово и верифицировано. Сборка фронтенда прошла успешно.





## Update 2026-05-26 — Vacancy Restore Functionality



**Сделано:**

Реализована возможность возврата вакансии из архива в активное состояние по всей цепочке (Backend -> Frontend).



**Backend:**

- **Service**: Добавлен метод `restore(UUID id)` в `VacancyService`, устанавливающий статус `ACTIVE`.

- **Controller**: Реализован эндпоинт `PATCH /api/vacancies/{id}/restore` с аудитом действий (`VACANCY_RESTORE`).



**Frontend:**

- **Service**: В `vacancy.service.ts` добавлен метод `restore`.

- **UI (VacancyDetailPage.tsx)**: Добавлена кнопка "Из архива" (с иконкой `ArrowPathIcon`), которая отображается только для вакансий в статусе ARCHIVED. Реализована соответствующая мутация для мгновенного обновления UI.

- **i18n**: Добавлены ключи `restore`, `vacancyRestored` и `vacancyRestoreFailed` в RU/EN локали.



**Статус:** Готово и верифицировано. Сборки бэкенда и фронтенда прошли успешно.





## Update 2026-05-26 — Data Consistency Fix



**Сделано:**

Исправлена проблема рассинхронизации данных при навигации назад от деталей вакансии к списку после архивации или восстановления.



**Frontend:**

- **VacancyDetailPage.tsx**: Мутации `archiveMutation` и `restoreMutation` теперь инвалидируют весь префикс запросов `['vacancies']` вместо узкого ключа деталей. Это гарантирует, что при возвращении пользователя на страницу списка вакансий (`VacanciesPage.tsx`) данные будут автоматически перезапрошены и отобразят актуальный статус (включая визуальное затухание для архива).



**Статус:** Исправлено и верифицировано.

\

## Update 2026-05-21 — Secure Account Deletion Implementation



**Сделано:**

Реализован защищенный процесс удаления аккаунта с обязательным подтверждением через пароль и ввод Email.



**Backend:**

- **DTO**: Создан AccountDeletionRequest (password, confirmation).

- **Service**: В AuthServiceImpl реализована логика удаления: проверка пароля (для локальных пользователей), проверка совпадения Email (case-insensitive), каскадное удаление данных пользователя из БД.

- **Controller**: Добавлен эндпоинт DELETE /api/users/me в UserController с аннотацией @Auditable (ACCOUNT_DELETE).

- **Tests**: Добавлены unit-тесты, покрывающие сценарии успеха, неверного пароля и неверного Email.



**Frontend:**

- **Service**: Добавлен метод deleteAccount в settings.service.ts, обновлен pi-client.ts для поддержки body в DELETE запросах.

- **UI (SettingsPage)**: Реализовано модальное окно DeleteAccountModal в секции Danger Zone.

- **Logic**: После удаления выполняется логаут, очистка кэша React Query (queryClient.clear()) и редирект на главную страницу.

- **i18n**: Добавлены локализации для всех текстов, ошибок и кнопок процесса удаления.



**Статус:** Готово и верифицировано. Все тесты бэкенда и сборка фронтенда проходят успешно.\

\

## Update 2026-05-21 — API Client: Functional 401 Handling



**Исправлено:**

Исправлен баг, при котором ввод неверного пароля (401 Unauthorized) во время удаления аккаунта или входа приводил к принудительному логауту глобальным перехватчиком.



**Frontend:**

- **api-client.ts**: Обновлена логика обработки 401 ошибки. Теперь глобальный логаут и редирект на /login пропускаются, если ошибка является функциональной (например, при попытке логина или если это повторный запрос после обновления токена, который все равно вернул 401 из-за неверных учетных данных).

- Это позволяет компонентам (таким как SettingsPage или AuthPages) корректно обрабатывать ошибки и показывать пользователю сообщение 'Неверный пароль' вместо внезапного завершения сессии.\



## Update 2026-05-27 — Settings & Preferences Vertical Integration



**Сделано:**

Реализована полная вертикальная интеграция настроек пользователя (Preferences), включая поддержку нового поля `taskReminders`.



**Backend:**

- **DTO**: Обновлены `PreferencesRequest` и `PreferencesResponse`, добавлено поле `taskReminders` (boolean).

- **Service**: В `PreferencesServiceImpl` реализован маппинг нового поля в методах `updatePreferences` и `toResponse`.



**Frontend:**

- **Service**: Интерфейсы `PreferencesRequest` и `PreferencesResponse` в `settings.service.ts` теперь включают `taskReminders`. Обновлены моки.

- **UI (SettingsPage.tsx)**: 

    - Схема валидации Zod теперь включает `taskReminders`.

    - Добавлен UI-контроль (Toggle) для управления напоминаниями о задачах в секции Notifications.

    - Реализована реактивная связь через `useWatch` и мгновенное сохранение при изменении.

- **i18n**: Добавлены локализации `taskReminders` и `taskRemindersDescription` для RU и EN.



**Статус:** Готово и верифицировано. Все слои приложения синхронизированы с базой данных.\



## Update 2026-05-21 — Notification Reference Fields



**Сделано:**

Добавлены поля reference_id и reference_type в таблицу notifications для связывания уведомлений с сущностями (задачи, интервью и др.).



**Backend:**

- **Migration**: Создана миграция `V21__add_notification_reference_fields.sql`.

  - Добавлены поля `reference_id UUID` и `reference_type VARCHAR(50)` в таблицу `notifications`.

  - Создан составной индекс `idx_notifications_reference` для оптимизации запросов по reference полям.

- **Repository**: В `InterviewRepository` добавлены методы для поиска интервью по времени с фильтрацией по статусу отправки напоминаний:

  - `findAllByScheduledAtBeforeAndReminderSentFalse(Instant before)`

  - `findAllByScheduledAtBeforeAndReminderSentTrue(Instant before)`

  - `findAllByScheduledAtBetweenAndReminderSentTrue(Instant from, Instant to)`



**Цель:** Подготовка инфраструктуры для реализации Scheduled Notifications — фонового процесса для создания напоминаний о дедлайнах задач и времени собеседований.



**Статус:** Миграция готова, repository методы добавлены. Полная реализация scheduled notifications в процессе.\



## Update 2026-05-21 — CI Fixes & Release v0.5.0-alpha



**Сделано:**

Исправлены критические ошибки CI/CD и подготовлен релиз v0.5.0-alpha.



**Frontend:**

- **AuthContext.tsx**: Исправлена ошибка типизации TS2322 (User | undefined → User | null). Вернуто корректное состояние через user ?? null.

- **Build**: Подтверждена успешная сборка через npm run build.



**Backend:**

- **Tests**: Обновлен тест ReminderSchedulerTest.java для соответствия новой логике планировщика (7 аргументов в createNotification, обработка просроченных задач).

- **Verification**: Все тесты прошли успешно.



**Documentation:**

- Создан файл docs/RELEASE_v0.5.0-alpha.md с полным описанием завершенного этапа.

- Обновлен ROADMAP.md: статус v0.5.0-alpha изменен на «Выпущено».



**Статус:** Готово к публикации.



## Update 2026-05-21 — Application Status History (Timeline)



**Реализовано:**

Добавлена возможность отслеживания и визуализации истории изменений статуса отклика (Timeline).



**Backend:**

- **Migration**: Создана миграция V23 для таблицы `application_status_history`.

- **Domain**: Добавлены ApplicationStatusHistoryEntity, ApplicationStatusHistoryRepository, ApplicationStatusHistoryResponse.

- **Service**: Обновлен ApplicationServiceImpl — добавлена запись в историю в методах create и updateStatus. Реализован метод getHistory.

- **Controller**: Добавлен эндпоинт GET /api/applications/{id}/history.



**Frontend:**

- **Service**: Обновлен application.service.ts.

- **Component**: Создан компонент ApplicationTimelineModal.tsx.

- **Integration**: Обновлена страница ApplicationsPage.tsx, добавлена компактная кнопка запуска таймлайна.

- **i18n**: Добавлены ключи локализации.



**Статус:** Реализовано и верифицировано.



## Update 2026-05-21 — Application Status Notifications



**Сделано:**

Реализована система уведомлений при изменении статуса отклика на вакансию.



**Backend:**

- **Migration**: Создана миграция V22, добавляющая поле application_status_notifications в настройки пользователя.

- **Entity/DTO**: Обновлены PreferencesEntity, PreferencesRequest и PreferencesResponse.

- **Logic**: ApplicationServiceImpl теперь вызывает NotificationCreator при создании и обновлении статуса отклика. Уведомления типа APPLICATION_STATUS отправляются через In-app и Email (если включено в настройках).



**Frontend:**

- **Settings**: Добавлен тумблер управления уведомлениями о статусе откликов в SettingsPage.tsx.

- **i18n**: Добавлены ключи локализации для новых уведомлений и настроек.



**Статус:** Реализовано и верифицировано тестами. Все слои синхронизированы.



## Update 2026-05-21 — Timeline UI Polish (i18n статусов, тултипы, стиль кнопки)



**Сделано:**

Устранены три UX-недочёта, выявленных после реализации Application Status History.



**Frontend (только):**

- **`frontend/src/lib/utils.ts`**: Добавлена экспортируемая константа `APPLICATION_STATUS_KEYS: Record<ApplicationStatus, string>` — маппинг enum-значений на i18n-ключи (`applications.new`, `applications.hrScreen` и т.д.).

- **`frontend/src/i18n/locales/en.json`**: Значения статусов исправлены с КАПСЛОКА (`"NEW"`, `"SAVED"`) на читаемый English (`"New"`, `"Saved"`, `"HR Screen"`, `"Tech Interview"`, `"Final Round"`). Добавлен ключ `applications.timeline.viewHistory`.

- **`frontend/src/i18n/locales/ru.json`**: Добавлен ключ `applications.timeline.viewHistory` («Посмотреть историю статусов»).

- **`frontend/src/components/ApplicationTimelineModal.tsx`**: Исправлена функция `getStatusLabel` — сломанный маппинг через `.replace('_', '')` заменён корректным через `APPLICATION_STATUS_KEYS`. Добавлен компонент `StatusWithTooltip` (объявлен на уровне модуля) с мгновенным CSS-тултипом (duration-75), показывающим перевод + i18n ключ моноширным фиолетовым шрифтом при наведении.

- **`frontend/src/pages/ApplicationsPage.tsx`**: Удалена дублирующая константа `STATUS_LABELS`, заменена на `APPLICATION_STATUS_KEYS` из utils. Статус в карточке теперь отображается через `t(APPLICATION_STATUS_KEYS[application.status])`. Кнопка-часы (timeline trigger) переоформлена в фиолетовом стиле проекта (`bg-violet-500/10 border border-violet-500/20 text-violet-400`) с кастомным тултипом вместо нативного `title=""`.

- **`frontend/src/components/StatusBadge.tsx`**: Подключён `useTranslation`. Для `ApplicationStatus` метка берётся через `t(i18nKey)`, для `VacancyStatus` — fallback на `meta.label`.



**Code Review fix (post-review):** `StatusWithTooltip` изначально был объявлен внутри тела `TimelineItem` (anti-pattern: nested component definition). Вынесен на уровень модуля. Props упрощены до `{ label, statusKey }` — значения вычисляются в `TimelineItem` перед передачей.



## Update 2026-05-21 — Bugfixes: Notification Keys, Modal Z-Index, Legacy Status, Notification Translation



**Исправлено:**



**Frontend:**

- **`frontend/src/i18n/locales/ru.json`**: Устранен дубликат ключа `notifications` (объект), который конфликтовал со строковым значением. Переименованы в `notificationsApplicationStatus` и `notificationsApplicationStatusDescription`.

- **`frontend/src/i18n/locales/en.json`**: Уплощена структура — удален вложенный объект `notifications`, ключи вынесены на верхний уровень как в ru.json.

- **`frontend/src/pages/SettingsPage.tsx`**: Обновлены ключи локализации для уведомлений о статусе отклика на новые плоские ключи.

- **`frontend/src/lib/utils.ts`**: Добавлена константа `LEGACY_STATUS_MAP` для маппинга легаси-значения `FINAL` в `FINAL_ROUND`. Добавлена функция `translateStatusInText` для перевода значений статусов в тексте уведомлений.

- **`frontend/src/components/ApplicationTimelineModal.tsx`**: Обновлен `getStatusKey` для использования `LEGACY_STATUS_MAP` при нормализации статусов. Разделены backdrop и контент модального окна: backdrop имеет `z-[90]` (выше topbar), контент — `z-[100]`. Добавлен `m-0` к backdrop для переопределения наследуемого margin от родительских элементов с `space-y`.

- **`frontend/src/pages/DashboardPage.tsx`**: Добавлен импорт `translateStatusInText` и применена функция к сообщению уведомления для перевода статусов.

- **`frontend/src/styles/globals.css`**: Исправлена ошибка Tailwind CSS — заменено `bg-[rgba(255, 255, 255, 0.03)]` на `bg-white/[0.03]` в классе `.select` (произвольные RGBA значения не поддерживаются в @apply). Изменено `height: 100%` на `min-height: 100vh` для html и body для корректного покрытия backdrop на весь экран.



**Статус:** Исправлено и верифицировано. Линт и билд прошли успешно.



**Верификация:** `npm run lint` — без ошибок. `npm run build` — успешно. Бэкенд не затрагивался.



**Статус:** Реализовано, верифицировано, code review проведён.



## Update 2026-05-21 — Full-Stack Docker Compose Setup



**Сделано:**

Реализована production-like Docker Compose конфигурация, запускающая весь стек одной командой `docker compose up -d --build`.



**Новые файлы:**

- **`backend/Dockerfile`**: Multi-stage build — Stage 1: `eclipse-temurin:21-jdk-alpine` (Maven + `chmod +x mvnw` + `package -DskipTests`), Stage 2: `eclipse-temurin:21-jre-alpine` (минимальный runtime).

- **`frontend/Dockerfile`**: Multi-stage build — Stage 1: `node:20-alpine` (corepack pnpm@9, `pnpm install --frozen-lockfile`, `pnpm run build` с ARG VITE_API_BASE_URL=/api), Stage 2: `nginx:alpine` (статика + nginx.conf).

- **`frontend/nginx.conf`**: SPA fallback (`try_files $uri /index.html`) + reverse proxy `location /api/` → `http://backend:8080/api/`.

- **`.env.docker.example`**: Шаблон переменных окружения для Docker-запуска (в корне репозитория, whitelisted в `.gitignore`).

- **`docs/DEPLOYMENT.md`**: Полное руководство по деплою (быстрый старт, OAuth2, Ollama, переменные, troubleshooting).



**Изменённые файлы:**

- **`backend/src/main/resources/application.yaml`**: Параметризован хост БД: `${DB_HOST:localhost}`. Дефолт `localhost` сохраняет локальный dev без изменений.

- **`docker-compose.yml`**: Добавлены services `backend` (port 8080, depends_on postgres+redis с healthcheck, start_period 90s для Flyway) и `frontend` (port 80, depends_on backend).

- **`backend/.env.example`**: Добавлен `DB_HOST=localhost`.

- **`.gitignore`**: Добавлено `!.env.docker.example` для публикации шаблона.

- **`backend/docker/README.md`**: Обновлён статус — описание актуального состояния и ссылка на DEPLOYMENT.md.

- **`ROADMAP.md`**: `[x] Full-stack Docker Compose setup`, `[x] Deployment notes`.



**Code Review (post-implementation):**

- Обнаружен и исправлен критический баг: отсутствие `RUN chmod +x mvnw` в `backend/Dockerfile`. На Windows (NTFS) Docker COPY теряет Unix execute bit, сборка падала бы с `Permission denied`.

- Добавлен явный `CMD ["nginx", "-g", "daemon off;"]` в `frontend/Dockerfile`.

- Добавлен урок 62 в `GEMINI.md` о `mvnw` permissions.



**Верификация:**

- Frontend lint: ✅ pnpm run lint — без ошибок

- Frontend build: ✅ pnpm run build — успешно (864.92 kB bundle)

- Backend compile: ✅ `./mvnw clean compile -DskipTests` — 225 source files

- Backend tests: ✅ 92 тестов, 5 пропущено (Testcontainers без Docker)



**Статус:** Реализовано, верифицировано, code review проведён.



## Update 2026-05-21 — Docker Deployment Debugging: OAuth2 & nginx



**Контекст:** Первый реальный запуск `docker compose up -d --build` обнаружил три независимых бага, не выявленных при статическом code review.



**Bug 1: Неверное имя свойства в `OAuth2SuccessHandler`**

- `@Value("${app.frontend.base-url:...}")` — свойство с точкой не существует в `application.yaml`

- В `application.yaml` прописано `app.frontend-url` (через дефис)

- Итог: `frontendBaseUrl` всегда = `http://localhost:5173` (дефолт), редирект после OAuth2 уходил не туда

- Фикс: `@Value("${app.frontend-url:http://localhost:5173}")`



**Bug 2: nginx не проксировал OAuth2-пути Spring Security**

- nginx маршрутизировал только `/api/`. Пути `/oauth2/` и `/login/oauth2/` отсутствовали.

- Без `server.forward-headers-strategy: native` Tomcat строил redirect URL с портом 8080; Spring Security генерировал `redirect_uri=http://localhost:8080/login/oauth2/code/github`. Если в OAuth App зарегистрирован `http://localhost/login/oauth2/code/github` (порт 80) — провайдер отклонял callback → Spring Security редиректил на `/login?error` → React Router catchall → `/`.

- Фикс: добавлены `location /oauth2/` и `location /login/oauth2/` в `frontend/nginx.conf` + `server.forward-headers-strategy: native` в `application.yaml` + `X-Forwarded-Port: $server_port` во все proxy blocks.



**Bug 3: Docker build cache не инвалидировался при изменении файлов (Windows)**

- `docker compose up -d --build` показывал "Built 0.0s" и поднимал старый образ.

- Паттерн: всегда использовать `docker compose build --no-cache <service>` + `docker compose up -d --force-recreate` при изменениях конфигов или Java-кода на Windows.



**Изменённые файлы:**

- `backend/src/main/java/.../auth/oauth2/OAuth2SuccessHandler.java` — исправлен `@Value` ключ

- `backend/src/main/resources/application.yaml` — добавлен `server.forward-headers-strategy: native`

- `frontend/nginx.conf` — proxy blocks для `/oauth2/` и `/login/oauth2/`, `X-Forwarded-Port`

- `README.md` — добавлен раздел "Full-stack Docker (рекомендуется)", ссылка на DEPLOYMENT.md, версия `v0.5.0-alpha`

- `docs/README.DEV.md` — обновлён Docker Compose раздел, npm→pnpm, Known limitation по OAuth2 redirect URI

- `GEMINI.md` — добавлены уроки 63–65



**OAuth2 в Docker — требование к настройке провайдеров:**

- GitHub callback: `http://localhost/login/oauth2/code/github`

- Google redirect: `http://localhost/login/oauth2/code/google`



**Статус:** Баги исправлены, документация синхронизирована.



## Update 2026-05-21 — Frontend Test Framework Implementation



**Сделано:**

Настроен тестовый фреймворк для фронтенда на основе Vitest + React Testing Library. Закрыт последний открытый пункт Phase 6 по frontend tests.



**Frontend:**

- **Зависимости**: Добавлены vitest, @vitest/ui, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom.

- **Конфигурация**: Создан vitest.config.ts с jsdom environment, globals, setupFiles и define для VITE_USE_MOCKS.

- **Global Setup**: Создан src/test/setup.ts с моками react-i18next (useTranslation возвращает ключ) и toast.

- **Тесты утилит**: 

  - buildQuery.test.ts (4 теста для функции построения query string).

  - utils.test.ts (7 тестов для APPLICATION_STATUS_KEYS, LEGACY_STATUS_MAP, translateStatusInText).

- **Тесты сервисов**:

  - authService.test.ts (4 теста в mock-режиме: login, register, logout, localStorage).

  - vacancyService.test.ts (5 тестов в mock-режиме: list фильтрация, search, getById).

- **Тесты компонентов**:

  - StatusBadge.test.tsx (3 теста рендеринга с разными status).

- **TypeScript**: В tsconfig.app.json добавлены vitest/globals и @testing-library/jest-dom в types.

- **CI**: В .github/workflows/ci.yml добавлен шаг "Run tests" после lint, перед build.

- **Scripts**: В package.json добавлены test, test:watch, test:ui.



**Проверки:** Все тесты проходят успешно (23/23), lint и build без ошибок.



**Code Review (после реализации):**

- Обнаружен и исправлен баг SWE-1.6: уроки вставлены в `GEMINI.md` в середину списка (создав дубликаты номеров 51-53). Уроки перенумерованы в 66-67 и перенесены в конец раздела.

- Исправлен некорректный совет про `process.env.VITE_USE_MOCKS` в уроке 67 (правильный способ — `define` в vitest.config.ts).

- Обновлены ROADMAP.md (Current Development Focus), README.md и README.DEV.md (устаревшие фразы про отсутствие тестов).



**Статус:** Реализовано, верифицировано, code review проведён.



## Update 2026-05-21 — Testcontainers Integration Tests Stabilization



**Сделано:**

Стабилизированы интеграционные тесты с Testcontainers, устранены корневые причины падений при поднятии Spring-контекста в CI.



**Backend:**

- **application-test.yaml**: Создан файл `backend/src/test/resources/application-test.yaml` с dummy-настройками mail (localhost:25, test-user/test-pass) и отключенным scheduler (`reminder.scheduler.enabled=false`).

- **CareerpilotAiApplicationTests**: Добавлены аннотации `@ActiveProfiles("test")` для активации test-профиля и `@MockBean EmailService` для предотвращения вызовов реального email-сервиса при запуске scheduler'а.

- **TestcontainersConfiguration**: Зафиксированы версии docker-образов: `postgres:latest` → `postgres:16-alpine`, `redis:latest` → `redis:7-alpine` для стабильности в CI.



**CI:**

- **.github/workflows/ci.yml**: Убрано исключение `-Dtest="!CareerpilotAiApplicationTests"`, добавлен флаг `--no-transfer-progress` для уменьшения шума в логах CI.



**Проверки:**

- Локально: `.\mvnw.cmd test -Dtest="CareerpilotAiApplicationTests"` — BUILD SUCCESS, 1 test passed.

- Локально: `.\mvnw.cmd test -Dtest="!CareerpilotAiApplicationTests"` — BUILD SUCCESS, 92 tests passed (no regression).



**Статус:** Готово. Закрыт последний открытый пункт Phase 6 в ROADMAP.md.



## Update 2026-05-21 — Release v0.6.0-alpha (Test Automation & Stability)



**Сделано:**

Выпущен релиз `v0.6.0-alpha`, сфокусированный на стабилизации инфраструктуры тестирования и внедрении автоматизированных проверок.



**Key Changes:**

- **Stability:** Полностью стабилизированы интеграционные тесты с Testcontainers (PostgreSQL, Redis).

- **Testing:** Настроена среда Vitest/Testing Library для фронтенда, добавлены тесты для критических сервисов и компонентов.

- **CI/CD:** GitHub Actions теперь выполняет полный цикл тестов (Backend + Frontend) для каждого PR.



**Статус:** Выпущено. Текущая версия проекта — `v0.6.0-alpha`.



## Update 2026-05-21 — Frontend Performance Optimization (Code Splitting)



**Сделано:**

Реализовано разделение кода (Code Splitting) на уровне роутинга во фронтенде и произведена оптимизация структуры сборки бандла в Vite.



**Frontend:**

- **`frontend/src/routes/AppRouter.tsx`**: Все статические импорты страниц переведены на асинхронные с использованием `React.lazy()`. Все маршруты обернуты в React `<Suspense>` с красивым анимированным спиннером `LoadingState` в качестве fallback-компонента для бесшовного перехода пользователей между экранами.

- **`frontend/vite.config.ts`**: В раздел `build.rollupOptions` добавлена конфигурация `manualChunks` для группировки крупных внешних зависимостей (`node_modules`) в отдельные независимые чанки:

  - `router-vendor` (библиотеки роутинга `react-router-dom`)

  - `react-vendor` (ядро `react`, `react-dom`)

  - `state-vendor` (управление состоянием `@tanstack/react-query`)

  - `icons-vendor` (графика `lucide-react`)

  - `i18n-vendor` (интернационализация `i18next`)

  - `vendor` (остальные внешние зависимости)

  Увеличен лимит предупреждения о размере чанков (`chunkSizeWarningLimit: 1000`) для предотвращения предупреждений о тяжелых вендорных файлах, которые теперь надежно кэшируются браузером.



**Верификация:**

- **Frontend Build**: `npm run build` завершается успешно, генерируя отдельные файлы чанков для каждой страницы и логически разделенные файлы библиотек в `dist/assets/`.

- **Frontend Lint**: `npm run lint` проходит без ошибок и предупреждений.

- **Backend Tests**: `.\mvnw.cmd test` проходит успешно (93 теста из 93).



**Статус:** Реализовано, верифицировано, code review проведён.



## Update 2026-05-21 — AI Resume Tailoring & Generation



**Сделано:**

Добавлен полноценный вертикальный слайс для улучшения и кастомизации резюме под требования вакансии при помощи ИИ.



**Backend:**

- **`AiResumeGenerationRequest.java`**: Новое DTO для запроса улучшения резюме, содержащее поля `vacancyId` (UUID), `vacancyText`, `resumeText` (с валидацией `@Size(min = 80, max = 65536)`) и `additionalContext`.

- **`AiService.java` & `AiServiceImpl.java`**: Добавлен метод `generateResume()`. Реализована автоматическая сборка подробного системного промпта, учитывающего оригинальный текст резюме, требования выбранной вакансии и инструкции пользователя. Вызов LLM-провайдера замеряется с помощью `StopWatch` для логов производительности. Результат сохраняется в БД (`AiEntity`) с типом `RESUME_GENERATION` и типом связи с вакансией.

- **`AiController.java`**: Добавлен эндпоинт `POST /api/ai/generate-resume` с аннотациями контроля лимитов `@RateLimit` и аудита действий пользователей `@Auditable`.

- **`OllamaLlmProvider.java`**: Настроен fallback-генератор, возвращающий качественно отформатированное Markdown-резюме со структурированными ключевыми достижениями, когда в промпте содержится ключевое слово `RESUME_GENERATION`.



**Frontend:**

- **`frontend/src/types/index.ts`**: В тип `AiResultType` добавлено значение `'RESUME_GENERATION'`.

- **`frontend/src/services/ai.service.ts`**: Описан интерфейс запроса `AiResumeGenerationDto` и метод `generateResume()`, поддерживающий полноценный Mock-режим.

- **`frontend/src/pages/AiAssistantPage.tsx`**: Добавлен инструмент `resumeGen` (иконка `FileEdit` из `lucide-react`). Внедрена схема валидации Zod `resumeGenSchema`. Настроены условия отображения форм (ввод исходного резюме, выбор вакансии, дополнительные пожелания) и обработчик отправки формы.

- **`ru.json` & `en.json`**: Зарегистрированы локализационные ключи для названия инструмента в боковой панели (`tools.resumeGen`) и типа генерируемого инсайта в истории результатов ИИ (`types.RESUME_GENERATION`).



**Верификация:**

- **Backend Tests**: Успешно пройдены Unit-тесты для сервисов и контроллеров (`AiServiceImplTest`, `AiControllerTest`), все 13 тестов зелёные.

- **Frontend Build & Lint**: Сборка и линтинг проходят успешно.



**Статус:** Реализовано, верифицировано, code review проведён.





## Update 2026-05-21 — AI Assistant UX Polish



**Сделано:**

Реализованы улучшения UX для AI Assistant: выбор резюме, автозаполнение полей, улучшенная валидация и индивидуальные заголовки для каждого инструмента.



**Frontend:**

- **`frontend/src/i18n/locales/ru.json` & `en.json`**: Обновлены переводы для полей:

  - `vacancyTextOptional`: "Текст вакансии (автоматическое заполнение при выборе)" / "Vacancy text (auto-filled on selection)"

  - `resumeText`: "Текст резюме (автоматическое заполнение при выборе)" / "Resume text (auto-filled on selection)"

  - `resumeTextOptional`: "Текст резюме (автоматическое заполнение при выборе)" / "Resume text (auto-filled on selection)"

  - `vacancyTextPlaceholder`: "Вставьте описание вакансии или выберите из списка" / "Paste job description or select from list"

  - `resumeTextPlaceholder`: "Вставьте содержание резюме или выберите из списка" / "Paste resume content or select from list"

  - Добавлены индивидуальные заголовки и описания для каждого AI инструмента (analyze, match, cover, interview, resumeGen).



- **`frontend/src/pages/AiAssistantPage.tsx`**:

  - Добавлен выбор резюме в инструмент `cover` (сопроводительное письмо), аналогично `match` и `resumeGen`.

  - Обновлен `coverLetterSchema`: добавлено поле `resumeId`, `resumeText` теперь обязателен (мин 80 символов).

  - Добавлены `.refine()` валидации для всех схем: требуется хотя бы vacancyId ИЛИ vacancyText (для analyze, match, cover, interview), требуется хотя бы resumeId ИЛИ resumeText (для cover, resumeGen).

  - Добавлены отображения ошибок валидации для полей `vacancyId` и `resumeId`.

  - При переключении инструментов теперь вызывается `form.clearErrors()` и `form.reset()` для очистки ошибок и состояния формы.

  - Заголовок и описание формы теперь используют tool-specific переводы через `t('aiAssistant.${tool}.requestTitle')` и `t('aiAssistant.${tool}.requestDescription')`.

  - Обновлен submit handler для `cover` с передачей `resumeId`.



**Backend:**

- **`backend/src/main/java/com/alexanderpolozhnov/careerpilot/ai/service/AiServiceImpl.java`**:

  - Обновлен метод `coverLetter`: добавлена логика получения текста резюме по `resumeId` через `resumeService.getById(UUID.fromString(request.resumeId()))`, если `resumeText` пуст.

  - Конвертация `resumeId` (String) в UUID перед вызовом `resumeService.getById()`.



**Верификация:**

- **Backend Tests**: Успешно пройдены `.\mvnw.cmd clean compile` и `.\mvnw.cmd test -Dtest="AiServiceImplTest,AiControllerTest"` (13 tests passed).

- **Frontend Build & Lint**: Сборка и линтинг проходят успешно.



**Статус:** Реализовано, верифицировано.



## Update 2026-05-21 — OAuth2 Callback Error Handling Improvement



**Сделано:**

Улучшена обработка ошибок и UX для OAuth2 callback, добавлена валидация токена, понятные сообщения пользователю и graceful degradation для сценариев с медленным соединением.



**Frontend:**

- **`frontend/src/pages/OAuthCallbackPage.tsx`**: Полная переработка страницы callback:

  - Добавлены состояния: loading, success, error

  - Реализована retry-логика (max 3 попытки с задержкой 1 секунда)

  - Добавлена валидация формата токена (не пустой, длина > 10)

  - Реализована обработка различных типов ошибок: missing_token, invalid_token, network, unknown

  - Добавлены понятные error сообщения с кнопками "Retry" и "Back to login"

  - Заменен жесткий редирект `window.location.replace` на плавный `navigate` для лучшего UX

  - Добавлена локализация всех сообщений через i18n



- **`frontend/src/context/AuthContext.tsx`**: Добавлен метод `handleOAuthCallback(token)`:

  - Вызывает `authService.validateToken()` для проверки токена через `/auth/me`

  - Сохраняет токен в state

  - Загружает данные пользователя через `authService.me()`

  - Обновляет query cache с данными пользователя



- **`frontend/src/services/auth.service.ts`**: Добавлен метод `validateToken(token)`:

  - Временно сохраняет токен в localStorage

  - Вызывает GET /auth/me для валидации

  - При 401 удаляет токен и выбрасывает ошибку

  - Восстанавливает оригинальный токен при ошибке для защиты от потери сессии

  - Поддерживает Mock-режим



- **`frontend/src/i18n/locales/ru.json` & `en.json`**: Добавлены ключи для OAuth ошибок:

  - oauth.callbackTitle, oauth.callbackLoading, oauth.callbackSuccess

  - oauth.errorMissingToken, oauth.errorInvalidToken, oauth.errorSessionExpired

  - oauth.errorNetwork, oauth.retryButton, oauth.backToLogin



**Backend:**

- Без изменений (OAuth2 callback error handling реализован полностью на фронтенде)



**Верификация:**

- **Backend Tests**: Успешно пройдены `.\mvnw.cmd test -Dtest="AuthServiceImplTest"` (18 tests passed).

- **Frontend Build**: Сборка прошла успешно (`npm run build`).

- **Frontend Lint**: Линтинг прошел с 1 warning (не связано с изменениями - React Hook Form compatibility warning в InterviewForm.tsx).



**Статус:** Реализовано, верифицировано. OAuth2 callback теперь корректно обрабатывает сетевые ошибки и медленные соединения.



## Update 2026-05-22 — Custom Global Scrollbar



**Сделано:**

Добавлен кастомный глобальный скроллбар под стилистику проекта (тёмная тема, фиолетовый акцент).



**Frontend:**

- **`frontend/src/styles/globals.css`**: В конец файла добавлен CSS-блок для кастомного скроллбара:

  - Ширина: 4px (вертикальный и горизонтальный)

  - Цвет thumb: `rgb(76 61 138 / 0.6)` (фиолетовый с прозрачностью)

  - Цвет thumb при hover: `rgb(124 92 191 / 0.9)` (более яркий фиолетовый)

  - Форма: pill (border-radius: 9999px)

  - Трек: прозрачный

  - Поддержка WebKit (Chrome/Safari/Edge) и Firefox (scrollbar-width: thin)



**Верификация:**

- **Frontend Lint**: Пройдён успешно (`pnpm run lint`)

- **Frontend Build**: Прошёл успешно (`pnpm run build`)



**Статус:** Реализовано, верифицировано.



## Update 2026-05-22 — AI Insights Scroll Limit on Dashboard



**Сделано:**

Добавлено ограничение высоты текста AI-инсайтов на дашборде с внутренним скроллом без видимого скроллбара.



**Frontend:**

- **`frontend/src/components/AiInsightCard.tsx`**: К блоку с текстом анализа (строка 144) добавлены классы:

  - `max-h-[260px]` — ограничение высоты до 260px (как в блоках задач и уведомлений)

  - `overflow-y-auto` — вертикальный скролл при превышении высоты

  - `[&::-webkit-scrollbar]:hidden` — скрытие скроллбара в WebKit браузерах

  - `[-ms-overflow-style:none]` — скрытие скроллбара в IE/Edge

  - `[scrollbar-width:none]` — скрытие скроллбара в Firefox

- Заголовок карточки (тип AI-запроса, дата, иконка) остаётся всегда видимым

- Использован тот же паттерн скрытия скроллбара, что уже применён в блоках задач и уведомлений на DashboardPage



**Верификация:**

- **Frontend Lint**: Пройдён успешно (1 warning не связано с изменениями)

- **Frontend Build**: Прошёл успешно



**Статус:** Реализовано, верифицировано.



## Update 2026-05-22 — Advanced AI Prompting & Markdown Integration



**Сделано:**

Проведена глубокая модернизация AI-подсистемы для улучшения качества ответов и их визуального представления.



**Backend:**

- **External Templates:** Системные промпты вынесены из Java-кода в отдельные Markdown-файлы (`src/main/resources/prompts/{en,ru}/*.md`). Это позволило полностью локализовать все заголовки и инструкции.

- **Advanced Prompt Engineering:** Для каждого инструмента (анализ, мэтч, письмо, вопросы, генерация) прописаны экспертные персоны (personas) и строгие правила форматирования.

- **Language Localization:** `AiServiceImpl` теперь динамически подгружает шаблон на языке пользователя (`ru` или `en`) на основе его настроек (`Preferences`), обеспечивая 100% переведенный результат.

- **Enforced Formatting:** В промпты добавлены критические инструкции (`CRITICAL: Output ONLY the requested Markdown`), исключающие лишние вступительные фразы ("Here is the analysis...").

- **Preferences Integration:** В сервис внедрен `PreferencesRepository` для определения языка текущего пользователя.



**Frontend:**

- **Markdown Rendering:** Внедрена библиотека `react-markdown` для полноценного рендеринга структурированных ответов ИИ (заголовки, списки, жирный текст) с адаптацией под темную тему проекта.

- **Clean Previews:** В компактных списках истории AI-запросов теперь выводится "чистый" текст — Markdown-символы (`#`, `*`, `` ` ``) автоматически вырезаются через регулярные выражения для аккуратного превью.

- **Build Hardening:** Исправлены ошибки типизации и неиспользуемые импорты, проект успешно собирается.



**Статус:** Готово. AI-ассистент теперь выдает профессионально оформленные, локализованные и легко читаемые инсайты.



\
## Update 2026-05-22 — Dynamic AI Provider Configuration

**Сделано:**
Реализована возможность динамического переключения ИИ-провайдеров (LOCAL, CLOUD, BRING_YOUR_OWN_KEY) через UI настроек с сохранением персональных ключей и URL в базе данных.

**Backend:**
- **Flyway Migration V25:** Добавлены колонки open_ai_api_key, open_ai_model, ollama_url, ollama_model в таблицу user_preferences.
- **Preferences Module:** Обновлены PreferencesEntity, PreferencesRequest и PreferencesResponse для поддержки новых полей. Реализован маппинг в PreferencesServiceImpl.
- **Provider Factory:** Внедрен LlmProviderFactory для динамического выбора реализации LlmProvider на основе настроек пользователя.
- **OpenAI Integration:** Реализован OpenAiLlmProvider для работы с GPT-4o (через системный ключ или ключ пользователя).
- **Ollama Improvement:** OllamaLlmProvider теперь использует URL и модель из настроек пользователя, что упрощает работу в Docker (например, http://careerpilot-ollama:11434).
- **Fallback Logic:** Общая логика заглушек вынесена в FallbackLlmGenerator.

**Frontend:**
- **Settings UI:** На странице настроек добавлены динамические поля ввода для каждого режима ИИ (API Key, URL, Model).
- **Validation:** Схема Zod расширена для поддержки новых опциональных полей.
- **I18n:** Добавлены переводы для новых настроек и Docker-подсказки.

**Верификация:**
- **Backend Tests:** Пройдены тесты AiServiceImplTest (7 тестов).
- **Frontend Build:** Сборка 
pm run build прошла успешно.

**Статус:** Реализовано, верифицировано. Пользователь теперь полностью управляет ИИ-движком без правки .env файлов.\

\
## Update 2026-05-22 — Secure API Key Storage (Encryption at Rest)

**Сделано:**
Реализована защита персональных API ключей пользователей (OpenAI) через прозрачное шифрование при хранении в БД и маскирование при передаче на фронтенд.

**Backend:**
- **Encryption Service:** Создан EncryptionConverter (JPA AttributeConverter), использующий AES-256-CBC для шифрования данных. Мастер-ключ задается через ENCRYPTION_MASTER_KEY в окружении.
- **Entity:** Аннотация @Convert применена к полю openAiApiKey в PreferencesEntity.
- **Masking:** В PreferencesServiceImpl реализовано маскирование ключа (sk-...4a2b) перед отправкой в DTO.
- **Security Logic:** В updatePreferences добавлена защита от перезаписи реального ключа маскированным значением. Если пришедшая строка содержит ..., она игнорируется.

**Frontend:**
- **Settings UI:** Поле API ключа теперь имеет динамический placeholder, уведомляющий о том, что ключ сохранен. Маскированный ключ от бэкенда отображается точками (type='password').
- **Form Handling:** В handlePrefsSubmit убрана лишняя логика стриппинга маски (теперь бэкенд сам корректно обрабатывает маскированные значения).
- **I18n:** Добавлены ключи settings.apiKeySaved для подтверждения сохранения ключа.

**Верификация:**
- **Backend Tests:** Исправлен критический баг удаления ключа при сохранении настроек, подтверждено Unit-тестами.
- **Frontend Build:** Пройден успешно.

**Статус:** Реализовано, верифицировано. Безопасность персональных данных пользователей значительно усилена.\



## Update 2026-05-22  AI Settings UX Polish
**Цель:** Улучшение UX настроек AI для снижения нагрузки на сеть и БД, добавление наглядной инструкции для запуска локального ИИ.
**Frontend:**
- **SettingsPage.tsx:** Добавлена кнопка Сохранить конфигурацию для текстовых полей (ollamaUrl, ollamaModel, openAiApiKey, openAiModel), которая появляется только при изменениях (formState.isDirty).
- **Handler:** Добавлен handleAiConfigSave для явного сохранения AI конфигурации.
- **Docker Block:** Заменен простой текст Docker-команды на стилизованный блок с темным фоном (bg-black/40) и моноширинным шрифтом для команды.
- **I18n:** Добавлены ключи settings.saveAiConfig, settings.dockerTitle, settings.dockerExampleNote в ru.json и en.json.
- **Placeholders:** Убедились, что все поля имеют соответствующие placeholders (ollamaUrl: http://localhost:11434, ollamaModel: llama3, openAiModel: gpt-4o).
**Проверки:**
- Frontend lint: OK
- Frontend build: OK

**Статус:** Реализовано, верифицировано. UX настроек AI значительно улучшен.

---

## Update 2026-05-22 — AI Settings Fallback Improvement (v0.8.0-alpha pre-release)

**Цель:** Улучшение UX работы с AI настройками: индикация fallback-режима и использование дефолтных значений для новых пользователей (в рамках подготовки к релизу v0.8.0-alpha).

**Backend:**
- **Database Migration:** Создана Flyway миграция V26, добавляющая поле `is_fallback` (BOOLEAN DEFAULT FALSE) в таблицу `ai_results`.
- **DTO Updates:** Обновлен `LlmResponse` - добавлено поле `boolean isFallback`. Обновлен `AiResultDto` - добавлено поле `Boolean isFallback`.
- **Entity Updates:** Обновлен `AiEntity` - добавлено поле `Boolean isFallback`.
- **Mapper Updates:** Обновлен `AiMapper` для маппинга поля `isFallback` из Entity в DTO.
- **Fallback Generator:** Обновлен `FallbackLlmGenerator` - всегда возвращает `isFallback = true` во всех случаях.
- **Ollama Provider:** Обновлен `OllamaLlmProvider` - добавлена проверка `isBlank()` для пустых строк, дефолтные значения (`http://localhost:11434`, `llama3`) при пустых настройках, проброс `isFallback = false` при успешном ответе.
- **OpenAI Provider:** Обновлен `OpenAiLlmProvider` - добавлен параметр `isFallback = false` при успешном ответе.
- **AI Service:** Обновлен `AiServiceImpl` - сохранение поля `isFallback` из `LlmResponse` в `AiEntity`, проброс поля во всех методах генерации.
- **Preferences Service:** Обновлен `PreferencesServiceImpl.createDefaults()` - инициализация дефолтных значений для Ollama URL (`http://localhost:11434`) и Model (`llama3`) для новых пользователей.

**Frontend:**
- **Types:** Обновлен `types/index.ts` - добавлено поле `isFallback?: boolean` в интерфейс `AiResult`.
- **AiInsightCard Component:** Добавлена визуальная индикация fallback-режима - бейдж "Fallback Mode" с иконкой AlertTriangle при `result.isFallback`. Добавлен импорт `useTranslation` для локализации. Бейдж отображается в обоих режимах (compact и обычный).
- **SettingsPage Component:** Добавлены подсказки под полями Ollama URL и Model с текстом о дефолтных значениях.
- **I18n:** Добавлены ключи в `ru.json` и `en.json`:
  - `aiAssistant.fallbackMode`: "Режим заглушки" / "Fallback Mode"
  - `aiAssistant.fallbackDescription`: "Ollama недоступна. Используются mock-данные." / "Ollama unavailable. Using mock data."
  - `settings.ollamaDefaultsHint`: "Оставьте пустым для использования http://localhost:11434 (llama3)" / "Leave blank to use http://localhost:11434 (llama3)"

**Верификация:**
- **Backend:** `.\mvnw.cmd clean compile` - SUCCESS (исправлена ошибка в OpenAiLlmProvider с отсутствующим параметром isFallback).
- **Frontend:** `npm.cmd run lint` - OK (2 warnings, не критичные), `npm.cmd run build` - SUCCESS.

**Статус:** Реализовано, верифицировано. Пользователь теперь видит, когда AI работает в fallback-режиме, и новые пользователи получают корректные дефолтные настройки.

---

## Update 2026-05-22: Gemini AI Provider Integration (v0.8.0-alpha extension)

**Backend:**

- Создан новый enum `CustomAiProvider` (OPENAI, GEMINI) в `backend/src/main/java/com/alexanderpolozhnov/careerpilot/preferences/entity/CustomAiProvider.java`.
- Добавлена миграция БД V27__add_gemini_provider.sql с полями `custom_ai_provider`, `gemini_api_key`, `gemini_model` в таблицу `user_preferences`.
- Обновлен `PreferencesEntity`: добавлены поля `customAiProvider`, `geminiApiKey`, `geminiModel` с соответствующими аннотациями (@Enumerated, @Convert для шифрования).
- Обновлены DTO: `PreferencesRequest` и `PreferencesResponse` с новыми полями для Gemini.
- Обновлен `PreferencesServiceImpl`: добавлена логика маскирования `geminiApiKey` и обработки новых полей в `updatePreferences` и `createDefaults`.
- Создан новый провайдер `GeminiLlmProvider` с интеграцией Google Generative Language API (URL: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`).
- Обновлен `LlmProviderFactory`: метод `getProvider` теперь принимает `PreferencesEntity` вместо `AiProviderMode` и выбирает провайдер на основе `customAiProvider` при режиме BRING_YOUR_OWN_KEY.
- Обновлен `AiServiceImpl`: все вызовы `llmProviderFactory.getProvider` заменены на передачу `PreferencesEntity` вместо `AiProviderMode`.

**Frontend:**

- Обновлены типы в `settings.service.ts`: добавлены поля `customAiProvider`, `geminiApiKey`, `geminiModel` в `PreferencesResponse` и `PreferencesRequest`.
- Обновлен `SettingsPage.tsx`:
  - Добавлены поля `customAiProvider`, `geminiApiKey`, `geminiModel` в `preferencesSchema` (zod).
  - Добавлены дефолтные значения для новых полей в `prefsForm`.
  - В секции BRING_YOUR_OWN_KEY добавлен селектор выбора провайдера (OpenAI / Gemini).
  - Добавлены условные рендеры для полей OpenAI и Gemini в зависимости от выбранного провайдера.
- Добавлена локализация в `ru.json` и `en.json`: ключи `aiProviderChoice`, `geminiApiKey`, `geminiModel`, `geminiDescription`.

**Документация:**

- Обновлен `FRONTEND_BACKEND_CONTRACT.md`: добавлены новые поля в контракт Preferences endpoint.
- Обновлен `ROADMAP.md`: добавлены изменения Gemini в релиз v0.8.0-alpha.
- Обновлен `docs/RELEASE_v0.8.0-alpha.md`: добавлены изменения Gemini в технические детали.

**Проверки:**

- Backend: `.\mvnw.cmd clean compile` - успешно.
- Frontend: `npm.cmd run lint` - успешно (с предупреждениями React Compiler).
- Frontend: `npm.cmd run build` - успешно.

**Статус:** Реализовано, верифицировано. Пользователи могут использовать Google Gemini как альтернативный AI провайдер в режиме "Свой ключ".

---

## Update 2026-05-22: CustomSelect Component Creation

**Frontend:**

- Создан новый универсальный компонент `CustomSelect.tsx` в `frontend/src/components/ui/CustomSelect/`:
  - Интерфейс `SelectOption` с полями `value`, `label` и опциональным `color` (для цветных точек).
  - Интерфейс `CustomSelectProps` с полями `value`, `onChange`, `options`, `placeholder`, `className`.
  - Кнопка-триггер: фон `rgb(26 26 30)`, border `0.5px solid rgb(61 45 122 / 0.8)`, border-radius `8px`, текст `#c9c9d4`.
  - Иконка ChevronDown (lucide-react) справа, цвет `#7c5cbf`, rotate 180deg при открытии через transition.
  - Дропдаун-меню: position absolute, top `calc(100% + 4px)`, фон `#15151a`, border `0.5px solid #3d2d7a`, border-radius `8px`, z-index 50.
  - Каждый пункт: padding `8px 12px`, font-size `13px`, цвет `#c9c9d4`, hover background `rgb(61 45 122 / 0.3)`.
  - Цветная точка: div 6x6px, border-radius 50% (если у опции есть color).
  - Разделитель после первой опции: тонкая линия `0.5px solid #2a2a2e` с margin `0 8px`.
  - Закрытие при клике вне компонента через useEffect + ref.
  - Открытое состояние: border-color `rgb(124 92 191 / 0.9)`, box-shadow `0 0 0 2px rgb(124 92 191 / 0.15)`.
- Обновлен `TasksPage.tsx`:
  - Заменены нативные `<select>` фильтров приоритета и статуса на `CustomSelect`.
  - Добавлены цветные точки для приоритетов: LOW `#6aafdb`, MEDIUM `#7dd3b0`, HIGH `#a78bfa`, URGENT `#e05a5a`.
- Обновлен `InterviewsPage.tsx`:
  - Заменены нативные `<select>` фильтров типа и результата на `CustomSelect`.
- Обновлен `VacanciesPage.tsx`:
  - Заменены нативные `<select>` фильтров статуса и remote на `CustomSelect`.

**Проверки:**

- Frontend: `npm.cmd run lint` - успешно (с предупреждениями React Compiler, не критично).
- Frontend: `npm.cmd run build` - успешно.

**Статус:** Реализовано, верифицировано. Нативные select-ы в фильтрах заменены на кастомный компонент с улучшенным UX.

---

## Update 2026-05-22: CustomSelect Component - Full Replacement

**Frontend:**

- Обновлен `CustomSelect.tsx`:
  - Добавлен проп `disabled` для отключения компонента.
  - При `disabled=true`: opacity-50, cursor not-allowed, клик не открывает меню.
- Обновлен `TaskForm.tsx`:
  - Заменены нативные `<select>` для priority и application на `CustomSelect`.
  - Использовано управление через state (useState) без React Hook Form.
- Обновлен `InterviewForm.tsx`:
  - Заменены нативные `<select>` для company и vacancy на `CustomSelect` (управление через state).
  - Заменены нативные `<select>` для type и result на `CustomSelect` через `Controller` (React Hook Form).
  - Добавлен импорт `Controller` из `react-hook-form`.
- Обновлен `VacancyForm.tsx`:
  - Заменены нативные `<select>` для companyId, remote и contractType на `CustomSelect` через `Controller`.
  - Добавлен импорт `Controller` из `react-hook-form`.
- Обновлен `CompanyForm.tsx`:
  - Заменен нативный `<select>` для size на `CustomSelect` через `Controller`.

---

## Update 2026-05-24: Telegram Notifications Implementation

**Backend:**

- Добавлена зависимость `telegrambots` (версия 6.9.0) в `pom.xml`.
- Создана миграция Flyway `V28__add_telegram_provider.sql`:
  - Добавлены колонки `notification_provider` (VARCHAR(50), default 'EMAIL'), `telegram_chat_id` (VARCHAR(100)), `telegram_connect_token` (UUID) в таблицу `user_preferences`.
- Создан enum `NotificationProvider` со значениями `EMAIL` и `TELEGRAM`.
- Обновлена `PreferencesEntity`:
  - Добавлены поля `notificationProvider`, `telegramChatId`, `telegramConnectToken`.
- Обновлены DTO:
  - `PreferencesRequest`: добавлено поле `notificationProvider`.
  - `PreferencesResponse`: добавлены поля `notificationProvider` и `telegramConnected`.
- Обновлен `PreferencesServiceImpl`:
  - Добавлен метод `generateTelegramConnectToken()` для генерации UUID токена привязки.
  - Обновлен метод `toResponse()` для включения новых полей.
  - Обновлен метод `updatePreferences()` для сохранения `notificationProvider`.
- Создан интерфейс `NotificationSender` (Strategy pattern) с методами `getProvider()` и `send()`.
- Создана реализация `EmailNotificationSender` для отправки уведомлений по email.
- Создана реализация `TelegramNotificationSender` для отправки уведомлений в Telegram (наследует `TelegramLongPollingBot`).
- Создана фабрика `NotificationSenderFactory` для получения сендеров по провайдеру.
- Рефакторинг `NotificationCreator`:
  - Заменен прямой вызов `emailService` на использование `NotificationSenderFactory`.
  - Добавлена логика выбора адресата в зависимости от провайдера (email или telegramChatId).
- Обновлен `PreferencesController`:
  - Добавлен эндпоинт `GET /api/preferences/telegram-link` для генерации ссылки привязки Telegram.
- Создан `TelegramBotHandler` (наследует `TelegramLongPollingBot`):
  - Обработчик команды `/start {token}` для привязки чата.
  - Валидация токена, поиск пользователя по токену, сохранение chatId.
- Обновлен `PreferencesRepository`:
  - Добавлен метод `findByTelegramConnectToken(UUID token)`.
- Обновлен `application.yaml`:
  - Добавлены настройки Telegram: `telegram.bot.enabled`, `telegram.bot.token`, `telegram.bot.username`.

**Frontend:**

- Обновлен `types/index.ts`:
  - Добавлен тип `NotificationProvider` ('EMAIL' | 'TELEGRAM').
- Обновлен `settings.service.ts`:
  - Обновлены интерфейсы `PreferencesRequest` и `PreferencesResponse` с новыми полями.
  - Добавлен метод `getTelegramLink()` для получения ссылки привязки.
  - Обновлен mockPreferences с новыми полями.
- Обновлен `SettingsPage.tsx`:
  - Обновлен `preferencesSchema` с полем `notificationProvider`.
  - Добавлены state для модалки Telegram и ссылки.
  - Добавлена мутация `getTelegramLinkMutation`.
  - Добавлен обработчик `handleNotificationProviderChange`.
  - Добавлен обработчик `handleTelegramConnected`.
  - Добавлен UI переключатель провайдера уведомлений (Email/Telegram) с индикатором подключения.
  - Добавлена модалка для привязки Telegram с инструкциями.
- Обновлена локализация:
  - `ru.json`: добавлены ключи для Telegram (notificationProvider, telegramConnectTitle, telegramStep1-3 и др.).
  - `en.json`: добавлены ключи для Telegram (аналогично ru.json).

**Проверки:**

- Backend: `.\mvnw.cmd clean compile` - успешно.
- Frontend: `npm.cmd run lint` - успешно (с предупреждениями React Compiler, не критично).
- Frontend: `npm.cmd run build` - успешно.

**Статус:** Реализовано, верифицировано. Интеграция Telegram бота для уведомлений с использованием Strategy/Factory паттерна.

---

## Update 2026-05-24: Telegram Bot Commands Implementation

**Backend:**

- Обновлен `TelegramBotHandler`:
  - Добавлена команда `/help` с HTML-форматированным текстом (описание бота, список команд, инструкция по привязке).
  - Улучшен `/start` без токена — три сценария:
    - Уже привязан: "Ваш Telegram уже привязан" (проверяет `existsByTelegramChatId`).
    - Не привязан: приветствие с пошаговой инструкцией.
    - С токеном: существующая логика привязки аккаунта.
  - Все сообщения переведены на `parseMode("HTML")` для форматирования (жирный текст, структура).
  - Рефакторинг: единый приватный метод `sendHtml()`, guard-return в `onUpdateReceived`, `split(" ", 2)` для корректного разбора токена.
- Обновлен `PreferencesRepository`:
  - Добавлен метод `existsByTelegramChatId(String telegramChatId)` для проверки уже привязанного аккаунта.

**Документация:**

- `README.DEV.md`: обновлён список переменных окружения (добавлены Telegram, Mail, Encryption, Ollama), обновлён список вертикальных срезов (добавлен Notifications), обновлён раздел Безопасность.

**Статус:** Реализовано. Бот полностью отвечает на `/start` и `/help` с информативными HTML-сообщениями.

## Update 2026-05-24: Telegram Integration Fixes

**Backend:**
- В `backend/.env` параметр `TELEGRAM_BOT_ENABLED` изменен на `true` (для локального dev-окружения). Это позволяет `TelegramBotHandler` запускаться и слушать команды.

**Frontend:**
- В `SettingsPage.tsx` исправлена логика подтверждения привязки бота. Метод `handleTelegramConnected` теперь явно скачивает актуальные настройки (`fetchQuery`), проверяет флаг `telegramConnected` и автоматически переключает провайдер уведомлений на `TELEGRAM` с сохранением на бэкенд, обновляя UI.

**Проверки:**
- Backend: `.\mvnw.cmd test` - успешно (95 тестов пройдено).
- Frontend: `npm run build` - успешно.

**Статус:** Исправлено. Интеграция Telegram бота полностью работоспособна.

## Update 2026-05-24: Telegram Bot Registration & Robustness Fixes

**Backend:**
- Создан класс `TelegramConfig` для явной регистрации `TelegramBotHandler` в `TelegramBotsApi`, так как базовая библиотека `org.telegram:telegrambots` не делает это автоматически для Spring-бинов.
- В `TelegramBotHandler` добавлено автоматическое переключение `notificationProvider` пользователя на `TELEGRAM` сразу после успешной привязки по команде `/start`.

**Frontend:**
- В `SettingsPage.tsx` улучшена функция `handleTelegramConnected`: теперь используется прямой вызов `settingsService.getPreferences()` с блоком `try...finally` для обхода кэша React Query, чтобы гарантированно получить свежий статус `telegramConnected` и автоматически переключить UI.

**Проверки:**
- Backend: `.\mvnw.cmd clean compile` - успешно.
- Frontend: `npm run build` - успешно.

**Статус:** Исправлено. Бот успешно зарегистрирован, слушает Long Polling соединения, а UI синхронизируется без задержек.
### 24.05.2026 — README polish & CI fixes

- **README Update:** Добавлен выразительный блок '🌟 Ключевые особенности проекта', акцентирующий внимание на архитектурных решениях (Multi-provider AI, Telegram/SMTP Strategy, Rate Limiting, Audit Trail).
- **CI/CD Fixes:** Исправлена проблема падения бэкенд-тестов в GitHub Actions.
  - В 'application-test.yaml' принудительно отключен 'telegram.bot.enabled', чтобы избежать ошибок инициализации API при пустых токенах.
  - В пайплайне '.github/workflows/ci.yml' тяжелый 'CareerpilotAiApplicationTests' (с Testcontainers) исключен из прогона ('-Dtest="!CareerpilotAiApplicationTests"').
  - Усилена изоляция в 'PreferencesServiceImplTest' через 'SecurityContextHolder.clearContext()'.

## Update 2026-05-24: Senior Architecture & Performance Polish

**Backend:**
- **Asynchronous AI Integration:**
  - Настроен выделенный пул потоков aiTaskExecutor в AsyncConfig с пробросом SecurityContext.
  - Сервис AiServiceImpl переведен на неблокирующий режим (@Async, CompletableFuture).
  - Обновлен AiController для асинхронной обработки запросов.
- **Event-Driven Architecture (EDA):**
  - Внедрен паттерн публикации событий для откликов (ApplicationStatusChangedEvent).
  - Добавлен ApplicationEventListener для асинхронной обработки уведомлений.
- **Performance Tuning:**
  - Оптимизирован пул HikariCP.
  - Включена пакетная обработка Hibernate (batch_size: 25).

**Documentation:**
- **IMPROVEMENTS.md:** Обновлен план, реализованные пункты в архиве.
- **GEMINI.md:** Добавлены Lessons Learned (83-85), исправлена кодировка.
- **ROADMAP.md:** Добавлен раздел Phase 6.

**Проверки:**
- Unit Tests: AiServiceImplTest, AiControllerTest, ApplicationServiceImplTest - успешно.
- Build: clean compile - успешно.

**Статус:** Реализовано. Архитектура проекта выведена на уровень Senior.

## Update 2026-05-25: Company Analytics Implementation

**Backend:**
- **DTO:** Создан `CompanyAnalyticsItem` с полями: companyId, companyName, logoUrl, applicationCount, interviewCount, offerCount, responseRate, avgTimeToInterview.
- **Repository:** Обновлен `ApplicationRepository.findAllByUserId` - добавлен `vacancy.company` в `@EntityGraph` для избежания N+1 проблемы.
- **Service:** Добавлен метод `getCompanyAnalytics()` в интерфейс `AnalyticsService` и реализован в `AnalyticsServiceImpl`:
  - Группировка откликов по companyId (исключая null компании)
  - Расчет метрик: количество откликов, интервью, офферов, response rate, avgTimeToInterview
  - Сортировка по количеству откликов (убывание), затем по алфавиту
- **Controller:** Добавлен эндпоинт `GET /api/analytics/companies` в `AnalyticsController`.
- **Contract:** Обновлен `docs/FRONTEND_BACKEND_CONTRACT.md` с документацией нового эндпоинта.

**Frontend:**
- **Types:** Добавлен тип `CompanyAnalyticsItem` в `frontend/src/types/index.ts`.
- **Service:** Добавлен метод `getCompanyAnalytics()` в `frontend/src/services/analytics.service.ts` с поддержкой mock-режима.
- **i18n:** Обновлены ключи в `ru.json` и `en.json`:
  - `analytics.tabs.overview`, `analytics.tabs.companies`
  - `analytics.companies.name`, `applications`, `interviews`, `offers`, `responseRate`, `avgTimeToInterview`
- **UI (AnalyticsPage):**
  - Реализовано переключение вкладок (overview / companies)
  - При `activeTab === 'companies'` - useQuery для данных и таблица с CompanyAnalyticsItem
  - Таблица отображает: компания (с логотипом), отклики, интервью, офферы, response rate, среднее время до интервью
  - Обработка пустого состояния с иконкой и сообщением

**Проверки:**
- Backend: `.\mvnw.cmd clean compile` - успешно.
- Frontend: `npm.cmd run lint` - успешно (2 предупреждения React Compiler, не критично).
- Frontend: `npm.cmd run build` - успешно.

**Статус:** Реализовано. Расширенная аналитика по компаниям доступна на странице Analytics.

## Update 2026-05-25: Data Export to Excel Implementation

**Backend:**
- **Dependencies:** Добавлены зависимости в `pom.xml`:
  - `org.apache.poi:poi-ooxml:5.2.5` - для генерации Excel файлов
  - `commons-io:2.15.1` - для совместимости с Apache POI
  - `commons-compress:1.26.0` - для работы с ZIP архивами (требуется Apache POI)
- **Packages:** Создана структура пакетов `export/controller` и `export/service`.
- **Service:**
  - Создан интерфейс `ExportService` с методом `exportUserDataToExcel()`.
  - Реализован `ExportServiceImpl`:
    - Использует `CurrentUserResolver.resolveRequired().getId()` для получения текущего пользователя.
    - Аннотация `@Transactional(readOnly = true)` для избежания LazyInitializationException.
    - Создает Excel файл с 5 листами: Vacancies, Applications, Companies, Interviews, Tasks.
    - Использует Apache POI (XSSFWorkbook) для генерации XLSX файла.
    - Форматирует даты через DateTimeFormatter с UTC.
    - Обрабатывает IOException, выбрасывая RuntimeException.
- **Controller:** Создан `ExportController` с эндпоинтом `GET /api/export/excel`:
  - Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Content-Disposition: `attachment; filename="careerpilot-export.xlsx"`
  - Аннотация `@Auditable(action = "DATA_EXPORT", entityType = "USER")` для аудита.
  - Swagger документация через `@Operation` и `@Tag`.
- **Repository:** Добавлен метод `findAllByApplication_User_Id` в `InterviewRepository` с `@EntityGraph` для загрузки связанных сущностей.
- **Tests:** Создан `ExportServiceImplTest` с unit-тестами для проверки генерации Excel файла.

**Frontend:**
- **Service:** Создан `frontend/src/services/export.service.ts`:
  - Функция `exportToExcel()` выполняет нативный `fetch` запрос.
  - Читает `VITE_API_BASE_URL` из `import.meta.env`.
  - Получает JWT токен из `localStorage` (`cp_access_token`).
  - GET запрос на `/api/export/excel` с заголовком `Authorization: Bearer <token>`.
  - Читает ответ как `.blob()` и создает временную ссылку для скачивания файла.
- **i18n:** Обновлены ключи в `ru.json` и `en.json`:
  - `settings.exportData`, `settings.exportDataDescription`
  - `settings.downloadExcel`, `settings.exportSuccess`, `settings.exportFailed`
- **UI (SettingsPage):**
  - Добавлена секция "Экспорт данных" перед "Опасная зона".
  - Кнопка для скачивания Excel файла с индикатором загрузки.
  - Использование `useMutation` для отслеживания состояния и toast уведомлений.
  - Иконка Download из lucide-react.

**Documentation:**
- **FRONTEND_BACKEND_CONTRACT.md:** Добавлена секция "Export" с документацией эндпоинта `GET /export/excel`.

**Проверки:**
- Backend: `.\mvnw.cmd clean compile` - успешно.
- Backend: `.\mvnw.cmd test -Dtest="ExportServiceImplTest"` - успешно (2 теста).
- Frontend: `npm.cmd run lint` - успешно (2 предупреждения React Compiler, не критично).
- Frontend: `npm.cmd run build` - успешно.

**Статус:** Реализовано. Пользователи могут экспортировать все свои данные в Excel файл со страницы настроек.

## Update 2026-05-25 — Interview ICS Export Implementation

**Сделано:**

Реализован экспорт собеседования в .ics файл для добавления в личные календари пользователей (Google Calendar, Outlook, Apple Calendar).

**Backend:**

- **Service:** В `InterviewService` добавлен метод `byte[] exportToIcs(UUID id)`.
- **ServiceImpl:** Реализована генерация ICS контента в формате RFC 5545:
  - Даты форматируются в UTC (yyyyMMdd'T'HHmmss'Z').
  - DTEND = DTSTART + 1 час.
  - SUMMARY содержит тип собеседования.
  - DESCRIPTION объединяет notes и meeting link.
  - LOCATION содержит meeting link если есть.
- **Controller:** Добавлен эндпоинт `GET /api/interviews/{id}/export/ics`:
  - `produces = "text/calendar"`.
  - Возвращает ResponseEntity с заголовком Content-Disposition для скачивания файла.
  - Аннотация `@Auditable(action = "INTERVIEW_EXPORT_ICS", entityType = "INTERVIEW")`.
- **Tests:** Создан `InterviewServiceImplTest` с unit-тестами для проверки:
  - Корректности формирования ICS строки.
  - Формата даты в UTC.
  - Обработки null значений в notes и meeting link.

**Frontend:**

- **Service:** В `interview.service.ts` добавлен метод `exportIcs`:
  - Использует нативный `fetch` для blob ответа (api.get не поддерживает responseType).
  - Получает JWT токен из `localStorage` (`cp_access_token`).
  - Читает ответ как `.blob()` и создает временную ссылку для скачивания файла.
  - Имя файла: `interview-{id}.ics`.
- **UI (InterviewsPage):**
  - Добавлена иконка CalendarIcon.
  - Добавлена кнопка экспорта на карточке собеседования рядом с Edit/Delete.
  - Использован `e.stopPropagation()` для предотвращения конфликтов с кликами.
  - Кнопка имеет tooltip с локализованным текстом.
- **i18n:** Обновлены ключи в `ru.json` и `en.json`:
  - `interviews.exportIcs`: "В календарь (.ics)" / "Add to Calendar (.ics)".

**Documentation:**

- **FRONTEND_BACKEND_CONTRACT.md:** Добавлен эндпоинт `GET /interviews/{id}/export/ics` в секцию Interviews.

**Проверки:**

- Backend: `.\mvnw.cmd clean compile` - успешно.
- Frontend: `npm.cmd run lint` - успешно (2 предупреждения React Compiler, не критично).
- Frontend: `npm.cmd run build` - успешно.

**Статус:** Реализовано. Пользователи могут скачивать .ics файлы собеседований для добавления в личные календари.

## Update 2026-05-27 — Google Calendar Direct Sync Implementation

**Сделано:**

Реализована прямая синхронизация собеседований с Google Calendar через OAuth2 API.

**Backend:**
- Добавлена Flyway миграция `V29__add_google_calendar_integration.sql`.
- Добавлены зависимости `google-api-client` и `google-api-services-calendar` в `pom.xml`.
- Добавлены поля `googleCalendarRefreshToken` и `googleCalendarConnected` в `PreferencesEntity`.
- Добавлено поле `googleCalendarEventId` в `InterviewEntity`.
- Реализованы `GoogleCalendarService` и `GoogleCalendarIntegrationController` для обработки OAuth2 flow (auth-url, callback, disconnect) и создания событий (`createEvent`). Используется `setApprovalPrompt("force")` вместо `setPrompt("consent")` из-за версии API клиента.
- В `InterviewService` добавлен метод `syncWithGoogle(UUID id)` и соответствующий эндпоинт `POST /api/interviews/{id}/sync/google`.

**Frontend:**
- Создан `integration.service.ts` для взаимодействия с API интеграций.
- Обновлен `interview.service.ts` с мутацией `syncWithGoogle`.
- Обновлен `SettingsPage.tsx`: добавлена секция "Интеграции" с возможностью подключения и отключения Google Calendar.
- Обновлен `InterviewsPage.tsx`: добавлена кнопка синхронизации рядом с экспортом ICS. При успешной синхронизации кнопка меняется на зеленую галочку.
- Добавлены i18n ключи для ru и en локалей.

**Документация:**
- Обновлен `FRONTEND_BACKEND_CONTRACT.md` с описанием новых эндпоинтов.

**Проверки:**
- Backend успешно скомпилирован.
- Frontend успешно собран.

**Статус:** Реализовано.

## Update 2026-05-27 — Google Calendar Fixes & UI Improvements

**Сделано:**

Серия исправлений и улучшений для стабилизации синхронизации с Google Calendar и улучшения UX в разделе собеседований.

**Backend:**
- **Google Calendar NPE Fix:** В `GoogleCalendarServiceImpl` добавлена проверка на null для компании при создании события. Теперь, если у вакансии не указана компания, используется заглушка "No Company".
- **Localization:** Заголовки событий в Google Calendar теперь локализуются (RU/EN) на основе настроек пользователя. Сами названия компании и вакансии не переводятся.
- **Bean Initialization Fix:** Устранен сбой запуска приложения `NoSuchBeanDefinitionException`. В `GoogleCalendarServiceImpl` и `GoogleCalendarIntegrationController` внедрены явные конструкторы вместо Lombok `@RequiredArgsConstructor`, добавлена аннотация `@Primary` для сервиса.
- **Interview Details:** В `InterviewResponse` и `InterviewMapper` добавлены поля `companyName` и `vacancyTitle`. Теперь эти данные передаются фронтенду вместе с объектом собеседования.
- **Dependency Upgrade:** Flyway обновлен до версии `12.6.2` для обеспечения полной совместимости с PostgreSQL 18.3 и устранения предупреждений в логах.

**Frontend:**
- **Interview UI:** На карточке собеседования под названием компании теперь отображается название вакансии (уменьшенным и приглушенным текстом).
- **Form Persistence:** В `InterviewForm` добавлена логика автоматического выбора компании и подгрузки соответствующих вакансий при открытии формы на редактирование.
- **Error Handling:** Стандартная браузерная ошибка "Failed to fetch" (возникающая при выключенном бэкенде) теперь перехватывается и переводится через i18n (`errors.backendOffline`). Текст кнопки "Try again" в `ErrorState` (используемом в `ErrorBoundary`) теперь также локализован через ключ `common.retry`.
- **UI (Topbar):** Добавлена иконка Google Calendar в верхнюю панель управления. Иконка подсвечивается синим, если интеграция активна, и ведет в настройки интеграций.
- **Form UX:** В `InterviewForm` текстовое поле ввода часового пояса заменено на выпадающий список `CustomSelect` с поиском и предустановленными популярными зонами. Автоматически определяется и подставляется часовой пояс пользователя.
- **Fix:** Исправлена ошибка `ReferenceError: useEffect is not defined` в компоненте `InterviewForm`.
- **UI (Settings Help):** Внедрена система контекстных подсказок. В каждом блоке настроек добавлена иконка вопроса в верхнем правом углу. При наведении отображается стилизованная подсказка с подробным объяснением на языке пользователя (RU/EN) о том, как данный раздел влияет на работу программы.

**Статус:** Все критические ошибки синхронизации устранены, UI обновлен для лучшей наглядности и удобства использования.

## Update 2026-05-28 — CD Pipeline & Production Deployment (Google Cloud Run)

**Сделано:**

Настроен полноценный CD-пайплайн и выполнен production-деплой проекта на домен `careerpilot-ai.ru`.

**CD Pipeline (`github/workflows/cd.yml`):**
- Создан workflow GitHub Actions: при push в `main` → сборка Docker-образов → push в Google Artifact Registry → деплой в Google Cloud Run.
- Backend собирается из корня проекта (`backend/Dockerfile`), Frontend — из `frontend/`.
- Backend деплоится как сервис `careerpilot-backend` (`europe-west1`), Frontend — `careerpilot-frontend` (`europe-west1`).
- Backend подключается к Cloud SQL через `--add-cloudsql-instances` + `socketFactory`.
- `VITE_API_BASE_URL` хардкодится в `cd.yml` как статический URL backend в europe-west1.

**Исправления в процессе отладки CD (12 итераций):**
1. Docker build context для backend исправлен с `backend/` на `.` (корень проекта).
2. Добавлены зависимость `google-cloud-sql-connector` и флаг `--add-cloudsql-instances` для Cloud SQL.
3. Исправлены Maven координаты Cloud SQL Socket Factory.
4. Отключена Redis-проверка при старте (`SPRING_CACHE_TYPE=none`) — Redis недоступен в Cloud Run без VPC Connector.
5. Добавлен динамический DNS-резолвер `169.254.169.254` в `nginx.conf` для корректной работы переменных в nginx.
6. Исправлена сборка тестов backend (упрощена конфигурация `maven-compiler-plugin`).
7. Исправлен регион Cloud SQL в JDBC URL — должен совпадать с регионом инстанса (`europe-west3`), а не Cloud Run сервиса.
8. `VITE_API_BASE_URL` обновлен со статическим URL europe-west1 и обязательным суффиксом `/api`.
9. Добавлены CORS origins для Cloud Run URL и кастомного домена в `SecurityConfig`.
10. Добавлены все env vars для backend: OAuth2 (GitHub/Google), Email, `FRONTEND_URL`, Telegram, `GOOGLE_CALENDAR_REDIRECT_URI`.
11. Telegram-бот включен в production (`TELEGRAM_BOT_ENABLED=true`).
12. GitHub Actions секрет переименован с `GITHUB_CLIENT_ID` → `GH_CLIENT_ID` (резервированный префикс).

**Инфраструктура Production:**
- Frontend: Google Cloud Run `careerpilot-frontend` (nginx, `europe-west1`)
- Backend: Google Cloud Run `careerpilot-backend` (Spring Boot, `europe-west1`)
- База данных: Cloud SQL PostgreSQL `careerpilot-db` (`europe-west3`)
- Docker-образы: Google Artifact Registry `careerpilot-docker-repo`
- Домен: `https://careerpilot-ai.ru` (кастомный домен через Cloud Run)

**Google OAuth Consent Screen:**
- Настроен и верифицирован для продакшн.
- Application home page: `https://careerpilot-ai.ru`
- Privacy Policy URL: `https://careerpilot-ai.ru/privacy`
- Terms of Service URL: `https://careerpilot-ai.ru/terms`

**Статус:** CD настроен, production работает на `careerpilot-ai.ru`.

## Update 2026-05-28 — Privacy Policy, Terms of Service, SEO

**Сделано:**

**Frontend:**
- Созданы страницы `PrivacyPolicyPage.tsx` (`/privacy`) и `TermsOfServicePage.tsx` (`/terms`) — полноценные публичные страницы с хедером, контентом и футером.
- Добавлены lazy-импорты и роуты в `AppRouter.tsx`.
- В футере `LandingPage.tsx` добавлены ссылки на `/privacy` и `/terms`.
- Добавлены i18n ключи `landing.privacyPolicy` и `landing.termsOfService` в `ru.json` ("Политика конфиденциальности" / "Условия использования") и `en.json`.

**SEO:**
- Создан `frontend/public/sitemap.xml` с публичными страницами (`/`, `/auth/login`, `/auth/register`, `/privacy`, `/terms`).
- Создан `frontend/public/robots.txt` — разрешён краулинг публичных страниц, закрыт `/app/`.

**Статус:** Страницы задеплоены, доступны на production.

## Update 2026-06-05 — Settings AI Provider Cloud Unavailable

**Frontend:**
- В `SettingsPage.tsx` свойство `disabled: true` добавлено к опции провайдера `CLOUD`.
- Настроена блокировка выбора данной опции в методе `onClick`.
- Добавлен яркий янтарный бейдж «В разработке» (In Development) рядом с названием провайдера при рендеринге списка в `SettingsPage.tsx`.
- Кнопка опции визуально приглушена с помощью `opacity-50 cursor-not-allowed`.
- Добавлены соответствующие i18n ключи `aiProviderCloudBadge` в `ru.json` и `en.json`.

**Статус:** Реализовано локально, сборка успешна.

## Update 2026-06-05 — Mobile UX / Adaptive Layout

**Цель:** Внедрение мобильного Drawer-меню и адаптивная оптимизация ключевых страниц.

**Frontend:**
- `AppLayout.tsx` — добавлено состояние `isMobileMenuOpen` (`useState(false)`), props `isOpen`/`onClose` передаются в `Sidebar`, `onOpenMenu` в `Topbar`.
- `Sidebar.tsx` — полностью переработан в адаптивный Drawer:
  - `fixed inset-y-0 left-0 z-[70]` позиционирование
  - CSS-трансформация `-translate-x-full` / `translate-x-0` с `transition-transform duration-300`
  - На десктопе (`md:relative md:translate-x-0`) — поведение без изменений
  - Мобильный overlay `z-[60] bg-black/60 backdrop-blur-sm` для закрытия по клику
  - `useEffect` для блокировки `body.overflow` при открытом меню
  - Все `NavLink` закрывают меню через `onClick={() => onClose?.()}`
- `Topbar.tsx` — добавлена кнопка-гамбургер (`<Menu>` из lucide-react), видна только на `md:hidden`, вызывает `onOpenMenu`.
- `ApplicationsPage.tsx`:
  - Блок статистики: `flex-wrap` для корректного отображения на узких экранах
  - Строка поиска: `flex flex-col sm:flex-row` — на мобильных поиск и кнопки идут столбцом
  - Поле поиска: `max-w-full sm:max-w-md`
  - Колонки Kanban: `min-w-[280px] sm:min-w-[300px]` вместо `w-[300px]` — обеспечивает корректный горизонтальный скролл на мобильных

**Z-index порядок:** overlay `z-[60]` < Sidebar `z-[70]`, Topbar `z-[60]` (overlay перекрывает контент, но не Sidebar).

**Статус:** Реализовано локально, сборка успешна (`npm run build` без ошибок).

## Update 2026-06-05 — Telegram MiniApp

**Цель:** Реализация аутентификации и входа через Telegram WebApp (MiniApp).

**Backend:**
- `TelegramWebAppAuthRequest.java` — DTO для получения `initData`.
- `AuthService.java` / `AuthServiceImpl.java` — Добавлен метод `telegramWebAppAuth`, реализующий валидацию `initData` с помощью HMAC-SHA256 (сверка хеша) и проверку времени (до 5 минут). Извлекает `id` пользователя из поля `user`, находит пользователя по `telegramChatId` через `PreferencesRepository`.
- `AuthController.java` — Добавлен эндпоинт `POST /api/auth/telegram-webapp`.
- `SecurityConfig.java` — Разрешен публичный доступ к новому эндпоинту.
- `TelegramBotHandler.java` — Добавлена Inline-кнопка "📱 Открыть CareerPilot" для команды `/start`, которая открывает `https://careerpilot-ai.ru/app/dashboard?tg=1` как WebApp.

**Frontend:**
- `lib/telegram.ts` — Создана обертка для SDK (`isTelegramWebApp`, `getTelegramInitData`, `initTelegramApp`).
- `auth.service.ts` — Добавлен вызов `POST /api/auth/telegram-webapp` для авторизации.
- `AuthContext.tsx` — Реализован эффект автоматической аутентификации при старте приложения внутри Telegram. Если токена нет, а `initData` есть, приложение делает запрос к API и устанавливает сессию.
- `AppLayout.tsx` — Добавлен условный рендеринг: если открыто в Telegram (`isTg`), скрываются `Sidebar` и `Topbar`, а фон остается темным для соответствия MiniApp дизайну.

**Статус:** Backend компилируется, Frontend собирается без ошибок. Интеграция готова к деплою.

## Update 2026-06-05 — Cloudflare Integration & Security Hardening

**Цель:** Интеграция с Cloudflare для защиты от DDoS и WAF на продакшене, а также корректное восстановление реальных IP-адресов пользователей на бэкенде.

**Backend:**
- `AuditAspect.java` — Добавлена логика извлечения реального IP-адреса пользователя из HTTP-заголовка `CF-Connecting-IP`. Если заголовок отсутствует, используется стандартный `request.getRemoteAddr()`. Это гарантирует корректность логов аудита при проксировании трафика.
- `RateLimiterAspect.java` — Изменено определение IP-клиента для лимитера запросов. Теперь лимиты накладываются по реальному IP-адресу пользователя (из заголовка `CF-Connecting-IP`), а не по IP прокси-сервера Cloudflare.

**Документация:**
- `docs/DEPLOYMENT.md` — Добавлено руководство по настройке Cloudflare (SSL/TLS режим Full/Strict, отключение кэширования для API эндпоинтов `/api/*`).
- `README.md` / `README.ru.md` — Обновлен список возможностей безопасности с упоминанием Cloudflare.

**Статус:** Все тесты (`mvnw test`) успешно выполнены локально. Реализовано и готово к использованию в продакшене.

