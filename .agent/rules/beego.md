# Beego Web Framework Guidelines

> Objective: Define standards for building full-stack Go web and API applications with Beego.

## 1. Overview & When to Use

- **Beego** is a full-featured MVC web framework for Go, similar in philosophy to Django or Rails. It includes a built-in ORM, router, session management, caching, and an admin interface.
- Use Beego for projects that benefit from a **batteries-included, opinionated structure** — traditional MVC web apps, backend CMS systems, or apps that need the admin dashboard.
- For pure REST APIs or microservices, prefer Gin, Echo, or Chi for lighter weight and better control.
- Use the **`bee` CLI tool** for project scaffolding, hot-reloading (`bee run`), and API documentation generation (`bee generate docs`).

## 2. Project Structure (MVC)

```
controllers/     # HTTP handlers (thin, delegate to services)
models/          # Data models & Beego ORM definitions
routers/         # Route definitions (router.go)
services/        # Business logic layer (add manually)
views/           # HTML templates (if using MVC web mode)
conf/app.conf    # Application configuration
main.go          # Entry point
```

- Keep controllers thin. Delegate all business logic to a `services/` layer.
- Register all routes in `routers/router.go` using `beego.Router()` or `beego.Include()` for RESTful controllers.

## 3. Routing & Controllers

- Use `beego.Router("/path", &controllers.MyController{})` for manual routing.
- For RESTful APIs, embed `beego.Controller` and implement `Get()`, `Post()`, `Put()`, `Delete()` methods.
- Return JSON with `c.Data["json"] = payload; c.ServeJSON()`.
- Use `c.GetString("key")`, `c.GetInt("key", 0)` for safe request parameter parsing with defaults.

## 4. Configuration & Security

- Use `conf/app.conf` for application-level config (`appname`, `httpport`, `runmode`).
- Use `beego.AppConfig.String("key")` to read config values in code.
- Use `runmode = dev | prod` to toggle debug output and error verbosity.
- **Never store secrets** in `conf/app.conf`. Read sensitive values from environment variables using `os.Getenv()`.

## 5. ORM & Testing

- Use **Beego ORM** with model registration (`orm.RegisterModel(&User{})`) and tagged structs.
- Use `orm.RunSyncdb("default", false, true)` in development only. **Never use `force=true` in production** — it drops and recreates tables.
- For production schema management, use a dedicated migration tool (golang-migrate, Atlas, goose) rather than syncing Beego ORM.
- Test controllers using standard `httptest` package or Beego's built-in test helpers. Run `go test ./...` in CI.
