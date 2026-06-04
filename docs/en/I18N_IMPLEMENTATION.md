# CareerPilot AI — i18n Implementation

This document describes the internationalization (i18n) setup and implementation within the CareerPilot AI frontend module.

## Current Status

The i18n infrastructure is fully integrated into the frontend and supports two locales:

- `ru` - Russian (default locale);
- `en` - English (additional locale).

This is frontend-level localization. Domain data, API responses, user-generated content (e.g., specific vacancy titles, company names), and technical identifiers are not translated dynamically.

## Tech Stack

- `i18next`
- `react-i18next`
- React context integration via `I18nextProvider`
- Locale persistence stored inside browser's `localStorage`

## Core Directory Structure

```text
frontend/src/i18n/
|-- index.ts
`-- locales/
    |-- ru.json
    `-- en.json

frontend/src/components/
`-- LanguageSwitcher.tsx
```

## Chosen Locale Storage

The active locale is stored inside `localStorage` under the following key:

```text
careerpilot_language
```

Supported values:

```text
ru
en
```

## Application Bootstrapping

`frontend/src/App.tsx` configures the i18n provider via `I18nextProvider` wrapping the DOM tree. Components can easily fetch translations using the `useTranslation()` hook.

Example:

```typescript
import { useTranslation } from 'react-i18next'

export function SaveButton() {
  const { t } = useTranslation()
  return <button>{t('common.save')}</button>
}
```

## Translation Keys Structure

Locale translation files group strings by logical UI namespaces:

```json
{
  "common": {},
  "navigation": {},
  "landing": {},
  "auth": {},
  "dashboard": {},
  "applications": {},
  "vacancies": {},
  "companies": {},
  "settings": {},
  "forms": {},
  "messages": {}
}
```

Technical keys remain in English as they act as immutable backend identifiers.

## What is Localized

- Sidebar & topbar navigation labels;
- Auth pages (login, registration, password recovery);
- Marketing landing page;
- Dashboard widget labels and summaries;
- Vacancies section (lists, details, forms);
- Kanban application board (stages, cards, timelines);
- Companies section;
- AI Assistant utility workspace and history;
- Visual charts and analytics views;
- System settings & integrations;
- Common interactive buttons, loading skeletons, empty states, and validation warnings.

## What is NOT Translated

- API Endpoint paths;
- DTO, enum, and type schemas;
- Package, class, and method names;
- Env configurations (e.g., `VITE_API_BASE_URL`);
- RAW API response payloads;
- User-provided data (e.g., typed resume bullet-points, vacancy notes);
- Backend domain values (e.g., `ApplicationStatus` or `AiResultType`).

## How to Add New Translations

1. Define your new key-value pair inside `frontend/src/i18n/locales/ru.json`.
2. Map the corresponding translated key-value pair inside `frontend/src/i18n/locales/en.json`.
3. Invoke `{t('namespace.key')}` inside your React component.
4. Verify code cleanliness with `npm run lint` and `npm run build`.

## Known Limitations

- No automatic tooling exists to detect missing translation keys in either locale file.
- Date and number localized formatting is applied component-by-component, not via a central utility wrapper.
- New views/pages require developer self-discipline to supply translations in both JSON locale files.
- The backend does not supply translated catalog values; only client-side UI shells are fully localized.
