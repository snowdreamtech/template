# Fiber Web Framework Guidelines

> Objective: Define standards for building Express-inspired, high-performance Go APIs with Fiber (Fasthttp-based), covering project structure, routing, middleware, critical caveats, testing, and production configuration.

## 1. Overview, Trade-offs & Project Structure

- **Fiber** is built on **Fasthttp** (not `net/http`), making it one of the fastest Go frameworks. Use it when raw HTTP throughput is the top priority and per-request latency is critical.
- **Critical trade-off before adopting Fiber:**

  | ✅ Advantage | ❌ Disadvantage |
  |---|---|
  | Extremely high throughput (Fasthttp) | NOT compatible with `net/http` handlers |
  | Express.js-inspired API (familiar for Node.js devs) | Third-party `net/http` middleware cannot be used |
  | Built-in middleware suite | `*fiber.Ctx` is reused — never store across goroutines |
  | Zero-allocation design for hot paths | Smaller ecosystem than Gin/Echo |

- Fiber is an excellent choice for high-concurrency microservices, proxies, event ingestion, and API gateways. For standard CRUD APIs or projects requiring the `net/http` ecosystem, prefer **Gin** or **Echo**.
- Pin Fiber's version explicitly (`go get github.com/gofiber/fiber/v2@v2.x.y`) and review the changelog before upgrading.

### Standard Project Layout

```text

cmd/
└── server/
    └── main.go              # Entry point — app creation, listen, graceful shutdown
internal/
├── handler/                 # HTTP handlers — one file per domain
├── service/                 # Business logic layer
├── repository/              # Data access layer (DB, cache)
├── middleware/              # Custom Fiber middleware
└── model/                   # Domain models, request/response DTOs
config/
└── config.go                # Configuration loading (from env)

```

- Initialize Fiber with **explicit production configuration** — never rely on defaults:

  ```go
  app := fiber.New(fiber.Config{
      ReadTimeout:   5 * time.Second,
      WriteTimeout:  10 * time.Second,
      IdleTimeout:   120 * time.Second,
      BodyLimit:     4 * 1024 * 1024,   // 4 MB
      Concurrency:   256 * 1024,         // max goroutines
      ErrorHandler:  errorHandler,
      AppName:       "my-service v1.0.0",
  })
  ```

- Define a centralized `errorHandler` that converts all errors to consistent JSON responses with appropriate HTTP status codes. Register it as `fiber.Config.ErrorHandler`.

## 2. Routing & Handlers

- Use `app.Group()` or a sub-`fiber.Router` to organize routes by domain prefix and attach group-level middleware:

  ```go
  api := app.Group("/api/v1", middleware.Logger(), middleware.RequestID())
  users := api.Group("/users", middleware.Auth())
  users.Get("/", handler.ListUsers)
  users.Get("/:id", handler.GetUser)
  users.Post("/", handler.CreateUser)
  ```

- Handler signature: `func(c *fiber.Ctx) error`. **Always** return `nil` on success and a non-nil error (or `fiber.NewError(code, message)`) on failure — never write to the response and return `nil` simultaneously on an error path.
- Parse and validate request bodies:

  ```go
  type CreateUserRequest struct {
      Name  string `json:"name" validate:"required,min=1,max=100"`
      Email string `json:"email" validate:"required,email"`
  }

  func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
      var req CreateUserRequest
      if err := c.BodyParser(&req); err != nil {
          return fiber.ErrBadRequest
      }
      if errs := h.validator.Struct(req); errs != nil {
          return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{"errors": errs})
      }
      // ...
  }
  ```

- Respond with `c.JSON(payload)` or `c.Status(code).JSON(payload)`. Define a **consistent response envelope** (`data`, `error`, `meta`) across all endpoints.
- Use `c.Params("id")`, `c.Query("page", "1")`, `c.Get("Authorization")` for safe parameter extraction with typed defaults.

## 3. Critical Caveats & Context Safety

- **Context reuse is Fiber's most critical difference from `net/http`:** Fiber reuses `*fiber.Ctx` instances for performance (Fasthttp's request pool). **NEVER:**
  - Store or pass `*fiber.Ctx` to a goroutine
  - Store `*fiber.Ctx` in a struct field
  - Use `c.Body()`, `c.Params()`, or `c.Locals()` outside the synchronous handler execution
