# gRPC & Protocol Buffers Guidelines

> Objective: Define standards for designing, implementing, and versioning gRPC services and Protobuf schemas.

## 1. Protobuf Schema Design

- Use **`proto3`** syntax for all new schemas.
- Follow the [Google API Design Guide](https://cloud.google.com/apis/design) naming conventions: `snake_case` for field names, `PascalCase` for message and service names.
- Use descriptive field names. Never reuse a field number once a field has been deployed — only add new fields or mark old ones as `reserved`.
- Add comments (`//`) to all messages, fields, services, and RPCs to document their purpose.

## 2. Service & RPC Design

- Choose the right RPC type for the use case:
  - **Unary**: Single request, single response (most common, like REST).
  - **Server-side streaming**: Single request, stream of responses (e.g., live updates).
  - **Client-side streaming**: Stream of requests, single response (e.g., file upload).
  - **Bidirectional streaming**: Stream of requests and responses (e.g., chat).
- Design RPCs as **resource-oriented** where possible, mirroring REST conventions (e.g., `GetUser`, `ListOrders`, `CreateProduct`).

## 3. Error Handling

- Use the standard **gRPC status codes** semantically: `NOT_FOUND`, `INVALID_ARGUMENT`, `PERMISSION_DENIED`, `UNAUTHENTICATED`, etc.
- Use **Google's `google.rpc.Status`** and **error details** (`google/rpc/error_details.proto`) to provide structured, machine-readable error information to clients.

## 4. Versioning & Compatibility

- Maintain **backward compatibility** within a major version. Only add fields; never remove or rename them in a shipped version.
- Version your API packages: `package myservice.v1;`.
- Use a **buf.build** workflow (`buf lint`, `buf breaking`) in CI to enforce schema style and detect breaking changes automatically.

## 5. Security

- Always use **TLS** for all gRPC connections in production. Never use insecure channels for production traffic.
- Implement authentication via **gRPC interceptors** (metadata tokens, mTLS).
