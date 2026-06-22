# Собеседование: Spring Framework, Spring Boot, Spring Data JPA & Hibernate

Гайд для подготовки к собеседованию в компанию **CENTAL** (и аналогичные). Охватывает Spring Core, Spring Boot, Spring Data JPA, Hibernate, транзакции, AOP — с практическими примерами из проекта **CareerPilot AI** и честными "ловушками" интервью.

---

## 1. Spring Core: IoC, DI и контейнер

### 🎙️ Вопрос: *"Что такое IoC и DI? В чём разница?"*

**💡 Ответ:**
> «**IoC (Inversion of Control)** — принцип проектирования: управление созданием объектов и их зависимостей передаётся контейнеру (Spring ApplicationContext), а не контролируется кодом вручную. Вместо `new Service()` прямо в коде — Spring сам создаёт и внедряет нужный бин.
>
> **DI (Dependency Injection)** — конкретный паттерн реализации IoC: зависимости передаются объекту извне. В Spring есть три способа:
> 1. **Через конструктор** (рекомендуется) — зависимости `final`, тестирование без рефлексии.
> 2. **Через сеттер** — опциональные зависимости.
> 3. **Через поле `@Autowired`** — не рекомендуется: скрывает зависимости, сложнее тестировать.»

```java
// ✅ Предпочтительно — Constructor Injection (в CareerPilot AI везде так)
@Service
@RequiredArgsConstructor // Lombok генерирует конструктор со всеми final-полями
public class VacancyServiceImpl implements VacancyService {
    private final VacancyRepository vacancyRepository;
    private final VacancyMapper vacancyMapper;
}

// ❌ Плохо — Field Injection
@Service
public class SomeService {
    @Autowired
    private SomeRepository repo; // нельзя сделать final, тест требует Spring-контекст
}
```

### 📋 BeanFactory vs ApplicationContext:
- **BeanFactory** — базовый контейнер, создаёт бины лениво (только по запросу).
- **ApplicationContext** — расширяет BeanFactory, добавляет: события, интернационализацию, AOP. Создаёт синглтон-бины при старте. **Всегда используй ApplicationContext**.

---

## 2. Жизненный цикл бина Spring

### 🎙️ Вопрос: *"Опишите жизненный цикл бина. Где можно встроить свою логику?"*

```
1. BeanDefinition (сканирование @Component/@Bean)
2. Instantiation (вызов конструктора)
3. Dependency Injection (внедрение зависимостей)
4. *Aware interfaces (setBeanName, setApplicationContext)
5. BeanPostProcessor.postProcessBeforeInitialization()  ← @PostConstruct обрабатывается тут
6. InitializingBean.afterPropertiesSet() / @PostConstruct
7. BeanPostProcessor.postProcessAfterInitialization()  ← здесь создаются Proxy (AOP, @Transactional)
8. === БИН ГОТОВ К ИСПОЛЬЗОВАНИЮ ===
9. DisposableBean.destroy() / @PreDestroy
```

```java
@Component
@Slf4j
public class StartupDiagnosticsLogger implements ApplicationRunner {
    @PostConstruct
    public void init() {
        log.info("Bean initialized — all dependencies injected"); // точка расширения
    }

    @PreDestroy
    public void cleanup() {
        log.info("Bean is being destroyed");
    }
}
```

> **Важно:** `@Transactional` и Spring Security работают через **BeanPostProcessor**, который на шаге 7 оборачивает оригинальный бин в прокси-класс (CGLib или JDK Proxy). Именно поэтому **self-invocation** (`this.method()`) не проходит через прокси и `@Transactional` не работает при вызове методов внутри одного класса!

---

## 3. AOP (Аспектно-Ориентированное Программирование)

### 🎙️ Вопрос: *"Что такое AOP и для чего используется в Spring?"*

