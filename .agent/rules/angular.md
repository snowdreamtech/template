# Angular Development Guidelines

> Objective: Define standards for building scalable, maintainable Angular applications.

## 1. Project Structure

- Follow the **Angular Style Guide** (angular.io/guide/styleguide).
- Organize code by feature modules, not by type: `features/user/`, `features/auth/` — not `components/`, `services/`.
- Use the Angular CLI (`ng generate`) for all scaffolding to ensure consistent file and module structure.

## 2. Components

- Keep components focused: one component, one responsibility.
- Use `OnPush` change detection strategy by default for better performance: `changeDetection: ChangeDetectionStrategy.OnPush`.
- Avoid logic in component templates. Move complex expressions to component methods or `@Pipe`s.
- Prefix component selectors with the project abbreviation: `app-user-card`, not `user-card`.

## 3. Services & Dependency Injection

- Provide all services at the root level (`providedIn: 'root'`) unless feature-specific scoping is required.
- Keep HTTP calls inside services — never directly in components.
- Use the `HttpClient` interceptors for auth tokens, error handling, and logging.

## 4. Reactive Programming (RxJS)

- Use **RxJS** Observables for all asynchronous operations. Avoid mixing Promises and Observables.
- Always **unsubscribe** from Observables in `ngOnDestroy` to prevent memory leaks. Prefer `takeUntilDestroyed()` (Angular 16+) or the `async` pipe.
- Use `catchError` in pipe chains for error handling. Do not subscribe inside a subscribe.

## 5. Testing & Tooling

- Use **Jasmine** + **Karma** (or Jest) for unit tests and **Cypress** or Playwright for e2e.
- Lint with `@angular-eslint`. Format with Prettier.
- Run `ng test --no-watch --no-progress` and `ng lint` in CI.
