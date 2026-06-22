# Task: Markdown Preview для вакансий

## Контекст и цель

Улучшить визуальное восприятие длинных описаний вакансий. Большинство описаний копируется из интернета и содержит списки, выделения (жирный шрифт) и ссылки. В данный момент поле `description` отображается как обычный текст с `whitespace-pre-wrap`.
Необходимо внедрить библиотеку `react-markdown` (которая уже установлена в `package.json`) для рендеринга текста вакансии, а также добавить переключатель Edit/Preview в форме создания/редактирования вакансии.

## Затрагиваемые файлы

### Создать новые
- `frontend/src/components/ui/MarkdownViewer.tsx` — переиспользуемый компонент для безопасного и стилизованного рендеринга Markdown.
- `docs/tasks/new_tasks/TASK_MARKDOWN_PREVIEW.md` (этот файл)

### Изменить существующие
- `frontend/src/pages/VacancyDetailPage.tsx` — заменить вывод `vacancy.description` на `<MarkdownViewer>`.
- `frontend/src/components/VacancyForm.tsx` — добавить табы "Write" и "Preview" над полем `description`.
- `frontend/src/i18n/locales/ru.json` / `en.json` — добавить тексты "Редактировать", "Предпросмотр".

---

## Точная реализация (Frontend)

Задача полностью на стороне Frontend (бэкенд уже хранит текст в поле `TEXT` в PostgreSQL, что отлично подходит для Markdown).

### 1. MarkdownViewer Component

Создать файл `frontend/src/components/ui/MarkdownViewer.tsx`:
```tsx
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={cn(
      "markdown-body text-sm leading-relaxed text-ink-muted",
      // Базовые стили для Markdown без плагина typography
      "[&_p]:mb-4 last:[&_p]:mb-0",
      "[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-ink [&_h1]:mb-4 [&_h1]:mt-6",
      "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:mb-3 [&_h2]:mt-5",
      "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-ink [&_h3]:mb-2 [&_h3]:mt-4",
      "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul_li]:mb-1",
      "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol_li]:mb-1",
      "[&_a]:text-accent [&_a]:underline hover:[&_a]:text-accent-2",
      "[&_strong]:font-semibold [&_strong]:text-ink",
      "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
      "[&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
      className
    )}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
```

### 2. Внедрение в VacancyDetailPage.tsx

В блоке рендеринга описания (около строки 400):
```tsx
{vacancy.description && (
  <div className="p-6 bg-surface-1 border border-border rounded-2xl">
      <h3 className="text-xs font-semibold text-ink-muted mb-4 uppercase tracking-wider">
          {t('vacancies.description')}
      </h3>
      {/* Заменяем старый div на новый компонент */}
      <MarkdownViewer content={vacancy.description} />
  </div>
)}
```

### 3. Улучшение VacancyForm.tsx

Над полем `description` (около строки 106) добавить переключатель табов:
```tsx
const [previewMode, setPreviewMode] = useState(false);
const descriptionValue = form.watch('description');

// ...
<div className="flex items-center justify-between">
  <label htmlFor="description" className="text-xs text-ink-dim">
    {t('vacancies.form.description')}
  </label>
  <div className="flex gap-2">
    <button 
      type="button" 
      onClick={() => setPreviewMode(false)}
      className={cn("text-xs", !previewMode ? "text-accent" : "text-ink-dim")}
    >
      Write
    </button>
    <button 
      type="button" 
      onClick={() => setPreviewMode(true)}
      className={cn("text-xs", previewMode ? "text-accent" : "text-ink-dim")}
    >
      Preview
    </button>
  </div>
</div>

{previewMode ? (
  <div className="mt-1 h-32 overflow-y-auto p-3 border border-border rounded-lg bg-surface-1">
    <MarkdownViewer content={descriptionValue || '*Нет описания*'} />
  </div>
) : (
  <textarea id="description" {...form.register('description')} className="input mt-1 h-32 py-2 font-mono text-sm" />
)}
```
*Увеличен размер поля (`h-32`) и добавлен `font-mono` для удобства редактирования Markdown.*

---

## Порядок реализации для агента

1. Создать компонент `MarkdownViewer.tsx` с кастомными CSS-селекторами для списков и заголовков.
2. В `VacancyDetailPage.tsx` заменить текстовый блок описания на вызов `MarkdownViewer`.
3. В `VacancyForm.tsx` добавить логику (state `previewMode`) переключения между полем `textarea` и предпросмотром через `MarkdownViewer`.
4. Обновить локализацию (ru/en), добавив ключи для "Write" и "Preview" (опционально, можно оставить английские термины для UI-элементов кода).
5. Собрать проект `npm run build` для проверки.
6. Выполнить все действия и синхронизировать все файлы которые описаны в последнем блоке этого файла.

## Риски и что проверить

- **Безопасность (XSS):** Пакет `react-markdown` по умолчанию безопасен и не рендерит HTML-теги (например, `<script>`), если не подключен плагин `rehype-raw`. Не подключайте `rehype-raw` без необходимости!
- **Стилизация Markdown:** Поскольку мы не используем `@tailwindcss/typography`, нужно проверить вручную, что вложенные списки (`<ul>` внутри `<li>`) и длинные ссылки не ломают верстку и не выходят за пределы контейнера (`break-words` по умолчанию работает).

## Проверки после реализации

**Frontend:** `cd frontend && npm run build`
**Manual Smoke:**
1. Зайти в список вакансий, нажать "Добавить".
2. В поле Description вставить текст:
   ```markdown
   # Senior Frontend Role
   - React
   - **TypeScript**
   [Link to site](https://google.com)
   ```
3. Нажать кнопку "Preview" — должен отобразиться корректный список и жирный шрифт.
4. Сохранить вакансию и перейти на страницу её деталей (`VacancyDetailPage`).
5. Убедиться, что описание отображается с правильными стилями.

ОБЯЗАТЕЛЬНО перед завершением выполни локальную валидацию через .\verify-all.ps1 в корне проекта. 
Если скрипт выдает ошибки — исправляй их! Пуш или отчет без успешной валидации ЗАПРЕЩЕН.
После реализации выполни проверки из раздела "Проверки" и учет раздела "⚠️ Известные ошибки и паттерны" в GEMINI.md чтобы не было ошибок.
Выполни синхронизацию всех связанных документов (ROADMAP.md, ROADMAP.en.md, CAREERPILOT_AI_CONTEXT_BACKUP.md, DEPLOYMENT.md, README.md, README.ru.md, README.DEV.md), отразив в них внесенные изменения.
В конце если были ошибки или нюансы — обнови раздел "⚠️ Известные ошибки и паттерны" в GEMINI.md, но только если ты точно уверен что решение правильное и сооветствует best practics.
Обязательно не забывай про i18n ключи!