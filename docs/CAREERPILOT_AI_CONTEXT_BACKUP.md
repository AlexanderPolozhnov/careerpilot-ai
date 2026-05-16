Ты выступаешь как Senior Full-Stack Software Engineer / AI coding consultant для моего проекта CareerPilot AI.

Мне нужно продолжить работу над проектом с сохранением контекста. Ниже полный контекст проекта, его текущего состояния,
архитектурных решений и истории нашей работы.

────────────────────────────────────────

1. Общий контекст проекта
   ────────────────────────────────────────

Проект называется CareerPilot AI.

CareerPilot AI — full-stack portfolio project / production-like pet project для управления поиском работы как
структурированным workflow.

Идея продукта:
Система помогает кандидату:

- собирать и хранить вакансии;
- вести компании;
- отслеживать отклики через application pipeline;
- хранить заметки;
- планировать follow-up задачи;
- анализировать вакансии с помощью AI;
- сравнивать резюме с вакансией;
- генерировать cover letter;
- генерировать вопросы для подготовки к интервью;
- смотреть аналитику по поиску работы.

Проект позиционируется не как tutorial CRUD, а как portfolio SaaS-like проект с production-like архитектурой.

Статус проекта:

- В активной разработке.
- Не production-ready.
- Часть frontend функциональности может использовать mock data.
- Backend/frontend integration выполняется постепенно по документированному контракту.

Публичный GitHub:
https://github.com/AlexanderPolozhnov/careerpilot-ai

Также есть другие проекты:

- Smart Chat Microservice:
  https://github.com/AlexanderPolozhnov/smart-chat-microservice
- Resume repository:
  https://github.com/AlexanderPolozhnov/resume

────────────────────────────────────────

2. Технологический стек CareerPilot AI
   ────────────────────────────────────────

Backend:

- Java 21
- Spring Boot 3
- Spring Security
- JWT auth
- Spring Data JPA
- Hibernate
- PostgreSQL
- Flyway
- MapStruct
- Bean Validation
- OpenAPI / Swagger
- JUnit 5
- Mockito
- Testcontainers
- Docker / Docker Compose

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- i18next
- lucide-react
- date-fns

AI layer:

- Ollama как default local provider
- Local LLM execution by default
- Provider abstraction for possible cloud fallback
- Prompt templates
- AI response caching
- Explicit user-triggered generation only

Infrastructure:

- Docker
- Docker Compose
- PostgreSQL
- Redis
- MinIO optional/planned
- GitHub Actions planned

────────────────────────────────────────

3. Архитектурный подход
   ────────────────────────────────────────

Архитектура:

- modular monolith;
- backend разделяется по доменным модулям;
- frontend feature/service-based;
- AI изолирован behind provider/service interfaces;
- external integrations swappable;
- database schema aligned with domain flow;
- easy to split into services later if needed.

Ключевой принцип:
docs/FRONTEND_BACKEND_CONTRACT.md является source of truth для API между frontend и backend.

Backend не должен придумывать свои DTO/status/error format, если контракт уже задаёт структуру.

Целевые backend modules:

- auth
- profile / user
- vacancy
- application
- company
- ai-assistant
- notification
- analytics
- files
- audit-log
- common/error
- common/security
- common/pagination
- config

Пример backend структуры:

backend/src/main/java/.../careerpilot/
├── auth/
│ ├── controller/
│ ├── dto/
│ ├── entity/
│ ├── repository/
│ ├── service/
│ └── security/
├── user/
├── vacancy/
│ ├── controller/
│ ├── dto/
│ ├── entity/
│ ├── mapper/
│ ├── repository/
│ └── service/
├── company/
├── application/
├── aiassistant/
├── analytics/
├── notification/
├── common/
│ ├── error/
│ ├── pagination/
│ ├── security/
│ └── web/
└── config/

────────────────────────────────────────

4. Репозиторий и структура monorepo
   ────────────────────────────────────────

Проект был объединён в monorepo и выложен на GitHub.

Целевая структура:

careerpilot-ai/
├── backend/
├── frontend/
├── docs/
│ ├── README.DEV.md
│ ├── FRONTEND_BACKEND_CONTRACT.md
│ └── I18N_IMPLEMENTATION.md
├── docker-compose.yml
├── README.md
├── ROADMAP.md
├── LICENSE
├── .gitignore
└── .gitattributes

Важно:

