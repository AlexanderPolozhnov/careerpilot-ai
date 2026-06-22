# Windsurf Cascade — Workspace Rules (Правила Рабочей Области CareerPilot AI)

Этот файл содержит правила, специфичные для проекта **CareerPilot AI**. 

> [!TIP]
> Чтобы Cascade Windsurf автоматически применял эти правила при каждой сессии, вы можете:
> 1. Создать в корне проекта папку `.windsurf/rules/`
> 2. Скопировать содержимое этого файла в `.windsurf/rules/careerpilot.md` (или сохранить в корне как `.windsurfrules`).
> 
> Это гарантирует, что модель **SWE-1.6** будет строго соблюдать архитектуру, контракты и избегать известных ошибок проекта.

---

## 🧭 Роль и Ограничения Исполнителя (SWE-1.6)

1. **Роль Исполнителя:** Ты — SWE-1.6 в Windsurf. Твоя задача — строго выполнять детальный план `TASK_PLAN.md`, составленный Архитектором (Gemini).
2. **Никакого кода без плана:** Перед реализацией новой фичи убедись, что в `docs/tasks/TASK_{FEATURE_NAME}.md` создан и утвержден план. Следуй порядку реализации строго по шагам.
3. **Локальный Scope:** Не меняй файлы вне рамок задачи. Не проводи глобального рефакторинга.
4. **Проверки сборки:** Перед тем как заявить о завершении задачи, ОБЯЗАТЕЛЬНО выполни локально сборку и линтинг (см. раздел "Верификация" ниже).

---

## 🏗️ Стек Технологий и Архитектура

- **Monorepo:** `backend/` (Java 21, Spring Boot 3, Spring Security, Flyway, PostgreSQL, Redis) + `frontend/` (React, TS, Vite, Tailwind v4, TanStack Query, i18next).
- **Backend-First / Vertical Slices:** Каждый слайс (`auth`, `vacancy`, `application` и др.) устроен вертикально: `Controller` → `Service` → `Repository`.
- **Source of Truth для API:** Файл `docs/FRONTEND_BACKEND_CONTRACT.md` является строгим контрактом. Не меняй API на фронтенде или бэкенде без сверки с контрактом!

---

## 🔑 Ключевые Архитектурные Правила

### 1. Безопасность и Текущий Пользователь (Spring Security)
- **CurrentUserResolver:** НИКОГДА не извлекай `userId` из Principal вручную и не передавай его в параметрах запроса.
- Используй `CurrentUserResolver.resolveRequired()` на бэкенде для извлечения текущего пользователя.
- Метод возвращает объект `AuthEntity`, а не `UUID`. Если нужен UUID пользователя, вызывай `CurrentUserResolver.resolveRequired().getId()`.
- При извлечении проверяй `authentication.getName()` на равенство строке `"anonymousUser"` — Spring Security подставляет её для неавторизованных сессий. Если пытаться искать по ней пользователя в БД, возникнет ошибка.

### 2. Специфика Базы Данных и Flyway
- **Flyway Миграции:** Применяются только при изменении схемы БД.
- **Динамический поиск версии:** Не хардкодь номер следующей миграции. Перед добавлением новой миграции обязательно зайди в директорию `backend/src/main/resources/db/migration/` и посмотри имя последнего файла. Новая миграция должна строго следовать именованию `V{N+1}__snake_case_name.sql`, где `N` — номер последней существующей миграции в проекте.
- **Hibernate 6 и JSONB:** Для корректного маппинга полей типа `jsonb` в PostgreSQL обязательно используй аннотации:
  ```java
  @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  ```
  Без этого Hibernate попытается сохранить строку как `character varying`, и база выдаст ошибку.

### 3. Паттерны Бэкенда (Spring Boot)
- **Entity и DTO:** Никогда не возвращай JPA-сущности (Entity) наружу из контроллеров. Всегда мапь их в Response DTO с помощью MapStruct.
- **MapStruct и вложенные ID:** При маппинге из Entity в Response DTO MapStruct часто не может автоматически извлечь ID из связанных сущностей. Всегда явно прописывай маппинг:
  ```java
  @Mapping(target = "userId", source = "user.id")
  ```
