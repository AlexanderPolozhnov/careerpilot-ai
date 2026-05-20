# Task: Add Restore from Archive Button

## Контекст и цель
Необходимо добавить возможность возврата вакансии из архива в активное состояние. Это включает реализацию бэкенд эндпоинта `PATCH /api/vacancies/{id}/restore` и кнопки "Из архива" на странице просмотра вакансии.

## Затрагиваемые файлы

### Backend
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/service/VacancyService.java` — добавить метод `restore`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/service/VacancyServiceImpl.java` — реализовать логику (установка статуса `ACTIVE`).
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/controller/VacancyController.java` — добавить эндпоинт `PATCH /{id}/restore`.

### Frontend
- `frontend/src/services/vacancy.service.ts` — добавить метод `restore`.
- `frontend/src/pages/VacancyDetailPage.tsx` — добавить кнопку и мутацию.
- `frontend/src/i18n/locales/ru.json` — добавить переводы.
- `frontend/src/i18n/locales/en.json` — добавить переводы.

## Backend: точная реализация

### Service
**`VacancyServiceImpl.java`**
```java
    @Override
    @Transactional
    public VacancyDto restore(UUID id) {
        VacancyEntity entity = findOwnedVacancy(id);
        entity.setStatus(VacancyStatus.ACTIVE);
        return vacancyMapper.toDto(vacancyRepository.save(entity));
    }
```

### Controller
**`VacancyController.java`**
```java
    @PatchMapping("/{id}/restore")
    @Auditable(action = "VACANCY_RESTORE", entityType = "VACANCY")
    public VacancyDto restore(@PathVariable UUID id) {
        return service.restore(id);
    }
```

## Frontend: точная реализация

### Service
**`vacancy.service.ts`**
```typescript
  restore: (id: string): Promise<Vacancy> =>
    USE_MOCKS
      ? vacancyService.getById(id).then((v) => ({
          ...v,
          status: 'ACTIVE',
          updatedAt: new Date().toISOString(),
        }))
      : api.patch<Vacancy>(`/vacancies/${id}/restore`, {}),
```

### UI: VacancyDetailPage.tsx
Добавить кнопку в секцию `Action buttons`:
```tsx
                            {vacancy.status === 'ARCHIVED' && (
                                <button
                                    type="button"
                                    onClick={() => restoreMutation.mutate(vacancy.id)}
                                    disabled={restoreMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-200"
                                >
                                    <ArrowPathIcon className="w-4 h-4" />
                                    {t('vacancies.restore')}
                                </button>
                            )}
```
*Примечание: Нужно будет добавить иконку `ArrowPathIcon`.*

## i18n Локализация

### `ru.json`
```json
    "restore": "Из архива",
    "vacancyRestored": "Вакансия возвращена из архива.",
    "vacancyRestoreFailed": "Не удалось вернуть вакансию из архива",
```

### `en.json`
```json
    "restore": "Restore",
    "vacancyRestored": "Vacancy restored from archive.",
    "vacancyRestoreFailed": "Failed to restore vacancy",
```

## Порядок реализации
1. Backend: Service interface, Implementation, Controller.
2. Frontend: Service method.
3. Frontend: Translations.
4. Frontend: UI component (icon, mutation, button).
5. Verification (Build/Tests).
