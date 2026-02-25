# Rust Development Guidelines

> Objective: Define Rust project conventions covering toolchain, memory safety, error handling, concurrency, testing, and documentation for building safe, performant systems.

## 1. Toolchain & Code Quality

### Toolchain Setup

- Use **`rustup`** to manage Rust versions. Pin the project's toolchain in `rust-toolchain.toml`:
  ```toml
  [toolchain]
  channel = "1.77.0"     # or "stable" for always-latest-stable
  components = ["rustfmt", "clippy"]
  ```
- Define the **Minimum Supported Rust Version (MSRV)** in `Cargo.toml`. Test against the MSRV in CI to prevent accidental breakage of downstream users:
  ```toml
  [package]
  name       = "mylib"
  version    = "1.0.0"
  rust-version = "1.70"   # MSRV
  ```
- Use **`cargo`** for all standard operations. Commit `Cargo.lock` for **binary projects** for reproducibility. Libraries should check in `Cargo.lock` to CI but not distribute it.

### Formatting & Linting

- Format all code with **`cargo fmt`** before committing. Enforce in CI:
  ```bash
  cargo fmt --all --check    # fail if formatting differs
  ```
- Run **`cargo clippy`** with all warnings treated as errors:
  ```bash
  cargo clippy --all-targets --all-features -- -D warnings
  ```
  Enable additional lints in new projects:
  ```rust
  #![warn(
      clippy::pedantic,
      clippy::nursery,
      clippy::cargo,
      missing_docs,
  )]
  ```
- Run **`cargo audit`** in CI to check all dependencies for known CVEs against the RustSec advisory database. Block builds on high-severity advisories:
  ```bash
  cargo audit --deny warnings
  ```

## 2. Memory Safety & Ownership

### Ownership Principles

- Strictly follow Rust's ownership and borrowing rules. Prefer stack allocation and value types. Use heap allocation only when necessary:
  - `Box<T>` — heap-allocated, single-owner, no runtime cost
  - `Rc<T>` — heap-allocated, reference-counted for single-thread shared ownership
  - `Arc<T>` — atomically reference-counted for cross-thread shared ownership
- Avoid unnecessary cloning. Profile allocations with `dhat-rs` or `cargo-instrument` before adding clones.

### Unsafe Code

- **Minimize `unsafe` blocks** — use only for FFI, hardware access, or proven extreme-performance bottlenecks where safe alternatives are measurably insufficient.
- Every `unsafe` block MUST have a leading `// SAFETY:` comment documenting the invariants that make the code sound:
  ```rust
  // SAFETY: We verified allocation succeeded (ptr != null) and size is non-zero.
  //         The allocation was made by the system allocator, matching the dealloc call.
  unsafe { std::alloc::dealloc(ptr, layout); }
  ```
- Track `unsafe` usage in CI with **`cargo-geiger`**. Alert on new `unsafe` additions in PRs.

### Lifetimes

- Name lifetimes descriptively when the scope is non-trivial: `'conn`, `'buf`, `'session` — not just `'a`, `'b`:
  ```rust
  struct DbQuery<'conn> {
    connection: &'conn DbConnection,
    sql:        String,
  }
  ```
- Avoid explicit lifetime annotations in public APIs where owned types are a reasonable alternative. Prefer `String` over `&str` in struct fields unless lifetime is critical to your use case.

## 3. Error Handling

- Use **`Result<T, E>`** and **`Option<T>`** for error and absence handling. Propagate errors with the `?` operator:
  ```rust
  async fn get_user(id: Uuid) -> Result<User, AppError> {
    let user = db.find_user(id).await?;     // ? propagates errors
    let profile = cache.get(user.id).await.unwrap_or_default();  // OK for cache misses
    Ok(User { user, profile })
  }
  ```
- **Avoid `.unwrap()` and `.expect()`** in production code — use them only in tests or documented panic-safe contexts. When you must use `.expect()`, provide a meaningful error message:
  ```rust
  // ✅ Acceptable in tests
  let user = repo.find_by_email("alice@example.com").expect("test user must exist in fixtures");
  ```
- Use **`thiserror`** for library error types with structured variants:

  ```rust
  #[derive(Debug, thiserror::Error)]
  pub enum AuthError {
    #[error("token has expired")]
    TokenExpired,

    #[error("invalid token signature")]
    InvalidSignature,

    #[error("database error: {0}")]
    Db(#[from] sqlx::Error),
  }
  ```

