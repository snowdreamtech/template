# Go Development Guidelines

> Objective: Go-specific project conventions (formatting, structure, error handling, concurrency, and testing).

## 1. Toolchain & Code Quality

- **Formatting**: Code MUST be formatted with `gofmt` or `goimports` before committing. Use `goimports` to manage import grouping automatically (stdlib → third-party → internal).
- **Linting**: Use `golangci-lint` as the standard linter aggregator. Run `golangci-lint run ./...` and fail CI on any warning. Enable at minimum: `errcheck`, `govet`, `staticcheck`, `gosimple`, `unused`, `revive`, `bodyclose`.
- **Modules**: Use Go modules (`go.mod`). Commit both `go.mod` and `go.sum`. Run `go mod tidy` before every commit to keep them clean. Set `GONOSUMCHECK` appropriately for private modules.
- **Build**: Use `go build ./...` and `go vet ./...` as health checks at the start of CI. Use `go build -trimpath` for reproducible binaries.

## 2. Project Layout

- Follow standard Go project layout conventions:
  - `/cmd/<app>/` — entry point for each binary (`main.go`); keep it minimal
  - `/internal/` — private application code, not importable by external modules
  - `/pkg/` — public libraries intended for reuse across projects
  - `/api/` — OpenAPI/Protobuf definitions and generated code
  - `/scripts/` — build and utility scripts
- Use `internal/` to enforce package boundaries. Never expose implementation details publicly unless deliberately designed for reuse.
- Keep `main.go` minimal: parse flags/config, build the dependency graph, start the server. Contain all logic in packages.
- Prefer **fewer, larger packages** over many small packages. Package names should be short, lowercase, and meaningful without stuttering (`user.User` is wrong — use `user.Profile`).

## 3. Error Handling

- Return errors explicitly: `return result, err`. Do not use `panic` for expected error conditions; reserve `panic` for programming errors and invariant violations.
- **Wrap errors** with context: `fmt.Errorf("parsing config: %w", err)`. Use `errors.Is()` and `errors.As()` for error inspection — never compare error strings directly.
- Define **sentinel errors** with `errors.New()` or typed errors for errors that callers need to distinguish: `var ErrNotFound = errors.New("not found")`.
- Always handle every returned error. The linter rule `errcheck` enforces this. Use `_` assignment only for documented intentional ignores with a comment.

## 4. Concurrency

- Never start a goroutine without knowing how and when it will stop. Goroutine leaks are undetected memory leaks that degrade production services over time.
- Use `context.Context` for **cancellation and timeouts**; pass context as the first parameter of every blocking or I/O-bound function.
- Prefer **channels** for communication between goroutines; use `sync.Mutex` for simple, local shared-state protection.
- Use `sync.WaitGroup` or `errgroup.Group` (`golang.org/x/sync/errgroup`) to manage goroutine lifecycles and propagate errors.
- Use `-race` flag in all tests: `go test -race ./...`. Enable the race detector in CI unconditionally.

## 5. Testing & Logging

- Use **table-driven tests** (`[]struct{...}` with `t.Run`) for testing multiple inputs and edge cases systematically.
- Use **`testify`** (`github.com/stretchr/testify`) for assertions and mocking. Use `require.NoError(t, err)` over manual `if err != nil { t.Fatal() }`.
- Use **Testcontainers** for integration tests requiring real databases or external services in CI.
- Use **`log/slog`** (Go 1.21+) for structured, leveled logging. Avoid `fmt.Println` or the standard `log` package in production code. Initialize the default logger with JSON handler for production.
- Benchmark critical code paths with `go test -bench=. ./...`. Track benchmark results over time to catch performance regressions.
