# Task: DnD-сортировка задач (Tasks Drag-and-Drop)

## Контекст и цель

Добавить возможность произвольной сортировки задач на странице `TasksPage`. 
Пользователь должен иметь возможность перетаскивать (drag-and-drop) задачи в списке, чтобы менять их приоритет (порядок). 
Поскольку порядок должен сохраняться, необходимо добавить поле `position` в БД и поддержать его на всех слоях (от Entity до UI). Для минимизации каскадных обновлений используется тип `Double` для позиции (когда карточка ставится между A и B, её новая позиция = `(A + B) / 2`).

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V31__add_task_position.sql` (или следующий порядковый номер)
- `docs/tasks/new_tasks/TASK_DND_TASKS.md` (этот файл)

### Изменить существующие
- `backend/.../task/entity/TaskEntity.java` — добавить поле `position`.
- `backend/.../task/request/TaskRequest.java` — добавить поле `position`.
- `backend/.../task/response/TaskResponse.java` — добавить поле `position`.
- `backend/.../task/service/TaskServiceImpl.java` — поддержать установку default `position` при создании (например, `EXTRACT(EPOCH FROM NOW)`).
- `backend/.../task/repository/TaskRepository.java` — обновить сортировку (если используется) на `ORDER BY position ASC`.
- `frontend/src/types/index.ts` — добавить `position?: number` в интерфейс `Task`.
- `frontend/src/services/task.service.ts` — добавить `position?: number` в `TaskRequest`.
- `frontend/src/pages/TasksPage.tsx` — внедрить `@dnd-kit` для списка задач, логика расчета `newPosition`, вызов `taskService.update`.
- `docs/FRONTEND_BACKEND_CONTRACT.md` — добавить поле `position` в контракты Tasks.

---

## Backend: точная реализация

### Flyway миграция V31

```sql
-- V31__add_task_position.sql
ALTER TABLE careerpilot.tasks ADD COLUMN position DOUBLE PRECISION;

-- Инициализируем позицию для существующих задач на основе времени создания (чтобы они выстроились в хронологическом порядке)
UPDATE careerpilot.tasks SET position = EXTRACT(EPOCH FROM created_at);

