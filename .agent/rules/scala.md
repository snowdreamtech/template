# Scala Development Guidelines

> Objective: Define standards for idiomatic, safe, and maintainable Scala code (Scala 2 and Scala 3), covering style, functional programming, type system, concurrency, and testing.

## 1. Style, Tooling & Project Structure

### Code Style & Formatting

- Follow the [Scala Style Guide](https://docs.scala-lang.org/style/). Enforce automatic formatting with **Scalafmt** — commit `.scalafmt.conf` to the repository:
  ```hocon
  # .scalafmt.conf
  version = "3.8.0"
  runner.dialect = scala3
  maxColumn = 120
  indent.main = 2
  newlines.alwaysBeforeElseAfterCurlyIf = true
  docstrings.style = SpaceAsterisk
  ```
  Run `scalafmt --check` in CI as a mandatory pre-test gate (fail on any formatting diff).
- **Naming conventions** (mandatory):
  - `camelCase`: values, variables, methods, parameters
  - `PascalCase`: classes, traits, objects, type aliases
  - `UPPER_SNAKE_CASE`: constants (`val MAX_CONNECTIONS = 100`)
  - `kebab-case` or `snake_case`: package names (prefer lowercase without separators)
- Prefer **`val`** (immutable) over **`var`** (mutable). Treat `var` as a deliberate, documented exception never as the default.
- Use **Scalafix** for automated linting, refactoring, and deprecation migrations:
  ```bash
  sbt "scalafix RemoveUnused"
  sbt "scalafixCheck"  # fail CI if any fixes are pending
  ```

### Build & Project Structure

- Use **sbt** (preferred for ecosystem integration) or **Mill** as the build tool. Commit the sbt wrapper script for reproducible, team-wide builds:
  ```text
  myproject/
  ├── build.sbt
  ├── project/
  │   ├── Dependencies.scala   # version catalog
  │   └── plugins.sbt          # sbt plugins
  ├── src/
  │   ├── main/scala/          # production code
  │   └── test/scala/          # test code
  └── modules/                 # multi-module layout for large projects
  ```
- Define all dependency versions in a central `project/Dependencies.scala` object. Never scatter version strings across `build.sbt`.
- For cross-platform targets: use **Scala.js** to compile to JavaScript (UIs, shared front/back domain models) or **Scala Native** to compile to native binaries.

## 2. Functional Programming

- Prefer **pure functions**: no side effects, deterministic output for the same input. Push side effects (I/O, logging, external calls, randomness) to the boundaries of the system.
- Use **immutable data structures** by default — `scala.collection.immutable.List`, `Map`, `Set`, `Vector`. Avoid `scala.collection.mutable.*` unless performance profiling proves necessity.
- Use **pattern matching** for control flow on algebraic data types. Exhaust all cases:

  ```scala
  sealed trait Shape
  case class Circle(radius: Double) extends Shape
  case class Rectangle(width: Double, height: Double) extends Shape

  def area(shape: Shape): Double = shape match {
    case Circle(r)         => Math.PI * r * r
    case Rectangle(w, h)   => w * h
    // Scala compiler warns if a case is missing for sealed hierarchies
  }
  ```

- Model absence and failure with **`Option[T]`, `Either[Error, T]`, `Try[T]`** — never throw exceptions for expected failure cases or return `null`:
  ```scala
  def parsePositiveInt(s: String): Either[String, Int] =
    s.toIntOption
      .toRight(s"'$s' is not an integer")
      .filterOrElse(_ > 0, s"'$s' must be positive")
  ```
- Use **for-comprehensions** to chain monadic operations — they are syntactic sugar over `flatMap`/`map` and produce readable sequential logic:
  ```scala
  def createOrder(userId: String, productId: String): Either[AppError, Order] =
    for {
      user    <- userRepo.find(userId).toRight(UserNotFound(userId))
      product <- productRepo.find(productId).toRight(ProductNotFound(productId))
      order   <- orderService.create(user, product)
    } yield order
  ```
- Avoid deeply nested `flatMap` chains — prefer for-comprehensions or functional decomposition.

## 3. Type System & Scala 3 Features

### Algebraic Data Types (ADTs)

- Use **sealed traits + case classes** (Scala 2) or **enum** (Scala 3) for modeling closed type hierarchies:
  ```scala
  // Scala 3 enum (preferred)
  enum PaymentStatus:
    case Pending(amount: BigDecimal)
    case Completed(transactionId: String, timestamp: Instant)
    case Failed(reason: String, retryable: Boolean)
  ```
- Avoid `Any` or `AnyRef` as types. Use upper type bounds (`T <: SomeBase`) or type classes for polymorphism.

### Scala 3 Specific Features

- Use **`opaque type`** for type-safe domain wrappers with zero runtime overhead:
  ```scala
  opaque type UserId = UUID
  object UserId:
    def apply(id: UUID): UserId = id
    extension (id: UserId) def toUUID: UUID = id
  ```
- Use **`given`/`using`** (Scala 3 implicit mechanism) for type class instances and injected dependencies:

  ```scala
  trait JsonEncoder[T]:
    def encode(value: T): String

  given JsonEncoder[User] with
    def encode(user: User): String = s"""{"id":"${user.id}","email":"${user.email}"}"""

  def toJson[T: JsonEncoder](value: T): String = summon[JsonEncoder[T]].encode(value)
  ```

- Use **`extension` methods** to add functionality to existing types without inheritance:
  ```scala
  extension (s: String)
    def toSnakeCase: String = s.replaceAll("([A-Z])", "_$1").toLowerCase.stripPrefix("_")
    def isValidEmail: Boolean = s.matches("""^[^@\s]+@[^@\s]+\.[^@\s]+$""")
  ```
- Use **`union types`** (Scala 3) for compact, readable type alternatives: `def parse(input: String | Int): JsonNode`.

## 4. Concurrency & Effects

### Effect Systems

- For pure functional effect management, use **cats-effect** (`IO`) or **ZIO**:

  ```scala
  // cats-effect 3
  import cats.effect.IO

  def fetchUser(id: UUID): IO[User] = IO.fromFuture(IO(userRepo.findById(id)))
    .flatMap(IO.fromOption(_)(UserNotFound(id)))

  def program: IO[Unit] = for {
    user  <- fetchUser(userId)
    posts <- PostService.listFor(user.id)
    _     <- Console[IO].println(s"${user.name} has ${posts.size} posts")
  } yield ()
  ```

- Use **ZIO** for teams that prefer its richer built-in ecosystem (layers, test, STM, concurrent data structures):
  ```scala
  val program: ZIO[UserRepo & PostService, AppError, Unit] = for
    user  <- ZIO.serviceWithZIO[UserRepo](_.findUser(userId))
    posts <- ZIO.serviceWithZIO[PostService](_.listFor(user.id))
    _     <- Console.printLine(s"${user.name} has ${posts.size} posts")
  yield ()
  ```

### Futures & Existing Code

- For non-effect-system async code, use **Futures** (`scala.concurrent.Future`) with explicit `ExecutionContext`. **Never block a Future thread pool** with `Await.result` in production code:

  ```scala
  // ❌ Blocks a thread — deadlocks under load
  val result = Await.result(fetchUser(id), 30.seconds)

  // ✅ Composable
  fetchUser(id).flatMap(user => fetchPosts(user.id))
  ```

- For reactive streams, use **FS2** (cats-effect ecosystem), **ZIO Streams**, or **Akka Streams** — choose based on the effect system already adopted.
- For Big Data / Spark: use the **`Dataset[T]`** API for type safety over untyped `DataFrame`. Never `.collect()` a large dataset without explicit size constraints or filtering.

## 5. Testing

### Test Frameworks

- Use **MUnit** (lightweight, Scala 2 & 3 compatible) for unit tests, or **ScalaTest** for teams preferring BDD-style specs:
  ```scala
  // MUnit
  class UserServiceSuite extends FunSuite:
    test("find returns None for unknown user") {
      val repo   = MockUserRepo.empty
      val result = UserService(repo).find(UUID.randomUUID())
      assertEquals(result, None)
    }
  ```

### Property-Based Testing

- Use **ScalaCheck** for property-based testing — complement hand-crafted examples with generated inputs:

  ```scala
  import org.scalacheck.Prop.forAll

  property("encodeUser . decodeUser = identity") {
    forAll { (id: UUID, email: String) =>
      val user = User(id, email)
      decodeUser(encodeUser(user)) == Some(user)
    }
  }
  ```

### Effect Testing

- For **cats-effect** code, use `munit-cats-effect` for fiber-aware test execution. For **ZIO** code, use `zio-test` for integrated testing with environment simulation.

### CI & Coverage

- Run tests with `sbt test` in CI. Add `scalafmt --check` and `scalafix --check` as pre-test gates.
- Use **sbt-scoverage** for code coverage reporting. Fail the build if coverage drops below the project threshold:
  ```scala
  // build.sbt
  coverageMinimumStmtTotal := 80
  coverageFailOnMinimum    := true
  ```
- Use `sbt assembly` (fat JAR) or `sbt dist` (universal packaging) for packaging. Ensure reproducible builds by pinning all plugin and dependency versions in `project/plugins.sbt` and `project/Dependencies.scala`.
- Run **sbt-native-packager** or **GraalVM Native Image** for production deployments requiring minimal startup time.
