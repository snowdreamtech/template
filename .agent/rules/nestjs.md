# NestJS Development Guidelines

> Objective: Define standards for building scalable, enterprise-grade TypeScript applications with NestJS, covering modular architecture, DTOs, validation, error handling, security, testing, and observability.

## 1. Architecture & Modules

### Module Design

- NestJS enforces a **modular architecture** inspired by Angular. Every feature lives in a `@Module` that declares its `controllers`, `providers` (services), and `imports`. A module is the unit of organization and encapsulation.
- Keep modules **focused on a single bounded domain**: `UsersModule`, `OrdersModule`, `AuthModule`. Export only the providers that other modules genuinely need.
- Define a clean module hierarchy:
  ```text
  src/
  ├── app.module.ts           # Root — imports all feature modules
  ├── core/
  │   └── core.module.ts      # Singletons: database, config, logger (global)
  ├── features/
  │   ├── users/
  │   │   ├── users.module.ts
  │   │   ├── users.controller.ts
  │   │   ├── users.service.ts
  │   │   ├── users.repository.ts
  │   │   ├── dto/
  │   │   │   ├── create-user.dto.ts
  │   │   │   └── user-response.dto.ts
  │   │   └── entities/
  │   │       └── user.entity.ts
  │   └── orders/
  └── shared/                 # Cross-cutting: exceptions, interceptors, pipes
  ```
- Use `forRoot()`/`forRootAsync()` for global library modules (database, configuration):
  ```typescript
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      type: "postgres",
      url: config.get<string>("DATABASE_URL"),
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: false, // use migrations in prod
    }),
    inject: [ConfigService],
  });
  ```
- Avoid **circular dependencies** between feature modules. Use a shared `SharedModule` or event emitters for cross-module communication.
- Use **lazy-loaded modules** (`LazyModuleLoader`) for large applications where not all modules are needed at startup (admin CLI commands, background workers with Queues).

### Microservices

- For microservices, use `@nestjs/microservices` with transport layers (NATS, Kafka, Redis, RabbitMQ). Use `@MessagePattern`/`@EventPattern` for typed message handlers.
- Use **`@nestjs/bull`** or **`@nestjs/bullmq`** for job queues backed by Redis.

## 2. Controllers, Services & Providers

### Layer Separation

- **Controllers** (`@Controller`) handle HTTP routing, request parsing, and response formatting ONLY. Never put business logic in controllers:

  ```typescript
  @Controller("users")
  @UseGuards(JwtAuthGuard)
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Create a new user account" })
    async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
      return this.usersService.create(dto);
    }

    @Get(":id")
    async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<UserResponseDto> {
      return this.usersService.findOneOrFail(id);
    }
  }
  ```

- **Services** (`@Injectable`) contain all business logic. Inject via constructor DI exclusively:

  ```typescript
  @Injectable()
  export class UsersService {
    constructor(
      private readonly repo: UsersRepository,
      private readonly events: EventEmitter2,
    ) {}

    async create(dto: CreateUserDto): Promise<UserResponseDto> {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing) throw new ConflictException(`Email ${dto.email} is already in use`);

      const user = await this.repo.save(this.repo.create(dto));
      await this.events.emit("user.created", { userId: user.id });
      return plainToInstance(UserResponseDto, user);
    }
  }
  ```

- **Repositories** handle all data access. Services depend on repository interfaces — not concrete TypeORM/Mongoose implementations — to maintain testability.

### NestJS Interceptors, Guards & Pipes

- Use **Guards** for authentication/authorization: `@UseGuards(JwtAuthGuard, RolesGuard)`.
- Use **Pipes** for request transformation and validation: `@Param("id", ParseUUIDPipe)`, `@Query("limit", new ParseIntPipe({ optional: true }))`.
- Use **Interceptors** for cross-cutting concerns: response transformation, HTTP request logging, caching.
- Use **Exception Filters** for centralized error formatting and logging.

## 3. DTOs & Validation

### DTO Design

