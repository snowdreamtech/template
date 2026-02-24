# go-zero Microservices Framework Guidelines

> Objective: Define standards for building high-concurrency Go microservices with go-zero.

## 1. Overview & Philosophy

- **go-zero** is a cloud-native microservices framework with built-in code generation (`goctl`), API gateway, service discovery, adaptive circuit-breaking, rate limiting, and load shedding. It is designed for high-concurrency production systems.
- Core philosophy: **generate boilerplate, focus on business logic.** Use `goctl` for all service scaffolding. Do not write repetitive transport, routing, or middleware code by hand.
- Keep `goctl` version pinned in the project (`go.mod` dependency + CI setup). Mismatched `goctl` and `go-zero` versions can cause generation incompatibilities.

## 2. Project Structure (goctl Generated)

- Use `goctl api new` for HTTP API services and `goctl rpc new` for gRPC services:
  ```
  service/
  ├── api/                    # HTTP API layer
  │   └── internal/
  │       ├── config/         # Config struct (YAML deserialization)
  │       ├── handler/        # HTTP handlers (generated — do not edit)
  │       ├── logic/          # Business logic (YOU write this)
  │       └── svc/            # ServiceContext (dependency injection root)
  └── rpc/                    # gRPC layer
      └── internal/logic/     # Business logic for RPC methods
  ```
- Treat generated files (`handler/`, router registration) as read-only — regenerate when the `.api` or `.proto` spec changes.

## 3. API & RPC Definition

- Define HTTP APIs in `.api` files (go-zero's DSL). Run `goctl api go --api ...` to regenerate handlers.
- Define RPC services in `.proto` files. Run `goctl rpc protoc --proto ...` to regenerate.
- Keep `.api` and `.proto` files as the **single source of truth** for the service contract. Review them carefully in code review.

## 4. Service Context & Dependency Injection

- Use the **`ServiceContext`** struct (`svc/servicecontext.go`) as the dependency injection root. Wire all shared dependencies here: DB connections, caches, downstream RPC clients, config.
- Pass `ServiceContext` to every `Logic` struct via the constructor. Never use global variables for dependencies.
- Use `goctl`-generated `main.go` as the entry point. Inject configuration from `config.yaml` using `conf.MustLoad()`.

## 5. Resilience & Observability

- go-zero provides **adaptive circuit breaking, rate limiting, timeout, and load shedding** by default. Configure them in `config.yaml` — never reimplement these mechanisms.
- Use go-zero's built-in `cache` (`core/stores/cache`) with Redis for single-flight cache-aside patterns to prevent cache stampedes.
- Expose Prometheus metrics via go-zero's built-in `/metrics` endpoint. Integrate with Grafana for SLO dashboards.
- Use `logx` for structured logging. Configure it with `logx.SetUp(logConf)` in `main.go`.
