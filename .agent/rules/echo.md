# Echo Web Framework Guidelines

> Objective: Define standards for building high-performance APIs with the Echo framework.

## 1. Project Structure

- Use the same domain-driven layout as `gin.md`:
  ```
  cmd/server/main.go
  internal/handler/, service/, repository/, middleware/, model/
  ```
- Initialize Echo in `main.go` or an `app.go` factory function. Inject dependencies via constructor injection into handlers.

## 2. Routing & Handlers

- Use `e.Group()` to group routes by path prefix and apply middleware at the group level.
- Handler functions must have the signature `func(c echo.Context) error`.
- Bind and validate with `c.Bind(&req)` followed by `c.Validate(&req)`. Register a custom validator (e.g., `go-playground/validator`) on `e.Validator`.
- Return JSON with `c.JSON(code, payload)`. Return errors with `c.JSON(code, echo.Map{"error": msg})` or by returning an `*echo.HTTPError`.

## 3. Middleware

- Use Echo's built-in middleware package (`middleware.Logger()`, `middleware.Recover()`, `middleware.CORS()`) for standard concerns.
- Apply global middleware with `e.Use()`. Use `g.Use()` for group-scoped middleware.
- Use `c.Set(key, value)` / `c.Get(key)` to share authenticated user info between middleware and handlers.

## 4. Error Handling

- Define a custom `HTTPErrorHandler` on the Echo instance to centralize error formatting:
  ```go
  e.HTTPErrorHandler = customErrorHandler
  ```
- Return errors from handlers (do not call `c.JSON` and `return nil` for errors). Let the global handler format the response.

## 5. Performance & Testing

- Echo is one of the fastest Go frameworks. Avoid unnecessary allocations in hot paths (middleware, response encoding).
- Use `e.Server.ReadTimeout` and `e.Server.WriteTimeout` — always configure timeouts in production.
- Test handlers with `httptest` recorder or Echo's `echo.New()` + `rec := httptest.NewRecorder()` pattern.
