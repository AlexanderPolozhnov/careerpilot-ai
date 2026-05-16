# Task: Resume Upload & Parsing (пример)

## Контекст и цель
Добавить возможность загружать PDF-резюме, парсить текст через AI и сохранять
в профиле пользователя. Фронтенд — drag-and-drop форма, бэкенд — endpoint + Redis cache.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/careerpilot/resume/ResumeController.java`
- `backend/src/main/java/com/careerpilot/resume/ResumeService.java`
- `backend/src/main/java/com/careerpilot/resume/ResumeRepository.java`
- `backend/src/main/java/com/careerpilot/resume/dto/ResumeUploadResponse.java`
- `backend/src/main/java/com/careerpilot/resume/entity/Resume.java`
- `backend/src/main/resources/db/migration/V14__add_resume_table.sql`
- `frontend/src/services/resumeService.ts`
- `frontend/src/types/resume.ts`
- `frontend/src/hooks/useResumeUpload.ts`
- `frontend/src/components/resume/ResumeUploadCard.tsx`

### Изменить существующие
- `backend/src/main/java/com/careerpilot/user/UserService.java` — добавить `getUserResume(Long userId)`
- `frontend/src/pages/ProfilePage.tsx` — подключить ResumeUploadCard

## Backend: точная реализация

### Entity
```java
@Entity
@Table(name = "resumes")
public class Resume {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "parsed_text", columnDefinition = "TEXT")
    private String parsedText;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
}
```

### Repository
```java
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findTopByUserIdOrderByUploadedAtDesc(Long userId);
}
```

### Service — логика шаг за шагом
```java
public ResumeUploadResponse uploadResume(MultipartFile file) {
    Long userId = CurrentUserResolver.resolveRequired();
    // 1. Валидация: file != null, contentType == "application/pdf", size <= 5MB
    // 2. Извлечь текст через PDFBox: PDDocument.load(file.getInputStream())
    // 3. Сохранить Resume entity с userId, fileName, parsedText, uploadedAt = now()
    // 4. Инвалидировать Redis cache: redisTemplate.delete("resume:" + userId)
    // 5. Вернуть ResumeUploadResponse(id, fileName, uploadedAt)
}
```

### Controller
```java
@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResumeUploadResponse upload(@RequestParam("file") MultipartFile file) {
        return resumeService.uploadResume(file);
    }

    @GetMapping
    public ResumeUploadResponse getCurrent() {
        return resumeService.getCurrentResume();
    }
}
```

### DTO
```java
public record ResumeUploadResponse(
    Long id,
    String fileName,
    LocalDateTime uploadedAt
) {}
```

### Flyway миграция — V14
```sql
CREATE TABLE resumes (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    parsed_text TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
```

## Frontend: точная реализация

### TypeScript типы (types/resume.ts)
```typescript
export interface ResumeUploadResponse {
  id: number;
  fileName: string;
  uploadedAt: string;
}
```

### API-функция (services/resumeService.ts)
```typescript
export const uploadResume = (file: File): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/api/v1/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const getCurrentResume = (): Promise<ResumeUploadResponse> =>
  apiClient.get('/api/v1/resume').then(r => r.data);
```

### React Query хук (hooks/useResumeUpload.ts)
```typescript
export const useResumeUpload = () =>
  useMutation({
    mutationFn: uploadResume,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resume'] }),
  });

export const useCurrentResume = () =>
  useQuery({ queryKey: ['resume'], queryFn: getCurrentResume });
```

### Компонент ResumeUploadCard.tsx
- Drag-and-drop зона (принимает только PDF)
- Показывает текущее резюме если есть (fileName + uploadedAt)
- Кнопка загрузки, loading state, error state
- Использует useResumeUpload и useCurrentResume

### i18n ключи
```json
// ru.json
"resume": {
  "upload": "Загрузить резюме",
  "dragHint": "Перетащите PDF-файл сюда или нажмите для выбора",
  "current": "Текущее резюме",
  "uploadedAt": "Загружено",
  "errors": {
    "invalidType": "Только PDF файлы",
    "tooLarge": "Файл не должен превышать 5 МБ"
  }
}

// en.json — добавить аналогично
```

## Порядок реализации для SWE-1.6
1. Создай Flyway миграцию V14 и проверь что применяется
2. Создай Entity `Resume` и `ResumeRepository`
3. Добавь зависимость PDFBox в pom.xml (`org.apache.pdfbox:pdfbox:3.0.1`)
4. Реализуй `ResumeService` с валидацией и Redis cache
5. Реализуй `ResumeController`
6. Создай DTO `ResumeUploadResponse`
7. Прогони тесты бэкенда
8. Создай TypeScript типы и API-функции
9. Реализуй хуки React Query
10. Реализуй `ResumeUploadCard` компонент
11. Подключи карточку в `ProfilePage`
12. Добавь i18n ключи в оба файла локали
13. Выполни `npm run build`

## Риски и что проверить
- PDFBox зависимость: проверить что нет конфликта версий с другими Apache Commons
- Multipart upload: убедиться что `spring.servlet.multipart.max-file-size=5MB` в application.yml
- Redis cache: если Redis недоступен — graceful degradation, не ронять endpoint
- Миграция V14: если таблица `users` называется иначе — сверить с V1 миграцией

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="ResumeServiceTest,ResumeControllerTest"`
**Frontend:** `cd frontend && npm.cmd run build`
**Manual:** POST /api/v1/resume/upload с тестовым PDF через curl или Postman