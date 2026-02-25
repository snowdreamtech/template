# Kratos Microservices Framework Guidelines

> Objective: Define standards for building cloud-native Go microservices with Bilibili's Kratos framework.

## 1. Overview & When to Use

- **Kratos** is an opinionated microservices framework with a full-stack scaffold: HTTP/gRPC dual transport, service registration & discovery, OpenTelemetry tracing, Prometheus metrics, and structured configuration management.
- Use Kratos for services that need a **unified microservices scaffold** with strong conventions. It is especially well-suited for the Chinese cloud-native ecosystem (Nacos, etcd, Consul service discovery).
- Kratos enforces **Clean Architecture** — this is its primary design constraint. Embrace it; do not fight it.
- For simpler services or single-binary tools, prefer Gin/Echo/Chi over Kratos's full scaffold.

## 2. Project Structure (kratos-layout)

- Always start from the official `kratos-layout` template (`kratos new <service>`). Do not deviate from the standard layout without team alignment:

  ```text
  api/              # Protobuf definitions (.proto) + generated code
  cmd/              # Application entry points + wire_gen.go
  configs/          # YAML configuration files
  internal/
  ├── biz/          # Business logic (use cases, domain entities, domain errors)
  ├── data/         # Data access layer (repository implementations)
  ├── server/       # HTTP & gRPC server registration
  └── service/      # Service handlers (thin transport adapters)
  ```

- Enforce strict **layer boundaries**: `service` → calls → `biz` → defines interfaces → `data` implements them. Never let `data` depend on `biz`, and never let `biz` import `data` structs directly.
- Use **Google Wire** for dependency injection. Keep `wire.go` current. Run `wire gen ./...` after adding new providers.

## 3. Configuration & Secrets

- Use Kratos's `config` package with YAML files. Support **hot-reload** via `config.Watch()` for non-secret configuration values.
- Inject secrets via environment variables. Use `kratos/config/env` to merge environment variables into the configuration struct.
- Never hardcode environment-specific values (hostnames, ports, credentials) in YAML files committed to version control.
- Use a secrets manager (Vault, AWS Secrets Manager) for credentials. Fetch secrets at startup and inject them into the config struct.

## 4. Transport (HTTP & gRPC)

- Define all APIs in **Protobuf** (`.proto` files in `api/`). Use `buf generate` with `protoc-gen-go-http` and `protoc-gen-go-grpc` to regenerate code after any `.proto` change.
- Use `kratos proto add api/helloworld/v1/greeter.proto` and `kratos proto server/client` commands to scaffold boilerplate.
- Register servers in `cmd/server.go` using `kratos.New(kratos.Server(httpSrv, grpcSrv))`.
- Validate all incoming requests using `protoc-gen-validate` — define validation rules in the `.proto` files.

## 5. Observability & Error Handling

- Apply Kratos's built-in **middleware chain** on both HTTP and gRPC transports: `logging`, `recovery`, `tracing` (OpenTelemetry), `metrics` (Prometheus). Always apply `recovery` first.
- Integrate with service discovery (etcd, Nacos, Consul) via the `registry.Registrar` interface. Register the service on startup; deregister on graceful shutdown.
- Use `kratos/log` for structured logging. Wrap it with a performant backend: **`slog`**, **`zap`**, or **`zerolog`**. Inject the logger through Wire.
- Use `kratos/errors` to define domain error codes with gRPC status codes and HTTP status mappings: `errors.New(500, "USER_NOT_FOUND", "user not found")`. Return domain errors from `biz`, let the transport middleware map them to HTTP/gRPC status codes.
- Expose Prometheus metrics at `/metrics` via the HTTP server. Define SLO-relevant metrics: request latency histograms, error rate counters, dependency health gauges.