ALTER TABLE careerpilot.tasks ALTER COLUMN position SET NOT NULL;
```

### Java классы

В `TaskEntity.java`:
```java
@Column(nullable = false)
private Double position;
```

В `TaskRequest.java` и `TaskResponse.java`: добавить поле `Double position`.

В `TaskServiceImpl.java`:
В методе `create()`: если `request.position()` не передан, устанавливать его равным текущему timestamp:
```java
entity.setPosition(request.position() != null ? request.position() : (double) Instant.now().getEpochSecond());
```
(При обновлении `taskMapper` сам перенесет поле, если оно есть).

---

## Frontend: точная реализация

### Типы и контракты

В `frontend/src/types/index.ts`:
```typescript
export interface Task {
  // ...
  position?: number;
}
```

В `frontend/src/services/task.service.ts`:
```typescript
export interface TaskRequest {
  // ...
  position?: number;
}
```

### UI — TasksPage.tsx

1. Изменить сортировку по умолчанию (`sortedTasks`): сортировать сначала по `done` (выполненные вниз), а затем по `position` (по возрастанию).
2. Обернуть список задач в `DndContext` (как это сделано в `ApplicationsPage`):
   - Использовать `SortableContext` с `verticalListSortingStrategy`.
   - Создать компонент `SortableTaskItem` (обертка вокруг текущей карточки задачи с `useSortable`).
3. Реализовать `handleDragEnd`:
   - Найти `oldIndex` и `newIndex`.
   - Если индекс изменился, вычислить новую позицию:
     ```typescript
     const items = [...sortedTasks]; // текущий отсортированный массив
     // Перемещаем элемент локально
     const movedItem = items[oldIndex];
     items.splice(oldIndex, 1);
     items.splice(newIndex, 0, movedItem);

     let newPosition = 0;
     if (newIndex === 0) {
       // Поставили в самое начало
       newPosition = (items[1]?.position || 0) - 1000;
     } else if (newIndex === items.length - 1) {
       // Поставили в самый конец
       newPosition = (items[items.length - 2]?.position || 0) + 1000;
     } else {
       // Между двумя элементами
       const prevPos = items[newIndex - 1].position || 0;
       const nextPos = items[newIndex + 1].position || 0;
       newPosition = (prevPos + nextPos) / 2;
     }

     // Вызываем API для сохранения (используем уже существующий PUT метод)
     updateTaskMutation.mutate({ 
       id: movedItem.id, 
       data: { 
         title: movedItem.title,
         done: movedItem.done,
         priority: movedItem.priority,
         position: newPosition
       } 
     });
     ```
4. Добавить drag handle (иконку грипа `⋮⋮`) в левую часть карточки задачи, чтобы перетаскивание работало только при хвате за ручку (avoid text selection issues).

---

## Порядок реализации для агента

1. Создать миграцию `V31__add_task_position.sql`.
2. Добавить `position` в `TaskEntity`, `TaskRequest`, `TaskResponse`.
3. Обновить `TaskServiceImpl` (default value).
4. Запустить бэкенд и проверить, что миграция прошла. Обновить тесты `TaskServiceImplTest`, если нужно.
5. Обновить типы и `task.service.ts` на фронтенде.
6. В `TasksPage.tsx` заменить текущий рендер списка на `<DndContext>` + `<SortableContext>`. Создать `<SortableTaskItem>`.
7. Реализовать вычисление позиции в `onDragEnd` и вызов `PUT /tasks/{id}`.
8. Добавить иконку Grip в карточку задачи.
9. Сделать `npm run build` для проверки.
10. Выполнить все действия и синхронизировать все файлы которые описаны в последнем блоке этого файла.

## Риски и что проверить

- **Сортировка:** Задачи со статусом `done = true` обычно уходят в самый низ списка и игнорируют ручную сортировку. DnD должен быть либо запрещен для выполненных задач, либо `handleDragEnd` должен учитывать этот сдвиг (например, сортировать только внутри группы `done = false`). Оптимально: отключить `useSortable` (или спрятать drag handle) для выполненных задач.
- **Null position:** В старых мок-данных может не быть `position`. Нужно убедиться, что логика вычисления `newPosition` не выдает `NaN` при фоллбеках.
- **PUT Endpoint:** Убедиться, что `PUT /tasks/{id}` нормально работает с `position`. Бэкенд mapper должен корректно маппить `position` из `TaskRequest` в `TaskEntity`.

## Проверки после реализации

**Backend:** `.\mvnw.cmd test -Dtest="TaskServiceImplTest"`
**Frontend:** `cd frontend && npm run build`
**Manual Smoke:**
1. Открыть TasksPage.
2. Схватить задачу за ручку (drag handle) и перетащить её между двумя другими задачами.
3. Отпустить — задача должна зафиксироваться на новом месте.
4. Перезагрузить страницу — задача должна остаться на том же самом месте (порядок должен восстановиться из БД).

ОБЯЗАТЕЛЬНО перед завершением выполни локальную валидацию через .\verify-all.ps1 в корне проекта. 
Если скрипт выдает ошибки — исправляй их! Пуш или отчет без успешной валидации ЗАПРЕЩЕН.
После реализации выполни проверки из раздела "Проверки" и учет раздела "⚠️ Известные ошибки и паттерны" в GEMINI.md чтобы не было ошибок.
Выполни синхронизацию всех связанных документов (ROADMAP.md, ROADMAP.en.md, CONTEXT_BACKUP.md, DEPLOYMENT.md, README.md, README.ru.md, README.DEV.md), отразив в них внесенные изменения.
В конце если были ошибки или нюансы — обнови раздел "⚠️ Известные ошибки и паттерны" в GEMINI.md, но только если ты точно уверен что решение правильное и сооветствует best practics.
Обязательно не забывай про i18n ключи!