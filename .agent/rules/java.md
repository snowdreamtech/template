# Java Development Guidelines

> Objective: Define standards for clean, idiomatic, and maintainable Java code targeting modern JVM platforms (Java 21+), covering code style, language features, architecture, testing, and build pipeline.

## 1. Code Style, Tooling & Build

- Follow the **Google Java Style Guide** or the project's configured style. Enforce automatically with `google-java-format` (Gradle/Maven plugin, commit hook) or Checkstyle with a project-committed configuration file.
- Use 4-space indentation (not tabs). Enforce via `.editorconfig` committed to the repository. Configure the IDE to respect `.editorconfig`.
- **Naming conventions** (mandatory):
  - `PascalCase`: classes, interfaces, enums, records, annotations
  - `camelCase`: methods, variables, parameters
  - `UPPER_SNAKE_CASE`: constants (`static final` fields)
  - `lowercase.dotted`: package names (e.g., `com.example.users.service`)
  - Never abbreviate names except for universally understood short forms (`id`, `url`, `dto`, `ctx`)
- Run **SpotBugs** and **PMD** in CI for static analysis beyond style. Use **SonarQube/SonarCloud** for ongoing code quality tracking: code smells, duplications, and security hotspots.
- Pin the JDK version via a committed toolchain config. Specify the target bytecode with `--release 21` (Maven) or `java.toolchain.languageVersion = JavaLanguageVersion.of(21)` (Gradle). Use the Gradle/Maven wrapper so the JDK version is self-documented and reproducible.
- Build dependency specifications: use BOM (Bill of Materials) for dependency version management. In Spring Boot projects, extend `spring-boot-dependencies` BOM. Never use ranges (`[1.0,)`) — pin exact versions.

## 2. Language Features (Java 21+)

- Target **Java 21 LTS** for new projects. Use modern Java features to write more concise, expressive code:

### Records (Immutable Data Carriers)

```java

// ✅ Use records for immutable DTOs and value objects
public record CreateUserRequest(
    @NotBlank @Size(max = 100) String name,
    @Email @NotBlank String email
) {}

public record UserId(String value) {
  public UserId {
    Objects.requireNonNull(value, "UserId.value must not be null");
    if (value.isBlank()) throw new IllegalArgumentException("UserId must not be blank");
  }
}

```

### Sealed Classes & Pattern Matching

```java

// Closed type hierarchy with pattern matching
public sealed interface Result<T> permits Result.Success, Result.Failure {
  record Success<T>(T value) implements Result<T> {}
  record Failure<T>(String error, Throwable cause) implements Result<T> {}
}

// Pattern matching switch (Java 21)
String message = switch (result) {
  case Result.Success<User> s -> "Created user: " + s.value().name();
  case Result.Failure<User> f -> "Error: " + f.error();
};

```

### Other Features

- Use **`var`** for local variable type inference where the type is obvious from context. Specify explicitly when the type aids clarity (especially for generic types).
- Use **`Optional<T>`** for return types representing absent values. Never return `null` from a public API method. Use `Optional.map()`, `Optional.filter()`, `Optional.orElseThrow()` — avoid `Optional.get()` without a check.
- Prefer **immutable collections**: `List.of()`, `Map.of()`, `Set.of()`, `Map.copyOf()`. Use `Collections.unmodifiableList()` when wrapping mutable collections.
- Use **Virtual Threads** (Java 21, Project Loom) for I/O-bound concurrency. They replace manual thread-pool tuning for most server applications:

  ```java
  // Spring Boot 3.2+ — enable virtual threads globally
  spring.threads.virtual.enabled=true

  // Manual executor with virtual threads
  try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    futures = tasks.stream().map(task -> executor.submit(task)).toList();
  }
  ```

- Use **text blocks** (Java 15+) for multi-line strings (SQL, JSON templates, HTML). They preserve indentation accurately and improve readability.

## 3. Exception Handling & Logging

- **Checked vs Unchecked exceptions**: Use checked exceptions for conditions the caller can reasonably recover from (`FileNotFoundException`, `IOException`). Use `RuntimeException` subclasses for programming errors, invariant violations, and unrecoverable states.
- **Never swallow exceptions** with an empty `catch` block. At minimum, log the exception with context and propagate or rethrow:

  ```java
  // ❌ Exception graveyard
  try { ... } catch (Exception e) { }

  // ✅ Log with context and rethrow
  try { ... } catch (IOException e) {
    log.error("Failed to process file '{}': {}", filePath, e.getMessage(), e);
    throw new FileProcessingException("Failed to process file: " + filePath, e);
  }
  ```

