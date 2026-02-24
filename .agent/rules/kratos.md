# Kratos Microservices Framework Guidelines

> Objective: Define standards for building cloud-native Go microservices with Bilibili's Kratos framework.

## 1. Overview & When to Use

- **Kratos** is an opinionated microservices framework from Bilibili with a full-stack scaffold: HTTP/gRPC transport, service registration & discovery, OpenTelemetry tracing, Prometheus metrics, and configuration management.
- Use Kratos for services that need a **unified microservices scaffold** with strong conventions. It is especially well-suited for the Chinese cloud-native ecosystem (Nacos, etcd, Consul service discovery).
- Kratos enforces **Clean Architecture** — this is its primary design constraint.

## 2. Project Structure (kratos-layout)

- Always start from the official `kratos-layout` template (`kratos new <service>`):
  ```
  api/              # Protobuf definitions (.proto) and generated code
  cmd/              # Application entry points (wire DI injection)
  configs/          # YAML configuration files
  internal/
  ├── biz/          # Business logic (use cases, domain entities)
  ├── data/         # Data access layer (repository implementations)
  ├── server/       # HTTP & gRPC server registration
  └── service/      # Service handlers (thin transport adapters)
  ```
- Enforce layer boundaries: `service` → calls → `biz` → defines interfaces → `data` implements them. Never let `data` depend on `biz`, and never let `biz` depend on `data` structs directly.

## 3. Configuration

- Use Kratos's `config` package with YAML files. Support **hot-reload** via `config.Watch()` for non-secret configuration.
- Inject secrets via environment variables. Use `kratos/config/env` to merge environment variables into the configuration.
- Never hardcode environment-specific values in config files committed to version control.

## 4. Transport (HTTP & gRPC)

- Define all APIs in **Protobuf** (`.proto` files in `api/`). Use `kratos proto add` and `kratos proto client/server` commands to regenerate code.
- Generate both HTTP and gRPC server code using `protoc-gen-go-http` and `protoc-gen-go-grpc` via the `buf generate` workflow.
- Register servers in `cmd/wire.go` using Wire DI: `kratos.New(kratos.Server(httpSrv, grpcSrv))`.

## 5. Observability & Middleware

- Apply Kratos's built-in **middleware chain** on both HTTP and gRPC transports: logging, recovery, tracing (OpenTelemetry), metrics.
- Integrate with service discovery (etcd, Nacos, Consul) via the `registry.Registrar` interface.
- Use `kratos/log` for structured logging. Wrap it with a performant backend: **slog**, **zap**, or **zerolog**.
- Use `kratos/errors` to define domain error codes with gRPC status codes and HTTP mappings: `errors.New(500, "USER_NOT_FOUND", "user not found")`.
