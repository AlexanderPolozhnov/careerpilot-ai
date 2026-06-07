# Task: Onboarding Flow (Wizard первого запуска) (пример)

## Контекст и цель

Реализовать мастер первого запуска (Onboarding Wizard) для новых пользователей CareerPilot AI.
Сейчас после регистрации пользователь попадает на пустой Dashboard без какого-либо контекста.
Нужно добавить поле `onboarding_completed` в `user_preferences`, endpoint для его обновления, и
красивый 4-шаговый Wizard на фронтенде (Профиль → Первая вакансия → Настройка AI → Готово).

## Затрагиваемые файлы

### Создать новые

- `backend/src/main/resources/db/migration/V30__add_onboarding_completed.sql` — Flyway миграция: добавить поле `onboarding_completed` в `user_preferences`
- `frontend/src/components/onboarding/OnboardingWizard.tsx` — главный компонент Wizard (4 шага, роутинг между ними)
- `frontend/src/components/onboarding/OnboardingStep1Profile.tsx` — Шаг 1: заполнить имя и позицию
- `frontend/src/components/onboarding/OnboardingStep2Vacancy.tsx` — Шаг 2: добавить первую вакансию (упрощённая форма)
- `frontend/src/components/onboarding/OnboardingStep3Ai.tsx` — Шаг 3: выбор AI провайдера
- `frontend/src/components/onboarding/OnboardingStep4Done.tsx` — Шаг 4: финальный экран с CTA

### Изменить существующие

- `backend/src/main/resources/db/migration/V30__add_onboarding_completed.sql` — **(создать)**
- `backend/.../preferences/entity/PreferencesEntity.java` — добавить поле `onboardingCompleted`
- `backend/.../preferences/response/PreferencesResponse.java` — добавить поле `onboardingCompleted`
- `backend/.../preferences/request/PreferencesRequest.java` — добавить поле `onboardingCompleted` (опциональное)
- `backend/.../preferences/service/PreferencesServiceImpl.java` — учесть новое поле при маппинге; `createDefaults()` — по умолчанию `false`
- `frontend/src/services/settings.service.ts` — добавить поле `onboardingCompleted` в `PreferencesResponse`; добавить метод `completeOnboarding()`
- `frontend/src/context/AuthContext.tsx` — после загрузки `user` проверять `preferences.onboardingCompleted` и управлять видимостью Wizard
- `frontend/src/routes/AppRouter.tsx` — добавить логику показа `OnboardingWizard` вместо контента, если `!onboardingCompleted`
- `frontend/src/i18n/locales/ru.json` — добавить ключи `onboarding.*`
- `frontend/src/i18n/locales/en.json` — аналогично

---

## Backend: точная реализация

### Flyway миграция V30

```sql
-- V30__add_onboarding_completed.sql
ALTER TABLE careerpilot.user_preferences
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
```

> Миграция маленькая — новой таблицы не нужно. Поле добавляется в уже существующую `user_preferences`.

### PreferencesEntity

Добавить в `PreferencesEntity.java` после поля `googleCalendarConnected`:

```java
@Column(name = "onboarding_completed", nullable = false)
private boolean onboardingCompleted = false;
```

### PreferencesResponse

Добавить поле `boolean onboardingCompleted` в `record PreferencesResponse(...)` или в `class PreferencesResponse`.

### PreferencesRequest

Добавить опциональное поле — `Boolean onboardingCompleted` (boxed, чтобы не ломать существующие PUT-запросы):

```java
private Boolean onboardingCompleted;
```

### PreferencesServiceImpl — изменения

1. В `toResponse()` (маппинг Entity → Response): добавить `.onboardingCompleted(entity.isOnboardingCompleted())`.
2. В `updatePreferences()`: если `request.getOnboardingCompleted() != null`, применять значение: `entity.setOnboardingCompleted(request.getOnboardingCompleted())`.
3. В `createDefaults()`: поле `onboardingCompleted` = `false` (уже будет через @Column default, но явно для clarity).

### PreferencesController — изменения

Дополнительного endpoint'а **не нужно**. Фронтенд вызовет существующий `PUT /api/preferences` с полем `onboardingCompleted: true` после завершения Wizard.

---

## Frontend: точная реализация

### Обновление типов (`settings.service.ts`)

