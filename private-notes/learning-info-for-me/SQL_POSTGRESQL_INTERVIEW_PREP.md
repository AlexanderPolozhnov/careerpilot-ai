# Собеседование: SQL & PostgreSQL — Сложные запросы, Индексы, Оптимизация

Гайд для подготовки к собеседованию. Охватывает SQL от основ до продвинутых тем: сложные JOIN, Window Functions, CTE, индексы, EXPLAIN ANALYZE, транзакции, PostgreSQL-специфику и NoSQL-основы.

---

## 1. JOIN — типы и когда применять

### 🎙️ Вопрос: *"Объясните все типы JOIN и когда их использовать"*

```sql
-- Данные для примеров (из проекта CareerPilot AI)
-- vacancies: id, title, company_id, user_id
-- companies: id, name
-- applications: id, vacancy_id, status

-- INNER JOIN — только строки с совпадением в обеих таблицах
SELECT v.title, c.name AS company
FROM vacancies v
INNER JOIN companies c ON v.company_id = c.id;
-- Результат: только вакансии у которых есть компания

-- LEFT JOIN — все из левой + совпадения из правой (NULL если нет)
SELECT v.title, c.name AS company
FROM vacancies v
LEFT JOIN companies c ON v.company_id = c.id;
-- Результат: ВСЕ вакансии, даже если company_id = NULL

-- RIGHT JOIN — все из правой + совпадения из левой (редко используется)
SELECT v.title, c.name
FROM vacancies v
RIGHT JOIN companies c ON v.company_id = c.id;
-- Результат: ВСЕ компании, даже без вакансий

-- FULL OUTER JOIN — все из обеих таблиц
SELECT v.title, c.name
FROM vacancies v
FULL OUTER JOIN companies c ON v.company_id = c.id;

-- CROSS JOIN — декартово произведение (каждая × каждую)
SELECT v.title, s.name AS skill
FROM vacancies v
CROSS JOIN skills s;
-- Осторожно: N*M строк!

-- SELF JOIN — таблица с самой собой (например, иерархия)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

---

## 2. Агрегация: GROUP BY, HAVING, фильтрация

```sql
-- Количество вакансий по статусу для каждого пользователя
SELECT
    u.email,
    a.status,
    COUNT(*) AS cnt,
    AVG(EXTRACT(EPOCH FROM (a.updated_at - a.created_at))/3600) AS avg_hours
FROM applications a
JOIN auth_users u ON a.user_id = u.id
GROUP BY u.email, a.status
HAVING COUNT(*) > 2           -- фильтр ПО ГРУППАМ (не по строкам!)
ORDER BY u.email, cnt DESC;

-- WHERE vs HAVING:
-- WHERE — фильтрует строки ДО группировки
-- HAVING — фильтрует группы ПОСЛЕ GROUP BY

SELECT company_id, COUNT(*) AS vacancy_count
FROM vacancies
WHERE created_at > NOW() - INTERVAL '30 days'  -- фильтр строк
GROUP BY company_id
HAVING COUNT(*) >= 3;                           -- фильтр групп
```

---

## 3. Подзапросы (Subqueries)

```sql
-- Некоррелированный подзапрос — выполняется один раз
SELECT title, company_id
FROM vacancies
WHERE company_id IN (
    SELECT id FROM companies WHERE country = 'Belarus'
);

-- Коррелированный подзапрос — выполняется для КАЖДОЙ строки (медленно!)
SELECT v.title,
    (SELECT COUNT(*) FROM applications a WHERE a.vacancy_id = v.id) AS app_count
FROM vacancies v;
-- ⚠️ N+1 в SQL! Лучше заменить на LEFT JOIN + GROUP BY

-- EXISTS — эффективнее IN для больших наборов (останавливается на первом совпадении)
SELECT title FROM vacancies v
WHERE EXISTS (
    SELECT 1 FROM applications a WHERE a.vacancy_id = v.id AND a.status = 'OFFER'
);

