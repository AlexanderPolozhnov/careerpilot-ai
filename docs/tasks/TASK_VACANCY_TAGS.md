# Task: Добавление поддержки тегов при создании и редактировании вакансий

## Контекст и цель
Текущая реализация Analytics рассчитывает "пробелы в навыках" на основе тегов вакансий, но в UI создания/редактирования вакансии поле для ввода тегов отсутствует. Необходимо добавить текстовое поле "Теги" в форму вакансии, где пользователь сможет вводить навыки через запятую (например, "Java, Spring, SQL"). Эти теги должны сохраняться в БД и отображаться в аналитике.

## Затрагиваемые файлы

### Изменить существующие
- `frontend/src/components/VacancyForm.tsx` — добавить поле тегов в схему и форму
- `frontend/src/pages/VacanciesPage.tsx` — преобразовать строку тегов в массив при создании
- `frontend/src/pages/VacancyDetailPage.tsx` — преобразовать строку тегов в массив при обновлении и обратно при инициализации формы

## Backend: точная реализация
*Backend уже поддерживает теги через `tagIds` в `CreateVacancyDto` и `UpdateVacancyDto`, а также имеет логику `replaceTags` в `VacancyServiceImpl`. Изменения на бэкенде не требуются.*

## Frontend: точная реализация

### TypeScript типы (types/)
В `frontend/src/types/index.ts` типы `Vacancy` и `VacancyTag` уже определены корректно.

### API-функция (services/vacancy.service.ts)
Интерфейсы `CreateVacancyDto` и функции `create`/`update` уже поддерживают `tagIds: string[]`.

### Компонент: VacancyForm.tsx
1.  **Схема валидации (`getVacancySchema`)**:
    Добавить поле `tags`:
    ```typescript
    tags: z.string().optional(),
    ```
2.  **Default Values**:
    Убедиться, что `tags` инициализируется пустой строкой, если не передан в `initialValues`.
3.  **Рендеринг**:
    Добавить поле ввода после `description`:
    ```tsx
    <div>
      <label htmlFor="tags" className="text-xs text-ink-dim">{t('vacancies.form.tags')}</label>
      <input 
        id="tags" 
        {...form.register('tags')} 
        className="input mt-1" 
        placeholder={t('settings.skillsPlaceholder')} 
      />
      <p className="text-[10px] text-ink-dim/50 mt-1">{t('settings.skillsHint')}</p>
    </div>
    ```

### Страница: VacanciesPage.tsx
В `createMutation.mutationFn`:
```typescript
mutationFn: (values: VacancyFormValues) => {
  const { tags, ...rest } = values;
  const tagIds = tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : [];
  return vacancyService.create({ ...rest, tagIds });
},
```

### Страница: VacancyDetailPage.tsx
1.  **`initialFormValues`**:
    Добавить маппинг существующих тегов в строку:
    ```typescript
    tags: vacancy.tags?.map(t => t.label).join(', ') ?? '',
    ```
2.  **`updateMutation.mutationFn`**:
    Преобразовать строку обратно в массив:
    ```typescript
    mutationFn: (values: VacancyFormValues) => {
      const { tags, ...rest } = values;
      const tagIds = tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : [];
      return vacancyService.update(id as string, { ...rest, tagIds });
    },
    ```

## Порядок реализации для SWE-1.6
1.  Обновить `frontend/src/components/VacancyForm.tsx`: добавить `tags` в `zod` схему и отрисовать `input`.
2.  Обновить `frontend/src/pages/VacanciesPage.tsx`: добавить логику `split(',')` в мутацию создания.
3.  Обновить `frontend/src/pages/VacancyDetailPage.tsx`: 
    - Добавить логику `join(', ')` в `initialFormValues`.
    - Добавить логику `split(',')` в мутацию обновления.
4.  Проверить визуальное отображение и корректность сохранения тегов.

## Риски и что проверить
- **Пустые теги**: проверить, что ввод пробелов или лишних запятых ("Java, , SQL") корректно фильтруется (`filter(Boolean)`).
- **Регистр**: теги на бэкенде сравниваются в lowercase в аналитике, фронтенд должен передавать как ввел пользователь, бэкенд нормализует.
- **Отображение**: убедиться, что теги видны в списке вакансий (в `VacanciesPage` уже есть `v.tags.slice(0, 2).map(...)`).

## Проверки после реализации
**Frontend build:** `cd frontend && npm.cmd run build`
**Ручная проверка:**
1. Создать вакансию с тегами "Java, Spring".
2. Открыть детали вакансии, убедиться, что теги отображаются.
3. Нажать "Редактировать", убедиться, что в поле тегов стоит "Java, Spring".
4. Изменить на "Java, Spring, Hibernate", сохранить.
5. Проверить в Analytics, что "Java", "Spring" и "Hibernate" появились в блоке "Skill Gaps".
