# Beego Web Framework Guidelines

> Objective: Define standards for building full-stack Go web and API applications with Beego, covering project structure, routing, ORM, security, testing, and observability.

## 1. Overview & Project Structure

- **Beego** is a full-featured MVC web framework for Go, similar in philosophy to Django or Rails. It includes a built-in ORM, router, session management, caching, logging, and an admin console.
- Use Beego for projects that benefit from a **batteries-included, opinionated structure** — traditional MVC web apps, backend CMS systems, or services that need the built-in admin dashboard.
- For pure REST APIs or microservices, prefer Gin, Echo, or Chi for lighter weight and better performance characteristics.
- Use the **`bee` CLI tool** for project scaffolding, hot-reloading (`bee run`), and Swagger documentation generation (`bee generate docs`). Pin the `bee` version in your project toolchain configuration.

### Standard Project Layout

```text
project-root/
├── cmd/server/          # Entry point (if not using bee scaffold)
├── controllers/         # HTTP handlers — thin; delegate to services
├── models/              # Data models & Beego ORM definitions
├── routers/             # Route definitions (router.go)
├── services/            # Business logic layer (add manually)
├── views/               # HTML templates (MVC web mode only)
├── conf/
│   └── app.conf         # Application configuration (no secrets)
├── static/              # Static assets
├── tests/               # Test files
└── main.go              # Entry point
```

- Keep controllers **thin**. Delegate all business logic to a `services/` layer. Controllers should only: parse input, call a service, handle the response/error.
- Register all routes in `routers/router.go` using `beego.Router()` or `beego.Include()` for RESTful controllers. **Do not** scatter route definitions across multiple files.
- Use the `bee run` command during development for hot-reload. Never use `bee run` in production — build and run the compiled binary.

## 2. Routing & Controllers

- Use `beego.Router("/path", &controllers.MyController{})` for manual routing and method mapping.
- For RESTful APIs, embed `beego.Controller` and implement the HTTP method handlers directly (`Get()`, `Post()`, `Put()`, `Delete()`, `Head()`, `Options()`):

  ```go
  type UserController struct {
      beego.Controller
  }

  func (c *UserController) Get() {
      id := c.GetString(":id")
      // ... fetch user by id
      c.Data["json"] = user
      c.ServeJSON()
  }
  ```

- Return JSON with `c.Data["json"] = payload; c.ServeJSON()`. Always use a **consistent response envelope** structure across endpoints:
  ```go
  type APIResponse struct {
      Code    int         `json:"code"`
      Message string      `json:"message"`
      Data    interface{} `json:"data,omitempty"`
  }
  ```
- Use `c.GetString("key")`, `c.GetInt("key", 0)`, `c.GetBool("key", false)` for safe request parameter parsing with defaults. Always validate input explicitly.
- Use `beego.Include(&controllers.UserController{})` for namespace-based RESTful routing — it automatically registers GET, POST, PUT, DELETE, PATCH, HEAD for the controller struct.
- For URL namespacing and versioning, use `beego.NewNamespace`:
  ```go
  ns := beego.NewNamespace("/api/v1",
      beego.NSInclude(&controllers.UserController{}),
      beego.NSInclude(&controllers.PostController{}),
  )
  beego.AddNamespace(ns)
  ```

## 3. Configuration & Middleware

### Configuration Management

- Use `conf/app.conf` for application-level config (`appname`, `httpport`, `runmode`). Commit a sanitized template (`conf/app.conf.example`); **never** commit actual secrets.
- Use `beego.AppConfig.String("key")` to read config values. Use `beego.AppConfig.DefaultString("key", "default")` for safe fallbacks.
- Use `runmode = dev | prod` to toggle debug output, error verbosity, and template caching. **Always ensure `runmode = prod`** in all production deployments.
- **Never store secrets** in `conf/app.conf`. Read sensitive values (DB passwords, API keys, tokens) from environment variables with `os.Getenv()` or a secrets manager (Vault, AWS Secrets Manager). Use a startup validation function to fail fast if required env vars are missing.
- For multi-environment configs, use Beego's config sections: `[dev]`, `[prod]`, overriding base values per environment.

### Middleware (Filters)

- Use `beego.InsertFilter()` to register middleware (called "filters" in Beego). Apply globally or to specific URL patterns:
  ```go
  // Before route matched — auth, rate limiting
  beego.InsertFilter("*", beego.BeforeRouter, AuthFilter)
  // After route matched — logging, metrics
  beego.InsertFilter("/api/*", beego.BeforeExec, LoggingFilter)
  ```
