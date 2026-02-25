# gRPC & Protocol Buffers Guidelines

> Objective: Define standards for designing, implementing, versioning, securing, and testing gRPC services and Protobuf schemas across polyglot service environments.

## 1. Protobuf Schema Design

- Use **`proto3`** syntax for all new schemas. Place `.proto` files in a dedicated repository or structured directory (`proto/`) that is the single source of truth for all service contracts.
- Follow [Google API Improvement Proposals (AIP)](https://aip.dev) naming conventions:
  - `snake_case` for field names: `user_id`, `created_at`
  - `PascalCase` for message and service names: `GetUserRequest`, `UserService`
  - `SCREAMING_SNAKE_CASE` for enum values: `ORDER_STATUS_PENDING`
  - `snake_case` for package names: `mycompany.users.v1`
- Add documentation comments (`//`) to **all** messages, fields, services, and RPC methods. The `.proto` file is the API contract and primary documentation — treat it as public API documentation:
  ```proto
  // GetUser retrieves a single user by their unique identifier.
  // Returns NOT_FOUND if the user does not exist.
  rpc GetUser(GetUserRequest) returns (User) {
    option (google.api.http) = {
      get: "/v1/users/{user_id}"
    };
  }
  ```
- **Never reuse a field number** once a field has been deployed. Field numbers are the wire format — reuse causes deserialization bugs across versions. Remove fields by marking them `reserved`:

  ```proto
  message User {
    reserved 4, 5, 8;           // previously used field numbers
    reserved "phone", "fax";   // previously used field names

    int64 id = 1;
    string email = 2;
    string name = 3;
  }
  ```

- Use `google.protobuf.Timestamp` for timestamps. Never use raw `int64` UNIX epoch fields — `Timestamp` is timezone-agnostic and supported by all protobuf tooling.
- Use the `optional` keyword (proto3 field presence) for fields where you need to distinguish between "not set" and the zero value (false, 0, ""):
  ```proto
  message UpdateUserRequest {
    int64 user_id = 1;
    optional string name = 2;   // only update if set
    optional string bio = 3;    // only update if set
  }
  ```
- Design request and response messages as **dedicated types** — never reuse domain entity messages directly as request/response types. This decouples API evolution from data model evolution.

## 2. Service & RPC Design

- Choose the right **RPC streaming type**:
  | Type | When to use | Example |
  |---|---|---|
  | **Unary** | Single req, single resp (most common) | `GetUser`, `CreateOrder` |
  | **Server-side streaming** | Single req, multiple resp over time | Live price feeds, large result sets |
  | **Client-side streaming** | Multiple req, single resp | File upload, batch inserts |
  | **Bidirectional streaming** | Concurrent streams | Real-time chat, collaborative editing |
- Design RPCs in a **resource-oriented** style following AIP patterns: `GetUser`, `ListUsers`, `CreateUser`, `UpdateUser`, `DeleteUser`, `BatchGetUsers`.
- Apply **pagination** for all list RPCs. Use Google AIP-158's token-based pagination:

  ```proto
  message ListUsersRequest {
    int32 page_size = 1;       // max 1000, default 100
    string page_token = 2;     // opaque token from previous response
    string filter = 3;         // AIP-160 filter expression, optional
    string order_by = 4;       // AIP-132 order by, optional
  }

  message ListUsersResponse {
    repeated User users = 1;
    string next_page_token = 2;  // empty string = no more pages
    int32 total_size = 3;        // optional, may be approximate
  }
  ```

- Include a **request ID** (`string request_id = X;`) in all requests for distributed trace correlation and idempotent retry support. Echo it back in the response.
- Use `google.protobuf.FieldMask` for partial update RPCs (`UpdateUser`) to explicitly specify which fields to modify — avoids unintended overwrites:
  ```proto
  message UpdateUserRequest {
    User user = 1;
    google.protobuf.FieldMask update_mask = 2;  // e.g., paths: ["name", "bio"]
  }
  ```

## 3. Error Handling

- Use **standard gRPC status codes** semantically (not based on HTTP mappings):
  | Code | Meaning | Example use case |
  |---|---|---|
  | `OK` | Success | — |
  | `NOT_FOUND` | Resource absent | User ID not found |
  | `INVALID_ARGUMENT` | Bad request input | Invalid email format |
  | `ALREADY_EXISTS` | Duplicate creation | Email already taken |
  | `PERMISSION_DENIED` | Authorized but not allowed | User can't delete other's post |
  | `UNAUTHENTICATED` | No valid credentials | Missing or invalid token |
  | `RESOURCE_EXHAUSTED` | Rate limit or quota exceeded | 429 equivalent |
  | `INTERNAL` | Unexpected server error | Bug, DB failure |
  | `UNAVAILABLE` | Service temporarily down | DB unreachable, overloaded |
- Use **`google.rpc.Status` with error details** for machine-readable error payloads that clients can handle programmatically:
  ```protobuf
  // In the response status details for INVALID_ARGUMENT:
  Status {
    code: 3  // INVALID_ARGUMENT
    message: "Validation failed"
    details {
      [type.googleapis.com/google.rpc.BadRequest] {
        field_violations {
          field: "email"
          description: "must be a valid email address"
        }
      }
    }
  }
  ```
- Implement **deadline propagation**. Always forward the incoming context deadline to downstream RPC calls. Never create context-less background contexts inside a handler:
  ```go
  // Go: propagate context (and its deadline) to downstream calls
  downstreamResp, err := s.userServiceClient.GetUser(ctx, &pb.GetUserRequest{UserId: req.UserId})
  ```
- Use `RESOURCE_EXHAUSTED` with `RetryInfo.retry_delay` so rate-limited clients know **exactly** when to retry.

## 4. Versioning, Compatibility & Tooling

### Compatibility Rules

- Maintain **backward compatibility** within a major API version. These changes are safe (backward compatible):
  - Adding new fields to messages
  - Adding new services or RPCs
  - Adding new enum values
- These changes are **NOT backward compatible** (require a new major version):
  - Removing or renaming fields, services, or RPCs
  - Changing field types
  - Reusing field numbers
- Version API packages: `package mycompany.users.v1;`. Create `mycompany.users.v2` for breaking changes.

### `buf` Tooling

- Use **`buf`** for all Protobuf schema management in CI:
  ```bash
  buf lint                                          # style and compatibility lint
  buf breaking --against .git#branch=main           # detect breaking changes vs main branch
  buf generate                                      # generate code from buf.gen.yaml
  buf build                                         # validate .proto files compile
  ```
- Commit a `buf.yaml` (schema definition) and `buf.gen.yaml` (code generation config) to the repository. Generate code in CI — do not commit generated stubs to the main branch (use a separate generated-code branch or publish to an artifact registry).
- Run `buf breaking` as a **mandatory CI check** on all PRs. Block merges that introduce breaking changes to published schemas.

## 5. Security, Testing & Observability

### Security

- Always use **TLS** for all gRPC connections in production. Use **mTLS (mutual TLS)** for service-to-service communication in a zero-trust/service-mesh (Istio, Linkerd) environment.
- Implement **authentication** via gRPC interceptors (unary and streaming). Use JWT bearer tokens in gRPC metadata:
  ```go
  // Go server interceptor
  func AuthInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    md, _ := metadata.FromIncomingContext(ctx)
    tokens := md.Get("authorization")
    if len(tokens) == 0 {
      return nil, status.Error(codes.Unauthenticated, "missing token")
    }
    // validate token...
    return handler(ctx, req)
  }
  ```
- Apply **rate limiting** at the interceptor level using `RESOURCE_EXHAUSTED` status when limits are exceeded.

### Testing

- Use the generated in-process test server and client (not a network connection) for unit and integration tests:

  ```go
  // Go: in-process test server
  server := grpc.NewServer()
  pb.RegisterUserServiceServer(server, &UserServiceImpl{...})

  conn, _ := grpc.Dial("bufnet", grpc.WithContextDialer(bufDialer), grpc.WithInsecure())
  client := pb.NewUserServiceClient(conn)
  resp, err := client.GetUser(ctx, &pb.GetUserRequest{UserId: 1})
  ```

- Test error paths explicitly: verify that services return the expected status codes for invalid input, missing resources, and authentication failures.
- Mock external dependencies (downstream gRPC services) using the generated interfaces. Do not make real network calls in unit tests.

### Observability

- Add **OpenTelemetry** instrumentation via interceptors for all gRPC clients and servers. Use `go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc` (Go) or language-specific equivalent:
  ```go
  server := grpc.NewServer(
    grpc.UnaryInterceptor(otelgrpc.UnaryServerInterceptor()),
    grpc.StreamInterceptor(otelgrpc.StreamServerInterceptor()),
  )
  ```
- This automatically creates spans for every RPC, propagates trace context via gRPC metadata, and logs request duration, status, and error info.
- Implement the **gRPC Health Checking Protocol** (`grpc.health.v1`) for Kubernetes liveness and readiness probes:
  ```go
  import "google.golang.org/grpc/health/grpc_health_v1"
  grpc_health_v1.RegisterHealthServer(server, health.NewServer())
  ```
- Expose **Prometheus metrics** via gRPC server interceptors: request rate, error rate, latency percentiles (p50/p95/p99) per service and method. Use `github.com/grpc-ecosystem/go-grpc-prometheus`.
