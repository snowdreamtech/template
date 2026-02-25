# Kotlin Development Guidelines

> Objective: Define standards for idiomatic, safe, and maintainable Kotlin code (Android, backend, and multiplatform).

## 1. Idiomatic Kotlin

- Prefer `val` (immutable) over `var` (mutable). Only use `var` when reassignment is truly necessary.
- Use **data classes** for DTOs, value objects, and simple data holders. Use `copy()` to create modified copies.
- Use `object` for singletons and companion objects for factory methods and constants. Avoid Java-style static utility classes.
- Use scope functions (`let`, `run`, `apply`, `also`, `with`) appropriately and sparingly — prefer them when they genuinely reduce verbosity. Document intent with a comment when use is non-obvious.
- Prefer **extension functions** over utility classes for adding functionality to existing types. Keep extension functions in a dedicated file, not scattered throughout the codebase.

## 2. Null Safety

- Avoid the `!!` (not-null assertion) operator in production code. Use safe calls (`?.`), the Elvis operator (`?:`), or `requireNotNull`/`checkNotNull` with clear error messages.
- Design APIs to be null-free where possible. Use Kotlin's nullable types (`T?`) to represent absence explicitly. Avoid Java's `Optional` class — it is non-idiomatic in Kotlin.
- Use `?.let { }` for conditional logic on nullable values. Prefer `?: return` or `?: throw` for early exits over deeply nested `if (x != null)` checks.
- Annotate Java interop boundaries with `@Nullable` and `@NonNull` (or JSR-305 equivalents) to prevent unexpected nullability platform types.

## 3. Coroutines & Asynchrony

- Use **Kotlin Coroutines** for all asynchronous work. Structure coroutines using `coroutineScope`, `supervisorScope`, and appropriate `CoroutineScope` lifetimes.
- Never use `GlobalScope` in production. Use structured scopes: `viewModelScope` (Android), `lifecycleScope`, or a custom scope with explicit cancellation tied to the component lifecycle.
- Use `Dispatchers.IO` for I/O-bound work and `Dispatchers.Default` for CPU-bound work. Never block `Dispatchers.Main` with long-running operations.
- Use `Flow` for reactive/streaming data instead of `LiveData` or RxJava in new code. Use `stateIn` and `shareIn` for hot flows with proper `SharingStarted` strategies.

## 4. Collections & Functional Style

- Use immutable collections (`listOf`, `mapOf`, `setOf`) by default. Use mutable variants (`mutableListOf`) only when in-place mutation is necessary.
- Use `Sequence` for large or multi-step collection pipelines to enable lazy evaluation and avoid creating intermediate lists.
- Prefer standard library functional operations (`map`, `filter`, `fold`, `groupBy`, `flatMap`) over explicit loops for transformations.
- Use **destructuring declarations** and `Pair`/`Triple` sparingly. Prefer named data classes for multi-value returns from public APIs.

## 5. Testing & Tooling

- Use **JUnit 5** with **MockK** (not Mockito) for mocking Kotlin classes, extension functions, and coroutines. MockK handles Kotlin-specific constructs correctly.
- Use `kotlinx-coroutines-test` (`runTest`, `TestCoroutineScheduler`, `advanceTimeBy`) for deterministic, time-controlled coroutine testing.
- Run tests with `./gradlew test` in CI. Enable the Kotlin compiler's strict mode (`allWarningsAsErrors = true` in Gradle Kotlin DSL).
- Lint with **Ktlint** (style enforcement) or **Detekt** (configurable static analysis). Prefer Detekt for its extensibility and customizable rule sets.
- Use **Kover** (JetBrains) for Kotlin code coverage reporting. Set a minimum coverage threshold in CI.
