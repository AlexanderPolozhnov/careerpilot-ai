Ты работаешь в проекте CareerPilot AI.

Цель: реализовать следующий frontend-backend vertical slice после успешных Auth и Vacancies — Companies.

Контекст:
Проект — monorepo:

careerpilot-ai/
├── backend/
├── frontend/
├── docs/
│   ├── FRONTEND_BACKEND_CONTRACT.md
│   ├── README.DEV.md
│   └── I18N_IMPLEMENTATION.md
├── README.md
├── ROADMAP.md
└── docker-compose.yml

Уже реализовано и проверено:
- Auth vertical slice:
  register → login → cp_access_token → Authorization header → GET /auth/me → protected UI.
- Vacancies vertical slice:
  create/list/detail/update/delete vacancy через backend + PostgreSQL.
- Backend tests проходят, включая Testcontainers.
- Frontend lint/build проходят.

Главный источник правды для API:
docs/FRONTEND_BACKEND_CONTRACT.md

Нужно реализовать Companies slice строго по контракту и связать его с уже реализованными Vacancies.

Важно:
- Не переписывать весь backend.
- Не переписывать весь frontend.
- Не менять контракт без необходимости.
- Если есть расхождение между frontend service layer и контрактом — сначала зафиксировать его и выбрать минимальное исправление.
- Backend должен подстраиваться под контракт и frontend expectations.
- Entity не возвращать напрямую наружу.
- Все company operations должны быть scoped by authenticated user.
- userId не принимать из frontend request.
- Все человекочитаемые комментарии/документация — на русском.
- Code identifiers, DTO names, endpoints, env vars, enum values — на английском.
- Не реализовывать Applications/AI/Analytics/Notifications в этом шаге.

────────────────────────────────────────
1. Сначала изучи текущую реализацию
────────────────────────────────────────

Проверь:

Backend:
- текущий company package;
- CompanyEntity;
- CompanyRepository;
- CompanyService;
- CompanyController;
- company migrations;
- связь vacancy ↔ company;
- ownership checks;
- CurrentUserResolver;
- tests.

Frontend:
- company service;
- pages Companies/CompanyDetails, если есть;
- company types;
- mock data;
- create/edit/delete behavior;
- как vacancy UI использует companyId/company.

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

────────────────────────────────────────
2. Endpoints для реализации
────────────────────────────────────────

Реализовать endpoints из контракта для Companies.

Минимальный набор:

GET /api/companies
GET /api/companies/{id}
POST /api/companies
PUT /api/companies/{id}
DELETE /api/companies/{id}

Если frontend service layer вызывает дополнительные endpoints, например:
GET /api/companies/search
GET /api/companies/{id}/vacancies
GET /api/companies/{id}/applications

то:
- сначала проверь контракт и frontend service layer;
- реализуй только то, что реально нужно текущим pages;
- остальные пометь как TODO, если они есть в контракте, но не нужны для smoke flow.

────────────────────────────────────────
3. Data model / ownership
────────────────────────────────────────

Company должна принадлежать authenticated user.

Требования:
- все company operations требуют Bearer token;
- пользователь видит только свои companies;
- пользователь не может читать/обновлять/удалять чужие companies;
- user id брать из SecurityContext/JWT;
- не принимать userId из frontend request.

Минимальная Company entity должна поддерживать поля, которые ожидает frontend и контракт.

Ориентироваться на docs/FRONTEND_BACKEND_CONTRACT.md и frontend types.

Типичные поля:
- id UUID;
- name;
- website;
- industry;
- size;
- location;
- description;
- notes;
- createdAt;
- updatedAt.

Если в контракте поля отличаются — использовать контракт.

────────────────────────────────────────
4. Flyway migration
────────────────────────────────────────

Проверить существующие migrations.

Если таблицы companies нет — добавить новую migration.

Если таблица уже есть — не дублировать, а аккуратно добавить недостающие поля.

Migration должна:
- создать/обновить companies table;
- связать company с user через user_id;
- добавить unique/index, если нужно:
  - user_id;
  - name;
  - created_at;
- не ломать существующую vacancy.company_id связь.

Важно:
- если company связана с vacancy, delete должен быть безопасным.
- Если есть связанные vacancies, не удалять company физически без понимания последствий.
- Можно использовать soft delete/archive или запрет удаления при наличии связанных vacancies, если это соответствует контракту.
- Если контракт говорит DELETE — вернуть 204 только если удаление безопасно.
- Если есть связанные вакансии, лучше вернуть понятную ошибку 409 Conflict, если это не противоречит контракту.

────────────────────────────────────────
5. Backend implementation
────────────────────────────────────────

Реализовать layered structure:

company/
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
- Использовать MapStruct, если он уже применяется в проекте.
- Если manual mapper уже используется для company — можно оставить manual mapper, но не смешивать mapping в controller.

Error handling:
- использовать существующий GlobalExceptionHandler;
- добавить NotFound/AccessDenied/Conflict/Validation errors, если нужно;
- error response должен соответствовать контракту.

