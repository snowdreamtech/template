# Scala Development Guidelines

> Objective: Define standards for idiomatic, safe, and maintainable Scala code (Scala 2 and Scala 3).

## 1. Style & Tooling

- Follow the [Scala Style Guide](https://docs.scala-lang.org/style/). Enforce automatic formatting with **Scalafmt** (configuration in `.scalafmt.conf` committed to the repo).
- Use **Scalafix** for automated linting, refactoring, and migration rules between Scala versions or library upgrades.
- Use `camelCase` for values, variables, and methods. `PascalCase` for classes, traits, and objects. `UPPER_SNAKE_CASE` for constants.
- Prefer `val` (immutable) over `var` (mutable). Treat mutability as a deliberate, documented exception — not the default.
- Use **sbt** or **Mill** as the build tool. Commit `build.sbt` and the sbt wrapper (`sbt` shim) for reproducibility.
- For front-end or embedded targets, use **Scala.js** (compiles to JavaScript) or **Scala Native** (compiles to native binary) to share domain logic across platforms.

## 2. Functional Programming

- Prefer **pure functions**: no side effects, deterministic output for the same input. Push side effects (I/O, logging, external calls) to the boundaries of the system.
- Use **immutable data structures** by default (`List`, `Map`, `Set` from `scala.collection.immutable`).
- Use **pattern matching** (`match { case ... }`) for control flow with algebraic data types and sealed hierarchies. Avoid match fragmentation — handle all cases or add a wildcard.
- Model absence and failure with `Option[T]`, `Either[Error, T]`, or `Try[T]` instead of throwing exceptions or returning `null`.
- Use **for-comprehensions** to chain monadic operations (Option, Either, Future, IO) for readable sequential logic. Avoid deeply nested `flatMap` chains.

## 3. Type System & Scala 3 Features

- Leverage the type system to make illegal states unrepresentable: use **sealed traits + case classes** for algebraic data types (ADTs).
- Avoid `Any` or `AnyRef` as a type; be explicit and use upper type bounds (`T <: SomeBase`).
- In **Scala 3**, prefer `given`/`using` (implicit parameters) over Scala 2's implicit mechanism. Use `extension` methods for adding functionality to existing types without inheritance.
- Use **opaque types** for type-safe domain wrappers: `opaque type UserId = Long`. This avoids primitive obsession without runtime overhead.
- Use `enum` (Scala 3 enums) for algebraic data types and enumerations instead of sealed class hierarchies where concision is valued.

## 4. Concurrency & Effects

- For pure functional effect systems, use **cats-effect** (`IO`) or **ZIO** for managing concurrency, resource lifecycle, and side effects in a composable, testable way.
- For general async, use **Futures** (`scala.concurrent.Future`) with appropriate `ExecutionContext`. Never block a Future thread pool with `Await.result` in production code.
- For reactive streams, use **Akka Streams**, **FS2**, or **ZIO Streams** — choose based on the project's already-adopted effect system.
- For data parallelism with Apache Spark, use the **Dataset[T]** API for type safety over untyped `DataFrame`. Never `.collect()` a large dataset without explicit size constraints.

## 5. Testing

- Use **MUnit** (for Scala 2 & 3) or **ScalaTest** for unit tests.
- Use **ScalaCheck** for property-based testing — generate random inputs to discover edge cases beyond hand-crafted test cases.
- For cats-effect or ZIO code, use their respective testing utilities (`munit-cats-effect`, `zio-test`) for fiber-aware, concurrent test execution.
- Run tests with `sbt test` in CI. Add `scalafmt --check` and `scalafix --check` as CI pre-test gates.
- Use `sbt assembly` or `sbt dist` for packaging. Ensure the build is reproducible by pinning all plugin and dependency versions.
- Use **sbt-scoverage** for code coverage measurement. Set a minimum coverage threshold and fail the build if coverage drops below threshold.
