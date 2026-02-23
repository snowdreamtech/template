# NestJS Development Guidelines

> Objective: Define standards for building scalable, enterprise-grade TypeScript applications with NestJS.

## 1. Architecture

- NestJS enforces **Angular-inspired modular architecture**. Every feature lives in a **Module** (`@Module`), which declares its `controllers`, `providers` (services), and `imports`.
- Keep modules focused on a single domain. Export only what other modules need.
- Use the **Application Factory** pattern: create the app with `NestFactory.create(AppModule)` in `main.ts`.

## 2. Modules, Controllers & Providers

- **Controllers** (`@Controller`) handle HTTP routing only. Never put business logic in a controller.
- **Services** (`@Injectable`) contain all business logic. Services are injected via constructor DI.
- **Repositories** (or use TypeORM/Prisma repositories directly) handle all data access.
- Keep dependency injection explicit. Prefer constructor injection over property injection.

## 3. DTOs & Validation

- Define Data Transfer Objects (DTOs) for every request body and response. Use **class-validator** decorators (`@IsString()`, `@IsEmail()`, `@IsNotEmpty()`) on DTO classes.
- Enable global validation pipe in `main.ts`:
  ```ts
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  ```
- Use `whitelist: true` to strip unknown properties from requests automatically.

## 4. Error Handling & Interceptors

- Throw NestJS built-in `HttpException` subclasses (`NotFoundException`, `BadRequestException`, etc.) for HTTP errors.
- Use **Exception Filters** (`@Catch`) for centralized error formatting.
- Use **Interceptors** for cross-cutting concerns: response transformation, logging, caching.
- Use **Guards** (`@UseGuards`) for authentication and authorization.

## 5. Testing

- NestJS has a built-in testing module (`@nestjs/testing`). Use `Test.createTestingModule()` for unit tests with mock providers.
- Use **Supertest** with the NestJS testing module for e2e tests.
- Run `npm run test` (unit) and `npm run test:e2e` in CI.
