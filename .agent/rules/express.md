# Express.js Development Guidelines

> Objective: Define standards for building maintainable, secure, and production-ready Node.js APIs and web apps with Express.js, covering project structure, routing, middleware, security, testing, and observability.

## 1. Project Structure & Application Factory

### Structure

- Organize by **feature/domain**, not by technical type (`controllers/`, `models/`, etc.):
  ```text
  src/
  ├── app.ts               # Express app factory — exports app, no listen()
  ├── features/
  │   ├── users/
  │   │   ├── users.router.ts      # Router definition
  │   │   ├── users.controller.ts  # Request handling, validation
  │   │   ├── users.service.ts     # Business logic
  │   │   └── users.schema.ts      # Zod schemas
  │   └── auth/
  │       ├── auth.router.ts
  │       └── auth.service.ts
  ├── middleware/
  │   ├── error-handler.ts   # Global error handler
  │   ├── auth.ts            # JWT validation middleware
  │   └── request-id.ts      # Request ID injection
  ├── config/
  │   └── config.ts          # Environment config validation (zod/env)
  └── db/                    # Database client/pool setup
  cmd/
  └── server.ts              # Entry point — calls app.listen()
  ```

### Application Factory Pattern

- **Separate `app.ts` from `server.ts`** — the app factory creates and configures Express without starting the server. This makes it importable by Supertest without opening a port:

  ```typescript
  // src/app.ts
  import express from "express";
  import helmet from "helmet";
  import { usersRouter } from "./features/users/users.router";
  import { errorHandler } from "./middleware/error-handler";

  export function createApp() {
    const app = express();

    // Security middleware first
    app.use(helmet());
    app.use(cors({ origin: config.allowedOrigins }));

    // Parsing
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: false, limit: "10kb" }));

    // Observability
    app.use(requestId());
    app.use(httpLogger);

    // Routes
    app.use("/api/v1/users", usersRouter);
    app.use("/health", healthRouter);

    // Error handler MUST be last
    app.use(errorHandler);

    return app;
  }

  // cmd/server.ts
  const app = createApp();
  app.listen(config.port, () => logger.info(`Server listening on :${config.port}`));
  ```

- Use **TypeScript** for all Express projects. Type request bodies with Zod-inferred types and augment `Request` with custom properties:
  ```typescript
  // types/express.d.ts
  declare namespace Express {
    interface Request {
      user?: AuthUser;
      requestId: string;
    }
  }
  ```

## 2. Routing & Controllers

- Use **`express.Router()`** to create modular route groups. Mount with `app.use('/api/v1/users', usersRouter)`.
- Keep route handlers **thin**: validate input → call service → serialize response. Zero business logic in controllers:
  ```typescript
  // users.controller.ts
  export async function createUser(req: Request, res: Response, next: NextFunction) {
    const body = createUserSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ errors: body.error.flatten().fieldErrors });
    }
    const user = await userService.create(body.data);
    res.status(201).json({ data: user });
  }
  ```
- Handle **async errors** explicitly. Use `express-async-errors` (patches Express globally) or wrap handlers with an `asyncHandler` utility:

  ```typescript
  // middleware/async-handler.ts
  export const asyncHandler =
    (fn: RequestHandler): RequestHandler =>
    (req, res, next) =>
      Promise.resolve(fn(req, res, next)).catch(next);

  // In router:
  usersRouter.post("/", asyncHandler(createUser));
  ```

- Use **Zod** for all request input validation (body, query params, path params). Parse and validate before calling service logic. Return `422` (Unprocessable Entity) with structured field errors on validation failure.
- Version your API: always prefix routes with `/api/v1/`. Create a new version (`/api/v2/`) for breaking changes, not for additive changes.

## 3. Middleware Stack

- Register middleware in the **correct order** (top-down):
  1. Security headers (`helmet`)
  2. CORS (`cors`)
  3. Body parsing (`express.json()`, `express.urlencoded()`)
  4. Request ID (`req.requestId`)
  5. Request logging (`pino-http`, `morgan`)
  6. Rate limiting (per-route or global)
  7. Authentication/Authorization
  8. Feature routes
  9. 404 not-found handler
  10. Global error handler (4-argument signature, MUST be last)

