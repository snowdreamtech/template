# Swift Development Guidelines

> Objective: Define standards for safe, idiomatic, and performant Swift development (iOS/macOS).

## 1. Language Features

- Use `let` by default. Only use `var` when mutation is necessary.
- Use `guard` for early exit and to unwrap optionals at function entry points, reducing nesting.
- Prefer `struct` over `class` for value types. Use `class` only when reference semantics or inheritance are required.
- Use `enum` with associated values to model states and results clearly.

## 2. Optionals

- Never force-unwrap optionals (`!`) in production code. Use optional binding (`if let`, `guard let`) or the nil-coalescing operator (`??`) instead.
- Use `Optional.map` and `flatMap` for chaining operations on optionals cleanly.

## 3. Concurrency (Swift Concurrency)

- Use `async`/`await` and Swift's structured concurrency (`Task`, `TaskGroup`) for all asynchronous work. Avoid legacy completion-handler-based APIs where modern alternatives exist.
- Mark data shared across actors with `@MainActor` for UI updates or use custom actors for isolated state.
- Prefer `AsyncStream` for converting delegate/callback patterns to async sequences.

## 4. Architecture

- Follow a clear UI architecture (e.g., MV, MVVM with Combine/Swift Observation, or TCA).
- Keep `UIViewController` / SwiftUI `View` code thin. Business logic belongs in ViewModels or domain objects.

## 5. Testing

- Use **XCTest** for unit and UI tests.
- Use `XCTAssertEqual`, `XCTAssertNotNil`, and `XCTUnwrap` for assertions.
- Run `xcodebuild test` in CI for automated verification.