**💡 Ответ:**
> «**AOP** — техника программирования для вынесения сквозной функциональности (cross-cutting concerns) из бизнес-кода в отдельные модули (**аспекты**). Типичные примеры: логирование, измерение производительности, проверка безопасности, управление транзакциями.
>
> В Spring AOP реализован через **проксирование** — Spring незаметно оборачивает целевой бин в прокси-класс, который перехватывает вызовы методов».

### Ключевые термины AOP:
| Термин | Значение |
|--------|---------|
| **Aspect** | Класс с аспектной логикой (`@Aspect`) |
| **Advice** | Что делать: `@Before`, `@After`, `@Around`, `@AfterReturning`, `@AfterThrowing` |
| **Pointcut** | Где применять: выражение, выбирающее методы/классы |
| **JoinPoint** | Конкретная точка выполнения (вызов метода) |
| **Weaving** | Процесс связывания аспекта с кодом |

```java
@Aspect
@Component
@Slf4j
public class PerformanceMonitorAspect {

    // Pointcut: все публичные методы в пакете service
    @Around("execution(public * com.example.service.*.*(..))")
    public Object measureTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed(); // вызов оригинального метода
        long elapsed = System.currentTimeMillis() - start;
        log.info("Method {} executed in {} ms", joinPoint.getSignature(), elapsed);
        return result;
    }
}
```

### JDK Dynamic Proxy vs CGLib:
- **JDK Proxy** — работает только если бин реализует интерфейс. Создаёт прокси через `java.lang.reflect.Proxy`.
- **CGLib** — наследуется от класса бина, генерирует подкласс. Работает и без интерфейсов. В Spring Boot 2.x+ используется **по умолчанию**. Не может проксировать `final`-классы и `final`-методы!

---

## 4. Spring Boot: Автоконфигурация под капотом

### 🎙️ Вопрос: *"Как работает @SpringBootApplication и автоконфигурация?"*

**💡 Ответ:**
> «`@SpringBootApplication` — это составная аннотация из трёх:
> - `@Configuration` — класс является источником бинов.
> - `@EnableAutoConfiguration` — включает магию автоконфигурации.
> - `@ComponentScan` — сканирует пакет на `@Component`-классы.
>
> Автоконфигурация работает через файл `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Spring Boot 3.x) или `spring.factories` (Boot 2.x). Spring Boot перебирает все `@AutoConfiguration`-классы и применяет те, условия которых выполнены (`@ConditionalOnClass`, `@ConditionalOnMissingBean` и т.д.).»

```yaml
# application.yaml — типичная конфигурация в CareerPilot AI
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:careerpilot_ai}
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate  # Flyway управляет схемой, Hibernate только проверяет
    show-sql: false
  cache:
    type: redis
```

### @Value vs @ConfigurationProperties:
```java
// @Value — для одиночных значений
@Value("${app.frontend-url:http://localhost:5173}")
private String frontendUrl;

// @ConfigurationProperties — для групп настроек (type-safe, валидация)
@ConfigurationProperties(prefix = "app.jwt")
@Validated
public record JwtProperties(
    @NotBlank String secret,
    @Min(60000) long accessTokenExpirationMs,
    @Min(86400000) long refreshTokenExpirationMs
) {}
```

---

## 5. Spring MVC: Обработка HTTP-запросов

### 🎙️ Вопрос: *"Как Spring MVC обрабатывает входящий HTTP-запрос?"*

```
HTTP Request
    ↓
DispatcherServlet (Front Controller)
    ↓
HandlerMapping → находит нужный @Controller/@RestController
    ↓
HandlerAdapter → вызывает метод контроллера
    ↓
@Controller method (десериализация @RequestBody)
    ↓
ViewResolver / @ResponseBody (сериализация в JSON)
    ↓
