# Swift Development Guidelines

> Objective: Define standards for safe, idiomatic, and performant Swift development targeting iOS, macOS, and visionOS, covering language features, concurrency, architecture, testing, and tooling.

## 1. Language Features & Style

- Use **`let`** by default for all value declarations. Only use `var` when mutation is genuinely necessary. This makes data flow explicit and prevents accidental mutation.
- Prefer **`struct`** (value semantics, copy-on-write) over `class` (reference semantics). Use `class` only when:
  - Identity semantics are required (the same object referenced from multiple places)
  - Inheritance is required
  - Objective-C interoperability requires a reference type
- Use **`guard`** for early exit and optional unwrapping at function entry points. This keeps the happy path at shallow indentation and makes preconditions clear:

  ```swift
  func process(user: User?) {
    guard let user else {
      logger.warning("process called with nil user")
      return
    }
    guard user.isActive else {
      throw UserError.inactive(userId: user.id)
    }
    // happy path is clear and unindented
    performAction(for: user)
  }
  ```

- Use **`enum` with associated values** to model discriminated unions and state machines clearly:

  ```swift
  enum AuthState {
    case unauthenticated
    case authenticated(User)
    case refreshing(previousUser: User)
    case locked(until: Date, reason: LockReason)
  }
  ```

- Follow the **Swift API Design Guidelines** rigorously: write names that read as grammatical English phrases at the call site. Prefer `removeItem(at:)` over `remove(itemAt:)`. Read more: [swift.org/documentation/api-design-guidelines](https://www.swift.org/documentation/api-design-guidelines/).
- Use `extension` to organize protocol conformances and group related functionality. Each protocol conformance in its own `// MARK: - ProtocolName` extension.
- Use **type aliases** to document domain intent: `typealias UserId = UUID`, `typealias Milliseconds = Double`.

## 2. Optionals & Error Handling

- **Never force-unwrap** optionals (`!`) in production code — it is a runtime crash waiting to happen. Alternatives:

  ```swift
  // Optional binding
  if let name = user.name { use(name) }
  guard let id = response["id"] as? Int else { return }

  // Nil coalescing
  let displayName = user.nickname ?? user.name ?? "Anonymous"

  // Optional chaining
  let count = user.cart?.items.count ?? 0

  // Optional map/flatMap
  let uppercased = user.email.map { $0.uppercased() }
  ```

- Use `throws`/`try`/`catch` for **recoverable errors** that callers must handle. Use `Result<T, E>` for asynchronous APIs where the caller decides when to handle the error:

  ```swift
  // Throwing function
  func loadConfig(from path: URL) throws -> Config { ... }

  // Async Result
  func fetchUser(id: UUID) async -> Result<User, UserError> { ... }
  ```

- Define **domain-specific error enums** conforming to `Error` with meaningful, specific cases:

  ```swift
  enum UserError: LocalizedError {
    case notFound(id: UUID)
    case unauthorized
    case inactive(userId: UUID)
    case networkFailure(underlying: Error)

    var errorDescription: String? {
      switch self {
      case .notFound(let id): "User \(id) not found"
      case .unauthorized: "Unauthorized access"
      case .inactive(let id): "User \(id) account is inactive"
      case .networkFailure(let err): "Network error: \(err.localizedDescription)"
      }
    }
  }
  ```

- Do NOT use `try!` in production code. Use `try?` only when `nil` is a genuinely valid outcome and not a silent failure.
- Do NOT use `as!` force casts. Use `as?` with an explicit fallback or `guard` + `return`.

## 3. Concurrency (Swift Concurrency)

- Use **`async`/`await`** and Swift's structured concurrency (`Task`, `TaskGroup`, `async let`) for all asynchronous work. Eliminate completion callbacks and DispatchQueue-based code in new code:

  ```swift
  func loadDashboard() async throws -> Dashboard {
    async let profile = fetchProfile()
    async let metrics = fetchMetrics()
    async let notifications = fetchNotifications()

    return Dashboard(
      profile: try await profile,
      metrics: try await metrics,
      notifications: try await notifications
    )
  }
  ```

- Mark all code that updates UI state with **`@MainActor`**. Apply to ViewModels and view-related classes:

  ```swift
  @MainActor
  final class UserProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false

    func loadUser(id: UUID) async {
      isLoading = true
      defer { isLoading = false }
      user = try? await userService.fetchUser(id: id)
    }
  }
  ```

- Define custom **actors** for isolated shared mutable state — actors serialize access automatically without explicit locks:

  ```swift
  actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? { cache[url] }

    func store(_ image: UIImage, for url: URL) { cache[url] = image }
  }
  ```

- Use **`AsyncStream`** or **`AsyncThrowingStream`** to bridge delegate and callback-based APIs to async sequences.
- **Never create an unstructured `Task { }`** within a view or ViewModel without controlling its cancellation. Store the `Task` and cancel it on `deinit` or `onDisappear`.
- Use Thread Sanitizer (TSan) in CI test targets to detect data races: `Edit Scheme → Test → Diagnostics → Thread Sanitizer`.

## 4. Architecture & Patterns

### UI Architecture

- Choose and document an explicit UI architecture for the project. Enforce it consistently:
  - **MVVM + Swift Observation** (Xcode 16+): `@Observable` ViewModel, thin View, Model as value types
  - **TCA (The Composable Architecture)**: reducer-based, composable, testable — ideal for complex state
  - **Plain MV**: state in View (SwiftUI's default for simple screens)
- Keep `UIViewController`/SwiftUI `View` code **thin** — no business logic, no network calls, no formatting logic. This responsibility belongs in the ViewModel or UseCase layer.

### Swift Observable (Modern State Management)

- Use **`@Observable`** macro (Swift 5.9+, iOS 17+) as the modern replacement for `@ObservableObject` + `@Published`. It eliminates boilerplate and integrates more efficiently with SwiftUI's rendering:

  ```swift
  // iOS 17+ — preferred
  @Observable
  final class CartViewModel {
    var items: [CartItem] = []
    var isLoading = false

    func addItem(_ item: Product) { items.append(CartItem(product: item)) }
  }
  ```

- For iOS 16 and below support, use `@ObservableObject` + `@Published` with `@StateObject` / `@ObservedObject`.

### Dependencies

- Use **Swift Package Manager (SPM)** exclusively for dependency management in new projects. Avoid CocoaPods or Carthage unless a specific library requires them.
- Define dependencies as protocols and inject implementations. Never access singletons directly in testable code:

  ```swift
  protocol NetworkClient {
    func data(from url: URL) async throws -> (Data, URLResponse)
  }

  final class UserService {
    let network: NetworkClient
    init(network: NetworkClient) { self.network = network }
  }
  ```

- Use **protocol-oriented design**: define capabilities via protocols, provide default implementations via extensions. Prefer protocol composition (`some View & Identifiable`) over deep inheritance.

## 5. Testing & Tooling

### Testing

- Use **Swift Testing** framework (Xcode 16+) for all new test targets — it offers better async support, expressive macros, parameterized tests, and automatic parallel execution:

  ```swift
  import Testing

  @Suite("UserService")
  struct UserServiceTests {
    @Test("fetches user by ID", arguments: [UUID(), UUID()])
    func fetchUser(id: UUID) async throws {
      let service = UserService(network: MockNetworkClient())
      let user = try await service.fetchUser(id: id)
      #expect(user.id == id)
    }

    @Test("throws notFound for missing user")
    func fetchMissingUser() async throws {
      let service = UserService(network: MockNetworkClient(simulateNotFound: true))
      await #expect(throws: UserError.notFound) {
        _ = try await service.fetchUser(id: UUID())
      }
    }
  }
  ```

- Use `withDependencies` (TCA) or manual dependency injection for testability. Never access global singletons in testable code.
- Run tests in CI with:

  ```bash
  xcodebuild test \
    -scheme MyApp \
    -destination 'platform=iOS Simulator,name=iPhone 16' \
    -resultBundlePath TestResults.xcresult \

    | xcbeautify

  ```

- Enable **Thread Sanitizer** and **Address Sanitizer** in CI test schemes for runtime memory and concurrency issue detection.

### Tooling

- Lint with **SwiftLint** — commit `.swiftlint.yml` to enforce project-specific rules:

  ```yaml
  # .swiftlint.yml
  excluded:
    - .build
    - DerivedData

  opt_in_rules:
    - force_unwrapping
    - explicit_init
    - empty_count
    - prefer_self_type_over_type_of_self

  force_cast: error
  force_unwrapping: error
  ```

- Format with **SwiftFormat** — commit `.swiftformat` configuration. Run `swiftformat . --swiftversion 5.10` pre-commit.
- Use **Instruments** (Time Profiler, Memory Debugger, Network Link Conditioner) for performance profiling. Profile on real hardware for battery and thermal performance measurement.
- Use **Swift Macros** (Swift 5.9+) to eliminate boilerplate. Test macros with the `MacroTesting` framework against expected expanded source code.
- Run **`swift test --sanitize thread`** in CI for server-side Swift projects to detect concurrency issues.
