# Gin Web Framework Guidelines

> Objective: Define standards for building fast, maintainable APIs and web applications with Gin.

## 1. Project Structure

- Organize by feature/domain, not by type:
  ```
  cmd/server/main.go     # Entry point
  internal/
  ├── handler/           # HTTP handlers (thin controllers)
  ├── service/           # Business logic
  ├── repository/        # Data access
  ├── middleware/        # Custom middleware
  └── model/             # Domain models & DTOs
  ```
- Use `cmd/` for application entry points and `internal/` to prevent external package imports.

## 2. Routing & Handlers

- Group related routes with `router.Group()`. Apply middleware at the group level, not per-route.
- Keep handlers thin: validate input, call a service, return a response. No business logic in handlers.
- Bind and validate request data with `c.ShouldBindJSON()` + struct tags (`binding:"required,min=1"`).
- Use `c.JSON()` for all JSON responses. Define consistent response envelopes:
  ```go
  c.JSON(http.StatusOK, gin.H{"data": result})
  c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
  ```

## 3. Middleware

- Register global middleware with `router.Use()`: logging, recovery, CORS, auth.
- Always include `gin.Recovery()` middleware in production to prevent panics from crashing the server.
- Use `c.Set()` / `c.Get()` to pass values between middleware and handlers within a request scope.

## 4. Error Handling

- Define custom error types and a centralized error-handling middleware.
- Use `c.Abort()` (not `return`) to stop the middleware chain in auth/validation middleware.
- Return consistent HTTP status codes: `400` for bad input, `401`/`403` for auth, `404` for not found, `500` for server errors.

## 5. Performance & Testing

- Use `gin.New()` (not `gin.Default()`) in production to control which middleware is loaded.
- Use `GIN_MODE=release` in production to disable debug logging overhead.
- Test handlers using `httptest.NewRecorder()` and `httptest.NewRequest()` without starting a real server.
