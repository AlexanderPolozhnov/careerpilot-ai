# Task: Реализация интерфейса управления резюме (Resume UI)

## Контекст и цель
Бэкенд для управления резюме уже готов. Необходимо добавить пользовательский интерфейс для управления списком резюме в раздел настроек. Это позволит пользователям загружать ссылки на свои резюме, хранить текстовые версии и выбирать резюме по умолчанию для работы AI (Resume Match, Cover Letter).

## Затрагиваемые файлы

### Создать новые
- `frontend/src/components/ResumeForm.tsx` — Форма создания/редактирования резюме (в модальном окне).

### Изменить существующие
- `frontend/src/pages/SettingsPage.tsx` — Добавить секцию управления резюме.
- `frontend/src/types/index.ts` — Добавить поле `textContent` в интерфейс `Resume`.
- `frontend/src/i18n/locales/ru.json` — Добавить локализацию для резюме.
- `frontend/src/i18n/locales/en.json` — Добавить локализацию для резюме.

## Frontend: точная реализация

### TypeScript типы (types/index.ts)
Обновить интерфейс `Resume`, добавив опциональное поле:
```typescript
export interface Resume {
  id: string;
  userId: string;
  name: string;
  fileUrl: string;
  textContent?: string; // Новое поле
  uploadedAt: string;
  isDefault: boolean;
}
```

### Компонент ResumeForm (components/ResumeForm.tsx)
Создать форму на базе `RHF + Zod`.
- **Поля:** `name` (строка, min 2), `fileUrl` (URL, опционально), `textContent` (textarea, опционально), `isDefault` (checkbox).
- **Стилизация:** использовать `ds-card` и стандартные `input` из проекта.
- **Props:** `onSubmit`, `onCancel`, `initialValues`, `isSubmitting`.

### Страница настроек (pages/SettingsPage.tsx)
1.  **Данные:** Добавить `useQuery` для `resumeService.list()` (ключ `['resumes', 'list']`).
2.  **Мутации:** Добавить мутации для `create`, `update`, `delete`, `setAsDefault`.
3.  **UI Секция:** Добавить `<section>` после "Professional Profile".
    - **Заголовок:** "Мои резюме" (иконка `FileText`).
    - **Список:** Отображение резюме в виде компактных карточек.
    - **Индикация:** Бейдж `Default` для дефолтного резюме.
    - **Действия:** Кнопки "Сделать основным", "Редактировать", "Удалить".
    - **Кнопка добавления:** Открывает `ResumeForm` в модальном окне.

### i18n ключи (ru.json / en.json)
Добавить секцию `settings.resumes`:
- `title`: "Мои резюме"
- `description`: "Управляйте версиями ваших резюме для AI-анализа"
- `addResume`: "Добавить резюме"
- `defaultBadge`: "Основное"
- `makeDefault`: "Сделать основным"
- `form`:
    - `name`: "Название (например, Software Engineer 2024)"
    - `fileUrl`: "Ссылка на файл (PDF/Google Drive)"
    - `textContent`: "Текст резюме (для AI)"
- `deleteConfirm`: "Вы уверены, что хотите удалить это резюме?"

## Порядок реализации для SWE-1.6
1. Обновить интерфейс `Resume` в `types/index.ts`.
2. Добавить новые ключи локализации в `ru.json` и `en.json`.
3. Создать компонент `ResumeForm.tsx` (используя `VacancyForm.tsx` как пример модальной формы).
4. В `SettingsPage.tsx` реализовать логику запроса данных и мутации (используя `notificationService` мутации как пример).
5. Интегрировать секцию резюме в верстку `SettingsPage.tsx` с использованием дизайн-системы (`ds-card`, `ds-btn`).
6. Проверить работу переключения "Default" статуса (инвалидация query).

## Риски и что проверить
- **Валидация URL:** Убедиться, что `fileUrl` принимает только валидные ссылки или пустую строку.
- **UI Overflow:** Если текст резюме (`textContent`) очень длинный, не отображать его полностью в списке, только в форме редактирования.
- **Инвалидация:** При удалении или создании резюме список должен обновляться мгновенно через `queryClient.invalidateQueries`.

## Проверки после реализации
**Frontend:** `cd frontend && npm.cmd run build`
**Manual:** Проверить создание резюме, установку его основным и удаление.