- Define DTOs for every request body and response shape. Use **class-validator** decorators on DTO classes:

  ```typescript
  // dto/create-user.dto.ts
  import { IsEmail, IsString, IsEnum, MinLength, MaxLength } from "class-validator";
  import { Transform } from "class-transformer";

  export class CreateUserDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;

    @IsEmail()
    @Transform(({ value }) => value.trim().toLowerCase())
    email: string;

    @IsEnum(UserRole)
    role: UserRole = UserRole.VIEWER;
  }
  ```

- Enable the **global `ValidationPipe`** in `main.ts`:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws on unknown properties (default: strip)
      transform: true, // auto-coerce types from string query params
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  ```
- Use `@Exclude()` on sensitive fields in response DTOs and apply `ClassSerializerInterceptor` globally:

  ```typescript
  // main.ts
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // user-response.dto.ts
  export class UserResponseDto {
    id: string;
    email: string;
    name: string;

    @Exclude()
    hashedPassword: string; // never serialized
  }
  ```

## 4. Error Handling & Security

### Error Handling

- Throw NestJS built-in `HttpException` subclasses for HTTP errors: `NotFoundException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`, `ForbiddenException`.
- Create custom domain exceptions extending `HttpException` for business-rule errors:
  ```typescript
  export class InsufficientCreditsException extends HttpException {
    constructor(required: number, available: number) {
      super({ message: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required, available }, 422);
    }
  }
  ```
- Define a **global Exception Filter** for centralized error formatting, logging, and request ID inclusion:

  ```typescript
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<Response>();
      const req = ctx.getRequest<Request>();
      const status = exception instanceof HttpException ? exception.getStatus() : 500;

      this.logger.error({ requestId: req.headers["x-request-id"], exception });
      res.status(status).json({ statusCode: status, requestId: req.headers["x-request-id"], timestamp: new Date().toISOString() });
    }
  }
  ```

### Security

- Use **Helmet** for security headers, **`@nestjs/throttler`** for rate limiting, and **`@nestjs/cors`** with an explicit origins allowlist:
  ```typescript
  app.use(helmet());
  app.enableCors({ origin: ["https://app.example.com"], credentials: true });
  ```
- Use **`@nestjs/config`** with **Joi** schema validation for type-safe configuration. Fail fast on missing required env vars at startup:
  ```typescript
  ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({
      DATABASE_URL: Joi.string().uri().required(),
      JWT_SECRET: Joi.string().min(32).required(),
      PORT: Joi.number().default(3000),
    }),
  });
  ```

## 5. Testing & Observability

### Testing

- Use **`@nestjs/testing`**'s `createTestingModule()` for unit tests with mock providers:

  ```typescript
  describe("UsersService", () => {
    let service: UsersService;
    let repo: jest.Mocked<UsersRepository>;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [UsersService, { provide: UsersRepository, useValue: { findByEmail: jest.fn(), save: jest.fn(), create: jest.fn() } }, { provide: EventEmitter2, useValue: { emit: jest.fn() } }],
      }).compile();

      service = module.get(UsersService);
      repo = module.get(UsersRepository);
    });

    it("throws ConflictException for duplicate email", async () => {
      repo.findByEmail.mockResolvedValue(existingUser);
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });
  ```

- Use **Supertest** with the full NestJS app for E2E tests. Use **Testcontainers** for real database integration tests.
- Enforce coverage thresholds in `jest.config.ts`. Run `jest --coverage --coverageThreshold='{"global":{"lines":80}}'` in CI.

### Observability

- Use **`nestjs-pino`** for structured JSON logging with automatic request correlation IDs and Pino's performance:
  ```typescript
  LoggerModule.forRoot({
    pinoHttp: { level: process.env.LOG_LEVEL ?? "info", transport: process.env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined },
  });
  ```
- Expose health check endpoints via **`@nestjs/terminus`** for Kubernetes probes:
  ```typescript
  @Get("health")
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
    ]);
  }
  ```
- Generate **OpenAPI documentation** via `@nestjs/swagger`. Expose `/api-docs` in development and staging only — keep production clean.
