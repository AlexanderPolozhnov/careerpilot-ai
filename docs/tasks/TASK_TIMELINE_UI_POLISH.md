# Task: Timeline UI Polish — i18n статусов, мгновенные тултипы, стилизация кнопки

## Контекст и цель
После реализации Application Status History выявлены три UX/дизайн-недочёта: (1) метки статусов (`SAVED`, `TECH INTERVIEW` и т.д.) не переводятся через i18n и показываются жёстко закодированными в коде; (2) у кнопки просмотра истории тултип медленный (нативный `title`), только на английском и без ключа; (3) иконка часов стилистически не соответствует проекту — нет фиолетового акцента, слабо выражена. Задача — исправить все три пункта без изменений бэкенда.

## Затрагиваемые файлы

### Создать новые
Нет.

### Изменить существующие
- `frontend/src/lib/utils.ts` — добавить экспортируемую константу `APPLICATION_STATUS_KEYS`
- `frontend/src/pages/ApplicationsPage.tsx` — заменить `STATUS_LABELS` на `APPLICATION_STATUS_KEYS` из utils; исправить отображение статуса в карточке; переделать кнопку-часы
- `frontend/src/components/ApplicationTimelineModal.tsx` — починить `getStatusLabel`; добавить `StatusWithTooltip`; добавить тултип на кнопку в заголовке модалки
- `frontend/src/components/StatusBadge.tsx` — подключить `useTranslation` и `APPLICATION_STATUS_KEYS` для меток
- `frontend/src/i18n/locales/en.json` — исправить значения статусов на читаемый английский; добавить `viewHistory`
- `frontend/src/i18n/locales/ru.json` — добавить `viewHistory`

---

## Frontend: точная реализация

### Шаг 1 — `frontend/src/lib/utils.ts`

После блока `APPLICATION_STATUS_META` (строка ~92) добавить новую экспортируемую константу:

```ts
export const APPLICATION_STATUS_KEYS: Record<ApplicationStatus, string> = {
  NEW:            'applications.new',
  SAVED:          'applications.saved',
  APPLIED:        'applications.applied',
  HR_SCREEN:      'applications.hrScreen',
  TECH_INTERVIEW: 'applications.techInterview',
  FINAL_ROUND:    'applications.finalRound',
  OFFER:          'applications.offer',
  REJECTED:       'applications.rejected',
}
```

Никаких других изменений в файле не делать.

---

### Шаг 2 — i18n локали

#### `frontend/src/i18n/locales/en.json` — блок `applications`

Заменить текущие значения статусов (все капслоком) на читаемый English:

```json
"new":          "New",
"saved":        "Saved",
"applied":      "Applied",
"hrScreen":     "HR Screen",
"techInterview":"Tech Interview",
"finalRound":   "Final Round",
"offer":        "Offer",
"rejected":     "Rejected",
"timeline": {
  "title":      "Status History",
  "noHistory":  "No history recorded yet",
  "initial":    "Initial",
  "viewHistory":"View status history"
}
```

#### `frontend/src/i18n/locales/ru.json` — блок `applications.timeline`

Добавить только ключ `viewHistory` (остальные уже есть):

```json
"timeline": {
  "title":      "История статусов",
  "noHistory":  "История изменений еще не записана",
  "initial":    "Начало",
  "viewHistory":"Посмотреть историю статусов"
}
```

---

### Шаг 3 — `frontend/src/components/ApplicationTimelineModal.tsx`

#### 3a. Импорты

Добавить `APPLICATION_STATUS_KEYS` к импорту из `@/lib/utils`:
```ts
import { formatRelative, formatDateTime, cn, APPLICATION_STATUS_KEYS } from '@/lib/utils'
```
Также добавить `type ApplicationStatus` из `@/types`.

#### 3b. Починить `getStatusLabel` в `TimelineItem`

Заменить текущую сломанную функцию:
```ts
// Было (сломано):
const getStatusLabel = (status: string | null) => {
  if (!status) return t('applications.timeline.initial')
  const key = `applications.${status.toLowerCase().replace('_', '')}`
  return t(key, status)
}
```

