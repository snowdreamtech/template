# Gin Web Framework Guidelines

> Objective: Define standards for building fast, maintainable, and secure APIs with the Gin web framework in Go, covering project structure, routing, middleware, error handling, security, and testing.

## 1. Project Structure

- Organize by **feature/domain**, not by technical type:

  ```text
  cmd/
  └── server/
      └── main.go              # Entry point — minimal, wires dependencies
  internal/
  ├── handler/                 # HTTP handlers (thin controllers)
  │   ├── user_handler.go
  │   └── order_handler.go
  ├── service/                 # Business logic interfaces + implementations
  │   ├── user_service.go
  │   └── user_service_impl.go
  ├── repository/              # Data access layer
  ├── middleware/              # Custom Gin middleware
  ├── model/                   # Domain models & request/response DTOs
  │   ├── user.go
  │   └── response.go
  └── config/                  # Config struct and loading logic
  ```

- Use `cmd/` for application entry points and `internal/` to prevent external package imports. Export intentionally public packages via `pkg/`.
- Wire dependencies in `main.go` using manual injection or a DI library (`wire`, `uber/fx`). Avoid `init()` functions for dependency setup — they run in undefined order and are hard to test.

## 2. Routing & Handlers

### Router Setup

- Use **`gin.New()`** (not `gin.Default()`) in production for explicit control over which middleware is loaded and in what order:

  ```go
  r := gin.New()
  r.Use(
    otelgin.Middleware("my-service"),   // OpenTelemetry tracing
    middleware.RequestID(),             // inject X-Request-ID
    middleware.StructuredLogger(logger), // structured JSON logging
    gin.Recovery(),                     // recover from panics
    middleware.CORS(cfg.AllowedOrigins),
  )
  ```

- Use `router.Group()` to organize related routes. Apply middleware at the group level — not per individual route:

  ```go
  api := r.Group("/api/v1")
  api.Use(middleware.JWTAuth(jwtSecret))  // applied to all routes in group
  {
    users := api.Group("/users")
    users.GET("", h.ListUsers)
    users.GET("/:id", h.GetUser)
    users.POST("", h.CreateUser)
    users.PUT("/:id", h.UpdateUser)
    users.DELETE("/:id", h.DeleteUser)
  }
  ```

### Handler Design

- Keep handlers **thin**: bind/validate input → call service → return structured response. No business logic in handlers:

  ```go
  func (h *UserHandler) CreateUser(c *gin.Context) {
    var req CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
      c.JSON(http.StatusBadRequest, ErrorResponse{Error: err.Error()})
      return
    }

    user, err := h.userService.Create(c.Request.Context(), req)
    if err != nil {
      h.handleError(c, err)  // centralized error mapping
      return
    }

    c.JSON(http.StatusCreated, DataResponse{Data: user})
  }
  ```

- Define **consistent response envelopes** and use helpers to avoid repetition:

  ```go
  type DataResponse struct { Data any `json:"data"` }
  type ErrorResponse struct { Code string `json:"code"`; Message string `json:"message"` }

  func RespondOK(c *gin.Context, data any)       { c.JSON(http.StatusOK, DataResponse{Data: data}) }
  func RespondCreated(c *gin.Context, data any)  { c.JSON(http.StatusCreated, DataResponse{Data: data}) }
  func RespondError(c *gin.Context, status int, code, msg string) {
    c.JSON(status, ErrorResponse{Code: code, Message: msg})
  }
  ```

- Use the correct binding method for each input source:
  - `c.ShouldBindJSON(&req)` — request body (JSON)
  - `c.ShouldBindQuery(&req)` — query parameters
  - `c.ShouldBindUri(&req)` — path parameters
  - Never use `c.BindJSON` — it writes a 400 response before you can customize it

## 3. Middleware

