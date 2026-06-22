# Task: Dark / Light Theme (Переключатель темы)

## Контекст и цель

Добавить поддержку переключения тем (Светлая / Тёмная / Системная) в CareerPilot AI.
В данный момент приложение захардкожено на тёмную тему через утилиты Tailwind (например, `text-white`, `bg-[rgba(255,255,255,0.02)]`).
Необходимо:
1. Добавить настройку `theme` в профиль пользователя (Preferences).
2. Настроить CSS-переменные для светлой темы в `globals.css`.
3. Заменить хардкодные цвета в UI-компонентах на семантические CSS-переменные (ink, surface, border).
4. Добавить переключатель темы в `SettingsPage` и сайдбар.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V32__add_theme_preference.sql`
- `frontend/src/context/ThemeContext.tsx`
- `docs/tasks/new_tasks/TASK_THEME.md` (этот файл)

### Изменить существующие
- `backend/.../preferences/entity/PreferencesEntity.java` — добавить поле `theme`.
- `backend/.../preferences/request/PreferencesRequest.java` & `Response` — добавить поле `theme`.
- `frontend/src/services/settings.service.ts` — обновить типы `PreferencesRequest`/`Response`.
- `frontend/src/styles/globals.css` — определить светлые/тёмные токены.
- `frontend/src/components/Sidebar.tsx` — добавить иконку-переключатель (Moon/Sun).
- `frontend/src/pages/SettingsPage.tsx` — добавить настройку темы (Theme) в раздел Preferences (Внешний вид).
- `frontend/src/pages/*.tsx` и `components/*.tsx` — масштабный рефакторинг цветов.

---

## Backend: точная реализация

### Flyway миграция V32

```sql
-- V32__add_theme_preference.sql
ALTER TABLE careerpilot.user_preferences 
    ADD COLUMN IF NOT EXISTS theme VARCHAR(20) NOT NULL DEFAULT 'SYSTEM';
```

### Java классы

В `PreferencesEntity.java`:
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 20)
private ThemePreference theme = ThemePreference.SYSTEM;

// Добавить enum:
public enum ThemePreference {
    LIGHT, DARK, SYSTEM
}
```

Обновить `PreferencesRequest`, `PreferencesResponse` и `PreferencesServiceImpl.java` (пробросить поле).

---

## Frontend: точная реализация

### 1. Настройка Tailwind и CSS

В `frontend/src/styles/globals.css` определить две схемы через `@theme` и кастомные properties:

```css
@layer base {
  :root {
    /* Светлая тема по умолчанию или системная */
    --color-bg: #ffffff;
    --color-surface-1: #f4f4f5;
    --color-surface-2: #e4e4e7;
    --color-border: rgba(0, 0, 0, 0.06);
    --color-ink: #09090b;
    --color-ink-muted: #52525b;
    /* ... */
  }

  .dark {
    /* Тёмная тема */
    --color-bg: #08090d;
    --color-surface-1: #0c0e14;
    --color-surface-2: #10131a;
    --color-border: rgba(255, 255, 255, 0.06);
    --color-ink: #f4f4f5;
    --color-ink-muted: #a1a1aa;
    /* ... */
  }
}
```

### 2. ThemeContext

Создать `ThemeContext.tsx`, который:
- Читает `theme` из `preferences` (через `settings.service.ts` или `AuthContext`).
- Если `SYSTEM`, то слушает `window.matchMedia('(prefers-color-scheme: dark)')`.
- Применяет класс `dark` или удаляет его у `document.documentElement`.
- Хранит fallback в `localStorage` до загрузки профиля.

### 3. Рефакторинг Компонентов (Самая большая часть)

Во всём приложении сейчас используются цвета напрямую:
- `text-white` -> `text-ink`
- `text-white/40` или `text-[#6b7590]` -> `text-ink-muted`
- `bg-[rgba(255,255,255,0.02)]` -> `bg-surface-1` или `bg-surface-2`
- `border-[rgba(255,255,255,0.06)]` -> `border-border`

Придётся пройтись по `AnalyticsPage.tsx`, `ApplicationsPage.tsx`, `DashboardPage.tsx` и другим ключевым файлам, заменяя хардкод на семантические утилиты.

### 4. SettingsPage & Sidebar

- В `SettingsPage.tsx` добавить секцию "Внешний вид" (Appearance).
- В секции "Внешний вид" показать 3 кнопки/радиобокса: Светлая, Тёмная, Системная.
- В `Sidebar.tsx` добавить кнопку быстрого переключения (меняет DARK <-> LIGHT, обновляя преференсы).

---

## Порядок реализации для агента

1. **Backend:** миграция, Entity, DTO, Service. Запуск и проверка.
2. **CSS:** Настройка `globals.css` для поддержки `.dark` и светлых токенов по умолчанию (или наоборот).
3. **Context:** Создание `ThemeContext` и оборачивание `App.tsx`.
4. **Refactoring:** Постепенный рефакторинг UI-компонентов. Рекомендуется начать с Layout (Sidebar, Topbar), затем Dashboard, затем остальные страницы.
5. **UI Controls:** Добавление переключателя в Sidebar и SettingsPage.
6. Выполнить `cd frontend && npm run build`.
7. Выполнить все действия и синхронизировать все файлы которые описаны в последнем блоке этого файла.

## Риски и что проверить

- **FOUC (Flash of Unstyled Content):** При загрузке страницы, пока React не скачал преференсы, тема может моргнуть. Необходимо добавить inline script в `index.html`, который читает `localStorage.getItem('cp_theme')` и сразу ставит класс `dark`, чтобы избежать белой вспышки.
- **Градиенты:** Хардкодные градиенты (`from-white/10 to-transparent`) могут плохо смотреться на белом фоне. Их придётся переделать на `from-ink/10`.
- **Kanban Board:** Цвета статусов (`statusColors` в `ApplicationsPage.tsx`) захардкожены в `bg-slate-500/10 text-slate-400`. В светлой теме `text-slate-400` будет нечитаем (слишком светлый). Придётся добавить вариант для светлой темы или использовать более тёмные оттенки (`text-slate-700 dark:text-slate-400`). Удобнее всего добавить префикс `dark:` в объект конфигурации.

## Проверки после реализации

**Frontend:** `cd frontend && npm run build`
**Manual Smoke:**
1. Открыть приложение, зайти в Настройки.
2. Переключить тему на Светлую. Весь UI должен мгновенно перерисоваться в белые/серые тона, тексты должны быть чёрными/тёмно-серыми.
3. Проверить Kanban-доску — цвета статусов должны быть читаемыми в светлой теме.
4. Перезагрузить страницу — тема не должна сбрасываться (и не должно быть долгой вспышки неправильного цвета).

ОБЯЗАТЕЛЬНО перед завершением выполни локальную валидацию через .\verify-all.ps1 в корне проекта. 
Если скрипт выдает ошибки — исправляй их! Пуш или отчет без успешной валидации ЗАПРЕЩЕН.
После реализации выполни проверки из раздела "Проверки" и учет раздела "⚠️ Известные ошибки и паттерны" в GEMINI.md чтобы не было ошибок.
Выполни синхронизацию всех связанных документов (ROADMAP.md, ROADMAP.en.md, CAREERPILOT_AI_CONTEXT_BACKUP.md, DEPLOYMENT.md, README.md, README.ru.md, README.DEV.md), отразив в них внесенные изменения.
В конце если были ошибки или нюансы — обнови раздел "⚠️ Известные ошибки и паттерны" в GEMINI.md, но только если ты точно уверен что решение правильное и сооветствует best practics.
Обязательно не забывай про i18n ключи!