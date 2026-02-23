# PHP Development Guidelines

> Objective: Define standards for modern, secure, and maintainable PHP code.

## 1. PHP Version & Standards

- Target **PHP 8.2+**. Use modern features: named arguments, fibers, readonly properties, enums, and union types.
- Follow **PSR-12** coding standards. Enforce with PHP CS Fixer or PHP_CodeSniffer in CI.
- Use **Composer** for all dependency management. Commit `composer.lock`.

## 2. Type Safety

- Enable strict types at the top of every file: `declare(strict_types=1);`
- Add explicit type declarations for all function parameters and return types.
- Use `?TypeName` for nullable types. Avoid returning `null` from public APIs where an alternative type (empty array, null object) is more appropriate.

## 3. Security

- Never trust user input. Validate and sanitize all data from `$_GET`, `$_POST`, `$_COOKIE`, and similar sources.
- Use prepared statements (PDO or a query builder) for all database interactions. Never concatenate user input into SQL.
- Use password hashing functions: `password_hash()` with `PASSWORD_BCRYPT`. Never use `md5` or `sha1` for passwords.
- Set security-focused HTTP headers (CSP, X-Frame-Options, etc.) via middleware or framework configuration.

## 4. Architecture

- Use a modern PHP framework (Laravel, Symfony) for web applications.
- Favor dependency injection (DI containers) over static methods, global functions, or the Facade pattern where possible.
- Separate concerns: HTTP layer (Controllers), business logic (Services/Use Cases), and data access (Repositories).

## 5. Testing

- Use **PHPUnit** for unit and integration tests.
- Lint with PHPStan at the highest level your codebase supports (`--level=max`).
- Run `composer test` in CI.
