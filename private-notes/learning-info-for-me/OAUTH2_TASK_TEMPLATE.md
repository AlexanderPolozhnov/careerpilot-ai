# Шаблон задачи: Реализация OAuth2 Social Login (GitHub & Google) в {PROJECT_NAME}

Данный шаблон предназначен для постановки задачи SWE-агенту (например, Windsurf/Cursor) для реализации полноценного Social Login (OAuth2) с использованием Spring Boot ({BACKEND_TECH}) и React/TypeScript ({FRONTEND_TECH}).

---

## Переменные шаблона (замени перед отправкой)
- `{PROJECT_NAME}` — Название проекта (например, CareerPilot AI)
- `{BACKEND_PACKAGE_PATH}` — Путь к бэкенд пакетам (например, `com/example/project`)
- `{DB_USER_TABLE}` — Название таблицы пользователей (например, `users` или `accounts`)
- `{USER_ENTITY}` — Класс сущности пользователя (например, `UserEntity` или `User`)
- `{JWT_SERVICE}` — Сервис генерации JWT токенов (например, `JwtService` или `TokenProvider`)
- `{CURRENT_USER_RESOLVER}` — Класс/метод получения текущего пользователя из Security Context (например, `CurrentUserResolver`)
- `{LOCAL_STORAGE_TOKEN_KEY}` — Ключ токена на фронтенде (например, `cp_access_token` или `token`)
- `{FRONTEND_AUTH_CONTEXT}` — Название контекста авторизации на фронтенде (например, `AuthContext` или `useAuth`)
- `{FLYWAY_MIGRATION_VERSION}` — Номер следующей миграции (например, `V14` или `V17`)

---

# Task: Реализация OAuth2 Social Login через GitHub и Google

## Контекст и цель
Реализовать вход и регистрацию пользователей через социальные сети GitHub и Google (OAuth2 Protocol). При первой авторизации через соцсеть аккаунт должен создаваться автоматически (с генерацией дефолтных полей или слиянием по email, если пользователь ранее регистрировался через почту/пароль). При повторных входах должен происходить бесшовный вход.

## Затрагиваемые файлы

### Создать новые
- `{BACKEND_PACKAGE_PATH}/auth/oauth2/CustomOAuth2UserService.java` — сервис загрузки и маппинга профилей соцсетей
- `{BACKEND_PACKAGE_PATH}/auth/oauth2/OAuth2SuccessHandler.java` — обработчик успешной авторизации и редиректа с JWT
- `{BACKEND_PACKAGE_PATH}/auth/oauth2/OAuth2UserPrincipal.java` — обёртка над OAuth2User для интеграции в SecurityContext
- `frontend/src/pages/auth/OAuthCallbackPage.tsx` — страница обработки редиректа от бэкенда с извлечением JWT токена

### Изменить существующие
- `backend/pom.xml` / `build.gradle` — подключить зависимости OAuth2 Client
- `backend/src/main/resources/application.yaml` (или `.properties`) — настроить регистрации провайдеров
- `{BACKEND_PACKAGE_PATH}/config/SecurityConfig.java` — настроить фильтры OAuth2, разрешить эндпоинты
- `{BACKEND_PACKAGE_PATH}/auth/CurrentUserResolver.java` (или аналог) — поддержка извлечения OAuth2Principal
- `frontend/src/App.tsx` (или файл роутинга) — добавить публичный роут `/auth/callback`
- `frontend/src/pages/auth/LoginPage.tsx` — привязать обработчики клика на кнопках Google / GitHub

---

## Backend: Точная спецификация реализации

### 1. Зависимости (Maven)
Добавить в `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

### 2. Схема базы данных (Flyway / Liquibase)
Создать миграцию `{FLYWAY_MIGRATION_VERSION}__add_oauth2_provider_fields.sql`:
- Добавить в `{DB_USER_TABLE}` колонку `provider` (VARCHAR/VARCHAR2, по умолчанию `'LOCAL'`).
- Добавить колонку `provider_id` (VARCHAR, nullable).
- Сделать колонку `password_hash` (или `password`) **nullable**, так как у OAuth2-пользователей локальный пароль изначально отсутствует.
- Добавить уникальный индекс (или CHECK constraint) на пару `(provider, provider_id)`.

### 3. Конфигурация `application.yaml`
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope:
              - read:user
              - user:email
app:
  frontend-base-url: ${FRONTEND_BASE_URL:http://localhost:5173}
```

