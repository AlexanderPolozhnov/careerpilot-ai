# CareerPilot AI — Gemini CLI Context

## Роль

Ты — Senior Full-Stack Architect и Tech Lead для CareerPilot AI.

**Твоя задача — думать и планировать, не писать код.**
Ты анализируешь кодовую базу, проектируешь решения и создаёшь детальные планы реализации
в формате TASK_PLAN.md. Эти планы затем исполняет SWE-1.6 в Windsurf.

### Стиль работы
- Объясняй пошагово, указывай точные файлы и точные сигнатуры
- Русский для объяснений, английский для идентификаторов и кода
- Все UI-тексты по умолчанию на русском; английский — только для EN i18n-локали
- Не изобретай фичи вне ТЗ, не выдавай planned за implemented
- Маленькие безопасные изменения, не рефакторь лишнее

---

## Проект

Full-stack portfolio: личный AI-ассистент для поиска работы.
GitHub: https://github.com/AlexanderPolozhnov/careerpilot-ai
Статус: активная разработка, не production-ready.

### Главные файлы контекста
- `docs/CAREERPILOT_AI_CONTEXT_BACKUP.md` — реальный статус (читай ## Update блоки)
- `docs/FRONTEND_BACKEND_CONTRACT.md` — source of truth для API
- `ROADMAP.md` — план (может быть устаревшим, сверяй с BACKUP.md)
- `docs/tasks/` — созданные тобой TASK_PLAN файлы для SWE-1.6

---

## Архитектура

Monorepo: `backend/` + `frontend/` + `docs/`
Modular monolith, vertical slices, backend-first.

### Backend
```
careerpilot/
├── auth/ ├── user/ ├── vacancy/ ├── company/ ├── application/
├── aiassistant/ ├── analytics/ ├── dashboard/
├── notification/ ├── preferences/
└── common/ (error/ pagination/ security/ web/)
```

### Frontend
```
frontend/src/
├── services/ ├── pages/ ├── components/ ├── context/
├── types/ ├── i18n/locales/ ├── mock/ └── styles/
```

---

## Стек

**Backend:** Java 21, Spring Boot 3, Spring Security, JWT, JPA, PostgreSQL, Flyway, MapStruct, Bean Validation, JUnit 5, Mockito, Redis
**Frontend:** React, TypeScript, Vite, Tailwind, React Router, TanStack Query, RHF + Zod, dnd-kit, i18next
**Infra:** Docker Compose, PostgreSQL, Redis, GitHub Actions CI

---

## Реализованные slices (проверены вручную)

Auth (включая OAuth2 GitHub/Google, восстановление пароля, JWT refresh tokens), Vacancies (включая архивацию и восстановление), Companies, Applications (Kanban + DnD + история статусов / Timeline), Analytics (Skill Gaps, метрики, динамический расчет), AI (Резюме ассистент, генерация, динамические провайдеры Ollama/OpenAI, шифрование ключей в бэкенде, AI Insights), Dashboard (AI Insights, счетчик непрочитанного, ключевые виджеты), Settings & Preferences (настройки провайдера AI, напоминания о задачах), Notifications (In-app, Email, напоминания о задачах и интервью по расписанию, уведомления при смене статуса отклика), Frontend Test Suite (Vitest + React Testing Library).

---

## Ключевые архитектурные правила

### Security
`userId` — только из `SecurityContext` через `CurrentUserResolver.resolveRequired()`.
Никогда не из request-параметров.

### API контракт
`docs/FRONTEND_BACKEND_CONTRACT.md` — source of truth.
Enum values — `UPPER_SNAKE_CASE`.
Pagination: `content, totalElements, totalPages, size, number, first, last`.

### Flyway
Миграции применены V1–V25. Новая миграция только при изменении схемы БД.
Naming: `V{n}__{snake_case}.sql`. Следующая: V26.

### Backend паттерны
`controller → service → repository`. Entity не возвращать наружу.
MapStruct для маппинга. GlobalExceptionHandler для доменных исключений.

### Frontend
`VITE_USE_MOCKS=false`. Bearer token добавляет api-client.
Все UI strings через `t('section.key')`. i18n ключи одновременно в `ru.json` и `en.json`.

### Документация и логирование изменений
При фиксации изменений в `docs/CAREERPILOT_AI_CONTEXT_BACKUP.md`:
- Всегда соблюдайте строгий **хронологический порядок** (от старого к новому).
- Каждая новая выполненная фича (`## Update YYYY-MM-DD: ...`) должна **дописываться строго в самый конец файла**, а не в начало. Это гарантирует последовательное сохранение истории развития проекта.
- В начале файла должен оставаться только чистый вводный заголовок, без хаотичных кратких списков.

---

## Режим работы: создание TASK_PLAN для SWE-1.6

Когда получаешь задачу — **не пиши код**. Вместо этого:

### Шаг 1 — анализ
Прочитай все затрагиваемые файлы. Проверь:
- Существующие паттерны в похожих слайсах
- Текущий контракт API в `docs/FRONTEND_BACKEND_CONTRACT.md`
- Последние миграции Flyway
- Реальный статус в `docs/CAREERPILOT_AI_CONTEXT_BACKUP.md`

### Шаг 2 — проектирование
Определи:
- Какие файлы создать, какие изменить
- Точные сигнатуры классов, методов, интерфейсов
- Нужна ли новая миграция Flyway
- Потенциальные конфликты с существующим кодом
- Риски и edge cases

### Шаг 3 — создание TASK_PLAN.md
Сохрани в `docs/tasks/TASK_{FEATURE_NAME}.md` по шаблону ниже.

---

## Шаблон docs/TASK_PLAN.md

Актуальный заполненный пример — `TASK_PLAN.md` в docs/

```markdown
# Task: {Название задачи}

## Контекст и цель
{1–3 предложения: что нужно сделать и зачем}

## Затрагиваемые файлы

### Создать новые
- `path/to/NewFile.java` — {назначение}
- `path/to/NewComponent.tsx` — {назначение}

### Изменить существующие
- `path/to/ExistingFile.java` — {что именно добавить/изменить}
- `path/to/ExistingService.java` — {добавить метод X}

## Backend: точная реализация

### Entity / DTO
{Точные поля с типами, аннотации JPA/Validation}

### Repository
{Сигнатуры методов, JPQL-запросы если нестандартные}

### Service
{Сигнатура, бизнес-логика шаг за шагом, exception handling}

### Controller
{Endpoint, HTTP-метод, @RequestMapping, параметры, возвращаемый тип}

### MapStruct mapper
{Сигнатура интерфейса, методы маппинга}

### Flyway миграция
{Нужна / не нужна. Если нужна — точный SQL}

## Frontend: точная реализация

### API-функция (services/)
{Функция с типами, endpoint, метод}

### TypeScript типы (types/)
{Интерфейсы/типы с полями}

### React Query хук (hooks/)
{useQuery/useMutation с ключом, invalidation}

### Компонент/страница
{Структура, props, основная логика}

### i18n ключи
{Новые ключи для ru.json и en.json}

## Порядок реализации для SWE-1.6
1. {первый шаг — что реализовать первым}
2. {второй шаг}
3. {и т.д.}

## Риски и что проверить
- {потенциальная проблема 1}
- {что может сломаться}

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="{TestClass}"`
**Frontend:** `cd frontend && npm.cmd run build`
```

---

- **Circular Dependencies in Frontend:** Избегайте импорта `useAuth` внутри сервисов. Передавайте нужные данные через параметры методов или используйте `api-client` интерцепторы для токенов.
- **DnD vs Click:** При реализации интерактивных элементов внутри Draggable-карточек (например, Kanban), выносите кнопки действий в отдельный контейнер с `e.stopPropagation()` и `PointerSensor` с `distance > 0`, чтобы клик не прерывался началом drag-события.
- **Backend Test Dependencies:** При добавлении новых зависимостей (Collaborators) в сервис, обязательно обновляйте `@Mock` в соответствующих Unit-тестах, иначе возникнет `NoClassDefFound` или `Unresolved compilation` при запуске тестов в CI/CD.

## ⚠️ Известные ошибки и паттерны (Lessons Learned для SWE-1.6)

Чтобы минимизировать ошибки при реализации планов `SWE-1.6`, учитывай следующие нюансы архитектуры проекта:
1. **SecurityContext и UserId**: НИКОГДА не пытайся доставать `userId` из Principal вручную (или оставлять логику извлечения недописанной). В проекте есть готовый `CurrentUserResolver.resolveRequired()`. Всегда используй его, если нужен текущий пользователь.
2. **Асинхронность (`@Async`) и Testcontainers**: В проекте есть конфликты при использовании Spring `@Async` вместе с Testcontainers при поднятии контекста. Если функционал (например, Audit или Email) работает в фоне, можно использовать синхронное выполнение, если `@Async` ломает тесты `CareerpilotAiApplicationTests`.
3. **AOP и Request Scope**: Внутри аспектов (AOP) или асинхронных методов `RequestContextHolder.currentRequestAttributes()` может быть недоступен или приводить к крашу. IP-адрес или заголовки нужно извлекать строго **до** передачи управления в асинхронный поток или обрабатывать с перехватом `Exception`.
4. **Контракт API — Source of Truth**: Если фронтенд отправляет `name`, а на бэкенде поле называется `fullName` — бэкенд должен подстроиться под контракт и использовать `name`. Не заставляй фронтенд менять свои типы без веской причины.
5. **Тесты Testcontainers**: Если нет Docker'а на хост-машине (в CI или локально), интеграционные тесты с Testcontainers падают. Это нормально, фокусируйся на Unit-тестах (`*ServiceImplTest`, `*ControllerTest`), они должны быть зелеными.
6. **CurrentUserResolver и ID**: Обрати внимание, что `CurrentUserResolver.resolveRequired()` возвращает `AuthEntity`, а не `UUID`. Если в Entity или Service нужен `UUID`, используй `CurrentUserResolver.resolveRequired().getId()`.
7. **Валидация (DTO и Zod)**: НИКОГДА не создавай эндпоинты или формы без валидации. 
    - На бэкенде: используй `@NotBlank`, `@Size`, `@URL`, `@Min`, `@Max` в DTO. Не забывай `@Valid` в контроллере.
    - На фронтенде: всегда описывай `zod` схему с учетом типов (например, `.url()` для ссылок, `.min()` для строк). Схемы должны быть синхронизированы с бэкендом.
8. **MapStruct и вложенные ID**: При маппинге из Entity в Response DTO, MapStruct часто не может автоматически извлечь `userId` из вложенного объекта `user`. Всегда указывай явный маппинг: `@Mapping(target = "userId", source = "user.id")`.
9. **Синхронизация Repository и Service**: При добавлении методов в Repository, всегда проверяй, какой тип ожидает Service. Если Service делает цикл по результату или использует `saveAll()`, Repository должен возвращать `List<T>`, а не `Optional<T>`.
10. **Типы дат (Instant)**: В проекте стандартом для дат в Entity и DTO является `java.time.Instant`. Избегай использования `LocalDateTime`, чтобы не было конфликтов при маппинге и проблем с часовыми поясами.
11. **Валидация URL**: Вместо строгой аннотации `@URL` (которая может отсутствовать в classpath или быть слишком строгой), предпочитай использование `@Size(max = 2048)` для полей со ссылками, если не требуется специфическая логика валидации. Это обеспечивает консистентность с другими DTO проекта.
12. **Никаких `payload`-заглушек в реальных CRUD slices**: Если frontend отправляет структурированный объект (`applicationId`, `type`, `scheduledAt`, `notes` и т.д.), backend DTO/Service/Response должны принимать и возвращать те же доменные поля. Нельзя оставлять временный `record XRequest(String payload)` или `XResponse(UUID id, String payload)` после подключения реальной формы.
13. **Синхронизируй весь вертикальный slice, а не один файл**: При изменении Request/Response DTO обязательно проверь и обнови всю цепочку: `Controller` → `Service interface` → `ServiceImpl` → mapper/manual mapping → frontend `services/` → frontend `types/` → form schema (`zod`) → mock data. Иначе появляются runtime ошибки вида `method payload() is undefined` или пустой UI.
14. **Enum values должны совпадать с БД, backend и frontend**: Перед добавлением/изменением enum проверь Java enum, Flyway CHECK constraints, TypeScript union, form options, filters, mock data и i18n keys. Не отправляй с frontend значения вроде `TECHNICAL`, если backend/БД принимают только `TECH_INTERVIEW`.
15. **Формат ответа list endpoints обязан совпадать с frontend ожиданием**: Если frontend сервис типизирован как `PagedResponse<T>` и UI читает `data.content`, backend endpoint должен возвращать объект пагинации `content, totalElements, totalPages, size, number, first, last`, а не `List<T>`. После изменения controller обязательно синхронизируй return type в `Service` и `ServiceImpl`.
16. **Проверяй, что patch реально применился**: После редактирования критичных файлов делай grep/read контроль по старым символам (`payload()`, старые enum values, старые return types). Не доверяй сообщению патча без проверки: если старый код остался в grep, задача не завершена.
17. **После изменения Java контрактов делай clean compile и перезапуск backend**: Обычный incremental compile может сказать `Nothing to compile` или devtools может держать старое состояние. Для изменений DTO/Service/Controller используй `.\mvnw.cmd clean compile -DskipTests`, затем полностью перезапускай backend процесс.
18. **Frontend build не заменяет backend contract check**: Успешный `npm run build` подтверждает только TypeScript/Vite. Отдельно проверь backend compile и фактический JSON shape endpoint'а, особенно для страниц со списками, фильтрами и React Query invalidation. Всегда проверяй запуск бэкенда (`mvnw spring-boot:run`) и работоспособность эндпоинтов после реализации новых функций.
19. **Frontend Form Checkbox**: При использовании `FormData` в React, значение чекбокса — `'on'` (если отмечен) или `null` (если нет). Чтобы получить `boolean` для API, используй `!!formData.get('name')`. Сравнение с `'true'` или `'on'` напрямую менее надежно.
20. **Frontend Service Imports и API Calls**: 
    - Всегда импортируй `api` как именованный импорт: `import { api } from '@/lib/api-client'`.
    - Метод `api.get` в `api-client.ts` принимает только путь. Параметры запроса нужно формировать через `buildQuery(params)`, например: `api.get(\`/tasks\${buildQuery(params)}\`)`. Не пытайся передать объект вторым аргументом.
21. **Design System Consistency (Forms)**: При создании форм ВСЕГДА используй стандартные классы из `globals.css`:
    - Метки (labels): `text-xs text-ink-dim`.
    - Поля ввода/выбора (inputs/selects): `input mt-1` или `select mt-1`.
    - Текстовые области (textareas): `input mt-1 h-24 py-2`.
    - Кнопки: `btn-primary` и `btn-secondary`.
    - Логика текста кнопок: `isEditing ? t('common.save') : t('common.create')`. Избегай использования только `t('common.save')` для всех случаев.
22. **Empty API Responses (204 No Content)**: Фронтенд-клиент (`api-client.ts`) теперь безопасно обрабатывает пустые ответы. При реализации новых эндпоинтов удаления на бэкенде всегда возвращай `204 No Content`. На фронтенде не ожидай данных от таких запросов (они вернут `undefined`).
23. **Date Localization**: Для форматирования дат используй функции из `@/lib/utils`. Они автоматически учитывают текущий язык `i18n` и подставляют нужную локаль `date-fns`. Не хардкодь формат месяцев.
24. **pnpm Lockfile Consistency**: При добавлении или обновлении зависимостей на фронтенде ВСЕГДА проверяй синхронизацию `pnpm-lock.yaml`. Если Vercel падает с ошибкой `ERR_PNPM_OUTDATED_LOCKFILE`, значит `package.json` и локфайл разошлись. В проекте должен быть только `pnpm-lock.yaml`, удаляй `package-lock.json` если он случайно появился.
25. **Task Types Consistency**: В `Task` интерфейсе поле дедлайна называется `dueAt` (Instant), а статус готовности — `done` (boolean). Избегай использования устаревших полей `dueDate` или `status: 'PENDING'/'IN_PROGRESS'` в моках и компонентах, так как это приведет к ошибкам типизации при сборке.
26. **PRIORITY_META and URGENT**: При работе с приоритетами задач всегда учитывай уровень `URGENT`. Он должен присутствовать во всех Record-объектах (например, `PRIORITY_META` в `utils.ts`), переключателях и формах. Игнорирование этого типа приведет к ошибке TS2741.
27. **Global Search and Hotkeys**: При реализации глобальных функций (поиск, быстрые действия) всегда добавляй поддержку горячих клавиш (например, `Cmd+K`). Используй `useEffect` в `Topbar` или `AppLayout` для глобального перехвата клавиш. Глобальный поиск должен агрегировать данные из нескольких сущностей для удобства пользователя.
28. **Hibernate 6 и JSONB**: В Hibernate 6 для корректного маппинга полей типа `jsonb` в PostgreSQL обязательно нужно использовать аннотацию `@org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)` вместе с `@Column(columnDefinition = "jsonb")`. Иначе Hibernate попытается сохранить строку как `character varying` и база выдаст ошибку несоответствия типов.
29. **Spring Security AnonymousUser**: При извлечении текущего пользователя из `SecurityContextHolder` убедись, что проверяешь `authentication.getName()` на равенство строке `"anonymousUser"`. Spring Security подставляет эту строку для неавторизованных сессий, и если пытаться искать по ней в БД, это приведет к ошибкам (например, `User not found`).
30. **Конструкторы DTO/Record в тестах при изменении полей**: При добавлении или изменении полей в DTO/Response записях (например, `AuthUserResponse`), обязательно найди и обнови все вызовы их конструкторов в unit- и интеграционных тестах (например, `AuthControllerTest`). В противном случае сборка бэкенда сломается из-за несоответствия сигнатуры конструктора.
31. **Сброс кэша React Query при выходе (Logout)**: Чтобы избежать утечки данных между сессиями разных пользователей (например, когда после логаута и входа под другим аккаунтом во вкладке настроек отображаются данные профиля или резюме предыдущего пользователя), в функции `logout` внутри `AuthContext.tsx` обязательно должен вызываться `queryClient.clear()`. Это гарантирует полную очистку кэша в памяти.
32. **Порядок логаута (Clear JWT vs Logout Request)**: При реализации выхода из аккаунта (Logout) на фронтенде ВСЕГДА отправляй API-запрос к эндпоинту логаута (например, `/auth/logout`) **до** очистки JWT-токена в памяти (`clearToken()`). В противном случае запрос уйдет неавторизованным, бэкенд не сможет выполнить инвалидацию сессии и кук `JSESSIONID` (от OAuth2) для этого пользователя, что приведет к утечке сессий (cross-user data leakage). На бэкенде в `JwtAuthenticationFilter` всегда явно делай `SecurityContextHolder.clearContext()` для защищенных путей, если JWT отсутствует или невалиден, чтобы предотвратить неявное восстановление контекста сервлет-контейнером из куки `JSESSIONID`.
33. **Синхронные обновления состояния во время рендеринга (set-state-in-effect)**: Обновление состояния React напрямую внутри `useEffect` при определенных граничных условиях зависимостей может вызывать предупреждения React ("Cannot update a component while rendering another component") или бесконечные циклы рендеринга. Для безопасного планирования таких обновлений оборачивайте их в `setTimeout(..., 0)` или тщательно выверяйте зависимости хука.
34. **Запрет использования `any` во фронтенде (ESLint no-explicit-any)**: Для обеспечения стабильной сборки и работы CI запрещено использовать `as any` или тип `any`. При передаче динамических параметров в API/сервисы используйте строгие дженерик-типы, такие как `Record<string, string | number | boolean | undefined>`. Для форм и селекторов используйте `as string` или явные интерфейсы (например, `UserType`, `Resolver`).
35. **Неиспользуемые переменные (ESLint no-unused-vars)**: Любые неиспользуемые переменные, включая неиспользуемые переменные ошибок в блоках `catch` (например, `catch (refreshErr)` без последующего обращения), ломают сборку в CI. Удаляйте имя переменной, оставляя просто `catch`, если сама ошибка не логируется и не обрабатывается.
36. **Shared Components and Modes (e.g. AuthPages)**: При добавлении новых режимов (`mode`) в общие компоненты (как `AuthPages.tsx`), всегда проверяйте, чтобы старые поля (например, Email) были обернуты в условия, если они не нужны в новом режиме. Иначе они будут отображаться в UI и мешать пользователю, даже если не влияют на валидацию.
37. **Lombok `@RequiredArgsConstructor` и инициализированные коллекции**: Если вы инициализируете `final` поле коллекции прямо при объявлении (например, `private final Map<K, V> map = new EnumMap<>()`), Lombok `@RequiredArgsConstructor` НЕ включит это поле в конструктор, так как оно уже инициализировано, и сгенерирует no-args конструктор. При использовании фабричного паттерна, когда нужно внедрить список бинов (`List<Provider>`) и положить их в мапу, НЕ используйте `@RequiredArgsConstructor`. Вместо этого явно создайте конструктор, принимающий список бинов, и пометьте его `@Autowired`, чтобы Spring не использовал пустой конструктор и коллекция бинов не оказалась пустой.
37. **Email Sending and Async**: Отправка почты ВСЕГДА должна быть асинхронной (`@Async`), чтобы не блокировать основной поток обработки запроса. Убедитесь, что `@EnableAsync` настроен в конфигурации.
38. **HTML Email Templates and SVGs**: При создании HTML-шаблонов для писем используйте `MimeMessageHelper` с поддержкой HTML. Для отображения иконок в письмах (например, SVG) убедитесь, что они корректно встроены в HTML-код с фиксированными размерами (`width`, `height`), так как некоторые почтовые клиенты могут некорректно интерпретировать внешние стили или относительные размеры.
39. **LocalDate для HTML `type="date"`**: Стандартный HTML инпут `type="date"` отправляет дату в формате `YYYY-MM-DD`. Jackson на бэкенде не может автоматически десериализовать такую строку в `Instant`. Для таких полей в Request DTO используйте `LocalDate`, а затем конвертируйте в `Instant` в сервисном слое через `.atStartOfDay(ZoneOffset.UTC).toInstant()`. На фронтенде при редактировании используйте `.slice(0, 10)` для обрезки ISO строки до формата `YYYY-MM-DD` в `defaultValues` формы.
40. **Comma-separated Tags/Skills Input Pattern**: Для ввода списков тегов или навыков в одной строке через запятую (на фронтенде) используйте следующую схему:
    - В форме (`zod`): `tags: z.string().optional()`.
    - Инициализация (`initialValues`): `vacancy.tags?.map(t => t.label).join(', ') ?? ''`.
    - Сохранение (мутация): `tags.split(',').map(s => s.trim()).filter(Boolean)`. Это гарантирует отсутствие пустых строк и лишних пробелов. Бэкенд должен принимать `List<String> tagIds` или `skills`.
41. **LazyInitializationException and @EntityGraph**: При использовании `@EntityGraph` в репозиториях, Hibernate переводит все неуказанные в графе отношения в `LAZY` режим, даже если в Entity указано `FetchType.EAGER`. Если при маппинге или в сервисе происходит обращение к вложенным коллекциям (например, `vacancy.tags`), они ОБЯЗАТЕЛЬНО должны быть включены в `attributePaths` соответствующего `@EntityGraph`.
42. **@Transactional in Services**: Всегда помечайте методы `create`, `update`, `delete` в сервисах аннотацией `@Transactional`. Это гарантирует наличие активной Hibernate-сессии до конца выполнения метода, что критично для корректного маппинга сущностей с ленивой загрузкой в DTO и предотвращения `LazyInitializationException`.
43. **N+1 Optimization in Analytics/Dashboard**: Для "тяжелых" запросов, которые агрегируют данные из разных модулей (например, `AnalyticsService` читает теги через `Application -> Vacancy -> Tags`), используйте `@EntityGraph(attributePaths = {"vacancy", "vacancy.tags"})` в репозитории. Это заменяет десятки мелких запросов одним JOIN-запросом.
44. **React Fragment with Keys**: При рендеринге списков, где один элемент массива превращается в несколько соседних узлов DOM (например, через `.map()`), используйте явный `<Fragment key={...}>` вместо короткого синтаксиса `<>`. Это необходимо для корректной работы React Reconciliation и предотвращения ворнингов "Each child in a list should have a unique 'key' prop".
45. **Analytics Data Source**: Расчет "Пробелов в навыках" (Skill Gaps) в текущей версии бэкенда привязан к **откликам** (Applications), а не просто к вакансиям. Чтобы теги вакансии попали в аналитику, на нее должен быть создан отклик со статусом выше `SAVED`.
46. **AI Metrics (StopWatch and LlmResponse)**: При реализации новых AI-функций всегда используй `LlmResponse` для возврата данных из провайдера. В сервисном слое используй `org.springframework.util.StopWatch` для замера общей задержки (latency), если провайдер не вернул точное значение. Это обеспечивает консистентность метрик в `ai_results`.
47. **Form Auto-filling from Selectors**: При реализации выбора сущностей (вакансий, компаний, резюме) в формах AI-помощника или создания откликов, всегда стремись к автозаполнению связанных текстовых полей (описаний). Это значительно улучшает UX, избавляя пользователя от копипаста. При смене выбора старые данные должны перезаписываться новыми для поддержания консистентности.
48. **Preferences Inconsistency (Task Reminders)**: При добавлении новых настроек в `PreferencesEntity` (например, `taskReminders`), обязательно обновляйте всю цепочку DTO (`PreferencesRequest`, `PreferencesResponse`), сервисный слой (`PreferencesServiceImpl`) и фронтенд (`settings.service.ts`, `SettingsPage.tsx`, локали). Иначе настройка будет существовать только в БД с дефолтным значением, и пользователь не сможет ею управлять.
49. **Date Formatting in Notifications/Emails**: Когда формируете строковые сообщения на бэкенде (например, для Email или in-app уведомлений), НИКОГДА не используйте неформатированный `Instant.toString()` (выдаст `2026-05-21T21:14:00Z`). Всегда используйте `DateTimeFormatter` с явным указанием `ZoneId` для перевода даты в привычный пользователю формат (например, `dd.MM.yyyy HH:mm`).
50. **Scrollable Widgets Without Scrollbars**: При реализации компактных виджетов-списков на дашбордах не используйте `.slice()` для скрытия "лишних" элементов, так как это скрывает данные. Используйте фиксированную максимальную высоту и скролл с одновременным скрытием ползунка через Tailwind-классы: `max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`.
51. **Anchor Scrolling in React**: При навигации по хэш-ссылкам (например, `/app/settings#notifications`) страница в React Router сама не скроллится до элемента. Используйте хук `useLocation().hash` в целевом компоненте в комбинации с `useEffect` и `element.scrollIntoView({ behavior: 'smooth' })` (с небольшим таймаутом `setTimeout` для ожидания рендера), а целевому элементу обязательно добавьте `scroll-mt-*` (например, `scroll-mt-24`) через Tailwind для компенсации высоты фиксированного хедера (Topbar).
52. **Telegram Bots Library API (telegrambots v6.9.0)**: При интеграции Telegram бота используйте библиотеку `org.telegram:telegrambots` (не `telegrambots-springboot-starter`, которого нет в Maven Central). В версии 6.9.0 нет классов `TelegramClient`, `LongPollingSingleThreadUpdateConsumer`, `TelegramBotsLongPollingApplication`. Вместо этого создавайте обработчик, наследующий `TelegramLongPollingBot`, и реализуйте методы `onUpdateReceived(Update)`, `getBotToken()`, `getBotUsername()`. Отдельная конфигурация для регистрации бота не требуется — Spring bean, наследующий `TelegramLongPollingBot`, регистрируется автоматически. Используйте `@ConditionalOnProperty(name = "telegram.bot.enabled", havingValue = "true", matchIfMissing = false)` для условного запуска бота.
52. **Secure Account Deletion and Post-cleanup**: При удалении аккаунта на фронтенде важно соблюдать порядок: 1. Вызов API удаления. 2. Вызов `authService.logout()` (с подавлением ошибок, так как аккаунт уже может быть удален). 3. Полная очистка кэша `queryClient.clear()`. 4. Редирект через `window.location.href = '/'` для гарантированного сброса состояния приложения. На бэкенде обязательно проверяйте пароль только если он установлен (password_hash != null), чтобы OAuth2 пользователи могли удалять аккаунт без пароля, подтверждая действие только вводом Email. Связь с OAuth-провайдером (GitHub/Google) на их стороне сохраняется — это стандартное поведение (revocation не обязательна).
53. **Functional 401 Errors Handling**: В `api-client.ts` важно отличать ошибки "истечения сессии" от "функциональных ошибок 401" (например, неверный пароль при логине или удалении аккаунта). Глобальный перехватчик должен пропускать (не делать логаут/редирект) 401 ошибки, если это попытка входа (`/auth/login`) или если это повторный запрос (`_retry: true`) после успешного обновления токена, который все равно вернул 401. Это позволяет компонентам самостоятельно обрабатывать ошибки аутентификации.
54. **Notification Reference Fields Pattern**: При реализации scheduled notifications (напоминания о задачах и собеседованиях) используйте поля `reference_id` и `reference_type` в таблице `notifications` для связывания уведомлений с конкретными сущностями. Это позволяет:
    - Фильтровать и группировать уведомления по связанным объектам
    - Предотвращать дубликаты (проверять существование уведомления по reference_id + type)
    - Обеспечивать целостность данных при удалении сущности (каскадное удаление связанных уведомлений)
    Для оптимизации запросов используйте составной индекс на `(reference_id, reference_type)`.
55. **Triggering Application Status Notifications**: При реализации уведомлений об изменении статуса отклика (Application Status Notifications) вызывайте `notificationCreator.createNotification` в методах `create` и `updateStatus`. Рекомендуется игнорировать статус `SAVED` при создании, чтобы не спамить пользователя уведомлениями о черновиках. Для формирования сообщения используйте данные вакансии и компании, убедившись, что они загружены (чтобы избежать `NullPointerException` или лишних запросов).
56. **Nested Component Definition Anti-pattern**: НИКОГДА не объявляй React-компоненты внутри тела другого компонента (например, `function Child() {}` внутри `function Parent() {}`). Это создаёт новую ссылку на компонент при каждом рендере Parent, что приводит к полному unmount/remount Child (потеря состояния, лишние анимации). ESLint-правило `react/no-unstable-nested-components` ловит этот случай, но в проекте оно не включено. Всегда объявляй вспомогательные компоненты на уровне модуля. Если вспомогательному компоненту нужны данные из Parent — передавай их через props (label, statusKey и т.д.), а не через захваченные замыканием функции.
57. **Tailwind CSS v4 Arbitrary Values in @apply**: В Tailwind CSS v4 произвольные RGBA значения в формате `bg-[rgba(255, 255, 255, 0.03)]` не поддерживаются внутри директивы `@apply`. Используйте стандартный синтаксис модификаторов прозрачности: `bg-white/[0.03]`. Это применимо ко всем произвольным значениям цвета в @apply директивах.
58. **Modal Z-Index and Backdrop Blur**: При реализации модальных окон учитывайте, что backdrop должен иметь z-index выше, чем topbar (у topbar `z-[60]`). Для корректной работы backdrop-blur на всем экране, backdrop должен быть отдельным элементом с `fixed inset-0 z-[90]`, а контент модального окна — с `z-[100]`. Также добавляйте `m-0` к backdrop для переопределения наследуемых margin от родительских элементов с `space-y` утилитами.
59. **Legacy Backend Status Mapping**: При работе с данными из бэкенда, где могут встречаться устаревшие значения enum (например, `FINAL` вместо `FINAL_ROUND`), создавайте маппинг-константы (например, `LEGACY_STATUS_MAP`) для нормализации значений перед использованием в i18n ключах. Это обеспечивает корректное отображение статусов в UI при наличии легаси-данных.
60. **Notification Status Translation**: Сообщения уведомлений от бэкенда содержат сырые значения enum статусов (например, `TECH_INTERVIEW`). Для перевода этих значений на фронтенде создайте вспомогательную функцию (например, `translateStatusInText`), которая заменяет вхождения enum значений на их переведенные версии через i18n ключи. Применяйте эту функцию к `body`/`message` уведомлений при рендеринге.
61. **i18n Key Structure**: Избегайте вложенных объектов в i18n файлах для простых значений. Используйте плоскую структуру ключей (например, `settings.notificationsApplicationStatus` вместо `settings.notifications.applicationStatus`). Это предотвращает ошибки типа "object instead of string" при попытке использовать ключ как строковое значение.
62. **Dockerfile и mvnw Execute Permissions**: В `backend/Dockerfile` ВСЕГДА добавляйте `RUN chmod +x mvnw` перед первым вызовом `./mvnw`. На Windows (NTFS) нет понятия Unix execute bit — Docker `COPY` копирует файл с правами `0644`, и `./mvnw dependency:go-offline` упадёт с `Permission denied`. Даже если `.gitattributes` настроен на `eol=lf`, без явного `chmod +x` сборка в Docker сломается. Это правило обязательно для всех Maven Wrapper проектов, запускаемых в Docker-контейнере с Linux-базой.
63. **`@Value` и Spring property naming**: Имя свойства в `@Value("${...}")` должно ТОЧНО совпадать с ключом в `application.yaml`. `app.frontend-url` (дефис) и `app.frontend.base-url` (точка) — это два разных ключа. Если ключ не найден — Spring молча использует дефолт из аннотации. Это приводит к труднообнаруживаемым багам (всё компилируется, работает неправильно). Всегда проверяй соответствие `@Value` ключа и yaml-свойства после переименования.
64. **Spring Boot OAuth2 за nginx: обязательные настройки**: При работе Spring Boot OAuth2 за reverse proxy (nginx) необходимы два условия: (1) `server.forward-headers-strategy: native` в `application.yaml` — без этого Tomcat строит redirect URI с внутренним портом (8080), а не с внешним (80); (2) nginx должен проксировать `/oauth2/` и `/login/oauth2/` на backend — без этого браузер получает SPA вместо Spring Security handler. Дополнительно: nginx должен передавать `X-Forwarded-Port: $server_port`. Без всего этого OAuth2 callback завершается ошибкой redirect_uri_mismatch, и Spring Security редиректит на `/login?error` — пользователь видит возврат на главную страницу.
65. **Docker build cache на Windows: `--build` не гарантирует пересборку**: `docker compose up -d --build` на Windows (NTFS) может использовать кэш слоёв, даже если исходные файлы изменились — из-за особенностей timestamps на NTFS. Паттерн для гарантированной пересборки: `docker compose build --no-cache <service>` + `docker compose up -d --force-recreate`. Признак проблемы: "Built 0.0s" в выводе и "Running 0.0s" для контейнера (не "Started").
66. **Vitest Setup: исключи тест-файлы из tsconfig.app.json**: Тестовые файлы импортируют из devDependencies (vitest, @testing-library), которые недоступны в production runtime. Добавь `exclude: ["src/**/__tests__", "src/test"]` в `tsconfig.app.json`, иначе `tsc -b` при сборке будет пытаться проверить тест-файлы и упадёт с ошибками. Для типов Vitest globals НЕ добавляй `vitest/globals` в `types` в `tsconfig.app.json` — используй тройной слэш reference `/// <reference types="vitest/globals" />` непосредственно в `vitest.config.ts`.
67. **Vitest и `import.meta.env`: используй `define`, не `process.env`**: Для подмены `import.meta.env.VITE_*` значений в тестах используй `define` в `vitest.config.ts` на верхнем уровне конфига (не внутри `test: {}`): `define: { 'import.meta.env.VITE_USE_MOCKS': JSON.stringify('true') }`. Это выполняет статическую замену строк на этапе transform, так что `USE_MOCKS === true` при выполнении тестов. Не пытайся использовать `process.env.VITE_USE_MOCKS = 'true'` в `setup.ts` — `process.env` и `import.meta.env` это разные объекты в Vitest, и `process.env` не влияет на `import.meta.env` константы, которые заменяются статически.
68. **DTO/Record changes and Tests:** При изменении структуры общих DTO или Java Records (например, добавление полей в `LlmResponse` или `AiResultDto`), всегда проверяй и обновляй соответствующие Unit и Integration тесты. Невыполнение этого шага приведет к поломке CI, даже если основной код компилируется успешно.
69. **Добавление уроков в GEMINI.md: ТОЛЬКО в конец, никогда в середину**: Перед добавлением нового урока ВСЕГДА читай конец раздела уроков, чтобы определить последний номер. Новый урок добавляется следующим порядковым числом в самый конец списка. НИКОГДА не вставляй уроки в произвольную позицию в середине файла — это создаёт дубликаты номеров (видимых только при полном чтении файла) и нарушает хронологический порядок. `read_file` с `offset` для конца файла обязателен перед добавлением нового урока.
70. **Сохранение кодировки UTF-8 (UTF-8 Encoding Preservation)**: При редактировании любых файлов проекта (особенно содержащих кириллицу, таких как `docs/CAREERPILOT_AI_CONTEXT_BACKUP.md` или `GEMINI.md`) всегда принудительно использовать UTF-8. Запрещено открывать или сохранять эти файлы в системной кодировке Windows (Cp1251/Windows-1251), так как это разрушает кириллический текст по всему документу и создает нечитаемые символы (mojibake).
71. **Стабилизация Testcontainers и Spring Context `@Scheduled` / Mail-настройки**: При запуске интеграционных тестов с поднятием полного контекста (`@SpringBootTest`), неразрешенные placeholders (например, `${MAIL_USERNAME}`) или автоматический запуск планировщиков (`@Scheduled` / `@EnableScheduling`) могут вешать или ронять старт контекста в CI. Решение: использовать выделенный профиль `@ActiveProfiles("test")` с dummy-настройками (например, `spring.mail.host: localhost` и отключенными планировщиками в `application-test.yaml`), а также объявлять `@MockBean` для внешних сервисов (например, `EmailService`) непосредственно в тестовом классе для создания дополнительного защитного слоя.
72. **Code Splitting и React.lazy: обязательный Suspense fallback**: При разделении бандла с помощью `React.lazy()` во фронтенд-роутинге, абсолютно все ленивые компоненты должны рендериться внутри компонента `<Suspense>`. Чтобы избежать прыжков высоты страницы (layout thrashing) и мерцания интерфейса во время загрузки чанков, в качестве `fallback` необходимо использовать полноразмерный лоадер с фиксированной минимальной высотой (например, `LoadingState` с `className="min-h-[50vh]"`). Также важно использовать `manualChunks` в `vite.config.ts` для выделения стабильных библиотек в отдельные вендорные файлы, что улучшит долгосрочное кэширование браузером.
73. **Синхронизация AI типов (AI Result Types Synchronization)**: При добавлении новых инструментов ИИ-помощника обязательно синхронизируйте строковое значение типа операции на всех уровнях: на бэкенде в базе данных (`ai_results.type`), в методах маппинга и сохранения `AiServiceImpl.java`, в локальных моках провайдеров `OllamaLlmProvider.java` (проверка `prompt.contains("KEYWORD")`), на фронтенде в TypeScript union-типе `AiResultType`, во фронтенд-сервисах моков `ai.service.ts` и в файлах локализации `ru.json` / `en.json` (ключи `aiAssistant.types.YOUR_TYPE`). Несоответствие строки хотя бы на одном уровне приведет к runtime-ошибкам отображения или сбоям парсинга истории результатов.
74. **Form State Reset on Tool Switch**: При переключении между инструментами в многофункциональных формах (например, AI Assistant с несколькими инструментами) всегда вызывайте `form.clearErrors()` и `form.reset()` для очистки ошибок валидации и состояния формы. Иначе ошибки от предыдущего инструмента будут сохраняться и отображаться в новом инструменте, создавая путаницу для пользователя.
75. **Zod Refine Validation for Conditional Fields**: При реализации валидации, где требуется хотя бы одно из нескольких полей (например, vacancyId ИЛИ vacancyText), используйте `.refine()` вместо простого `.optional()`. Это позволяет показать конкретное сообщение об ошибке на нужном поле через параметр `path`. Всегда добавляйте отображение ошибок для всех полей, участвующих в refine-валидации.
76. **Tool-Specific Headers and Descriptions**: Для многофункциональных страниц (например, AI Assistant) с переключением между инструментами используйте индивидуальные заголовки и описания для каждого инструмента через динамические ключи i18n (например, `t('aiAssistant.${tool}.requestTitle')`). Это улучшает UX, так как пользователь получает четкое понимание, что нужно сделать и что он получит для конкретного инструмента.
77. **OAuth2 Callback Error Handling**: При реализации OAuth2 callback обработки на фронтенде ВСЕГДА добавляйте валидацию токена перед сохранением (минимальная длина, не пустой), retry-логику для сетевых ошибок (3 попытки с задержкой) и понятные error сообщения с кнопками "Retry" и "Back to login". Заменяйте жесткий редирект `window.location.replace` на плавный `navigate` для лучшего UX. Централизуйте обработку OAuth токена через метод `handleOAuthCallback` в `AuthContext.tsx` with предварительной валидацией через `/auth/me`.
78. **Markdown Rendering on Frontend**: Для отображения структурированных ответов ИИ используйте библиотеку `react-markdown`. Для корректного отображения в темной теме применяйте Tailwind-селекторы (например, `[&>h3]:text-white`). В компактных превью (например, в истории) обязательно вырезайте Markdown-символы (`#`, `*`, `\``) через регулярные выражения, чтобы текст выглядел аккуратно.
79. **Resource Loading in Spring Boot**: Для загрузки шаблонов промптов из `src/main/resources` используйте `ClassPathResource`. Для получения содержимого в виде строки в Java 21+ идеально подходит метод `.getContentAsString(StandardCharsets.UTF_8)`. Всегда предусматривайте fallback на английский язык (`prompts/en/`), если шаблон на языке пользователя отсутствует.
80. **npm vs pnpm Conflicts**: Если в проекте присутствует `pnpm-lock.yaml`, но `pnpm` не установлен глобально, используйте `npx pnpm <command>`. Никогда не используйте `npm install` в таких проектах, так как это может привести к ошибкам разрешения зависимостей (ERESOLVE) и рассинхронизации лок-файлов.
81. **Предотвращение и исправление проблем с кодировкой (Encoding Mixed-Sandwich Protection)**:
    При редактировании файлов на Windows-машинах SWE-1.6 может записывать новые блоки в системной кодировке CP1251 (Windows-1251) вместо UTF-8, что создает поврежденный "сэндвич" кодировок (mixed encoding) и приводит к разрушению кириллического текста (mojibake).
    **Как не допустить:**
    При вызовах файловых операций в скриптах, при сохранении и коммите файлов всегда принудительно используйте кодировку UTF-8 (например, `encoding='utf-8'` в Python или Node.js, `StandardCharsets.UTF_8` в Java). На уровне ОС при возможности установите глобальную переменную окружения `PYTHONIOENCODING=utf-8`.
    **Как исправить (Скрипт восстановления):**
    Если текстовый файл проекта (например, `docs/CAREERPILOT_AI_CONTEXT_BACKUP.md` или `GEMINI.md`) оказался поврежден из-за смешения UTF-8 и CP1251, используйте следующий Python-скрипт для посегментного восстановления текста:
    ```python
    import os

    def fix_mixed_encoding(file_path):
        with open(file_path, 'rb') as f:
            raw_bytes = f.read()
        
        # Разделяем на строки и декодируем каждую индивидуально
        lines = raw_bytes.split(b'\n')
        decoded_lines = []
        for line in lines:
            try:
                # Пытаемся декодировать строку как чистый UTF-8
                decoded_lines.append(line.decode('utf-8'))
            except UnicodeDecodeError:
                try:
                    # Если падает, то пробуем декодировать как CP1251 (кириллица в Windows)
                    decoded_lines.append(line.decode('cp1251'))
                except Exception:
                    # В крайнем случае используем fallback с заменой символов
                    decoded_lines.append(line.decode('utf-8', errors='replace'))
                    
        # Сохраняем файл обратно строго в UTF-8
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(decoded_lines))

    # Пример вызова для файла бэкапа
    fix_mixed_encoding('docs/CAREERPILOT_AI_CONTEXT_BACKUP.md')
    ```
82. **Null-checks for Enum fields in DTOs**: При замене нативных `<select>` на кастомные компоненты, фронтенд может начать присылать `null` для невыбранных значений. Всегда добавляй проверку `if (request.field() != null)` в сервисном слое бэкенда, чтобы избежать ошибок 500 при маппинге и сохранении в базу данных.
83. **SecurityContext Propagation in Async Tasks**: Spring `@Async` методы выполняются в отдельных потоках, где `SecurityContext` (и текущий пользователь) недоступен по умолчанию. Для корректной работы `CurrentUserResolver` в фоновых задачах необходимо оборачивать `ThreadPoolTaskExecutor` в `DelegatingSecurityContextAsyncTaskExecutor` в `AsyncConfig`. Без этого вызов `SecurityContextHolder.getContext().getAuthentication()` вернет `null`, что приведет к ошибкам "Unauthorized".
84. **PowerShell Command Separators**: В некоторых средах (особенно при работе через CLI инструменты) оператор `&&` может не распознаваться PowerShell как допустимый разделитель команд. В таких случаях используйте `;` (точка с запятой) для последовательного выполнения команд в одной строке.
85. **Testing CompletableFuture in Unit Tests**: При изменении возвращаемого типа сервиса на `CompletableFuture<T>`, в Unit-тестах (JUnit/Mockito) необходимо вызывать метод `.join()` у результата вызова сервиса. Это блокирует выполнение теста до завершения асинхронной задачи и позволяет корректно проверить возвращаемое значение через `assertThat`.


---

## Автоматизация релизов

При получении прямого указания на выпуск релиза (например, "выпусти релиз", "сделай релиз vX.Y.Z"), ты обязан:
1. Автоматически создать новый файл документации релиза в папке `docs/` (например, `docs/RELEASE_v0.7.0-alpha.md`).
2. Использовать в качестве основы общий шаблон `docs/RELEASE_TEMPLATE.md`.
3. Заполнить все поля (`{VERSION}`, `{YYYY-MM-DD}`, `{SHORT_TAGLINE}` и разделы изменений) на основе реального прогресса, зафиксированного в `docs/CAREERPILOT_AI_CONTEXT_BACKUP.md` и `ROADMAP.md`.

---

## Scope boundary
Изменять только файлы из списка выше.
Не трогать без явного согласования: [перечислить смежные файлы]

## Промт для запуска архитектурного анализа

Используй этот промт когда приходит новое ТЗ:

```
Проанализируй задачу как Tech Lead:

ЗАДАЧА: {описание задачи}

1. Прочитай все существующие слайсы похожего типа для понимания паттернов
2. Проверь docs/FRONTEND_BACKEND_CONTRACT.md на наличие этого endpoint
3. Найди последнюю Flyway миграцию в backend/src/main/resources/db/migration/
4. Создай docs/tasks/TASK_{FEATURE_NAME}.md по шаблону из GEMINI.md

Не пиши код реализации. Только план с точными сигнатурами и структурой.
```

---

## Промт для SWE-1.6 в Windsurf (после создания плана)

```
Прочитай и реализуй задачу по плану:
@docs/tasks/TASK_{FEATURE_NAME}.md

Дополнительный контекст:
@GEMINI.md (ОБЯЗАТЕЛЬНО прочитай раздел "⚠️ Известные ошибки и паттерны (Lessons Learned для SWE-1.6)" перед началом работы!)
@docs/FRONTEND_BACKEND_CONTRACT.md
@docs/CAREERPILOT_AI_CONTEXT_BACKUP.md (прочитай ## Update блоки для понимания текущего состояния)

Следуй порядку реализации из плана.
Не меняй файлы вне scope задачи.
После каждого шага кратко пиши, что сделал.
После реализации выполни проверки из раздела "Проверки".
```

---

## Git hygiene

Перед коммитом:
```bash
git status --short
```

Убедиться что нет: `.env`, `backend/target/`, `frontend/node_modules/`, `frontend/dist/`, `.idea/`
Не коммитить без явной просьбы.

## Финальный отчёт (после создания TASK_PLAN)

1. **Что проанализировано** — какие файлы прочитал
2. **Ключевые решения** — почему именно такой подход
3. **Риски** — на что обратить внимание при реализации
4. **Файл** — путь к созданному TASK_PLAN.md
```
