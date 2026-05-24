# План улучшения CareerPilot AI (Architecture & UX)

Этот документ содержит приоритетный список улучшений для повышения качества кода, производительности и создания "wow-эффекта" для портфолио.

---

## 🚀 Критически важные (Need now)

*Все критические архитектурные улучшения текущего этапа реализованы.*

---

## ✨ Wow-эффект (Future / Advanced)

### 4. Distributed Tracing (Observability)
**Решение:** Интеграция OpenTelemetry + Micrometer Tracing.
**Wow-эффект:** Возможность визуализировать путь запроса через Jaeger/Zipkin. Это стандарт для Enterprise микросервисов.

### 5. Real-time Notifications (WebSockets)
**Решение:** Замена poll-запросов на постоянное соединение через Spring WebSocket.
**Wow-эффект:** Уведомления приходят мгновенно без перезагрузки страницы (как в современных SaaS).

---

## 🛡️ Безопасность и UX

### 6. Глобальный Rate Limiting
**Решение:** Перенос ограничений с уровня аспектов на уровень `OncePerRequestFilter` для защиты всего API от brute-force.

### 7. Optimistic UI Updates
**Решение:** Использование возможностей TanStack Query для мгновенного обновления списков (вакансии, задачи) до получения ответа от сервера.
**Wow-эффект:** Ощущение "мгновенного" интерфейса (как в Linear или Vercel).

---

## ✅ Реализовано (архив)
- [x] Асинхронные AI запросы (CompletableFuture + ThreadPool).
- [x] Event-Driven Architecture (Spring Events для уведомлений).
- [x] Тюнинг производительности (HikariCP, Hibernate batching).
- [x] Асинхронная отправка Email (SMTP).
- [x] Rate Limiting для AI-эндпоинтов (Aspect-based).
- [x] Redis-кэширование результатов ИИ.
