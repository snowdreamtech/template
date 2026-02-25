# C# / .NET Development Guidelines

> Objective: Define standards for modern, safe, and maintainable C# and .NET applications.

## 1. Language & Style

- Target the latest stable **.NET LTS version** (e.g., .NET 8 or .NET 10) for new projects. Specify the target in `global.json` to pin the SDK version for all contributors.
- Follow the **Microsoft C# Coding Conventions** and enforce with an `.editorconfig` committed to the repository.
- Use `PascalCase` for types, methods, properties, and public members. Use `camelCase` for local variables and parameters. Prefix private fields with `_` (e.g., `_userService`).
- Use `var` for local variables when the type is apparent from the right-hand side. Specify the type explicitly when it improves clarity.
- Enable all Roslyn analyzers and treat warnings as errors (`<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`) in production project files. Use `#pragma warning disable` sparingly and always with a comment.

## 2. Nullability & Safety

- Enable nullable reference types in all projects: `<Nullable>enable</Nullable>` in `.csproj`. Treat all non-nullable references as guaranteed non-null.
- Use `?` to explicitly annotate nullable types. Use `??` (null-coalescing) and `?.` (null-conditional) operators to handle nulls gracefully.
- Avoid `null` return values from public APIs. Prefer `bool TryGet(out T value)`, discriminated union-style patterns, or `Result<T, E>` wrappers.
- Use `required` members (C# 11+) on DTOs and configuration types to enforce initialization without constructors.

## 3. Async/Await & Concurrency

- Use **`async`/`await`** for all I/O-bound operations. Never call `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on async methods — they cause deadlocks in synchronization-context-aware environments.
- Suffix all async method names with `Async` (e.g., `GetUserAsync()`).
- Always accept and honor `CancellationToken` in all async public APIs. Pass it through to all downstream async calls.
- Use `IAsyncEnumerable<T>` with `await foreach` for streaming data sources instead of loading entire datasets into memory.
- For CPU-bound parallelism, use `Parallel.ForEachAsync`, `Task.WhenAll`, or `Channel<T>` for producer-consumer patterns.

## 4. Dependency Injection & Architecture

- Use the built-in **`Microsoft.Extensions.DependencyInjection`** container. Register services with the appropriate lifetime: `AddSingleton`, `AddScoped`, `AddTransient`.
- Prefer **constructor injection**. Do not use the service locator anti-pattern (`IServiceProvider` injected into business logic).
- Follow clean/layered architecture: API/Controller → Application Service → Domain → Infrastructure. Keep business logic in domain/application layers, not in controllers or data access code.
- Use **MediatR** or a custom mediator for decoupling commands and queries (CQRS pattern) in complex applications.

## 5. Testing & Tooling

- Use **xUnit** for unit tests and **NSubstitute** (preferred) or **Moq** for mocking. Use **Bogus** for test data generation.
- Use `WebApplicationFactory<T>` for integration tests against ASP.NET Core endpoints. Use **Testcontainers for .NET** for real database integration tests.
- Run tests with `dotnet test --configuration Release` in CI. Enforce coverage with `dotnet-coverage` and a minimum threshold.
- Use `dotnet format` and Roslyn analyzers (including `Microsoft.CodeAnalysis.NetAnalyzers`) for automated code quality enforcement.
- Use **BenchmarkDotNet** for micro-benchmarks on performance-critical code paths. Profile with Visual Studio or dotTrace before optimizing.
