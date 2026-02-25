# Axum Web Framework Guidelines

> Objective: Define standards for building safe, ergonomic, and production-ready Rust web APIs with Axum and the Tokio/Tower ecosystem, covering routing, state management, middleware, error handling, testing, and observability.

## 1. Overview, Project Structure & Setup

- **Axum** is a Router-centric, macro-free web framework built on **Tower** (middleware ecosystem) and **Hyper** (HTTP). It leverages Rust's type system for compile-time handler correctness — incorrect extractor usage is a compile error, not a runtime panic.
- Choose Axum when you need **type-safe, composable handlers** with access to the full Tower middleware ecosystem. Axum does not reinvent middleware — any `tower::Layer` works with Axum, giving access to `tower-http`, `tower_sessions`, `tower-governor`, etc.

### Standard Project Layout

```text
src/
├── main.rs              # Entry point: tokio::main, server setup, signal handling
├── app.rs               # Application factory: builds Router with state and layers
├── config.rs            # Configuration loading (from env/files)
├── state.rs             # AppState definition
├── error.rs             # AppError type with IntoResponse impl
├── handlers/            # HTTP handlers — one module per domain entity
│   ├── mod.rs
│   ├── user.rs
│   └── health.rs
├── services/            # Business logic layer
├── repositories/        # Data access layer (DB, cache)
├── middleware/          # Custom middleware implementations
└── models/              # Domain models and request/response DTOs
```

- Initialize with a `#[tokio::main]` entry point. Build the router in an `app()` factory function to separate construction from serving — this makes it testable:
  ```rust
  #[tokio::main]
  async fn main() {
      let state = AppState::new().await;
      let app = create_router(state);
      let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
      axum::serve(listener, app)
          .with_graceful_shutdown(shutdown_signal())
          .await
          .unwrap();
  }
  ```
- Pin Axum's version explicitly in `Cargo.toml`. Breaking changes between minor versions are common in the 0.x ecosystem — review the changelog before upgrading.
- Implement graceful shutdown with `with_graceful_shutdown()`, listening for `SIGTERM` and `SIGINT` signals to allow in-flight requests to complete.

## 2. Routing & Extractors

- Define routes with HTTP method-routing helpers:
  ```rust
  Router::new()
      .route("/users", get(list_users).post(create_user))
      .route("/users/:id", get(get_user).put(update_user).delete(delete_user))
  ```
- Use **Extractors** as typed handler parameters — Axum injects them based on type through the `FromRequest`/`FromRequestParts` traits:
  | Extractor | Source | Notes |
  |---|---|---|
  | `Path<T>` | URL path parameters | `T: Deserialize` |
  | `Query<T>` | Query string | `T: Deserialize` |
  | `Json<T>` | JSON body | Returns 422 on failure |
  | `State<T>` | Shared app state | Registered via `with_state()` |
  | `Extension<T>` | Middleware-injected values | Per-request data |
  | `TypedHeader<T>` | Typed request header | Requires `headers` feature |
  | `ConnectInfo<T>` | Client IP/socket | Requires `connect_info` feature |
- Handler functions can accept any number of extractors as arguments (up to 16 by default) — the order does not matter for request-parts extractors.
- Use `axum::middleware::from_fn` or `from_fn_with_state` for concise async middleware functions without implementing the full Tower `Service` trait manually.
- Use `Router::nest()` to mount sub-routers at a path prefix. Use `Router::merge()` to combine routes defined in different modules.

## 3. State Management

- Use `Router::with_state(AppState { ... })` to share application state (DB pool, config, HTTP client) across all handlers in a type-safe way:

  ```rust
  #[derive(Clone)]
  struct AppState {
      db: Arc<PgPool>,       // Arc because Clone is required; PgPool is already Arc internally
      config: Arc<Config>,
  }

  async fn get_user(State(state): State<AppState>, Path(id): Path<Uuid>) -> Response {
      // ...
  }
  ```

- `AppState` MUST implement `Clone`. For expensive-to-clone resources (connections, caches), wrap them in `Arc<T>`.
- Use `Extension<T>` (middleware-inserted via `Extension` layer or `request.extensions_mut()`) for per-request data injected by middleware (e.g., authenticated user, `X-Request-Id`). Use `State<T>` for application-wide shared data.
- Avoid global mutable state (`static Mutex<...>` or `lazy_static!` for runtime-initialized state). Pass all dependencies through `State<T>` for explicit, testable dependency injection.
- For per-request scoped data from authentication middleware, define a typed `AuthUser` extractor that reads from `request.extensions()` — this keeps authentication concerns out of handlers.

## 4. Middleware & Error Handling

### Middleware & Layers