```typescript
export interface PreferencesResponse {
  // ... existing fields ...
  onboardingCompleted: boolean  // добавить
}

// Добавить метод:
completeOnboarding: (): Promise<PreferencesResponse> =>
  USE_MOCKS
    ? Promise.resolve({ ...mockPreferences, onboardingCompleted: true })
    : api.put<PreferencesResponse>('/preferences', { onboardingCompleted: true }),
```

> Метод `completeOnboarding()` отправляет PUT с единственным значимым полем — остальные поля бэкенд проигнорирует если они `null` (благодаря boxed `Boolean` в `PreferencesRequest`).
> **Проблема:** текущий `PreferencesRequest` на бэкенде требует все обязательные поля при PUT. Поэтому агент должен проверить — если все поля required, нужно передавать текущие значения преференций вместе с `onboardingCompleted: true`. Использовать `PATCH` или передавать полный объект с `getPreferences()` + overwrite поля.

### React Query хук

```typescript
// Новый хук useOnboarding (можно встроить в SettingsPage/AppRouter)
const completeOnboardingMutation = useMutation({
  mutationFn: () => settingsService.completeOnboarding(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['preferences'] })
  },
})
```

### Логика показа Wizard (`AppRouter.tsx`)

```typescript
// После того как preferences загружены:
const { data: preferences } = useQuery({
  queryKey: ['preferences'],
  queryFn: settingsService.getPreferences,
  enabled: isAuthenticated,
})

// Если onboarding не пройден — показываем Wizard поверх контента:
if (isAuthenticated && preferences && !preferences.onboardingCompleted) {
  return <OnboardingWizard onComplete={completeOnboarding} />
}
```

### Компонент OnboardingWizard

Структура:
```tsx
// Состояние шагов: 1 | 2 | 3 | 4
const [step, setStep] = useState(1)

// Прогресс-бар вверху: 4 точки или линия
// Кнопки: "Пропустить шаг" (skip) + "Далее" / "Завершить"
// На финальном шаге: кнопка "Начать работу" → вызывает onComplete()
```

Полноэкранный overlay (`fixed inset-0 z-[200] bg-surface flex items-center justify-center`) поверх всего приложения.

### Шаг 1 — Профиль (`OnboardingStep1Profile`)

- Поля: имя (`name` из `User`), желаемая позиция (поле `headline` из `Profile`)
- При нажатии "Далее" — сохраняет через `profileService.update()` (уже существует)
- Если поля пусты — можно пропустить

### Шаг 2 — Первая вакансия (`OnboardingStep2Vacancy`)

- Минимальная форма: название вакансии, компания (текстовое поле, не select)
- При нажатии "Добавить и продолжить" — вызывает `vacancyService.create()` (уже существует)
- Кнопка "Пропустить" — переходит к шагу 3

### Шаг 3 — AI Провайдер (`OnboardingStep3Ai`)

- Упрощённый UI выбора: три кнопки-карточки (LOCAL, BRING_YOUR_OWN_KEY, CLOUD — disabled)
- Если выбран BRING_YOUR_OWN_KEY — поле для API ключа
- Сохраняет через `settingsService.updatePreferences()`
- Кнопка "Пропустить" доступна

### Шаг 4 — Done (`OnboardingStep4Done`)

- Красивая анимированная карточка с иконкой ✓
- Текст: "Вы готовы к работе! CareerPilot AI поможет вам найти работу мечты."
- Кнопка "Начать работу" → вызывает `onComplete()` → `completeOnboarding()` → `invalidateQueries(['preferences'])` → Wizard скрывается

### i18n ключи

```json
// ru.json
"onboarding": {
  "step1Title": "Расскажите о себе",
  "step1Description": "Заполните базовую информацию для персонализации",
  "step2Title": "Добавьте первую вакансию",
  "step2Description": "Отслеживайте отклики в удобном Kanban-борде",
  "step3Title": "Настройте AI-ассистента",
  "step3Description": "Выберите AI-провайдера для анализа вакансий и резюме",
  "step4Title": "Всё готово!",
  "step4Description": "CareerPilot AI поможет вам найти работу мечты",
  "next": "Далее",
  "skip": "Пропустить шаг",
  "finish": "Начать работу",
  "progress": "Шаг {{current}} из {{total}}",
  "stepProfile": "Профиль",
  "stepVacancy": "Вакансия",
  "stepAi": "AI",
  "stepDone": "Готово"
}

// en.json — аналогично на английском
```

