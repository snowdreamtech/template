# Laravel Development Guidelines

> Objective: Define standards for building elegant, secure, and maintainable PHP applications with Laravel.

## 1. Project Structure & Conventions

- Follow Laravel's **Convention over Configuration** principle. Use Artisan generators for all scaffolding (`php artisan make:model`, `make:controller`, `make:migration`, `make:request`).
- Keep controllers **RESTful and thin**. A resourceful controller implements: `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` — no more, no less.
- Use **Service Classes** or **Action Classes** (`app/Actions/`) for complex business logic that spans multiple models or repositories. Controllers call services; services call repositories.
- Use **Form Requests** (`php artisan make:request`) for validation and authorization — not inline `$request->validate()` for anything complex.

## 2. Eloquent ORM

- Define all relationships (`hasMany`, `belongsTo`, `belongsToMany`, `hasManyThrough`) in model classes. Never replicate relationship queries in controllers.
- Use **Eager Loading** (`with()`) to prevent N+1 queries. Detect N+1 in development with **Laravel Telescope** or **Debugbar**.
- Use **Model Factories** (`php artisan make:factory`) for generating test data. Use **Seeders** only for seed/reference data.
- Define `$fillable` (preferred allowlist) on all models. Never use `$guarded = []` — it allows mass assignment of every attribute.
- Use **Eloquent scopes** for reusable query logic: `public function scopeActive($query) { return $query->where('active', true); }`.

## 3. Security

- Never disable CSRF protection for web routes. Laravel enables it by default via `VerifyCsrfToken` middleware.
- Always validate input with Form Request classes. Use `authorize()` with Gates/Policies.
- Use **Laravel Sanctum** (SPAs/mobile) or **Passport** (OAuth2) for API authentication. Never implement custom auth.
- Access config values with `config('services.stripe.key')` — never call `env()` outside of config files.
- Use `php artisan key:generate` to set `APP_KEY`. Never commit `.env` files.

## 4. Queues & Background Jobs

- Move slow operations (email, external API calls, PDF generation) to **Queued Jobs** (`php artisan make:job`).
- Use **Laravel Horizon** for monitoring Redis queues in production. Define worker priorities and timeout values explicitly.
- Use **Laravel Scheduler** (`app/Console/Kernel.php`) for recurring tasks instead of raw cron jobs.

## 5. Testing & Tooling

- Use **PHPUnit** with Laravel's `TestCase` or **Pest** for expressive, readable tests.
- Use `RefreshDatabase` trait for tests requiring a clean database state. Use `WithFaker` and model factories for realistic test data.
- Mock external services with `Http::fake()` and `Mail::fake()` — never make real HTTP or mail calls in tests.
- Run `php artisan test --coverage` in CI. Use **PHPStan** (`larastan`) for static analysis at level 5+. Use **Pint** for code formatting.