- Filter execution points: `BeforeRouter`, `BeforeStatic`, `BeforeExec`, `AfterExec`, `FinishRouter`.
- Enable CSRF protection: `beego.BConfig.WebConfig.EnableXSRF = true`. Configure the XSRF token key and cookie TTL. Validate the XSRF token on all state-modifying requests (POST, PUT, DELETE).
- Enable HTTPS-only globally by setting `beego.BConfig.WebConfig.AutoTLS = true` (uses Let's Encrypt) or redirect HTTP to HTTPS in a `BeforeRouter` filter.
- Add `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` security headers in a global `AfterExec` filter.

## 4. ORM, Database & Migrations

### Beego ORM

- Register models and databases at startup before using the ORM:
  ```go
  orm.RegisterDataBase("default", "mysql", dsn)
  orm.RegisterModel(&User{}, &Post{}, &Comment{})
  ```
- Define models with tagged structs. Use `orm:"..."` tags explicitly for column names, sizes, indexes, and relationships:
  ```go
  type User struct {
      Id       int    `orm:"auto;pk"`
      Username string `orm:"size(100);unique"`
      Email    string `orm:"size(200);unique"`
      Created  time.Time `orm:"auto_now_add;type(datetime)"`
  }
  ```
- Use `orm.RunSyncdb("default", false, true)` **in development only** to synchronize schema. **Never use `force=true` in production** — it drops and recreates tables, destroying all data.
- For production schema management, use a dedicated migration tool:
  - **golang-migrate**: `migrate -database "mysql://..." -path ./migrations up`
  - **Atlas**: `atlas schema apply --url "mysql://..."`
  - **goose**: `goose -dir migrations mysql "..." up`
- Prefer explicit transactions for multi-step operations:
  ```go
  o := orm.NewOrm()
  err := o.Begin()
  // ... operations
  if err != nil {
      o.Rollback()
      return err
  }
  o.Commit()
  ```

### Performance & Safety

- Use `QuerySeter` for complex queries with `.Filter()`, `.OrderBy()`, `.Limit()`, `.Offset()`. Always use parameterized queries; never build raw SQL with string interpolation.
- Use `orm.NewOrm().Raw("SELECT ...", args...)` for complex raw queries that the ORM cannot express efficiently. Always use parameter binding, never string concatenation.
- Enable slow query logging: `orm.Debug = true` in development, off in production (it logs all queries).
- Set database connection pool parameters: `orm.SetMaxIdleConns("default", 10)`, `orm.SetMaxOpenConns("default", 100)`, `orm.SetConnMaxLifetime("default", 3*time.Minute)`.

## 5. Testing, Logging & Observability

### Testing

- Test controllers using `httptest.NewRecorder()` and Beego's test helpers. Create a test application instance that mirrors the real one:
  ```go
  func TestGetUser(t *testing.T) {
      r, _ := http.NewRequest("GET", "/api/v1/users/1", nil)
      w := httptest.NewRecorder()
      beego.BeeApp.Handlers.ServeHTTP(w, r)
      assert.Equal(t, http.StatusOK, w.Code)
  }
  ```
- Use **Testify** (`github.com/stretchr/testify`) for assertions.
- Use **Testcontainers** for integration tests requiring a real MySQL/PostgreSQL database instance. Run integration tests in a separate `go test -tags integration ./...` suite.
- Mock service dependencies with interfaces — define service interfaces in `services/` and inject mocks in tests. Beego controllers receive services via constructor injection.
- Run `go test ./...` with `-race` flag in CI: `go test -race ./...`.

### Logging

- Use Beego's built-in logging (`beego/logs` package) with structured adapters. Configure the `console` adapter for development and the `file` adapter for production:
  ```go
  beego.SetLogger(logs.AdapterFile, `{"filename":"logs/app.log","level":7,"maxlines":100000,"maxsize":0,"daily":true,"maxdays":30}`)
  ```
- Log levels: `Emergency > Alert > Critical > Error > Warning > Notice > Info > Debug`. Use `Info` for normal, `Error` for recoverable failures, `Critical` for service-threatening conditions.
- Always include context in log entries: request ID, user ID, operation name, and relevant input data (sanitized of PII/secrets).
- In production, disable debug-level logging and Beego's built-in request log to reduce log volume. Configure a structured JSON format for integration with log aggregation systems (ELK, Loki, CloudWatch).

### Observability

- Expose Prometheus metrics via a `/metrics` endpoint using `beego-prometheus` or by embedding a `promhttp.Handler()` with a custom Go HTTP handler at a separate port.
- Add health check endpoints: `GET /healthz` (process alive, returns 200 immediately) and `GET /readyz` (dependencies ready — DB reachable, cache available).
- Use `golangci-lint run ./...` and `go vet ./...` in CI in addition to tests.
- Profile performance-critical endpoints with `pprof` (expose via `_ "net/http/pprof"` import on a management port). Use `go tool pprof` or `pyroscope` for continuous profiling.
