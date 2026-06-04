# CareerPilot AI Improvement Plan (Architecture & UX)

This document contains a prioritized list of improvements to enhance code quality, performance, and create a "wow effect" for the portfolio.

---

## 🚀 Critical Improvements (Need now)

*All critical architectural improvements for the current phase have been fully implemented.*

---

## ✨ Wow Effect (Future / Advanced)

### 4. Distributed Tracing (Observability)
**Solution:** Integrate OpenTelemetry + Micrometer Tracing.
**Wow Effect:** Ability to visualize request paths via Jaeger/Zipkin. This is a standard for enterprise microservices.

### 5. Real-time Notifications (WebSockets)
**Solution:** Replace polling requests with a persistent connection via Spring WebSockets.
**Wow Effect:** Notifications arrive instantly without page reloads (similar to modern SaaS products).

---

## 🛡️ Security & UX

### 6. Global Rate Limiting
**Solution:** Migrate limits from the aspect-oriented level to a `OncePerRequestFilter` level to protect the entire API from brute-force attempts.

### 7. Optimistic UI Updates
**Solution:** Leverage TanStack Query capabilities for instant list updates (vacancies, tasks) before the server responds.
**Wow Effect:** Feeling of an "instant" user interface (similar to Linear or Vercel).

---

## ✅ Implemented (Archive)
- [x] Asynchronous AI Requests (CompletableFuture + ThreadPool).
- [x] Event-Driven Architecture (Spring Events for notification triggers).
- [x] Performance Tuning (HikariCP tuning, Hibernate batching).
- [x] Asynchronous Email Dispatching (SMTP).
- [x] Aspect-based Rate Limiting for AI endpoints.
- [x] Redis caching of AI query results.