- Axum uses **Tower** layers. Apply with `.layer()` on routers or specific routes. Use `ServiceBuilder::new().layer(...).layer(...)` to compose multiple layers in the correct order (top of `ServiceBuilder` = outermost layer = first to process requests):
  ```rust
  let app = Router::new()
      .route("/", get(handler))
      .layer(
          ServiceBuilder::new()
              .layer(TraceLayer::new_for_http())
              .layer(TimeoutLayer::new(Duration::from_secs(30)))
              .layer(CompressionLayer::new())
              .layer(CorsLayer::permissive()),   // restrict in production
      );
  ```
- Key `tower-http` layers to use: `TraceLayer` (OpenTelemetry-compatible request tracing), `TimeoutLayer` (request timeout), `CompressionLayer` (gzip/brotli/zstd), `CorsLayer` (CORS), `RequestIdLayer` (unique request ID), `ValidateRequestHeaderLayer` (API key auth).
- Implement rate limiting with `tower_governor` or `tower-http`'s `SetRequestHeader` with a custom rate limiter backed by Redis.

### Error Handling

- Define a unified `AppError` enum implementing `IntoResponse` to convert all domain errors to consistent HTTP JSON responses:

  ```rust
  #[derive(Debug)]
  pub enum AppError {
      NotFound(String),
      Unauthorized,
      Forbidden,
      BadRequest(String),
      Internal(anyhow::Error),
  }

  impl IntoResponse for AppError {
      fn into_response(self) -> Response {
          let (status, message) = match &self {
              AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.as_str()),
              AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized"),
              AppError::Forbidden => (StatusCode::FORBIDDEN, "forbidden"),
              AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.as_str()),
              AppError::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "internal server error"),
          };
          (status, Json(json!({ "error": message }))).into_response()
      }
  }
  ```

- Use the `?` operator in handlers returning `Result<impl IntoResponse, AppError>` for ergonomic error propagation throughout the call stack.
- Log all 5xx errors with context (request ID, path, user ID, error details) using `tracing::error!` before the response is returned. Never expose internal details to clients.
- Use `From<T> for AppError` implementations to convert library errors (sqlx, reqwest, serde) into `AppError` without manual matching in every handler.

## 5. Testing, Observability & Performance

### Testing

- Test handlers without starting a real TCP server using `tower::ServiceExt::oneshot()`:
  ```rust
  #[tokio::test]
  async fn test_get_user() {
      let state = AppState::new_test().await;
      let app = create_router(state);
      let request = Request::builder()
          .uri("/users/1")
          .body(Body::empty())
          .unwrap();
      let response = app.oneshot(request).await.unwrap();
      assert_eq!(response.status(), StatusCode::OK);
      let body: User = response.json().await.unwrap();
      assert_eq!(body.id, 1);
  }
  ```
- Use `axum_test::TestClient` for a higher-level test helper API that simplifies request construction and response assertion.
- Use **Testcontainers** (`testcontainers-modules::postgres`) for integration tests requiring a real PostgreSQL instance.
- Run `cargo test` with `--nocapture` for detailed output in CI. Enable the race detector in async tests: `RUST_BACKTRACE=1 cargo test`.

### Observability

- Use `tracing` + `tracing-subscriber` with `EnvFilter` and JSON formatting (`tracing_subscriber::fmt::json()`) for structured request and application logging:
  ```rust
  tracing_subscriber::registry()
      .with(EnvFilter::from_default_env())
      .with(tracing_subscriber::fmt::layer().json())
      .init();
  ```
- Integrate `TraceLayer::new_for_http()` with `tower_http::trace` for automatic per-request tracing. Propagate `traceparent` headers for distributed tracing with OpenTelemetry.
- Expose Prometheus metrics at `/metrics` using `prometheus` + `axum_prometheus` (or manual `axum-metrics` integration). Track: request count, latency (p50/p95/p99), error rate, and active connections.
- Expose health check endpoints: `GET /healthz` (liveness — always 200 OK) and `GET /readyz` (readiness — checks DB, cache, downstream dependencies).

### Performance & Tooling

- Use `cargo clippy -- -D warnings` in CI for zero-warning builds. Use `cargo fmt --check` for formatting. Use `cargo audit` for dependency vulnerability scanning and `cargo deny` for license/security policy enforcement.
- Use `cargo flamegraph` or **tokio-console** (`TOKIO_CONSOLE_ENABLE=1`) for profiling async bottlenecks. Enable `tokio` features for tokio-console instrumentation in development builds only.
- Configure connection pool parameters for sqlx/SeaORM: max connections (based on DB tier), min idle connections, acquire/idle timeouts.
- Use **HTTP/2** with TLS (`rustls`) for production. Configure `keep_alive` and `tcp_nodelay` for latency-sensitive APIs.
