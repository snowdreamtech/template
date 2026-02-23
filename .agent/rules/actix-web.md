# Actix-web Development Guidelines

> Objective: Define standards for building high-performance Rust web APIs with Actix-web.

## 1. Application Setup

- Use `HttpServer::new(|| App::new()...)` to create the application factory. The factory closure is called once per worker thread — define all shared state inside it using `web::Data<T>`.
- Set the worker thread count explicitly with `.workers(num_cpus::get())` for production, rather than relying on defaults.
- Register all routes via `.service()` with `web::scope()` for grouping and middleware scoping.

## 2. Handlers & Extractors

- Handler functions are async Rust functions with typed **extractors** as parameters. Use extractors for all input:
  - `web::Json<T>`: deserialize JSON body (auto-validated if `T` implements `Deserialize`)
  - `web::Query<T>`: parse query strings
  - `web::Path<T>`: extract URL path parameters
  - `web::Data<T>`: access shared application state
- Return `impl Responder` or `Result<impl Responder, Error>` from all handlers.

## 3. State & Concurrency

- Use `web::Data<Arc<Mutex<T>>>` or `web::Data<Arc<RwLock<T>>>` for shared mutable state across worker threads.
- Prefer **async-safe** types and operations. Never use blocking calls (file I/O, heavy CPU work) directly in async handlers — offload with `web::block()`.
- Use `sqlx` or `sea-orm` for async database access (do not use synchronous ORMs in Actix-web handlers).

## 4. Error Handling

- Implement `ResponseError` trait on custom error types to automatically convert them to HTTP responses.
- Use a centralized error enum (e.g., `AppError`) that covers database errors, validation errors, and auth errors.
- Always log errors with context before returning a generic 500 response.

## 5. Testing

- Use `actix-web::test::TestRequest` and `actix_web::test::call_service()` for handler unit tests without starting a server.
- Integration-test with a real `TestServer` for end-to-end HTTP flow validation.
- Run `cargo test` in CI with `--release` for realistic performance characteristics.
