# Task: Tasks Management Vertical Slice Implementation (v0.3.0)

## Контекст и цель
Реализация полноценного функционала управления задачами (Tasks) «под ключ». На данный момент бэкенд содержит заглушки (payload-based DTO), а фронтенд отображает задачи на Dashboard в режиме read-only без возможности управления и без отдельной страницы.

Цель: привести бэкенд к доменному виду и реализовать полный UI для управления задачами.

## Затрагиваемые файлы

### Backend: Изменить существующие
- `com.alexanderpolozhnov.careerpilot.task.request.TaskRequest` — обновить поля (title, description, dueAt, done, priority, applicationId)
- `com.alexanderpolozhnov.careerpilot.task.response.TaskResponse` — обновить поля (id, title, description, dueAt, done, priority, applicationId)
- `com.alexanderpolozhnov.careerpilot.task.mapper.TaskMapper` — реализовать маппинг через MapStruct
- `com.alexanderpolozhnov.careerpilot.task.service.TaskServiceImpl` — реализовать полноценную логику CRUD и фильтрации

### Frontend: Создать новые
- `src/services/task.service.ts` — API сервис для задач
- `src/pages/TasksPage.tsx` — страница списка задач
- `src/components/TaskForm.tsx` — форма создания/редактирования задачи

### Frontend: Изменить существующие
- `src/routes/AppRouter.tsx` — добавить маршрут `/app/tasks`
- `src/components/Sidebar.tsx` — добавить ссылку на раздел "Задачи"
- `src/pages/DashboardPage.tsx` — интеграция действий (toggle done, open edit)
- `src/i18n/locales/ru.json` и `en.json` — добавить переводы для задач

## Backend: точная реализация

### DTO
**TaskRequest:**
```java
public record TaskRequest(
    @NotBlank @Size(max = 255) String title,
    String description,
    Instant dueAt,
    Boolean done,
    @NotNull TaskPriority priority,
    UUID applicationId
) {}
```

**TaskResponse:**
```java
public record TaskResponse(
    UUID id,
    String title,
    String description,
    Instant dueAt,
    boolean done,
    TaskPriority priority,
    UUID applicationId,
    Instant createdAt,
    Instant updatedAt
) {}
```

### MapStruct mapper
```java
@Mapper(componentModel = "spring")
public interface TaskMapper {
    @Mapping(target = "applicationId", source = "application.id")
    TaskResponse toResponse(TaskEntity entity);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "application", ignore = true)
    void updateEntity(TaskRequest request, @MappingTarget TaskEntity entity);
}
```

### Service (TaskServiceImpl)
1. Использовать `CurrentUserResolver.resolveRequired()` для получения владельца.
2. При создании/обновлении: если `applicationId` не null, проверять владение этой заявкой.
3. В методе `list`: реализовать пагинацию через `TaskRepository.findAllByUserId(userId, pageable)`.
4. Добавить метод `toggleDone(UUID id)` для быстрого переключения статуса с Dashboard.

## Frontend: точная реализация

### API-функция (task.service.ts)
```typescript
export const taskService = {
  list: (params: TaskParams) => api.get<PagedResponse<Task>>('/tasks', { params }),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  create: (data: TaskRequest) => api.post<Task>('/tasks', data),
  update: (id: string, data: TaskRequest) => api.put<Task>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  toggleDone: (id: string) => api.patch<Task>(`/tasks/${id}/toggle`) // Опционально или через update
}
```

### TypeScript типы (types/index.ts)
Добавить `Task`, `TaskPriority`, `TaskStatus`.

### React Query хук
Использовать `useQuery(['tasks', params])` и мутации с инвалидацией `['tasks']` и `['dashboard', 'summary']`.

### Компонент TaskForm
Поля: Название (input), Описание (textarea), Дедлайн (datetime-local), Приоритет (select), Привязка к заявке (select из списка активных Applications).

## Порядок реализации для SWE-1.6
1. **Backend DTO & Mapper**: Обновить структуры данных.
2. **Backend Service**: Переписать `TaskServiceImpl`, убрав заглушки и `resolveAnyApplication`.
3. **API Contract**: Обновить `docs/FRONTEND_BACKEND_CONTRACT.md`, добавив раздел Tasks.
4. **Frontend Service**: Создать `task.service.ts`.
5. **TasksPage & Form**: Реализовать основной UI.
6. **Dashboard Integration**: Оживить кнопки на главной странице.
7. **Sidebar & Routing**: Добавить точку входа.

## Риски и что проверить
- **Security**: Проверить, что нельзя создать/отредактировать задачу, привязав её к чужому `applicationId`.
- **UX**: Убедиться, что на Dashboard задачи сортируются по дедлайну (сначала просроченные и ближайшие).
- **i18n**: Проверить отображение приоритетов (LOW/MEDIUM/HIGH) на обоих языках.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="TaskServiceImplTest"` (нужно создать тест)
**Frontend:** `cd frontend && npm.cmd run build`
