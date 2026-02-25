# Spring Boot Development Guidelines

> Objective: Define standards for building production-grade Java microservices and web applications with Spring Boot, covering project setup, dependency injection, REST APIs, security, testing, and cloud-native deployment.

## 1. Project Setup & Structure

### Bootstrapping

- Use **Spring Initializr** (start.spring.io) for new projects. Target the latest stable Spring Boot LTS version. Use the Spring Boot parent BOM for aligned dependency versions:

  ```kotlin
  // build.gradle.kts
  plugins {
    id("org.springframework.boot") version "3.3.0"
    id("io.spring.dependency-management") version "1.1.5"
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.spring") version "2.0.0"
  }

  java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }
  ```

- Use **Gradle** (Kotlin DSL `build.gradle.kts`) for new projects — more type-safe than Groovy DSL and Maven. Commit the Gradle wrapper (`gradlew`). Never require a locally-installed Gradle version.
- Target **Java 21 LTS** for new projects. Use virtual threads with Spring Boot 3.2+.

### Package Structure

- Structure packages by **feature slice**, not by technical layer. Related classes live together:
  ```text
  src/main/java/com/example/
  ├── user/
  │   ├── UserController.java
  │   ├── UserService.java
  │   ├── UserRepository.java
  │   ├── User.java              (entity)
  │   └── dto/
  │       ├── CreateUserRequest.java
  │       └── UserResponse.java
  ├── order/
  └── MyApplication.java
  ```

### Actuator & Native

- Use **Spring Boot Actuator** for health checks, metrics, and environment info. Secure sensitive actuator endpoints — expose only `/actuator/health` and `/actuator/info` publicly. Protect `/actuator/env`, `/actuator/heapdump` behind admin authentication.
- For cloud-native deployments with fast startup requirements, use **Spring AOT + GraalVM Native Image** (Spring Boot 3+) to compile to a native executable:
  ```bash
  ./gradlew nativeCompile   # produces native binary in build/native/nativeCompile/
  ```

## 2. Dependency Injection & Design

### Constructor Injection

- Use **constructor injection exclusively**. Never use field injection (`@Autowired` on fields) — it hides dependencies, breaks testability outside Spring context, and prevents `final` field declarations:

  ```java
  // ❌ Field injection — hidden dependency, can't test without Spring
  @Service
  public class UserService {
    @Autowired
    private UserRepository repo;  // not final, non-obvious
  }

  // ✅ Constructor injection — explicit, testable, final
  @Service
  public class UserService {
    private final UserRepository repo;
    private final EventPublisher  events;

    public UserService(UserRepository repo, EventPublisher events) {
      this.repo   = repo;
      this.events = events;
    }
  }
  ```

- Use `@RequiredArgsConstructor` from **Lombok** with `final` fields to generate constructor injection boilerplate.

### Stereotypes & Patterns

- Use `@Service` for business logic, `@Repository` for data access (enables exception translation), `@Component` for general-purpose beans. Use `@Controller`/`@RestController` for MVC/REST layers.
- Define service **interfaces** and inject the interface type — not the concrete implementation — to enable mocking and multiple implementations:

  ```java
  public interface NotificationService {
    void sendWelcome(User user);
  }

  @Service
  class EmailNotificationService implements NotificationService { ... }
  ```

- Use **`ApplicationEvent`** for decoupling module interactions within a monolith. Business logic raises events; listeners in other modules respond asynchronously.

## 3. REST APIs

### Controllers & Responses

- Use `@RestController` and `@RequestMapping` for API classes. Map endpoints with `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`.
- Return **`ResponseEntity<T>`** for granular status code control. Use consistent response envelopes:

  ```java
  @PostMapping
  public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
    User user = userService.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.fromEntity(user));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> findById(@PathVariable UUID id) {
    return userService.findById(id)
      .map(UserResponse::fromEntity)
      .map(ResponseEntity::ok)
      .orElseThrow(() -> new UserNotFoundException(id));
  }
  ```

