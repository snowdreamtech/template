# Java Development Guidelines

> Objective: Define standards for clean, idiomatic, and maintainable Java code.

## 1. Code Style

- Follow the **Google Java Style Guide** or the project's configured formatter (e.g., via `google-java-format` or Checkstyle).
- Use 4-space indentation (not tabs).
- Class names: `PascalCase`. Method/variable names: `camelCase`. Constants: `UPPER_SNAKE_CASE`.

## 2. Language Features

- Prefer Java 17+ LTS features: records, sealed classes, pattern matching for `instanceof`, and text blocks.
- Use `var` for local variable type inference where the type is obvious from context.
- Use `Optional<T>` for return types that can be absent. Never return `null` from a public API.
- Prefer immutable data: use `final` fields and unmodifiable collections (`List.of()`, `Map.copyOf()`).

## 3. Exception Handling

- **Checked vs Unchecked**: Use checked exceptions for recoverable conditions; use `RuntimeException` subclasses for programming errors.
- Never swallow exceptions with an empty `catch` block. At minimum, log the error.
- Avoid using exceptions for control flow.

## 4. Dependency Injection & Architecture

- Use a DI framework (Spring, Guice) for wiring dependencies. Prefer constructor injection over field injection for testability.
- Follow layered architecture (Controller → Service → Repository). Keep business logic out of controllers.

## 5. Testing

- Use **JUnit 5** and **Mockito** for unit and integration testing.
- Aim for high coverage on service and repository layers.
- Run tests with `./mvnw verify` or `./gradlew test` in CI.
