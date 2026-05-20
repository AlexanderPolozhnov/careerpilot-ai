# Task: Реализация реального сброса пароля через Email

## Контекст и цель
Текущая реализация сброса пароля является заглушкой: бэкенд только логирует токен в консоль, а на фронтенде отсутствует страница для ввода нового пароля. Необходимо реализовать полноценный поток: запрос сброса -> отправка письма с уникальной ссылкой -> ввод нового пароля на фронтенде -> обновление в БД.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/notification/service/EmailService.java` — интерфейс для отправки писем.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/notification/service/EmailServiceImpl.java` — реализация с использованием JavaMailSender.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/config/AsyncConfig.java` — включение асинхронности для отправки писем в фоне.

### Изменить существующие
- `backend/pom.xml` — добавить `spring-boot-starter-mail`.
- `backend/src/main/resources/application.yaml` — добавить настройки SMTP и `app.frontend-url`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/service/AuthServiceImpl.java` — внедрить EmailService и вызвать отправку письма.
- `frontend/src/routes/AppRouter.tsx` — добавить маршрут `/auth/reset-password`.
- `frontend/src/pages/AuthPages.tsx` — добавить режим `reset-password`, соответствующую схему валидации и логику сабмита.
- `frontend/src/i18n/locales/ru.json` и `en.json` — добавить тексты для письма и новой формы.

## Backend: точная реализация

### application.yaml
```yaml
spring:
  mail:
    host: ${MAIL_HOST:smtp.mailtrap.io}
    port: ${MAIL_PORT:2525}
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

app:
  frontend-url: ${FRONTEND_URL:http://localhost:5173}
```

### EmailService.java
```java
public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}
```

### EmailServiceImpl.java
```java
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/auth/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Сброс пароля — CareerPilot AI");
        message.setText("Для сброса пароля перейдите по ссылке: " + resetLink + "\nСсылка действительна 24 часа.");
        mailSender.send(message);
    }
}
```

### AuthServiceImpl.java
```java
// В методе forgotPassword
String token = UUID.randomUUID().toString();
user.setResetPasswordToken(token);
user.setResetPasswordExpiresAt(OffsetDateTime.now().plusHours(24));
authRepository.save(user);

emailService.sendPasswordResetEmail(email, token); // Заменить log.info
```

## Frontend: точная реализация

### AuthPages.tsx
1. Добавить `'reset-password'` в `AuthMode`.
2. Добавить `resetSchema` (newPassword, confirmPassword) с `refine`.
3. В `pageMeta` добавить тексты для `reset-password`.
4. В `form.onSubmit` добавить логику: если `mode === 'reset-password'`, извлечь `token` из `searchParams` и вызвать `authService.resetPassword(token, values.password)`.

### AppRouter.tsx
```tsx
<Route path="/auth/reset-password" element={<AuthPages mode="reset-password" />} />
```

## Порядок реализации для SWE-1.6
1. Добавить зависимость в `pom.xml` и настройки в `application.yaml`.
2. Создать `EmailService` и `EmailServiceImpl`.
3. Создать `AsyncConfig` с аннотацией `@EnableAsync`.
4. Обновить `AuthServiceImpl` для отправки реального письма.
5. Реализовать поддержку `reset-password` в `AuthPages.tsx` и обновить `AppRouter.tsx`.
6. Добавить необходимые переводы в JSON файлы локализации.

## Риски и что проверить
- **Блокировка потока:** отправка письма должна быть асинхронной (`@Async`), чтобы пользователь не ждал ответа API 2-5 секунд.
- **CORS:** убедиться, что фронтенд-урл в письме совпадает с реально запущенным фронтендом.
- **Валидация токена:** бэкенд уже проверяет срок действия токена, но нужно убедиться, что ошибка 401/400 корректно отображается на новой странице.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="AuthServiceImplTest"` (обновить тесты под EmailService mock).
**Frontend:** `npm.cmd run build` в папке `frontend`.
**Manual:** Запросить сброс пароля, дождаться письма (в Mailtrap), перейти по ссылке, сменить пароль, войти с новым паролем.
