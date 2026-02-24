# Chi Router Guidelines

> Objective: Define standards for building idiomatic, composable Go HTTP services with Chi.

## 1. Philosophy & When to Use

- **Chi** is a lightweight, idiomatic Go router that is fully compatible with the standard `net/http` package. It embraces the standard library — handlers, middleware, and testing all use standard Go interfaces.
- Choose Chi when you want a **minimal, composable router** without the opinionated structure of heavier frameworks (Gin, Echo, Beego). Excellent for internal services, proxies, and teams that prefer Go idioms.
- Chi's compatibility with `net/http` means any third-party `net/http` middleware works out of the box.

## 2. Project Structure

- Since Chi imposes no structure, enforce your own domain-driven layout: `cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`.
- Define routes close to their handlers. Create a `routes.go` per feature package and mount via `r.Mount("/resource", handler.Routes())`.
- Register application-wide middleware in `main.go` before mounting sub-routers.

## 3. Routing & Handlers

- All handlers use the standard `http.HandlerFunc` signature: `func(w http.ResponseWriter, r *http.Request)`.
- Extract URL parameters with `chi.URLParam(r, "id")`. Use `chi.RouteContext(r.Context())` for the full route context.
- **Pass values between middleware and handlers** using `r.Context()`. Always use an **unexported custom type** for context keys to prevent collisions with other packages:
  ```go
  type contextKey string
  const userKey contextKey = "user"
  ```

## 4. Middleware

- Chi middleware follows the standard `func(http.Handler) http.Handler` signature — fully composable with any `net/http` middleware.
- Apply global middleware with `r.Use()`. Mount sub-routers with `r.Mount()`. The order of `r.Use()` calls matters — middleware is applied in order.
- Use Chi's built-in middleware for standard concerns: `middleware.Logger`, `middleware.Recoverer`, `middleware.RealIP`, `middleware.RequestID`, `middleware.Compress`.
- For JSON error responses, write a `writeJSON(w, code, payload)` helper to avoid repetition across handlers.

## 5. Testing & Observability

- Test handlers with `httptest.NewRecorder()` and `httptest.NewRequest()` — no framework-specific helpers needed.
- Use `net/http/httptest.NewServer()` for integration tests that need a real listening server.
- Add `middleware.RequestID` globally and log the request ID in all log entries for distributed tracing correlation.
- Use **`slog`** (Go 1.21+) with a JSON handler for structured request logging. Integrate via a custom Chi middleware.
