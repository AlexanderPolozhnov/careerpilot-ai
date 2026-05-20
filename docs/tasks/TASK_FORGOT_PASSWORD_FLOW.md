# Task: Улучшение флоу сброса пароля (Forgot Password Flow)

## Контекст и цель
В текущей реализации экрана восстановления пароля (`forgot-password`) текст-описание и текст успешной отправки ссылки совпадают ("Мы отправим ссылку для сброса, если email существует."), что выглядит нелогично после совершения действия. К тому же, кнопка отправки запроса имеет надпись "Забыли пароль?", дублируя ссылку с экрана логина, в то время как она должна предлагать действие (например, "Отправить ссылку").
Цель задачи — разделить эти i18n ключи, обновить тексты для успешного состояния (в прошедшем времени) и сделать кнопку действия более понятной для пользователя.

## Затрагиваемые файлы

### Изменить существующие
- `frontend/src/i18n/locales/ru.json` — добавить новые ключи для успешного сброса и текста кнопки действия.
- `frontend/src/i18n/locales/en.json` — добавить аналогичные ключи на английском.
- `frontend/src/pages/AuthPages.tsx` — заменить использование старых ключей на новые для кнопки и сообщения об успехе.

## Frontend: точная реализация

### i18n ключи

#### `frontend/src/i18n/locales/ru.json`
Добавить следующие ключи внутри объекта `"auth"`:
```json
    "sendResetLink": "Отправить ссылку",
    "resetPasswordSuccess": "Мы отправили ссылку для сброса на указанный email. Пожалуйста, проверьте вашу почту.",
```

#### `frontend/src/i18n/locales/en.json`
Добавить следующие ключи внутри объекта `"auth"`:
```json
    "sendResetLink": "Send link",
    "resetPasswordSuccess": "We have sent a reset link to the specified email. Please check your inbox.",
```

### Компонент/страница (`frontend/src/pages/AuthPages.tsx`)

1. **Изменение сообщения об успешном сбросе** (строка ~316):
   Заменить установку статуса успеха с:
   ```typescript
   setSuccess(t('auth.resetPassword'))
   ```
   на:
   ```typescript
   setSuccess(t('auth.resetPasswordSuccess'))
   ```

2. **Изменение текста кнопки отправки** (строка ~446):
   Заменить текст на кнопке для режима `forgot-password` с:
   ```typescript
   {mode === 'forgot-password' && (form.formState.isSubmitting ? t('common.loading') : t('auth.forgotPassword'))}
   ```
   на:
   ```typescript
   {mode === 'forgot-password' && (form.formState.isSubmitting ? t('common.loading') : t('auth.sendResetLink'))}
   ```

## Порядок реализации для SWE-1.6
1. Обновить файлы локализации `frontend/src/i18n/locales/ru.json` и `frontend/src/i18n/locales/en.json`, добавив ключи `sendResetLink` и `resetPasswordSuccess`.
2. Внести изменения в компонент `frontend/src/pages/AuthPages.tsx` для использования новых i18n ключей в стейте успешной отправки формы и на кнопке отправки.
3. Убедиться в корректности сборки фронтенда.

## Риски и что проверить
- Убедиться, что новые i18n ключи добавлены на одном уровне с существующими ключами авторизации (`"auth": { ... }`) и не ломают JSON структуру.
- Проверить, что кнопка на странице логина "Забыли пароль?" по-прежнему корректно отображает свой текст.

## Проверки после реализации
**Frontend:**
```bash
cd frontend
npm run build
```