HTTP Response
```

### Filter vs Interceptor:
- **Filter** (`javax.servlet.Filter`) — работает на уровне сервлет-контейнера (Tomcat), до DispatcherServlet. Перехватывает **все** запросы. В Spring Security используются именно фильтры (`JwtAuthenticationFilter`).
- **Interceptor** (`HandlerInterceptor`) — работает внутри Spring MVC, после DispatcherServlet. Видит только маппинги контроллеров.

```java
// Глобальная обработка исключений — стандарт в CareerPilot AI
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));
        return new ValidationErrorResponse(errors);
    }
}
```

---

## 6. Spring Data JPA и Hibernate

### 🎙️ Вопрос: *"Объясните разницу между JPA, Hibernate и Spring Data JPA"*

**💡 Ответ:**
> - **JPA (Jakarta Persistence API)** — это **спецификация** (набор интерфейсов и аннотаций). Сама по себе не работает, нужна реализация.
> - **Hibernate** — самая популярная **реализация JPA**. Именно Hibernate выполняет SQL-запросы к БД.
> - **Spring Data JPA** — **обёртка** над JPA/Hibernate от Spring. Устраняет бойлерплейт: не нужно писать CRUD вручную, достаточно объявить интерфейс репозитория.»

### Состояния Entity в Hibernate:

```
new MyEntity()          → TRANSIENT  (не связан с Hibernate Session)
    ↓ session.persist() / repo.save()
                        → PERSISTENT (отслеживается Session, flush → SQL)
    ↓ session.detach() / Transaction end
                        → DETACHED   (был в Session, но теперь нет)
    ↓ session.merge()
                        → PERSISTENT (снова отслеживается)
    ↓ session.remove()
                        → REMOVED    (будет удалён при flush/commit)
```

> **LazyInitializationException** — возникает при обращении к LAZY-коллекции после закрытия Session (вне транзакции). Решения: `@Transactional` на методе сервиса, `@EntityGraph`, `JOIN FETCH` в запросе.

---

## 7. Проблема N+1 и её решения

### 🎙️ Вопрос: *"Что такое проблема N+1 в Hibernate и как вы её решаете?"*

**💡 Ответ:**
> «**N+1 проблема** возникает когда мы загружаем N сущностей, а затем для каждой из них Hibernate делает отдельный запрос для загрузки связанных данных (LAZY). Итог: 1 запрос на список + N запросов для деталей = N+1 запросов к БД.»

```java
// ❌ ПРОБЛЕМА: Загружаем 100 вакансий + 100 отдельных запросов для company
List<Vacancy> vacancies = vacancyRepository.findAll();
vacancies.forEach(v -> System.out.println(v.getCompany().getName())); // N+1!

// ✅ РЕШЕНИЕ 1: @EntityGraph (предпочтительно в Spring Data JPA)
@Repository
public interface VacancyRepository extends JpaRepository<Vacancy, UUID> {

    @EntityGraph(attributePaths = {"company", "tags"})
    List<Vacancy> findAllByUserId(UUID userId);
}

// ✅ РЕШЕНИЕ 2: JOIN FETCH в JPQL
@Query("SELECT v FROM Vacancy v JOIN FETCH v.company WHERE v.user.id = :userId")
List<Vacancy> findWithCompany(@Param("userId") UUID userId);

