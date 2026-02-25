# Chi Router Guidelines

> Objective: Define standards for building idiomatic, composable, and production-ready Go HTTP services with the Chi router, covering project structure, routing, middleware, observability, and testing.

## 1. Philosophy, When to Use & Project Structure

- **Chi** is a lightweight, idiomatic Go router that is **fully compatible with the standard `net/http` package**. It embraces stdlib conventions — handlers, middleware, and testing all use standard Go interfaces and types.
- Choose Chi when you want a **minimal, composable router** without the opinionated structure of heavier frameworks (Gin, Echo, Beego). Excellent for internal services, proxies, API gateways, and teams that prefer Go idioms and stdlib compatibility over framework convenience.
- Chi's `net/http` compatibility means any third-party `net/http`-compatible middleware works out of the box — a critical advantage for greenfield and brownfield projects alike.
- Do not use Chi if you need built-in features like automatic request validation, ORM integration, template rendering, or admin dashboards — use Gin, Echo, or Beego instead.
- Pin Chi's version: `go get github.com/go-chi/chi/v5@v5.x.y`. Chi v5 and above require Go 1.18+.

### Standard Project Layout

```text
cmd/
└── server/
    └── main.go              # Entry point — router creation, server config, graceful shutdown
internal/
├── handler/                 # HTTP handlers — public functions using http.HandlerFunc signature
│   ├── users.go
│   ├── health.go
│   └── routes.go            # Route registration for this domain (mounted in main)
├── service/                 # Business logic layer
├── repository/              # Data access layer (DB, cache, external APIs)
├── middleware/              # Custom middleware (unexported key types, logging)
└── model/                   # Domain models, request DTOs, response DTOs
config/
└── config.go                # Configuration from environment variables
```

- Register routes per domain in `routes.go` files that return an `http.Handler` (a `chi.Router`):
  ```go
  // internal/handler/routes.go
  func Routes(svc *service.UserService) http.Handler {
      r := chi.NewRouter()
      h := &UserHandler{svc: svc}
      r.Get("/", h.List)
      r.Post("/", h.Create)
      r.Route("/{id}", func(r chi.Router) {
          r.Get("/", h.Get)
          r.Put("/", h.Update)
          r.Delete("/", h.Delete)
      })
      return r
  }
  ```
- Mount sub-routers in `main.go`:
  ```go
  r := chi.NewRouter()
  r.Use(middleware.RequestID, middleware.RealIP, middleware.Logger, middleware.Recoverer)
  r.Mount("/api/v1/users", handler.Routes(userSvc))
  r.Mount("/api/v1/posts", postHandler.Routes(postSvc))
  ```

## 2. Routing & Handlers

- All handlers use the **standard `http.HandlerFunc` signature**: `func(w http.ResponseWriter, r *http.Request)` — no framework-specific types.
- Extract URL path parameters with `chi.URLParam(r, "id")` or `chi.URLParamFromCtx(ctx, "id")`:
  ```go
  func (h *UserHandler) Get(w http.ResponseWriter, r *http.Request) {
      id := chi.URLParam(r, "id")
      user, err := h.svc.GetByID(r.Context(), id)
      if err != nil {
          handleError(w, err)
          return
      }
      writeJSON(w, http.StatusOK, user)
  }
  ```
- Define a `writeJSON(w, code, payload)` helper to avoid repetitive JSON response boilerplate:
  ```go
  func writeJSON(w http.ResponseWriter, code int, v any) {
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(code)
      if err := json.NewEncoder(w).Encode(v); err != nil {
          slog.Error("failed to write JSON response", "err", err)
      }
  }
  ```
- **Pass values between middleware and handlers** using `r.Context()`. Always use an **unexported custom type** as context key to prevent namespace collisions with other packages:

  ```go
  type contextKey string
  const (
      userIDKey  contextKey = "userID"
      requestKey contextKey = "requestID"
  )

  // In middleware:
  ctx := context.WithValue(r.Context(), userIDKey, extractedUserID)
  next.ServeHTTP(w, r.WithContext(ctx))

  // In handler:
  userID, ok := r.Context().Value(userIDKey).(string)
  ```

- Use `r.Route("/{id}", ...)` for inline sub-router definition on parameterized routes.

## 3. Middleware

- Chi middleware follows the **standard `func(http.Handler) http.Handler` signature** — fully composable with any `net/http`-compatible middleware.
- Apply global middleware with `r.Use()`. Mount sub-routers with `r.Mount()`. **Order of `r.Use()` calls determines execution order** — apply in reverse: first `Use` = outermost (first to receive, last to complete).
- Use Chi's built-in middleware (`github.com/go-chi/chi/v5/middleware`) for standard concerns:
  | Middleware | Purpose |
  |---|---|
  | `middleware.RequestID` | Generates a unique request ID |
  | `middleware.RealIP` | Extracts client IP from `X-Forwarded-For` |
  | `middleware.Logger` | Structured request logs |
  | `middleware.Recoverer` | Catches panics and returns 500 |
  | `middleware.Compress` | gzip/deflate response compression |
  | `middleware.Timeout(d)` | Per-request timeout via `context.WithTimeout` |
  | `middleware.Throttle(n)` | Simple in-process concurrency limiter |
  | `middleware.CleanPath` | Normalize URL paths (remove double slashes) |
  | `middleware.RedirectSlashes` | Redirect trailing slashes |