-- NOT EXISTS
SELECT title FROM vacancies v
WHERE NOT EXISTS (
    SELECT 1 FROM applications a WHERE a.vacancy_id = v.id
);
-- Вакансии без ни одного отклика
```

---

## 4. CTE (Common Table Expressions) — WITH

### 🎙️ Вопрос: *"Что такое CTE и когда его использовать вместо подзапроса?"*

**💡 Ответ:**
> «**CTE (`WITH`)** — именованный временный результирующий набор, который существует только в рамках одного запроса. Делает сложные запросы читаемыми, избегает повторения подзапросов. Рекурсивные CTE позволяют обходить иерархические структуры.»

```sql
-- Простой CTE — читаемость
WITH active_vacancies AS (
    SELECT id, title, company_id
    FROM vacancies
    WHERE status = 'OPEN' AND created_at > NOW() - INTERVAL '90 days'
),
top_companies AS (
    SELECT company_id, COUNT(*) AS vacancy_count
    FROM active_vacancies
    GROUP BY company_id
    HAVING COUNT(*) >= 5
)
SELECT c.name, tc.vacancy_count
FROM top_companies tc
JOIN companies c ON tc.company_id = c.id
ORDER BY tc.vacancy_count DESC;

-- Рекурсивный CTE — обход дерева (организационная иерархия)
WITH RECURSIVE org_hierarchy AS (
    -- Базовый случай: корневые узлы
    SELECT id, name, manager_id, 0 AS depth, name::TEXT AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Рекурсивный шаг
    SELECT e.id, e.name, e.manager_id,
           h.depth + 1,
           h.path || ' → ' || e.name
    FROM employees e
    INNER JOIN org_hierarchy h ON e.manager_id = h.id
    WHERE h.depth < 10 -- защита от бесконечной рекурсии
)
SELECT depth, path FROM org_hierarchy ORDER BY path;
```

---

## 5. Window Functions (Оконные функции)

### 🎙️ Вопрос: *"Что такое оконные функции и чем отличаются от GROUP BY?"*

**💡 Ответ:**
> «**Оконные функции (`OVER`)** вычисляют агрегат по "окну" (набору строк), но **не группируют строки** — каждая строка остаётся в результате. В отличие от `GROUP BY`, который сворачивает группу в одну строку.»

```sql
-- ROW_NUMBER — уникальный номер строки в партиции
SELECT
    user_id,
    vacancy_id,
    status,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
FROM applications;
-- rn=1 → последнее отклик каждого пользователя

-- Получить последний отклик каждого пользователя
SELECT * FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM applications
) t WHERE t.rn = 1;

-- RANK и DENSE_RANK — рейтинг с дырками/без
SELECT
    vacancy_id,
    COUNT(*) AS app_count,
    RANK()       OVER (ORDER BY COUNT(*) DESC) AS rank_with_gaps,
    DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS rank_no_gaps
FROM applications
GROUP BY vacancy_id;

-- LAG/LEAD — предыдущее/следующее значение в окне
SELECT
    user_id,
    status,
    created_at,
    LAG(status) OVER (PARTITION BY user_id ORDER BY created_at) AS prev_status,
    LEAD(status) OVER (PARTITION BY user_id ORDER BY created_at) AS next_status
FROM application_status_history;

-- SUM/AVG с накоплением (Running Total)
SELECT
    created_at::DATE AS day,
    COUNT(*) AS daily_apps,
    SUM(COUNT(*)) OVER (ORDER BY created_at::DATE) AS cumulative_total
FROM applications
GROUP BY created_at::DATE
ORDER BY day;

-- NTILE — разбить на N равных групп
SELECT
    user_id,
    COUNT(*) AS app_count,
    NTILE(4) OVER (ORDER BY COUNT(*)) AS quartile
FROM applications
GROUP BY user_id;
-- quartile=1 → нижние 25%, quartile=4 → топ 25%
```

---

## 6. Индексы в PostgreSQL

### 🎙️ Вопрос: *"Какие типы индексов есть в PostgreSQL? Когда создавать индекс?"*

**💡 Ответ:**
> «**Индекс** — структура данных для ускорения поиска строк. Без индекса — Sequential Scan (O(N)), с индексом — Index Scan (O(log N)).
>
> **Создавать индекс когда:**
> - Поле часто используется в `WHERE`, `JOIN ON`, `ORDER BY`
> - Таблица большая (>100K строк), и запрос выполняется часто
>
> **Не создавать когда:**
> - Таблица маленькая (Sequential Scan быстрее из-за overhead индекса)
> - Поле с низкой кардинальностью (boolean, статус с 3 значениями)
> - Много `INSERT`/`UPDATE`/`DELETE` → индексы замедляют запись»

### Типы индексов PostgreSQL:
```sql
-- B-Tree (по умолчанию) — для =, <, >, BETWEEN, ORDER BY, LIKE 'prefix%'
CREATE INDEX idx_vacancies_user_id ON vacancies(user_id);
CREATE INDEX idx_vacancies_status ON vacancies(status);

