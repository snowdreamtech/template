# API Design Guidelines

> Objective: Define standards for designing consistent, secure, versioned, and well-documented APIs (REST / OpenAPI).

## 1. REST Conventions

- Use **nouns** for resource paths, not verbs: `/users/{id}` not `/getUser`, `/orders/{id}/cancel` not `/cancelOrder`.
- Use **plural nouns** for collection resources: `/orders`, `/products`, `/users`.
- Use HTTP methods **semantically**: `GET` (read, idempotent), `POST` (create), `PUT` (full replacement), `PATCH` (partial update), `DELETE` (remove).
- Use `PATCH` for partial updates (send only modified fields). Use `PUT` for full resource replacement (idempotent).
- For sub-resources, use nested paths with a maximum nesting depth of 2: `/users/{id}/orders` — not `/users/{id}/orders/{orderId}/items/{itemId}`.
- Support **idempotency keys** (`Idempotency-Key: <uuid>` header) for `POST` endpoints that create resources or trigger payments, so clients can safely retry on network failures without duplicating work.

## 2. HTTP Status Codes

- Return semantically correct status codes:
  - `200 OK`: Successful read (`GET`, `PUT`, `PATCH`).
  - `201 Created`: Resource successfully created (`POST`). Include `Location` header with the URL of the new resource.
  - `204 No Content`: Successful deletion (`DELETE`) or update with no response body.
  - `400 Bad Request`: Client validation error. Include structured error details.
  - `401 Unauthorized`: Authentication required or token invalid.
  - `403 Forbidden`: Authenticated but not authorized to perform this action.
  - `404 Not Found`: Resource does not exist.
  - `409 Conflict`: State conflict (e.g., duplicate resource, optimistic locking failure).
  - `422 Unprocessable Entity`: Input is syntactically valid but fails business rule validation.
  - `429 Too Many Requests`: Rate limit exceeded. Include `Retry-After` header.
  - `500 Internal Server Error`: Unexpected server error. Never return `200 OK` with an error payload.

## 3. Request & Response Format

- Use `application/json` for all request and response bodies. Set `Content-Type` and `Accept` headers explicitly.
- Use **camelCase** for JSON field names in JS/TS projects; **snake_case** for Python projects. Be consistent within a project.
- Wrap paginated list responses in an envelope: `{ "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "cursor": "..." } }`.
- For errors, return a machine-readable code and human-readable message: `{ "error": { "code": "USER_NOT_FOUND", "message": "...", "field": "userId" } }`.
- Use ISO 8601 (`2024-01-15T10:30:00Z`) for all datetime fields. Never use epoch milliseconds in public APIs.
- Use **`ETag`** response headers and support **conditional requests** (`If-None-Match`, `If-Match`) for cache validation and optimistic concurrency control. Return `304 Not Modified` for unchanged cached resources.

## 4. Versioning & Compatibility

- Version all public APIs via the URL path: `/api/v1/users`. This is the most explicit and widely supported approach.
- Never introduce **breaking changes** to an existing version:
  - Removing or renaming fields = breaking.
  - Adding a new required field = breaking.
  - Adding optional fields = non-breaking.
- Maintain a **deprecation policy**: announce deprecated endpoints in response headers (`Deprecation: true`, `Sunset: Sat, 1 Jan 2026 00:00:00 GMT`) at least 6 months before removal.
- Publish a structured **changelog** with every API version release.

## 5. Documentation, Security & Specification

- Maintain an **OpenAPI 3.x** (`openapi.yaml`) specification for every API, committed to version control and reviewed on every change.
- Use the spec as the source of truth for generating client SDKs (`openapi-generator`), server stubs, and integration tests.
- Implement **rate limiting** on all endpoints (especially auth). Return `429` with `Retry-After` when limits are exceeded.
- Require authentication on all non-public endpoints. Use standard token schemes (OAuth 2.0 Bearer tokens, API keys via header — never in query parameters).
- Use **HTTPS exclusively** in production. Reject plain HTTP connections. Enable HTTP Strict Transport Security (HSTS).
