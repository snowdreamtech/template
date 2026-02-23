# FastAPI Development Guidelines

> Objective: Define standards for building type-safe, performant, and maintainable Python APIs with FastAPI.

## 1. Project Structure

- Organize code by feature/domain: `app/users/`, `app/orders/`. Each domain directory has its own `router.py`, `schemas.py`, `service.py`, and `models.py`.
- Register all routers in `app/main.py` using `app.include_router()`.

## 2. Type Safety & Schemas

- Define all request bodies, responses, and query parameters using **Pydantic v2** models.
- Use `response_model=` on every endpoint to control the API's output schema and automatically filter sensitive fields.
- Leverage Python type hints everywhere. FastAPI uses them for validation, serialization, and automatic OpenAPI doc generation.
- Use `Annotated` with `Query(...)`, `Body(...)`, or `Path(...)` for rich parameter metadata and validation.

## 3. Async & Performance

- Use `async def` for all path operation functions that perform I/O (database queries, HTTP calls).
- Use an **async database library** (e.g., `SQLAlchemy` with `asyncpg`, or `Tortoise ORM`) — do not use synchronous drivers in async endpoints.
- Use **dependency injection** (`Depends()`) for database sessions, authentication, and shared services.

## 4. Error Handling

- Raise `HTTPException` for expected, client-facing errors (400, 404, 422).
- Use an `@app.exception_handler()` for global error formatting to return consistent error response shapes.
- Log unexpected server errors with traceback context before returning a 500 response.

## 5. Security & Testing

- Use **OAuth2PasswordBearer** or **APIKeyHeader** (via `fastapi.security`) for authentication. Never implement auth manually.
- Use `pytest` with **`httpx.AsyncClient`** and `app` in tests. Use pytest fixtures for database setup/teardown.
- Run `uvicorn` with `--reload` for development only — use `gunicorn` + `uvicorn` workers in production.
