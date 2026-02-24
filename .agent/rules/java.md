# Java Development Guidelines

> Objective: Define standards for clean, idiomatic, and maintainable Java code targeting modern JVM platforms.

## 1. Code Style & Tooling

- Follow the **Google Java Style Guide** or the project's configured style. Enforce automatically with `google-java-format` (Gradle/Maven plugin) or Checkstyle.
- Use 4-space indentation (not tabs). Configure enforcement via `.editorconfig`.
- Class names: `PascalCase`. Method/variable names: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Package names: `lowercase.dotted`.
- Run **SpotBugs** and **PMD** in CI for static analysis beyond style. Use **SonarQube/SonarCloud** for ongoing code quality tracking.

## 2. Language Features

- Target **Java 21 LTS** for new projects. Use `--release 21` in build configuration to enforce the target bytecode version.
- Prefer Java 17+ modern features: **records** (immutable data carriers), **sealed classes** (closed type hierarchies), **pattern matching for `instanceof`**, **text blocks**, and **switch expressions**.
- Use `var` for local variable type inference where the type is obvious from the right-hand side.
- Use `Optional<T>` for return types that can be absent. Never return `null` from a public API method.
- Prefer **immutable data**: use `final` fields, `record` types, and unmodifiable collections (`List.of()`, `Map.copyOf()`, `Set.of()`).

## 3. Exception Handling

- **Checked vs Unchecked**: Use checked exceptions for conditions the caller can reasonably recover from (e.g., `IOException`). Use `RuntimeException` subclasses for programming errors and unrecoverable conditions.
- Never swallow exceptions with an empty `catch` block. At minimum, log the exception with context using a structured logger (SLF4J + Logback/Log4j2).
- Avoid using exceptions for control flow. Use `Optional`, `Result`-style types, or explicit status checks instead.
- Always include the original cause when wrapping exceptions: `throw new ServiceException("Failed to process order", cause)`.

## 4. Architecture & Dependency Injection

- Use a DI framework (**Spring** or **Guice**) for wiring dependencies. Prefer **constructor injection** over field injection (`@Autowired` on a field) for testability and immutability.
- Follow **layered architecture**: Controller → Service → Repository. Keep business logic out of controllers and out of database query methods.
- Use interfaces to define service contracts. Depend on abstractions, not concrete implementations (Dependency Inversion Principle).
- Use **SLF4J** as the logging facade. Never use `System.out.println` or `java.util.logging` in production code.

## 5. Testing & Build

- Use **JUnit 5** with `@ExtendWith(MockitoExtension.class)` and **Mockito** for unit and integration testing.
- Use `@SpringBootTest` for full integration tests; use `@WebMvcTest` or `@DataJpaTest` for slice tests to improve test speed.
- Aim for ≥ 80% code coverage on service and repository layers. Use JaCoCo for coverage reporting.
- Run tests with `./mvnw verify` or `./gradlew test` in CI. Include `mvn spotbugs:check pmd:check` in the build pipeline.
- Use **Testcontainers** for integration tests requiring real databases, message queues, or external services.
