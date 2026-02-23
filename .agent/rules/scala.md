# Scala Development Guidelines

> Objective: Define standards for idiomatic, safe, and maintainable Scala code.

## 1. Style & Conventions

- Follow the [Scala Style Guide](https://docs.scala-lang.org/style/). Enforce with **Scalafmt** for formatting and **Scalafix** for linting/refactoring.
- Use `camelCase` for values and methods, `PascalCase` for classes and objects, `UPPER_SNAKE_CASE` for constants.
- Prefer `val` (immutable) over `var` (mutable). Treat mutability as a last resort.

## 2. Functional Programming

- Prefer **pure functions**: no side effects, same input always produces the same output.
- Use **immutable data structures** by default (`List`, `Map`, `Set` from `scala.collection.immutable`).
- Use **pattern matching** (`match { case ... }`) for control flow involving algebraic data types, instead of `if/else` chains.
- Model absence and failure with `Option[T]`, `Either[Error, T]`, or `Try[T]` instead of throwing exceptions or returning `null`.

## 3. Type System

- Leverage the type system to make illegal states unrepresentable: use sealed traits + case classes for algebraic data types (ADTs).
- Avoid using `Any` or `AnyRef` as a type; be explicit.
- Use `implicit`s (or Scala 3's `given`/`using`) sparingly and document them clearly — implicit resolution can be difficult to debug.

## 4. Apache Spark (if applicable)

- Use the **Dataset[T]** API for type-safe transformations over untyped `DataFrame` where performance allows.
- Define schemas explicitly with `Encoders` or `StructType` rather than relying on schema inference.
- Avoid actions (`.collect()`, `.show()`) in loops — structure code to minimize Spark job submissions.

## 5. Testing

- Use **ScalaTest** or **MUnit** for unit tests.
- For Spark jobs, use **Spark testing base** or run tests against a local `SparkSession`.
- Run tests with `sbt test` in CI.
