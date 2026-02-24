# Rust Development Guidelines

> Objective: Rust project conventions (toolchain, memory safety, error handling, concurrency, and testing).

## 1. Toolchain & Code Quality

- **Cargo**: Use `cargo` for all standard operations (build, test, run, bench). Commit `Cargo.lock` for binary projects. Libraries may omit `Cargo.lock` but should document this decision.
- **Formatting**: Code MUST be formatted with `cargo fmt` before committing. Enforce with `cargo fmt --check` in CI.
- **Linting**: Run `cargo clippy -- -D warnings` in CI to treat all Clippy warnings as errors. Enable additional lints: `#![warn(clippy::pedantic, clippy::nursery)]` for new projects.
- **MSRV**: Define the Minimum Supported Rust Version in `Cargo.toml` (`rust-version = "1.70"`). Test against it in CI.

## 2. Memory & Safety

- **Ownership**: Strictly follow Rust's ownership and borrowing rules. Prefer stack allocation and value types before reaching for `Box<T>` or `Rc<T>`.
- **Unsafe Code**: Avoid `unsafe` blocks unless absolutely necessary for FFI or proven, extreme performance bottlenecks. Every `unsafe` block MUST have a `// SAFETY:` comment documenting the invariants that make it sound.
- **Smart Pointers**: Use `Arc<T>` for shared ownership across threads, `Rc<T>` for single-threaded shared ownership. Avoid `RefCell<T>` in hot paths.
- **Lifetimes**: Name lifetimes descriptively (e.g., `'conn`, `'buf`) rather than `'a`, `'b` when the scope is non-trivial.

## 3. Error Handling

- Use `Result<T, E>` and `Option<T>` for error and absence handling. Use the `?` operator to propagate errors ergonomically.
- Avoid `.unwrap()` and `.expect()` in production code — use them only in tests or where panicking is genuinely the correct behavior. Document why with a comment.
- Use **`thiserror`** for defining library error types and **`anyhow`** for application-level error handling with context wrapping.
- Define meaningful error variants. Avoid stringly-typed errors. Use `#[error("...")]` for user-facing messages.

## 4. Concurrency & Performance

- Choose the appropriate concurrency primitive: `std::thread` for CPU-bound work, `tokio`/`async-std` with `async`/`await` for I/O-bound work.
- Use **`tokio`** as the standard async runtime for production services. Avoid blocking operations in async contexts (`tokio::task::spawn_blocking` for CPU-bound work).
- Use **channels** (`std::sync::mpsc`, `tokio::sync::mpsc`) for message passing. Use `Mutex<T>` (prefer `tokio::sync::Mutex` in async contexts) for shared state.
- Profile before optimizing. Use `cargo bench` with Criterion for benchmarking. Use `flamegraph` or `perf` for profiling.

## 5. Testing & Documentation

- **Unit Tests**: Place unit tests in the same file as the code they test in a `mod tests` module annotated with `#[cfg(test)]`.
- **Integration Tests**: Place integration tests in the `tests/` directory at the project root.
- **Documentation Tests**: Ensure code examples in doc comments are valid (`/// # Examples`) and executed as tests via `cargo test --doc`. Doc tests are the canonical usage examples.
- Use `cargo-nextest` as a faster drop-in replacement for `cargo test` in CI.
- Document all public items with rustdoc. Run `RUSTDOCFLAGS="-D warnings" cargo doc --no-deps` in CI to catch documentation issues.
