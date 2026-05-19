# Task: Global Search Implementation (v0.3.5)

## Контекст и цель
На данный момент поиск реализован локально на некоторых страницах (Вакансии, Компании, Задачи). Глобальный поиск в `Topbar` был удален, так как он являлся заглушкой. 
Цель: реализовать единый эндпоинт для поиска по всем основным сущностям (Вакансии, Компании, Задачи, Собеседования) и внедрить полноценный UI глобального поиска в хедер с поддержкой горячих клавиш (Cmd+K / Ctrl+K).

## Затрагиваемые файлы

### Backend: Создать новые
- `com.alexanderpolozhnov.careerpilot.search.controller.SearchController` — эндпоинт `/api/search`
- `com.alexanderpolozhnov.careerpilot.search.service.SearchService` — интерфейс поиска
- `com.alexanderpolozhnov.careerpilot.search.service.SearchServiceImpl` — реализация агрегации результатов
- `com.alexanderpolozhnov.careerpilot.search.dto.SearchResponseDto` — обертка ответа
- `com.alexanderpolozhnov.careerpilot.search.dto.SearchItemDto` — элемент результата
- `com.alexanderpolozhnov.careerpilot.search.dto.SearchItemType` — enum (VACANCY, COMPANY, TASK, INTERVIEW)

### Frontend: Создать новые
- `src/services/search.service.ts` — API клиент для поиска
- `src/components/GlobalSearch.tsx` — модальное окно/выпадающий список поиска

### Frontend: Изменить существующие
- `src/components/Topbar.tsx` — добавить кнопку вызова `GlobalSearch` и логику горячих клавиш
- `src/i18n/locales/ru.json` и `en.json` — добавить переводы для поиска
- `docs/FRONTEND_BACKEND_CONTRACT.md` — добавить секцию Search

## Backend: точная реализация

### DTO
**SearchItemDto:**
```java
public record SearchItemDto(
    UUID id,
    SearchItemType type,
    String title,
    String subtitle,
    String status, // Например, статус вакансии или приоритет задачи
    String url
) {}
```

**SearchResponseDto:**
```java
public record SearchResponseDto(
    List<SearchItemDto> results
) {}
```

### SearchServiceImpl logic
1. Получить `userId` через `CurrentUserResolver`.
2. Выполнить поиск по 4 репозиториям параллельно или последовательно (объем данных небольшой, последовательно через `ILIKE` достаточно):
    - `VacancyRepository.findAllByUserIdAndTitleContainingIgnoreCase`
    - `CompanyRepository.findAllByUserIdAndNameContainingIgnoreCase`
    - `TaskRepository.findAllByUserIdAndTitleContainingIgnoreCase`
    - `InterviewRepository.findAllByApplication_User_IdAndTypeContainingIgnoreCase` (или поиск по заметкам)
3. Ограничить результаты каждой категории (например, по 5 наиболее релевантных).
4. Сформировать `SearchItemDto` для каждой найденной сущности:
    - `VACANCY`: title = title, subtitle = companyName, url = `/app/vacancies/{id}`
    - `COMPANY`: title = name, subtitle = industry, url = `/app/companies` (или детальная страница если будет)
    - `TASK`: title = title, subtitle = priority, url = `/app/tasks`
    - `INTERVIEW`: title = type, subtitle = companyName, url = `/app/interviews`
5. Вернуть агрегированный список.

## Frontend: точная реализация

### API-функция (search.service.ts)
```typescript
export const searchService = {
  globalSearch: (query: string) => api.get<SearchResponse>(`/search?q=${encodeURIComponent(query)}`)
}
```

### Компонент GlobalSearch.tsx
- Использовать `dialog` или `headlessui` (если есть) или кастомный оверлей.
- Состояния: `isOpen`, `query`, `results`, `isLoading`.
- Эффект: дебаунс поиска (300мс) через `useQuery` с `enabled: query.length > 2`.
- Стилизация: `ds-card`, `backdrop-blur`, список результатов с навигацией стрелками (опционально) и иконками типов.

### Topbar.tsx
- Добавить `useEffect` для прослушивания `keydown` (Cmd+K / Ctrl+K).
- Добавить кнопку-индикатор поиска (лупа + "⌘K").

### i18n ключи
```json
{
  "search": {
    "placeholder": "Поиск везде...",
    "noResults": "Ничего не найдено",
    "vacancies": "Вакансии",
    "companies": "Компании",
    "tasks": "Задачи",
    "interviews": "Собеседования",
    "shortcut": "⌘K"
  }
}
```

## Порядок реализации для SWE-1.6
1. **Backend DTO & Controller**: Создать базовую структуру.
2. **Backend Service**: Реализовать логику агрегации по существующим репозиториям.
3. **Frontend Service**: Добавить `search.service.ts`.
4. **GlobalSearch Component**: Создать UI оверлея.
5. **Topbar Integration**: Добавить кнопку и горячие клавиши.
6. **Contract**: Обновить документацию API.

## Риски и что проверить
- **Performance**: При большом количестве данных `ILIKE` может быть медленным. Но для персонального ассистента это не критично.
- **Security**: Строго проверять `userId` в каждом под-запросе поиска.
- **UX**: Убедиться, что клик по результату закрывает поиск и корректно переходит на нужный роут.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="SearchControllerTest"` (создать новый тест)
**Frontend:** `cd frontend && npm.cmd run build`
