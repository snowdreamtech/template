# Express.js Development Guidelines

> Objective: Define standards for building maintainable, secure Node.js APIs and web apps with Express.

## 1. Project Structure

- Organize by feature/domain, not by type:
  ```
  src/
  ├── routes/       # Route definitions (thin, delegates to controllers)
  ├── controllers/  # Request handling, input validation
  ├── services/     # Business logic
  ├── middlewares/  # Custom Express middleware
  ├── models/       # Data models (Mongoose, Sequelize, Prisma, etc.)
  ├── config/       # Configuration loading and validation
  └── app.ts        # Express app factory (no listen() here)
  cmd/server.ts     # Entry point (calls app.listen())
  ```
- Separate `app.ts` (creates and configures the Express instance) from the server entry point. This makes the app importable for Supertest without starting a real server.
- Use TypeScript for all Express applications. See `typescript.md`.

## 2. Routing & Controllers

- Use `express.Router()` to create modular route groups. Mount with `app.use('/api/v1/users', userRouter)`.
- Keep route handlers thin: validate input → call service → serialize response. No business logic in handlers.
- Use `async`/`await` in route handlers. Either use `express-async-errors` (patches Express to catch async rejections) or wrap handlers with an `asyncHandler` helper.
- Use **Zod** or **`express-validator`** for request input validation. Validate before calling service logic and return a `400` with a structured error payload on failure.

## 3. Middleware

- Register middleware in the correct order: security headers → CORS → body parsing → request logging → routes → 404 handler → global error handler.
- Use **Helmet** for security headers. Use the **cors** package with an explicit `origin` allowlist — never use `origin: true` in production.
- Define a centralized error-handling middleware with 4 parameters: `(err: Error, req, res, next)`. Always register it **last** with `app.use(errorHandler)`.
- Use **`morgan`** for HTTP request logging to stdout in structured (JSON) format. Forward to an aggregator (Datadog, Loki) in production.

## 4. Security

- Use **`express-rate-limit`** to throttle brute-force attacks on auth endpoints. Use a Redis store (`rate-limit-redis`) for distributed rate limiting.
- Use `express.json({ limit: '10kb' })` to prevent large payload attacks. Reject unanticipated `Content-Type` headers.
- Sanitize all query, body, and path parameters. Never interpolate raw user input into database queries, file paths, or shell commands.
- Set `HSTS`, `CSP`, and `X-Frame-Options` headers via Helmet. Disable `X-Powered-By` (`app.disable('x-powered-by')`).

## 5. Testing & Observability

- Use **Supertest** + **Vitest** or **Jest** for integration tests. Import the `app` instance directly — no server port required.
- Mock external dependencies (databases, third-party APIs) using `vitest.mock()` or `nock` for HTTP interception.
- Use **`pino`** or **`winston`** for structured JSON logging. Never use `console.log` in production.
- Expose a `/health` and `/ready` endpoint for container orchestrator health checks. Use a metrics endpoint for Prometheus scraping (via `prom-client`).
