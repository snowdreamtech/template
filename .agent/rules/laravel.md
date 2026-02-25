# Laravel Development Guidelines

> Objective: Define standards for building elegant, secure, and maintainable PHP applications with Laravel, covering structure, Eloquent ORM, security, queues, testing, and performance.

## 1. Project Structure & Conventions

### Directory Organization

- Follow Laravel's **Convention over Configuration** principle. Use Artisan generators for all scaffolding:

  ```bash
  php artisan make:model User -mfs    # model + migration + factory + seeder
  php artisan make:controller UserController --resource --api
  php artisan make:request CreateUserRequest
  php artisan make:resource UserResource
  php artisan make:job SendWelcomeEmail
  ```

- Keep controllers **thin and RESTful**. A resource controller implements: `index`, `store`, `show`, `update`, `destroy` — delegate everything else to dedicated classes:

  ```php
  // ✅ Thin controller — delegates to action
  class UserController extends Controller {
    public function store(CreateUserRequest $request, CreateUser $createUser): UserResource {
      $user = $createUser->handle($request->validated());
      return new UserResource($user);
    }
  }
  ```

- Use **Action Classes** (`app/Actions/`) for complex business logic that spans multiple models. Actions are single-purpose, testable, injectable:

  ```php
  // app/Actions/Users/CreateUser.php
  class CreateUser {
    public function __construct(
      private readonly UserRepository $repo,
      private readonly Dispatcher     $events,
    ) {}

    public function handle(array $data): User {
      $user = $this->repo->create($data);
      $this->events->dispatch(new UserCreated($user));
      return $user;
    }
  }
  ```

### Form Requests & API Resources

- Use **Form Requests** for validation and authorization of any non-trivial inputs:

  ```php
  class CreateUserRequest extends FormRequest {
    public function authorize(): bool {
      return $this->user()->can('create', User::class);
    }

    public function rules(): array {
      return [
        'name'  => ['required', 'string', 'min:1', 'max:100'],
        'email' => ['required', 'email:rfc,dns', 'unique:users,email'],
        'role'  => ['required', Rule::enum(UserRole::class)],
      ];
    }
  }
  ```

- Use **API Resources** (`JsonResource`) to transform Eloquent models into consistent JSON — never return raw Eloquent models from API endpoints:

  ```php
  class UserResource extends JsonResource {
    public function toArray(Request $request): array {
      return [
        'id'         => $this->id,
        'name'       => $this->name,
        'email'      => $this->email,
        'role'       => $this->role,
        'created_at' => $this->created_at->toIso8601String(),
        // hashed_password intentionally excluded
      ];
    }
  }

  // Collection:
  return UserResource::collection(User::paginate(20));
  ```

## 2. Eloquent ORM

### Relationship & Eager Loading

- Define all relationships in model classes (`hasMany`, `belongsTo`, `belongsToMany`). Never replicate relationship queries in controllers or services.
- Use **Eager Loading** to prevent N+1 queries. Detect N+1 in development with **Laravel Telescope** or Barryvdh Debugbar:

  ```php
  // ❌ N+1 — fires 1 + N queries
  $orders = Order::all();
  foreach ($orders as $order) {
    echo $order->user->name;  // Each access fires a new query
  }

  // ✅ Eager loading — fires 2 queries total
  $orders = Order::with('user')->get();

  // ✅ Nested eager loading
  $orders = Order::with(['user', 'items.product'])->get();
  ```

- Use **`lazy eager loading`** (`$model->load('relation')`) after a model is already fetched, or **`withCount`** for counts without loading related models.

### Mass Assignment & Scopes

- Define `$fillable` explicitly on all models. **Never use `$guarded = []`** — it allows mass-assigning every attribute:

  ```php
  protected $fillable = ['name', 'email', 'role'];  // explicit allowlist only
  ```

- Use **Eloquent scopes** for reusable query logic:

  ```php
  // Local scope
  public function scopeActive(Builder $query): Builder {
    return $query->where('status', 'active')->whereNull('deleted_at');
  }

  // Usage
  User::active()->orderBy('name')->get();
  ```