На:
```ts
// Стало:
const getStatusKey = (status: string | null): string | null => {
  if (!status) return null
  return APPLICATION_STATUS_KEYS[status as ApplicationStatus] ?? null
}
const getStatusLabel = (status: string | null): string => {
  if (!status) return t('applications.timeline.initial')
  const key = getStatusKey(status)
  return key ? t(key) : status
}
```

#### 3c. Добавить `StatusWithTooltip` — новый inline-компонент внутри файла

Объявить до `TimelineItem`, после `getStatusLabel`/`getStatusColor`:

```tsx
function StatusWithTooltip({
  status,
  getLabel,
  getKey,
}: {
  status: string | null
  getLabel: (s: string | null) => string
  getKey: (s: string | null) => string | null
}) {
  const label = getLabel(status)
  const key = getKey(status)
  return (
    <span className="relative group/stip inline-flex items-center">
      <span className="font-medium text-[#e8eaed]">{label}</span>
      {key && (
        <span className="absolute bottom-full left-0 mb-1.5 px-2 py-1.5 rounded-lg text-[10px] bg-[#1a1a1e] border border-violet-500/20 whitespace-nowrap pointer-events-none opacity-0 group-hover/stip:opacity-100 transition-opacity duration-75 z-20 shadow-lg shadow-black/40 min-w-max">
          <span className="block text-[#e8eaed]">{label}</span>
          <span className="block font-mono text-violet-400/70">{key}</span>
        </span>
      )}
    </span>
  )
}
```

#### 3d. Обновить `TimelineItem` — использовать `StatusWithTooltip`

Заменить строку:
```tsx
// Было:
<span className="text-xs font-medium text-[#e8eaed]">
  {getStatusLabel(item.fromStatus)} → {getStatusLabel(item.toStatus)}
</span>
```

На:
```tsx
// Стало:
<div className="flex items-center gap-2 text-xs">
  <StatusWithTooltip status={item.fromStatus} getLabel={getStatusLabel} getKey={getStatusKey} />
  <span className="text-[#4a4e5a]">→</span>
  <StatusWithTooltip status={item.toStatus} getLabel={getStatusLabel} getKey={getStatusKey} />
</div>
```

---

### Шаг 4 — `frontend/src/pages/ApplicationsPage.tsx`

#### 4a. Импорт

Добавить `APPLICATION_STATUS_KEYS` к импорту из `@/lib/utils`.
Удалить константу `STATUS_LABELS` (строки 38–47) — заменена на `APPLICATION_STATUS_KEYS` из utils.

#### 4b. Исправить метку статуса в карточке `ApplicationCardBody`

Текущая строка (≈166):
```tsx
// Было:
{application.status.replace('_', ' ')}
```

Заменить на:
```tsx
// Стало:
{t(APPLICATION_STATUS_KEYS[application.status])}
```

#### 4c. Рестайл кнопки-часов в `ApplicationCardBody`

Заменить весь блок `{/* Timeline button */}` (строки 171–183):

```tsx
{/* Timeline button */}
<div className="relative group/tip">
  <button
    onClick={(e) => {
      e.stopPropagation()
      onTimelineClick()
    }}
    className={[
      'opacity-0 group-hover:opacity-100 transition-all duration-200',
      'p-1.5 rounded-lg',
      'bg-violet-500/10 border border-violet-500/20 text-violet-400',
      'hover:bg-violet-500/20 hover:border-violet-500/40 hover:text-violet-300',
      'hover:shadow-sm hover:shadow-violet-500/20',
    ].join(' ')}
  >
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </button>
  <span className="absolute bottom-full right-0 mb-1.5 px-2 py-1.5 rounded-lg bg-[#1a1a1e] border border-violet-500/20 whitespace-nowrap pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-75 z-20 shadow-lg shadow-black/40 min-w-max">
    <span className="block text-[10px] text-[#e8eaed]">{t('applications.timeline.viewHistory')}</span>
    <span className="block text-[9px] font-mono text-violet-400/60">applications.timeline.viewHistory</span>
  </span>
</div>
```

