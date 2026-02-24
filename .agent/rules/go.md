# Go Development Guidelines

> Objective: Go-specific project conventions (formatting, structure, error handling, concurrency, and testing).

## 1. Toolchain & Code Quality

- **Formatting**: Code MUST be formatted with `gofmt` or `goimports` before committing. Use `goimports` to also manage import grouping automatically.
- **Linting**: Use `golangci-lint` as the standard linter aggregator. Run `golangci-lint run ./...` and fail CI on any warning. Enable at minimum: `errcheck`, `govet`, `staticcheck`, `gosimple`, `unused`, `revive`.
- **Modules**: Use Go modules (`go.mod`). Commit both `go.mod` and `go.sum`. Run `go mod tidy` before every commit to keep them clean.
- **Build**: Use `go build ./...` and `go vet ./...` as health checks at the start of CI.

## 2. Project Layout

- Follow the standard Go project layout conventions:
  - `/cmd/<app>/` — entry point for each binary (`main.go`)
  - `/internal/` — private application code, not importable by external modules
  - `/pkg/` — public libraries intended for reuse across projects
  - `/api/` — OpenAPI/Protobuf definitions and generated code
  - `/scripts/` — build and utility scripts
- Use `internal/` to enforce package boundaries. Never expose implementation details publicly unless required.
- Keep `main.go` minimal: parse flags/config, build the dependency graph, start the server. Contain all logic in packages.

## 3. Error Handling

- Return errors explicitly: `return result, err`. Do not use `panic` for expected error conditions; reserve `panic` for programming errors (invariant violations).
- **Wrap errors** with context: `fmt.Errorf("operation failed: %w", err)`. Use `errors.Is()` and `errors.As()` for error inspection — never compare error strings directly.
- Define **sentinel errors** with `errors.New()` or typed errors for errors that callers need to distinguish: `var ErrNotFound = errors.New("not found")`.
- Always handle every returned error. The linter rule `errcheck` enforces this.

## 4. Concurrency

- Never start a goroutine without knowing how and when it will stop. Goroutine leaks are memory leaks.
- Use `context.Context` for **cancellation and timeouts**; pass context as the first parameter of every blocking or I/O-bound function.
- Prefer **channels** for communication between goroutines; use `sync.Mutex` for simple, local shared-state protection.
- Use `sync.WaitGroup` or `errgroup.Group` (`golang.org/x/sync/errgroup`) to manage goroutine lifecycles and collect errors.
- Avoid sharing memory by communicating. When in doubt, choose channels over mutexes.

## 5. Testing & Logging

- Use **table-driven tests** (`[]struct{...}` with `t.Run`) for testing multiple inputs and edge cases systematically.
- Always run tests with the race detector: `go test -race ./...`. Enable the race detector in CI unconditionally.
- Use **`testify`** (`github.com/stretchr/testify`) for assertions and mocking. Use `require.NoError(t, err)` over manual `if err != nil { t.Fatal() }`.
- Use **`log/slog`** (Go 1.21+) for structured, leveled logging. Avoid `fmt.Println` or the standard `log` package in production code. Initialize the default logger with JSON handler for production.
- Benchmark critical code paths with `go test -bench=. ./...` and track regressions over time.