---

## Порядок реализации для агента

1. [x] Создать миграцию `V30__add_onboarding_completed.sql` с `ALTER TABLE`.
2. [x] Добавить поле `onboardingCompleted` в `PreferencesEntity`, `PreferencesResponse`, `PreferencesRequest`.
3. [x] Обновить `PreferencesServiceImpl`: маппинг в `toResponse()` и применение в `updatePreferences()`.
4. [x] Запустить `.\mvnw.cmd test -Dtest="PreferencesServiceImplTest,PreferencesControllerTest"` — убедиться что тесты зелёные.
5. [x] Добавить `onboardingCompleted` в `PreferencesResponse` в `settings.service.ts`. Добавить метод `completeOnboarding()`.
6. [x] Добавить ключи i18n в `ru.json` и `en.json`.
7. [x] Создать компоненты: `OnboardingWizard`, `OnboardingStep1Profile`, `OnboardingStep2Vacancy`, `OnboardingStep3Ai`, `OnboardingStep4Done`.
8. [x] Добавить логику в `AppRouter.tsx`: загружать preferences при `isAuthenticated`, если `!onboardingCompleted` — рендерить `<OnboardingWizard />`.
9. [x] Запустить `cd frontend && npm.cmd run build` — убедиться что сборка зелёная.
10. Протестировать вручную: зарегистрировать нового пользователя → должен появиться Wizard → пройти все шаги → Dashboard должен открыться.

---

## Риски и что проверить

- **PUT /preferences требует все поля:** Если `PreferencesRequest` содержит обязательные (non-null) поля, `completeOnboarding()` должен передавать полный объект. Решение: сначала получить `getPreferences()`, затем слить с `{ onboardingCompleted: true }` и отправить PUT. Либо — на бэкенде сделать поля Request boxed (`Boolean`, а не `boolean`) и применять только non-null.
- **Существующие пользователи:** Все существующие записи в `user_preferences` получат `onboarding_completed = FALSE` (через DEFAULT в миграции), что заставит их пройти Wizard заново. Решение: в миграции сделать `UPDATE careerpilot.user_preferences SET onboarding_completed = TRUE WHERE created_at < NOW()` — считать уже зарегистрированных прошедшими онбординг.
- **Wizard не должен блокировать Telegram MiniApp:** В `OnboardingWizard` добавить проверку `isTelegramWebApp()` — если открыто в Telegram, не показывать Wizard (нет смысла проходить онбординг в MiniApp).
- **preferences query до authenticated:** Запрос `getPreferences` должен стартовать только при `isAuthenticated`. Иначе `401` будет ломать логику до логина.
- **Миграция V30:** Убедиться что `V29__add_google_calendar_integration.sql` применена. Следующая — строго `V30`.

---

## Проверки после реализации

**Backend:** `.\mvnw.cmd test -Dtest="PreferencesServiceImplTest,PreferencesControllerTest"`
**Backend compile:** `.\mvnw.cmd clean compile -DskipTests`
**Frontend:** `cd frontend && npm.cmd run build`
**Manual smoke:**
1. Регистрация нового аккаунта → должен появиться Wizard
2. Пройти все 4 шага → попасть на Dashboard
3. Перезагрузить страницу → Wizard не появляется снова
4. Существующий пользователь (у кого `onboarding_completed = true` после миграции) → Wizard не появляется

ОБЯЗАТЕЛЬНО перед завершением выполни локальную валидацию через .\verify-all.ps1 в корне проекта. 
Если скрипт выдает ошибки — исправляй их! Пуш или отчет без успешной валидации ЗАПРЕЩЕН.
После реализации выполни проверки из раздела "Проверки" и учет раздела "⚠️ Известные ошибки и паттерны" в GEMINI.md чтобы не было ошибок.
Выполни синхронизацию всех связанных документов (ROADMAP.md, ROADMAP.en.md, CAREERPILOT_AI_CONTEXT_BACKUP.md, DEPLOYMENT.md, README.md, README.ru.md, README.DEV.md), отразив в них внесенные изменения.
В конце если были ошибки или нюансы — обнови раздел "⚠️ Известные ошибки и паттерны" в GEMINI.md, но только если ты точно уверен что решение правильное и сооветствует best practics.
Обязательно не забывай про i18n ключи!
