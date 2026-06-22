# Task: Full Mobile Optimization (Полная мобильная оптимизация)

## Контекст и цель

Завершить адаптацию всех страниц приложения под мобильные устройства.
Сейчас адаптированы только `ApplicationsPage` (Kanban `min-w`, flex-wrap) и `Sidebar` (Drawer).
Остальные страницы (`AnalyticsPage`, `VacancyDetailPage`, `InterviewsPage`, `VacanciesPage`,
`CompaniesPage`, `TasksPage`, `DashboardPage`) используют фиксированные гриды без мобильных брейкпоинтов.
Backend не затрагивается — чисто frontend задача.

## Затрагиваемые файлы

### Создать новые
_Нет — только изменение существующих файлов._

### Изменить существующие

- `frontend/src/pages/AnalyticsPage.tsx` — адаптировать charts-секцию, Company-таблицу, Funnel
- `frontend/src/pages/VacancyDetailPage.tsx` — сайдбар `lg:grid-cols-3` → одна колонка на мобильном
- `frontend/src/pages/InterviewsPage.tsx` — шапка с фильтрами, карточки собеседований
- `frontend/src/pages/VacanciesPage.tsx` — шапка с фильтрами и кнопками действий
- `frontend/src/pages/CompaniesPage.tsx` — шапка с поиском, grid карточек компаний
- `frontend/src/pages/TasksPage.tsx` — шапка с фильтрами, список задач
- `frontend/src/pages/DashboardPage.tsx` — виджеты в колонках, блок AI Insights
- `frontend/src/pages/AiAssistantPage.tsx` — sidebar инструментов + форма результата

---

## Frontend: точная реализация

Задача полностью frontend. Нет новых компонентов, нет API-вызовов.  
Паттерн адаптации — тот же, что уже применён в `ApplicationsPage`:
- **Шапки страниц:** `flex-col sm:flex-row sm:items-center sm:justify-between`
- **Блоки фильтров:** `flex-col sm:flex-row gap-3`
- **Поиск:** `w-full sm:max-w-md`
- **Гриды карточек:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Колонки деталей:** убирать `lg:grid-cols-*` в пользу одной колонки на мобильном

### AnalyticsPage.tsx

**Проблема 1 — Funnel + Skills (L468):** `grid grid-cols-1 lg:grid-cols-12 gap-6`
- Уже адаптирован (`grid-cols-1` на мобильном) ✅

**Проблема 2 — Company Analytics таблица (L584):** `grid grid-cols-12 gap-4`
- Таблица с 12 колонками ломается на мобильных — становится нечитаемой
- Решение: на мобильных (`< sm`) заменить таблицу на список карточек с `flex flex-col`
- Добавить: `hidden sm:grid` для таблицы-шапки, `sm:hidden` для карточного вида
- Структура карточки: название компании + ключевые метрики (отклики, интервью) вертикально

**Проблема 3 — KPI Cards (L431):** `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4`
- Уже адаптирован ✅

**Проблема 4 — вкладки (tabs) Analytics:** кнопки могут не влезть на узком экране
- Добавить `overflow-x-auto` и `whitespace-nowrap` к контейнеру вкладок

### VacancyDetailPage.tsx

**Проблема — двухколоночный layout (L309):** `grid gap-6 lg:grid-cols-3`
- Уже адаптирован: сайдбар идёт под контент на мобильных (`lg:col-span-2` + отдельный `lg:col-span-1`) ✅

**Проблема — внутренние блоки (L375):** `grid grid-cols-2 gap-4` (поля формы внутри)
- Добавить `sm:grid-cols-2 grid-cols-1` чтобы поля шли в одну колонку на мобильном

**Проблема — шапка с кнопками действий:**
- Кнопки Edit/Delete на мобильном нужно скрыть текст, оставить только иконки: `hidden sm:inline`

### InterviewsPage.tsx

**Проблема 1 — шапка (header):**
- Кнопка "Добавить собеседование" и заголовок должны идти в разные строки на мобильном
- Добавить: `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`

**Проблема 2 — фильтры:**
- Строка с `CustomSelect` (тип, результат) + поиск — нужно `flex-col sm:flex-row`

**Проблема 3 — карточки (L363):** `grid gap-4 md:grid-cols-2 xl:grid-cols-3`
- Уже адаптирован ✅

**Проблема 4 — карточка собеседования:**
- Кнопки действий (edit, delete, ICS, sync) в ряд — на мобильных плохо выглядит
- Обернуть в `flex flex-wrap gap-1`

### VacanciesPage.tsx

**Проблема 1 — шапка:**
- Заголовок + кнопка "Добавить вакансию" → `flex flex-col gap-4 sm:flex-row sm:justify-between`