- Register global middleware with `router.Use()` in the correct order: **tracing → request ID → logging → recovery → CORS → auth**.
- Always include **`gin.Recovery()`** middleware in production to prevent panics from crashing the server.
- Use **typed context keys** (unexported struct types) instead of raw strings to prevent namespace collisions:

  ```go
  type contextKey struct{ name string }
  var (
    userKey      = contextKey{"user"}
    requestIDKey = contextKey{"requestID"}
  )

  // Setting in middleware:
  c.Set(userKey.name, authenticatedUser)

  // Reading in handler:
  user := c.MustGet(userKey.name).(*User)
  ```

- Use `c.Set("logger", logger.With("requestId", reqID))` to pass a request-scoped logger into handler context for structured logging per-request.

## 4. Error Handling & Security

### Centralized Error Handling

- Define typed domain error types and map them to HTTP status codes in a centralized error middleware:

  ```go
  func (h *Handler) handleError(c *gin.Context, err error) {
    var notFound *NotFoundError
    var conflict *ConflictError
    var validation *ValidationError

    switch {
    case errors.As(err, &notFound):
      RespondError(c, http.StatusNotFound, "NOT_FOUND", err.Error())
    case errors.As(err, &conflict):
      RespondError(c, http.StatusConflict, "CONFLICT", err.Error())
    case errors.As(err, &validation):
      RespondError(c, http.StatusUnprocessableEntity, "VALIDATION_ERROR", err.Error())
    default:
      c.Set("error", err)  // captured by error logging middleware
      RespondError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "an unexpected error occurred")
    }
  }
  ```

- Use **`c.Abort()`** (not just `return`) in middleware to stop the request chain when a request should not proceed:

  ```go
  func JWTAuth(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
      token := extractBearerToken(c)
      if token == "" {
        c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "authentication required"})
        c.Abort()   // ← stops subsequent middleware and handler from running
        return
      }
      claims, err := validateJWT(token, secret)
      if err != nil {
        c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "invalid token"})
        c.Abort()
        return
      }
      c.Set("claims", claims)
      c.Next()
    }
  }
  ```

### Security

- Use **`gin-contrib/cors`** with an explicit origin allowlist:

  ```go
  r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://app.example.com"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Authorization", "Content-Type"},
    AllowCredentials: true,
    MaxAge:           12 * time.Hour,
  }))
  ```

- Add **rate limiting** on authentication and sensitive endpoints using `ulule/limiter` with Redis backend for distributed rate limiting.
- Set `GIN_MODE=release` in production to disable debug validations and verbose startup logging.

## 5. Performance, Testing & Observability

### Testing

- Test handlers with **`httptest`** — no real server needed:

  ```go
  func TestCreateUser_Returns201(t *testing.T) {
    svc := mocks.NewUserService(t)
    svc.On("Create", mock.Anything, mock.AnythingOfType("CreateUserRequest")).
      Return(&User{ID: 1, Name: "Alice"}, nil)

    h  := NewUserHandler(svc)
    r  := setupTestRouter(h)
    w  := httptest.NewRecorder()
    body := bytes.NewBufferString(`{"name":"Alice","email":"alice@example.com"}`)
    req := httptest.NewRequest(http.MethodPost, "/api/v1/users", body)
    req.Header.Set("Content-Type", "application/json")

    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusCreated, w.Code)
    svc.AssertExpectations(t)
  }
  ```

- Use **Testify** (`testify/assert`, `testify/mock`) for assertions and mock generation (`mockery`).
- Use **Testcontainers** for integration tests requiring a real database or Redis.

### Observability

- Integrate **OpenTelemetry** via `otelgin` middleware for distributed tracing. Propagate trace context across service boundaries:

  ```go
  import "go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
  r.Use(otelgin.Middleware("my-api-service"))
  ```

- Use **`slog`** (Go 1.21+) with a JSON handler for structured request logging. Log method, path, status, duration, and request ID on every request.
- Generate API documentation with **`swaggo/swag`**. Keep swagger comments synchronized with handler signatures and run `swag init` in CI:

  ```bash
  //go:generate swag init --parseDependency --generalInfo cmd/server/main.go --output docs/
  ```
