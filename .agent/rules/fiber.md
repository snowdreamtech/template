# Fiber Web Framework Guidelines

> Objective: Define standards for building Express-inspired, high-performance APIs with Fiber.

## 1. Overview & When to Use

- **Fiber** is built on **Fasthttp** (not net/http), making it one of the fastest Go frameworks. Use it when raw throughput is the top priority.
- Note: Because Fiber uses Fasthttp, it is **not compatible** with standard `net/http` middleware or the `http.Handler` interface. Evaluate this trade-off before adopting.

## 2. Project Structure & Setup

- Use the same domain-driven layout: `cmd/`, `internal/handler/`, `internal/service/`, `internal/repository/`.
- Configure the app with `fiber.Config` for timeouts, body limits, and error handling:
  ```go
  app := fiber.New(fiber.Config{
      ReadTimeout:  5 * time.Second,
      WriteTimeout: 10 * time.Second,
      ErrorHandler: customErrorHandler,
  })
  ```

## 3. Routing & Handlers

- Use `app.Group()` or `router.Group()` to organize routes. Apply middleware at the group level.
- Handler signature: `func(c *fiber.Ctx) error`.
- Parse and validate request bodies with `c.BodyParser(&req)`. Use `go-playground/validator` for struct validation.
- Respond with `c.JSON(payload)` or `c.Status(code).JSON(payload)`.

## 4. Middleware

- Use Fiber's built-in middleware (`fiber/middleware/logger`, `recover`, `cors`, `limiter`).
- Use `c.Locals(key, value)` to pass values between middleware and handlers (equivalent to `c.Set`/`c.Get` in other frameworks).

## 5. Important Caveats & Testing

- **Context reuse**: Fiber reuses `*fiber.Ctx` for performance. Never store a `*fiber.Ctx` reference in a goroutine — use `c.Context()` (`*fasthttp.RequestCtx`) for goroutine-safe access, or copy the values you need.
- **Body immutability**: Call `c.BodyRaw()` if you need the raw body after `BodyParser`, as it may be consumed.
- Test with Fiber's built-in `app.Test(req)` method, which does not start a real HTTP server.
