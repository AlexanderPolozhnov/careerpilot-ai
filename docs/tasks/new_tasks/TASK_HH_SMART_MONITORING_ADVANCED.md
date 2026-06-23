# Task: Расширенный автопоиск вакансий hh.ru (Дополнительные фильтры и интервалы)

## Контекст и цель
Пользователю необходимо расширить возможности умного автопоиска вакансий на hh.ru за счет добавления дополнительных фильтров (опыт работы, тип занятости, график, регион, только с ЗП) и индивидуального выбора интервала опроса для каждого фильтра. Также необходимо улучшить ИИ-матчер, сделав его промпт более гибким (лояльность к разнице в опыте, образовании и формулировкам стека), переработать интерфейс модального окна добавления фильтра в соответствии с дизайн-системой проекта и внедрить скроллируемый контейнер для полей с фиксированными кнопками действий.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V33__add_extra_vacancy_filters_columns.sql` — миграция для добавления дополнительных колонок фильтров и интервала в таблицу `user_vacancy_filters`.

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/entity/VacancyFilterEntity.java` — добавить новые поля.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/request/VacancyFilterRequest.java` — добавить новые поля в Record.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/response/VacancyFilterResponse.java` — добавить новые поля в Record.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/mapper/VacancyFilterMapper.java` — проверить маппинг MapStruct.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/service/VacancyFilterServiceImpl.java` — инициализировать новые поля при создании/обновлении.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/service/HhVacancyPollingService.java` — обновить планировщик (запуск раз в 5 минут, проверка интервалов каждого фильтра, передача дополнительных query-параметров в hh.ru API, гибкий LLM промпт).
- `frontend/src/types/index.ts` — обновить интерфейс `VacancyFilter`.
- `frontend/src/services/monitoring.service.ts` — обновить типы данных в методах `createFilter` и `updateFilter`.
- `frontend/src/pages/settings/MonitoringSettingsPage.tsx` — обновить верстку страницы, стиль модалки (дизайн `ResumeForm`, скроллинг полей с фиксированным хедером/футером), внедрить кастомный Toggle (как в настройках уведомлений), добавить поля в форму и локализацию.
- `frontend/src/i18n/locales/ru.json` и `en.json` — добавить переводы для новых полей и опций фильтров.

---

## Backend: точная реализация

### Flyway миграция (`V33__add_extra_vacancy_filters_columns.sql`)
```sql
ALTER TABLE careerpilot.user_vacancy_filters
ADD COLUMN experience VARCHAR(50) NULL,
ADD COLUMN employment VARCHAR(50) NULL,
ADD COLUMN schedule VARCHAR(50) NULL,
ADD COLUMN area VARCHAR(50) NULL,
ADD COLUMN only_with_salary BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN polling_interval INT NOT NULL DEFAULT 30;
```

### Entity (`VacancyFilterEntity.java`)
Добавить поля:
```java
    @Column(name = "experience", length = 50)
    private String experience;

    @Column(name = "employment", length = 50)
    private String employment;

    @Column(name = "schedule", length = 50)
    private String schedule;

    @Column(name = "area", length = 50)
    private String area;

    @Column(name = "only_with_salary", nullable = false)
    private Boolean onlyWithSalary = false;

    @Column(name = "polling_interval", nullable = false)
    private Integer pollingInterval = 30;
```

### DTOs
**VacancyFilterRequest.java:**
```java
public record VacancyFilterRequest(
        @NotBlank(message = "Search query is required")
        @Size(max = 256, message = "Search query must not exceed 256 characters")
        String searchQuery,

        Integer targetSalary,
        Boolean isActive,
        String experience,
        String employment,
        String schedule,
        String area,
        Boolean onlyWithSalary,
        Integer pollingInterval
) {}
```

**VacancyFilterResponse.java:**
```java
public record VacancyFilterResponse(
        UUID id,
        UUID userId,
        String searchQuery,
        Integer targetSalary,
        Boolean isActive,
        Instant lastPolledAt,
        Instant createdAt,
        Instant updatedAt,
        String experience,
        String employment,
        String schedule,
        String area,
        Boolean onlyWithSalary,
        Integer pollingInterval
) {}
```

### Service (`VacancyFilterServiceImpl.java`)
В методах `createFilter` и `updateFilter` убедиться, что MapStruct корректно копирует новые поля из Request в Entity. Для `pollingInterval` и `onlyWithSalary` при создании сделать fallback-инициализацию дефолтными значениями, если они равны `null` в Request:
```java
        if (request.pollingInterval() == null) {
            entity.setPollingInterval(30);
        }
        if (request.onlyWithSalary() == null) {
            entity.setOnlyWithSalary(false);
        }
