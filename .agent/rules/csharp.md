# C# / .NET Development Guidelines

> Objective: Define standards for modern, safe, and maintainable C# and .NET applications, covering language features, nullability, async/await, architecture, testing, and ASP.NET Core patterns.

## 1. Language, Style & Configuration

### Version & SDK Pinning

- Target the latest stable **.NET LTS version** (currently .NET 8; or .NET 10 when released) for new projects. Pin the SDK in `global.json`:

  ```json
  {
    "sdk": {
      "version": "8.0.400",
      "rollForward": "patch"
    }
  }
  ```

- Enable language features in `.csproj`:

  ```xml
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <WarningsAsErrors />
    <LangVersion>latest</LangVersion>
  </PropertyGroup>
  ```

### Naming & Style

- Follow **Microsoft C# Coding Conventions**. Enforce with an `.editorconfig` committed to the repository:
  - `PascalCase`: types, methods, properties, public members, constants
  - `camelCase`: local variables, parameters
  - `_camelCase`: private instance fields (prefix with `_`)
  - `IPascalCase`: interfaces
- Use `var` when the type is apparent from the right-hand side. Specify the type explicitly for clarity when the right-hand side doesn't reveal the type.
- Use **`record`** types (C# 9+) for immutable data transfer objects:

  ```csharp
  // Immutable DTO with value equality
  public record CreateUserRequest(string Name, string Email, UserRole Role = UserRole.Viewer);

  // Mutation via `with` expression — returns a new instance
  var adminRequest = request with { Role = UserRole.Admin };

  // Value type record for small, stack-allocated objects
  public readonly record struct Point(double X, double Y);
  ```

- Enable all Roslyn analyzers. Use `#pragma warning disable` sparingly — always add a comment explaining why. Configure analyzer severity in `.editorconfig`.
- Use **`required` members** (C# 11+) on DTOs and configuration types to enforce initialization:

  ```csharp
  public class AppSettings {
    public required string ConnectionString { get; init; }
    public required string JwtSecret { get; init; }
    public int MaxRetries { get; init; } = 3;
  }
  var settings = new AppSettings { ConnectionString = "...", JwtSecret = "..." };
  ```

## 2. Nullability & Safety

- Enable **nullable reference types** in all projects (`<Nullable>enable</Nullable>`). Treat all non-annotated reference types as guaranteed non-null. This eliminates entire classes of `NullReferenceException`.
- Use `?` to explicitly annotate nullable types. Use `??` and `?.` operators:

  ```csharp
  string? name = user?.Profile?.DisplayName;
  string displayName = name ?? user.Email.Split('@')[0];
  ```

- Avoid `null` return values from public APIs. Prefer patterns that make the absence explicit:

  ```csharp
  // ✅ TryGet pattern
  bool TryGetUser(string id, out User? user) { ... }

  // ✅ Result pattern (OneOf, ErrorOr, or custom)
  public async Task<Result<User, UserError>> FindUserAsync(string id) { ... }

  // ✅ Option-style (never return null from a repository - use None)
  public async Task<User?> FindByIdAsync(string id) { ... }  // acceptable for data access
  ```

- Use **`ArgumentNullException.ThrowIfNull()`** (C# 10+) for null guard clauses:

  ```csharp
  public UserService(IUserRepository repo) {
    ArgumentNullException.ThrowIfNull(repo);
    _repo = repo;
  }
  ```

- Use **`is` pattern matching** for type narrowing and null checks:

  ```csharp
  if (result is { IsError: false } success)
      return success.Value;

  if (user is not null and { IsActive: true })
      ProcessActiveUser(user);
  ```

## 3. Async/Await & Concurrency

- Use **`async`/`await`** for all I/O-bound operations. **Never call `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()`** on async methods — they cause deadlocks in ASP.NET Core and UI frameworks:

  ```csharp
  // ❌ Deadlock-prone
  var user = userService.GetUserAsync(id).Result;

  // ✅ Fully async
  var user = await userService.GetUserAsync(id);
  ```

- Suffix **all async method names with `Async`**: `GetUserAsync()`, `SaveOrderAsync()`.
- Always accept and honor **`CancellationToken`** in public async APIs. Pass it to all downstream async calls:

  ```csharp
  public async Task<User?> GetUserAsync(string id, CancellationToken ct = default) {
    return await _db.Users
      .FirstOrDefaultAsync(u => u.Id == id, ct);   // pass ct here
  }
  ```

- Use **`IAsyncEnumerable<T>`** with `await foreach` for streaming data instead of loading datasets into memory:

  ```csharp
  public async IAsyncEnumerable<User> StreamActiveUsersAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
  {
    await foreach (var user in _db.Users.Where(u => u.IsActive).AsAsyncEnumerable().WithCancellation(ct))
      yield return user;
  }
  ```

- For CPU-bound parallelism, use **`Parallel.ForEachAsync`** (C# 10+) or `Channel<T>` for producer-consumer:

  ```csharp
  await Parallel.ForEachAsync(items, new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
    async (item, ct) => await ProcessItemAsync(item, ct));
  ```

- Configure `ConfigureAwait(false)` in **library code** (not in ASP.NET Core applications) to avoid capturing unnecessary synchronization contexts.

## 4. Dependency Injection & Architecture

### DI & Service Registration

- Use the built-in **`Microsoft.Extensions.DependencyInjection`** container. Register services with the appropriate lifetime:

  ```csharp
  // Startup.cs / Program.cs
  builder.Services.AddSingleton<IEmailTemplateCache, InMemoryEmailTemplateCache>();
  builder.Services.AddScoped<IUserService, UserService>();      // per-request in ASP.NET Core
  builder.Services.AddTransient<IEmailSender, SmtpEmailSender>(); // new instance per injection
  ```

  Use `Scoped` for most services in ASP.NET Core (tied to the HTTP request lifetime). Use `Singleton` only for genuinely stateless, thread-safe services.
- Prefer **constructor injection**. Do not use the service locator anti-pattern (`IServiceProvider` injected into business logic classes).
- Use **primary constructors** (C# 12) for clean DI:

  ```csharp
  public class UserService(IUserRepository repo, IEmailSender email, ILogger<UserService> logger) {
    public async Task<User> CreateUserAsync(CreateUserRequest req, CancellationToken ct) {
      var user = new User { Name = req.Name, Email = req.Email };
      await repo.AddAsync(user, ct);
      await email.SendWelcomeAsync(user, ct);
      logger.LogInformation("User {UserId} created", user.Id);
      return user;
    }
  }
  ```

### Architecture

- Follow **Clean/Layered Architecture**: API → Application (use cases) → Domain (entities, domain logic) → Infrastructure (EF Core, external services). Business logic lives in Domain/Application, never in Controllers or Infrastructure.
- Use **MediatR** for decoupling commands and queries (CQRS) in complex applications:

  ```csharp
  public record CreateUserCommand(string Name, string Email) : IRequest<User>;

  public class CreateUserCommandHandler(IUserRepository repo) : IRequestHandler<CreateUserCommand, User> {
    public async Task<User> Handle(CreateUserCommand cmd, CancellationToken ct) {
      var user = new User { Name = cmd.Name, Email = cmd.Email };
      await repo.AddAsync(user, ct);
      return user;
    }
  }
  ```

## 5. Testing & Tooling

### Unit & Integration Tests

- Use **xUnit** for unit and integration tests. Use **NSubstitute** for mocking (preferred over Moq for C# 8+ projects):

  ```csharp
  public class UserServiceTests {
    private readonly IUserRepository _repo = Substitute.For<IUserRepository>();
    private readonly IEmailSender _email = Substitute.For<IEmailSender>();

    [Fact]
    public async Task CreateUser_SendsWelcomeEmail() {
      var service = new UserService(_repo, _email, NullLogger<UserService>.Instance);
      var req = new CreateUserRequest("Alice", "alice@example.com");

      await service.CreateUserAsync(req, default);

      await _email.Received(1).SendWelcomeAsync(Arg.Is<User>(u => u.Email == "alice@example.com"), Arg.Any<CancellationToken>());
    }
  }
  ```

- Use **`WebApplicationFactory<TProgram>`** for ASP.NET Core integration tests:

  ```csharp
  public class UserEndpointTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>> {
    [Fact]
    public async Task CreateUser_Returns201() {
      var client = factory.CreateClient();
      var res = await client.PostAsJsonAsync("/api/users", new { Name = "Alice", Email = "alice@example.com" });
      Assert.Equal(HttpStatusCode.Created, res.StatusCode);
    }
  }
  ```

- Use **Testcontainers for .NET** for real database integration tests.
- Use **Bogus** for realistic test data generation.

### CI & Quality Tools

- Run `dotnet test --configuration Release --collect:"XPlat Code Coverage"` in CI. Enforce minimum coverage with `dotnet-coverage`.
- Run `dotnet format --verify-no-changes` in CI for formatting.
- Use **BenchmarkDotNet** for micro-benchmarks on performance-critical paths. Profile with Visual Studio, dotTrace, or `dotnet-trace` before optimizing.
- Use **Source Generators** (C# 9+) for compile-time code generation to reduce reflection overhead and improve AOT (Ahead-of-Time compilation) compatibility: `System.Text.Json` source generation, regex compilation with `[GeneratedRegex]`, DI registration generators.
- Enable **`PublishAot`** for latency-sensitive microservices — compile to native code with no JIT, providing fast startup and low memory.
