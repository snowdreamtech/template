# Angular Development Guidelines

> Objective: Define standards for building scalable, maintainable, and performant Angular applications.

## 1. Project Structure

- Follow the **Angular Style Guide** (angular.io/guide/styleguide).
- Organize code by **feature domains or standalone components**: `features/user/`, `features/auth/` — not by type (`components/`, `services/`).
- Use the **Angular CLI** (`ng generate component`, `ng generate service`) for all scaffolding to ensure consistent file naming and structure.
- Prefer **Standalone Components** (Angular 14+) over NgModule-based architecture for new projects. They reduce boilerplate and improve tree-shaking.
- Place shared UI components in `shared/`, application-wide singletons (auth service, app config) in `core/`, and feature-specific code in `features/`.

## 2. Components

- Keep components focused: one component, one responsibility. Decompose large components into container + presentational components.
- Use `OnPush` change detection strategy by default: `changeDetection: ChangeDetectionStrategy.OnPush`. This prevents unnecessary re-renders for most components.
- Avoid logic in templates. Move complex expressions to component class methods or `@Pipe`s. Keep templates declarative and readable.
- Prefix component selectors with the project abbreviation: `app-user-card`, not `user-card`. Enforce consistently with linting.
- Use **Signal-based reactivity** (`signal()`, `computed()`, `effect()`) in Angular 16+ for fine-grained, zone-less reactivity. Signals provide synchronous, push-based updates without requiring `ChangeDetectorRef.markForCheck()`.

## 3. Services & Dependency Injection

- Provide all services at the root level (`providedIn: 'root'`) unless feature-specific scoping is required. Avoid providing services in component metadata.
- Keep HTTP calls inside **services** — never directly in components. Use `HttpClient` for all HTTP operations.
- Use **`HttpClient` interceptors** for cross-cutting concerns: attaching auth tokens, global error handling, logging, retry logic, and request/response transformation.
- Use **Angular Signals** or `BehaviorSubject` for service state. Expose state as a Signal or Observable; never expose a mutable `Subject` directly.
- Use `inject()` function (Angular 14+) as an alternative to constructor injection for cleaner, functional-style dependency injection.

## 4. Reactive Programming (RxJS)

- Use **RxJS** Observables for asynchronous operations and event streams.
- Always **unsubscribe** from Observables to prevent memory leaks. Prefer `takeUntilDestroyed()` (Angular 16+) or the `async` pipe over manual `ngOnDestroy` cleanup.
- Use `catchError` in pipe chains for error handling. Do not subscribe inside a subscribe — use `switchMap`, `mergeMap`, or `concatMap` operator instead.
- Prefer **Signals** for component-local synchronous reactive state. Use RxJS for complex async operations, streams, and event buses.
- Use `combineLatest`, `forkJoin`, or `zip` for coordinating multiple streams. Prefer `toSignal()` to convert Observables to Signals in component templates.

## 5. Testing & Tooling

- Use **Jest** (via `jest-preset-angular`) or **Vitest** for unit tests — prefer over Karma/Jasmine for speed and modern tooling.
- Write tests using `TestBed` with `provideHttpClientTesting` and `HttpTestingController` for HTTP service tests. Use `ComponentFixture` for component tests.
- Use **Cypress** or **Playwright** for E2E tests. Use `@testing-library/angular` for component tests that follow a11y-first patterns.
- Lint with **`@angular-eslint`**. Format with **Prettier**. Run `ng lint` in CI.
- Run `ng build --configuration production` in CI to catch compilation and type errors. Use `ng test --no-watch --code-coverage` for coverage reports.
