Feature branches — это базовая практика в любой нормальной команде. Суть: **каждая задача делается в отдельной ветке**, а не прямо в `main`.

---

# 🧠 Базовая идея

* `main` → всегда стабильный код (как “прод”)
* `feature/*` → каждая новая фича отдельно
* потом → merge обратно в `main`

---

# 🔁 Типичный workflow

## 1. Обновить main

```bash id="f3c8qz"
git checkout main
git pull origin main
```

---

## 2. Создать feature-ветку

Пример (Applications drag & drop):

```bash id="p2m9wa"
git checkout -b feature/applications-dnd-status
```

---

## 3. Работаешь в этой ветке

* меняешь код
* делаешь изменения
* тестируешь

---

## 4. Коммитишь изменения

```bash id="9xv3kr"
git add .
git commit -m "feat(applications): add drag and drop status update"
```

---

## 5. Пушишь ветку

```bash id="k8d2sn"
git push origin feature/applications-dnd-status
```

---

## 6. Создаёшь Pull Request (PR)

На GitHub:

* base: `main`
* compare: `feature/applications-dnd-status`

---

# 🔄 После merge

Когда PR принят:

```bash id="q1v7lz"
git checkout main
git pull origin main
git branch -d feature/applications-dnd-status
git push origin --delete feature/applications-dnd-status
```

---

# 📌 Как это выглядит в реальной команде

```
main
 ├── feature/auth-jwt
 ├── feature/vacancies-filter
 ├── feature/applications-dnd
 ├── feature/ai-cover-letter
```

---

# 🚀 Почему это важно (для тебя как портфолио)

HR и мидл-разработчики смотрят не только код, но и:

### ✔ Git workflow

* есть ли ветки
* есть ли PR стиль мышления
* есть ли структура работы

### ✔ Это показывает:

* ты не “одним файлом пишешь”
* ты работаешь как в команде
* ты умеешь изолировать фичи

---

# ⚠️ Частые ошибки новичков

❌ работать прямо в `main`
❌ делать один огромный коммит
❌ не удалять feature ветки
❌ пушить всё сразу без структуры

---

# 💡 Как тебе лучше сейчас делать

Для CareerPilot:

### Рекомендуемый порядок:

* `feature/applications-dnd`
* `feature/ai-assistant-improvements`
* `feature/analytics-dashboard`
* `feature/backend-seed-fix`

---