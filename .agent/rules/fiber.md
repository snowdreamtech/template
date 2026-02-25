# Fiber Web Framework Guidelines

> Objective: Define standards for building Express-inspired, high-performance APIs with Fiber.

## 1. Overview & Trade-offs

- **Fiber** is built on **Fasthttp** (not `net/http`), making it one of the fastest Go frameworks. Use it when raw HTTP throughput is the top priority.
- **Critical trade-off**: Fiber is **not compatible** with standard `net/http` middleware or `http.Handler`. Third-party `net/http` middleware cannot be used directly — evaluate this constraint before adopting Fiber in a project with existing middleware.
- Fiber is an excellent choice for high-concurrency microservices (proxies, gateways, event ingestion). For standard CRUD APIs or projects requiring the `net/http` ecosystem, Gin or Echo may be more appropriate.
- Pin Fiber's version explicitly (`go get github.com/gofiber/fiber/v2@v2.x.y`) and review the changelog before upgrading.

## 2. Project Structure & Setup

- Use domain-driven layout: `cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`, `internal/middleware/`.
- Configure the Fiber app at startup with explicit limits and timeouts — never use default values in production:

  ```go
  app := fiber.New(fiber.Config{
      ReadTimeout:  5 * time.Second,
      WriteTimeout: 10 * time.Second,
      IdleTimeout:  60 * time.Second,
      BodyLimit:    4 * 1024 * 1024, // 4MB
      ErrorHandler: customErrorHandler,
  })
  ```

- Define a centralized `customErrorHandler` that converts errors to consistent JSON responses with appropriate HTTP status codes.

## 3. Routing & Handlers

- Use `app.Group()` or `router.Group()` to organize routes by prefix. Apply middleware at the group level.
- Handler signature: `func(c *fiber.Ctx) error`. Return `nil` on success; return `fiber.NewError(code, message)` or a sentinel error on failure.
- Parse and validate request bodies with `c.BodyParser(&req)`. Use `go-playground/validator` for struct validation after parsing.
- Respond with `c.JSON(payload)` or `c.Status(code).JSON(payload)`. Define a consistent response envelope across all endpoints.
- Use `c.Params("id")`, `c.Query("page", "1")`, `c.Get("Authorization")` for safe parameter extraction with defaults.

## 4. Critical Caveats & Context

- **Context reuse**: Fiber reuses `*fiber.Ctx` for performance. **Never store or pass a `*fiber.Ctx` reference to a goroutine or outside the handler.** Copy the data you need before the handler returns.
- `c.Body()` returns a `[]byte` that is recycled after the handler returns. If you need the body in an async goroutine, copy it: `body := make([]byte, len(c.Body())); copy(body, c.Body())`.
- Use `c.Locals(key, value)` to pass request-scoped values between middleware and handlers within a single request lifecycle.
- Use Fiber's built-in middleware: `fiber/middleware/logger`, `recover`, `cors`, `limiter`, `requestid`, `compress`. Configure each explicitly.
- Use `fiber/middleware/limiter` with a Redis store for distributed rate limiting across multiple instances.

## 5. Performance & Testing

- Avoid unnecessary heap allocations in hot paths. Fiber's zero-allocation design only yields peak performance when handlers also minimize allocations.
- Use **`app.Test(req, timeout)`** for testing handlers without starting a real HTTP server. This is Fiber's preferred unit testing mechanism:

  ```go
  req := httptest.NewRequest("GET", "/health", nil)
  resp, err := app.Test(req, -1)
  ```

- Gracefully shut down with `app.ShutdownWithTimeout(10 * time.Second)` to allow in-flight requests to complete.
- Benchmark critical endpoints with `wrk` or `k6` under production-like load before deploying significant changes.
- Run `golangci-lint` with the `gofiber` linter rules enabled in CI.
