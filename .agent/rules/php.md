# PHP Development Guidelines

> Objective: Define standards for modern, secure, and maintainable PHP code, covering language features, type safety, security, architecture patterns, testing, and high-concurrency deployments.

## 1. PHP Version, Standards & Tooling

### Version & Modern Features

- Target **PHP 8.3+** for all new projects. Use modern native PHP features:
  - **Readonly properties/classes** (8.1/8.2): `readonly class UserDTO { public function __construct(public readonly string $name) {} }`
  - **Enums** (8.1): `enum Status: string { case Active = 'active'; case Deleted = 'deleted'; }`
  - **Fibers** (8.1): for cooperative multitasking in async contexts
  - **Named arguments**: `array_slice(array: $items, offset: 0, length: 10, preserve_keys: true)`
  - **First-class callables**: `$fn = strlen(...)` — creates a `Closure` from any callable
  - **Intersection types** and **`never`** return type

### Code Standards

- Follow **PSR-12** coding standards. Enforce automatically with **PHP CS Fixer** (`php-cs-fixer.dist.php` committed to repo):
  ```bash
  php-cs-fixer fix --dry-run --diff src/     # CI check
  php-cs-fixer fix src/                       # local auto-fix
  ```
- Use **Composer** for dependency management. Commit `composer.lock`. Build for production:
  ```bash
  composer install --no-dev --optimize-autoloader --classmap-authoritative
  ```
- Use **Rector** for automated code upgrades when migrating PHP versions or major dependencies:
  ```bash
  vendor/bin/rector process --dry-run   # preview changes
  vendor/bin/rector process             # apply changes
  ```
- Generate and maintain API documentation using **`dedoc/scramble`** (Laravel) or `zircote/swagger-php` for OpenAPI/Swagger docs.

## 2. Type Safety

### Strict Types

- Enable strict mode at the top of **every PHP file** — it enforces strict scalar type declaration checking:
  ```php
  <?php
  declare(strict_types=1);
  ```
- Add explicit type declarations for all function parameters and return types:

  ```php
  // ✅ Fully typed
  function calculateTax(float $amount, float $rate): float {
    return $amount * $rate;
  }

  // ✅ Union types (PHP 8.0+)
  function findUser(int|string $identifier): User {
    return is_int($identifier)
      ? $this->repo->findById($identifier)
      : $this->repo->findByEmail($identifier);
  }

  // ✅ Nullable
  function findBySlug(string $slug): ?Post {
    return $this->repo->findOne(['slug' => $slug]);
  }
  ```

- Use **`never`** return type for functions that always throw or terminate:
  ```php
  function fail(string $message): never {
    throw new DomainException($message);
  }
  ```

### Value Objects & Immutability

- Use **readonly properties** and **readonly classes** (PHP 8.2+) for immutable value objects and DTOs:

  ```php
  readonly class Money {
    public function __construct(
      public readonly int    $amount,
      public readonly string $currency,
    ) {
      if ($this->amount < 0) throw new InvalidArgumentException("Amount must be non-negative");
    }

    public function add(Money $other): self {
      if ($this->currency !== $other->currency) throw new CurrencyMismatchException();
      return new self($this->amount + $other->amount, $this->currency);
    }
  }
  ```

- Use PHP **Enums** (8.1+) over class constants for fixed value sets. Backed enums (`string`/`int`) support serialization:

  ```php
  enum OrderStatus: string {
    case Pending   = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';

    public function canTransitionTo(self $next): bool {
      return match($this) {
        self::Pending => $next === self::Confirmed || $next === self::Cancelled,
        default       => false,
      };
    }
  }
  ```

## 3. Security

### Input Validation

- Never trust external input. Validate and sanitize all data from `$_GET`, `$_POST`, `$_COOKIE`, request bodies, and external APIs using a validation library:

  ```php
  // Symfony Validator
  $violations = $validator->validate($dto);
  if (count($violations) > 0) throw new ValidationException($violations);

  // Laravel
  $validated = $request->validate(['email' => 'required|email|max:255']);
  ```

### SQL & Password Security

- Use **prepared statements via PDO** or a query builder for all database interactions:

  ```php
  // ❌ SQL injection
  $pdo->query("SELECT * FROM users WHERE email = '$email'");

  // ✅ Parameterized
  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
  $stmt->execute(['email' => $email]);
  ```

- Hash passwords with **`password_hash()`** using `PASSWORD_ARGON2ID` (preferred) or `PASSWORD_BCRYPT` (cost ≥ 12). Never use `md5()`, `sha1()`, or symmetric encryption for passwords.
- Verify with `password_verify()`. Use `password_needs_rehash()` on login to transparently upgrade hash parameters.

### HTTP Security Headers

- Configure security headers via middleware or framework configuration for every response:
  - `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`
- Run **Psalm** or **PHPStan** with security-focused plugins (`psalm-plugin-security`) for static taint analysis and SQL injection detection.

## 4. Architecture & Patterns

### Dependency Injection

- Avoid static methods, global functions, and `Facade::staticCall()` for internal application code. Use **dependency injection** (DI containers) throughout:
  ```php
  // ✅ Constructor injection
  class UserService {
    public function __construct(
      private readonly UserRepository $repo,
      private readonly EventDispatcher $events,
    ) {}
  }
  ```
- Use **PHP-DI**, Symfony's DI Container, or Laravel's Service Container. Prefer autowiring for clean, minimal service registrations.

### Layered Architecture

- Separate concerns strictly: HTTP Layer (Controllers) → Application (Services/Use Cases/Commands) → Domain (Entities, Value Objects, Domain Services) → Infrastructure (Repositories, API adapters, DB).
- Define **Value Objects** for domain concepts with identity-by-value (`Email`, `Money`, `PhoneNumber`). Make them immutable using readonly classes.
- Use **Command/Query Responsibility Segregation (CQRS)** in complex domains — separate read models from write models.

## 5. Testing & Tooling

### Testing Stack

- Use **PHPUnit** for unit and integration tests. Use **Pest** (built on PHPUnit) for expressive, behavior-driven test syntax in new projects:

  ```php
  it('creates a user with valid data', function () {
    $user = createUser(name: 'Alice', email: 'alice@example.com');
    expect($user->name)->toBe('Alice')
      ->and($user->email)->toBe('alice@example.com');
  });

  it('throws on duplicate email', function () {
    createUser(email: 'alice@example.com');
    expect(fn () => createUser(email: 'alice@example.com'))
      ->toThrow(DuplicateEmailException::class);
  });
  ```

- Use **PHPStan** at the highest tolerable level (`--level max` or 8+) for static analysis. Run in CI and block merges on errors:
  ```bash
  vendor/bin/phpstan analyse --level 8 src/ tests/
  ```
- Use **Infection** (mutation testing) to evaluate test suite quality beyond raw coverage metrics.

### Coverage & CI Pipeline

- Use **PCOV** in CI for fast code coverage collection. Use **Xdebug** locally for step debugging.
- Full **CI quality gate**:
  ```bash
  php-cs-fixer fix --dry-run --diff   # formatting
  phpstan analyse --level 8 src/      # static analysis
  phpunit --coverage-clover cov.xml   # tests + coverage
  ```

### High Concurrency

- For high-concurrency PHP applications requiring persistent connections, consider:
  - **Swoole** / **OpenSwoole** — coroutine-based async PHP runtime
  - **FrankenPHP** — modern PHP app server with built-in worker mode
  - **RoadRunner** — Go-based high-performance PHP application server with persistent workers
    These eliminate PHP-FPM cold-start overhead and enable connection pooling per-worker.
