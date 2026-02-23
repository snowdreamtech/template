# go-zero Microservices Framework Guidelines

> Objective: Define standards for building high-concurrency Go microservices with go-zero.

## 1. Overview

- **go-zero** is a cloud-native microservices framework from Good Lord (好未来/tal-tech) with built-in code generation (`goctl`), API gateway, service discovery, and adaptive circuit-breaking. It is widely adopted for high-concurrency production systems.
- The core philosophy: **generate boilerplate, focus on business logic**. Use `goctl` for all scaffolding — do not write repetitive transport code by hand.

## 2. Project Structure (goctl generated)

- Use `goctl api new` and `goctl rpc new` to scaffold services. The generated layout:
  ```
  service/
  ├── api/              # HTTP API gateway definition (.api files)
  │   ├── internal/
  │   │   ├── config/   # Config struct
  │   │   ├── handler/  # HTTP handlers (generated, thin)
  │   │   ├── logic/    # Business logic (YOU write this)
  │   │   └── svc/      # Service context (dependency injection)
  ├── rpc/              # gRPC service (.proto + generated code)
  │   └── internal/logic/  # Business logic
  ```

## 3. API Definition

- Define HTTP APIs in `.api` files (go-zero's DSL). Run `goctl api go` to regenerate handlers when the API spec changes.
- Define RPC services in `.proto` files. Run `goctl rpc protoc` to regenerate.
- Keep `.api` and `.proto` files as the contract — treat generated code as read-only.

## 4. Service Context & Dependency Injection

- Use the **`ServiceContext`** struct (`svc/servicecontext.go`) to hold all shared dependencies (DB connections, RPCs, caches, config). Pass it to every `Logic` struct via constructor.

## 5. Built-in Resilience Features

- go-zero includes **adaptive circuit breaking**, **rate limiting**, **timeout**, and **load shedding** by default. Configure them in `config.yaml` — do not implement these from scratch.
- Use go-zero's built-in **cache** (`core/stores/cache`) with Redis for consistent, single-flight cache patterns.
- Monitor services with go-zero's built-in Prometheus metrics endpoint and integrate with Grafana.