```

### Polling & AI Matching (`HhVacancyPollingService.java`)
1. Изменить расписание `@Scheduled(fixedRate = 300000)` (запуск каждые 5 минут).
2. В методе `pollVacancies` считывать все активные фильтры:
```java
    @Scheduled(fixedRate = 300000) // Раз в 5 минут
    public void pollVacancies() {
        log.info("HhVacancyPollingService starting polling cycle...");
        try {
            List<VacancyFilterEntity> activeFilters = vacancyFilterRepository.findByIsActiveTrue();
            log.info("Found {} active vacancy filters for polling", activeFilters.size());

            for (VacancyFilterEntity filter : activeFilters) {
                try {
                    // Проверяем индивидуальный интервал опроса
                    Instant lastPolled = filter.getLastPolledAt();
                    Integer intervalMin = filter.getPollingInterval() != null ? filter.getPollingInterval() : 30;
                    if (lastPolled != null) {
                        Instant nextPollTime = lastPolled.plus(java.time.Duration.ofMinutes(intervalMin));
                        if (Instant.now().isBefore(nextPollTime)) {
                            continue; // Время опроса для данного фильтра еще не подошло
                        }
                    }
                    processFilter(filter);
                } catch (Exception e) {
                    log.error("Error processing vacancy filter id={}", filter.getId(), e);
                }
            }
        } catch (Exception e) {
            log.error("Error in pollVacancies scheduler cycle", e);
        }
        log.info("HhVacancyPollingService polling cycle finished.");
    }
```
3. В методе `processFilter` добавлять новые query-параметры к URI запроса в hh.ru:
```java
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("text", filter.getSearchQuery())
                .queryParam("period", 1)
                .queryParam("per_page", 10);

        if (filter.getTargetSalary() != null) {
            uriBuilder.queryParam("salary", filter.getTargetSalary());
        }
        if (filter.getExperience() != null && !filter.getExperience().isBlank()) {
            uriBuilder.queryParam("experience", filter.getExperience());
        }
        if (filter.getEmployment() != null && !filter.getEmployment().isBlank()) {
            uriBuilder.queryParam("employment", filter.getEmployment());
        }
        if (filter.getSchedule() != null && !filter.getSchedule().isBlank()) {
            uriBuilder.queryParam("schedule", filter.getSchedule());
        }
        if (filter.getArea() != null && !filter.getArea().isBlank()) {
            uriBuilder.queryParam("area", filter.getArea());
        }
        if (Boolean.TRUE.equals(filter.getOnlyWithSalary())) {
            uriBuilder.queryParam("only_with_salary", true);
        }
