# Echo Web Framework Guidelines

> Objective: Define standards for building high-performance APIs with the Echo framework.

## 1. Project Structure

- Use the same domain-driven layout:
  ```
  cmd/server/main.go          # Entry point — minimal, bootstraps dependencies
  internal/
  ├── handler/                # HTTP handlers (thin controllers)
  ├── service/                # Business logic
  ├── repository/             # Data access
  ├── middleware/             # Echo middleware
  └── model/                  # Domain models & DTOs
  ```
- Initialize Echo in `main.go` or an `app.go` factory function. Inject dependencies via constructor injection into handlers.
- Wire dependencies in `main.go` using manual DI or a container (`fx`, `wire`). Avoid `init()` functions.

## 2. Routing & Handlers

- Use `e.Group()` to group routes by path prefix. Apply group-level middleware (auth, logging) at the group — not per-route.
- Handler signature MUST be: `func(c echo.Context) error`. Always return an error from handlers — never `nil` after calling `c.JSON()` on an error path.
- Bind and validate with `c.Bind(&req)` followed by `c.Validate(&req)`. Register a custom validator using `go-playground/validator` on `e.Validator` at startup.
- Respond with `c.JSON(http.StatusOK, payload)`. Use `*echo.HTTPError` for structured HTTP error responses.

## 3. Middleware

- Use Echo's built-in middleware: `middleware.Logger()`, `middleware.Recover()`, `middleware.CORS()`, `middleware.RateLimiter()`.
- Apply global middleware with `e.Use()`. Use `g.Use()` for group-scoped middleware.
- Use `c.Set(key, value)` / `c.Get(key)` to pass values (authenticated user, request ID) between middleware and handlers within a request scope.
- Add a **request ID** middleware to generate and propagate a unique ID for each request for logging correlation.

## 4. Error Handling

- Define a custom `HTTPErrorHandler` on the Echo instance for centralized error formatting:
  ```go
  e.HTTPErrorHandler = func(err error, c echo.Context) {
      // map domain errors to HTTP status codes
      // return structured JSON error response
  }
  ```
- Return errors from handlers — let the global error handler format the response. Do not call `c.JSON` for errors and then return `nil`.
- Map domain errors (not-found, forbidden, conflict) to appropriate HTTP status codes in the centralized handler.

## 5. Performance & Testing

- Configure server timeouts always in production to prevent connection exhaustion:
  ```go
  e.Server.ReadTimeout = 5 * time.Second
  e.Server.WriteTimeout = 10 * time.Second
  e.Server.IdleTimeout = 30 * time.Second
  ```
- Use `GracefulShutdown` (`e.Shutdown(ctx)`) with a context timeout to allow in-flight requests to complete.
- Test handlers with `httptest.NewRecorder()` + `httptest.NewRequest()` without starting a real server. Use **Testify** for assertions.
- Use `GIN_MODE=release` equivalent: run Echo in production without debug output. Set `Logger` to a no-op for benchmarks.
