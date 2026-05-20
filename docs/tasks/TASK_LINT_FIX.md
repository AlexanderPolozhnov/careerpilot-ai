# Task: Fix Frontend Lint Errors

## Контекст и цель
Устранение 25 ошибок линтинга (ESLint) и 3 предупреждений во фронтенд-части проекта, которые блокируют сборку и прохождение CI-пайплайна.

## Затрагиваемые файлы

### Изменить существующие
- `frontend/src/services/api-client.ts` — Удалить неиспользуемую переменную `refreshErr` в блоке `catch`.
- `frontend/src/services/interview.service.ts` — Заменить `let items` на `const items`.
- `frontend/src/services/task.service.ts` — Устранить приведение к `any` для `params` в методе `list`.
- `frontend/src/components/InterviewForm.tsx` — Заменить приведения типа `as any` для `app.vacancy` на прямое обращение с использованием строгой типизации.
- `frontend/src/pages/CompaniesPage.tsx` — Обернуть вызовы `setState` внутри `useEffect` в `setTimeout` для избежания синхронных каскадных рендеров.
- `frontend/src/pages/InterviewsPage.tsx` — Обернуть вызовы `setState` внутри `useEffect` в `setTimeout`, а также оптимизировать зависимости `useMemo` для устранения предупреждений `exhaustive-deps`.
- `frontend/src/pages/TasksPage.tsx` — Обернуть вызовы `setState` внутри `useEffect` в `setTimeout`, а также оптимизировать зависимости `useMemo` для устранения предупреждений `exhaustive-deps`.
- `frontend/src/pages/SettingsPage.tsx` — Заменить 16 вызовов приведения типа `as any` на `as string` или `as unknown as Resolver<...>` и безопасно типизировать поле `location` у `userData`.

---

## Frontend: точная реализация

### 1. `frontend/src/services/api-client.ts`
В методе `request` заменить конструкцию `catch (refreshErr)` на обычный `catch` без привязки переменной, так как она не используется.

```diff
-        } catch (refreshErr) {
+        } catch {
           clearToken()
```

### 2. `frontend/src/services/interview.service.ts`
В методе `list` заменить `let items` на `const items`.

```diff
-      let items = mockInterviews
+      const items = mockInterviews
```

### 3. `frontend/src/services/task.service.ts`
В методе `list` использовать явный безопасный тип вместо `any` при вызове `buildQuery`.

```diff
-    api.get<PagedResponse<Task>>(`/tasks${buildQuery(params as any)}`),
+    api.get<PagedResponse<Task>>(`/tasks${buildQuery(params as Record<string, string | number | boolean | undefined>)}`),
```

### 4. `frontend/src/components/InterviewForm.tsx`
Поскольку `app` имеет тип `Application`, который содержит `vacancy?: Vacancy`, а `Vacancy` содержит `company?: VacancyCompany`, приведения `as any` избыточны и вызывают ошибки.

Строка 50:
```diff
-      const company = (app as any).vacancy?.company
+      const company = app.vacancy?.company
```

Строка 62:
```diff
-      const company = (app as any).vacancy?.company
+      const company = app.vacancy?.company
```

Строка 123:
```diff
-              const vacancyTitle = (app as any).vacancy?.title || t('common.unknown');
+              const vacancyTitle = app.vacancy?.title || t('common.unknown');
```

### 5. `frontend/src/pages/CompaniesPage.tsx`
Обернуть обновление стейта в `useEffect` в `setTimeout(..., 0)`, чтобы избежать синхронного изменения состояния из эффекта.

```diff
   // Handle deep linking from search
   useEffect(() => {
     const id = searchParams.get('id')
     if (id && companiesQuery.data?.content) {
       const company = companiesQuery.data.content.find(c => c.id === id)
       if (company) {
-        setEditingCompany(company)
-        setIsFormOpen(true)
-        // Clear the param after opening to avoid re-opening
-        const newParams = new URLSearchParams(searchParams)
-        newParams.delete('id')
-        setSearchParams(newParams, { replace: true })
+        setTimeout(() => {
+          setEditingCompany(company)
+          setIsFormOpen(true)
+          // Clear the param after opening to avoid re-opening
+          const newParams = new URLSearchParams(searchParams)
+          newParams.delete('id')
+          setSearchParams(newParams, { replace: true })
+        }, 0)
       }
     }
   }, [searchParams, companiesQuery.data, setSearchParams])
```

### 6. `frontend/src/pages/InterviewsPage.tsx`
Решить ту же проблему с `useEffect` + `setState`, а также исправить предупреждение `exhaustive-deps` (строка 117): вместо зависимости от всего массива `interviews`, который пересоздается на каждом рендере при `data?.content ?? []`, использовать зависимость от `interviewsQuery.data?.content`, а сам дефолтный пустой массив инициализировать внутри `useMemo`.

```diff
   // Handle deep linking from search
   useEffect(() => {
     const id = searchParams.get('id')
     if (id && interviewsQuery.data?.content) {
       const interview = interviewsQuery.data.content.find(i => i.id === id)
       if (interview) {
-        setEditingInterview(interview)
-        setIsFormOpen(true)
-        // Clear the param after opening to avoid re-opening
-        const newParams = new URLSearchParams(searchParams)
-        newParams.delete('id')
-        setSearchParams(newParams, { replace: true })
+        setTimeout(() => {
+          setEditingInterview(interview)
+          setIsFormOpen(true)
+          // Clear the param after opening to avoid re-opening
+          const newParams = new URLSearchParams(searchParams)
+          newParams.delete('id')
+          setSearchParams(newParams, { replace: true })
+        }, 0)
       }
     }
   }, [searchParams, interviewsQuery.data, setSearchParams])
```