```
4. Обновить ИИ-промпт в методе `buildPrompt` для повышения лояльности матчера к деталям резюме:
```java
    private String buildPrompt(UserResumeEntity resume, String vacancyTitle, String vacancyDescription) {
        return "You are an AI Job Search Assistant. Compare the candidate's resume with the vacancy description.\n" +
                "Evaluate if the match is greater than 80% based on skills, experience, and requirements.\n" +
                "Apply the following evaluation leniency rules:\n" +
                "1. Job Title Match: Do not require strict title matches (e.g., 'Middle React Developer' should match well with 'Frontend Developer' if tech stack matches).\n" +
                "2. Experience Leniency: Be flexible with experience years. If vacancy requires 3 years, and candidate has 2 or 2.5 years, do not reject solely because of this.\n" +
                "3. Education: Ignore strict higher education requirements (university degree) unless it is a highly regulated medical/legal field.\n" +
                "4. Tech Stack: Focus on core technologies. If candidate knows React and TypeScript, but vacancy also lists Redux/Next.js (which candidate can easily learn), do not reject.\n" +
                "5. Overall Fit: If candidate's skills align well with the vacancy's day-to-day responsibilities, consider it a match.\n\n" +
                "If the match is > 80%, generate a tailored cover letter using the candidate's Cover Letter Template (fill in details or adjust tone to fit this vacancy).\n" +
                "If the match is <= 80%, set isMatch to false.\n\n" +
                "Candidate Resume Text:\n" +
                resume.getRawText() + "\n\n" +
                "Cover Letter Template (adjust/complete this template if matched):\n" +
                (resume.getCoverLetterTemplate() != null ? resume.getCoverLetterTemplate() : "") + "\n\n" +
                "Vacancy Title: " + vacancyTitle + "\n" +
                "Vacancy Description:\n" +
                vacancyDescription + "\n\n" +
                "You must return response STRICTLY as a JSON object, without any markdown formatting or surrounding text. Format:\n" +
                "{\n" +
                "  \"isMatch\": boolean,\n" +
                "  \"coverLetter\": \"string (generated cover letter, or empty string if not matched)\"\n" +
                "}";
    }
```

---

## Frontend: точная реализация

### TypeScript типы (`types/index.ts`)
Обновить интерфейс `VacancyFilter`:
```typescript
export interface VacancyFilter {
  id: string
  userId: string
  searchQuery: string
  targetSalary: number | null
  isActive: boolean
  lastPolledAt?: string
  createdAt: string
  updatedAt: string
  experience?: string
  employment?: string
  schedule?: string
  area?: string
  onlyWithSalary?: boolean
  pollingInterval?: number
}
```

### Services (`monitoring.service.ts`)
Обновить сигнатуры `createFilter` и `updateFilter` для поддержки новых полей:
```typescript
  createFilter: (data: {
    searchQuery: string
    targetSalary?: number | null
    experience?: string
    employment?: string
    schedule?: string
    area?: string
    onlyWithSalary?: boolean
    pollingInterval?: number
  }): Promise<VacancyFilter>
```
И соответственно `updateFilter`. При `USE_MOCKS = true` возвращать поля в мок-объектах.

### Локализация (`ru.json` / `en.json`)
Добавить переводы для новых полей формы и списков фильтров:
```json
  "settings.monitoring.experience": "Опыт работы",
  "settings.monitoring.experience.noExperience": "Нет опыта",
  "settings.monitoring.experience.between1And3": "От 1 года до 3 лет",
  "settings.monitoring.experience.between3And6": "От 3 до 6 лет",
  "settings.monitoring.experience.moreThan6": "Более 6 лет",
  "settings.monitoring.employment": "Тип занятости",
  "settings.monitoring.employment.full": "Полная занятость",
  "settings.monitoring.employment.part": "Частичная занятость",
  "settings.monitoring.employment.project": "Проектная работа",
  "settings.monitoring.employment.volunteer": "Волонтерство",
  "settings.monitoring.employment.probation": "Стажировка",
  "settings.monitoring.schedule": "График работы",
  "settings.monitoring.schedule.fullDay": "Полный день",
  "settings.monitoring.schedule.shift": "Сменный график",
  "settings.monitoring.schedule.flexible": "Гибкий график",
  "settings.monitoring.schedule.remote": "Удаленная работа",
  "settings.monitoring.schedule.flyInFlyOut": "Вахтовый метод",
  "settings.monitoring.area": "Регион / Город",
  "settings.monitoring.area.any": "Любой регион",
  "settings.monitoring.onlyWithSalary": "Только с указанием зарплаты",
  "settings.monitoring.pollingInterval": "Интервал опроса",
  "settings.monitoring.pollingInterval.min15": "15 минут",
  "settings.monitoring.pollingInterval.min30": "30 минут (по умолчанию)",
  "settings.monitoring.pollingInterval.hour1": "1 час",
  "settings.monitoring.pollingInterval.hour2": "2 часа",
  "settings.monitoring.pollingInterval.hour4": "4 часа",
  "settings.monitoring.pollingInterval.hour12": "12 часов",
  "settings.monitoring.pollingInterval.day1": "24 часа"
