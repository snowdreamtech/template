# Echo Web Framework Guidelines

> Objective: Define standards for building high-performance, idiomatic Go APIs with the Echo framework, covering project structure, routing, middleware, error handling, validation, testing, and observability.

## 1. Project Structure & Setup

- **Echo** is a lightweight, high-performance Go web framework that sits on top of the standard `net/http` package. It provides a fast router, middleware support, context extension, and request binding — without the overhead of a full-stack framework.
- Use Echo when you want a **performant, balanced framework** that has more convenience than Chi but is lighter than Beego, with `net/http`-compatible middleware support.

### Standard Project Layout

```text

cmd/
└── server/
    └── main.go              # Entry point: Echo setup, dependency injection, server lifecycle
internal/
├── handler/                 # HTTP handlers — thin controllers
│   ├── users.go
│   ├── health.go
│   └── routes.go            # Route registration per domain
├── service/                 # Business logic layer
├── repository/              # Data access layer (DB, cache)
├── middleware/              # Custom Echo middleware
└── model/                   # Domain models, request DTOs, response DTOs
config/
└── config.go                # Configuration loading (from env)

```

- Initialize Echo in `main.go` or an `app.go` factory function to separate construction from serving:

  ```go
  func NewApp(cfg *config.Config, deps *Dependencies) *echo.Echo {
      e := echo.New()
      e.HideBanner = true
      e.Validator = NewValidator() // custom go-playground/validator wrapper
      e.HTTPErrorHandler = customErrorHandler(e)

      // Global middleware
      e.Use(middleware.RequestID())
      e.Use(middleware.Logger())
      e.Use(middleware.Recover())
      e.Use(middleware.Compress())

      // Routes
      api := e.Group("/api/v1")
      users.RegisterRoutes(api, deps.UserHandler)

      return e
  }
  ```

- Configure server timeouts immediately — never run Echo with default indefinite timeouts in production:

  ```go
  server := &http.Server{
      Addr:         ":" + cfg.Port,
      ReadTimeout:  5 * time.Second,
      WriteTimeout: 10 * time.Second,
      IdleTimeout:  120 * time.Second,
      Handler:      e,
  }
  ```

- Implement graceful shutdown with `e.Shutdown(ctx)` on `SIGTERM`/`SIGINT` signals. Allow 30 seconds for in-flight requests to complete.

## 2. Routing & Handlers

- Use `e.Group()` to group routes by path prefix and apply group-level middleware (auth, rate limiting, logging):

  ```go
  func RegisterRoutes(api *echo.Group, h *UserHandler) {
      users := api.Group("/users")
      users.Use(middleware.AuthMiddleware())
      users.GET("", h.List)
      users.POST("", h.Create)
      users.GET("/:id", h.Get)
      users.PUT("/:id", h.Update)
      users.DELETE("/:id", h.Delete)
  }
  ```

- **Handler signature MUST be**: `func(c echo.Context) error`. Always return an error from handler — never call `c.JSON()` on an error path and then return `nil`:

  ```go
  func (h *UserHandler) Get(c echo.Context) error {
      id := c.Param("id")
      if id == "" {
          return echo.ErrBadRequest
      }
      user, err := h.svc.GetByID(c.Request().Context(), id)
      if err != nil {
          return err // propagated to HTTPErrorHandler
      }
      return c.JSON(http.StatusOK, user)
  }
  ```

- Bind and validate request DTOs with `c.Bind(&req)` followed by `c.Validate(&req)`. Register a custom validator implementing `echo.Validator`:

  ```go
  type CustomValidator struct {
      validator *validator.Validate
  }
  func (cv *CustomValidator) Validate(i interface{}) error {
      if err := cv.validator.Struct(i); err != nil {
          return echo.NewHTTPError(http.StatusUnprocessableEntity, err.Error())
      }
      return nil
  }
  e.Validator = &CustomValidator{validator: validator.New()}
  ```

- Use `c.Param("id")`, `c.QueryParam("page")`, `c.FormValue("name")` for type-safe parameter extraction.

## 3. Middleware

- Apply global middleware with `e.Use()`. Use `g.Use()` for group-scoped middleware. **Order matters** — apply `Recover()` and `RequestID()` first (outermost), then logging, then business middleware.
- Use Echo's built-in middleware (`github.com/labstack/echo/v4/middleware`):

  | Middleware | Purpose | Configuration |
  |---|---|---|
  | `middleware.Logger()` | Structured access logs | Use `middleware.LoggerWithConfig()` for JSON format |
  | `middleware.Recover()` | Recover from panics | Returns 500, logs stack trace |
  | `middleware.CORS()` | CORS headers | Restrict origins in production |
  | `middleware.RateLimiter()` | In-process rate limiting | Use Redis store for distributed |
  | `middleware.Secure()` | Security headers | Sets HSTS, X-Frame-Options, CSP |
  | `middleware.Gzip()` | Response compression | Set min ratio to avoid compressing small payloads |
  | `middleware.RequestID()` | Unique request ID | Auto-generates UUID if not present |
  | `middleware.Timeout()` | Per-request timeout | `middleware.TimeoutWithConfig()` |

