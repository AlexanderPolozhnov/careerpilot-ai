# Собеседование: Тестирование в Java — JUnit 5, Mockito, Spring Boot Tests

Гайд для подготовки к собеседованию. Охватывает юнит-тестирование (JUnit 5 + Mockito), интеграционное тестирование со Spring Boot, Testcontainers и типичные ловушки в тестировании асинхронного кода и транзакций.

---

## 1. Пирамида тестирования

### 🎙️ Вопрос: *"Какие виды тестов вы знаете? Что такое пирамида тестирования?"*

**💡 Ответ:**
> «**Пирамида тестирования** — концепция распределения усилий по видам тестов:
>
> ```
>          /--\
>         / E2E \          ← Мало (медленные, хрупкие, дорогие)
>        /--------\
>       / Integration \    ← Умеренно (поднимают контекст, БД)
>      /----------------\
>     /   Unit Tests     \  ← Много (быстрые, изолированные, дешёвые)
>    /--------------------\
> ```
>
> - **Unit** — тестирует один класс/метод изолированно, все зависимости заменены моками.
> - **Integration** — тестирует взаимодействие компонентов (Controller → Service → Repository → DB).
> - **E2E (End-to-End)** — тестирует полный пользовательский сценарий через реальный UI/API.»

---

## 2. JUnit 5: Основные аннотации и возможности

### Базовые аннотации:
```java
import org.junit.jupiter.api.*;
import static org.assertj.core.api.Assertions.*;

class VacancyServiceTest {

    @BeforeAll     // Статический метод, выполняется ОДИН раз до всех тестов класса
    static void initAll() { System.out.println("Инициализация тест-ресурсов"); }

    @BeforeEach    // Выполняется перед КАЖДЫМ тестом
    void setUp() { /* подготовка данных */ }

    @AfterEach     // Выполняется после КАЖДОГО теста
    void tearDown() { /* очистка */ }

    @AfterAll      // Статический, один раз после всех тестов
    static void cleanupAll() { /* очистка ресурсов */ }

    @Test
    void shouldCreateVacancy() {
        // AAA Pattern: Arrange → Act → Assert
        // Arrange
        var request = new CreateVacancyRequest("Java Developer", "EPAM");

        // Act
        var result = vacancyService.create(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Java Developer");
    }

    @Test
    @DisplayName("Должен выбросить исключение при дублированном email")
    void shouldThrowWhenEmailDuplicated() {
        assertThatThrownBy(() -> authService.register("existing@email.com", "pass"))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessageContaining("already exists");
    }

    @Disabled("Пропускаем до фикса JIRA-123")
    @Test
    void skippedTest() { }
}
```

### @ParameterizedTest — тест с разными данными:
```java
@ParameterizedTest
@ValueSource(strings = {"", "  ", "\t"})
void shouldFailValidationForBlankTitle(String blankTitle) {
    assertThatThrownBy(() -> vacancyService.create(new CreateVacancyRequest(blankTitle, "EPAM")))
        .isInstanceOf(ConstraintViolationException.class);
}

@ParameterizedTest
@CsvSource({
    "Java Developer, EPAM, true",
    "Python Dev, Google, true",
    ", EPAM, false"  // пустое название → невалидно
})
void shouldValidateVacancy(String title, String company, boolean isValid) {
    // ...
}

@ParameterizedTest
@MethodSource("provideVacancyRequests") // метод-источник данных
void shouldCreateVacancy(CreateVacancyRequest request, String expectedTitle) { }

static Stream<Arguments> provideVacancyRequests() {
    return Stream.of(
        Arguments.of(new CreateVacancyRequest("Java Dev", "EPAM"), "Java Dev"),
        Arguments.of(new CreateVacancyRequest("Backend", "Grid"), "Backend")
    );
}
```

### @Nested — группировка тестов:
```java
@Nested
@DisplayName("Тесты создания вакансии")
class CreateVacancyTests {
    @Test void shouldCreateWithRequiredFields() { }
    @Test void shouldFailWithBlankTitle() { }
}

@Nested
@DisplayName("Тесты обновления вакансии")
class UpdateVacancyTests {
    @Test void shouldUpdateTitle() { }
    @Test void shouldThrowWhenNotFound() { }
}
```