- **Синхронизация репозиториев:** Если Service использует циклы или `saveAll()`, Repository должен возвращать `List<T>`, а не `Optional<T>`.
- **Типы дат:** Используй стандарт `java.time.Instant` для дат в Entity и DTO. Избегай `LocalDateTime`.
- **Валидация URL:** Используй `@Size(max = 2048)` для полей со ссылками вместо строгой аннотации `@URL`, чтобы избежать проблем с classpath и ложных срабатываний.
- **Транзакционность:** Всегда помечай методы `create`, `update`, `delete` в сервисах аннотацией `@Transactional` для избежания `LazyInitializationException` при маппинге связанных коллекций.
- **N+1 Оптимизация:** Для тяжелых агрегирующих запросов используй `@EntityGraph(attributePaths = {...})` в репозиториях, чтобы загружать связанные сущности за один JOIN-запрос.
- **Отправка почты (Email):** Всегда должна быть асинхронной (`@Async`). HTML-письма отправляй через `MimeMessageHelper`. Иконки (SVG) в письмах должны иметь фиксированные размеры (`width`, `height`), встроенные прямо в HTML.

---

## 🎨 Правила Фронтенда (React / TypeScript / Tailwind)

### 1. API Клиент и Запросы
- **Импорт API:** Всегда импортируй клиент как именованный импорт: `import { api } from '@/lib/api-client'`.
- **Параметры запросов:** Метод `api.get` принимает только путь. Параметры формируй через `buildQuery(params)`:
  ```typescript
  api.get(`/tasks${buildQuery(params)}`)
  ```
- **Empty API Responses (204 No Content):** При успешном удалении бэкенд возвращает `204 No Content`. Фронтенд-клиент обрабатывает это безопасно и возвращает `undefined`. Не ожидай данных от таких запросов.
- **Логаут (Logout) и Кэш:** 
  - Сначала вызывай API-запрос к эндпоинту логаута `/auth/logout`, и только ПОСЛЕ этого очищай JWT-токен (`clearToken()`). Иначе запрос уйдёт неавторизованным, и сессия на бэкенде/куки не инвалидируются.
  - При логауте обязательно вызывай `queryClient.clear()`, чтобы предотвратить утечку данных между сессиями разных пользователей.
- **Обработка 401 ошибок:** В `api-client.ts` глобальный перехватчик не должен делать принудительный логаут при ошибках на эндпоинтах логина или при повторных запросах, чтобы формы могли выводить ошибку "Неверный пароль" пользователю.

### 2. Формы, Локализация и Дизайн (Tailwind v4)
- **Date Input (LocalDate vs Instant):** Стандартный HTML `<input type="date">` отправляет дату в формате `YYYY-MM-DD`. Бэкенд не может десериализовать её в `Instant`.
  - На бэкенде в Request DTO используй тип `LocalDate`, а затем конвертируй в `Instant` в сервисе: `localDate.atStartOfDay(ZoneOffset.UTC).toInstant()`.
  - На фронтенде для `defaultValues` формы обрезай ISO строку: `date.slice(0, 10)`.
- **Ввод тегов через запятую (Tags Pattern):**
  - Схема Zod: `tags: z.string().optional()`.
  - Значение по умолчанию: `vacancy.tags?.map(t => t.label).join(', ') ?? ''`.
  - Сохранение: `tags.split(',').map(s => s.trim()).filter(Boolean)` для отправки массива строк.
- **Синхронизация полей:** При изменении Request/Response DTO обязательно обновляй всю цепочку: Controller → Service → Mapper → frontend services → frontend types → Zod schema → mock data. Никаких временных заглушек типа `record XRequest(String payload)`.
- **Локализация Дат:** Для форматирования дат используй функции из `@/lib/utils`. Они автоматически учитывают текущий язык `i18n` и локаль `date-fns`.
- **Стилизация Форм:** Всегда используй стандартные классы из `globals.css`:
  - Метки (labels): `text-xs text-ink-dim`
  - Поля ввода (inputs/selects): `input mt-1` или `select mt-1`
  - Кнопки: `btn-primary` и `btn-secondary`
  - Текст кнопок: `isEditing ? t('common.save') : t('common.create')`
