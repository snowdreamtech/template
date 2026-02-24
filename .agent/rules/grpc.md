# gRPC & Protocol Buffers Guidelines

> Objective: Define standards for designing, implementing, and versioning gRPC services and Protobuf schemas.

## 1. Protobuf Schema Design

- Use **`proto3`** syntax for all new schemas.
- Follow [Google API Design Guide](https://cloud.google.com/apis/design) naming conventions: `snake_case` for field names, `PascalCase` for message and service names, `SCREAMING_SNAKE_CASE` for enum values.
- Add doc comments (`//`) to **all** messages, fields, services, and RPCs. The `.proto` file is the source of truth for the API contract.
- **Never reuse a field number** once a field has been deployed — it causes deserialization conflicts. Remove old fields by marking them `reserved`:
  ```proto
  reserved 4, 5;
  reserved "old_field_name";
  ```

## 2. Service & RPC Design

- Choose the right RPC type for the use case:
  - **Unary**: Single request, single response (most common, equivalent to REST).
  - **Server-side streaming**: Single request, stream of responses (e.g., live updates, large datasets).
  - **Client-side streaming**: Stream of requests, single response (e.g., chunked file upload).
  - **Bidirectional streaming**: Concurrent streams (e.g., real-time chat, collaborative editing).
- Design RPCs as **resource-oriented** where possible: `GetUser`, `ListOrders`, `CreateProduct`, `DeleteSession`.
- Follow the principle of **request-response symmetry**: include a request ID in every request message and echo it back in the response for correlation.

## 3. Error Handling

- Use standard **gRPC status codes** semantically: `NOT_FOUND`, `INVALID_ARGUMENT`, `PERMISSION_DENIED`, `UNAUTHENTICATED`, `UNAVAILABLE`, `RESOURCE_EXHAUSTED` (rate limit).
- Use **`google.rpc.Status`** with **error details** (`google/rpc/error_details.proto`) for structured, machine-readable error payloads: `BadRequest.FieldViolation`, `RetryInfo`, `ErrorInfo`.
- Implement **deadline propagation**: always set deadlines on client calls and propagate the context deadline to downstream calls.

## 4. Versioning & Compatibility

- Maintain **backward compatibility** within a major version. Additions only — never remove or rename fields, never change field types in a shipped schema.
- Version your API packages: `package myservice.v1;`. Create a new package (`myservice.v2`) for breaking changes.
- Use **`buf`** for schema management: `buf lint` for style, `buf breaking --against .git#branch=main` for breaking change detection in CI.
- Generate code with `buf generate` and commit `.proto` files. Do not commit generated code to the main repository.

## 5. Security & Observability

- Always use **TLS** for all gRPC connections in production. Use mutual TLS (mTLS) for service-to-service communication.
- Implement **authentication and authorization** via gRPC interceptors. Use metadata tokens (JWT) or client certificates. Define auth interceptors at the server level, not inline in each handler.
- Add **OpenTelemetry instrumentation** for all gRPC clients and servers to get automatic traces, metrics (request rate, latency, error rate), and trace context propagation.
- Use **gRPC health checking protocol** (`grpc.health.v1`) for Kubernetes liveness and readiness probes.