### AssertJ vs JUnit Assertions:
```java
// JUnit Assertions — стандартные, но менее читаемые
assertEquals("Java Dev", vacancy.getTitle());
assertNotNull(vacancy);

// ✅ AssertJ — цепочечный API, более читаемый и информативный
assertThat(vacancy.getTitle()).isEqualTo("Java Dev");
assertThat(vacancy).isNotNull()
    .extracting("title", "status")
    .containsExactly("Java Dev", VacancyStatus.OPEN);

assertThat(vacancies)
    .hasSize(3)
    .extracting(Vacancy::getTitle)
    .containsExactlyInAnyOrder("Dev", "QA", "PM");
```

---

## 3. Mockito: Моки и заглушки

### @Mock, @InjectMocks, @Spy:
```java
@ExtendWith(MockitoExtension.class) // обязательно для работы @Mock в JUnit 5
class VacancyServiceTest {

    @Mock
    VacancyRepository vacancyRepository; // создаёт пустой мок

    @Mock
    VacancyMapper vacancyMapper;

    @InjectMocks
    VacancyServiceImpl vacancyService; // инжектирует все @Mock через конструктор

    @Spy
    List<String> spyList = new ArrayList<>(); // @Spy — реальный объект с возможностью верификации
}
```

| Аннотация | Что делает |
|-----------|-----------|
| `@Mock` | Создаёт "пустой" мок — все методы возвращают null/0/false |
| `@Spy` | Реальный объект — методы работают, но можно stubbing/verify |
| `@InjectMocks` | Создаёт реальный объект и инжектирует все `@Mock`/`@Spy` |
| `@Captor` | Захватывает аргументы, переданные в мок |

### Stubbing (настройка поведения мока):
```java
@Test
void shouldReturnVacancyById() {
    // Arrange: настраиваем поведение мока
    UUID id = UUID.randomUUID();
    Vacancy vacancy = new Vacancy();
    vacancy.setId(id);
    vacancy.setTitle("Java Developer");

    given(vacancyRepository.findById(id)).willReturn(Optional.of(vacancy));
    given(vacancyMapper.toResponse(vacancy)).willReturn(new VacancyResponse(id, "Java Developer"));

    // Act
    VacancyResponse result = vacancyService.findById(id);

    // Assert
    assertThat(result.getTitle()).isEqualTo("Java Developer");
    then(vacancyRepository).should().findById(id); // верификация вызова
}

@Test
void shouldThrowWhenVacancyNotFound() {
    UUID id = UUID.randomUUID();
    given(vacancyRepository.findById(id)).willReturn(Optional.empty());

    assertThatThrownBy(() -> vacancyService.findById(id))
        .isInstanceOf(ResourceNotFoundException.class);
}

// Stubbing void-методов
doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString());
doThrow(new RuntimeException("SMTP error")).when(emailService).sendPasswordResetEmail(anyString(), anyString());
```

### ArgumentCaptor — захват аргументов:
```java
@Test
void shouldSaveVacancyWithCorrectData() {
    ArgumentCaptor<Vacancy> vacancyCaptor = ArgumentCaptor.forClass(Vacancy.class);

    vacancyService.create(new CreateVacancyRequest("Java Dev", "EPAM"));

    verify(vacancyRepository).save(vacancyCaptor.capture());
    Vacancy savedVacancy = vacancyCaptor.getValue();

    assertThat(savedVacancy.getTitle()).isEqualTo("Java Dev");
    assertThat(savedVacancy.getCompany().getName()).isEqualTo("EPAM");
    assertThat(savedVacancy.getCreatedAt()).isNotNull();
}
```

