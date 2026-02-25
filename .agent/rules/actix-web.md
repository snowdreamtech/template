# Actix-web Development Guidelines

> Objective: Define standards for building high-performance, safe Rust web APIs with Actix-web, covering application setup, handler design, state management, error handling, middleware, testing, and observability.

## 1. Application Setup & Project Structure

- **Actix-web** is one of the fastest web frameworks in any language, built on Tokio and an actor-based concurrency model. Use it for **high-throughput REST APIs** where performance is critical.
- The key design point: `HttpServer::new(|| App::new()...)` receives a **closure** that is called once per worker thread. Resources initialized inside this closure are NOT shared across workers — use `web::Data<T>` for shared state passed in from outside.

### Standard Project Layout

```text
src/
├── main.rs              # Entry point: HttpServer setup, bind, run
├── app.rs               # App factory function returning App<...>
├── config.rs            # Configuration (from env vars, config files)
├── state.rs             # AppState definition
├── errors.rs            # AppError type with ResponseError impl
├── handlers/            # HTTP handlers — one module per resource
│   ├── mod.rs
│   ├── users.rs
│   └── health.rs
├── services/            # Business logic layer
├── repositories/        # Data access layer (sqlx, sea-orm, diesel)
├── middleware/          # Custom Actix middleware
└── models/              # Domain models, request DTOs, response DTOs
```

- Extract the app factory into `app.rs` for testability:
  ```rust
  pub fn create_app(
      db_pool: web::Data<PgPool>,
      config: web::Data<Config>,
  ) -> App<impl ServiceFactory<...>> {
      App::new()
          .app_data(db_pool)
          .app_data(config)
          .app_data(web::JsonConfig::default()
              .error_handler(json_error_handler))
          .service(web::scope("/api/v1")
              .configure(users::config)
              .configure(health::config))
          .wrap(middleware::Logger::default())
          .wrap(middleware::Compress::default())
  }
  ```
- Set worker thread count explicitly based on CPU cores and I/O workload: `.workers(num_cpus::get())`. For CPU-bound workloads, use physical core count; for I/O-bound, 2-4× physical cores.
- Configure server limits explicitly to protect against resource exhaustion:
  ```rust
  HttpServer::new(...)
      .client_request_timeout(Duration::from_secs(30))
      .client_disconnect_timeout(Duration::from_secs(5))
      .keep_alive(Duration::from_secs(75))
      .max_connections(25_000)
  ```

## 2. Handlers & Extractors

- Handler functions are `async fn` with **typed extractors** as parameters — Actix-web automatically injects them via the `FromRequest` trait:
  | Extractor | Source | Failure behavior |
  |---|---|---|
  | `web::Json<T>` | JSON request body | Returns 400/422 on failure |
  | `web::Query<T>` | URL query string | Returns 400 on failure |
  | `web::Path<T>` | URL path parameters | Returns 404 on failure |
  | `web::Data<T>` | Shared app state | Panics if not registered |
  | `web::Form<T>` | Form-encoded body | Returns 400 on failure |
  | `HttpRequest` | Raw request object | — |

- Add **custom validation** using the `validator` crate. Derive `Validate` on request DTOs and call `.validate()` inside the handler or wrap in a custom extractor:

  ```rust
  #[derive(Deserialize, Validate)]
  pub struct CreateUserRequest {
      #[validate(length(min = 1, max = 100))]
      pub name: String,
      #[validate(email)]
      pub email: String,
  }

  async fn create_user(
      db: web::Data<PgPool>,
      body: web::Json<CreateUserRequest>,
  ) -> Result<impl Responder, AppError> {
      body.validate().map_err(AppError::Validation)?;
      // ...
  }
  ```

- Define a custom **`JsonConfig`** error handler to return consistent JSON error responses for malformed request bodies:
  ```rust
  web::JsonConfig::default().error_handler(|err, _req| {
      let message = err.to_string();
      InternalError::from_response(
          err,
          HttpResponse::BadRequest().json(json!({ "error": message }))
      ).into()
  })
  ```
- Register routes using `.service()` with `web::resource()` or `web::scope()`. Use the `#[get]`, `#[post]`, etc. proc-macro attributes on handler functions for cleaner route registration:
  ```rust
  pub fn config(cfg: &mut web::ServiceConfig) {
      cfg.service(
          web::scope("/users")
              .service(get_user)    // #[get("/{id}")]
              .service(create_user) // #[post("")]
              .service(delete_user) // #[delete("/{id}")]
      );
  }
  ```

## 3. State, Concurrency & Database

### Shared State

- Use `web::Data<T>` to share state across worker threads. `Data<T>` is an `Arc<T>` wrapper — `T` does not need to implement `Clone` or `Send + Sync` explicitly (Arc handles it).
  ```rust
  let pool = web::Data::new(db_pool);
  let config = web::Data::new(config);
  HttpServer::new(move || {
      App::new()
          .app_data(pool.clone())
          .app_data(config.clone())
  })
  ```
- Never use `Mutex<T>` for frequently-written shared state — prefer `RwLock<T>`, lock-free structures (`DashMap`, `Arc<AtomicUsize>`), or message-passing via channels.

### Concurrency & Blocking

