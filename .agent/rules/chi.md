# Chi Router Guidelines

> Objective: Define standards for building idiomatic, composable Go HTTP services with Chi.

## 1. Philosophy & When to Use

- **Chi** is a lightweight, idiomatic Go router that is fully compatible with the standard `net/http` package. It embraces standard library conventions — handlers, middleware, and testing all use standard Go interfaces.
- Choose Chi when you want a **minimal, composable router** without the opinionated structure of heavier frameworks (Gin, Echo, Beego). Excellent for internal services, proxies, and teams that prefer Go idioms over framework magic.
- Chi's compatibility with `net/http` means any third-party `net/http`-compatible middleware works out of the box.
- Do not use Chi if you need built-in features like automatic request validation, ORM integration, or template rendering — use a full framework instead.

## 2. Project Structure

- Since Chi imposes no structure, enforce your own domain-driven layout: `cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`, `internal/middleware/`.
- Define routes close to their handlers. Create a `routes.go` per feature package and mount via `r.Mount("/resource", handler.Routes())`.
- Register application-wide middleware in `main.go` before mounting sub-routers. Middleware order matters.
- Use `chi.NewRouter()` at the top level, then pass sub-routers for domain-specific routing.

## 3. Routing & Handlers

- All handlers use the standard `http.HandlerFunc` signature: `func(w http.ResponseWriter, r *http.Request)`.
- Extract URL parameters with `chi.URLParam(r, "id")`. Use `chi.RouteContext(r.Context())` for the full route context.
- **Pass values between middleware and handlers** using `r.Context()`. Always use an **unexported custom type** as context keys to prevent namespace collisions:

  ```go
  type contextKey string
  const userIDKey contextKey = "userID"
  // Set: ctx := context.WithValue(r.Context(), userIDKey, id)
  // Get: id := r.Context().Value(userIDKey).(string)
  ```

- Use `chi.URLParamFromCtx(ctx, "id")` for extracting route parameters from a stored context.
- Define a `writeJSON(w, code, payload)` helper to avoid request/response boilerplate repetition.

## 4. Middleware

- Chi middleware follows the standard `func(http.Handler) http.Handler` signature — fully composable.
- Apply global middleware with `r.Use()`. Mount sub-routers with `r.Mount()`. The order of `r.Use()` calls determines execution order.
- Use Chi's built-in middleware for standard concerns: `middleware.Logger`, `middleware.Recoverer`, `middleware.RealIP`, `middleware.RequestID`, `middleware.Compress`, `middleware.Timeout`.
- Write custom middleware that wraps `next.ServeHTTP(w, r)`. Return early on errors; do not call `next` to stop the chain.
- Use `middleware.CleanPath` and `middleware.RedirectSlashes` to normalize URL paths.

## 5. Testing & Observability

- Test handlers with `httptest.NewRecorder()` and `httptest.NewRequest()` — no framework-specific helpers needed. This is a major advantage of the `net/http` compatibility.
- Use `net/http/httptest.NewServer()` for integration tests that need a real listening TCP server.
- Add `middleware.RequestID` globally and propagate the request ID in all log entries for distributed tracing correlation.
- Use **`slog`** (Go 1.21+) with a structured JSON handler for request logging. Integrate via a custom Chi middleware that logs method, path, status, latency, and request ID.
- Expose a `GET /healthz` endpoint that returns `200 OK` instantaneously (no DB checks) for liveness probes, and a `GET /readyz` endpoint that checks dependencies for readiness probes.
