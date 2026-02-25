# Rust Development Guidelines

> Objective: Rust project conventions (toolchain, memory safety, error handling, concurrency, and testing).

## 1. Toolchain & Code Quality

- **Cargo**: Use `cargo` for all standard operations (build, test, run, bench). Commit `Cargo.lock` for binary projects. Libraries may omit `Cargo.lock` but should document this decision.
- **Formatting**: Code MUST be formatted with `cargo fmt` before committing. Enforce with `cargo fmt --check` in CI. Commit the `rustfmt.toml` configuration file.
- **Linting**: Run `cargo clippy -- -D warnings` in CI to treat all Clippy warnings as errors. Enable additional lints: `#![warn(clippy::pedantic, clippy::nursery)]` for new projects.
- **MSRV**: Define the Minimum Supported Rust Version in `Cargo.toml` (`rust-version = "1.70"`). Test against the MSRV in CI to prevent accidental breakage of downstream users.

## 2. Memory & Safety

- **Ownership**: Strictly follow Rust's ownership and borrowing rules. Prefer stack allocation and value types. Reach for `Box<T>` or `Rc<T>` only when necessary.
- **Unsafe Code**: Avoid `unsafe` blocks unless absolutely necessary for FFI or proven, extreme performance bottlenecks. Every `unsafe` block MUST have a `// SAFETY:` comment documenting the invariants that make it sound. Use `cargo-geiger` in CI to track unsafe usage.
- **Smart Pointers**: Use `Arc<T>` for shared ownership across threads, `Rc<T>` for single-threaded shared ownership. Use `Mutex<T>` sparingly in hot paths — prefer lock-free data structures.
- **Lifetimes**: Name lifetimes descriptively (e.g., `'conn`, `'buf`) rather than `'a`, `'b` when the scope is non-trivial. Avoid lifetime annotations in public APIs where they can be replaced with owned types.

## 3. Error Handling

- Use `Result<T, E>` and `Option<T>` for error and absence handling. Use the `?` operator to propagate errors ergonomically.
- Avoid `.unwrap()` and `.expect()` in production code — use them only in tests or where panicking is genuinely the correct behavior. Add a comment explaining why.
- Use **`thiserror`** for defining library error types and **`anyhow`** for application-level error handling with rich context wrapping.
- Define meaningful error variants. Avoid stringly-typed errors. Use `#[error("...")]` for user-facing messages. Use `#[from]` for automatic From implementations.
- Use **`serde`** with `#[derive(Serialize, Deserialize)]` for serialization. Use `#[serde(rename_all = "camelCase")]` or field-level `#[serde(rename)]` to control JSON field names explicitly.

## 4. Concurrency & Performance

- Choose the appropriate concurrency primitive: `std::thread` for CPU-bound work, `tokio`/`async-std` with `async`/`await` for I/O-bound work.
- Use **`tokio`** as the standard async runtime for production services. Avoid blocking operations in async contexts — use `tokio::task::spawn_blocking` offloading for CPU-bound or blocking library calls.
- Use **channels** (`std::sync::mpsc`, `tokio::sync::mpsc`, `crossbeam-channel`) for message passing between threads. Use `Mutex<T>` for shared state.
- Profile before optimizing. Use `cargo bench` with **Criterion** for reproducible microbenchmarks. Use `cargo-flamegraph` or `perf` for CPU profiling.

## 5. Testing & Documentation

- **Unit Tests**: Place unit tests in the same file as the code they test in a `mod tests` block with `#[cfg(test)]`.
- **Integration Tests**: Place integration tests in the `tests/` directory at the project root. These can only access public APIs.
- **Documentation Tests**: Ensure code examples in doc comments (`/// # Examples`) are valid and run as tests via `cargo test --doc`. Doc tests are the canonical usage examples.
- Use `cargo-nextest` as a faster drop-in replacement for `cargo test` in CI.
- Document all public items with rustdoc. Run `RUSTDOCFLAGS="-D warnings" cargo doc --no-deps` in CI to catch undocumented public items.
- Run **`cargo audit`** in CI to check all dependencies for known CVEs. Integrate with `RustSec` advisory database. Block builds on high-severity advisories.