-- Составной индекс — для запросов с несколькими условиями
-- Порядок колонок важен! Leftmost prefix rule
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
-- Используется для: WHERE user_id = ?
-- Используется для: WHERE user_id = ? AND status = ?
-- НЕ используется для: WHERE status = ? (нет user_id в начале!)

-- Частичный индекс — только для подмножества строк
CREATE INDEX idx_applications_pending ON applications(user_id, created_at)
WHERE status = 'PENDING';
-- Меньший размер, быстрее для filtered queries

-- GIN индекс — для полнотекстового поиска, массивов, JSONB
CREATE INDEX idx_vacancies_tags_gin ON vacancies USING GIN(tags);
-- Или для tsvector:
CREATE INDEX idx_vacancies_fts ON vacancies USING GIN(to_tsvector('russian', title || ' ' || description));

-- Hash индекс — только для = (быстрее B-Tree для точных совпадений)
CREATE INDEX idx_users_email_hash ON auth_users USING HASH(email);

-- UNIQUE индекс
CREATE UNIQUE INDEX idx_users_email_unique ON auth_users(email);
```

### Covering Index (покрывающий индекс):
```sql
-- Index Only Scan — запрос полностью удовлетворяется индексом без чтения таблицы
CREATE INDEX idx_vacancies_cover ON vacancies(user_id, status)
    INCLUDE (title, created_at); -- INCLUDE добавляет колонки без сортировки

-- Теперь этот запрос — Index Only Scan (без heap access!)
SELECT title, created_at FROM vacancies
WHERE user_id = ? AND status = 'OPEN';
```

---

## 7. EXPLAIN ANALYZE — анализ планов выполнения

### 🎙️ Вопрос: *"Как анализировать медленные запросы в PostgreSQL?"*

```sql
-- EXPLAIN — показывает план БЕЗ выполнения
EXPLAIN SELECT * FROM vacancies WHERE user_id = '123';

-- EXPLAIN ANALYZE — выполняет запрос и показывает реальное время
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT v.title, c.name, COUNT(a.id) AS app_count
FROM vacancies v
LEFT JOIN companies c ON v.company_id = c.id
LEFT JOIN applications a ON a.vacancy_id = v.id
WHERE v.user_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY v.id, v.title, c.name;
```

### Как читать EXPLAIN:
```
Gather  (cost=1234.56..5678.90 rows=100 width=200)
  └─ Hash Join  (cost=...) (actual time=2.345..156.789 rows=95 loops=1)
        Hash Cond: (a.vacancy_id = v.id)
        │
        ├─ Seq Scan on applications a  ← ⚠️ Sequential Scan = нет индекса!
        │     (cost=0.00..3456.00 rows=200000 width=50)
        │     Filter: (status = 'PENDING')
        │     Rows Removed by Filter: 195000
        │
        └─ Hash  (cost=...)
              └─ Index Scan using idx_vacancies_user on vacancies v  ← ✅ Index используется
                    (cost=0.43..8.45 rows=1 width=150)
                    Index Cond: (user_id = '550e8400...')
```

### Что искать в плане:
| Признак | Проблема | Решение |
|---------|---------|---------|
| `Seq Scan` на большой таблице | Нет индекса | Создать индекс |
| `Rows Removed by Filter: 195000` | Индекс есть, но плохой selectivity | Частичный индекс или составной |
| `Nested Loop` с большими таблицами | Неэффективный join | `Hash Join` обычно лучше, проверить индексы на join-колонках |
| `actual rows` >> `rows` (estimate) | Устаревшая статистика | `ANALYZE vacancies;` или `VACUUM ANALYZE;` |
| Высокий `buffers: hit=0` | Всё читается с диска | Проблема кэша (shared_buffers) |

---

## 8. Транзакции и блокировки в PostgreSQL

```sql
-- Явная транзакция
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    UPDATE accounts SET balance = balance + 100 WHERE id = 2;
    -- Если второй UPDATE упадёт → ROLLBACK откатит оба
COMMIT;

-- Savepoint — частичный откат
BEGIN;
    INSERT INTO orders VALUES (1, 'pending');
    SAVEPOINT order_created;

    INSERT INTO order_items VALUES (1, 'laptop', 1); -- OK
    INSERT INTO order_items VALUES (1, NULL, 1);     -- Ошибка!
    ROLLBACK TO order_created; -- откатить только items, не сам order

    INSERT INTO order_items VALUES (1, 'laptop', 1); -- снова
COMMIT;

-- Уровни изоляции
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- default в PG
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;  -- snapshot на момент BEGIN
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;     -- полная изоляция