- Use **Helmet** for security headers. Configure `Content-Security-Policy` explicitly — don't use defaults in production.
- Use **`cors`** with an explicit `origin` allowlist — never use `origin: true` in production:
  ```typescript
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    }),
  );
  ```
- Define a **centralized error-handling middleware** with 4 parameters as the last middleware:

  ```typescript
  // middleware/error-handler.ts
  export function errorHandler(e: unknown, req: Request, res: Response, next: NextFunction) {
    if (e instanceof ZodError) {
      return res.status(422).json({ errors: e.flatten().fieldErrors });
    }
    if (e instanceof NotFoundError) {
      return res.status(404).json({ error: e.message });
    }
    if (e instanceof UnauthorizedError) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    logger.error({ err: e, requestId: req.requestId }, "Unhandled error");
    res.status(500).json({ error: "Internal server error" });
  }
  ```

## 4. Security

- Use **`express-rate-limit`** for rate limiting on all endpoints. Use a Redis store (`rate-limit-redis`) for distributed rate limiting across multiple server instances:

  ```typescript
  import rateLimit from "express-rate-limit";
  import { RedisStore } from "rate-limit-redis";

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    store: new RedisStore({ client: redisClient }),
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });

  authRouter.post("/login", loginLimiter, asyncHandler(login));
  ```

- **Validate all input** using Zod schemas for path params, query params, and body. Never pass raw `req.body` to a database query or pass `req.params.id` unsanitized to dynamic SQL.
- Configure **HSTS**, **CSP**, and other security headers via Helmet. Disable the `X-Powered-By` header: `app.disable('x-powered-by')` (Helmet does this by default).
- **Never log sensitive data** — no passwords, tokens, cookies, API keys, or PII in request logs. Use a redaction list in your logger config.
- Use `express.json({ limit: '10kb' })` to reject large payloads. Add `Content-Type` validation middleware to reject unexpected content types:
  ```typescript
  app.use((req, res, next) => {
    if (["POST", "PUT", "PATCH"].includes(req.method) && !req.is("application/json")) {
      return res.status(415).json({ error: "Content-Type must be application/json" });
    }
    next();
  });
  ```

## 5. Testing, Observability & Deployment

### Testing

- Use **Supertest** + **Vitest** (or Jest) for integration tests. Import the `app` factory directly — no server port required:

  ```typescript
  import request from "supertest";
  import { createApp } from "../../src/app";

  const app = createApp();

  describe("POST /api/v1/users", () => {
    it("creates a user and returns 201", async () => {
      const res = await request(app).post("/api/v1/users").send({ name: "Alice", email: "alice@example.com" }).set("Authorization", `Bearer ${testToken}`);

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe("alice@example.com");
    });
  });
  ```

- Mock external dependencies (databases, third-party API calls) using `vi.mock()` or `nock` for HTTP interception.
- Use **Testcontainers** for integration tests that require a real database.

### Logging & Observability

- Use **`pino`** for structured JSON logging — it is the fastest Node.js logger:

  ```typescript
  import pino from "pino";
  const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });

  // Pino HTTP middleware for automatic request logging
  import pinoHttp from "pino-http";
  app.use(pinoHttp({ logger, redact: ["req.headers.authorization"] }));
  ```

- Integrate **OpenTelemetry** (`@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`) for distributed tracing. Express, HTTP clients, and database calls are automatically instrumented.
- Expose health endpoints for container orchestrators:
  ```typescript
  app.get("/health/live", (req, res) => res.json({ status: "ok" }));
  app.get("/health/ready", async (req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  ```

### Graceful Shutdown

- Handle `SIGTERM` and `SIGINT` for graceful shutdown — drain in-flight requests before exiting:

  ```typescript
  const server = app.listen(config.port);

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Graceful shutdown...`);
    server.close(async () => {
      await db.end(); // close DB connections
      await redisClient.quit(); // close Redis connections
      logger.info("Shutdown complete");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 30_000); // force exit after 30s
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  ```
