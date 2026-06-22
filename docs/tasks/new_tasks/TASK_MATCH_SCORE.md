# Task: Application Health Score (Индикатор здоровья отклика)

## Контекст и цель

Добавить на карточку отклика (в Kanban-доске и в деталях отклика) индикатор "Match Score" или "Health Score" (от 0 до 100).
Этот скор показывает, насколько профиль/резюме кандидата подходит под требования конкретной вакансии (вычисляется с помощью AI).
Поскольку вычисление может занимать время, бэкенд должен хранить это поле в `ApplicationEntity`. В данной задаче мы добавляем поле в базу, пробрасываем его на фронтенд и рисуем красивый бейдж (с цветовой градацией: зеленый > 80, желтый > 50, красный < 50).

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V33__add_application_match_score.sql`
- `docs/tasks/new_tasks/TASK_MATCH_SCORE.md` (этот файл)

### Изменить существующие
- `backend/.../application/entity/ApplicationEntity.java` — добавить `matchScore` (Integer).
- `backend/.../application/request/CreateApplicationDto.java` (или Request) — добавить `matchScore`.
- `backend/.../application/response/ApplicationResponse.java` — добавить `matchScore`.
- `frontend/src/types/index.ts` — добавить `matchScore?: number` в `Application`.
- `frontend/src/services/application.service.ts` — обновить DTO.
- `frontend/src/pages/ApplicationsPage.tsx` — добавить отображение бейджа со скором на `ApplicationCardBody`.
- `frontend/src/components/ApplicationTimelineModal.tsx` — отобразить скор в деталях (опционально).
- `docs/FRONTEND_BACKEND_CONTRACT.md` — обновить DTO.

---

## Backend: точная реализация

### Flyway миграция V33

```sql
-- V33__add_application_match_score.sql
ALTER TABLE careerpilot.applications ADD COLUMN match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100);
```

### Java классы

В `ApplicationEntity.java`:
```java
@Column(name = "match_score")
private Integer matchScore;
```

Добавить `Integer matchScore` в `ApplicationRequest` (опционально, если клиент захочет передать) и в `ApplicationResponse`. Обновить Mapper.

---

## Frontend: точная реализация

### Типы и контракты
В `frontend/src/types/index.ts`:
```typescript
export interface Application {
  // ...
  matchScore?: number;
}
```

Обновить `FRONTEND_BACKEND_CONTRACT.md` для `GET /applications` и `POST /applications`.

### Компонент UI (Бейдж)

В `frontend/src/pages/ApplicationsPage.tsx` (внутри `ApplicationCardBody`), рядом с иконкой "Timeline" или в `Meta info row` (рядом с локацией/датой) добавить:

```tsx
function MatchScoreBadge({ score }: { score?: number | null }) {
  if (score == null) return null;
  
  let colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
  if (score >= 80) colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  else if (score >= 50) colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border", colorClass)}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {score}%
    </div>
  )
}
```

Вставить вызов `<MatchScoreBadge score={application.matchScore} />` в `ApplicationCardBody`.

### Интеграция с AI (Автоматический расчет)
*(Это может быть сделано в рамках отдельной задачи, но для полноты картины UI должен поддерживать состояние "Вычисляется")*.
Если `matchScore` равен `null`, можно рендерить бледную кнопку "🔮 Evaluate match", которая вызывает `aiService.resumeMatch()` и затем делает `PUT /applications/{id}` для сохранения полученного скора (на фронтенде парсить процент из Markdown-ответа, либо попросить бэкенд отдавать структурированный JSON из AI).

На текущем этапе достаточно просто отобразить поле. В моковых данных (`mock/data.ts`) задать `matchScore` случайным откликам (например, `95`, `65`, `30`).

---

## Порядок реализации для агента

1. Создать миграцию `V33__add_application_match_score.sql`.
2. Обновить `ApplicationEntity`, Request, Response DTO и мапперы на бэкенде.
3. Добавить `matchScore` в `types/index.ts` и в моки `mock/data.ts`.
4. Реализовать компонент `MatchScoreBadge` внутри `ApplicationCardBody`.
5. Обновить `FRONTEND_BACKEND_CONTRACT.md`.
6. Выполнить сборку и тесты.
7. Выполнить все действия и синхронизировать все файлы которые описаны в последнем блоке этого файла.

## Риски и что проверить

- **Синхронизация:** Убедиться, что `GET /applications/board` (используемый Канбаном) возвращает `matchScore`. В бэкенде используется общий `ApplicationResponse`, так что проблем быть не должно.

## Проверки после реализации

**Backend:** `.\mvnw.cmd test -Dtest="ApplicationServiceImplTest"`
**Frontend:** `cd frontend && npm run build`
**Manual Smoke:**
1. Открыть Канбан (ApplicationsPage).
2. На карточках откликов (у которых задан `matchScore` в моках) должен появиться бейдж со звездочкой и процентом.
3. Цвета должны корректно отражать уровень (>=80 зеленый, >=50 желтый, <50 красный).

ОБЯЗАТЕЛЬНО перед завершением выполни локальную валидацию через .\verify-all.ps1 в корне проекта. 
Если скрипт выдает ошибки — исправляй их! Пуш или отчет без успешной валидации ЗАПРЕЩЕН.
После реализации выполни проверки из раздела "Проверки" и учет раздела "⚠️ Известные ошибки и паттерны" в GEMINI.md чтобы не было ошибок.
Выполни синхронизацию всех связанных документов (ROADMAP.md, ROADMAP.en.md, CAREERPILOT_AI_CONTEXT_BACKUP.md, DEPLOYMENT.md, README.md, README.ru.md, README.DEV.md), отразив в них внесенные изменения.
В конце если были ошибки или нюансы — обнови раздел "⚠️ Известные ошибки и паттерны" в GEMINI.md, но только если ты точно уверен что решение правильное и сооветствует best practics.
Обязательно не забывай про i18n ключи!