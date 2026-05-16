# Task: Interview UI Implementation

## Контекст и цель
Реализовать полноценный UI для управления собеседованиями (Interviews). Бэкенд уже готов, но на фронтенде собеседования отображаются только на Dashboard. Необходимо добавить возможность создания, редактирования и удаления собеседований, а также отдельную страницу списка.

## Затрагиваемые файлы

### Создать новые
- `frontend/src/services/interview.service.ts` — сервис для работы с API собеседований
- `frontend/src/pages/InterviewsPage.tsx` — страница со списком всех собеседований
- `frontend/src/components/InterviewForm.tsx` — форма создания/редактирования собеседования

### Изменить существующие
- `frontend/src/types/index.ts` — добавить типы `Interview`, `InterviewType`, `InterviewResult`
- `frontend/src/components/Sidebar.tsx` — добавить пункт "Interviews" в навигацию
- `frontend/src/i18n/locales/ru.json` и `en.json` — добавить переводы для нового раздела
- `docs/FRONTEND_BACKEND_CONTRACT.md` — задокументировать эндпоинты Interviews

## Backend: описание (для справки SWE-1.6)

### Controller
`InterviewController` доступен по адресу `/api/interviews`.
- `POST /api/interviews` — создание
- `GET /api/interviews` — список (с пагинацией)
- `GET /api/interviews/{id}` — детали
- `PUT /api/interviews/{id}` — обновление
- `DELETE /api/interviews/{id}` — удаление

### Entity / DTO
`InterviewEntity` содержит: `type`, `scheduledAt`, `timezone`, `meetingLink`, `result`, `notes`, `applicationId`.

## Frontend: точная реализация

### TypeScript типы (types/index.ts)
```typescript
export type InterviewType = 'PHONE' | 'HR' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'CULTURE_FIT' | 'FINAL' | 'OTHER'
export type InterviewResult = 'PENDING' | 'PASSED' | 'FAILED' | 'CANCELLED'

export interface Interview {
  id: string
  applicationId: string
  type: InterviewType
  scheduledAt: string
  timezone?: string
  meetingLink?: string
  result?: InterviewResult
  notes?: string
  // Дополнительные поля из DashboardSummaryDto если нужно
  companyName?: string
  vacancyTitle?: string
}
```

### API-функция (services/interview.service.ts)
Реализовать стандартные методы `list`, `getById`, `create`, `update`, `delete`.
Эндпоинт: `/interviews`.

### React Query хуки
- `['interviews', 'list']`
- `['interviews', 'detail', id]`
- Инвалидация при мутациях.

### Компоненты

#### InterviewForm.tsx
- Поля:
  - Application (выбор из списка активных заявок или передача `applicationId` через props)
  - Тип собеседования (select)
  - Дата и время (datetime-local)
  - Ссылка на встречу (URL)
  - Заметки (textarea)
  - Результат (select, по умолчанию PENDING)
- Валидация Zod: `scheduledAt` обязателен, `meetingLink` валидный URL если заполнен.

#### InterviewsPage.tsx
- Список собеседований в виде карточек (использовать `ds-card`).
- Фильтрация по типу или результату.
- Кнопка "Добавить собеседование".
- Сортировка по дате (ближайшие сверху).

### i18n ключи
Добавить секцию `interviews` в локали:
- `title`: Собеседования
- `type`: Тип
- `scheduledAt`: Время
- `meetingLink`: Ссылка
- `result`: Результат
- `notes`: Заметки
- `form.createTitle`: Запланировать собеседование
- `form.editTitle`: Редактировать собеседование
- `emptyState`: Собеседований пока нет

## Порядок реализации для SWE-1.6
1. Обновить типы в `frontend/src/types/index.ts`.
2. Создать `frontend/src/services/interview.service.ts`.
3. Добавить пункт в `Sidebar.tsx` и переводы в `ru.json`/`en.json`.
4. Реализовать `InterviewForm.tsx` (использовать `ds-btn-primary`, `ds-card`).
5. Реализовать `InterviewsPage.tsx` с загрузкой данных через TanStack Query.
6. Добавить документацию в `docs/FRONTEND_BACKEND_CONTRACT.md`.

## Риски и что проверить
- **Выбор Application**: В форме нужно иметь возможность выбрать заявку. Нужно подтянуть список заявок через `applicationService`.
- **Формат даты**: Убедиться, что `datetime-local` корректно преобразуется в ISO строку (Instant) для бэкенда.
- **Пустые состояния**: Обработать случай, когда у пользователя нет ни одной активной заявки (нельзя создать собеседование).

## Проверки после реализации
**Frontend:** `cd frontend && npm.cmd run build`
**Manual:** Проверить создание собеседования из нового раздела и его отображение в Dashboard.