- Use **`anyhow`** for application-level error handling with rich context:

  ```rust
  use anyhow::{Context, Result};

  fn load_config(path: &Path) -> Result<Config> {
    let content = std::fs::read_to_string(path)
      .with_context(|| format!("failed to read config file: {}", path.display()))?;

    serde_json::from_str(&content)
      .with_context(|| format!("failed to parse config file: {}", path.display()))
  }
  ```

- Use **`serde`** with `#[derive(Serialize, Deserialize)]` for serialization. Annotate field naming conventions explicitly:
  ```rust
  #[derive(serde::Serialize, serde::Deserialize)]
  #[serde(rename_all = "camelCase")]
  pub struct UserResponse {
    pub user_id:    Uuid,     // serializes as "userId"
    pub created_at: DateTime<Utc>,  // serializes as "createdAt"
  }
  ```

## 4. Concurrency & Performance

### Async/Await with Tokio

- Use **`tokio`** as the standard async runtime for production I/O-bound services:
  ```rust
  #[tokio::main]
  async fn main() -> anyhow::Result<()> {
    let pool = PgPoolOptions::new().max_connections(20).connect(&DATABASE_URL).await?;
    let listener = TcpListener::bind("0.0.0.0:3000").await?;
    axum::serve(listener, router(pool)).await?;
    Ok(())
  }
  ```
- **Never block the async executor** with synchronous I/O or CPU-bound work. Offload to a thread pool:

  ```rust
  // ❌ Blocks tokio executor thread
  let result = std::fs::read_to_string("large_file.txt")?;

  // ✅ Offload to blocking thread pool
  let result = tokio::task::spawn_blocking(|| std::fs::read_to_string("large_file.txt")).await??;

  // ✅ Or use async I/O
  let result = tokio::fs::read_to_string("large_file.txt").await?;
  ```

- Use **channels** for message passing between tasks: `tokio::sync::mpsc` (single-consumer), `tokio::sync::broadcast` (multi-consumer fan-out), `tokio::sync::oneshot` (single-value async return).
- Use `Mutex<T>` for shared mutable state. Prefer `tokio::sync::Mutex` in async code. Minimize lock-hold duration — never hold a mutex across an `.await` point.

### Performance Profiling

- Profile before optimizing. Use **`cargo bench`** with **Criterion** for reproducible microbenchmarks that measure statistical significance:

  ```rust
  use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};

  fn bench_parse(c: &mut Criterion) {
    for size in [100, 1000, 10_000] {
      c.bench_with_input(BenchmarkId::new("parse_users", size), &size, |b, &s| {
        let input = generate_users(s);
        b.iter(|| parse_users(&input));
      });
    }
  }
  ```

- Use **`cargo-flamegraph`** or `perf` on Linux for CPU profiling of production workloads.

## 5. Testing & Documentation

### Testing

- **Unit tests** live in the same file as the tested code, in a `mod tests` block with `#[cfg(test)]`:

  ```rust
  // src/auth.rs
  #[cfg(test)]
  mod tests {
    use super::*;

    #[test]
    fn verify_token_returns_claims_for_valid_token() {
      let claims = verify_token(VALID_TOKEN, SECRET).unwrap();
      assert_eq!(claims.sub, "alice@example.com");
    }

    #[test]
    fn verify_token_errors_on_expired_token() {
      assert!(matches!(verify_token(EXPIRED_TOKEN, SECRET), Err(AuthError::TokenExpired)));
    }
  }
  ```

- **Integration tests** live in `tests/` — they can only access the crate's public API.
- **Documentation tests** in `/// # Examples` blocks run as tests via `cargo test --doc`. Write them for all public APIs and keep them up to date.
- Use **`cargo-nextest`** as a faster drop-in replacement for `cargo test` in CI.
- Use **`rstest`** for parameterized tests with multiple input variants.

### Documentation

- Document all public items with rustdoc. Enforce in CI:
  ```bash
  RUSTDOCFLAGS="-D warnings" cargo doc --no-deps --document-private-items
  ```
- Write examples that compile and pass as doctests. Use `# use mylib::prelude::*;` in hidden lines to reduce boilerplate in examples.
