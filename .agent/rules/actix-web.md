# Actix-web Development Guidelines

> Objective: Define standards for building high-performance, safe Rust web APIs with Actix-web.

## 1. Application Setup

- Use `HttpServer::new(|| App::new()...)` to create the application factory. The closure is called once per worker thread — this is where you register shared state and configure the app.
- Set the worker thread count explicitly with `.workers(num_cpus::get())` or a configurable value for production.
- Register all routes using `.service()` with `web::scope()` for path grouping and scope-level middleware.
- Use `web::Data<Arc<T>>` (not `web::Data<T>`) for shared state that must be accessed from multiple worker threads. `web::Data<T>` already wraps in `Arc` internally, but be explicit about `Arc` for resources you create.

## 2. Handlers & Extractors

- Handler functions are `async fn` with typed **extractors** as parameters — Actix-web automatically injects them:
  - `web::Json<T>`: deserializes JSON body into `T` (returns 400/422 on failure)
  - `web::Query<T>`: parses query string parameters
  - `web::Path<T>`: extracts URL path parameters
  - `web::Data<T>`: accesses shared application state
  - `HttpRequest`: access to the raw request (headers, cookies, etc.)
- Add **custom validation** using the `validator` crate. Implement `Validate` on DTOs and call `.validate()?` at the start of handlers.

## 3. State & Concurrency

- Never use `Mutex<T>` for state that is frequently written — prefer `RwLock<T>` or a lock-free data structure.
- Never use **blocking I/O** (synchronous file reads, `thread::sleep`) directly in async handlers. It blocks the Tokio executor thread. Use `web::block(|| { blocking_work() }).await?` to offload.
- Use **`sqlx`** or **`sea-orm`** for async database access. Do not use synchronous ORMs (Diesel without async features) in async handlers.

## 4. Error Handling

- Implement the **`ResponseError`** trait on a custom `AppError` enum. This converts your domain errors to HTTP responses automatically.
- Centralize error mapping: database errors → 500, not-found errors → 404, validation errors → 422.
- Always log unexpected errors with context (request ID, user ID) before returning a `500` response using a structured logger (tracing, slog).

## 5. Testing & Performance

- Test handlers with `actix_web::test::TestRequest::get()...` and `test::call_service()` — no real server needed.
- Use `test::init_service(App::new()...)` to create a test service instance. Use `test::read_body_json()` to deserialize responses.
- Run `cargo test` in CI. Use `cargo clippy -- -D warnings` to enforce zero warnings. Run `cargo audit` for dependency vulnerability scanning.
- Configure **Tokio worker threads** and **keep-alive** timeouts (`keep_alive = Duration::from_secs(75)`) for production. Enable HTTP/2 via TLS for multiplexing.
