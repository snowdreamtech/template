# API Design Guidelines

> Objective: Define standards for designing consistent, secure, versioned, and well-documented APIs (REST / OpenAPI), covering resource naming, HTTP semantics, request/response formats, versioning, security, and documentation.

## 1. REST Conventions

### Resource Naming

- Use **nouns** for resource paths — never verbs. URLs identify resources; HTTP methods describe the action:

  ```text
  ✅  GET    /users/{id}           — fetch a user
  ✅  POST   /orders               — create an order
  ✅  PATCH  /orders/{id}/cancel   — cancel (state transition via sub-resource)

  ❌  GET    /getUser/{id}
  ❌  POST   /cancelOrder/{id}
  ```

- Use **plural nouns** for collection resources: `/users`, `/orders`, `/products`.
- For sub-resources, use nested paths with a **maximum nesting depth of 2**: `/users/{id}/orders` — not `/users/{id}/orders/{orderId}/items/{itemId}`. Flatten deeply nested hierarchies with query parameters instead.
- Use **kebab-case** for multi-word path segments: `/order-items`, `/shipping-addresses` — not camelCase or snake_case in URLs.

### HTTP Method Semantics

| Method   | Semantics                                 | Idempotent | Safe |
| -------- | ----------------------------------------- | ---------- | ---- |
| `GET`    | Read a resource or collection             | ✅         | ✅   |
| `POST`   | Create a resource or trigger an action    | ❌         | ❌   |
| `PUT`    | Full resource replacement (all fields)    | ✅         | ❌   |
| `PATCH`  | Partial update (send only changed fields) | ✅\*       | ❌   |
| `DELETE` | Remove a resource                         | ✅         | ❌   |

- Use `PATCH` for partial updates. Use `PUT` for full document replacement (idempotent with same input).
- Support **idempotency keys** (`Idempotency-Key: <uuid>` request header) for `POST` endpoints that create resources or trigger payments. Store the key/response pair temporarily (e.g., 24 hours in Redis) to return the same response on retry:

  ```http
  POST /payments
  Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json

  { "orderId": "ord-123", "amount": 49.99 }
  ```

## 2. HTTP Status Codes

- Return semantically correct status codes consistently across all endpoints. Never return `200 OK` with an `"error": true` body:

  | Code                        | Meaning                 | When to use                                        |
  | --------------------------- | ----------------------- | -------------------------------------------------- |
  | `200 OK`                    | Success                 | `GET`, `PUT`, `PATCH` responses with body          |
  | `201 Created`               | Resource created        | `POST` → return `Location: /resource/{id}` header  |
  | `204 No Content`            | Success, no body        | `DELETE`, `PUT`/`PATCH` with no response body      |
  | `400 Bad Request`           | Malformed request       | Syntax error, invalid JSON, missing required field |
  | `401 Unauthorized`          | Not authenticated       | No token, expired token, invalid signature         |
  | `403 Forbidden`             | Not authorized          | Authenticated, but lacks permission                |
  | `404 Not Found`             | Resource not found      | ID doesn't exist                                   |
  | `409 Conflict`              | State conflict          | Duplicate resource, optimistic lock failure        |
  | `422 Unprocessable Entity`  | Business rule violation | Valid syntax, fails domain validation              |
  | `429 Too Many Requests`     | Rate limited            | Include `Retry-After: <seconds>`                   |
  | `500 Internal Server Error` | Unexpected error        | Server error; no internal details in response      |

## 3. Request & Response Format

### Request Design

- Use `application/json` for all request/response bodies. Set `Content-Type: application/json` and `Accept: application/json` headers explicitly.
- Follow a consistent field naming convention within a project:
  - **`camelCase`** — for TypeScript/JavaScript APIs (matches JS conventions)
  - **`snake_case`** — for Python APIs (matches Python conventions)
- Use **ISO 8601** (`2025-01-15T10:30:00Z`) for all datetime fields. Never use epoch milliseconds in public API responses — they are not human-readable in logs or documentation.

### Response Envelopes