### 4. CustomOAuth2UserService
Должен расширять `DefaultOAuth2UserService` (или `OidcUserService` для Google OIDC):
- Извлечь профиль пользователя из `OAuth2UserRequest`.
- **⚠️ КРИТИЧЕСКИЙ НЮАНС (GitHub Private Email)**: GitHub может возвращать `email = null`, если у пользователя в профиле почта скрыта настройками приватности. При обнаружении пустого/null email сервис **обязан** выполнить прямой HTTP-запрос к API GitHub (`GET https://api.github.com/user/emails`) с использованием заголовка `Authorization: Bearer <access_token>` для получения списка почт пользователя, найти там первичный (`primary`) и подтвержденный (`verified`) email.
- **Логика слияния учетных записей (Merge по Email)**:
  - Если пользователь с полученным `email` уже зарегистрирован с `provider = 'LOCAL'`:
    - Привязать к существующему пользователю `provider = 'GITHUB' / 'GOOGLE'` и `provider_id`. (Не перезаписывать локальный хэш пароля, просто добавить провайдера или обновить поле, предотвращая дубликаты записей в БД).
  - Если пользователя с таким `email` нет:
    - Создать новую запись `{USER_ENTITY}` в БД. Пароль (`password_hash`) установить в `null`. Заполнить поля `name`, `email`, `avatarUrl` (если есть).

### 5. OAuth2SuccessHandler
Реализует `AuthenticationSuccessHandler`:
- Извлечь успешного аутентифицированного пользователя (из Principal).
- Сгенерировать JWT-токен авторизации через существующий `{JWT_SERVICE}`.
- Выполнить редирект (Redirect) на фронтенд: `${FRONTEND_BASE_URL}/auth/callback?token=<сгенерированный_JWT_токен>`.

### 6. Обновление SecurityConfig.java
- Добавить секцию `.oauth2Login()`:
  ```java
  .oauth2Login(oauth2 -> oauth2
      .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
      .successHandler(oauth2SuccessHandler)
  )
  ```
- Разрешить без аутентификации эндпоинты: `/login/oauth2/**`, `/oauth2/**`, `/auth/oauth2/**`.

### 7. Эндпоинт ручной инициации GET `/auth/oauth2/authorize/{provider}`
Реализовать в контроллере авторизации вспомогательный GET-метод, перенаправляющий (302 Redirect) на локальный урл Spring Security: `/oauth2/authorization/{provider}`. 
Это убережет фронтенд от жесткого хардкода урлов Spring Security OAuth2 Client.

---

## Frontend: Точная спецификация реализации

### 1. Публичный Callback-компонент
Создать компонент `OAuthCallbackPage.tsx` на маршруте `/auth/callback`:
- При монтировании извлечь параметр `token` из URL: `new URLSearchParams(window.location.search).get('token')`.
- Если токен присутствует:
  - Сохранить его в localStorage под ключом `{LOCAL_STORAGE_TOKEN_KEY}`.
  - Очистить параметры адресной строки браузера через `window.history.replaceState(null, '', '/auth/callback')` или перенаправить на чистый URL, чтобы предотвратить утечку JWT-токена в рефереры/историю.
  - Вызвать метод обновления сессии (например, `fetchMe()` или загрузку профиля в `{FRONTEND_AUTH_CONTEXT}`).
  - Показать приятный лоадер / спиннер во время обработки.
  - После успешной загрузки пользователя редиректнуть на `/dashboard` (или домашнюю страницу приложения).
- Если токена нет:
  - Показать ошибку и редиректнуть на страницу входа `/auth/login` с выводом Toast-уведомления.

