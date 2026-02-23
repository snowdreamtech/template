# Rust Development Guidelines

> Objective: Rust project conventions (formatting, linting, memory management, and testing).

## 1. Toolchain & Formatting

- **Cargo**: Use `cargo` for all standard operations (build, test, run). Commit your `Cargo.lock` for binary projects; libraries may omit it.
- **Formatting**: Code MUST be formatted using `cargo fmt` before committing.
- **Linting**: Run `cargo clippy` and fail the CI on warnings (`cargo clippy -- -D warnings`).

## 2. Memory & Safety

- **Ownership**: strictly adhere to Rust's ownership and borrowing rules.
- **Unsafe Code**: Avoid `unsafe` blocks unless absolutely necessary for FFI or proven, extreme performance bottlenecks. `unsafe` code MUST be heavily documented explaining the safety invariants.
- **Error Handling**: Use `Result<T, E>` and `Option<T>` for error and absence handling. Use the `?` operator. Avoid `.unwrap()` and `.expect()` in production paths; use them only in tests or prototypes.

## 3. Testing

- **Unit Tests**: Place unit tests in the same file as the code they test within a `mod tests` module annotated with `#[cfg(test)]`.
- **Integration Tests**: Place integration tests in the `tests/` directory at the project root.
- **Documentation Tests**: Ensure code examples in doc comments are valid and executed as tests (`cargo test --doc`).