### Verify — проверка вызовов:
```java
// Проверяем что метод был вызван ровно 1 раз
verify(emailService, times(1)).sendPasswordResetEmail("user@test.com", anyString());

// Метод НЕ должен был вызываться
verify(emailService, never()).sendReminderEmail(anyString(), anyString(), anyString());

// Метод вызывался хотя бы один раз
verify(notificationRepository, atLeastOnce()).save(any());

// Больше не должно быть взаимодействий с моком после verify()
verifyNoMoreInteractions(vacancyRepository);
```

---

## 4. Интеграционные тесты в Spring Boot

### @SpringBootTest — полный контекст:
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional // каждый тест откатывается — не загрязняет БД
class VacancyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VacancyRepository vacancyRepository;

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void shouldReturnVacanciesList() throws Exception {
        mockMvc.perform(get("/api/v1/vacancies")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andDo(print()); // печатает запрос/ответ в консоль
    }

    @Test
    void shouldCreateVacancy() throws Exception {
        var request = new CreateVacancyRequest("Java Developer", "EPAM");

        mockMvc.perform(post("/api/v1/vacancies")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", "Bearer " + getTestToken()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title").value("Java Developer"));
    }
}
```

### Срезы (Slices) — тесты только нужного слоя:
```java
// @WebMvcTest — только слой контроллеров (без БД, без полного контекста)
@WebMvcTest(VacancyController.class)
class VacancyControllerSliceTest {
    @Autowired MockMvc mockMvc;
    @MockBean VacancyService vacancyService; // моком заменяем сервис
    @MockBean JwtService jwtService;
}

// @DataJpaTest — только слой репозиториев (H2 in-memory или Testcontainers)
@DataJpaTest
class VacancyRepositoryTest {
    @Autowired VacancyRepository vacancyRepository;
    @Autowired TestEntityManager entityManager;

    @Test
    void shouldFindVacanciesByUserId() {
        // entityManager.persist(...) для подготовки данных
        var found = vacancyRepository.findAllByUserId(userId);
        assertThat(found).hasSize(2);
    }
}
```

---

## 5. Testcontainers — реальная БД в тестах

### 🎙️ Вопрос: *"Что такое Testcontainers и зачем использовать вместо H2?"*

**💡 Ответ:**
> «**Testcontainers** — библиотека, которая запускает реальные Docker-контейнеры (PostgreSQL, Redis, Kafka) прямо в тестах. Гарантирует что тесты выполняются против той же СУБД, что в продакшне, а не против H2 с иным диалектом SQL.»

```java
@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
class ApplicationIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("careerpilot_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource // регистрируем datasource до создания ApplicationContext
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", () -> redis.getMappedPort(6379));
    }

    @Test
    void shouldRunFlywayMigrationsAndPersistData() {
        // Тест против реального PostgreSQL
    }
}
```

### Переиспользование контейнеров (оптимизация скорости):
```java
// Вместо @Container на каждый тест-класс — общий статический контейнер
abstract class BaseIntegrationTest {

    static final PostgreSQLContainer<?> postgres;

    static {
        postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withReuse(true); // Testcontainers не убивает контейнер между классами
        postgres.start();
    }
}

class VacancyRepositoryTest extends BaseIntegrationTest { }
class ApplicationRepositoryTest extends BaseIntegrationTest { }
// Один контейнер на все классы — значительно быстрее!
```

---

## 6. Тестирование специфичных ситуаций

### Тестирование @Async методов — типичная ловушка:

```
⚠️ ПРОБЛЕМА: @Async методы выполняются в пуле потоков.
В тестах нет гарантии что асинхронный метод завершится до Assert.
```

```java
// ❌ Нестабильный тест — иногда проходит, иногда нет
@Test
void testAsyncEmail() {
    authService.requestPasswordReset("user@test.com");
    verify(emailService).sendPasswordResetEmail("user@test.com", anyString()); // может упасть!
}

// ✅ Решение 1: Переопределить TaskExecutor в тест-конфигурации
@TestConfiguration
public class TestAsyncConfig {
    @Bean
    @Primary
    public Executor taskExecutor() {
        return new SyncTaskExecutor(); // выполняет задачи синхронно в том же потоке
    }
}

