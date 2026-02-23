# Chi Router Guidelines

> Objective: Define standards for building idiomatic, composable Go HTTP services with Chi.

## 1. Philosophy

- **Chi** is a lightweight, idiomatic Go router that is fully compatible with `net/http`. It embraces the standard library — handlers, middleware, and testing all use standard interfaces.
- Choose Chi when you want a minimal, composable router without the opinionated structure of heavier frameworks.

## 2. Project Structure

- Since Chi imposes no structure, enforce your own discipline. Use the same domain-driven layout: `cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`.
- Define routes close to their handlers. Create a `routes.go` (or `router.go`) per feature package and mount them in `main.go`:
  ```go
  r.Mount("/users", userHandler.Routes())
  ```

## 3. Routing & Handlers

- All handlers have the standard `http.HandlerFunc` signature: `func(w http.ResponseWriter, r *http.Request)`.
- Pass values between middleware and handlers using `r.Context()` with typed keys (use an unexported custom type for context keys to avoid collisions).
- Use `chi.URLParam(r, "id")` to extract URL parameters.

## 4. Middleware

- Chi middleware uses the standard `func(http.Handler) http.Handler` signature — fully composable with any `net/http` middleware.
- Apply global middleware with `r.Use()`. Mount sub-routers with `r.Mount()`.
- Prefer Chi's built-in middleware (`chi/middleware.Logger`, `Recoverer`, `RealIP`, `RequestID`) for standard concerns.

## 5. Testing

- Testing is straightforward due to `net/http` compatibility: use `httptest.NewRecorder()` and `httptest.NewRequest()`.
- No framework-specific test helpers needed — standard Go testing patterns apply directly.
- Use `net/http/httptest.NewServer()` for integration tests that need a real listening server.