- Avoid Eloquent **observers** for business logic — they are invisible side effects. Use explicit service/action calls instead.
- Use **Model Factories** for test data generation. Use **Seeders** only for reference data that belongs in every environment (countries, permission roles):

  ```php
  // Factory
  User::factory()->count(10)->create(['role' => UserRole::VIEWER]);
  ```

## 3. Security

### Core Security Practices

- **Never disable CSRF protection** for web routes — Laravel enables it by default via `VerifyCsrfToken` middleware.
- Use **Gates and Policies** for authorization. Never implement authorization logic in controllers directly:

  ```php
  // Policy
  public function update(User $authUser, Order $order): bool {
    return $authUser->id === $order->user_id || $authUser->isAdmin();
  }

  // Controller
  $this->authorize('update', $order);
  ```

- Use **Laravel Sanctum** for SPA/mobile API authentication, or **Passport** for full OAuth2 server flows. Never implement custom session or token management.

### Configuration Security

- Access config values with `config('services.stripe.key')` — **never call `env()` outside config files** (it breaks config caching):

  ```php
  // ❌ Bypasses config cache
  Stripe::setApiKey(env('STRIPE_KEY'));

  // ✅ Via config — cache-safe
  Stripe::setApiKey(config('services.stripe.key'));
  ```

- Never commit `.env` files. Commit `.env.example` with placeholder values. Production environments should load secrets via secret managers (Vault, AWS Secrets Manager).
- Set `APP_ENV=production` and `APP_DEBUG=false` in production. Enable caches before deployment:

  ```bash
  php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan event:cache
  ```

## 4. Queues & Background Jobs

- Move slow operations to **Queued Jobs** to keep response times fast:

  ```php
  class SendWelcomeEmail implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly User $user) {}

    public function handle(Mailer $mailer): void {
      $mailer->to($this->user->email)->send(new WelcomeMail($this->user));
    }

    public function failed(Throwable $exception): void {
      Log::channel('jobs')->error("WelcomeEmail failed for user {$this->user->id}", [
        'exception' => $exception->getMessage(),
      ]);
    }

    public int $tries = 3;
    public int $timeout = 60;
  }

  // Dispatch from controller
  SendWelcomeEmail::dispatch($user)->onQueue('emails');
  ```

- Use **Laravel Horizon** for monitoring Redis queues in production. Define worker priorities and timeout values in `config/horizon.php`.
- Use **Laravel Scheduler** for recurring tasks. Deploy a single cron entry rather than multiple cron jobs:

  ```php
  // In routes/console.php (Laravel 10+)
  Schedule::job(new SyncExchangeRates)->hourly()->withoutOverlapping();
  Schedule::command('reports:generate')->dailyAt('06:00')->onOneServer();
  ```

## 5. Testing & Tooling

### Testing Stack

- Use **Pest** for expressive, readable tests in new projects (built on PHPUnit):

  ```php
  beforeEach(function () {
    $this->user = User::factory()->create();
    actingAs($this->user);
  });

  it('creates an order for an authenticated user', function () {
    $response = postJson('/api/orders', ['product_id' => 1, 'qty' => 2]);

    $response->assertCreated()->assertJsonStructure(['data' => ['id', 'status', 'total']]);

    expect(Order::where('user_id', $this->user->id)->count())->toBe(1);
  });

  it('rejects order if out of stock', function () {
    postJson('/api/orders', ['product_id' => 99, 'qty' => 100])
      ->assertStatus(422)
      ->assertJsonPath('message', 'Insufficient stock');
  });
  ```

- Use `RefreshDatabase` trait for tests needing a clean database state. Use `WithFaker` and model factories for realistic test data.
- Mock external services with Laravel's built-in fakes to prevent real external calls in tests:

  ```php
  Http::fake(['stripe.com/*' => Http::response(['id' => 'ch_123'], 200)]);
  Mail::fake();
  Queue::fake();
  Storage::fake('s3');
  ```

### Performance & CI

- Run `php artisan test --parallel --coverage-min=80` in CI for parallel test execution with coverage enforcement.
- Use **PHPStan with Larastan** for static analysis at level 5+: `vendor/bin/phpstan analyse`.
- Use **Laravel Pint** for code formatting: `vendor/bin/pint --test` in CI.
- Use **Laravel Octane** (with Swoole or FrankenPHP) for persistent worker processes in high-throughput production environments — eliminates bootstrap overhead per request.