#### 4d. Исправить вызов `STATUS_LABELS` в рендере колонок

В функции рендера `ApplicationsPage` (строка ≈514):
```tsx
// Было:
label={t(STATUS_LABELS[s])}

// Стало:
label={t(APPLICATION_STATUS_KEYS[s])}
```

---

### Шаг 5 — `frontend/src/components/StatusBadge.tsx`

#### 5a. Импорты

Добавить:
```ts
import { useTranslation } from 'react-i18next'
import { cn, getStatusMeta, APPLICATION_STATUS_KEYS } from '@/lib/utils'
import type { ApplicationStatus, VacancyStatus } from '@/types'
```

#### 5b. Обновить `StatusBadge`

```tsx
export function StatusBadge({ status, kind, className }: StatusBadgeProps) {
  const { t } = useTranslation()
  const meta = getStatusMeta(status, kind)
  const badgeClass = getDesignSystemBadgeClass(status)
  const i18nKey = APPLICATION_STATUS_KEYS[status as ApplicationStatus]
  const label = i18nKey ? t(i18nKey) : meta.label

  return (
    <span className={cn('ds-badge', badgeClass, className)}>
      <span className="ds-badge-dot" />
      {label}
    </span>
  )
}
```

Логика: для `ApplicationStatus` используем `t(i18nKey)`, для `VacancyStatus` (где `i18nKey` будет `undefined`) оставляем `meta.label` — их i18n не входит в скоп этой задачи.

---

## Порядок реализации для SWE-1.6

1. Добавить `APPLICATION_STATUS_KEYS` в `frontend/src/lib/utils.ts`
2. Обновить `frontend/src/i18n/locales/en.json` — значения статусов и ключ `viewHistory`
3. Обновить `frontend/src/i18n/locales/ru.json` — добавить ключ `viewHistory`
4. Исправить `frontend/src/components/ApplicationTimelineModal.tsx` — шаги 3a–3d
5. Исправить `frontend/src/pages/ApplicationsPage.tsx` — шаги 4a–4d
6. Исправить `frontend/src/components/StatusBadge.tsx` — шаги 5a–5b
7. Запустить `npm run lint` и `npm run build`, устранить ошибки

---

## Риски и что проверить

- **Tailwind `group/tip` и `group/stip`** — named groups требуют Tailwind v3.2+. Если сборка ругается, заменить на вложенные `group` с уникальным классом-обёрткой через `[&:hover>span]:opacity-100`.
- **`APPLICATION_STATUS_KEYS` для `VacancyStatus`** — в `StatusBadge` обращение по ключу вернёт `undefined`, что приведёт к `meta.label` — это намеренное поведение, не баг.
- **Удаление `STATUS_LABELS`** — убедиться, что константа не импортируется в других файлах кроме `ApplicationsPage.tsx`. Выполнить grep по `STATUS_LABELS`.
- **`duration-75` vs `delay-0`** — `transition-opacity duration-75` даёт ~75ms появление тултипа. Если хочется ещё быстрее, использовать `duration-0`.
- **Overlapping tooltip в Kanban** — тултип карточки (`group/tip`) вылезает за пределы карточки. Убедиться, что у родительской колонки нет `overflow-hidden`. Если есть — добавить `overflow-visible` к нужному контейнеру.

## Проверки после реализации

**Frontend lint:** `cd frontend && npm.cmd run lint`
**Frontend build:** `cd frontend && npm.cmd run build`
**Manual RU locale:**
1. Переключить язык на русский.
2. В Kanban-доске: метки статусов в карточках и заголовках колонок должны быть на русском («Сохранено», «Техническое интервью» и т.д.).
3. Навести на иконку часов — должен появиться тултип с фиолетовой рамкой, текст на русском + ключ `applications.timeline.viewHistory` ниже.
4. Открыть Timeline Modal — переходы статусов должны быть на русском.
5. Навести на любую метку статуса в модалке — тултип с ключом должен появиться мгновенно (~75ms).
**Manual EN locale:**
1. Переключить язык на English.
2. Статусы должны отображаться как «New», «Saved», «HR Screen», «Tech Interview» — не капслоком.
