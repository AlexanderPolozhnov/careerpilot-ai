# Task: Fix Vacancy Date Deserialization Error (500)

## Контекст и цель
При добавлении вакансии возникает ошибка 500 на бэкенде. Логи показывают `HttpMessageNotReadableException`: Jackson не может десериализовать строку `2026-05-20` (формат `YYYY-MM-DD` из HTML `type="date"`) в тип `java.time.Instant`. 
Цель — изменить типы данных в Request DTO на `LocalDate` для совместимости с фронтендом и обеспечить корректное отображение дат при редактировании.

## Затрагиваемые файлы

### Backend
- `com.alexanderpolozhnov.careerpilot.vacancy.dto.CreateVacancyDto` — изменить `Instant` на `LocalDate`.
- `com.alexanderpolozhnov.careerpilot.vacancy.dto.UpdateVacancyDto` — изменить `Instant` на `LocalDate`.
- `com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest` — изменить `Instant` на `LocalDate`.
- `com.alexanderpolozhnov.careerpilot.vacancy.service.VacancyServiceImpl` — добавить конвертацию `LocalDate` в `Instant`.
- `com.alexanderpolozhnov.careerpilot.application.service.ApplicationServiceImpl` — добавить конвертацию `LocalDate` в `Instant`.

### Frontend
- `frontend/src/components/VacancyForm.tsx` — добавить трансформацию ISO даты в формат `YYYY-MM-DD` для `defaultValues`.

## Backend: точная реализация

### CreateVacancyDto.java
```java
// Изменить поле
LocalDate deadline
```

### UpdateVacancyDto.java
```java
// Изменить поле
LocalDate deadline
```

### ApplicationRequest.java
```java
// Изменить поле
LocalDate appliedAt
```

### VacancyServiceImpl.java
В методах `create` и `update`:
```java
// Для create
entity.setDeadline(request.deadline() != null ? request.deadline().atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null);

// Для update
if (request.deadline() != null) {
    entity.setDeadline(request.deadline().atStartOfDay(java.time.ZoneOffset.UTC).toInstant());
}
```

### ApplicationServiceImpl.java
В методах `create` и `update`:
```java
// Для create
entity.setAppliedAt(request.appliedAt() != null ? request.appliedAt().atStartOfDay(java.time.ZoneOffset.UTC).toInstant() : null);

// Для update
if (request.appliedAt() != null) {
    entity.setAppliedAt(request.appliedAt().atStartOfDay(java.time.ZoneOffset.UTC).toInstant());
}
```

## Frontend: точная реализация

### VacancyForm.tsx
Обновить инициализацию формы:
```tsx
  const form = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema) as unknown as Resolver<VacancyFormValues>,
    defaultValues: useMemo(() => ({
      remote: 'REMOTE',
      contractType: 'FULL_TIME',
      salaryCurrency: 'USD',
      ...initialValues,
      deadline: initialValues?.deadline ? initialValues.deadline.slice(0, 10) : undefined,
    }), [initialValues]),
  })
```
Не забудьте импортировать `useMemo` из `react`.

## Порядок реализации для SWE-1.6
1. Изменить типы полей в DTO на бэкенде (`CreateVacancyDto`, `UpdateVacancyDto`, `ApplicationRequest`).
2. Обновить бизнес-логику в сервисах (`VacancyServiceImpl`, `ApplicationServiceImpl`) для конвертации `LocalDate` -> `Instant`.
3. Исправить `VacancyForm.tsx` для поддержки отображения дат при редактировании.
4. Проверить компиляцию бэкенда и сборку фронтенда.

## Риски и что проверить
- Убедиться, что импортированы правильные пакеты (`java.time.LocalDate`, `java.time.ZoneOffset`).
- Проверить, что в `VacancyForm.tsx` импортирован `useMemo`.
- Проверить, что при пустой дате (null) конвертация не падает.

## Проверки после реализации
**Backend:** `.\mvnw.cmd clean compile`
**Frontend:** `cd frontend && npm.cmd run build`