// ✅ РЕШЕНИЕ 3: @BatchSize — загрузка коллекций партиями
@OneToMany(mappedBy = "vacancy", fetch = FetchType.LAZY)
@BatchSize(size = 20)
private List<Application> applications;
```

> **В CareerPilot AI:** Для тяжёлых агрегирующих запросов (Dashboard, списки вакансий со статистикой) мы используем `@EntityGraph(attributePaths = {...})` в репозиториях.

---

## 8. Связи между сущностями

### @OneToMany / @ManyToOne (самая частая связь):
```java
// Правильная двусторонняя связь
@Entity
public class Vacancy {
    @OneToMany(mappedBy = "vacancy", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // избегаем бесконечной рекурсии при сериализации
    private List<Application> applications = new ArrayList<>();
}

@Entity
public class Application {
    @ManyToOne(fetch = FetchType.LAZY) // LAZY — всегда для @ManyToOne!
    @JoinColumn(name = "vacancy_id", nullable = false)
    private Vacancy vacancy;
}
```

### 🔥 Ловушка — CascadeType:
| Тип | Описание |
|-----|---------|
| `PERSIST` | Сохранение родителя → сохранение дочерних |
| `MERGE` | Слияние родителя → слияние дочерних |
| `REMOVE` | Удаление родителя → удаление дочерних |
| `ALL` | Все вышеперечисленные |
| `DETACH` | Detach родителя → detach дочерних |

> `orphanRemoval = true` — при удалении дочерней сущности из коллекции родителя она будет удалена из БД. Работает только при двусторонней связи через `mappedBy`.

### @ManyToMany — лучше явная промежуточная таблица:
```java
// В CareerPilot AI: Vacancy ↔ Tags через vacancy_tags таблицу
@Entity
public class Vacancy {
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "vacancy_tags",
        joinColumns = @JoinColumn(name = "vacancy_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<>();
}
```

---

## 9. Транзакции: @Transactional глубоко

### 🎙️ Вопрос: *"Как работает @Transactional? Назовите уровни propagation."*

**💡 Ответ:**
> «`@Transactional` работает через AOP-прокси. Когда Spring вызывает метод с `@Transactional`, прокси открывает транзакцию в БД, вызывает оригинальный метод, и при успехе — `COMMIT`, при `RuntimeException` — `ROLLBACK`.»

### Propagation (распространение транзакций):
| Тип | Поведение |
|-----|---------|
| `REQUIRED` (**default**) | Присоединиться к существующей или создать новую |
| `REQUIRES_NEW` | Всегда создать новую (текущая приостанавливается) |
| `NESTED` | Вложенная транзакция (savepoint), rollback откатывает только вложенную |
| `SUPPORTS` | Участвует если есть, иначе без транзакции |
| `MANDATORY` | Требует существующей, иначе исключение |
| `NOT_SUPPORTED` | Выполняется без транзакции, текущая приостанавливается |
| `NEVER` | Выбрасывает исключение если есть транзакция |

```java
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;

    // ✅ Правильный подход: отправка письма ПОСЛЕ коммита транзакции
    @Transactional
    public void requestPasswordReset(String email) {
        // 1. Создаём и сохраняем токен
        PasswordResetToken token = new PasswordResetToken(email, generateToken());
        tokenRepository.save(token);

        // 2. Публикуем событие — НЕ вызываем emailService напрямую!
        // Если вызвать emailService здесь, письмо уйдёт до COMMIT транзакции
        // → пользователь получит письмо с токеном, которого нет в БД (ROLLBACK)
        eventPublisher.publishEvent(new PasswordResetRequestedEvent(email, token.getToken()));
    }

