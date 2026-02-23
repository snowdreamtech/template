# Axum Web Framework Guidelines

> Objective: Define standards for building safe, ergonomic Rust web APIs with Axum and the Tokio ecosystem.

## 1. Overview & Setup

- **Axum** is a Router-centric, macro-free web framework built on top of **Tower** and **Hyper**. It leverages Rust's type system for compile-time correctness.
- Initialize with a `tokio::main` entry point. Build the router with `Router::new().route(...)` and serve with `axum::serve()` (Axum 0.7+).

## 2. Routing & Extractors

- Define routes with method-routing helpers: `.route("/users", get(list_users).post(create_user))`.
- Use **Extractors** as handler function parameters — Axum injects them automatically:
  - `Path<T>`: URL path parameters
  - `Query<T>`: query strings
  - `Json<T>`: deserialized JSON body (returns 422 on failure automatically)
  - `State<T>`: shared application state (must add via `Router::with_state()`)
  - `Extension<T>`: values injected by middleware layers
- Handler functions can have any number of extractors as arguments; all must implement `FromRequest`.

## 3. State Management

- Use `Router::with_state(state)` to share application state (DB pool, config) across handlers.
- State must implement `Clone`. Wrap expensive resources in `Arc`: `Arc<AppState>`.
- For middleware-injected data, use `Extension<T>` rather than `State<T>`.

## 4. Middleware & Error Handling

- Axum uses **Tower** middleware. Apply with `.layer()`. Use `tower_http::trace::TraceLayer` for request logging and `tower_http::cors::CorsLayer` for CORS.
- Define a unified `AppError` type implementing `IntoResponse` to convert errors to HTTP responses:
  ```rust
  impl IntoResponse for AppError { fn into_response(self) -> Response { ... } }
  ```
- Use the `?` operator in handlers returning `Result<impl IntoResponse, AppError>` for ergonomic error propagation.

## 5. Testing

- Test handlers directly using `axum::test` helpers or `tower::ServiceExt::oneshot()` with a `Request`.
- Run `cargo test` in CI. Use `cargo clippy -- -D warnings` to enforce lint cleanliness.
