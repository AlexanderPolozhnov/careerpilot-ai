# CareerPilot AI Frontend

Frontend-модуль CareerPilot AI: React-приложение для управления вакансиями, компаниями, откликами, AI-assisted анализом и аналитикой поиска работы.

## Статус

Модуль находится в активной разработке. Часть экранов уже подключена к typed service layer, часть сценариев пока использует mock data через `VITE_USE_MOCKS`.

## Стек

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- i18next
- lucide-react

## Команды

Установка зависимостей:

```bash
npm install
```

Сервер разработки:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Сборка production-версии:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

В PowerShell можно использовать `npm.cmd`, если execution policy блокирует `npm.ps1`.

## Переменные окружения

- `VITE_API_BASE_URL` - base URL для backend API. Default in code: `http://localhost:8080/api`.
- `VITE_USE_MOCKS` - переключатель mock/API режима. Default in code: `true`.

Пример:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCKS=false
```

## Мок-данные

Mock data находится в `src/mock/data.ts`.

Важно:

- `DashboardPage` пока напрямую использует mock data.
- `SettingsPage` частично использует mock/local-only state.
- Основной service layer переключается через `VITE_USE_MOCKS`.
- `authService.me()` сейчас не mock-aware и может вызвать `GET /auth/me`, если в `localStorage` есть `cp_access_token`.

## Документация

- [Руководство разработчика](../docs/README.DEV.md)
- [Контракт Frontend/Backend](../docs/FRONTEND_BACKEND_CONTRACT.md)
- [Реализация i18n](../docs/I18N_IMPLEMENTATION.md)