```

### Форма и UI (`MonitoringSettingsPage.tsx`)
1. **Toggle переключатель:** Объявить или импортировать такой же компонент `Toggle`, как в [SettingsPage.tsx](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/frontend/src/pages/SettingsPage.tsx#L120-L146) для замены старого белого кружка в карточках вакансий.
2. **Модальное окно:** 
   - Заменить верстку модалки на `flex flex-col max-h-[85vh]` с фиксированным хедером (`border-b`), скроллируемым телом формы (`p-6 space-y-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden`) и фиксированным футером с кнопками Отмена и Создать (`border-t p-6 bg-gray-950 rounded-b-2xl`).
   - Использовать стили из дизайн-системы: `.text-xs.text-ink-dim` для лабелей, `.input.mt-1` для текстовых полей и селекторов, `.btn-primary` и `.btn-secondary` для управляющих кнопок.
3. **Поля формы:**
   - **Поисковый запрос** (searchQuery, * обязательный).
   - **Зарплата** (targetSalary, число).
   - **Опыт работы** (experience, `select` с опциями).
   - **Занятость** (employment, `select` с опциями).
   - **График работы** (schedule, `select` с опциями).
   - **Регион / Город** (area, `select` с популярными городами РФ: Москва (1), Санкт-Петербург (2), Новосибирск (4), Екатеринбург (3), Нижний Новгород (66), Казань (88), Краснодар (1438)).
   - **Только с указанной ЗП** (onlyWithSalary, чекбокс `type="checkbox" className="w-4 h-4 rounded border-white/20bg-white/5 text-violet-500"`).
   - **Интервал опроса** (pollingInterval, `select` с опциями: 15, 30, 60, 120, 240, 720, 1440 минут).

---

## Порядок реализации для агента реализации
1. [x] **Flyway миграция:** Создать файл `V33__add_extra_vacancy_filters_columns.sql`. Запустить бэкенд для проверки выполнения миграции.
2. [x] **Entities & Mappers:** Обновить `VacancyFilterEntity` и маппер `VacancyFilterMapper`.
3. [x] **DTOs & Controllers:** Обновить DTO-классы `VacancyFilterRequest` и `VacancyFilterResponse`.
4. [x] **Service Implementation:** Обновить логику сохранения фильтра в `VacancyFilterServiceImpl`.
5. [x] **Background Polling:** Обновить интервал `@Scheduled` в `HhVacancyPollingService` на 5 минут. Реализовать проверку `pollingInterval` и передачу параметров в запросах к hh.ru. Внедрить гибкий промпт для LLM.
6. [x] **Frontend Types:** Добавить новые поля в интерфейсы в `types/index.ts`.
7. [x] **Frontend Service:** Обновить `monitoring.service.ts` для отправки новых полей.
8. [x] **UI & Form styling:** Обновить `MonitoringSettingsPage.tsx`:
   - Заменить кружок на системный тоггл `Toggle`.
   - Переделать модалку (скроллинг, фиксированные хедер/футер, дизайн-системные классы).
   - Добавить все новые поля формы.
9. [x] **Локализация:** Добавить переводы в файлы локализации `ru.json` и `en.json`.
10. [x] **Проверка:** Запустить `.\verify-all.ps1` для полной валидации сборки, линтинга и тестов.

---

## Риски и что проверить
- **Ограничения API hh.ru (IP ban):** Слишком частый запуск планировщика (раз в 5 минут) в сочетании с большим количеством пользователей может превысить лимиты. Убедиться, что паузы `Thread.sleep(1500)` между запросами к вакансиям соблюдаются.
- **Взаимная интеграция LLM:** Убедиться, что обновленный промпт по-прежнему возвращает валидный JSON, который Jackson десериализует в `LlmMatchResult`.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="VacancyFilterServiceImplTest"` (при добавлении тестов) или общая сборка `.\mvnw.cmd clean compile -DskipTests`.
**Frontend:** `pnpm run build` в папке `frontend`.
**End-to-End:** `.\verify-all.ps1` в корне проекта.