// ✅ Решение 2: Awaility — ожидание условия с таймаутом
@Test
void testAsyncEmail() {
    authService.requestPasswordReset("user@test.com");

    Awaitility.await()
        .atMost(5, TimeUnit.SECONDS)
        .untilAsserted(() ->
            verify(emailService).sendPasswordResetEmail("user@test.com", anyString())
        );
}
```

> **В CareerPilot AI:** При наличии `@Async` в тестах всегда используем `SyncTaskExecutor` через `@TestConfiguration`.

### Тестирование транзакционного поведения:
```java
@Test
@Transactional
void shouldRollbackOnException() {
    // @Transactional на тест — автоматический ROLLBACK после теста (не загрязняет БД)
    vacancyRepository.save(testVacancy);
    assertThat(vacancyRepository.count()).isEqualTo(1);
    // После теста — всё откатится
}

// Проверяем что метод сервиса делает rollback при исключении
@Test
void shouldRollbackServiceOnError() {
    assertThatThrownBy(() -> vacancyService.createWithInvalidData());
    // Проверяем что ничего не сохранилось
    assertThat(vacancyRepository.findAll()).isEmpty();
}
```

### Мокирование Security Context:
```java
// spring-security-test
@Test
@WithMockUser(username = "user@test.com") // создаёт фиктивный SecurityContext
void shouldReturnCurrentUser() throws Exception {
    mockMvc.perform(get("/api/v1/profile"))
        .andExpect(status().isOk());
}

// Для кастомных UserDetails
@Test
@WithUserDetails("admin@test.com") // ищет пользователя через UserDetailsService
void shouldAllowAdminAccess() throws Exception { }
```

---

## 7. Test Doubles: Термины (Mock vs Stub vs Fake vs Spy)

| Тип | Определение | Пример |
|-----|-------------|--------|
| **Dummy** | Объект передаётся, но не используется | null, new Object() |
| **Stub** | Возвращает заданные данные, нет верификации | `given(repo.findById(id)).willReturn(...)` |
| **Mock** | Ожидает конкретные вызовы, верифицирует их | `verify(service).send(...)` |
| **Spy** | Реальный объект + возможность проверки/перехвата | `@Spy List<String> list` |
| **Fake** | Рабочая упрощённая реализация | In-memory репозиторий вместо JPA |

---

## 8. Типичные вопросы интервью

**Q: В чём разница между `@Mock` и `@MockBean`?**
A: `@Mock` — Mockito-аннотация, создаёт мок без Spring. `@MockBean` — Spring Boot, добавляет мок в ApplicationContext, заменяя реальный бин. `@MockBean` медленнее (пересоздаёт контекст), нужен только когда тест загружает Spring Context.

**Q: Почему `@Transactional` на тест-классе откатывает изменения?**
A: Spring открывает транзакцию перед тестом и принудительно делает ROLLBACK после него, даже если не было исключения. Это гарантирует изоляцию тестов.

**Q: Что такое `@DirtiesContext` и когда его использовать?**
A: Говорит Spring пересоздать ApplicationContext после теста. Нужен когда тест изменяет состояние контекста (например, меняет `@Bean` через рефлексию). Используется редко — дорого (долгий пересоздаёт контекст).

**Q: Что лучше: H2 или Testcontainers для интеграционных тестов?**
A: Testcontainers предпочтительнее для проектов с PostgreSQL/MySQL специфичным SQL (jsonb, window functions, специфичные типы). H2 удобен для быстрых тестов репозиториев с ANSI SQL.

**Q: Что такое Test Pyramid и почему E2E тестов должно быть мало?**
A: E2E тесты медленные (минуты), хрупкие (зависят от UI/сети), дорогие в поддержке. Юнит-тесты — секунды, изолированы, легко поддерживаются. Правило: если что-то можно проверить юнит-тестом — проверяй юнит-тестом.

**Q: Как тестировать код с `@Scheduled`?**
A: Вызвать метод напрямую в тесте (он просто обычный метод). Или использовать `@SpringBootTest` с `@EnableScheduling` и `Awaitility` для ожидания выполнения.
