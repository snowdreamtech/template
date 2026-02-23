# API Design Guidelines

> Objective: Define standards for designing consistent, secure, and versioned APIs (REST / OpenAPI).

## 1. REST Conventions

- Use **nouns** for resource paths, not verbs: `/users/{id}` not `/getUser`.
- Use plural nouns for collections: `/orders`, `/products`.
- Use standard HTTP methods semantically: `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (delete).
- Use `PATCH` for partial updates and `PUT` for full resource replacement.

## 2. HTTP Status Codes

- Return semantically correct status codes:
  - `200 OK`, `201 Created`, `204 No Content` for successes.
  - `400 Bad Request` for client validation errors; `401 Unauthorized`; `403 Forbidden`; `404 Not Found`; `409 Conflict`.
  - `500 Internal Server Error` for unexpected server errors.
- Never return `200 OK` with an error payload.

## 3. Request & Response Format

- Use `application/json` for all request and response bodies.
- Use **camelCase** for JSON field names in JavaScript/TypeScript projects; **snake_case** for Python projects — be consistent.
- Wrap list responses in a pagination envelope: `{ "data": [...], "total": 100, "page": 1, "pageSize": 20 }`.
- Include a machine-readable `code` and human-readable `message` in error responses: `{ "code": "USER_NOT_FOUND", "message": "..." }`.

## 4. Versioning

- Version all APIs, preferably via the URL path: `/api/v1/users`.
- Never introduce breaking changes to an existing version. Add a new version instead.

## 5. Documentation & Specification

- Maintain an **OpenAPI 3.x** (`openapi.yaml`) specification for every API, committed to version control.
- Use the spec to generate client SDKs and server stubs via tools like `openapi-generator`.
- Document all endpoints with descriptions, request schemas, and example responses in the spec.