- .env не должен попадать в Git.
- backend/.env не должен попадать в Git.
- frontend/.env не должен попадать в Git.
- backend/target не должен попадать в Git.
- frontend/node_modules не должен попадать в Git.
- frontend/dist не должен попадать в Git.
- .idea/.vscode/*.iml не должны попадать в Git.

.gitignore уже был подготовлен для public repo.

.gitattributes добавлен для line endings:

- исходники и docs в LF;
- .cmd/.bat в CRLF.

Репозиторий публичный:
https://github.com/AlexanderPolozhnov/careerpilot-ai

────────────────────────────────────────

5. Документация
   ────────────────────────────────────────

Документация была приведена к русскоязычному portfolio-ready виду.

Требование:
Вся человекочитаемая документация должна быть на русском языке.

Исключения:

- имена директорий;
- команды терминала;
- env vars;
- endpoints;
- HTTP methods;
- DTO/class/interface names;
- enum values;
- dependency names;
- package names;
- code snippets.

Документация была обновлена:

- README.md — главный публичный landing page проекта;
- ROADMAP.md — roadmap с фазами и статусами;
- docs/README.DEV.md — dev guide;
- docs/FRONTEND_BACKEND_CONTRACT.md — API contract;
- docs/I18N_IMPLEMENTATION.md — i18n guide;
- frontend/README.md — frontend module guide;
- backend/README.DEV.md — backend module notes;
- backend/HELP.md — очищен от Spring generated noise;
- backend/docker/README.md;
- backend/docs/README.md;
- backend/.aiassistant/rules/main-rules.md.

Статус в документации:

- В активной разработке.
- Portfolio project.
- Production-like architecture.
- Не production-ready.
- Некоторые frontend zones могут использовать mock data.
- Frontend/backend integration идёт по контракту.

В README/ROADMAP были исправлены:

- careerpilot-ai-public → careerpilot-ai;
- headings русифицированы;
- ROADMAP приведён к единому формату [x]/[~]/[ ].

────────────────────────────────────────

6. GitHub profile / portfolio context
   ────────────────────────────────────────

GitHub profile:
https://github.com/AlexanderPolozhnov

Рекомендованный bio:
Java Backend Developer | Spring Boot, REST APIs, PostgreSQL, Docker | AI-assisted full-stack projects

Рекомендованные pinned repos:

1. careerpilot-ai
2. smart-chat-microservice
3. resume

Рекомендованные topics для CareerPilot AI:

- java
- spring-boot
- spring-security
- react
- typescript
- vite
- tailwindcss
- postgresql
- docker
- ai
- ollama
- fullstack
- portfolio-project
- saas
- job-search

Описание CareerPilot AI на GitHub:
Full-stack job search management platform with AI-assisted vacancy analysis, application tracking, reminders, and
analytics.

Репозиторий resume:
https://github.com/AlexanderPolozhnov/resume

Рекомендован README для resume repo:

- ссылка на resume.pdf;
- ссылка на HTML version;
- ссылки на CareerPilot AI и Smart Chat Microservice;
- контакты;
- включить GitHub Pages:
  https://alexanderpolozhnov.github.io/resume/

────────────────────────────────────────

7. История работы по CareerPilot AI
   ────────────────────────────────────────

Сначала были отдельные frontend и backend папки.

Было принято решение:

- объединить проект в один monorepo;
- не смешивать frontend/src и backend/src;
- держать frontend в /frontend;
- backend в /backend;
- документацию в /docs;
- docker-compose.yml в корне;
- README.md и ROADMAP.md в корне.

Был создан публичный GitHub repo.

До первого commit:

- проверили .gitignore;
- запретили .env, node_modules, dist, target, .idea;
- добавили LICENSE MIT;
- привели документацию к HR-ready виду;
- сохранили русскоязычный стиль документации.

После публикации были улучшены:

- README.md;
- ROADMAP.md;
- frontend/README.md;
- backend/README.DEV.md;
- docs/README.DEV.md.

Репозиторий был проверен как внешний reviewer. Вердикт:

- можно показывать HR;
- структура выглядит professional;
- roadmap честный;
- docs хорошие;
- проект не выглядит как tutorial CRUD.

────────────────────────────────────────

8. Текущий этап разработки
   ────────────────────────────────────────

После слияния frontend/backend и публикации был выбран подход vertical slices.

Правильный порядок интеграции:

1. Auth
2. Vacancies
3. Companies
4. Applications
5. Analytics
6. AI
7. Notifications / Settings / Dashboard target endpoints

Auth vertical slice был реализован через Cursor.

Auth flow:
register → login → save access token → GET /auth/me → protected routes → logout clears localStorage

Frontend runtime:
http://localhost:5173

Backend runtime:
http://localhost:8080

API base URL:
http://localhost:8080/api

Frontend env:
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false

Token storage:
localStorage key: cp_access_token

Auth header:
Authorization: Bearer <access_token>

────────────────────────────────────────

9. Auth vertical slice — реализовано
   ────────────────────────────────────────

Cursor реализовал Auth vertical slice.

Изучено:

- backend auth controller/service/DTO/JWT/filter;
- GlobalExceptionHandler;
- Flyway migrations;
- frontend auth.service;
- api-client;
- AuthContext;
- cp_access_token;
- VITE_API_BASE_URL;
- VITE_USE_MOCKS;
- docs/FRONTEND_BACKEND_CONTRACT.md;
- docker-compose.yml;
- README/ROADMAP.

Изменения структуры:

- добавлен backend/src/main/java/com/alexanderpolozhnov/careerpilot/config/SecurityConfig.java;
- в auth добавлены exception и user-response DTO;
- без масштабного рефакторинга.

Backend files changed:

- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/controller/AuthController.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/service/AuthService.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/service/AuthServiceImpl.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/service/JwtService.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/security/JwtAuthenticationFilter.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/request/RegisterRequest.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/response/AuthResponse.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/entity/AuthEntity.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/common/api/error/ApiErrorResponse.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/common/api/error/GlobalExceptionHandler.java
- backend/src/main/resources/application.yaml
- backend/pom.xml

Backend files added:

- backend/src/main/java/com/alexanderpolozhnov/careerpilot/config/SecurityConfig.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/response/AuthUserResponse.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/exception/DuplicateEmailException.java
- backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/exception/InvalidCredentialsException.java
- backend/src/main/resources/db/migration/V2__auth_users_alignment.sql
- backend/src/test/java/com/alexanderpolozhnov/careerpilot/auth/service/AuthServiceImplTest.java
- backend/src/test/java/com/alexanderpolozhnov/careerpilot/auth/controller/AuthControllerTest.java

Frontend code was not changed because frontend already supported:

- VITE_API_BASE_URL;
- VITE_USE_MOCKS=false;
- cp_access_token;
- Authorization: Bearer token;
- GET /auth/me restore logic.

Endpoints implemented:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

AuthResponse:

- accessToken + user

/auth/me returns user shape:

- id
- email
- name
- avatarUrl
- createdAt

Refresh flow:

- intentionally not implemented in frontend v1.

Forgot/reset:

- not implemented yet;
- next auth TODO:
    - POST /api/auth/forgot-password
    - POST /api/auth/reset-password

Migration added:
backend/src/main/resources/db/migration/V2__auth_users_alignment.sql

- adds first_name, last_name to users;
- backfills from full_name;
- avoids duplicating users table.

Auth flow:

- register validates, checks duplicate email, BCrypt hashes password, saves user, returns accessToken + user;
- login checks email/password, creates JWT access token, returns accessToken + user;
- me requires Bearer token, JWT filter extracts subject and sets Authentication;
- logout remains frontend-only localStorage cleanup.

Checks:

- frontend lint passed;
- frontend build passed;
- targeted backend auth tests passed:
  ./mvnw.cmd test "-Dtest=AuthServiceImplTest,AuthControllerTest"
- full backend tests initially failed because Testcontainers could not find valid Docker environment;
- two security tests marked @Disabled as TODO;
- manual auth flow was later checked by user and registration/login manually pass.

Important current known state:
Registration and login manually pass.

Need to confirm whether commit was already made. If not:

- run git status --short;
- ensure no .env/target/node_modules/dist/.idea in staged;
- commit:
  git add .
  git commit -m "feat: implement auth backend integration"
  git push

────────────────────────────────────────

10. Next planned vertical slice
    ────────────────────────────────────────

Next recommended step:
Vacancies vertical slice.

Goal:
Frontend Vacancies page → real backend endpoints → PostgreSQL.

Smoke flow:
login → vacancies → create → list → detail → update → delete → refresh

Minimum endpoints:

- GET /api/vacancies
- GET /api/vacancies/{id}
- POST /api/vacancies
- PUT /api/vacancies/{id}
- DELETE /api/vacancies/{id}

Optional endpoints only if frontend service layer/contract requires:

- POST /api/vacancies/import-text
- PATCH /api/vacancies/{id}/archive
- GET /api/vacancies/tags

Main rules:

- Use docs/FRONTEND_BACKEND_CONTRACT.md as source of truth.
- Backend response must match frontend expected types.
- User ownership required.
- All vacancy operations require Bearer token.
- User sees only own vacancies.
- User must not read/update/delete other users’ vacancies.
- Do not accept userId from frontend.
- Get user from SecurityContext/JWT.
- Entity must not be returned directly.
- DTO/entity/mapper/service/controller separation.
- Pagination shape must match contract.

Target pagination shape:
{
"content": [],
"totalElements": 0,
"totalPages": 0,
"size": 20,
"number": 0,
"first": true,
"last": true
}

Target vacancy fields should be checked against contract and frontend types, likely:

- id UUID
- title
- companyName or companyId/company
- location
- employmentType
- workMode
- salaryFrom
- salaryTo
- currency
- sourceUrl
- description
- requirements
- status
- tags
- notes
- createdAt
- updatedAt

Important:
If contract differs, use contract.

Enum values:

- UPPER_SNAKE_CASE
- must match frontend.

Validation:

- title required;
- salaryFrom <= salaryTo if both present;
- enums validated.

Flyway:
If vacancies table doesn’t exist, add migration.
If it exists, add missing fields without duplicating.
Indexes:

- user_id
- status
- created_at
- title/company_name if search uses them.

Tests:
Service tests:

- create vacancy for current user;
- list only current user's vacancies;
- get owned vacancy by id;
- not found for чужая/несуществующая vacancy;
- update vacancy;
- delete vacancy;
- validation salaryFrom > salaryTo.

Controller tests:

- unauthorized returns 401;
- list authorized;
- create authorized;
- get by id authorized.

Manual smoke:

1. docker compose up -d
2. backend spring-boot:run
3. frontend npm run dev
4. login existing user
5. open vacancies page
6. create vacancy
7. list vacancy
8. open detail
9. update vacancy
10. delete vacancy
11. refresh and verify PostgreSQL persistence.

────────────────────────────────────────

11. Prompt for Cursor — Vacancies slice
    ────────────────────────────────────────

Use this prompt for Cursor when starting next step:

Ты работаешь в проекте CareerPilot AI.

Цель: реализовать следующий frontend-backend vertical slice после успешного Auth flow — Vacancies.

Контекст:
Проект — monorepo:

careerpilot-ai/
├── backend/
├── frontend/
├── docs/
│ ├── FRONTEND_BACKEND_CONTRACT.md
│ ├── README.DEV.md
│ └── I18N_IMPLEMENTATION.md
├── README.md
├── ROADMAP.md
└── docker-compose.yml

Auth vertical slice уже реализован и вручную проверен:
register → login → cp_access_token → Authorization header → GET /auth/me → protected UI.

Главный источник правды для API:
docs/FRONTEND_BACKEND_CONTRACT.md

Нужно реализовать Vacancies slice строго по контракту.

Важно:

- Не переписывать весь backend.
- Не переписывать весь frontend.
- Не менять контракт без необходимости.
- Если есть расхождение между frontend service layer и контрактом — сначала зафиксировать его и выбрать минимальное
  исправление.
- Backend должен подстраиваться под контракт и frontend expectations.
- Entity не возвращать напрямую наружу.
- Все человекочитаемые комментарии/документация — на русском.
- Code identifiers, DTO names, endpoints, env vars, enum values — на английском.
- Не реализовывать Companies/Applications/AI в этом шаге, кроме минимально необходимого для связи Vacancy с Company,
  если это требуется схемой.

1. Сначала изучи текущую реализацию

Проверь:

Backend:

- существующие vacancy packages/classes;
- migrations;
- entities;
- repositories;
- controllers;
- services;
- DTO;
- mappers;
- security;
- current user ownership;
- existing tests.

Frontend:

- vacancy service;
- api client;
- vacancy pages;
- vacancy types;
- mock data;
- filters/search/sort/page params;
- expected response shape;
- create/edit/delete behavior.

Docs:

- docs/FRONTEND_BACKEND_CONTRACT.md;
- ROADMAP.md;
- docs/README.DEV.md.

Перед изменениями дай краткий план:

- какие endpoints будут реализованы;
- какие DTO нужны;
- какие backend файлы будут созданы/изменены;
- нужны ли migrations;
- нужно ли менять frontend;
- какие проверки будут выполнены.

2. Endpoints для реализации

Реализовать endpoints из контракта для Vacancies.

Минимальный набор:
GET /api/vacancies
GET /api/vacancies/{id}
POST /api/vacancies
PUT /api/vacancies/{id}
DELETE /api/vacancies/{id}

Если frontend service layer по контракту вызывает дополнительные vacancy endpoints, например:
POST /api/vacancies/import-text
PATCH /api/vacancies/{id}/archive
GET /api/vacancies/tags

то:

- сначала проверь контракт и frontend service layer;
- реализуй только те endpoints, которые реально нужны для текущих pages;
- остальные пометь как TODO, если они есть в контракте, но не нужны для smoke flow.

3. Data model / ownership

Vacancy должна принадлежать authenticated user.

Требования:

- все vacancy operations требуют Bearer token;
- пользователь видит только свои вакансии;
- пользователь не может читать/обновлять/удалять чужие вакансии;
- user id брать из SecurityContext/JWT;
- не принимать userId из frontend request.

Минимальная vacancy entity должна поддерживать поля, которые ожидает frontend и контракт.

Ориентироваться на docs/FRONTEND_BACKEND_CONTRACT.md и frontend types.

Типичные поля:

- id UUID;
- title;
- companyName или companyId/company;
- location;
- employmentType;
- workMode;
- salaryFrom;
- salaryTo;
- currency;
- sourceUrl;
- description;
- requirements;
- status;
- tags;
- notes;
- createdAt;
- updatedAt.

Не добавлять лишние поля без необходимости.
Если в контракте поля отличаются — использовать контракт.

Enum values должны быть в UPPER_SNAKE_CASE и совпадать с frontend.

4. Flyway migration

Проверить существующие migrations.

Если таблицы vacancies нет — добавить новую migration.

Если таблица уже есть — не дублировать, а аккуратно добавить недостающие поля.

Migration должна:

- создать vacancies table;
- связать vacancy с user через user_id;
- добавить indexes:
    - user_id;
    - status;
    - created_at;
    - title или company_name, если используется search.

Не хранить frontend-only поля, если они вычисляются.

5. Backend implementation

Реализовать layered structure:

vacancy/
├── controller/
├── dto/
├── entity/
├── mapper/
├── repository/
└── service/

Controller:

- принимает HTTP requests;
- использует DTO;
- не содержит business logic.

Service:

- получает текущего пользователя;
- проверяет ownership;
- управляет create/update/delete;
- кидает доменные exceptions.

Repository:

- queries scoped by userId.

Mapper:

- Entity ↔ DTO.
- Можно использовать MapStruct, если он уже подключен и используется.
- Если MapStruct ещё не настроен для этого домена, можно сделать manual mapper, но не смешивать mapping в controller.

Error handling:

- использовать существующий GlobalExceptionHandler;
- добавить NotFound/AccessDenied/Validation errors, если нужно;
- error response должен соответствовать контракту.

Pagination:

- GET /api/vacancies должен возвращать pagination shape из контракта:
  {
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "size": 20,
  "number": 0,
  "first": true,
  "last": true
  }

Filtering/search:

- реализовать только то, что реально вызывает frontend.
- Если frontend передает search/status/page/size/sort — поддержать их.
- Если sort сложный — сделать минимально безопасную реализацию и зафиксировать TODO.

Validation:

- title required;
- description/sourceUrl optional или по контракту;
- enums validate;
- salaryFrom <= salaryTo, если оба указаны.

6. Frontend integration

Frontend менять минимально.

Проверить:

- VITE_USE_MOCKS=false;
- vacancy service вызывает реальные endpoints;
- Authorization header уже добавляется api-client;
- response shape совпадает.

Если backend response отличается от frontend expected types — исправить backend response под frontend/contract.

Если frontend service сейчас ожидает mock-only fields:

- либо добавить эти поля в response, если они есть в контракте;
- либо минимально обновить frontend types/service, но только при явной необходимости.

Smoke flow должен работать в UI:

- открыть Vacancies page;
- увидеть пустой список без ошибки;
- создать vacancy;
- увидеть ее в списке;
- открыть vacancy detail;
- обновить vacancy;
- удалить vacancy;
- после refresh данные сохраняются в PostgreSQL.

7. Tests

Добавить минимальные backend tests, если тестовая инфраструктура позволяет:

Service tests:

- create vacancy for current user;
- list only current user's vacancies;
- get by id owned by user;
- not found for чужая/несуществующая vacancy;
- update vacancy;
- delete vacancy;
- validation salaryFrom > salaryTo.

Controller tests:

- unauthorized request returns 401;
- list vacancies authorized;
- create vacancy authorized;
- get vacancy by id authorized.

Если Testcontainers требует Docker, тесты должны запускаться при running Docker environment.

Не отключать важные тесты без явного TODO.

8. Documentation / Roadmap

После реализации минимально обновить:

ROADMAP.md:

- Vacancy API backend status;
- Vacancies integration status.

docs/FRONTEND_BACKEND_CONTRACT.md:

- не менять, если реализация совпадает;
- если были уточнения — обновить строго и минимально.

docs/README.DEV.md:

- обновить только если появились новые команды/env/известные ограничения.

README.md:

- обычно не трогать, если только статус проекта принципиально не изменился.

Не писать, что весь проект production-ready.

9. Checks

Запустить:

Frontend:
cd frontend
npm.cmd run lint
npm.cmd run build

Backend:
cd backend
.\mvnw.cmd test

Manual smoke:

1. docker compose up -d
2. backend spring-boot:run
3. frontend npm run dev
4. login existing user
5. open vacancies page
6. create vacancy
7. list vacancy
8. open vacancy detail
9. update vacancy
10. delete vacancy

Если backend tests падают из-за Docker/Testcontainers:

- указать это явно;
- если Docker работает, разобраться и исправить.

10. Git hygiene

Не коммитить автоматически.

Перед финальным ответом выполнить:

git status --short

Убедиться, что в changed/staged files нет:

- .env
- backend/.env
- frontend/.env
- backend/target/
- frontend/node_modules/
- frontend/dist/
- .idea/
- .vscode/

11. Definition of Done

Vacancies slice считается готовым, если:

- GET /api/vacancies работает;
- GET /api/vacancies/{id} работает;
- POST /api/vacancies работает;
- PUT /api/vacancies/{id} работает;
- DELETE /api/vacancies/{id} работает;
- все operations protected by JWT;
- user видит только свои vacancies;
- pagination shape совпадает с contract;
- frontend при VITE_USE_MOCKS=false показывает реальные vacancies;
- create/list/detail/update/delete работают из UI;
- данные сохраняются в PostgreSQL;
- errors возвращаются в contract format;
- frontend lint/build проходят;
- backend tests проходят или есть честное объяснение внешней причины;
- ROADMAP обновлен.

12. Финальный отчёт

В конце дай отчёт на русском:

1. Что было изучено.
2. Какие endpoints реализованы.
3. Какие backend файлы добавлены/изменены.
4. Какие frontend файлы добавлены/изменены.
5. Какие migrations добавлены.
6. Как реализована user ownership.
7. Совпадает ли реализация с contract.
8. Какие проверки прошли.
9. Результат manual smoke.
10. Что осталось TODO.
11. Можно ли делать commit.

────────────────────────────────────────

12. Resume context
    ────────────────────────────────────────

Текущее резюме было загружено в PDF и проанализировано.

Главная рекомендация:
CareerPilot AI уже выложен на GitHub, поэтому в резюме надо заменить:
"Ведется локальная разработка (см. GitHub на появление репозитория)"
на:
"GitHub: github.com/AlexanderPolozhnov/careerpilot-ai
Статус: в активной разработке"

CareerPilot AI в резюме должен быть короче.
Не надо перечислять весь roadmap и планируемые технологии как уже реализованные.

Рекомендуемый блок проекта:

CareerPilot AI
GitHub: github.com/AlexanderPolozhnov/careerpilot-ai
04.2026 — настоящее время

Full-stack portfolio project для управления поиском работы: вакансии, компании, отклики, application pipeline,
AI-assisted анализ вакансий, resume matching, cover letter generation и аналитика.

Роль: backend/full-stack developer.

Основной вклад:

- спроектировал monorepo-структуру backend/frontend/docs;
- подготовил Spring Boot backend foundation с Java 21, PostgreSQL, Flyway, Spring Security и JPA;
- подготовил React + TypeScript frontend foundation с routing, service layer, i18n и mock/API режимом;
- оформил frontend-backend REST API contract для интеграции backend и frontend;
- описал roadmap, dev guide, known limitations и merge readiness;
- настроил Docker Compose infrastructure для локальной разработки.

Стек:
Java 21, Spring Boot 3, PostgreSQL, Flyway, Spring Security, Docker, React, TypeScript, Vite, Tailwind CSS, TanStack
Query, Ollama.

О себе:
Нужно аккуратно указать использование AI:
Не писать, что AI сделал проект.
Лучше:
"Использую AI-инструменты как часть инженерного workflow: для анализа требований, проектирования API-контрактов, ревью
документации и ускорения разработки, сохраняя ручной контроль архитектуры, кода и интеграции."

Smart Chat Microservice тоже обязательно добавить в резюме.
Для Java Backend Developer он очень важен, потому что показывает backend hard skills.

Smart Chat Microservice:
GitHub: github.com/AlexanderPolozhnov/smart-chat-microservice

Backend microservice для real-time chat с авторизацией, асинхронной обработкой сообщений и Docker-инфраструктурой.

Реализовано:

- JWT authentication: access/refresh tokens, BCrypt password hashing, Redis blacklist для logout;
- асинхронная обработка сообщений через Kafka Producer/Consumer;
- хранение пользователей, чатов и истории сообщений в PostgreSQL;
- кеширование последних сообщений и токенов в Redis;
- REST API для пользователей, чатов, сообщений, истории, поиска и статистики;
- Swagger/OpenAPI документация и Actuator health/metrics endpoints;
- Docker Compose окружение: PostgreSQL, Redis, Zookeeper, Kafka, application.

Стек:
Java, Spring Boot, Spring Security, JWT, PostgreSQL, Redis, Kafka, Docker, Docker Compose, Liquibase, MapStruct,
Swagger/OpenAPI, Actuator, JUnit.

В резюме порядок проектов для Java Backend:

1. Smart Chat Microservice
2. CareerPilot AI

Для Full-stack/AI-oriented:

1. CareerPilot AI
2. Smart Chat Microservice

────────────────────────────────────────

13. How to respond in future
    ────────────────────────────────────────

Когда пользователь спрашивает, что делать дальше:

- предлагай следующий vertical slice;
- давай готовые prompts для Cursor/Codex;
- не предлагай всё переписывать;
- придерживайся contract-first approach;
- придерживайся modular monolith;
- сохраняй документацию на русском;
- technical identifiers не переводить;
- уделяй внимание Git hygiene;
- перед commit всегда проверять:
  git status --short
  и отсутствие .env/target/node_modules/dist/.idea.

Стиль ответа:

- по-русски;
- конкретно;
- как senior full-stack/backend mentor;
- с практическими командами и prompts;
- без лишней воды;
- не скрывать риски;
- не выдавать planned за implemented.

Current immediate next action:
Если Auth changes ещё не закоммичены:

1. git status --short
2. убедиться, что нет .env/target/node_modules/dist/.idea
3. git add .
4. git commit -m "feat: implement auth backend integration"
5. git push

Затем запускать Cursor prompt для Vacancies vertical slice.

## Update — Vacancies vertical slice

Дата: 2026-04-27

Сделано:

- реализованы GET/POST/PUT/DELETE /api/vacancies;
- добавлена Flyway migration V3__create_vacancies.sql;
- frontend при VITE_USE_MOCKS=false получает реальные vacancies;
- manual smoke create/list/detail/update/delete пройден;
- ROADMAP обновлён.

Следующий этап:
Companies vertical slice.

Что дальше

Следующий логичный vertical slice — Companies, потому что Vacancy уже частично ссылается на companyId.

Порядок интеграции теперь такой:

[x] Auth
[x] Vacancies
[x] Companies
[ ] Applications
[ ] Analytics
[ ] AI
[ ] Notifications / Settings

## Update — Companies vertical slice

Дата: 2026-05-01

Сделано:

- backend `Companies` выровнен с контрактом: CRUD + `GET /api/companies` с `PagedResponse`;
- `CompanyRequest/CompanyResponse` переведены с `payload` на контрактные поля (`name`, `website`, `industry`, `size`,
  `location`, `description`, `linkedinUrl`, `logoUrl`);
- добавлен enum `CompanySize` (`STARTUP|SMALL|MEDIUM|LARGE|ENTERPRISE`);
- ownership-проверка для company операций приведена к `findByIdAndUserId(...)`;
- добавлена миграция `V5__companies_contract_alignment.sql` (новые columns + check constraint для `company_size`);
- улучшена обработка `companyId` в `VacancyServiceImpl`: разделены ошибки `Invalid companyId` и `Company not found`;
- frontend `company.service.ts` обновлён на `CompanySize` тип в DTO.

Проверки:

- backend: `./mvnw -Dtest=VacancyServiceImplTest test` — успешно;
- frontend: `npm run build` — успешно.

Следующий этап:
Applications vertical slice.

## Update — Seed visibility diagnostics and fix

Дата: 2026-05-01

Диагноз:

- seed migration была нестабильна: `V11__seed_realistic_test_data.sql` существовала только в `target/classes`,
  отсутствовала в `src/main/resources`;
- из-за этого Flyway на разных средах вёл себя по-разному (локально применено, в чистой сборке — нет);
- frontend в нескольких service-файлах по умолчанию уходил в mock (`VITE_USE_MOCKS ?? 'true'`);
- отсутствовали backend endpoints для `GET /api/applications/board` и `GET /api/analytics/summary`;
- seed-пользователи имели фиктивные bcrypt-хэши и не подходили для реального логина.

Сделано:

- добавлена source migration `V11__seed_realistic_test_data.sql` в `db/seeds`;
- добавлена migration `V10__seed_passwords_and_dev_alignment.sql` (рабочие пароли demo-пользователей через
  `crypt(...)`);
- включена dev-стратегия Flyway repair+migrate для выравнивания checksum в локальной базе;
- добавлен startup diagnostics logger (active profile, datasource URL, flyway history, counts);
- добавлено временное диагностическое логирование в list-методы companies/vacancies/applications;
- добавлен `GET /api/users` (dev-only debug endpoint);
- реализованы `GET /api/applications/board` и `GET /api/analytics/summary`;
- исправлен lazy-loading crash в vacancies mapper;
- frontend mock fallback переключён на backend-first (`VITE_USE_MOCKS` default false), `.env.example` обновлён.

Проверки:

- профиль `dev` активен;
- datasource: `jdbc:postgresql://localhost:5432/careerpilot_ai`;
- flyway history подтверждён логом (`V6`, `V7`, success=true);
- API smoke (под demo user) успешно:
    - `/api/users` -> 7
    - `/api/companies` -> 5
    - `/api/vacancies` -> 10
    - `/api/applications` -> 1
    - `/api/applications/board` -> 8 buckets
    - `/api/analytics/summary` -> funnel 8 statuses

## Update — Applications Kanban с Drag-and-Drop

Дата: 2026-05-02

Сделано:

- добавлен backend endpoint `PATCH /api/applications/{id}/status` (controller + service + request DTO);
- в `ApplicationsPage.tsx` добавлен dnd-kit board (sortable внутри колонки + перемещение между статусами);
- реализован optimistic update через React Query (`onMutate`/rollback/`invalidateQueries`) без page refresh;
- статус на карточке обновляется мгновенно, карточка остаётся в новой колонке после drop.

Ограничения:

- reorder внутри той же колонки работает на клиенте и не сохраняется в БД;
- backend ownership-проверка сохранена через `findOwnedApplication(...)`.

## Update — Applications DnD UX polish

Дата: 2026-05-02

Сделано:

- улучшен frontend UX в `ApplicationsPage.tsx` без изменения других страниц;
- добавлен `DragOverlay` в dnd-kit: dragged-card preview теперь явно следует за курсором;
- добавлена аккуратная анимация "wobble/hanging" для overlay (`cp-drag-overlay` + `cp-drag-wobble` в
  `frontend/src/styles/globals.css`);
- переработан layout колонок на более чистый горизонтальный скролл (`flex` + фиксированная ширина колонок), чтобы
  снизить визуальный шум;
- карточки сделаны компактнее (notes `line-clamp-2`), добавлены более мягкие drag/drop состояния и hover/drop-zone
  подсветка.

Стабильность/поведение:

- сохранён optimistic update для смены статуса (`onMutate` + rollback + invalidate);
- backend persistence статуса через `PATCH /api/applications/{id}/status` сохранён;
- full page reload отсутствует;
- frontend проверки пройдены: `npm run lint`, `npm run build`.

## Update — Applications vertical slice (CRUD alignment)

Дата: 2026-05-02

Сделано:

- реализованы все CRUD-endpoints для Applications: `POST /api/applications`, `GET /api/applications`,
  `GET /api/applications/{id}`, `PUT /api/applications/{id}`, `DELETE /api/applications/{id}`;
- добавлена ownership-проверка: все операции (get/update/delete) выполняются только для записей текущего пользователя
  из SecurityContext (через `CurrentUserResolver.resolveRequired()`);
- migration V6 (`V6__applications_crud_alignment.sql`) выровняла таблицу под контракт (статусы, поля);
- написаны unit-тесты в `ApplicationServiceImplTest`: create, list (only own), getById (own/other/missing),
  update, delete.

Ограничения:

- `GET /api/applications/board` возвращает агрегированный board по всем статусам;
- `PATCH /api/applications/{id}/status` маппит frontend-значения (`FINAL_ROUND` → `FINAL`);
- полной интеграционной проверки с Testcontainers нет (требует Docker).

## Update — AI assistant vertical slice

Дата: 2026-05-03

Сделано:

- реализованы 6 endpoints: `POST /api/ai/analyze-vacancy`, `POST /api/ai/resume-match`,
  `POST /api/ai/cover-letter`, `POST /api/ai/interview-questions`, `GET /api/ai/history`,
  `GET /api/ai/history/{id}`;
- response shape соответствует контракту: обёртка `{ "result": { AiResultDto } }` для POST-операций,
  `AiResult[]` / `AiResult` для GET-операций;
- userId берётся только из SecurityContext через `CurrentUserResolver.resolveRequired()` — не из request;
- `GET /api/ai/history` возвращает только записи текущего пользователя; опциональный фильтр `?type=`;
- `GET /api/ai/history/{id}` возвращает 404 для чужих записей (через `AiNotFoundException`);
- migration V7 (`V7__ai_results_contract_alignment.sql`) добавляет поля `prompt`, `result`, `vacancy_id`,
  `tokens_used` к таблице `ai_results`;
- структура: `ai/controller`, `ai/entity`, `ai/exception`, `ai/mapper`, `ai/repository`, `ai/request`,
  `ai/response`, `ai/service`.

Как реализован provider:

- `LlmProvider` — интерфейс;
- `OllamaLlmProvider` пытается вызвать Ollama по `${ollama.base-url}/api/generate` через `RestTemplate`;
- при любой ошибке (connection refused, timeout и т.п.) — автоматический fallback на реалистичный markdown-текст
  с разным содержимым для каждого типа (анализ вакансии, соответствие резюме, сопроводительное письмо,
  вопросы к собеседованию);
- Ollama не блокирует реализацию — fallback всегда сработает.

Тесты:

- `AiServiceImplTest`: 6 тестов — analyze-vacancy сохраняет для current user, history возвращает только свои
  записи, фильтр по type работает, getById возвращает 404 для чужой записи, getById возвращает свою запись,
  interviewQuestions с null count использует default 5;
- `AiControllerTest`: 5 тестов (+1 @Disabled) — analyze-vacancy wrapper, history list, history type filter,
  history by id, history by id → 404 (через GlobalExceptionHandler в standaloneSetup).

Ограничения:

- `tokensUsed` всегда `null` — Ollama API не возвращает счётчик токенов в использованном формате;
- кэширование результатов (`AiResultCacheService`) — заглушка, не реализовано;
- полных интеграционных тестов нет (требует Docker + Testcontainers).

## Update — Dashboard integration

Дата: 2026-05-03

Реализована полная интеграция DashboardPage с backend:

Backend:

- Новый пакет `dashboard`: `DashboardController`, `DashboardService` / `DashboardServiceImpl`, DTO (
  `DashboardSummaryDto`, `DashboardKpisDto`, `DashboardInterviewDto`, `DashboardTaskDto`, `DashboardNotificationDto`,
  `DashboardAiInsightDto`).
- Endpoint `GET /api/dashboard/summary` — данные из существующих репозиториев (vacancies, applications, interviews,
  tasks, notifications, ai_results), userId из SecurityContext через `CurrentUserResolver`.
- Добавлен метод `findAllByApplication_User_IdAndScheduledAtAfterOrderByScheduledAtAsc` в `InterviewRepository`.
- KPI: activeVacancies (VacancyStatus.ACTIVE), activeApplications (APPLIED/HR_SCREEN/TECH_INTERVIEW/FINAL),
  interviewsScheduled (будущие интервью), aiInsightsThisWeek (за последние 7 дней).

Frontend:

- Создан `frontend/src/services/dashboard.service.ts` с типами и функцией `getDashboardSummary()`.
- `DashboardPage.tsx` переписан: убраны все импорты из `mock/data.ts`, подключён React Query (`useQuery`), добавлен
  skeleton-loading для AI insights.
- Кнопка "View All" (AI insights) → `navigate('/ai-assistant')` через React Router.
- Кнопки "Quick Add" и "Open" (tasks) оставлены с TODO комментариями — endpoints не реализованы.

Проверки: `npm run lint` — чисто, `npm run build` — успешно, `mvnw test` (без Testcontainers) — 38/38 passed.

## Update — Settings/preferences integration

Дата: 2026-05-03

Backend:

- Flyway migration V8: `ALTER TABLE users ADD COLUMN location VARCHAR(255)` + `CREATE TABLE user_preferences` (user_id
  FK, weekly_digest, interview_reminders, ai_provider_mode, language).
- Новый пакет `user`: `UserController` (`GET /api/users/me`, `PUT /api/users/me`), `UserService` / `UserServiceImpl`,
  `UserResponse` (с полем location), `UpdateUserRequest`.
- Новый пакет `preferences`: `PreferencesController` (`GET /api/preferences`, `PUT /api/preferences`),
  `PreferencesService` / `PreferencesServiceImpl`, `PreferencesEntity`, `PreferencesRepository`, `AiProviderMode` enum (
  LOCAL/CLOUD/BRING_YOUR_OWN_KEY).
- Preferences создаются с дефолтами при первом обращении (upsert-паттерн через orElseGet + save).
- userId только из SecurityContext (через email → AuthRepository).

Frontend:

- Создан `frontend/src/services/settings.service.ts` с методами `getMe`, `updateMe`, `getPreferences`,
  `updatePreferences` (USE_MOCKS поддержан).
- `SettingsPage.tsx` переписан: убраны `mockUser` и local-only state, форма разделена на profileForm и prefsForm,
  подключены `useQuery` + `useMutation` через React Query.
- Добавлен success/error feedback для обеих форм (profileSuccess/profileError, prefsSuccess/prefsError).
- Добавлены ключи `settings.saved` и `settings.saveError` в `en.json` и `ru.json`.
- `mockNotifications` в блоке Recent Notifications оставлен (notifications endpoint — следующий TODO).

Проверки: `npm run lint` — чисто, `npm run build` — успешно, `mvnw test` — 38/39 passed (1 Testcontainers тест пропущен
из-за отсутствия Docker, pre-existing).

## Update — Notifications integration

Дата: 2026-05-03

Backend:

- Flyway migration V9 (`V9__notifications_add_type_read.sql`): добавлены поля `type VARCHAR(50)` и
  `read BOOLEAN DEFAULT FALSE` в таблицу `notifications`.
    - `NotificationEntity` обновлён: добавлены поля `type` (enum `NotificationType`) и `read` (boolean).
    - Новый enum `NotificationType`: `INTERVIEW_REMINDER | TASK_DUE | APPLICATION_STATUS | AI_COMPLETE | SYSTEM`.
    - Новый пакет `notification/dto`: `NotificationDto` (id, userId, type, title, body, read, createdAt) — поле
      `message`
      маппится в `body` через MapStruct.
    - `NotificationMapper` реализован через MapStruct (`@Mapper(componentModel = "spring")`).
    - `NotificationRepository`: добавлены `findAllByUserId(UUID, Pageable)` и
      `findAllByUserIdAndRead(UUID, boolean, Pageable)` для пагинации и фильтрации.
    - `NotificationService` / `NotificationServiceImpl`: `list(page, size, read)` — пагинация + опциональный фильтр по
      read;
      `markAsRead(id)` — ownership-проверка через SecurityContext.
    - `NotificationController`: `GET /api/notifications` (params: page, size, read) → `PagedResponse<NotificationDto>`;
      `PATCH /api/notifications/{id}/read` → `NotificationDto`.
    - `GlobalExceptionHandler` дополнен обработчиком `NotificationException` → 404.

Frontend:

- Создан `frontend/src/services/notification.service.ts`: `list(filters)` и `markAsRead(id)`, USE_MOCKS поддержан.
    - `SettingsPage.tsx`: `mockNotifications` заменён на `useQuery(['notifications'])` + `useMutation` для markAsRead
      через
      React Query.
    - Добавлена кнопка "Прочитано" / "Mark read" для непрочитанных уведомлений с инвалидацией кэша.
    - Добавлены ключи `common.markRead` в `en.json` ("Mark read") и `ru.json` ("Прочитано").

Тесты:

- `NotificationServiceImplTest`: 5 тестов — list возвращает только уведомления текущего пользователя, фильтр по read
  работает, markAsRead меняет статус, markAsRead бросает исключение для чужой записи, markAsRead бросает исключение для
  несуществующей записи.
    - `NotificationControllerTest`: 4 теста (+1 @Disabled для security) — list возвращает PagedResponse, list с фильтром
      read, markAsRead возвращает обновлённое уведомление.

Проверки: `npm run lint` — чисто (1 pre-existing warning), `npm run build` — успешно,
`mvnw test -Dtest="NotificationServiceImplTest,NotificationControllerTest"` — 9/9 passed.

## Update — Manual API smoke scenarios documented

Дата: 2026-05-03

Сделано:

- создан файл `docs/SMOKE_SCENARIOS.md` со smoke-сценариями для всех реализованных vertical slices: Auth, Vacancies,
  Companies, Applications, AI, Analytics, Dashboard, Settings, Notifications;
- для каждого slice описаны: предусловие, шаги (URL + действие + ожидаемый HTTP-статус/тело), ожидаемый результат,
  статус верификации;
- статусы расставлены честно: Auth, Vacancies, Companies, Applications, AI, Dashboard, Settings, Notifications —
  `✅ Verified manually`; Analytics — `⚠️ Partial` (endpoint подтверждён через seed diagnostics, полный UI smoke
  отдельно не задокументирован);
- ROADMAP.md обновлён: `Manual API smoke scenarios documented and verified` → `[x]`.

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

- Closed ROADMAP known issue: Vacancies action label changed from Save to Add to favorites / � ���������.
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
- **Landing page**: Hero-секция с анимациями, Bento-сетка фич, CTA-блок.
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


