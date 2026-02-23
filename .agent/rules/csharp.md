# C# / .NET Development Guidelines

> Objective: Define standards for modern, safe, and maintainable C# and .NET applications.

## 1. Language & Style

- Target the latest stable .NET LTS version (e.g., .NET 8+).
- Follow the **Microsoft C# Coding Conventions** and enforce with an `.editorconfig`.
- Use `PascalCase` for types, methods, and properties. Use `camelCase` for local variables and parameters.
- Prefer `var` for local variables when the type is apparent from the right-hand side.

## 2. Nullability

- Enable nullable reference types in all projects: `<Nullable>enable</Nullable>` in `.csproj`.
- Use `?` to explicitly annotate nullable types. Treat all non-nullable references as guaranteed non-null.
- Use the `??` (null-coalescing) and `?.` (null-conditional) operators to handle nulls gracefully.

## 3. Async/Await

- Use `async`/`await` for all I/O-bound operations. Do not use `.Result` or `.Wait()` — they cause deadlocks.
- Suffix all async method names with `Async` (e.g., `GetUserAsync()`).
- Pass and honor `CancellationToken` in all async public APIs.

## 4. Dependency Injection

- Use the built-in `Microsoft.Extensions.DependencyInjection` container.
- Register services with the appropriate lifetime: `AddSingleton`, `AddScoped`, `AddTransient`.
- Prefer constructor injection. Do not use the service locator anti-pattern.

## 5. Testing

- Use **xUnit** for unit tests and **Moq** or **NSubstitute** for mocking.
- Run tests with `dotnet test` in CI.
- Use `dotnet format` and Roslyn analyzers to enforce code quality automatically.