-- SELECT FOR UPDATE — явная блокировка строк
BEGIN;
    SELECT * FROM orders WHERE id = 1 FOR UPDATE; -- блокируем строку
    -- Другие транзакции будут ждать
    UPDATE orders SET status = 'processing' WHERE id = 1;
COMMIT;

-- SKIP LOCKED — пропустить заблокированные строки (очереди задач!)
SELECT * FROM tasks
WHERE status = 'PENDING'
LIMIT 1
FOR UPDATE SKIP LOCKED; -- берём незаблокированную задачу, не ждём
```

---

## 9. PostgreSQL-специфика

### JSONB — хранение JSON с индексированием:
```sql
-- Создание таблицы с JSONB
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}'
);

-- Операторы JSONB
SELECT settings -> 'theme' FROM user_preferences;           -- → JSON
SELECT settings ->> 'theme' FROM user_preferences;          -- ->> TEXT
SELECT settings #> '{notifications,email}' FROM user_preferences;  -- путь

-- Фильтрация по JSONB
SELECT * FROM user_preferences
WHERE settings @> '{"notifications": {"email": true}}';  -- @> containment

-- GIN индекс на JSONB
CREATE INDEX idx_preferences_gin ON user_preferences USING GIN(settings);

-- В CareerPilot AI: настройки пользователя хранятся в JSONB
-- Hibernate маппинг: @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition = "jsonb")
```

### Полнотекстовый поиск:
```sql
-- tsvector + tsquery
SELECT title FROM vacancies
WHERE to_tsvector('russian', title || ' ' || COALESCE(description, ''))
      @@ to_tsquery('russian', 'Java & (разработчик | developer)');

-- С GIN индексом (быстро)
CREATE INDEX idx_vacancies_fts ON vacancies
    USING GIN(to_tsvector('russian', title || ' ' || COALESCE(description, '')));
```

### Полезные функции PostgreSQL:
```sql
-- Работа с датами
SELECT NOW(), CURRENT_DATE, CURRENT_TIMESTAMP;
SELECT created_at + INTERVAL '7 days' FROM applications;
SELECT EXTRACT(MONTH FROM created_at) AS month FROM applications;
SELECT DATE_TRUNC('week', created_at) AS week FROM applications;

-- Строковые функции
SELECT UPPER(email), LOWER(email), TRIM(email) FROM auth_users;
SELECT CONCAT(first_name, ' ', last_name) FROM profiles;
SELECT LEFT(description, 100) FROM vacancies; -- первые 100 символов

-- COALESCE — первое ненулевое значение
SELECT COALESCE(nickname, full_name, email) AS display_name FROM users;

-- NULLIF — вернуть NULL если значения равны
SELECT NULLIF(salary_max, 0) FROM vacancies; -- 0 → NULL

-- CASE WHEN
SELECT
    id,
    status,
    CASE status
        WHEN 'APPLIED'    THEN 'Подано'
        WHEN 'INTERVIEW'  THEN 'Собеседование'
        WHEN 'OFFER'      THEN '🎉 Оффер!'
        WHEN 'REJECTED'   THEN 'Отказ'
        ELSE 'Неизвестно'
    END AS status_ru
FROM applications;

-- GENERATE_SERIES — генерация последовательностей (для заполнения дат)
SELECT generate_series(
    '2025-01-01'::DATE,
    '2025-12-31'::DATE,
    '1 month'::INTERVAL
) AS month;
```

---

## 10. Сложные запросы — практические задачи

### Задача 1: Найти пользователей без активных откликов за последние 30 дней:
```sql
SELECT u.id, u.email
FROM auth_users u
WHERE NOT EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.user_id = u.id
      AND a.created_at > NOW() - INTERVAL '30 days'
      AND a.status NOT IN ('REJECTED', 'WITHDRAWN')
);
```

### Задача 2: Топ-3 вакансии по числу откликов для каждой компании:
```sql
WITH ranked_vacancies AS (
    SELECT
        v.id,
        v.title,
        c.name AS company,
        COUNT(a.id) AS app_count,
        RANK() OVER (PARTITION BY v.company_id ORDER BY COUNT(a.id) DESC) AS rnk
    FROM vacancies v
    JOIN companies c ON v.company_id = c.id
    LEFT JOIN applications a ON a.vacancy_id = v.id
    GROUP BY v.id, v.title, c.name, v.company_id
)
SELECT company, title, app_count
FROM ranked_vacancies
WHERE rnk <= 3
ORDER BY company, rnk;
```

### Задача 3: Конверсия по этапам воронки:
```sql
WITH funnel AS (
    SELECT
        vacancy_id,
        COUNT(*) FILTER (WHERE status = 'APPLIED')   AS applied,
        COUNT(*) FILTER (WHERE status = 'INTERVIEW')  AS interview,
        COUNT(*) FILTER (WHERE status = 'OFFER')      AS offer,
        COUNT(*) FILTER (WHERE status = 'HIRED')      AS hired
    FROM applications
    GROUP BY vacancy_id
)
SELECT
    v.title,
    f.applied,
    f.interview,
    ROUND(f.interview::NUMERIC / NULLIF(f.applied, 0) * 100, 1) AS interview_rate,
    f.offer,
    f.hired,
    ROUND(f.hired::NUMERIC / NULLIF(f.applied, 0) * 100, 1) AS hire_rate
