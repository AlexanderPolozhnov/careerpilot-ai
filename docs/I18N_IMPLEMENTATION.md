# CareerPilot AI — реализация i18n

Документ описывает текущую реализацию internationalization во frontend-модуле CareerPilot AI.

## Статус

i18n-инфраструктура уже добавлена во frontend и поддерживает два языка:

- `ru` - язык по умолчанию;
- `en` - дополнительная локаль.

Это frontend-level localization. Domain data, API responses, vacancy titles, company names и technical identifiers не переводятся автоматически.

## Стек

- `i18next`
- `react-i18next`
- React context через `I18nextProvider`
- persistence выбранного языка в `localStorage`

## Основные файлы

```text
frontend/src/i18n/
|-- index.ts
`-- locales/
    |-- ru.json
    `-- en.json

frontend/src/components/
`-- LanguageSwitcher.tsx
```

## Хранение выбранного языка

Выбранный язык сохраняется в `localStorage` под ключом:

```text
careerpilot_language
```

Поддерживаемые значения:

```text
ru
en
```

## Подключение в приложении

`frontend/src/App.tsx` подключает i18n через `I18nextProvider`, чтобы компоненты могли использовать `useTranslation()`.

Пример использования:

```typescript
import { useTranslation } from 'react-i18next'

export function SaveButton() {
  const { t } = useTranslation()
  return <button>{t('common.save')}</button>
}
```

## Структура translation keys

Locale files используют группировку по областям интерфейса:

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

Technical keys остаются на английском, потому что они используются в коде как стабильные identifiers.

## Что локализовано

- navigation labels;
- auth pages;
- landing page;
- dashboard UI labels;
- vacancies page;
- applications board;
- companies page;
- AI assistant UI;
- analytics labels;
- settings UI;
- common buttons, empty/loading/error states и validation messages.

## Что не переводится

- endpoint paths;
- DTO / enum / type names;
- package names;
- env vars вроде `VITE_API_BASE_URL`;
- backend response fields;
- vacancy/company/user-generated content;
- domain values вроде `ApplicationStatus` и `AiResultType`.

## Как добавлять новые переводы

1. Добавить ключ в `frontend/src/i18n/locales/ru.json`.
2. Добавить такой же ключ в `frontend/src/i18n/locales/en.json`.
3. Использовать `t('section.key')` в компоненте.
4. Проверить `npm run lint` и `npm run build`.

## Known limitations

- Нет автоматической проверки missing translation keys.
- Date/number formatting по locale еще не выделен в отдельный слой.
- Новые страницы требуют ручного добавления keys в оба locale files.
- Backend не возвращает локализованные справочники; frontend пока локализует только UI strings.
