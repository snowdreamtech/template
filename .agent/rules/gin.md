# Gin Web Framework Guidelines

> Objective: Define standards for building fast, maintainable, and secure APIs with Gin.

## 1. Project Structure

- Organize by feature/domain, not by type:

  ```text
  cmd/server/main.go     # Entry point — minimal, wires dependencies
  internal/
  ├── handler/           # HTTP handlers (thin controllers)
  ├── service/           # Business logic interfaces and implementations
  ├── repository/        # Data access layer
  ├── middleware/        # Custom middleware
  ├── model/             # Domain models & request/response DTOs
  └── config/            # Config struct and loading logic
  ```

- Use `cmd/` for application entry points and `internal/` to prevent external package imports. Expose only intentionally public code in `pkg/`.
- Wire dependencies in `main.go` using manual injection or a DI library (`wire`, `fx`). Avoid `init()` functions for dependency setup.

## 2. Routing & Handlers

- Group related routes with `router.Group()`. Apply route-group-level middleware (auth, logging) at the group — not per individual route — to avoid duplication.
- Keep handlers thin: bind and validate input → call service → return structured response. No business logic in handlers.
- Bind and validate request data with `c.ShouldBindJSON()` + struct validation tags (`binding:"required,min=1,max=255"`). Return a `400` with a structured error body on validation failure.
- Define consistent response envelopes. Use a helper to avoid repetition:

  ```go
  func OK(c *gin.Context, data any) { c.JSON(http.StatusOK, gin.H{"data": data}) }
  func Fail(c *gin.Context, code int, msg string) { c.JSON(code, gin.H{"error": msg}) }
  ```

- Use `c.ShouldBind`, `c.ShouldBindQuery`, `c.ShouldBindUri` for typed binding of JSON, query parameters, and path parameters respectively.

## 3. Middleware

- Register global middleware with `router.Use()` in this order: recovery → request ID → structured logging → CORS → auth.
- Always include **`gin.Recovery()`** middleware in production to prevent panics from crashing the server.
- Use `c.Set(key, value)` / `c.MustGet(key)` to pass request-scoped values (authenticated user, request ID) between middleware and handlers.
- Implement a custom error-handling middleware that converts domain errors to appropriate HTTP status codes centrally.
- Use typed context keys (unexported struct types) instead of raw strings to prevent namespace collisions.

## 4. Error Handling & Security

- Define typed error types (e.g., `ErrNotFound`, `ErrForbidden`) and map them to HTTP status codes in the error middleware.
- Use `c.Abort()` (not `return`) to stop the middleware chain in auth or validation middleware when a request should not proceed.
- Use **`gin-contrib/cors`** with an explicit origin allowlist. Never allow all origins (`AllowAllOrigins: true`) in production.
- Add rate limiting with **`ulule/limiter`** or a Redis-based limiter on auth and sensitive endpoints.
- Use `c.ShouldBindJSON` instead of `c.BindJSON` — the latter writes a 400 before you can customize the response.

## 5. Performance & Testing

- Use `gin.New()` (not `gin.Default()`) in production to have explicit control over which middleware is loaded.
- Set `GIN_MODE=release` in production to disable debug-mode validations, template auto-reload, and verbose logging.
- Use **`slog`** (Go 1.21+) with a JSON handler for structured request logging via middleware. Inject the logger through `c.Set("logger", logger)`.
- Test handlers with `httptest.NewRecorder()` and `httptest.NewRequest()` without starting a real server. Use **Testify** for assertions.
- Use **`go-sqlmock`** or Testcontainers for database integration tests. Use `golangci-lint` with gin-specific linter rules in CI.
- Integrate **OpenTelemetry** via `otelgin` middleware for distributed tracing. Propagate trace context across service boundaries using `otel.GetTextMapPropagator()`.
- Generate API documentation with **`swaggo/swag`** (`//go:generate swag init`). Keep swagger comments in sync with handler code.