- Wrap paginated list responses in a consistent envelope:
  ```json
  {
    "data": [{ "id": "1", "name": "Alice" }],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 20,
      "cursor": "eyJpZCI6IjIwIn0="
    }
  }
  ```
- Return structured machine-readable errors with human-readable messages and optional field-level details:
  ```json
  {
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Request validation failed",
      "details": [
        { "field": "email", "code": "INVALID_EMAIL", "message": "Must be a valid email address" },
        { "field": "role", "code": "INVALID_ENUM", "message": "Must be one of: admin, editor, viewer" }
      ]
    }
  }
  ```
- Use **`ETag`** response headers for cacheable resources. Support conditional requests (`If-None-Match`, `If-Match`) for cache validation and optimistic concurrency:

  ```http
  GET /users/123
  → ETag: "abc123hash"

  GET /users/123
  If-None-Match: "abc123hash"
  → 304 Not Modified (no body, saves bandwidth)

  PUT /users/123
  If-Match: "abc123hash"  (ensures no concurrent modification)
  → 200 OK (or 412 Precondition Failed if ETag changed)
  ```

## 4. Versioning & Compatibility

### URL Path Versioning

- Version all public APIs via the **URL path**: `/api/v1/users`, `/api/v2/products`. This approach is the most explicit, easy to route, and widely supported in API gateways and client code.
- Maintain backward compatibility within a version. What constitutes a **breaking change**:
  - ❌ Removing or renaming existing fields
  - ❌ Changing a field's data type
  - ❌ Adding a new required request field
  - ❌ Changing HTTP method or status codes for existing operations
  - ✅ Adding new optional response fields (non-breaking)
  - ✅ Adding new optional request parameters (non-breaking)
  - ✅ Adding new endpoints (non-breaking)

### Deprecation Policy

- Announce deprecated endpoints via response headers (RFC 8594 compliant) for at least 6 months before removal:
  ```http
  HTTP/1.1 200 OK
  Deprecation: true
  Sunset: Sat, 01 Jan 2026 00:00:00 GMT
  Link: <https://docs.example.com/v2/migration>; rel="successor-version"
  ```
- Publish a structured **changelog** with every API version release. Log usage of deprecated endpoints to identify active consumers before sunset.

## 5. Documentation, Security & Specification

### OpenAPI Specification

- Maintain an **OpenAPI 3.x** specification (`openapi.yaml`) for every API, committed to version control and reviewed in every PR that changes API behavior:

  ```yaml
  # openapi.yaml
  openapi: 3.1.0
  info:
    title: My API
    version: 1.0.0

  paths:
    /users/{id}:
      get:
        operationId: getUser
        summary: Get a user by ID
        parameters:
          - name: id
            in: path
            required: true
            schema: { type: string, format: uuid }
        responses:
          "200":
            content:
              application/json:
                schema: { $ref: "#/components/schemas/UserResponse" }
          "404":
            content:
              application/json:
                schema: { $ref: "#/components/schemas/ErrorResponse" }
  ```

- Use the spec as the **single source of truth** for:
  - Generating client SDKs (`openapi-generator`, `kiota`)
  - Generating server stubs for type-safe handler signatures
  - Driving contract tests (`dredd`, `schemathesis`)

### Security

- Implement **rate limiting** on all endpoints (lower limits on auth endpoints like `/login`, `/register`, `/forgot-password`). Return `429 Too Many Requests` with `Retry-After` header when limits are exceeded.
- Require authentication on all non-public endpoints. Use standard OAuth 2.0 Bearer tokens:
  ```http
  Authorization: Bearer <access_token>
  ```
  Never pass tokens in query parameters — they appear in server logs, browser history, and proxy logs.
- Require **HTTPS exclusively** in production. Reject plain HTTP connections at the load balancer level. Enable HTTP Strict Transport Security (HSTS):
  ```http
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  ```
- Implement **CORS** controls explicitly. Define allowed origins, methods, and headers. Never use wildcard `Access-Control-Allow-Origin: *` for authenticated APIs.
- Set `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` on all API responses to prevent content-type sniffing and clickjacking.