- If you need body or context data in a goroutine or after the handler returns, **copy it explicitly before the handler returns:**

  ```go
  // Safe: copy before launching goroutine
  body := make([]byte, len(c.Body()))
  copy(body, c.Body())
  userID := c.Locals("userID").(string) // copy primitive values
  go processAsync(body, userID)         // safe to use copied data
  ```

- Use `c.Locals(key, value)` to pass request-scoped values (authenticated user, request ID, tenant ID) between middleware and handlers within a single request lifecycle.
- For immutable shared state across handlers (DB pool, configuration, service clients), inject via closure over the handler struct or use `*fiber.App` with stored references — not the `Locals` mechanism.

## 4. Middleware & Security

### Built-in Middleware

Use Fiber's built-in middleware for standard concerns. Enable and configure each explicitly:

```go

import (
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/limiter"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"
    "github.com/gofiber/fiber/v2/middleware/requestid"
)

app.Use(recover.New())           // recover from panics
app.Use(requestid.New())         // unique request ID header
app.Use(logger.New(logger.Config{  // structured JSON logging
    Format: `{"time":"${time}","status":${status},"latency":"${latency}","ip":"${ip}","method":"${method}","path":"${path}"}\n`,
}))
app.Use(cors.New(cors.Config{    // restrict in production
    AllowOrigins: "https://example.com",
    AllowHeaders: "Origin, Content-Type, Authorization",
}))

```

### Rate Limiting

- Use `fiber/middleware/limiter` with a Redis store (`gofiber/storage/redis`) for distributed rate limiting across multiple instances:

  ```go
  app.Use(limiter.New(limiter.Config{
      Max:        100,
      Expiration: 1 * time.Minute,
      Storage:    redisStorage,
      KeyGenerator: func(c *fiber.Ctx) string {
          return c.IP()
      },
      LimitReached: func(c *fiber.Ctx) error {
          return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
              "error": "rate limit exceeded",
          })
      },
  }))
  ```

### Security Headers

- Add security headers via `fiber/middleware/helmet` or a custom `AfterExec` middleware:

  ```go
  app.Use(helmet.New()) // sets CSP, X-Frame-Options, HSTS, etc.
  ```

## 5. Performance, Testing & Deployment

### Testing

- Test handlers using Fiber's built-in `app.Test(req, timeout)` method — no real HTTP server or listener needed:

  ```go
  func TestGetUser(t *testing.T) {
      app := setupTestApp(t) // creates fiber.App with test deps
      req := httptest.NewRequest("GET", "/api/v1/users/1", nil)
      req.Header.Set("Authorization", "Bearer test-token")
      resp, err := app.Test(req, 10000) // 10s timeout (-1 = no timeout)
      assert.NoError(t, err)
      assert.Equal(t, 200, resp.StatusCode)
  }
  ```

- Use **Testify** for assertions. Use **Testcontainers** for integration tests requiring real databases.
- Use `go test -race ./...` in CI to detect data races (especially important given Fiber's context-reuse model).
- Write integration tests for the full middleware stack by using `app.Test()` with realistic request payloads.

### Performance & Allocation

- Avoid unnecessary heap allocations in hot-path handlers. Fiber's zero-allocation design only yields peak performance when handlers also minimize allocations:
  - Avoid `fmt.Sprintf()` for string construction — use `append([]byte, ...)` or `strings.Builder`
  - Pool large temporary buffers with `sync.Pool`
  - Avoid JSON marshaling of large objects per request — consider response streaming or protocol buffers
- Benchmark critical endpoints with `wrk` or `k6`:

  ```bash
  wrk -t12 -c400 -d30s http://localhost:3000/api/v1/health
  k6 run scripts/load-test.js
  ```

- Use `golangci-lint run ./...` with recommended Fiber-compatible rules in CI.

### Deployment

- Gracefully shut down with `app.ShutdownWithTimeout(30 * time.Second)` to allow in-flight requests to complete:

  ```go
  c := make(chan os.Signal, 1)
  signal.Notify(c, os.Interrupt, syscall.SIGTERM)
  go func() {
      <-c
      if err := app.ShutdownWithTimeout(30 * time.Second); err != nil {
          log.Fatal("graceful shutdown failed:", err)
      }
  }()
  if err := app.Listen(":3000"); err != nil {
      log.Fatal(err)
  }
  ```

- Expose health endpoints: `GET /health/live` (always 200) and `GET /health/ready` (checks DB/cache connectivity).
- Configure Prometheus metrics using the `prometheus` middleware from `gofiber/contrib/prometheus`. Expose `/metrics` on a management port (not the same as the API port).
