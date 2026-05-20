Прочитай и реализуй задачу по добавлению возможности создания/изменения пароля для OAuth2-пользователей.

## Контекст
У пользователей, вошедших через Google/GitHub, в БД поле `password_hash` равно `null`. Необходимо реализовать эндпоинт создания/изменения пароля на бэкенде и адаптивную форму на фронтенде в разделе настроек.

## Backend реализации:

1. **DTO:**
   - Обнови `AuthUserResponse` (или соответствующий DTO текущего пользователя): добавь поле `boolean hasPassword`.
   - В маппере или при создании DTO вычисляй его как: `hasPassword = (entity.getPasswordHash() != null)`.
   - Создай `UpdatePasswordRequest` record:
     ```java
     public record UpdatePasswordRequest(
         String currentPassword, // nullable
         @NotBlank @Size(min = 6, max = 100) String newPassword
     ) {}
     ```

2. **Controller & Service:**
   - В `AuthController.java` (или `UserController`) добавь эндпоинт `POST /api/auth/password`. Навесь `@Auditable(action = "UPDATE_PASSWORD", entityType = "USER")` и `@ResponseStatus(HttpStatus.NO_CONTENT)`.
   - Логика в `AuthServiceImpl`:
     - Получи текущего пользователя через `CurrentUserResolver.resolveRequired()`.
     - Если `user.getPasswordHash() != null`:
       - Убедись, что `request.currentPassword()` не пустой и совпадает с текущим хэшем: `passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())`. Если не совпадает — брось `AuthException` (400 Bad Request, "Неверный текущий пароль").
     - Если `user.getPasswordHash() == null`:
       - Пропусти шаг проверки старого пароля (пользователь вошел через OAuth2).
     - Захэшируй `passwordEncoder.encode(request.newPassword())`, установи в `passwordHash` и сохрани пользователя.

3. **Тесты:**
   - Напиши Unit-тесты на два сценария:
     1. Изменение пароля обычным пользователем (требуется валидный текущий пароль).
     2. Установка пароля OAuth2-пользователем (текущий пароль отсутствует, сразу ставится новый).

## Frontend реализации:

1. **Types:**
   - Обнови тип пользователя `User` / `AuthUserResponse` в `types/index.ts`, добавив поле `hasPassword: boolean`.

2. **API Service:**
   - В `auth.service.ts` добавь метод `updatePassword(data: UpdatePasswordRequest): Promise<void>` к эндпоинту `POST /auth/password`.

3. **UI Компонент (SettingsPage.tsx):**
   - Во вкладку настроек безопасности добавь форму управления паролем с использованием React Hook Form + Zod.
   - **Динамическая логика формы:**
     - Считай `user.hasPassword` из AuthContext.
     - Если `hasPassword === false`:
       - Скрой поле «Текущий пароль». 
       - Измени заголовок формы на «Создать пароль» и выведи подсказку: *"Вы вошли через социальную сеть. Установите пароль, чтобы иметь возможность заходить по email."*
     - Если `hasPassword === true`:
       - Покажи поле «Текущий пароль» (сделай его обязательным в Zod схеме).
       - Заголовок формы: «Изменить пароль».
   - Навесь React Query мутацию для вызова `authService.updatePassword`. При успехе выводи Toast-уведомление "Пароль успешно установлен/изменен" и инвалидируй query текущего пользователя `['auth', 'me']` (чтобы обновить флаг `hasPassword`).

Проверь успешность сборки бэкенда через `.\mvnw.cmd clean compile` и фронтенда через `npm run build`.