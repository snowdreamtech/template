# Kotlin Development Guidelines

> Objective: Define standards for idiomatic, safe, and maintainable Kotlin code.

## 1. Idiomatic Kotlin

- Prefer `val` (immutable) over `var` (mutable). Only use `var` when reassignment is truly necessary.
- Use data classes for DTOs, value objects, and simple data holders.
- Use `object` for singletons and companion objects for factory methods and constants.
- Leverage scope functions (`let`, `run`, `apply`, `also`, `with`) appropriately to reduce verbosity.

## 2. Null Safety

- Avoid the `!!` (not-null assertion) operator in production code. Use safe calls (`?.`), the Elvis operator (`?:`), or `requireNotNull`/`checkNotNull` with clear messages.
- Design APIs to be null-free where possible; use Kotlin's nullable types (`T?`) to represent absence explicitly. Avoid Java's `Optional` class — it is non-idiomatic in Kotlin.

## 3. Coroutines

- Use Kotlin Coroutines for all asynchronous work. Avoid blocking calls on the main thread.
- Always use a structured coroutine scope (`viewModelScope`, `lifecycleScope`, or a custom `CoroutineScope`). Never use `GlobalScope` in production.
- Use `Dispatchers.IO` for I/O-bound work and `Dispatchers.Default` for CPU-bound work.

## 4. Collections & Sequences

- Use immutable collections (`listOf`, `mapOf`) by default. Use mutable variants (`mutableListOf`) only when needed.
- Use `Sequence` for large collection pipelines to enable lazy evaluation and avoid intermediate list creation.

## 5. Testing

- Use **JUnit 5** with **MockK** for mocking Kotlin classes and coroutines.
- Use `kotlinx-coroutines-test` (`runTest`, `TestCoroutineScheduler`) for testing coroutine-based code.
- Run tests with `./gradlew test` in CI.