Pagination:
- если GET /api/companies по контракту возвращает pagination — использовать PagedResponse shape:
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
- Если frontend передает search/page/size/sort/direction — поддержать их.
- Если sort сложный — сделать минимально безопасную реализацию и зафиксировать TODO.

Validation:
- name required;
- website optional, но должен быть URL, если указан;
- остальные поля по контракту.

────────────────────────────────────────
6. Связь Companies с Vacancies
────────────────────────────────────────

Проверить, что create/update vacancy с companyId работает корректно:

- companyId должен принадлежать текущему user;
- нельзя привязать vacancy к чужой company;
- если companyId не передан — vacancy может быть создана без company, если это разрешено контрактом;
- vacancy detail/list должны возвращать company info в форме, ожидаемой frontend.

Smoke flow для связи:
1. login;
2. create company;
3. create vacancy with companyId;
4. get vacancy detail;
5. убедиться, что company отображается/возвращается;
6. попытка использовать чужой companyId должна быть rejected/not found.

────────────────────────────────────────
7. Frontend integration
────────────────────────────────────────

Frontend менять минимально.

Проверить:
- VITE_USE_MOCKS=false;
- company service вызывает реальные endpoints;
- Authorization header уже добавляется api-client;
- response shape совпадает.

Smoke flow должен работать в UI:
- открыть Companies page;
- увидеть пустой список без ошибки;
- создать company;
- увидеть company в списке;
- открыть company detail, если страница есть;
- обновить company;
- удалить company, если нет связанных vacancy;
- после refresh данные сохраняются в PostgreSQL.

Если UI пока не имеет create/update/delete действий:
- добавить минимальные dev-friendly actions, как было сделано для Vacancies;
- не делать полноценный UI redesign.

────────────────────────────────────────
8. Tests
────────────────────────────────────────

Добавить минимальные backend tests, если тестовая инфраструктура позволяет.

Service tests:
- create company for current user;
- list only current user's companies;
- get by id owned by user;
- not found for чужая/несуществующая company;
- update company;
- delete company;
- conflict delete company with linked vacancies, если такая логика выбрана.

Controller tests:
- unauthorized request returns 401;
- list companies authorized;
- create company authorized;
- get company by id authorized.

Integration/linkage tests:
- vacancy cannot be linked to company owned by another user;
- vacancy can be linked to current user's company.

Не отключать важные тесты без явного TODO.

────────────────────────────────────────
9. Documentation / Roadmap
────────────────────────────────────────

После реализации минимально обновить:

ROADMAP.md:
- Company API backend status;
- Companies integration status.

docs/FRONTEND_BACKEND_CONTRACT.md:
- не менять, если реализация совпадает;
- если были уточнения — обновить строго и минимально.

docs/README.DEV.md:
- обновить только если появились новые команды/env/известные ограничения.

README.md:
- обычно не трогать, если только статус проекта принципиально не изменился.

Не писать, что весь проект production-ready.

────────────────────────────────────────
10. Checks
────────────────────────────────────────

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
5. open companies page
6. create company
7. list company
8. open company detail, если есть
9. update company
10. create vacancy with companyId
11. verify vacancy returns company info
12. delete company behavior:
    - без связанных vacancy: 204
    - со связанными vacancy: expected behavior по контракту/реализации

Если backend tests падают из-за Docker/Testcontainers:
- указать это явно;
- если Docker работает, разобраться и исправить.

────────────────────────────────────────
11. Git hygiene
────────────────────────────────────────

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

────────────────────────────────────────
12. Definition of Done
────────────────────────────────────────

Companies slice считается готовым, если:

- GET /api/companies работает;
- GET /api/companies/{id} работает;
- POST /api/companies работает;
- PUT /api/companies/{id} работает;
- DELETE /api/companies/{id} работает;
- все operations protected by JWT;
- user видит только свои companies;
- vacancy нельзя связать с чужой company;
- vacancy можно связать со своей company;
- response shape совпадает с contract/frontend;
- frontend при VITE_USE_MOCKS=false показывает реальные companies;
- create/list/detail/update/delete работают из UI или через documented smoke API, если UI пока минимальный;
- данные сохраняются в PostgreSQL;
- errors возвращаются в contract format;
- frontend lint/build проходят;
- backend tests проходят;
- ROADMAP обновлен.

────────────────────────────────────────
13. Финальный отчёт
────────────────────────────────────────

В конце дай отчёт на русском:

1. Что было изучено.
2. Какие endpoints реализованы.
3. Какие backend файлы добавлены/изменены.
4. Какие frontend файлы добавлены/изменены.
5. Какие migrations добавлены.
6. Как реализована user ownership.
7. Как реализована связь company ↔ vacancy.
8. Совпадает ли реализация с contract.
9. Какие проверки прошли.
10. Результат manual smoke.
11. Что осталось TODO.
12. Можно ли делать commit.