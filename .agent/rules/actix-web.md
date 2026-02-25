# Actix-web Development Guidelines

> Objective: Define standards for building high-performance, safe Rust web APIs with Actix-web.

## 1. Application Setup

- Use `HttpServer::new(|| App::new()...)` to create the application factory. The closure is called once per worker thread — this is where you register shared state and configure the app.
- Set the worker thread count explicitly: `.workers(num_cpus::get())` or from config. Default is 1 per logical CPU core.
- Register all routes using `.service()` with `web::scope()` for path grouping and scope-level middleware. Keep route registration in a dedicated `routes()` function per domain module.
- Use `web::Data<Arc<T>>` for shared state. Note: `web::Data<T>` wraps in `Arc` internally, but wrapping non-`Clone` types in `Arc` explicitly before calling `.app_data(web::Data::new(...))` avoids confusion.
- Configure server limits explicitly: `HttpServer::new(...)`. `.client_request_timeout(30s)`, `.keep_alive(Duration::from_secs(75))`.

## 2. Handlers & Extractors

- Handler functions are `async fn` with typed **extractors** as parameters — Actix-web automatically injects them:
  - `web::Json<T>`: deserializes JSON body (returns 400/422 on failure automatically)
  - `web::Query<T>`: parses query string parameters
  - `web::Path<T>`: extracts URL path parameters
  - `web::Data<T>`: accesses shared application state
  - `HttpRequest`: access to raw request headers, cookies, and connection info
- Add **custom validation** using the `validator` crate. Derive `Validate` on request DTOs and call `.validate()` inside the handler (or wrap in a custom extractor).
- Define a custom **`JsonConfig`** error handler to return consistent JSON error responses for malformed request bodies:

  ```rust
  .app_data(web::JsonConfig::default().error_handler(|err, _req| {
      actix_web::error::InternalError::from_response(
          err, HttpResponse::BadRequest().json(json!({ "error": err.to_string() }))
      ).into()
  }))
  ```

## 3. State & Concurrency

- Never use `Mutex<T>` for state that is frequently written — prefer `RwLock<T>` or lock-free data structures (e.g., `DashMap`, `Arc<Atomic*>`).
- Never use **blocking I/O** (file reads, `thread::sleep`) directly in async handlers. It blocks the Tokio executor thread. Use `web::block(|| { blocking_work() }).await??` to offload to a thread pool.
- Use **`sqlx`** or **`sea-orm`** for async database access. Do not use synchronous ORMs in async handlers.
- Use `awc` (Actix Web Client) or `reqwest` for outbound HTTP calls. Always set timeouts on outbound requests.

## 4. Error Handling

- Implement the **`ResponseError`** trait on a custom `AppError` enum. This automatically converts domain errors to `HttpResponse` via the `error_response()` method.
- Centralize error mapping: database errors → 500, not-found → 404, validation failures → 422.
- Log all unexpected (5xx) errors with context (request ID, user ID, error details) before returning the response. Use `tracing` for structured logging.
- Use `actix_web::middleware::Logger` for access logging and a custom `ErrorHandlers` middleware for consistent error response formatting.

## 5. Testing & Performance

- Test handlers with `actix_web::test::TestRequest::get()...` and `test::call_service()` — no real TCP server needed.
- Use `test::init_service(App::new()...)` to create a test service. Use `test::read_body_json()` to deserialize response bodies.
- Run `cargo test` in CI. Use `cargo clippy -- -D warnings` for zero linting warnings. Run `cargo audit` for dependency vulnerability scanning.
- Use `cargo flamegraph` or `tokio-console` for performance profiling async handlers.
- Configure HTTP/2 via TLS with `rustls` for production deployments. Enable `keep_alive` and tune `backlog` for high-concurrency scenarios.