### Validation & Error Handling

- Validate all request bodies and parameters with **Bean Validation** (`@NotNull`, `@Email`, `@Size`, `@Valid`):
  ```java
  public record CreateUserRequest(
    @NotBlank @Size(max = 100) String name,
    @NotNull @Email             String email,
    @NotNull                    UserRole role
  ) {}
  ```
- Handle validation and domain errors globally in a `@ControllerAdvice` class:

  ```java
  @RestControllerAdvice
  public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
      var errors = ex.getBindingResult().getFieldErrors().stream()
        .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
        .toList();
      return new ErrorResponse("VALIDATION_ERROR", "Validation failed", errors);
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(UserNotFoundException ex) {
      return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }
  }
  ```

## 4. Configuration, Security & Secrets

### Configuration Management

- Use `application.yml` for multi-level, readable configuration. Use **Spring Profiles** for environment-specific configuration:

  ```yaml
  # application.yml
  spring:
    datasource:
      url: ${DATABASE_URL}
      username: ${DB_USER}
    jpa:
      hibernate.ddl-auto: validate # never use update/create in prod
      open-in-view: false # disable OSIV

  management.endpoints.web.exposure.include: health,info
  ```

- Inject secrets via environment variables or a secrets manager. Never hardcode credentials — never commit them to version control.
- Use **`@ConfigurationProperties`** with `@Validated` for type-safe configuration binding:
  ```java
  @ConfigurationProperties(prefix = "app")
  @Validated
  public record AppConfig(@NotBlank String jwtSecret, @Min(1) int maxRetries) {}
  ```

### Security

- Use **Spring Security** for authentication and authorization. Configure CORS explicitly via `CorsConfigurationSource`.
- Disable CSRF only for stateless REST APIs (using JWT/OAuth for protection). Enable CSRF for browser-based session forms.
- Use **OAuth 2.0 / OpenID Connect** (Spring Authorization Server, Keycloak) for production authentication. Never implement custom JWT parsing logic without review.

## 5. Testing & Operations

### Testing Layers

- Use **`@WebMvcTest`** for controller-layer tests (fast, loads only web layer):

  ```java
  @WebMvcTest(UserController.class)
  class UserControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean  UserService userService;

    @Test
    void createUser_Returns201() throws Exception {
      when(userService.create(any())).thenReturn(new User(UUID.randomUUID(), "Alice", "alice@example.com"));

      mockMvc.perform(post("/api/users")
          .contentType(MediaType.APPLICATION_JSON)
          .content("""{"name":"Alice","email":"alice@example.com","role":"VIEWER"}"""))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Alice"));
    }
  }
  ```

- Use **`@DataJpaTest`** for repository tests. Use **Testcontainers** for a real PostgreSQL in integration tests.
- Use **`@SpringBootTest`** + Testcontainers for full E2E integration tests requiring real infrastructure.
- Use **Mockito** with `@MockBean` for unit tests. Use `@ExtendWith(MockitoExtension.class)` for pure unit tests without Spring context.

### Observability & Operations

- Emit **structured JSON logs** via Logback + `logstash-logback-encoder`. Include correlation IDs (using MDC):
  ```java
  MDC.put("requestId", request.getHeader("X-Request-ID"));
  ```
- Export metrics to Prometheus via **Micrometer** (`micrometer-registry-prometheus`). Create custom metrics for business KPIs with `MeterRegistry`.
- Use **JaCoCo** for code coverage. Enforce minimum coverage in Gradle:
  ```kotlin
  tasks.test { finalizedBy(tasks.jacocoTestReport) }
  tasks.jacocoTestCoverageVerification {
    violationRules { rule { limit { minimum = "0.80".toBigDecimal() } } }
  }
  ```
- Enable **Virtual Threads** (Spring Boot 3.2+ with Java 21) for near-zero-cost thread-per-request concurrency in I/O-bound applications:
  ```yaml
  spring.threads.virtual.enabled: true
  ```