Оптимизация `useMemo` зависимостей:
```diff
-  const interviews: Interview[] = interviewsQuery.data?.content ?? []
-
   // Filter interviews
   const filteredInterviews = useMemo(() => {
+    const interviews = interviewsQuery.data?.content ?? []
     return interviews.filter((i) => {
       if (typeFilter && i.type !== typeFilter) return false
       if (resultFilter && i.result !== resultFilter) return false
@@ -129,7 +126,7 @@ export default function InterviewsPage() {
       
       return true
     })
-  }, [interviews, typeFilter, resultFilter, query])
+  }, [interviewsQuery.data?.content, typeFilter, resultFilter, query])
```
И на строке 181 (или где вычисляется длина) обновите обращение к `interviews.length` на `(interviewsQuery.data?.content ?? []).length` или объявите `const interviews = interviewsQuery.data?.content ?? []` ниже вне хуков.

### 7. `frontend/src/pages/TasksPage.tsx`
Решить аналогичные проблемы с `useEffect` + `setState` и зависимостями `useMemo`.

```diff
   // Handle deep linking from search
   useEffect(() => {
     const id = searchParams.get('id')
     if (id && tasksQuery.data?.content) {
       const task = tasksQuery.data.content.find(t => t.id === id)
       if (task) {
-        setEditingTask(task)
-        setIsFormOpen(true)
-        // Clear the param after opening to avoid re-opening
-        const newParams = new URLSearchParams(searchParams)
-        newParams.delete('id')
-        setSearchParams(newParams, { replace: true })
+        setTimeout(() => {
+          setEditingTask(task)
+          setIsFormOpen(true)
+          // Clear the param after opening to avoid re-opening
+          const newParams = new URLSearchParams(searchParams)
+          newParams.delete('id')
+          setSearchParams(newParams, { replace: true })
+        }, 0)
       }
     }
   }, [searchParams, tasksQuery.data, setSearchParams])
```

Оптимизация `useMemo` зависимостей:
```diff
-  const tasks: Task[] = tasksQuery.data?.content ?? []
-
   // Filter tasks
   const filteredTasks = useMemo(() => {
+    const tasks = tasksQuery.data?.content ?? []
     return tasks.filter((task) => {
       if (priorityFilter && task.priority !== priorityFilter) return false
       if (doneFilter !== '' && task.done !== doneFilter) return false
@@ -153,7 +150,7 @@ export default function TasksPage() {
       
       return true
     })
-  }, [tasks, priorityFilter, doneFilter, query])
+  }, [tasksQuery.data?.content, priorityFilter, doneFilter, query])
```
Также объявите `const tasks = tasksQuery.data?.content ?? []` ниже хуков `useMemo` (например перед отрисовкой), чтобы переменная `tasks` была доступна в рендере.

### 8. `frontend/src/pages/SettingsPage.tsx`
Импортировать тип `Resolver` из `react-hook-form` (если отсутствует) и устранить `as any`.

Строки 211, 224:
```diff
-        resolver: zodResolver(professionalProfileSchema) as any,
+        resolver: zodResolver(professionalProfileSchema) as unknown as Resolver<ProfessionalProfileValues>,
```
```diff
-        resolver: zodResolver(getPasswordSchema(userData?.hasPassword ?? false)) as any,
+        resolver: zodResolver(getPasswordSchema(userData?.hasPassword ?? false)) as unknown as Resolver<PasswordValues>,
```

Строка 240 (устранение обращения к нетипизированному location у User):
```diff
-                location: (userData as any).location ?? '',
+                location: (userData as User & { location?: string }).location ?? '',
```

Строка 422:
```diff
-    const handleResumeSubmit = async (values: any) => {
+    const handleResumeSubmit = async (values: CreateResumeDto) => {
```

В блоках отображения ошибок (строки 543, 557, 633, 650, 666, 722, 739, 756, 773, 789, 803, 817 и другие аналогичные) заменить `as any` на `as string`:
```diff
-                                        <p className="text-xs text-red-400">{t(profileForm.formState.errors.name.message as any)}</p>
+                                        <p className="text-xs text-red-400">{t(profileForm.formState.errors.name.message as string)}</p>
```
Сделать эту замену во всех 16 указанных местах.

---

## Порядок реализации для SWE-1.6
1. Обновить файлы сервисов: `api-client.ts`, `interview.service.ts`, `task.service.ts`.
2. Обновить компонент `InterviewForm.tsx` для удаления `as any` кастов.
3. Исправить асинхронные обновления стейта в `CompaniesPage.tsx`, `InterviewsPage.tsx`, `TasksPage.tsx`.
4. Оптимизировать зависимости `useMemo` в `InterviewsPage.tsx` и `TasksPage.tsx`.
5. Массово заменить `as any` на `as string` и строгие типы в `SettingsPage.tsx`.
6. Запустить `pnpm run lint` локально в папке `frontend` и убедиться в отсутствии ошибок.

## Риски и что проверить
- Ошибки в `useMemo` и `useEffect` могут повлиять на отображение списков при переходе по прямым ссылкам (deep linking). Тщательно проверьте переход на страницы компаний/интервью/задач по параметру `?id=...`.
- Убедиться, что сборка фронтенда (`pnpm run build`) успешно завершается без ошибок типизации.

## Проверки после реализации
**Frontend:**
```bash
cd frontend
pnpm run lint
pnpm run build
```