FROM funnel f
JOIN vacancies v ON f.vacancy_id = v.id
ORDER BY hire_rate DESC NULLS LAST;
```

---

## 11. Основы NoSQL (MongoDB / Redis)

### 🎙️ Вопрос: *"Когда использовать NoSQL вместо реляционной БД?"*

**💡 Ответ:**
> «SQL (реляционные БД) лучше когда: данные структурированы, нужны транзакции ACID, сложные JOIN-запросы.
>
> NoSQL лучше когда: гибкая/меняющаяся схема, огромный объём неструктурированных данных, нужна горизонтальная масштабируемость, низкая latency (кэш).»

### MongoDB — документориентированная БД:
```js
// Документ (аналог строки в SQL)
{
  "_id": ObjectId("..."),
  "title": "Java Developer",
  "company": { "name": "EPAM", "country": "BY" },  // вложенный документ
  "tags": ["java", "spring", "postgres"],            // массив
  "salary": { "min": 2000, "max": 4000, "currency": "USD" }
}

// Основные операции
db.vacancies.insertOne({ title: "Java Dev", ... })
db.vacancies.find({ "company.country": "BY", "tags": "spring" })
db.vacancies.find({ "salary.min": { $gte: 1500 } })
db.vacancies.updateOne({ _id: id }, { $set: { status: "closed" } })
db.vacancies.deleteOne({ _id: id })

// Агрегация (аналог GROUP BY)
db.vacancies.aggregate([
  { $match: { status: "OPEN" } },
  { $group: { _id: "$company.name", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Сравнение SQL vs MongoDB:
| SQL | MongoDB |
|-----|---------|
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary Key | `_id` |
| JOIN | `$lookup` (менее эффективен) |
| FOREIGN KEY | Нет ссылочной целостности |
| ACID транзакции | С версии 4.0 (limited) |

---

## 12. Типичные вопросы интервью

**Q: Чем `WHERE` отличается от `HAVING`?**
A: `WHERE` фильтрует строки до группировки (нельзя агрегаты). `HAVING` фильтрует группы после `GROUP BY` (можно агрегаты).

**Q: Что такое индекс и какой ценой он достигается?**
A: Ускоряет чтение (O(log N) вместо O(N)). Цена: замедляет `INSERT`/`UPDATE`/`DELETE` (нужно обновить индекс), занимает дополнительное место на диске.

**Q: Чем `EXISTS` лучше `IN` для больших подзапросов?**
A: `EXISTS` останавливается при первом найденном совпадении. `IN` вычисляет весь подзапрос. При нескольких тысячах строк `EXISTS` быстрее. Но для малых наборов разница несущественна.

**Q: Что такое Deadlock и как его избежать?**
A: Два процесса блокируют ресурсы и ждут друг друга. PostgreSQL автоматически обнаруживает deadlock и откатывает одну из транзакций. Избегать: всегда блокировать строки в одном порядке, минимизировать время транзакции.

**Q: Что делает `VACUUM` в PostgreSQL?**
A: PostgreSQL использует MVCC — старые версии строк не удаляются сразу при `UPDATE`/`DELETE`, а помечаются "мёртвыми". `VACUUM` физически убирает мёртвые строки и возвращает место. `VACUUM ANALYZE` ещё и обновляет статистику для планировщика. `AUTOVACUUM` делает это автоматически.

**Q: Что такое MVCC?**
A: **Multi-Version Concurrency Control** — механизм PostgreSQL, при котором каждая транзакция видит свой "снимок" данных. При `UPDATE` PostgreSQL не изменяет строку, а создаёт новую версию. Это позволяет читателям не блокировать писателей и наоборот.
