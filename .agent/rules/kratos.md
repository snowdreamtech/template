# Kratos Microservices Framework Guidelines

> Objective: Define standards for building cloud-native Go microservices with Bilibili's Kratos framework.

## 1. Overview

- **Kratos** is an opinionated microservices framework from Bilibili, designed for production-scale services. It provides a full stack: HTTP/gRPC transport, service registration, tracing, metrics, and configuration management.
- Use Kratos for services that need a unified microservices scaffold. It is especially popular in the Chinese cloud-native community.

## 2. Project Structure (kratos-layout)

- Always start from the official `kratos-layout` template:
  ```
  api/          # Protobuf definitions and generated code
  cmd/          # Application entry points (wire injection)
  configs/      # YAML config files
  internal/
  ├── biz/      # Business logic (use cases)
  ├── data/     # Data access (repo implementations)
  ├── server/   # HTTP & gRPC server setup
  └── service/  # gRPC/HTTP service implementations (thin layer)
  ```
- Follow the **Clean Architecture** layer boundaries: `service` calls `biz`, `biz` defines interfaces, `data` implements them.

## 3. Configuration

- Use Kratos's `config` package with YAML files. Support hot-reload via `config.Watch()` for non-secret config.
- Inject secrets via environment variables, not config files. Use `kratos/config/env` to merge env vars into the config.

## 4. Transport (HTTP & gRPC)

- Define all APIs in **Protobuf** (`.proto` files in `api/`). Generate both HTTP and gRPC server code with `protoc-gen-go-http` and `protoc-gen-go-grpc`.
- Register both HTTP and gRPC servers in `cmd/server.go` using `kratos.New(kratos.Server(httpSrv, grpcSrv))`.

## 5. Observability & Middleware

- Use Kratos's built-in middleware chain for logging, tracing (OpenTelemetry), metrics, and recovery on both HTTP and gRPC transports.
- Integrate with service discovery (e.g., etcd, Consul, Nacos) via the `registry` interface.
- Use `kratos/log` for structured logging. Wrap it with your chosen backend (zap, slog).
