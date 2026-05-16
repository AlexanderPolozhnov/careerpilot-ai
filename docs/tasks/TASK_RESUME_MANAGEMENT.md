# Task: Реализация управления резюме (Resume Management)

## Контекст и цель
Необходимо реализовать полноценный Vertical Slice для управления резюме. На текущий момент в базе данных и коде есть зачатки сущности `ResumeEntity`, но отсутствуют API, бизнес-логика и фронтенд-сервис. Резюме критически важны для работы AI-ассистента (Resume Match, Cover Letter) и для откликов на вакансии.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/repository/ResumeRepository.java` — Репозиторий
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/service/ResumeService.java` — Интерфейс сервиса
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/service/ResumeServiceImpl.java` — Реализация бизнес-логики
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/controller/ResumeController.java` — REST контроллер
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/mapper/ResumeMapper.java` — MapStruct маппер
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/request/ResumeRequest.java` — DTO для запроса
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/resume/response/ResumeResponse.java` — DTO для ответа
- `frontend/src/services/resume.service.ts` — Фронтенд сервис

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/entity/ResumeEntity.java` — Перенести в пакет `resume.entity` и переименовать поля.
- `docs/FRONTEND_BACKEND_CONTRACT.md` — Обновить статус эндпоинтов.

## Backend: точная реализация

### Entity (ResumeEntity)
Перенести в `com.alexanderpolozhnov.careerpilot.resume.entity`.
Переименовать поля для соответствия контракту:
- `title` -> `name`
- `isActive` -> `isDefault`
- `textContent` — оставить (для хранения текста резюме, если нет файла)
- `fileUrl` — оставить (ссылка на будущий S3/MinIO или внешний файл)

### Repository
```java
public interface ResumeRepository extends JpaRepository<ResumeEntity, UUID> {
    List<ResumeEntity> findAllByUserId(UUID userId);
    Optional<ResumeEntity> findByIdAndUserId(UUID id, UUID userId);
    Optional<ResumeEntity> findByUserIdAndIsDefaultTrue(UUID userId);
}
```

### Service
- `list()`: возвращает все резюме текущего пользователя.
- `create(ResumeRequest)`: создает новое резюме. Если `isDefault=true`, сбрасывает `isDefault` у остальных резюме пользователя.
- `getById(id)`: возвращает резюме с проверкой владения.
- `update(id, ResumeRequest)`: обновляет поля. Если меняется `isDefault` на `true`, сбрасывает у других.
- `setAsDefault(id)`: делает резюме дефолтным, сбрасывая остальные.
- `delete(id)`: удаляет резюме с проверкой владения.

### Controller
Base path: `/api/resumes`
- `GET /` -> `List<ResumeResponse>`
- `GET /{id}` -> `ResumeResponse`
- `POST /` -> `ResumeResponse`
- `PUT /{id}` -> `ResumeResponse`
- `PATCH /{id}/default` -> `ResumeResponse`
- `DELETE /{id}` -> `void (204)`

### Flyway миграция
Нужна миграция `V16__resumes_alignment.sql`:
```sql
ALTER TABLE careerpilot.resumes RENAME COLUMN title TO name;
ALTER TABLE careerpilot.resumes RENAME COLUMN is_active TO is_default;
```

## Frontend: точная реализация

### API-функция (services/resume.service.ts)
Реализовать методы: `list`, `getById`, `create`, `update`, `setAsDefault`, `delete`.
Поддержать `VITE_USE_MOCKS`.

### TypeScript типы (types/index.ts)
Убедиться, что `Resume` соответствует бэкенду.

## Порядок реализации для SWE-1.6
1. Создать Flyway миграцию V16.
2. Перенести и обновить `ResumeEntity`.
3. Реализовать Repository, DTO, Mapper.
4. Реализовать Service с логикой `isDefault`.
5. Реализовать Controller.
6. Добавить Unit-тесты для сервиса (особенно логику смены дефолтного резюме).
7. Реализовать фронтенд-сервис.

## Риски и что проверить
- **Конфликт дефолтных резюме**: при установке нового резюме как дефолтного, старое должно перестать им быть. Лучше делать это в рамках одной транзакции.
- **Ownership**: строго проверять `userId` во всех операциях через `CurrentUserResolver`.
- **MapStruct**: если используется `ProfileMapper` как образец, не забыть про `@Mapping` если имена полей не совпадают.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="ResumeServiceImplTest"`
**Frontend:** `cd frontend && npm.cmd run build`
