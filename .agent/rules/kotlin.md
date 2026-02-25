# Kotlin Development Guidelines

> Objective: Define standards for idiomatic, safe, and maintainable Kotlin code across Android, backend (Spring, Ktor), and Kotlin Multiplatform projects.

## 1. Idiomatic Kotlin

- Prefer **`val`** (immutable reference) over **`var`** (mutable reference). Only use `var` when reassignment is genuinely necessary. Immutability prevents accidental state mutation and makes code easier to reason about.
- Use **data classes** for DTOs, value objects, and simple data carriers:

  ```kotlin
  data class CreateUserRequest(
    val name: String,
    val email: String,
    val role: UserRole = UserRole.VIEWER,
  )

  // Copy with modification — no manual constructor call
  val adminRequest = request.copy(role = UserRole.ADMIN)
  ```

- Use **`object`** for singletons. Use **companion objects** for factory methods, constants, and `@JvmStatic` helpers. Avoid Java-style static utility classes:

  ```kotlin
  class User private constructor(val id: UUID, val email: String) {
    companion object {
      fun create(email: String): User = User(UUID.randomUUID(), email.lowercase())
    }
  }
  ```

- Use **scope functions** appropriately. Each has a specific idiom:

  | Function | Receiver | Return | Idiom |
  |---|---|---|---|
  | `let` | `it` | Lambda result | Null check + transformation |
  | `run` | `this` | Lambda result | Configuration + compute |
  | `apply` | `this` | Receiver | Builder pattern / initialization |
  | `also` | `it` | Receiver | Side effects, logging |
  | `with` | `this` | Lambda result | Operate on non-nullable receiver |

  ```kotlin
  val server = Server().apply {
    host = "localhost"
    port = 8080
  }

  user?.let { send(email = it.email, subject = "Welcome") }
  ```

- Use **extension functions** over utility classes for adding functionality to existing types. Keep related extensions in dedicated files:

  ```kotlin
  // extensions/UserExtensions.kt
  fun User.displayName() = fullName ?: email.substringBefore('@')
  fun User.isAdmin() = roles.contains(Role.ADMIN)
  ```

- For **Kotlin Multiplatform (KMP)**: place all shared business logic in `commonMain`. Use `expect`/`actual` for platform-specific implementations (crypto, filesystem, HTTP). Never expose platform-specific APIs directly in `commonMain`.

## 2. Null Safety

- **Avoid the `!!` operator in production code** — it is a runtime `NullPointerException` waiting to happen. Safe alternatives:

  ```kotlin
  // Safe call
  val name = user?.profile?.displayName

  // Elvis with default
  val count = response.items?.size ?: 0

  // Elvis with early return
  val user = repo.findById(id) ?: return Result.failure("User not found")

  // Elvis with exception
  val token = env["API_TOKEN"] ?: error("API_TOKEN environment variable required")

  // requireNotNull with message
  val id = requireNotNull(request.userId) { "userId must not be null for this operation" }
  ```

- Design APIs to be **null-free** at boundaries. Use `sealed class` or `Result<T>` to represent absence or failure rather than nullable return types from service methods:

  ```kotlin
  sealed class UserResult {
    data class Found(val user: User) : UserResult()
    data object NotFound : UserResult()
    data class Error(val message: String) : UserResult()
  }
  ```

- Use **Kotlin's nullable types** (`T?`) to represent absence. Never use Java's `Optional<T>` in Kotlin code — it is verbose and non-idiomatic.
- Annotate **Java interop boundaries** with `@Nullable`/`@NotNull` (or JSR-305 `@Nullable`/`@Nonnull`) to prevent unexpected `!` (platform) types in Kotlin call sites.

## 3. Coroutines & Asynchrony

- Use **Kotlin Coroutines** for all asynchronous work. Structure coroutines using `coroutineScope`, `supervisorScope`, and appropriate `CoroutineScope` lifetimes.
- **Never use `GlobalScope`** in production. Tie coroutines to lifecycle-aware scopes:
  - `viewModelScope` — Android ViewModel
  - `lifecycleScope` — Android Activity/Fragment
  - Custom scope with explicit cancellation in services/jobs

  ```kotlin
  // ❌ Uncancellable — memory/resource leak
  GlobalScope.launch { sendAnalytics() }

  // ✅ Tied to ViewModel lifecycle
  viewModelScope.launch { loadDashboardData() }
  ```

- Use appropriate dispatchers:
  - `Dispatchers.IO` — I/O-bound work (network, file, database)
  - `Dispatchers.Default` — CPU-bound computation (sorting, parsing, encryption)
  - `Dispatchers.Main` — UI updates on Android
  - `Dispatchers.Unconfined` — only in tests, never in production
