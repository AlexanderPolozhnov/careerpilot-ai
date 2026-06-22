# Архитектурные правила и Решения известных ошибок (из Kopilo)

Этот документ содержит свод важнейших правил разработки и паттернов проектирования, отлаженных в проекте Kopilo. Их необходимо строго соблюдать при переносе и расширении CareerPilot.

---

## 📅 1. Работа с Датами и Временем
> [!IMPORTANT]
> Избегайте использования `LocalDateTime` в сущностях JPA, миграциях и DTO! Это приводит к непредсказуемым сдвигам часовых поясов при сохранении в БД PostgreSQL и отдаче на фронтенд.

* **Правило:** Используйте строго `java.time.Instant` для всех полей временных меток (`created_at`, `updated_at`, `expires_at`, `interview_time` и т.д.).
* **Пример в сущности JPA:**
  ```java
  @Column(name = "expires_at", nullable = false)
  private java.time.Instant expiresAt;
  ```
* **Формат во фронтенде:** Фронтенд ожидает ISO-8601 UTC строки (например, `2026-06-22T15:00:00Z`). Для форматирования на лету под локаль пользователя используйте утилиты `date-fns` с локалью.

---

## 💰 2. Точность Финансовых и Расчетных Данных
> [!WARNING]
> Никогда не используйте типы `Float` или `Double` для хранения цен, балансов или весов ИИ-затрат. Они округляются с накоплением погрешности двоичной арифметики.

* **В Java:** Используйте строго `BigDecimal`. Любые деления и умножения должны сопровождаться явным указанием масштаба (scale) и режима округления `RoundingMode.HALF_UP`.
  ```java
  BigDecimal finalPrice = price.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);
  ```
* **В PostgreSQL:** Используйте тип `NUMERIC(20,8)` (или `NUMERIC(10,2)` для цен подписок).
* **В TypeScript:** Храните как `number` или `string` (для передачи без потери точности при сериализации JSON). В UI для красивой верстки чисел одинаковой ширины используйте шрифт с поддержкой **Inter Tabular Numbers** (`font-feature-settings: "tnum"`).

---

## 🔐 3. Извлечение Текущего Пользователя (Security Context)
* Избегайте прямого парсинга `SecurityContextHolder.getContext().getAuthentication().getName()`.
* Spring Security при неавторизованных запросах может подставлять строковую заглушку `"anonymousUser"`, что вызовет ошибку при попытке привести ее к UUID или email.
* Используйте утилитный класс `SecurityUtils` или централизованный резолвер:
  ```java
  public static UUID getCurrentUserId() {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
          throw new UnauthorizedException("User not authenticated");
      }
      // Возвращаем UUID пользователя
  }
  ```

---

## 🎨 4. Локализация (i18n) без хардкода
* **Строгий запрет:** Запрещено писать русский или английский текст напрямую в кодовой базе фронтенда (`.ts`/`.tsx`) или бэкенда (`.java`).
* **Фронтенд:** Тексты заносятся в JSON-файлы локалей (`ru.json`, `en.json`) и вызываются через хук `useTranslation()`:
  ```tsx
  const { t } = useTranslation();
  return <button>{t('settings.integrations.connect')}</button>;
  ```
* **Бэкенд:** Ответы об ошибках и уведомления бота переводятся через properties-файлы (`messages_ru.properties`, `messages_en.properties`).

---

## 📱 5. Telegram Mini App (TMA) Трапы и Решения

### ⚠️ Баг Черного Экран на iOS/WebKit (AnimatePresence Trap)
* **Проблема:** Из-за бага отрисовки GPU в iOS WebKit при переходе между страницами, обернутыми в родительский `<AnimatePresence mode="wait">` (особенно при переходе на тяжелые страницы оплат или дашборда), экран может полностью погаснуть в черный цвет.
* **Решение:**
  1. Страницы оплат (`/paywall`) и настроек должны рендериться вне родительского `AnimatePresence`. Для этого в `AppShell.tsx` их нужно внести в список исключений `isExcludedFromAnimation`.
  2. При клике на кнопки навигации в `BottomNavigation.tsx` (или внутри роутера) используйте паттерн **"Instant second call"** — повторный программный вызов навигации с задержкой в 50 миллисекунд для принудительного рендеринга страницы:
     ```typescript
     navigate(path);
     setTimeout(() => {
         navigate(path, { replace: true });
     }, 50);
     ```

### ⚠️ Обработка Инвойсов Telegram Stars в Mini App
* Метод `tg.openInvoice()` из WebApp SDK может не всегда корректно вызывать стандартный промис-коллбэк при закрытии окна оплаты (особенно на старых версиях iOS).
* **Решение:** Дополнительно вешайте нативный слушатель событий Telegram WebApp:
  ```typescript
  tg.onEvent('invoice_closed', (eventData) => {
      if (eventData.status === 'paid') {
          showToast('success', 'Оплата успешно проведена!');
          queryClient.invalidateQueries(['subscription']);
      } else {
          showToast('error', 'Оплата отменена или произошла ошибка');
      }
  });
  ```
