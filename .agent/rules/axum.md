# Axum Web Framework Guidelines

> Objective: Define standards for building safe, ergonomic Rust web APIs with Axum and the Tokio ecosystem.

## 1. Overview & Setup

- **Axum** is a Router-centric, macro-free web framework built on **Tower** and **Hyper**. It leverages Rust's type system for compile-time handler correctness.
- Initialize with a `#[tokio::main]` entry point. Build the router with `Router::new().route(...)` and serve with `axum::serve()` (Axum 0.7+).
- All Tower middleware works with Axum via `.layer()`. This gives access to a rich ecosystem: `tower-http`, `tower_sessions`, `tower-governor` (rate limiting), etc.
- Pin Axum's version explicitly. Breaking changes between minor versions are common in the 0.x ecosystem.

## 2. Routing & Extractors

- Define routes with method-routing helpers: `.route("/users", get(list_users).post(create_user))`.
- Use **Extractors** as typed handler parameters — Axum injects them automatically:
  - `Path<T>`: URL path parameters (deserializes with `serde`)
  - `Query<T>`: query string parameters
  - `Json<T>`: deserialized JSON body (returns 422 on failure automatically)
  - `State<T>`: shared application state (registered via `Router::with_state()`)
  - `Extension<T>`: values injected by middleware layers
- Handler functions can accept any number of extractors as arguments, as long as each implements `FromRequest` or `FromRequestParts`.
- Use `axum::middleware::from_fn` or `axum::middleware::from_fn_with_state` for simple request transformer middleware without implementing the full Tower `Service` trait.

## 3. State Management

- Use `Router::with_state(AppState { ... })` to share application state (DB pool, config, HTTP client) across handlers.
- `AppState` must implement `Clone`. For expensive-to-clone resources, wrap them in `Arc`: `Arc<Inner>` inside `AppState`.
- Use `Extension<T>` for middleware-injected per-request data (e.g., authenticated user, correlation ID). Use `State<T>` for application-wide shared immutable data.
- Avoid global mutable state (`static Mutex<...>`). Prefer passing state explicitly via `State<T>`.

## 4. Middleware & Error Handling

- Axum uses **Tower** middleware. Apply with `.layer()` on routers or specific routes. Use `ServiceBuilder::new().layer(...).layer(...)` to compose multiple layers in order.
- Use `tower_http::trace::TraceLayer` for structured request tracing. Use `tower_http::cors::CorsLayer` for CORS. Use `tower_http::timeout::TimeoutLayer` for request timeouts.
- Define a unified `AppError` type implementing `IntoResponse` to convert all domain errors to HTTP responses:

  ```rust
  impl IntoResponse for AppError {
      fn into_response(self) -> Response {
          let (status, message) = match self {
              AppError::NotFound => (StatusCode::NOT_FOUND, "not found"),
              AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized"),
              _ => (StatusCode::INTERNAL_SERVER_ERROR, "internal error"),
          };
          (status, Json(json!({ "error": message }))).into_response()
      }
  }
  ```

- Use the `?` operator in handlers returning `Result<impl IntoResponse, AppError>` for ergonomic error propagation.

## 5. Testing & Tooling

- Test handlers with `tower::ServiceExt::oneshot()` or `axum_test::TestClient` without starting a real TCP server.
- Use `cargo clippy -- -D warnings` in CI to enforce zero-warning builds. Use `cargo fmt --check` for formatting.
- Use `cargo audit` for dependency vulnerability scanning and `cargo deny` for license/security policy enforcement.
- Use `tracing` + `tracing-subscriber` with `EnvFilter` and JSON formatting for structured request and application logging.
- Use `cargo flamegraph` or `tokio-console` for profiling async bottlenecks. Enable `TOKIO_CONSOLE_ENABLE=1` in development.
