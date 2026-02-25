# Swift Development Guidelines

> Objective: Define standards for safe, idiomatic, and performant Swift development (iOS/macOS/visionOS).

## 1. Language Features & Style

- Use `let` by default for all declarations. Only use `var` when mutation is genuinely necessary.
- Use `guard` for early exit and to unwrap optionals at function entry points, reducing nesting and making the happy path obvious.
- Prefer `struct` (value semantics) over `class` (reference semantics). Use `class` only when identity, inheritance, or reference semantics are explicitly required.
- Use `enum` with associated values to model states and results clearly: `enum AuthState { case authenticated(User); case unauthenticated }`.
- Follow the **Swift API Design Guidelines**: use clear, expressive names. Prefer method names that read as grammatical English phrases at the call site.

## 2. Optionals & Error Handling

- Never force-unwrap optionals (`!`) in production code. Use optional binding (`if let`, `guard let`), nil-coalescing (`??`), or `Optional.map`/`flatMap` instead.
- Use `throws`/`try`/`catch` for recoverable errors. Use `Result<T, E>` for APIs where callers decide when to handle errors asynchronously.
- Define domain-specific error enums conforming to the `Error` protocol with descriptive, meaningful cases.
- Avoid returning `nil` to indicate failure — distinguish between "value not found" (use `Optional`) and "operation failed" (use `throws` or `Result`).

## 3. Concurrency (Swift Concurrency)

- Use **`async`/`await`** and Swift's structured concurrency (`Task`, `TaskGroup`, `async let`) for all asynchronous work.
- Mark types and functions updating UI state with `@MainActor`. Define custom **actors** for isolated shared mutable state.
- Prefer `AsyncStream` or `AsyncThrowingStream` for converting delegate/callback patterns to async sequences.
- Avoid data races: use actors, `@Sendable` constraints, and value types. Run with Thread Sanitizer enabled in CI to catch races.
- Never create an unstructured `Task { }` without controlling its cancellation lifecycle. Use structured scopes to ensure tasks are always cancelled when their parent scope exits.

## 4. Architecture & Patterns

- Choose and document an explicit UI architecture: **MVVM** with Combine/Swift Observation, **TCA** (The Composable Architecture), or plain MV for simple screens.
- Keep `UIViewController` / SwiftUI `View` code thin — no business logic, no network calls. Business logic belongs in ViewModels, UseCases, or domain objects.
- Use **Swift Package Manager (SPM)** as the primary dependency manager. Avoid CocoaPods or Carthage for new projects unless required by a specific dependency.
- Prefer **protocol-oriented design**: define capabilities via protocols, provide default implementations via extensions.

## 5. Testing & Tooling

- Use **XCTest** for unit and UI tests. Use the **Swift Testing** framework (Xcode 16+) for new test targets — it offers better async support, expressive macros, and parallel test execution.
- Use `withDependencies` (TCA) or manual dependency injection for testability. Avoid global singletons in testable code.
- Run `xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16'` in CI.
- Lint with **SwiftLint** (configurable rules committed in `.swiftlint.yml`). Use **SwiftFormat** for auto-formatting.
- Enable Thread Sanitizer and Address Sanitizer in the CI test scheme to catch runtime memory issues.