- Use `c.Set(key, value)` / `c.Get(key)` to pass values (authenticated user, request ID, tenant) between middleware and handlers within a request lifecycle.
- Configure structured JSON logging for production:

  ```go
  e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
      Format: `{"time":"${time_rfc3339_nano}","id":"${id}","remote_ip":"${remote_ip}","host":"${host}","method":"${method}","uri":"${uri}","status":${status},"error":"${error}","latency":${latency},"latency_human":"${latency_human}"}` + "\n",
      Output: os.Stdout,
  }))
  ```

## 4. Error Handling

- Define a **custom `HTTPErrorHandler`** on the Echo instance for centralized, consistent error formatting. This is the single place where all errors are converted to HTTP responses:

  ```go
  func customErrorHandler(e *echo.Echo) echo.HTTPErrorHandler {
      return func(err error, c echo.Context) {
          if c.Response().Committed {
              return
          }
          code := http.StatusInternalServerError
          message := "internal server error"
          var he *echo.HTTPError
          if errors.As(err, &he) {
              code = he.Code
              if msg, ok := he.Message.(string); ok {
                  message = msg
              }
          }
          if code >= 500 {
              e.Logger.Errorf("server error: %+v, request_id: %s", err, c.Response().Header().Get(echo.HeaderXRequestID))
          }
          c.JSON(code, map[string]interface{}{"error": message}) // nolint:errcheck
      }
  }
  ```

- Return errors from handlers; let the global error handler format the response. **Never** call `c.JSON()` for an error path and then return `nil`.
- Map domain-specific errors to HTTP errors in a helper or in the error handler — not in individual handlers:

  ```go
  func domainErrToHTTP(err error) error {
      switch {
      case errors.Is(err, domain.ErrNotFound):
          return echo.NewHTTPError(http.StatusNotFound, "resource not found")
      case errors.Is(err, domain.ErrForbidden):
          return echo.ErrForbidden
      default:
          return err // falls through to 500 in error handler
      }
  }
  ```

- Use `echo.NewHTTPError(code, message)` for well-known HTTP errors. Use `fmt.Errorf("operation: %w", err)` for wrapped domain errors that are unwrapped in the error handler.

## 5. Testing, Performance & Observability

### Testing

- Test handlers using `httptest.NewRecorder()` and `httptest.NewRequest()` with the Echo instance:

  ```go
  func TestGetUser(t *testing.T) {
      e := echo.New()
      e.Validator = NewValidator()
      h := NewUserHandler(mocks.NewUserService(t))
      e.GET("/users/:id", h.Get)

      req := httptest.NewRequest(http.MethodGet, "/users/user-1", nil)
      rec := httptest.NewRecorder()
      e.ServeHTTP(rec, req) // runs full middleware stack

      assert.Equal(t, http.StatusOK, rec.Code)
      var user model.User
      json.NewDecoder(rec.Body).Decode(&user)
      assert.Equal(t, "user-1", user.ID)
  }
  ```

- Alternatively, use Echo's `echotest` utilities for more expressive test setup.
- Use **Testcontainers** for integration tests requiring real databases. Mock service dependencies with `mockery` or `testify/mock`.
- Run `go test -race ./...` in CI to detect data races. Run `golangci-lint run ./...` for static analysis.

### Performance

- Configure server timeouts (see section 1). Never run Echo with default `http.Server` (infinite timeouts) in production.
- Use connection pooling for databases. Configure max idle/open connections and connection lifetime:

  ```go
  db.SetMaxIdleConns(10)
  db.SetMaxOpenConns(100)
  db.SetConnMaxLifetime(5 * time.Minute)
  ```

- Benchmark critical endpoints with `wrk` or `k6` under realistic load before major releases.
- Use `pprof` to profile hot endpoints. Expose the `pprof` handler on a management port (not the API port) in production environments.

### Observability

- Use `log/slog` (Go 1.21+) or `uber-go/zap` for structured logging. Integrate via a custom Echo logger adapter.
- Add **distributed tracing** with OpenTelemetry: instrument the Echo router with `go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho`:

  ```go
  e.Use(otelecho.Middleware("my-service"))
  ```

- Expose Prometheus metrics using the Echo middleware from `echo-contrib/prometheus` or `labstack/echo-contrib`. Track: request count, latency histograms (by route/method/status), and error rates.
- Expose health probes: `GET /health/live` (always 200) and `GET /health/ready` (checks DB, cache, downstream dependencies).