- Use **`Flow`** for streaming/reactive data in new code. Avoid `LiveData` or RxJava for new features:

  ```kotlin
  // Repository returns Flow
  fun observeUsers(): Flow<List<User>> = db.userDao().observeAll()

  // ViewModel transforms it
  val users: StateFlow<UiState<List<User>>> = userRepository
    .observeUsers()
    .map { UiState.Success(it) }
    .catch { emit(UiState.Error(it.message ?: "Unknown error")) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)
  ```

- Use `withContext(Dispatchers.IO)` explicitly when switching contexts within a suspend function. Never call blocking functions directly in coroutines without switching to `Dispatchers.IO`.
- Use `async`/`await` for parallel concurrent execution:

  ```kotlin
  coroutineScope {
    val profileDeferred = async { fetchProfile(userId) }
    val metricsDeferred = async { fetchMetrics(userId) }
    DashboardData(profile = profileDeferred.await(), metrics = metricsDeferred.await())
  }
  ```

## 4. Collections & Functional Style

- Use **immutable collections** by default: `listOf()`, `mapOf()`, `setOf()`. Use mutable variants (`mutableListOf()`, `mutableMapOf()`) only when in-place mutation is necessary:

  ```kotlin
  // ✅ Immutable by default
  val permissions = setOf("read", "write")

  // ✅ Mutable only when accumulated
  val buffer = mutableListOf<LogEntry>()
  events.forEach { buffer.add(it.toLogEntry()) }
  val snapshot: List<LogEntry> = buffer.toList()  // convert to immutable when done
  ```

- Use `Sequence` for large or multi-step collection pipelines to enable **lazy evaluation** (avoids creating intermediate lists):

  ```kotlin
  val result = largeList.asSequence()
    .filter { it.isValid() }
    .map { it.transform() }
    .take(100)
    .toList()   // evaluated here, each element passes through all steps
  ```

- Use standard functional operations (`map`, `filter`, `fold`, `groupBy`, `flatMap`, `partition`) over explicit `for` loops for collection transformations.
- Prefer **named data classes** over `Pair`/`Triple` for public API return types. `Pair` is fine for internal/local use:

  ```kotlin
  // ❌ Opaque — what is first, what is second?
  fun getStats(): Pair<Int, Int>

  // ✅ Self-documenting
  data class UserStats(val activeCount: Int, val inactiveCount: Int)
  fun getStats(): UserStats
  ```

## 5. Testing & Tooling

### Testing

- Use **JUnit 5** with **MockK** (not Mockito) for mocking Kotlin-idiomatic constructs:

  ```kotlin
  @ExtendWith(MockKExtension::class)
  class UserServiceTest {
    @MockK lateinit var userRepository: UserRepository
    @MockK lateinit var emailService: EmailService
    private lateinit var userService: UserService

    @BeforeEach
    fun setup() { userService = UserService(userRepository, emailService) }

    @Test
    fun `creates user and sends welcome email`() = runTest {
      val request = CreateUserRequest("Alice", "alice@example.com")
      val savedUser = User(UUID.randomUUID(), "Alice", "alice@example.com")

      coEvery { userRepository.save(any()) } returns savedUser
      coJustRun { emailService.sendWelcome(any()) }

      userService.createUser(request)

      coVerify(exactly = 1) { emailService.sendWelcome(savedUser) }
    }
  }
  ```

- Use **`kotlinx-coroutines-test`** for testing coroutines:
  - `runTest` — runs coroutines in a controlled test environment with virtual time
  - `advanceTimeBy()` — controls `delay()` timing
  - `TestCoroutineScheduler` — manual scheduler control
- Run tests with `./gradlew test` in CI. Set `allWarningsAsErrors = true` in Gradle to catch potential issues:

  ```kotlin
  // build.gradle.kts
  kotlin { compilerOptions { allWarningsAsErrors = true } }
  ```

### Tooling

- Lint with **Detekt** (configurable static analysis for Kotlin) committed as `detekt.yml`:

  ```bash
  ./gradlew detekt               # in CI
  ./gradlew detektMain           # main sources only
  ```

- Format with **Ktlint** via Gradle plugin or standalone. Configure code style in `.editorconfig`:

  ```ini
  [*.{kt,kts}]
  indent_size = 4
  continuation_indent_size = 4
  max_line_length = 120
  ```

- Use **Kover** (JetBrains) for Kotlin code coverage reporting in Gradle projects. Set minimum coverage gates:

  ```kotlin
  koverReport { verify { rule { minBound(80) } } }
  ```

- Use **Kotlin Power Assert** (Kotlin 2.0+) for expressive assertion failure messages without external libraries.
- For Android projects, use **`lint`** (Android's built-in static analysis) and the **`compose-lint-checks`** plugin for Compose-specific lint rules.
