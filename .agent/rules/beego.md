# Beego Web Framework Guidelines

> Objective: Define standards for building full-stack Go web and API applications with Beego.

## 1. Overview & When to Use

- **Beego** is a full-featured MVC web framework for Go, similar in philosophy to Django or Rails. It includes a built-in ORM, router, session management, caching, and an admin interface.
- Use Beego for projects that benefit from a **batteries-included, opinionated structure** — traditional MVC web apps, backend CMS systems, or services that need the admin dashboard.
- For pure REST APIs or microservices, prefer Gin, Echo, or Chi for lighter weight and better performance.
- Use the **`bee` CLI tool** for project scaffolding, hot-reloading (`bee run`), and API documentation generation (`bee generate docs`). Pin the `bee` version in your project toolchain.

## 2. Project Structure (MVC)

```text
controllers/     # HTTP handlers (thin, delegate to services)
models/          # Data models & Beego ORM definitions
routers/         # Route definitions (router.go)
services/        # Business logic layer (add manually)
views/           # HTML templates (if using MVC web mode)
conf/app.conf    # Application configuration
main.go          # Entry point
```

- Keep controllers **thin**. Delegate all business logic to a `services/` layer.
- Register all routes in `routers/router.go` using `beego.Router()` or `beego.Include()` for RESTful controllers. Do not scatter route definitions across files.

## 3. Routing & Controllers

- Use `beego.Router("/path", &controllers.MyController{})` for manual routing.
- For RESTful APIs, embed `beego.Controller` and implement `Get()`, `Post()`, `Put()`, `Delete()` methods directly.
- Return JSON with `c.Data["json"] = payload; c.ServeJSON()`. Always use a consistent envelope structure across all endpoints.
- Use `c.GetString("key")`, `c.GetInt("key", 0)` for safe request parameter parsing with defaults.
- Use `c.Ctx.Input.RequestBody` to read raw body; call `c.Ctx.Input.EnableBodyParsing(true)` if needed before controllers process data.

## 4. Configuration & Security

- Use `conf/app.conf` for application-level config (`appname`, `httpport`, `runmode`). Commit a sanitized template; do not commit secrets.
- Use `beego.AppConfig.String("key")` to read config values in code. Use `beego.AppConfig.DefaultString("key", "default")` for safe fallbacks.
- Use `runmode = dev | prod` to toggle debug output and error verbosity. Ensure `runmode = prod` in all production deployments.
- **Never store secrets** in `conf/app.conf`. Read sensitive values (DB passwords, API keys) from environment variables using `os.Getenv()` or a secrets manager.
- Enable CSRF protection via `beego.BConfig.WebConfig.EnableXSRF = true`. Configure XSRF token key length and cookie TTL.

## 5. ORM, Database & Testing

- Use **Beego ORM** with model registration (`orm.RegisterModel(&User{})`) and tagged structs. Always register a database alias before using the ORM.
- Use `orm.RunSyncdb("default", false, true)` in development only to synchronize schema. **Never use `force=true` in production** — it drops and recreates tables, destroying data.
- For production schema management, use a dedicated migration tool (`golang-migrate`, `Atlas`, or `goose`) rather than relying on Beego ORM sync.
- Test controllers using the standard `httptest` package or Beego's built-in test helpers (`beego/test`). Run `go test ./...` in CI.
- Use `go vet ./...` and `golangci-lint run` in CI in addition to tests. Profile with `pprof` for performance-critical endpoints.
