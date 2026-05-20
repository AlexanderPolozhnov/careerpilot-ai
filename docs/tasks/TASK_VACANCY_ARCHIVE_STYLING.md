# Task: Visual Styling for Archived Vacancies

## Контекст и цель
Как Tech Lead, я предлагаю улучшить визуальное различие между активными и архивированными вакансиями в списке. Простого бейджа недостаточно для быстрого сканирования списка. Мы применим эффект "затухания" (dimming) для архивированных элементов.

## Затрагиваемые файлы
- `frontend/src/pages/VacanciesPage.tsx` — визуальные изменения в списке и таблице.

## Ключевые решения по стилизации
1. **Прозрачность:** Установим `opacity-60` для всей карточки/строки. Это стандартный паттерн для неактивного контента.
2. **Насыщенность:** Добавим `grayscale-[0.4]` или `saturate-50`, чтобы приглушить яркие акценты (например, иконку компании или другие бейджи).
3. **Ховер:** При наведении будем слегка увеличивать прозрачность (`hover:opacity-80`), чтобы элемент оставался интерактивным и читаемым при фокусе.

## Frontend: точная реализация

### В списке (List View)
Найти `Link` в `visibleItems.map` и добавить условия в `cn`:
```tsx
// frontend/src/pages/VacanciesPage.tsx (примерно строка 250)
<Link
    key={v.id}
    to={`/app/vacancies/${v.id}`}
    className={cn(
        "group relative flex items-center gap-4 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(139,92,246,0.3)] hover:shadow-[0_0_24px_-8px_rgba(139,92,246,0.2)] transition-all duration-300 no-underline",
        v.status === 'ARCHIVED' && "opacity-60 grayscale-[0.4] hover:opacity-80 hover:grayscale-0"
    )}
    style={{ animationDelay: `${index * 40}ms` }}
>
```

### В таблице (Table View)
Найти `Link` в `visibleItems.map` и добавить условия в `cn`:
```tsx
// frontend/src/pages/VacanciesPage.tsx (примерно строка 300)
<Link
    key={v.id}
    to={`/app/vacancies/${v.id}`}
    className={cn(
        "group grid grid-cols-12 gap-4 px-5 py-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors no-underline",
        v.status === 'ARCHIVED' && "opacity-60 grayscale-[0.4] hover:opacity-80 hover:grayscale-0"
    )}
>
```

## Порядок реализации
1. Обновить `VacanciesPage.tsx`, добавив динамические классы для обоих видов отображения.
2. Проверить визуальный результат: архивированные вакансии должны выглядеть "приглушенно", но восстанавливать четкость при наведении.

## Риски и проверки
- Убедиться, что `cn` (Tailwind Merge) корректно объединяет классы.
- Проверить читаемость текста в архивированном состоянии на темной теме.
