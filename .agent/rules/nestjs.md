# NestJS Development Guidelines

> Objective: Define standards for building scalable, enterprise-grade TypeScript applications with NestJS.

## 1. Architecture & Modules

- NestJS enforces a **modular architecture** inspired by Angular. Every feature lives in a `@Module` that declares its `controllers`, `providers` (services), and `imports`.
- Keep modules focused on a single bounded domain. Export only the providers that other modules need. Use `forRoot`/`forRootAsync` for library-style global modules (database, config).
- Use **lazy-loaded modules** (`LazyModuleLoader`) for large applications where not all modules are needed on startup (CLI commands, background workers).
- Define a separate `AppModule` as the root, and `CoreModule` (singleton services: logger, config, database) vs feature modules.

## 2. Controllers, Services & Providers

- **Controllers** (`@Controller`) handle HTTP routing, request parsing, and response formatting only. Never put business logic in a controller.
- **Services** (`@Injectable`) contain all business logic. Inject via constructor DI exclusively.
- **Repositories** (TypeORM, Prisma, Mongoose) handle all data access. Use the Repository pattern — services depend on repository interfaces, not concrete implementations.
- Use **Pipes** for request transformation and validation. Use **Guards** for authentication/authorization checks. Use **Interceptors** for logging, caching, and response transformation.

## 3. DTOs & Validation

- Define DTOs for every request body and response shape. Use **class-validator** decorators (`@IsString()`, `@IsEmail()`) on DTO classes for validation.
- Enable global validation pipe in `main.ts`:
  ```ts
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  ```
- Use `@Type(() => Number)` with `transform: true` for automatic query parameter type coercion.
- Define response DTOs with `@Exclude()` on sensitive fields and apply `ClassSerializerInterceptor` globally.

## 4. Error Handling & Security

- Throw NestJS built-in `HttpException` subclasses (`NotFoundException`, `BadRequestException`, `UnauthorizedException`) for HTTP errors.
- Define a global **Exception Filter** (`@Catch()`) for centralized error formatting and logging. Add request ID to error responses for traceability.
- Use **Helmet** (`@nestjs/serve-static` + `helmet`) for security headers. Use `@nestjs/throttler` for rate limiting.
- Use **`@nestjs/config`** with Joi schema validation for type-safe configuration loading at startup. Fail fast on missing required env vars.

## 5. Testing & Operations

- Use `@nestjs/testing`'s `createTestingModule()` for unit tests with mock providers (`jest.fn()`).
- Use **Supertest** with the full NestJS app instance for E2E tests. Use **Testcontainers** for real database integration.
- Run `npm run test` (unit), `npm run test:e2e`, and `npm run test:cov` in CI. Enforce coverage thresholds in `jest.config.ts`.
- Use **`nestjs-pino`** or `@nestjs/logger` with Pino for structured JSON logging. Apply the logger as a global middleware.
- Expose health check endpoints via `@nestjs/terminus` for Kubernetes liveness and readiness probes.
