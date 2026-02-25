# Echo Web Framework Guidelines

> Objective: Define standards for building high-performance APIs with the Echo framework.

## 1. Project Structure

- Use domain-driven layout:

  ```text
  cmd/server/main.go          # Entry point — minimal, bootstraps dependencies
  internal/
  ├── handler/                # HTTP handlers (thin controllers)
  ├── service/                # Business logic
  ├── repository/             # Data access
  ├── middleware/             # Echo middleware
  └── model/                  # Domain models & DTOs
  ```

- Initialize Echo in `main.go` or an `app.go` factory function. Inject dependencies via constructor injection into handlers.
- Wire dependencies in `main.go` using manual DI or a container (`fx`, `wire`). Avoid `init()` functions for dependency setup.

## 2. Routing & Handlers

- Use `e.Group()` to group routes by path prefix. Apply group-level middleware (auth, logging) at the group — not per-route — to avoid duplication.
- Handler signature MUST be: `func(c echo.Context) error`. Always return an error from handlers — never call `c.JSON()` on an error path and then return `nil`.
- Bind and validate with `c.Bind(&req)` followed by `c.Validate(&req)`. Register a custom validator using `go-playground/validator` on `e.Validator` at startup.
- Respond with `c.JSON(http.StatusOK, payload)`. Use `echo.NewHTTPError(code, message)` for structured HTTP error responses.
- Use `c.Param("id")`, `c.QueryParam("page")`, `c.FormValue("name")` for safe parameter extraction. Always validate and coerce types.

## 3. Middleware

- Use Echo's built-in middleware: `middleware.Logger()`, `middleware.Recover()`, `middleware.CORS()`, `middleware.RateLimiter()`, `middleware.Secure()`.
- Apply global middleware with `e.Use()`. Use `g.Use()` for group-scoped middleware. Order matters — `Recover` and `RequestID` should be first.
- Use `c.Set(key, value)` / `c.Get(key)` to pass values (authenticated user, request ID) between middleware and handlers within a single request lifecycle.
- Add a **request ID** middleware early in the chain to generate and propagate a unique ID for each request, enabling log correlation.

## 4. Error Handling

- Define a custom `HTTPErrorHandler` on the Echo instance for centralized, consistent error formatting:

  ```go
  e.HTTPErrorHandler = func(err error, c echo.Context) {
      code := http.StatusInternalServerError
      message := "internal server error"
      if he, ok := err.(*echo.HTTPError); ok {
          code = he.Code
          message = fmt.Sprint(he.Message)
      }
      _ = c.JSON(code, map[string]string{"error": message})
  }
  ```

- Return errors from handlers — let the global error handler format the response. Do not call `c.JSON()` for errors and then return `nil`.
- Map domain errors (not-found, forbidden, conflict) to appropriate HTTP status codes in the centralized handler, not in individual handlers.

## 5. Performance & Testing

- Configure server timeouts always in production to prevent connection exhaustion:

  ```go
  e.Server.ReadTimeout  = 5 * time.Second
  e.Server.WriteTimeout = 10 * time.Second
  e.Server.IdleTimeout  = 30 * time.Second
  ```

- Use `e.ShutdownWithContext(ctx)` with a context timeout to allow in-flight requests to complete on SIGTERM.
- Test handlers with `httptest.NewRecorder()` + `httptest.NewRequest()` without starting a real server. Use **Testify** for assertions.
- Enable request tracing with `middleware.RequestID()` + `middleware.Logger()` with structured JSON fields. Integrate with OpenTelemetry for distributed tracing.
- Benchmark critical endpoints using `wrk` or `k6` under realistic load. Profile with `pprof` to find hot paths.
