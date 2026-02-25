# Angular Development Guidelines

> Objective: Define standards for building scalable, maintainable, and performant Angular applications, covering project structure, component design, services, reactive programming, testing, and tooling.

## 1. Project Structure

### Directory Organization

- Follow the **Angular Style Guide** (angular.io/guide/styleguide). Organize code by **feature domain** — not by technical type:
  ```text
  src/
  ├── app/
  │   ├── core/                     # App-wide singletons (auth, http interceptors, app config)
  │   │   ├── auth/
  │   │   │   ├── auth.service.ts
  │   │   │   └── auth.guard.ts
  │   │   └── interceptors/
  │   ├── shared/                   # Reusable UI components, pipes, directives
  │   │   ├── components/
  │   │   │   └── button/
  │   │   └── pipes/
  │   ├── features/                 # Feature-specific modules
  │   │   ├── user/
  │   │   │   ├── user.routes.ts
  │   │   │   ├── user-list.component.ts
  │   │   │   ├── user-detail.component.ts
  │   │   │   └── user.service.ts
  │   │   └── orders/
  │   └── app.config.ts             # Global providers (router, HTTP, signals)
  ```
- Use the **Angular CLI** (`ng generate component`, `ng generate service`, `ng generate pipe`) for all scaffolding to ensure consistent file naming, module imports, and testing setup.
- Prefer **Standalone Components** (Angular 14+) over NgModule-based architecture for new projects. They reduce boilerplate, improve tree-shaking, and enable simpler lazy-loading:
  ```typescript
  @Component({
    selector: "app-user-card",
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe],
    templateUrl: "./user-card.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class UserCardComponent {
    @Input({ required: true }) user!: User;
    @Output() selected = new EventEmitter<User>();
  }
  ```

## 2. Components

### Design Principles

- Keep components focused: **one component, one responsibility**. Decompose large components into **container** (smart) + **presentational** (dumb) components:
  - Container components: fetch data, manage state, communicate with services
  - Presentational components: receive data via `@Input()`, emit events via `@Output()`, no service injection
- Use **`OnPush` change detection** strategy by default. This tells Angular to only check the component when an Input reference changes, an event fires, or observables/signals emit:
  ```typescript
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  ```
- Avoid logic in templates. Move complex expressions to component class methods or `@Pipe` transforms. Keep templates declarative:

  ```html
  <!-- ❌ Logic in template -->
  {{ user.firstName + ' ' + user.lastName | titlecase }}

  <!-- ✅ Logic in component or pipe -->
  {{ user | fullName }}
  ```

- Prefix component selectors with the project abbreviation: `app-user-card` — not bare `user-card`. Enforce this with `@angular-eslint/component-selector`.

### Modern Angular Features

- Use **Signal-based reactivity** (Angular 16+) for fine-grained, zone-less state management:

  ```typescript
  export class UserProfileComponent {
    private userService = inject(UserService);

    userId = input.required<string>(); // Signal input (Angular 17+)
    user = toSignal(toObservable(this.userId).pipe(switchMap((id) => this.userService.getUser(id))));
    initials = computed(
      () =>
        this.user()
          ?.name.split(" ")
          .map((w) => w[0])
          .join("") ?? "?",
    );

    updateName(name: string) {
      this.userService.updateName(this.userId(), name).subscribe();
    }
  }
  ```

- Use Angular 17+ **`@defer` blocks** for declarative lazy-loading with configurable triggers:
  ```html
  @defer (on viewport) {
  <app-heavy-analytics-chart [data]="chartData" />
  } @placeholder {
  <div class="chart-skeleton"></div>
  } @loading (minimum 500ms) {
  <app-spinner />
  } @error {
  <p>Failed to load chart.</p>
  }
  ```

## 3. Services & Dependency Injection

### Service Design

- Provide services at the **root level** (`providedIn: 'root'`) unless feature-specific scoping is required. Root-level services are singletons across the application:

  ```typescript
  @Injectable({ providedIn: "root" })
  export class OrderService {
    private http = inject(HttpClient);
    private orderCount = signal(0);

    readonly orderCount$ = this.orderCount.asReadonly();

    getOrders(filter: OrderFilter): Observable<Order[]> {
      return this.http.get<Order[]>("/api/orders", { params: filter as any });
    }
  }
  ```

