# Laravel Development Guidelines

> Objective: Define standards for building elegant, secure, and maintainable PHP applications with Laravel.

## 1. Project Structure & Conventions

- Follow Laravel's **Convention over Configuration** principle. Use Artisan generators for all scaffolding: `php artisan make:model`, `make:controller`, `make:migration`.
- Keep controllers RESTful and thin. A resourceful controller should implement only: `index`, `create`, `store`, `show`, `edit`, `update`, `destroy`.
- Use **Service Classes** or **Action Classes** for complex business logic that doesn't belong in controllers or models.

## 2. Eloquent ORM

- Define relationships (`hasMany`, `belongsTo`, `belongsToMany`) in model classes. Never replicate relationship logic in controllers.
- Use **Eager Loading** (`with()`) to prevent N+1 queries. Always audit queries in development with Laravel Debugbar or Telescope.
- Use **Model Factories** and **Seeders** for generating test and development data.
- Define `$fillable` (allowlist) or `$guarded` (denylist) on all models. Never use `$guarded = []` in production.

## 3. Security

- **Never** disable CSRF protection for web routes. Laravel enables it by default via the `VerifyCsrfToken` middleware.
- Use **Form Request Validation** classes (`php artisan make:request`) to validate and authorize all input — not inline `$request->validate()` for complex rules.
- Use Laravel's built-in **Auth** scaffolding or **Sanctum**/**Passport** for authentication. Never roll your own auth.
- Store all secrets in `.env`. Use `config()` helpers to access them — never `env()` directly in code outside config files.

## 4. Queues & Jobs

- Move slow operations (email sending, report generation, API calls) to **Queued Jobs** (`php artisan make:job`).
- Use **Laravel Horizon** for monitoring Redis queues in production.

## 5. Testing

- Use **PHPUnit** with Laravel's `TestCase` base class or **Pest** for expressive tests.
- Use `RefreshDatabase` trait for tests that need a clean database state.
- Run `php artisan test` in CI.
