# Spring Boot Development Guidelines

> Objective: Define standards for building production-grade Java applications with Spring Boot.

## 1. Project Setup

- Use **Spring Initializr** (start.spring.io) for all new projects. Choose the latest stable Spring Boot version.
- Use **Maven** or **Gradle** (the project must pick one and use it consistently). Commit the wrapper (`mvnw` / `gradlew`).
- Structure packages by **feature slice**, not by layer: `com.example.user` (containing `UserController`, `UserService`, `UserRepository`) — not `com.example.controller`.

## 2. Dependency Injection

- Use **constructor injection** exclusively. Never use field injection (`@Autowired` on fields) — it makes testing harder and hides dependencies.
- Declare services with the narrowest needed scope. Prefer `@Service` and `@Repository` stereotypes for clarity.

## 3. REST APIs

- Use `@RestController` for API classes. Map endpoints with `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`.
- Use a consistent response envelope. Return `ResponseEntity<T>` for explicit status codes.
- Validate request bodies with **Bean Validation** annotations (`@NotNull`, `@Size`, `@Valid`). Handle `MethodArgumentNotValidException` globally with `@ControllerAdvice`.

## 4. Configuration & Secrets

- Use `application.yml` (not `.properties`) for multi-level configuration.
- Use **Spring Profiles** (`application-dev.yml`, `application-prod.yml`) for environment-specific config.
- Inject secrets via environment variables or a secrets manager. Never hardcode credentials in config files.

## 5. Testing

- Use `@SpringBootTest` sparingly (it loads the full context — it's slow). Prefer `@WebMvcTest` for controller tests and `@DataJpaTest` for repository tests.
- Use **Testcontainers** for integration tests that require real databases or message brokers.
- Run `./mvnw verify` or `./gradlew test` in CI.
