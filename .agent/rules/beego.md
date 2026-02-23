# Beego Web Framework Guidelines

> Objective: Define standards for building full-stack Go web and API applications with Beego.

## 1. Overview

- **Beego** is a full-featured MVC web framework for Go, similar to Django or Rails in philosophy. It includes a built-in ORM (Beego ORM), router, session management, and an admin dashboard.
- Use Beego for projects that benefit from a batteries-included, opinionated structure — especially traditional MVC web apps or backend systems with admin interfaces.
- Use the **`bee` CLI tool** for project scaffolding, hot-reloading (`bee run`), and code generation.

## 2. Project Structure (MVC)

```
controllers/    # HTTP handlers (thin controllers)
models/         # Data models & Beego ORM definitions
routers/        # Route definitions
services/       # Business logic (add this manually; Beego doesn't enforce it)
views/          # HTML templates (if using the web mode)
conf/app.conf   # Application configuration
main.go         # Entry point
```

- Keep controllers thin. Delegate business logic to a `services/` layer.
- Register all routes in `routers/router.go` using `beego.Router()` or `RESTController` for RESTful resources.

## 3. Routing & Controllers

- Use `beego.Router("/path", &controllers.MyController{})` for manual routing.
- For RESTful APIs, embed `beego.Controller` and implement `Get()`, `Post()`, `Put()`, `Delete()` methods.
- Return JSON with `c.Data["json"] = payload; c.ServeJSON()`.
- Use `c.GetString()`, `c.GetInt()` for safe request parameter parsing.

## 4. Configuration

- Use `conf/app.conf` for application-level config (`appname`, `httpport`, `runmode`).
- Use `beego.AppConfig.String("key")` to read config values in code.
- Override config per environment with `conf/app.conf` sections (`[dev]`, `[prod]`) or environment-specific config files.
- Never store secrets in `conf/app.conf`. Use environment variables and read them via `os.Getenv()` or Beego's env config source.

## 5. ORM & Testing

- Use **Beego ORM** with model registration (`orm.RegisterModel(&User{})`) and tagged structs for schema definition.
- Always run `orm.RunSyncdb("default", false, true)` in development to sync schema changes. Never run with `force=true` in production.
- Test controllers using `httptest` or Beego's built-in test helpers (`beego.BeeApp.Handlers.ServeHTTP`).
- Run `go test ./...` in CI. Use `bee run` for local development hot-reload.