**Проблема 2 — блок фильтров:**
- CustomSelect-ы (статус, remote, сортировка) + поиск в одну строку → на мобильном ломается
- `flex flex-col gap-3 sm:flex-row sm:flex-wrap`

**Проблема 3 — grid карточек вакансий:**
- Проверить существующий grid — убедиться что `grid-cols-1` на мобильном

### CompaniesPage.tsx

**Проблема 1 — шапка:** аналогично VacanciesPage
**Проблема 2 — grid карточек:** убедиться что есть `grid-cols-1`

### TasksPage.tsx

**Проблема 1 — шапка:** кнопки фильтров + "Новая задача" → `flex-col sm:flex-row`
**Проблема 2 — фильтры статуса/приоритета:** `flex flex-wrap gap-2` уже OK, проверить
**Проблема 3 — список задач:** `flex flex-col` — уже OK ✅

### DashboardPage.tsx

**Проблема — виджеты в 3 колонки:**
- Проверить grid виджетов — добавить `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` если нет

### AiAssistantPage.tsx

**Проблема — sidebar инструментов + форма:**
- Layout `flex gap-6` (sidebar слева, форма справа) → на мобильных sidebar идёт сверху
- `flex flex-col lg:flex-row gap-6`
- Sidebar инструментов: горизонтальная прокрутка `overflow-x-auto flex lg:flex-col gap-2`

---

## Порядок реализации для агента

1. [x] `AnalyticsPage.tsx` — добавить карточный вид для Company-таблицы на мобильном (`sm:hidden` / `hidden sm:grid`), `overflow-x-auto` для вкладок.
2. [x] `VacancyDetailPage.tsx` — исправить внутренние `grid-cols-2` на `grid-cols-1 sm:grid-cols-2`, скрыть текст кнопок на мобильном.
3. [x] `InterviewsPage.tsx` — шапка `flex-col sm:flex-row`, фильтры `flex-col sm:flex-row`, кнопки действий `flex-wrap`.
4. [x] `VacanciesPage.tsx` — шапка + фильтры + убедиться в `grid-cols-1`.
5. [x] `CompaniesPage.tsx` — шапка + убедиться в `grid-cols-1`.
6. [x] `TasksPage.tsx` — шапка.
7. [x] `DashboardPage.tsx` — проверить и исправить grid виджетов.
8. [x] `AiAssistantPage.tsx` — `flex-col lg:flex-row`, горизонтальный sidebar-скролл на мобильном.
9. [x] Запустить `cd frontend && npm.cmd run build` — без ошибок.
10. Выполнить все действия и синхронизировать все файлы которые описаны в последнем блоке этого файла.

---

## Риски и что проверить

- **CustomSelect z-index:** дропдауны CustomSelect на мобильных могут вылезать за пределы overflow-контейнера. Проверить, что `z-index: 50` не перекрывается.
- **Kanban на мобильном:** горизонтальный скролл Kanban уже реализован (`min-w-[280px] sm:min-w-[300px]`). Не трогать — не регрессировать.
- **Analytics Company-таблица:** при замене на карточки нужно сохранить все колонки (отклики, интервью, офферы, rate, время). Карточка: главная метрика большим шрифтом + остальные мелко.
- **Тест на iPhone SE (375px):** минимальная ширина — убедиться, что контент не выходит за экран.

## Проверки после реализации

**Frontend:** `cd frontend && npm.cmd run build`
**Lint:** `cd frontend && npm.cmd run lint`
**Manual:** Открыть каждую страницу в DevTools → режим мобильного устройства (375px) → убедиться что нет горизонтального скролла у body, шапки не перекрываются, кнопки не обрезаются.

ОБЯЗАТЕЛЬНО перед завершением выполни локальную валидацию через .\verify-all.ps1 в корне проекта. 
Если скрипт выдает ошибки — исправляй их! Пуш или отчет без успешной валидации ЗАПРЕЩЕН.
После реализации выполни проверки из раздела "Проверки" и учет раздела "⚠️ Известные ошибки и паттерны" в GEMINI.md чтобы не было ошибок.
Выполни синхронизацию всех связанных документов (ROADMAP.md, ROADMAP.en.md, CAREERPILOT_AI_CONTEXT_BACKUP.md, DEPLOYMENT.md, README.md, README.ru.md, README.DEV.md), отразив в них внесенные изменения.
В конце если были ошибки или нюансы — обнови раздел "⚠️ Известные ошибки и паттерны" в GEMINI.md, но только если ты точно уверен что решение правильное и сооветствует best practics.
Обязательно не забывай про i18n ключи!