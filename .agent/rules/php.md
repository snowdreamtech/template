# PHP Development Guidelines

> Objective: Define standards for modern, secure, and maintainable PHP code.

## 1. PHP Version & Standards

- Target **PHP 8.3+** for new projects. Use modern features: named arguments, fibers, readonly properties and classes, enums, first-class callable syntax, and union types.
- Follow **PSR-12** coding standards. Enforce automatically with **PHP CS Fixer** or **PHP_CodeSniffer** (`phpcs`) in CI. Commit the configuration file (`php-cs-fixer.dist.php`).
- Use **Composer** for all dependency management. Commit `composer.lock`. Use `composer install --no-dev --optimize-autoloader` in production builds.
- Use **Rector** for automated code upgrade refactoring when migrating PHP versions.

## 2. Type Safety

- Enable strict types at the top of every file: `declare(strict_types=1);`. This enforces strict type checking for scalar type declarations.
- Add explicit type declarations for all function parameters and return types. Use union types (`int|string`), intersection types, and `never` return type where appropriate.
- Use `?TypeName` for nullable types. Avoid returning `null` from public APIs — prefer returning an empty collection, null object, or throwing a domain exception.
- Use **readonly properties** and **readonly classes** (PHP 8.2+) for immutable value objects and DTOs.

## 3. Security

- Never trust user input. Validate and sanitize all data from `$_GET`, `$_POST`, `$_COOKIE`, and external sources using a validation library.
- Use **prepared statements** (PDO or query builder) for all database interactions. Never concatenate user input into SQL strings.
- Hash passwords with `password_hash()` using `PASSWORD_BCRYPT` (cost ≥ 12) or `PASSWORD_ARGON2ID`. Never use `md5` or `sha1` for passwords.
- Set security-focused HTTP headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options) via middleware or framework configuration.
- Run **Psalm** or **PHPStan** with security-focused plugins (`psalm-plugin-security`) to detect taint flows and SQL injection vulnerabilities statically.

## 4. Architecture & Patterns

- Use a modern PHP framework (**Laravel** or **Symfony**) for web applications. Follow the framework's conventions.
- Favor **dependency injection** (DI containers) over static methods, global functions, or the Facade pattern internally.
- Separate concerns: HTTP layer (Controllers) → Application (Services/Use Cases) → Domain (Entities/Value Objects) → Infrastructure (Repositories/Adapters).
- Use **PHP-DI**, Symfony's DI Container, or Laravel's Service Container. Prefer autowiring for clean service registration.

## 5. Testing & Tooling

- Use **PHPUnit** for unit and integration tests. Use **Pest** (built on PHPUnit) for expressive, readable test syntax in new projects.
- Use **PHPStan** at the highest level tolerable (`--level=max` or level 8+) for static analysis. Run in CI and block on errors.
- Use **Infection** mutation testing framework to evaluate the quality of your test suite beyond coverage metrics.
- Use **Xdebug** locally for step debugging and code coverage. Use **PCOV** or **Xdebug** (pcov mode) in CI for faster coverage collection.
- **CI pipeline**: `phpcs → php-cs-fixer --dry-run → phpstan → phpunit --coverage-clover`.
