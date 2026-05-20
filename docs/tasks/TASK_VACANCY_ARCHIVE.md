# Task: Vacancy Archive Endpoint

## Контекст и цель
Необходимо реализовать бэкенд эндпоинт `PATCH /api/vacancies/{id}/archive` для перевода вакансии в статус `ARCHIVED`. Это единственный оставшийся нереализованным endpoint из контракта `docs/FRONTEND_BACKEND_CONTRACT.md` для Vacancy.

## Затрагиваемые файлы

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/controller/VacancyController.java` — добавить endpoint `PATCH /{id}/archive`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/service/VacancyService.java` — добавить метод `archive(UUID id)`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/vacancy/service/VacancyServiceImpl.java` — реализовать логику смены статуса.

## Backend: точная реализация

### Controller
**`VacancyController.java`**
Добавить новый метод:
```java
    @PatchMapping("/{id}/archive")
    @Auditable(action = "VACANCY_ARCHIVE", entityType = "VACANCY")
    public VacancyDto archive(@PathVariable UUID id) {
        return service.archive(id);
    }
```

### Service
**`VacancyService.java`**
Добавить сигнатуру:
```java
    VacancyDto archive(UUID id);
```

**`VacancyServiceImpl.java`**
Реализовать метод:
```java
    @Override
    @Transactional
    public VacancyDto archive(UUID id) {
        VacancyEntity entity = findOwnedVacancy(id);
        entity.setStatus(VacancyStatus.ARCHIVED);
        return vacancyMapper.toDto(vacancyRepository.save(entity));
    }
```

### MapStruct mapper
Не требует изменений, используется существующий `vacancyMapper.toDto()`.

### Flyway миграция
Не нужна. `VacancyStatus.ARCHIVED` уже существует в Java enum, базе данных (`vacancy_status`) и CHECK constraint.

## Frontend: точная реализация
Фронтенд уже поддерживает этот функционал.
Изменения **не требуются**:
- В `frontend/src/services/vacancy.service.ts` уже есть вызов `api.patch<Vacancy>(\`/vacancies/${id}/archive\`, {})`.
- Компоненты UI (например, `StatusBadge.tsx`) уже корректно обрабатывают статус `ARCHIVED`.

## Порядок реализации для SWE-1.6
1. Изменить интерфейс `VacancyService`, добавив метод `archive`.
2. Реализовать логику `archive` в `VacancyServiceImpl`, не забыв про аннотацию `@Transactional` для корректного маппинга.
3. Добавить метод в `VacancyController` с маппингом `@PatchMapping("/{id}/archive")` и логированием `@Auditable`.

## Риски и что проверить
- Так как мы используем `vacancyMapper.toDto()`, который может обращаться к ленивым коллекциям (теги, компания), необходимо наличие `@Transactional` на методе `archive`. Это предотвратит `LazyInitializationException`.
- При вызове эндпоинта поле `status` в возвращаемом JSON должно стать `"ARCHIVED"`.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="VacancyServiceImplTest"`
**Frontend:** `npm.cmd run build` (чтобы убедиться, что ничего не сломалось).