- Write custom middleware that wraps `next.ServeHTTP(w, r.WithContext(ctx))`. Return early (without calling `next`) to short-circuit the chain (e.g., auth failure):
  ```go
  func AuthMiddleware(next http.Handler) http.Handler {
      return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
          token := r.Header.Get("Authorization")
          userID, err := validateToken(token)
          if err != nil {
              writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
              return
          }
          ctx := context.WithValue(r.Context(), userIDKey, userID)
          next.ServeHTTP(w, r.WithContext(ctx))
      })
  }
  ```
- Apply group-scoped middleware to protect specific route groups:
  ```go
  r.Group(func(r chi.Router) {
      r.Use(AuthMiddleware)
      r.Mount("/api/v1/admin", adminHandler.Routes())
  })
  ```

## 4. Error Handling & Response Patterns

- Define a consistent **error response structure** across all endpoints:
  ```go
  type ErrorResponse struct {
      Error   string            `json:"error"`
      Code    string            `json:"code,omitempty"`
      Details map[string]string `json:"details,omitempty"`
  }
  ```
- Centralize HTTP error mapping in a `handleError(w, err)` helper. Map domain errors to appropriate HTTP codes:
  ```go
  func handleError(w http.ResponseWriter, err error) {
      var notFound *NotFoundError
      var validationErr *ValidationError
      switch {
      case errors.As(err, &notFound):
          writeJSON(w, http.StatusNotFound, ErrorResponse{Error: err.Error()})
      case errors.As(err, &validationErr):
          writeJSON(w, http.StatusUnprocessableEntity, ErrorResponse{
              Error:   "validation failed",
              Details: validationErr.Fields,
          })
      default:
          slog.Error("unexpected error", "err", err)
          writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "internal server error"})
      }
  }
  ```
- Never expose internal error messages, database errors, or stack traces in error responses. Log them server-side; return sanitized messages to clients.
- Use `chi.SetRouteNotFound(r, handler)` and the default 405 behavior for missing routes and methods to return consistent machine-readable error responses.

## 5. Testing & Observability

### Testing

- Test handlers with `httptest.NewRecorder()` and `httptest.NewRequest()` — no framework-specific test helpers needed. This is Chi's major advantage:

  ```go
  func TestGetUser(t *testing.T) {
      svc := mocks.NewUserService(t)
      svc.On("GetByID", mock.Anything, "user-id-1").Return(&model.User{ID: "user-id-1", Name: "Alice"}, nil)
      router := chi.NewRouter()
      router.Mount("/users", NewUserHandler(svc).Routes())

      req := httptest.NewRequest("GET", "/users/user-id-1", nil)
      w := httptest.NewRecorder()
      router.ServeHTTP(w, req)

      assert.Equal(t, http.StatusOK, w.Code)
      var user model.User
      json.NewDecoder(w.Body).Decode(&user)
      assert.Equal(t, "Alice", user.Name)
  }
  ```

- Use `net/http/httptest.NewServer()` for integration tests that require a real listening TCP server (e.g., testing WebSocket upgrading, long-polling, TLS).
- Use **Testcontainers** for integration tests requiring real databases. Use **MockGen** or **Testify Mocks** for service/repository mocking.

### Observability

- Use **`log/slog`** (Go 1.21+) with a JSON handler for structured production request logging:
  ```go
  slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
      Level: slog.LevelInfo,
  })))
  ```
- Integrate `middleware.RequestID` globally. Propagate the request ID in all log entries:
  ```go
  func requestLogger(next http.Handler) http.Handler {
      return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
          start := time.Now()
          next.ServeHTTP(w, r)
          slog.Info("request",
              "method", r.Method,
              "path", r.URL.Path,
              "requestId", middleware.GetReqID(r.Context()),
              "latencyMs", time.Since(start).Milliseconds(),
          )
      })
  }
  ```
- Expose standard health probes: `GET /healthz` (liveness — always 200 OK, no dependency checks) and `GET /readyz` (readiness — checks DB, cache, downstream service availability).
- Generate API documentation using **Swaggo/swag** (`go:generate swag init`) or **ogen** from OpenAPI specs. Keep documentation annotations co-located with handler code.
- Expose Prometheus metrics at a `/metrics` endpoint using `prometheus/client_golang`. Track: request count, request latency (labeled by route and method), error rates, and Go runtime metrics.
