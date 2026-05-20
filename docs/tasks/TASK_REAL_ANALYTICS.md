# Task: Real Analytics Refinement (Skill Gaps & Performance Metrics)

## Контекст и цель
Текущая реализация аналитики в `AnalyticsServiceImpl` содержит захардкоженные (mock) данные для блока "Пробелы в навыках" (Skill Gaps) и некоторых KPI (среднее время до собеседования). Задача — реализовать расчет этих метрик на основе реальных данных пользователя: его профиля (скиллов) и вакансий, на которые он откликался.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V18__add_first_interview_at_to_applications.sql` — миграция для отслеживания времени первого контакта.

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/entity/ApplicationEntity.java` — добавить поле `first_interview_at`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/service/ApplicationServiceImpl.java` — логика фиксации времени первого интервью.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/analytics/service/AnalyticsServiceImpl.java` — основная логика расчета реальных метрик.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/repository/ProfileRepository.java` — (убедиться в наличии метода `findByUserId`).

## Backend: точная реализация

### Flyway миграция (V18)
```sql
ALTER TABLE careerpilot.applications 
ADD COLUMN first_interview_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN careerpilot.applications.first_interview_at IS 'Timestamp of the first transition to an interview status (HR_SCREEN, TECH_INTERVIEW, etc.)';
```

### Entity: ApplicationEntity
Добавить поле:
```java
@Column(name = "first_interview_at")
private Instant firstInterviewAt;
```

### Service: ApplicationServiceImpl (Метод updateStatus)
При переходе в статус интервью впервые, записывать время:
```java
@Override
@Transactional
public ApplicationResponse updateStatus(UUID id, UpdateApplicationStatusRequest request) {
    ApplicationEntity entity = findOwnedApplication(id);
    ApplicationStatus newStatus = mapStatusFromFrontend(request.status());
    
    // Если статус становится "интервью" и это происходит впервые
    if (isInterviewStatus(newStatus) && entity.getFirstInterviewAt() == null) {
        entity.setFirstInterviewAt(Instant.now());
    }
    
    entity.setStatus(newStatus);
    return toResponse(applicationRepository.save(entity));
}

private boolean isInterviewStatus(ApplicationStatus status) {
    return status == ApplicationStatus.HR_SCREEN 
        || status == ApplicationStatus.TECH_INTERVIEW 
        || status == ApplicationStatus.FINAL 
        || status == ApplicationStatus.OFFER;
}
```
*Примечание: также добавить аналогичную проверку в метод `create`, если пользователь сразу создает отклик в статусе интервью.*

### Service: AnalyticsServiceImpl (Метод summary)

**Логика Skill Gaps:**
1. Получить `ProfileEntity` текущего пользователя -> извлечь `List<String> userSkills`.
2. Получить все `ApplicationEntity` пользователя (включая Lazy загрузку вакансий и их тегов).
3. Собрать все `VacancyTagEntity` из всех вакансий, на которые есть отклики (кроме статуса SAVED).
4. Подсчитать частоту каждого тега (`Map<String, Integer> tagFrequency`).
5. Для каждого тега определить `hasSkill = userSkills.contains(tag)`.
6. Сформировать список `SkillGapItem`, отсортировать по `frequency` DESC, взять топ 10.

**Логика Performance Metrics:**
1. `avgTimeToInterview`: 
   - Найти все `applications`, где `firstInterviewAt != null` и `appliedAt != null`.
   - Вычислить `Duration` между `appliedAt` и `firstInterviewAt`.
   - Вернуть среднее значение в днях. Если данных нет — вернуть `0.0`.
2. `responseRate`:
   - Считать "ответом" любой статус отличный от `NEW` и `SAVED`.
   - `respondedCount / totalApplications`.

## Frontend: точная реализация
Изменения в коде фронтенда не требуются, так как структура `AnalyticsSummaryResponse` остается неизменной согласно `docs/FRONTEND_BACKEND_CONTRACT.md`. Однако, нужно убедиться, что `AnalyticsPage.tsx` корректно отображает список, если он станет длиннее или короче 3 элементов.

## i18n ключи
Уже существуют в `ru.json` и `en.json` (секция `analytics`). Дополнительные не требуются.

## Порядок реализации для SWE-1.6
1. Создать и применить миграцию `V18`.
2. Обновить `ApplicationEntity` и `ApplicationServiceImpl` для фиксации `firstInterviewAt`.
3. В `AnalyticsServiceImpl` внедрить `ProfileRepository` и `VacancyRepository` (если нужно для запросов).
4. Переписать метод `summary()` в `AnalyticsServiceImpl`:
    - Реализовать расчет `skillGaps` через Stream API (группировка тегов вакансий).
    - Реализовать расчет `avgTimeToInterview` через разницу `firstInterviewAt` и `appliedAt`.
    - Реализовать расчет `responseRate` и `interviewRate` на основе реальных счетчиков.
5. Проверить unit-тесты: `AnalyticsServiceImplTest`. Если их нет — создать базовый тест для проверки логики маппинга скиллов.
6. Выполнить `clean compile` бэкенда и запустить для проверки.

## Риски и что проверить
- **Null Safety**: `appliedAt` или `firstInterviewAt` могут быть null. Использовать `Optional` или проверки.
- **Performance**: Если у пользователя сотни откликов, расчет скиллов через Stream API в памяти допустим. Если тысячи — может потребоваться нативный SQL запрос. Для MVP текущий подход OK.
- **Case Sensitivity**: При сравнении скиллов из профиля и тегов вакансий приводить всё к `toLowerCase()` для надежности.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="AnalyticsServiceImplTest,ApplicationServiceImplTest"`
**Frontend:** `npm run build` (для очистки совести)
**Manual:** Зайти в Analytics после того как: 
1. Добавлена вакансия с тегом "Java".
2. В профиле НЕТ скилла "Java".
3. Создан отклик на эту вакансию.
-> В блоке "Пробелы в навыках" должен появиться "Java" с `hasSkill: false`.