- **Never use blocking I/O** directly in async handlers. It blocks the Tokio executor thread, starving other tasks.
  - File I/O: use `tokio::fs`
  - CPU-bound work: use `web::block(|| { cpu_work() }).await??` (runs on a blocking thread pool)
  - Blocking ORMs/drivers: run in `web::block()` or migrate to async equivalents
- Use **`sqlx`** or **`sea-orm`** for fully async database access. Avoid `diesel` in async handlers unless using `diesel-async`.
- Pool configuration for the database connection pool:
  ```rust
  let pool = PgPoolOptions::new()
      .max_connections(20)
      .min_connections(5)
      .acquire_timeout(Duration::from_secs(10))
      .idle_timeout(Duration::from_secs(600))
      .connect(&database_url)
      .await?;
  ```
- Use `awc` (Actix Web Client) or `reqwest` for outbound HTTP calls. **Always** configure timeouts on outbound requests to prevent cascading failures.

## 4. Error Handling & Middleware

### Error Handling

- Implement the **`ResponseError`** trait on a custom `AppError` enum to automatically convert domain errors into HTTP responses:

  ```rust
  #[derive(Debug, thiserror::Error)]
  pub enum AppError {
      #[error("not found: {0}")]
      NotFound(String),
      #[error("unauthorized")]
      Unauthorized,
      #[error("validation failed: {0}")]
      Validation(#[from] ValidationErrors),
      #[error("database error")]
      Database(#[from] sqlx::Error),
      #[error("internal error: {0}")]
      Internal(#[from] anyhow::Error),
  }

  impl ResponseError for AppError {
      fn error_response(&self) -> HttpResponse {
          let status = self.status_code();
          HttpResponse::build(status)
              .json(json!({ "error": self.to_string() }))
      }

      fn status_code(&self) -> StatusCode {
          match self {
              AppError::NotFound(_) => StatusCode::NOT_FOUND,
              AppError::Unauthorized => StatusCode::UNAUTHORIZED,
              AppError::Validation(_) => StatusCode::UNPROCESSABLE_ENTITY,
              _ => StatusCode::INTERNAL_SERVER_ERROR,
          }
      }
  }
  ```

- Log all 5xx errors with full context (request ID, path, method, user ID, error chain) before returning the response. Never expose internal details (stack traces, DB errors) to clients.

### Middleware

- Use `App::wrap()` to apply middleware globally. Order matters — middleware is applied bottom-to-top (last wrapped = outermost = first to receive requests).
- Standard Actix-web middleware to include: `middleware::Logger`, `middleware::Compress`, `middleware::NormalizePath`, `middleware::DefaultHeaders` (security headers).
- Use `actix_web_lab` or `actix-cors` for CORS middleware. Configure `CorsMiddleware` restrictively in production — whitelist allowed origins explicitly.
- Add a **request ID** middleware early in the middleware stack to generate and attach a unique `X-Request-Id` header. Log this ID in all handler logs for distributed tracing.
- For authentication, write a custom middleware that extracts and validates JWT tokens, inserts the `AuthUser` into request extensions, and returns `401` for protected routes.

## 5. Testing, Observability & Deployment

### Testing

- Test handlers using the built-in `actix_web::test` module — no real TCP server needed:
  ```rust
  #[actix_web::test]
  async fn test_get_user_returns_ok() {
      let app = test::init_service(create_app(test_db_pool(), test_config())).await;
      let req = test::TestRequest::get()
          .uri("/api/v1/users/1")
          .insert_header(("Authorization", "Bearer test-token"))
          .to_request();
      let resp = test::call_service(&app, req).await;
      assert_eq!(resp.status(), StatusCode::OK);
      let body: UserResponse = test::read_body_json(resp).await;
      assert_eq!(body.id, 1);
  }
  ```
- Use **Testcontainers** (`testcontainers-modules::postgres`) for integration tests requiring real PostgreSQL. Initialize the pool once for the test suite using `tokio::sync::OnceCell` or `rstest` fixtures.
- Run `cargo test` in CI with `RUST_BACKTRACE=1` for detailed error output on test failures.

### Observability

- Use `tracing` + `tracing-actix-web` for structured, per-request span instrumentation compatible with OpenTelemetry:
  ```toml
  [dependencies]
  tracing-actix-web = "0.7"
  ```
  ```rust
  App::new().wrap(TracingLogger::default())
  ```
- Output structured JSON logs using `tracing_subscriber::fmt::json()` for integration with log aggregation (ELK, Loki, Datadog).
- Expose Prometheus metrics at a separate `/metrics` endpoint using `actix-web-prometheus` or manual `prometheus` crate integration.
- Expose health probes: `GET /health/live` (always 200) and `GET /health/ready` (checks DB connectivity and downstream dependencies).

### Build & Deployment

- Build production binaries with `--release` and strip debug symbols: set `[profile.release] strip = true` in `Cargo.toml` for smaller binaries.
- Use `cargo audit` for CVE scanning and `cargo deny` for license and dependency policy enforcement. Run both in CI as a hard gate.
- Configure TLS with `rustls` (preferred over `openssl` for pure-Rust builds):
  ```rust
  HttpServer::new(...)
      .bind_rustls_0_23("0.0.0.0:443", tls_config)?
  ```
- Use Docker multi-stage builds with `rust:alpine` or `distroless/cc` as the final image to produce minimal production containers.