    // ✅ Слушатель срабатывает ТОЛЬКО ПОСЛЕ COMMIT
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Async
    public void handlePasswordResetEvent(PasswordResetRequestedEvent event) {
        emailService.sendPasswordResetEmail(event.getEmail(), event.getToken());
    }
}
```

### 🔥 Ловушки @Transactional:

1. **Self-invocation**: Вызов `@Transactional`-метода из того же класса не проходит через прокси → транзакция не создаётся!
2. **`@Async` + `@Transactional`**: Асинхронный метод выполняется в другом потоке → другой контекст транзакции.
3. **По умолчанию rollback только на `RuntimeException`**. Чтобы откатить при checked-исключении: `@Transactional(rollbackFor = Exception.class)`.
4. **`readOnly = true`**: Оптимизация для read-only запросов — Hibernate не отслеживает dirty checking, БД может использовать read-replica.

---

## 10. Flyway: Управление миграциями схемы БД

### 🎙️ Вопрос: *"Зачем нужен Flyway, как он работает?"*

**💡 Ответ:**
> «**Flyway** — инструмент версионирования схемы БД. Он ведёт таблицу `flyway_schema_history`, в которую записывает каждую применённую миграцию с чексуммой. При старте приложения Flyway проверяет, какие миграции ещё не применены, и выполняет их в порядке версии.
>
> Это обеспечивает синхронизацию схемы БД между всеми разработчиками и средами (local/staging/production)».

```
backend/src/main/resources/db/migration/
  V1__init.sql                             ← 15KB, схема с нуля
  V13__add_reset_password_token.sql        ← таблица для сброса пароля
  V14__add_refresh_tokens_table.sql        ← JWT refresh tokens
  V17__add_oauth2_provider_fields.sql      ← поля GitHub/Google OAuth2
  V27__add_gemini_provider.sql             ← последняя миграция
```

> **Правило нашего проекта:** Перед добавлением новой миграции — проверяем последний номер в папке и называем файл `V{N+1}__описание.sql`. Нельзя изменять уже применённые миграции (Flyway проверяет чексумму и упадёт с ошибкой).

### Важные настройки:
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: false  # true только для БД с уже существующей схемой
    out-of-order: false         # запрещаем применение миграций не по порядку
```

---

## 11. Spring Security (кратко, плюс для собеседования)

### Цепочка фильтров (Filter Chain):
```
HTTP Request
    ↓
SecurityFilterChain (упорядоченная цепочка фильтров)
    ├── UsernamePasswordAuthenticationFilter
    ├── JwtAuthenticationFilter (наш кастомный)
    ├── BasicAuthenticationFilter
    ├── ExceptionTranslationFilter
    └── FilterSecurityInterceptor
    ↓
DispatcherServlet
```

### SecurityContext — хранение текущего пользователя:
```java
// Как получить текущего пользователя в CareerPilot AI
public class CurrentUserResolver {
    public static AuthEntity resolveRequired() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Важно! Spring подставляет строку "anonymousUser" для неаутентифицированных
        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getName())) {
            throw new AccessDeniedException("User not authenticated");
        }

        return (AuthEntity) auth.getPrincipal();
    }
}
```

> **Правило проекта:** Никогда не передаём `userId` через параметры запроса если пользователь аутентифицирован — только из SecurityContext!

---

## 12. Карта типичных вопросов интервью

### Быстрые ответы на частые вопросы:

**Q: Чем `@Component`, `@Service`, `@Repository` отличаются технически?**
A: Все три — стереотипные аннотации над `@Component`, регистрируют бин. Разница семантическая. `@Repository` дополнительно переводит `DataAccessException` из специфичных ошибок СУБД.

**Q: Что делает `@Transactional(readOnly = true)`?**
A: Говорит Hibernate отключить dirty checking (не отслеживать изменения), что снижает нагрузку. БД-драйвер может направить запрос на read-replica.

**Q: Что такое `@EntityGraph` и когда его применять?**
A: Позволяет переопределить стратегию загрузки связей для конкретного запроса без изменения маппинга Entity. Применять когда для одного endpoint нужны LAZY-связи, а для другого нет → решает N+1.

**Q: В чём разница `CascadeType.REMOVE` и `orphanRemoval = true`?**
A: `REMOVE` — каскадно удаляет дочерние при удалении родителя. `orphanRemoval` — удаляет дочернюю сущность из БД когда она удалена из коллекции родителя (без удаления самого родителя).

**Q: Можно ли использовать `@Transactional` на private-методах?**
A: Нет! Spring AOP работает через прокси, который не может перехватить private-методы. Аннотация просто будет проигнорирована.

**Q: Что такое OSIV (Open Session In View)?**
A: Паттерн, при котором Hibernate Session держится открытой на время всего HTTP-запроса (включая рендеринг view). В Spring Boot включён **по умолчанию** (`spring.jpa.open-in-view=true`). Считается антипаттерном — лучше явно загружать всё нужное в сервисном слое и отключать: `spring.jpa.open-in-view=false`.