- Keep **HTTP calls in services** — never directly in components. Use `HttpClient` for all HTTP operations.
- Use **`HttpClient` interceptors** for cross-cutting concerns: auth token attachment, global error handling, request logging, and retry logic:

  ```typescript
  export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const token = auth.token();

    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next(req).pipe(
      catchError((err) => {
        if (err.status === 401) auth.logout();
        return throwError(() => err);
      }),
    );
  };
  ```

- Use **`inject()` function** (Angular 14+) as an alternative to constructor injection for cleaner code in functional patterns (guards, interceptors, resolvers).

### State Management

- For application-wide state, use **NgRx** (Redux-style with selectors/effects) for complex apps, or **NgRx ComponentStore** / **NGXS** for feature-level state. Avoid duplicating state management with ad-hoc Subject chains.
- Expose service state as **Signals** (preferred for Angular 16+) or **Observables**. Never expose a writable `Subject` as a public API:
  ```typescript
  // ✅ Signal-based service state
  private _users    = signal<User[]>([]);
  readonly users    = this._users.asReadonly();
  readonly userCount = computed(() => this._users().length);
  ```

## 4. Reactive Programming (RxJS)

### Core Rules

- Use **RxJS Observables** for async operations, event streams, and data transformation pipelines.
- Always **unsubscribe** to prevent memory leaks. Prefer modern approaches over manual `ngOnDestroy`:

  ```typescript
  // ✅ takeUntilDestroyed() (Angular 16+) — automatic unsubscribe when component destroys
  constructor() {
    this.service.updates$.pipe(takeUntilDestroyed()).subscribe(update => this.handleUpdate(update));
  }

  // ✅ async pipe — unsubscribes automatically
  // Template: {{ user$ | async }}

  // ✅ toSignal() — converts Observable to Signal, auto-unsubscribes
  readonly user = toSignal(this.userService.currentUser$, { initialValue: null });
  ```

- Avoid subscribing inside a subscribe. Use **flattening operators** for chained async operations:

  ```typescript
  // ❌ Nested subscribe — memory leaks and hard to compose
  this.userId$.subscribe(id => {
    this.userService.getUser(id).subscribe(user => this.user = user);
  });

  // ✅ switchMap — inner Observable, cancels previous on new emission
  readonly user$ = this.userId$.pipe(
    switchMap(id => this.userService.getUser(id)),
    catchError(() => of(null)),
  );
  ```

- Use **`combineLatest`** / **`forkJoin`** for coordinating multiple independent streams. Use **`toSignal()`** to bridge Observables into the Signal reactive graph for templates.

## 5. Testing & Tooling

### Testing Stack

- Use **Jest** (via `jest-preset-angular`) or **Vitest** for unit tests — prefer over Karma/Jasmine for speed, better error messages, and snapshot testing.
- Write component tests with `TestBed`. Use `provideHttpClientTesting()` and `HttpTestingController` for HTTP service tests:

  ```typescript
  describe("UserService", () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      service = TestBed.inject(UserService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it("fetches users", () => {
      service.getUsers().subscribe((users) => expect(users).toHaveLength(2));
      httpMock.expectOne("/api/users").flush([{ id: "1" }, { id: "2" }]);
    });
  });
  ```

- Use **`@testing-library/angular`** for component tests that follow accessibility-first patterns (query by role, label, text — not CSS selectors).
- Use **Cypress** or **Playwright** for E2E integration tests.

### Tooling & Build

- Lint with **`@angular-eslint`**. Format with **Prettier**. Run `ng lint && ng build --configuration production` in CI to catch both lint and TypeScript compilation errors.
- Enable **strict TypeScript** in `tsconfig.json`: `"strict": true`, `"noImplicitReturns": true`, `"noFallthroughCasesInSwitch": true`.
- For large-scale Angular monorepos, use **Nx** (`@nx/angular`): computation caching, affected-only task runs, and module boundary enforcement between domain libraries.
