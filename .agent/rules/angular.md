# Angular Development Guidelines

> Objective: Define standards for building scalable, maintainable, and performant Angular applications.

## 1. Project Structure

- Follow the **Angular Style Guide** (angular.io/guide/styleguide).
- Organize code by **feature modules or standalone components**: `features/user/`, `features/auth/` — not by type (`components/`, `services/`).
- Use the **Angular CLI** (`ng generate component`, `ng generate service`) for all scaffolding to ensure consistent file structure.
- Prefer **Standalone Components** (Angular 14+) over NgModule-based architecture for new projects. Standalone components reduce boilerplate and improve tree-shaking.

## 2. Components

- Keep components focused: one component, one responsibility.
- Use `OnPush` change detection strategy by default: `changeDetection: ChangeDetectionStrategy.OnPush`. This prevents unnecessary re-renders.
- Avoid logic in templates. Move complex expressions to component class methods or `@Pipe`s. Keep templates declarative.
- Prefix component selectors with the project abbreviation: `app-user-card`, not `user-card`.
- Use **Signal-based reactivity** (`signal()`, `computed()`, `effect()`) in Angular 16+ for fine-grained, zone-less reactivity where appropriate.

## 3. Services & Dependency Injection

- Provide all services at the root level (`providedIn: 'root'`) unless feature-specific scoping is intentionally required.
- Keep HTTP calls inside **services** — never directly in components. Use `HttpClient` for all HTTP operations.
- Use **`HttpClient` interceptors** for cross-cutting concerns: attaching auth tokens, global error handling, logging, and retry logic.
- Use **Angular Signals** or `BehaviorSubject` for service state. Expose state as a Signal or Observable; never expose a `Subject` directly.

## 4. Reactive Programming (RxJS)

- Use **RxJS** Observables for asynchronous operations and event streams.
- Always **unsubscribe** from Observables to prevent memory leaks. Prefer `takeUntilDestroyed()` (Angular 16+) or the `async` pipe over manual `ngOnDestroy` cleanup.
- Use `catchError` in pipe chains for error handling. Do not subscribe inside a subscribe — use `switchMap`, `mergeMap`, or `concatMap` instead.
- Prefer **Signals** for component-local synchronous reactive state. Use RxJS for streams, events, and complex async operations.

## 5. Testing & Tooling

- Use **Jest** (via `jest-preset-angular`) or **Vitest** for unit tests — prefer over Karma/Jasmine for speed and modern tooling.
- Write tests using `TestBed` with `provideHttpClientTesting` and `HttpTestingController` for HTTP service tests.
- Use **Cypress** or **Playwright** for E2E tests. Angular Testing Library (`@testing-library/angular`) for component tests.
- Lint with **`@angular-eslint`**. Format with **Prettier**. Run `ng lint` in CI.
- Run `ng build --configuration production` in CI to catch compilation errors. Use `ng test --no-watch --code-coverage` for coverage reports.
