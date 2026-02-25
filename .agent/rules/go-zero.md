# go-zero Microservices Framework Guidelines

> Objective: Define standards for building high-concurrency Go microservices with go-zero.

## 1. Overview & Philosophy

- **go-zero** is a cloud-native microservices framework with built-in code generation (`goctl`), API gateway integration, service discovery, adaptive circuit-breaking, rate limiting, and load shedding. It is designed for high-concurrency production systems.
- Core philosophy: **generate boilerplate, focus on business logic.** Use `goctl` for all service scaffolding. Do not write repetitive transport, routing, or middleware plumbing by hand.
- Pin the `goctl` version (e.g., via `go install` with a specific version or CI tooling). Mismatched `goctl` and `go-zero` library versions can cause generation incompatibilities.
- Use `goctl env check --install` to verify the environment and install required dependencies (protoc, etc.) in a single step.

## 2. Project Structure (goctl Generated)

- Use `goctl api new` for HTTP API services and `goctl rpc new` for gRPC services. Do not deviate from the generated layout without strong justification:

  ```text
  service/
  ├── api/                    # HTTP API layer
  │   └── internal/
  │       ├── config/         # Config struct (YAML deserialization)
  │       ├── handler/        # HTTP handlers (generated — do not edit)
  │       ├── logic/          # Business logic (YOU write this)
  │       ├── middleware/     # Custom HTTP middleware
  │       └── svc/            # ServiceContext (dependency injection root)
  └── rpc/                    # gRPC layer
      └── internal/logic/     # Business logic for RPC methods
  ```

- Treat generated files (`handler/`, router registration) as read-only. Regenerate them when the `.api` or `.proto` spec changes using `goctl`.

## 3. API & RPC Definition

- Define HTTP APIs in `.api` files (go-zero's lightweight DSL). Run `goctl api go --api service.api --dir .` to regenerate handlers and routing.
- Define RPC services in `.proto` files (standard Protobuf). Run `goctl rpc protoc service.proto --go_out=. --go-grpc_out=. --zrpc_out=.` to regenerate gRPC code.
- Keep `.api` and `.proto` files as the **single source of truth** for the service contract. Review them carefully in code review — changes here ripple broadly.
- Apply `goctl` validation rules in CI: use `goctl api validate --api service.api` before generation.

## 4. Service Context & Dependency Injection

- Use the **`ServiceContext`** struct (`svc/servicecontext.go`) as the dependency injection root. Initialize all shared dependencies here: DB connections, caches, Redis clients, downstream RPC clients, config.
- Pass `ServiceContext` to every `Logic` struct via the constructor: `NewUserLogic(ctx, svcCtx)`. Never use global variables for dependencies.
- Use `goctl`-generated `main.go` as the entry point. Inject configuration from `config.yaml` using `conf.MustLoad()`.
- Use context propagation (`context.Context`) consistently — pass it to all DB, cache, and RPC calls for timeout and cancellation support.

## 5. Resilience & Observability

- go-zero provides **adaptive circuit breaking, rate limiting, timeout, and load shedding** by default in the middleware chain. Configure thresholds in `config.yaml`. Never reimplement these mechanisms.
- Use go-zero's `core/stores/cache` with Redis for single-flight cache-aside patterns. This prevents cache stampedes automatically.
- Expose Prometheus metrics using go-zero's built-in support. Integrate with Grafana for SLO dashboards (latency P99, error rate, QPS).
- Use `logx` for structured logging. Configure it in `main.go` with `logx.SetUp(c.Log)`. Use `logx.WithContext(ctx)` in logic handlers to propagate trace IDs.
- Integrate with OpenTelemetry for distributed tracing. Use `otlp` exporter to export traces to Jaeger, Tempo, or a cloud tracing backend.
