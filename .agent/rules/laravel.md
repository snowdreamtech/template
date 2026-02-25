# Laravel Development Guidelines

> Objective: Define standards for building elegant, secure, and maintainable PHP applications with Laravel.

## 1. Project Structure & Conventions

- Follow Laravel's **Convention over Configuration** principle. Use Artisan generators for all scaffolding: `php artisan make:model`, `make:controller`, `make:migration`, `make:request`.
- Keep controllers **RESTful and thin**. A resourceful controller implements: `index`, `create`, `store`, `show`, `edit`, `update`, `destroy` — delegate everything else to service or action classes.
- Use **Service Classes** or **Action Classes** (`app/Actions/`) for complex business logic that spans multiple models or repositories. Controllers call services; services call repositories/Eloquent.
- Use **Form Requests** (`php artisan make:request`) for validation and authorization of complex input — not inline `$request->validate()` for anything beyond trivial cases.
- Use **API Resources** (`php artisan make:resource`) to transform Eloquent models into consistent JSON structures. Never return raw Eloquent models from API controllers.

## 2. Eloquent ORM

- Define all relationships (`hasMany`, `belongsTo`, `belongsToMany`, `hasManyThrough`) in model classes. Never replicate relationship queries in controllers or services.
- Use **Eager Loading** (`with()`) to prevent N+1 queries. Detect N+1 in development with **Laravel Telescope** or the Debugbar package.
- Use **Model Factories** (`php artisan make:factory`) for generating test data. Use **Seeders** only for reference/seed data, not for test data generation.
- Define `$fillable` (explicit allowlist) on all models. Never use `$guarded = []` — it allows mass assignment of every attribute, including protected ones.
- Use **Eloquent scopes** for reusable query logic: `public function scopeActive($query) { return $query->where('active', true); }`.
- Avoid using Eloquent **observers** for business logic. Use explicit service calls instead to keep side effects traceable.

## 3. Security

- Never disable CSRF protection for web routes. Laravel enables it by default via `VerifyCsrfToken` middleware.
- Always validate input with Form Request classes. Implement the `authorize()` method using Gates/Policies — return `false` to deny.
- Use **Laravel Sanctum** (SPAs/mobile) or **Passport** (full OAuth2) for API authentication. Never implement custom auth mechanisms.
- Access config values with `config('services.stripe.key')` — never call `env()` outside of config files (it breaks config caching).
- Use `php artisan key:generate` to set `APP_KEY`. Never commit `.env` files. Use `.env.example` as a template.
- Set headers: `APP_ENV=production`, `APP_DEBUG=false`. Use `config:cache`, `route:cache`, and `view:cache` in production deployments.

## 4. Queues & Background Jobs

- Move slow operations (email, external API calls, PDF generation, image processing) to **Queued Jobs** (`php artisan make:job`).
- Use **Laravel Horizon** for monitoring Redis queues in production. Define worker priorities and timeout values explicitly in `config/horizon.php`.
- Use **Laravel Scheduler** (`app/Console/Kernel.php`) for recurring tasks instead of raw cron jobs. Deploy a single `php artisan schedule:run` cron entry.
- Implement retry logic and `failed()` method in jobs to handle failures gracefully. Log failures to a dedicated channel.

## 5. Testing & Tooling

- Use **PHPUnit** with Laravel's `TestCase` or **Pest** (preferred for expressive, readable tests).
- Use `RefreshDatabase` trait for tests requiring a clean database state. Use `WithFaker` and model factories for realistic test data.
- Mock external services with `Http::fake()`, `Mail::fake()`, `Queue::fake()`, `Storage::fake()` — never make real external calls in tests.
- Run `php artisan test --coverage --min=80` in CI. Use **PHPStan** (`larastan`) for static analysis at level 5+. Use **Pint** for code formatting.
- Use `php artisan optimize:clear` in CI before running tests to ensure a clean cache state.