- Always include the **original cause** when wrapping exceptions: `throw new ServiceException("operation context", cause)`.
- **Never use exceptions for control flow.** Use `Optional`, explicit status checks, or a `Result<T>` type pattern.
- Use **SLF4J** as the logging facade with **Logback** or **Log4j2** as the implementation. Never use `System.out.println` or `java.util.logging.Logger` directly in production code.
- Structured logging best practices:

  ```java
  // ✅ Use parameterized logging — prevents string concatenation when log level is disabled
  log.info("Processing order {} for user {}", orderId, userId);
  // ✅ Include context in structured fields
  log.atInfo()
     .addKeyValue("orderId", orderId)
     .addKeyValue("userId", userId)
     .log("Processing order");
  ```

## 4. Architecture & Dependency Injection

### Layered Architecture

- Follow strict **layered architecture**: Controller (HTTP) → Service (business logic) → Repository (data access). Dependencies MUST only point inward:
  - Controllers: authenticate, authorize, parse/validate params, call service, render response. Zero business logic.
  - Services: business rules, transactions, orchestration. No SQL. No HTTP.
  - Repositories: data access. No business logic. Return domain objects.

### Dependency Injection (Spring)

- Use **Spring (Spring Boot)** or **Guice** for DI. Prefer **constructor injection** over field injection (`@Autowired` on fields):

  ```java
  // ✅ Constructor injection — testable, immutable, dependencies explicit
  @Service
  public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, EmailService emailService) {
      this.userRepository = userRepository;
      this.emailService = emailService;
    }
  }

  // ❌ Field injection — hides dependencies, hard to test
  @Autowired private UserRepository userRepository;
  ```

- Use **interfaces** for service contracts. Depend on abstractions (the interface), not concrete implementations (Dependency Inversion Principle).
- Prefer **Spring WebFlux** (reactive) for high-throughput, I/O-intensive services. Use **Spring MVC** (with virtual threads) for CPU-bound workloads or teams unfamiliar with reactive patterns.

## 5. Testing & CI/CD

### Testing Strategy

- Use **JUnit 5** with **Mockito** for unit and integration tests:

  ```java
  @ExtendWith(MockitoExtension.class)
  class UserServiceTest {
    @Mock UserRepository userRepository;
    @Mock EmailService emailService;
    @InjectMocks UserService userService;

    @Test
    void createUser_sendsWelcomeEmail() {
      var request = new CreateUserRequest("Alice", "alice@example.com");
      when(userRepository.save(any())).thenReturn(savedUser);
      userService.createUser(request);
      verify(emailService).sendWelcome(savedUser.email());
    }
  }
  ```

- Use **Spring Boot Test slices** for integration tests — use the most narrow slice possible:

  | Annotation | What it loads | Use for |
  |---|---|---|
  | `@WebMvcTest` | Web layer only | Controller + filter tests |
  | `@DataJpaTest` | JPA + database | Repository tests |
  | `@SpringBootTest` | Full context | End-to-end integration tests |

- Use **Testcontainers** for integration tests requiring real PostgreSQL, Redis, Kafka, or other external services:

  ```java
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
  ```

- Aim for ≥ 80% coverage on service and repository layers. Use **JaCoCo** for coverage reporting. Gate on coverage in CI with `failOnViolation = true`.
- Run `./gradlew test jacocoTestReport` or `./mvnw verify` in CI. Include `spotbugs`, `pmd`, and `checkstyle` as build validation steps.

### Native Image & Performance

- Use **GraalVM Native Image** (via Spring Boot 3+ AOT or Quarkus) for startup-time-critical microservices (serverless functions, CLI tools). Validate native image compatibility in CI using `./gradlew nativeTest`.
- Profile JVM applications with **async-profiler** (flame graphs) or **JDK Mission Control + Flight Recorder** for production profiling. Integrate Flight Recorder in staging environments for continuous profiling.
- Use **JVM GC monitoring**: log GC events with `--Xlog:gc*:file=gc.log:time,uptime`. Configure G1GC (default in Java 21) with explicit region sizes for latency-sensitive services.
