# Task: Application Status History (Timeline)

## Контекст и цель
Добавить возможность отслеживания истории изменений статуса отклика (Application). Пользователь должен видеть "таймлайн" того, как его заявка двигалась по этапам (например: NEW -> APPLIED -> TECH_INTERVIEW). Это повышает прозрачность процесса поиска работы и является базой для будущей аналитики времени нахождения в каждом статусе.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/entity/ApplicationStatusHistoryEntity.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/repository/ApplicationStatusHistoryRepository.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/response/ApplicationStatusHistoryResponse.java`
- `backend/src/main/resources/db/migration/V22__add_application_status_history.sql`
- `frontend/src/components/ApplicationTimelineModal.tsx`

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/service/ApplicationServiceImpl.java` — логика записи в историю при `create` и `updateStatus`.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/application/controller/ApplicationController.java` — добавить `GET /{id}/history`.
- `frontend/src/services/application.service.ts` — добавить метод `getHistory`.
- `frontend/src/pages/ApplicationsPage.tsx` — вызов модального окна при клике на карточку.

## Backend: точная реализация

### Entity
```java
@Getter
@Setter
@Entity
@Table(name = "application_status_history", schema = "careerpilot")
public class ApplicationStatusHistoryEntity extends BaseCreatedAtEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private ApplicationEntity application;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 50)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 50)
    private ApplicationStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
```

### Service Logic (ApplicationServiceImpl)
```java
// В методах create и updateStatus добавить:
private void recordStatusChange(ApplicationEntity application, ApplicationStatus from, ApplicationStatus to, String notes) {
    ApplicationStatusHistoryEntity history = new ApplicationStatusHistoryEntity();
    history.setApplication(application);
    history.setFromStatus(from);
    history.setToStatus(to);
    history.setNotes(notes);
    historyRepository.save(history);
}
```

### Controller
```java
@GetMapping("/{id}/history")
public List<ApplicationStatusHistoryResponse> getHistory(@PathVariable UUID id) {
    return service.getHistory(id);
}
```

### Flyway V22
```sql
CREATE TABLE application_status_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status    VARCHAR(50),
    to_status      VARCHAR(50) NOT NULL,
    notes          TEXT,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_status_hist_app_id ON application_status_history(application_id);
```

## Frontend: точная реализация

### API Service (application.service.ts)
```typescript
export interface ApplicationStatusHistory {
    id: string
    fromStatus: ApplicationStatus | null
    toStatus: ApplicationStatus
    notes: string | null
    createdAt: string
}

async getHistory(id: string): Promise<ApplicationStatusHistory[]> {
    return api.get<ApplicationStatusHistory[]>(`/applications/${id}/history`)
}
```

### Component: ApplicationTimelineModal.tsx
- Использует `useQuery` для загрузки истории.
- Отображает вертикальный список (степпер) с датами и названиями статусов.
- Использует `formatRelative` или `formatDateTime` из `lib/utils`.
- Стилизация в духе остального приложения (стеклянные карточки, градиентные линии).

## Порядок реализации
1. Создать миграцию `V22`.
2. Создать Entity и Repository на бэкенде.
3. Обновить `ApplicationServiceImpl` (внедрить репозиторий, добавить вызовы `recordStatusChange`).
4. Реализовать endpoint в `ApplicationController`.
5. Добавить i18n ключи для названий статусов (уже есть в `applications.json`, проверить полноту).
6. Реализовать сервисную функцию на фронтенде.
7. Создать компонент `ApplicationTimelineModal`.
8. Интегрировать клик по карточке в `ApplicationsPage`.

## Риски и проверки
- **Data Integrity:** Убедиться, что при создании новой заявки `fromStatus` записывается как `null`.
- **Performance:** Добавить индексы (уже в миграции).
- **UX:** Клик по карточке не должен мешать Drag-and-Drop (использовать `PointerSensor` с дистанцией или отдельную кнопку-иконку).

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest=ApplicationServiceTest` (нужно будет обновить тест).
**Frontend:** `npm run build`.
**Manual:** Перетащить карточку на доске и убедиться, что в таймлайне появилась новая запись.
