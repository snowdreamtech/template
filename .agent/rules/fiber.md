# Fiber Web Framework Guidelines

> Objective: Define standards for building Express-inspired, high-performance APIs with Fiber.

## 1. Overview & Trade-offs

- **Fiber** is built on **Fasthttp** (not `net/http`), making it one of the fastest Go frameworks. Use it when raw HTTP throughput is the top priority.
- **Critical trade-off**: Fiber is **not compatible** with standard `net/http` middleware or `http.Handler`. Third-party `net/http` middleware cannot be used directly. Evaluate this before adopting Fiber.
- Fiber is an excellent choice for high-concurrency microservices (proxies, gateways, event ingestion). For standard CRUD APIs, Gin or Echo may offer a richer ecosystem.

## 2. Project Structure & Setup

- Use domain-driven layout: `cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`.
- Configure the Fiber app at startup with explicit limits and timeouts:
  ```go
  app := fiber.New(fiber.Config{
      ReadTimeout:  5 * time.Second,
      WriteTimeout: 10 * time.Second,
      BodyLimit:    4 * 1024 * 1024, // 4MB
      ErrorHandler: customErrorHandler,
  })
  ```

## 3. Routing & Handlers

- Use `app.Group()` or `router.Group()` to organize routes by prefix. Apply middleware at the group level.
- Handler signature: `func(c *fiber.Ctx) error`. Return `nil` on success; return structured errors on failure.
- Parse and validate request bodies with `c.BodyParser(&req)`. Use `go-playground/validator` for struct validation.
- Respond with `c.JSON(payload)` or `c.Status(code).JSON(payload)`. Define consistent error envelopes.

## 4. Critical Caveats & Middleware

- **Context reuse**: Fiber reuses `*fiber.Ctx` for performance. **Never store or pass a `*fiber.Ctx` reference across goroutine boundaries.** Copy the data you need (`c.Body()` returns a `[]byte` that is reused — call `c.BodyRaw()` and copy if needed after returning from the handler).
- Use `c.Locals(key, value)` to pass request-scoped values between middleware and handlers.
- Use Fiber's built-in middleware (`fiber/middleware/logger`, `recover`, `cors`, `limiter`, `requestid`).
- Use `fiber/middleware/limiter` with a Redis store for distributed rate limiting across instances.

## 5. Performance & Testing

- Avoid unnecessary heap allocations in hot paths. Fiber's zero-allocation design is only effective if handlers also avoid allocations.
- Use **`app.Test(req, timeout)`** for testing handlers without starting a real HTTP server. This is Fiber's preferred testing mechanism.
- Benchmark critical endpoints with `wrk` or `k6` under production-like load before deploying changes.
- Use `app.ShutdownWithTimeout(timeout)` for graceful shutdown to allow in-flight requests to complete.
