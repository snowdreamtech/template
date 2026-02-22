# Go Development Guidelines

> Objective: Go-specific project conventions (formatting, structure, concurrency, and testing).

## 1. Toolchain & Formatting

- **Formatting**: Use `gofmt` or `goimports` exclusively. All Go code MUST be formatted before committing.
- **Linting**: Use `golangci-lint` as the standard linter. Address all linter warnings.

## 2. Project Layout

- **Standard Structure**: Follow the standard Go project layout conventions (e.g., `/cmd` for binaries, `/pkg` for public libraries, `/internal` for private application code).
- **Modules**: Use Go modules (`go.mod`). Ensure `go.mod` and `go.sum` are committed.

## 3. Concurrency & Error Handling

- **Errors**: Return errors explicitly (`return x, err`). Do not use `panic` for normal error handling; reserve `panic` for truly unrecoverable program states.
- **Goroutines**: Never start a goroutine without knowing how it will stop. Use contexts (`context.Context`) for cancellation and timeouts.
- **Channels**: Prefer communicating over channels over sharing memory, but use mutexes (`sync.Mutex`) when simple state protection is clearer.

## 4. Testing

- **Table-Driven Tests**: Use table-driven tests for comprehensive unit testing of various inputs and edge cases.
- **Race Detector**: Always run tests with the race detector enabled (`go test -race`).
