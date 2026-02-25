# gRPC & Protocol Buffers Guidelines

> Objective: Define standards for designing, implementing, and versioning gRPC services and Protobuf schemas.

## 1. Protobuf Schema Design

- Use **`proto3`** syntax for all new schemas.
- Follow [Google API Design Guide](https://cloud.google.com/apis/design) naming conventions: `snake_case` for field names, `PascalCase` for message and service names, `SCREAMING_SNAKE_CASE` for enum values.
- Add doc comments (`//`) to **all** messages, fields, services, and RPCs. The `.proto` file is the source of truth for the API contract and primary documentation.
- **Never reuse a field number** once a field has been deployed — it causes wire format conflicts and deserialization bugs. Remove old fields by marking them `reserved`:

  ```proto
  reserved 4, 5;
  reserved "old_field_name";
  ```

- Use `google.protobuf.Timestamp` for all timestamp fields instead of raw `int64` UNIX epochs. It is timezone-agnostic and tooling-friendly.
- Use `optional` keyword in proto3 for fields that need to distinguish between "not set" and zero/false/empty.

## 2. Service & RPC Design

- Choose the right RPC type for the use case:
  - **Unary**: Single request, single response (most common — equivalent to REST).
  - **Server-side streaming**: Single request, stream of responses (e.g., live updates, large result sets).
  - **Client-side streaming**: Stream of requests, single response (e.g., chunked uploads, batch writes).
  - **Bidirectional streaming**: Concurrent streams (e.g., real-time chat, collaborative editing).
- Design RPCs as **resource-oriented** where possible: `GetUser`, `ListOrders`, `CreateProduct`, `DeleteSession`. Follow the Google AIP (API Improvement Proposals) patterns.
- Include a **request ID** in every request message and echo it back in the response for distributed tracing correlation.
- Apply **pagination** for list RPCs: use `page_token` + `page_size` + `next_page_token` (Google AIP-158 pattern) for cursor-based pagination.

## 3. Error Handling

- Use standard **gRPC status codes** semantically: `NOT_FOUND`, `INVALID_ARGUMENT`, `PERMISSION_DENIED`, `UNAUTHENTICATED`, `UNAVAILABLE`, `RESOURCE_EXHAUSTED` (rate limit).
- Use **`google.rpc.Status`** with error details (`google/rpc/error_details.proto`) for machine-readable error payloads: `BadRequest.FieldViolation`, `RetryInfo`, `ErrorInfo`.
- Implement **deadline propagation**: always set deadlines on outbound client calls and propagate the incoming context deadline to downstream calls.
- Use `RESOURCE_EXHAUSTED` with `RetryInfo.retry_delay` for rate-limited callers to know when to retry.

## 4. Versioning & Compatibility

- Maintain **backward compatibility** within a major version. Additions only — never remove, rename, or change field types in a shipped schema.
- Version your API packages: `package myservice.v1;`. Create a new package (`myservice.v2`) for breaking changes.
- Use **`buf`** for schema management: `buf lint` for style enforcement, `buf breaking --against .git#branch=main` for breaking change detection in CI.
- Generate code with `buf generate` and commit `.proto` files to version control. Do not commit generated code to the main repository — generate in CI.

## 5. Security & Observability

- Always use **TLS** for all gRPC connections in production. Use mutual TLS (mTLS) for service-to-service communication within a zero-trust network.
- Implement **authentication and authorization** via gRPC interceptors/middleware. Use metadata tokens (JWT) or client certificates. Define auth interceptors at the server level.
- Add **OpenTelemetry instrumentation** for all gRPC clients and servers to get automatic traces, metrics (request rate, latency, error rate), and trace context propagation via metadata.
- Use **gRPC health checking protocol** (`grpc.health.v1`) for Kubernetes liveness and readiness probes.
