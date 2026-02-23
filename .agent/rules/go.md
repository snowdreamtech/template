# Go Development Guidelines

> Objective: Go-specific project conventions (formatting, structure, error handling, concurrency, and testing).

## 1. Toolchain & Formatting

- **Formatting**: Use `gofmt` or `goimports` exclusively. All Go code MUST be formatted before committing.
- **Linting**: Use `golangci-lint` as the standard linter. Address all linter warnings (`golangci-lint run ./...`).
- **Modules**: Use Go modules (`go.mod`). Ensure both `go.mod` and `go.sum` are committed to version control.

## 2. Project Layout

- Follow the standard Go project layout conventions (`/cmd` for binaries, `/internal` for private application code, `/pkg` for public libraries).
- Use `internal/` to enforce package boundaries — code in `internal/` cannot be imported by external modules.

## 3. Error Handling

- Return errors explicitly (`return result, err`). Do not use `panic` for expected error conditions.
- **Wrap errors** with context using `fmt.Errorf("operation failed: %w", err)`. Use `errors.Is()` and `errors.As()` for error inspection — never compare error strings directly.
- Define custom sentinel errors with `errors.New()` or typed errors for errors that callers need to distinguish.

## 4. Concurrency

- Never start a goroutine without knowing how and when it will stop. Use `context.Context` for cancellation and timeouts; pass context as the first parameter of every blocking function.
- Prefer **channels** for communication between goroutines. Use `sync.Mutex` for simple, local shared-state protection.
- Use `sync.WaitGroup` or `errgroup.Group` (`golang.org/x/sync/errgroup`) to manage goroutine lifecycles and collect errors.

## 5. Testing & Logging

- Use **table-driven tests** (`[]struct{...}`) for testing multiple inputs and edge cases.
- Always run tests with the race detector: `go test -race ./...`.
- Use **`log/slog`** (Go 1.21+) for structured logging. Avoid `fmt.Println` for production logging.
