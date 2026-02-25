# Spring Boot Development Guidelines

> Objective: Define standards for building production-grade Java microservices and web applications with Spring Boot.

## 1. Project Setup & Structure

- Use **Spring Initializr** (start.spring.io) for new projects. Target the latest stable Spring Boot LTS version. Use the Spring Boot parent BOM for dependency management.
- Use **Gradle** (Kotlin DSL `build.gradle.kts`) or **Maven** for builds. Commit the build wrapper (`gradlew` / `mvnw`). Never require a locally-installed Gradle or Maven version.
- Structure packages by **feature slice**, not by layer: `com.example.user` (containing `UserController`, `UserService`, `UserRepository`) — not `com.example.controllers`.
- Use **Spring Boot Actuator** for health checks, metrics, and environment info endpoints. Secure sensitive actuator endpoints (expose only `/health` and `/info` publicly).

## 2. Dependency Injection & Design

- Use **constructor injection** exclusively. Never use field injection (`@Autowired` on fields) — it hides dependencies and makes unit testing without a Spring context impossible.
- Use `@Service`, `@Repository`, and `@Component` stereotypes for self-documentation. Use `@Repository` to enable Spring's persistence exception translation proxy.
- Define service interfaces and inject the interface type — not the concrete implementation class. This enables easy mocking and multiple implementations.
- Use **Spring's `ApplicationEvent`** or a lightweight event bus for decoupling modules within a monolith. Keep business logic decoupled from Spring mechanics.

## 3. REST APIs

- Use `@RestController` for API classes. Map endpoints with `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`.
- Use a consistent response envelope. Return `ResponseEntity<T>` for granular status code control.
- Validate all request bodies and path variables with **Bean Validation** annotations (`@NotNull`, `@Size`, `@Valid`). Handle `MethodArgumentNotValidException` globally with `@ControllerAdvice` to return a structured error response.
- Use **Spring HATEOAS** or at minimum include meaningful error codes and messages in error responses.
- Use `@ExceptionHandler` methods in a `@ControllerAdvice` class for centralized, consistent error mapping across all controllers.

## 4. Configuration, Security & Secrets

- Use `application.yml` (not `.properties`) for multi-level configuration. Use **Spring Profiles** (`application-dev.yml`, `application-prod.yml`) for environment-specific config.
- Inject secrets via environment variables or **Spring Cloud Vault** / **AWS Secrets Manager** integration. Never hardcode credentials or commit them to version control.
- Use **Spring Security** for authentication and authorization. Configure CORS explicitly. Disable CSRF only for stateless REST APIs (use JWT/OAuth instead to protect endpoints).
- Use **OAuth 2.0 / OpenID Connect** (Spring Authorization Server, Keycloak) for production authentication. Never implement custom password hashing.

## 5. Testing & Operations

- Use `@WebMvcTest` for controller-layer tests (fast, no full context load). Use `@DataJpaTest` for repository tests with an embedded H2 or Testcontainers database.
- Use `@SpringBootTest` + **Testcontainers** for full integration tests requiring real infrastructure (Redis, Kafka, Postgres).
- Use **Mockito** with `@MockBean` for unit tests. Use `@ExtendWith(MockitoExtension.class)` for pure unit tests without Spring context overhead.
- Use **JaCoCo** for code coverage reporting. Enforce minimum coverage thresholds in CI.
- Emit **structured JSON logs** via Logback + `logstash-logback-encoder`. Export metrics to Prometheus via **Micrometer** and integrate with Grafana dashboards.