### 2. Кнопки входа в LoginPage.tsx
Активировать кнопки GitHub и Google:
- Навесить событие `onClick` на кнопку GitHub:
  ```typescript
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/oauth2/authorize/github`;
  ```
- Аналогично для Google (`.../authorize/google`).

---

## ⚠️ Ловушки и КРИТИЧЕСКИЕ правила (Lessons Learned)

При реализации строго следовать следующим правилам, чтобы избежать багов:

1. **Security Context & AnonymousUser NPE**:
   - При извлечении пользователя из `SecurityContextHolder` всегда проверять `authentication.getName() != "anonymousUser"`. Spring Security возвращает анонимного пользователя для неавторизованных сессий, что может приводить к ошибкам при получении ID.
2. **Spring Security OAuth2 Principal Casting**:
   - После успешной OAuth2-авторизации, тип Principal в SecurityContext меняется с `UserDetails` (локальный JWT) на `OAuth2User`. Убедись, что твой `{CURRENT_USER_RESOLVER}` (или JWT фильтр) корректно работает с обоими типами Principal, либо твоя кастомная обертка расширяет обе сущности, чтобы не возникло `ClassCastException`.
3. **Hibernate 6 и JSONB (если пишется Audit Log)**:
   - Если при входе логируются метаданные пользователя в PostgreSQL `jsonb` поле через AOP-аспекты/аудит: обязательно использовать аннотации `@org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)` совместно с `@Column(columnDefinition = "jsonb")`. Иначе Hibernate запишет его как обычную строку, вызвав падение БД.
4. **Асинхронность (@Async) и тесты**:
   - Если после успешного входа отправляется асинхронное уведомление (например, `@Async` email или аудит) — будь готов к тому, что в тестах контекст Spring или Testcontainers может вести себя нестабильно. В случае конфликтов в тестовом окружении выполняй логику синхронно.
5. **Безопасность передачи JWT через Redirect URL**:
   - Передача JWT токена в параметрах редиректа фронтенда (`?token=...`) подвержена риску утечки. **Обязательно** очищай URL-параметры на фронтенде в первую же секунду после считывания (с помощью `history.replaceState` или `navigate('/dashboard', { replace: true })`).
6. **Консистентность валидации**:
   - Все поля нового OAuth2-пользователя (name, email) должны проходить те же проверки (длина, формат), что и при обычной регистрации. Если имя пользователя от соцсети слишком длинное или содержит недопустимые символы, его нужно безопасно обрезать/нормализовать перед сохранением.
7. **Тесты без внешних сетевых вызовов**:
   - В Unit-тестах для `CustomOAuth2UserService` необходимо полностью замоккать (`mock`) внешние HTTP-клиенты (например, `RestTemplate` или `WebClient`), используемые для запроса приватных email-адресов GitHub, чтобы тесты не зависели от доступности GitHub API.
8. **Критическая утечка сессий (Cross-User Data Leakage) при логауте**:
   - При авторизации через OAuth2 (Google/GitHub) сервлет-контейнер бэкенда (например, Tomcat) автоматически создает сессию `HttpSession` и выставляет в браузер сессионную куку `JSESSIONID`.
   - **Уязвимость**: Если пользователь делает логаут, а затем входит в другой (например, локальный) аккаунт, то без должной очистки бэкенд может восстановить контекст безопасности предыдущего OAuth-пользователя из куки `JSESSIONID`. Из-за этого новый пользователь увидит пустые страницы или чужие профессиональные настройки.
   - **Решение на фронтенде**: Всегда отправлять API-запрос к эндпоинту логаута (например, `/auth/logout`) **до** очистки токена в памяти (`clearToken()`). В противном случае запрос уйдет неавторизованным, бэкенд не сможет выполнить инвалидацию сессии для этого пользователя.
   - **Решение на бэкенде**:
     - В `JwtAuthenticationFilter` для непубличных защищенных эндпоинтов всегда явно вызывать `SecurityContextHolder.clearContext()`, если заголовок `Authorization` отсутствует или невалиден. Это заблокирует Tomcat от неявного восстановления сессии из кук.
     - В эндпоинте `/auth/logout` обязательно вызывать `session.invalidate()` и принудительно стирать куку `JSESSIONID` у клиента, отправляя куку с пустым значением, `path("/")` и `maxAge(0)`.

---

## Порядок реализации для SWE-агента
1. **База данных**: Создать Flyway/Liquibase миграцию с изменениями таблицы пользователей.
2. **Конфигурация бэкенда**: Добавить зависимости в сборщик и прописать Client ID / Secrets в `application.yaml` (значения брать строго из переменных окружения).
3. **Бизнес-логика бэкенда**: Реализовать `CustomOAuth2UserService` (включая обработку приватных email для GitHub) и `OAuth2SuccessHandler`.
4. **Настройка безопасности**: Зарегистрировать сервисы в `SecurityConfig`, настроить разрешенные эндпоинты, убедиться, что существующий JWT фильтр не ломает OAuth-логин.
5. **Тестирование бэкенда**: Написать Unit-тесты для сервиса авторизации и убедиться в работоспособности старого JWT-логина.
6. **Интеграция фронтенда**: Создать страницу `OAuthCallbackPage`, обновить роутинг и LoginPage кнопки.
7. **Проверка сквозного сценария**: Запустить бэкенд и фронтенд локально, протестировать логин.

---

## Проверки успешности реализации
- **Сборка бэкенда**: `{BUILD_COMMAND_BACKEND}` (проверка компиляции и отсутствия конфликтов типов).
- **Сборка фронтенда**: `{BUILD_COMMAND_FRONTEND}` (проверка типов TypeScript и Vite линтинга).
- **Слияние аккаунтов**: Тест: зарегистрировать юзера `test@example.com` локально, затем зайти через GitHub с этой же почтой. В БД не должно появиться нового юзера; у старого должен обновиться провайдер, а вход пройти успешно.