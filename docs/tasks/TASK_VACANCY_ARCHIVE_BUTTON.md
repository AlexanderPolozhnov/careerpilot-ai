# Task: Add Archive Button to Vacancy View

## Контекст и цель
На странице просмотра вакансии (`VacancyDetailPage.tsx`) отсутствует кнопка "В архив", хотя бэкенд эндпоинт и метод в сервисе уже реализованы. Нужно добавить кнопку архивации рядом с кнопками редактирования и удаления.

## Затрагиваемые файлы

### Изменить существующие
- `frontend/src/pages/VacancyDetailPage.tsx` — добавить иконку, мутацию и кнопку в UI.
- `frontend/src/i18n/locales/ru.json` — добавить переводы.
- `frontend/src/i18n/locales/en.json` — добавить переводы.

## Frontend: точная реализация

### Иконка Archive
Добавить в `VacancyDetailPage.tsx`:
```tsx
function ArchiveIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
    )
}
```

### Мутация архивации
Добавить в компонент `VacancyDetailPage`:
```tsx
    const archiveMutation = useMutation({
        mutationFn: (vacancyId: string) => vacancyService.archive(vacancyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vacancies', 'detail', { id }] })
            toast.success(t('vacancies.vacancyArchived'))
        },
        onError: () => {
            toast.error(t('vacancies.vacancyArchiveFailed'))
        }
    })
```

### Кнопка в UI
Вставить перед кнопкой удаления:
```tsx
                            {vacancy.status !== 'ARCHIVED' && (
                                <button
                                    type="button"
                                    onClick={() => archiveMutation.mutate(vacancy.id)}
                                    disabled={archiveMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#8b8fa3] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[rgba(255,255,255,0.06)] hover:text-[#e8eaed] hover:border-[rgba(255,255,255,0.12)] transition-all duration-200"
                                >
                                    <ArchiveIcon className="w-4 h-4" />
                                    {t('vacancies.archive')}
                                </button>
                            )}
```

## i18n Локализация

### `ru.json`
```json
    "archive": "В архив",
    "vacancyArchived": "Вакансия перенесена в архив.",
    "vacancyArchiveFailed": "Не удалось архивировать вакансию",
```

### `en.json`
```json
    "archive": "Archive",
    "vacancyArchived": "Vacancy moved to archive.",
    "vacancyArchiveFailed": "Failed to archive vacancy",
```

## Порядок реализации
1. Добавить переводы в JSON файлы.
2. Добавить `ArchiveIcon` в `VacancyDetailPage.tsx`.
3. Добавить `archiveMutation` в `VacancyDetailPage.tsx`.
4. Добавить кнопку в секцию `Action buttons`.
5. Проверить сборку.

## Проверки после реализации
- Нажать кнопку "В архив" на странице вакансии.
- Убедиться, что появился Toast об успехе.
- Убедиться, что статус вакансии изменился на "Архивировано" (через `StatusBadge`).
- Убедиться, что кнопка "В архив" исчезла после архивации.