- **Tailwind v4 Arbitrary Values:** В Tailwind CSS v4 произвольные RGBA значения (например, `bg-[rgba(255,255,255,0.03)]`) не поддерживаются внутри `@apply`. Используй стандартный синтаксис модификаторов прозрачности: `bg-white/[0.03]`.
- **Z-Index Модалок и Backdrop Blur:** Backdrop модального окна должен иметь `fixed inset-0 z-[90]`, а сам контент модалки — `z-[100]` (у Topbar `z-[60]`). Добавляй `m-0` к backdrop, чтобы сбросить отступы от родительских контейнеров.
- **Anchor Scrolling:** Для скролла к хэш-ссылкам (например, `#notifications`) используй `useLocation().hash` в комбинации с `useEffect`, `element.scrollIntoView` и небольшим таймаутом `setTimeout`, а целевому элементу добавляй `scroll-mt-24` для компенсации высоты Topbar.

---

## ⚠️ Известные Проблемы, Инфраструктура и Ошибки (Lessons Learned)

### 1. Асинхронность (`@Async`) и Тесты
При поднятии контекста в интеграционных тестах (Testcontainers) аннотация `@Async` иногда вызывает конфликты. Если тесты в `CareerpilotAiApplicationTests` падают, можно временно переключить фоновые задачи (например, отправку писем) на синхронное выполнение в тестовом профиле.

### 2. Docker Build Cache на Windows
На файловой системе NTFS (Windows) сборка Docker-образов через `docker compose up -d --build` может некорректно использовать кэш слоев, даже если файлы изменились.
- **Решение:** Для гарантированной сборки используй команду:
  ```powershell
  docker compose build --no-cache <service-name>
  docker compose up -d --force-recreate
  ```
- **Execute Permissions для mvnw:** В `backend/Dockerfile` обязательно должна быть строка `RUN chmod +x mvnw` перед запуском сборщика, так как при копировании файлов с Windows-хоста Unix-флаг исполнения (`+x`) теряется.

### 3. Spring Boot OAuth2 за Nginx
Для правильной работы OAuth2 за прокси-сервером необходимы:
1. `server.forward-headers-strategy: native` в `application.yaml` бэкенда.
2. Передача заголовков `X-Forwarded-Port: $server_port` и проксирование путей `/oauth2/` и `/login/oauth2/` в конфигурации Nginx.

### 4. Vitest Setup (Тесты Фронтенда)
Исключи тестовые папки из `tsconfig.app.json` через секцию `exclude: ["src/**/__tests__", "src/test"]`. Иначе компилятор `tsc -b` при сборке упадет с ошибками, пытаяся проверить импорты из `devDependencies` (vitest, @testing-library), которые отсутствуют в production билде.

---

## 🧪 Верификация и Сборка (Команды для Запуска)

Перед отправкой изменений на проверку ты ОБЯЗАТЕЛЬНО должен убедиться, что проект собирается без предупреждений компилятора и линтера.

### Бэкенд (Java/Spring Boot)
1. Выполнить чистую компиляцию:
   ```powershell
   .\mvnw.cmd clean compile -DskipTests
   ```
2. Запустить Unit-тесты:
   ```powershell
   .\mvnw.cmd test
   ```
3. Локальный запуск бэкенда для проверки API:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

### Фронтенд (React/Vite)
1. Перейти в каталог фронтенда: `cd frontend`
2. Запустить линтер:
   ```powershell
   npm.cmd run lint
   ```
3. Запустить тесты (Vitest):
   ```powershell
   npm.cmd run test
   ```
4. Запустить сборку продакшн-бандла:
   ```powershell
   npm.cmd run build
   ```
   *(Убедись, что нет ошибок TypeScript типа TS2741 или ошибок ESLint).*
