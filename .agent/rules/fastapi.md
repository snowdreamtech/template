# FastAPI Development Guidelines

> Objective: Define standards for building type-safe, performant, and maintainable Python APIs with FastAPI.

## 1. Project Structure

- Organize code by feature/domain: `app/users/`, `app/orders/`. Each domain module contains its own `router.py`, `schemas.py`, `service.py`, `models.py`, and `dependencies.py`.
- Register all routers in `app/main.py` using `app.include_router(users.router, prefix="/api/v1/users", tags=["users"])`.
- Use the **Application Factory** pattern: instantiate `FastAPI()` in a factory function to enable easy testing without side effects.
- Use `lifespan` (FastAPI 0.95+) for application startup/shutdown logic instead of deprecated `@app.on_event` decorators.

## 2. Type Safety & Schemas

- Define all request bodies, responses, and query parameters using **Pydantic v2** models. Use strict mode (`model_config = ConfigDict(strict=True)`) for critical payloads.
- Annotate every endpoint with `response_model=` to control the API's output schema and automatically filter sensitive fields (e.g., `hashed_password`).
- Use `Annotated` with `Query(...)`, `Body(...)`, or `Path(...)` for rich parameter metadata, constraints, and validation.
- Separate **request schemas** (input DTOs), **response schemas** (output DTOs), and **DB models** (ORM entities) into distinct classes — never share a single class for all three roles.

## 3. Async & Performance

- Use `async def` for all path operation functions that perform I/O (database queries, HTTP calls, file reads).
- Use an **async-compatible database library**: `SQLAlchemy 2.0 async` with `asyncpg`, `Tortoise ORM`, or `motor` (MongoDB). Do not use synchronous drivers (`psycopg2`) in async endpoints — they block the event loop.
- Use **dependency injection** (`Depends()`) for database sessions, authenticated user resolution, rate limiters, and shared services. Keep path functions clean and focused.
- Use **Background Tasks** (`BackgroundTasks`) for fire-and-forget work (sending emails, audit logs) that does not affect the response. For heavy workloads, use Celery or Arq.
- Use FastAPI's built-in **WebSocket** support (`@app.websocket("/ws")`) for real-time bidirectional communication. Use `ConnectionManager` pattern to manage active connections.

## 4. Error Handling & Security

- Raise `HTTPException` for expected, client-facing errors (400, 404, 422, 409). Include a descriptive `detail` field.
- Define an `@app.exception_handler(...)` for custom exception types to return consistent, structured error shapes across the API.
- Use **OAuth2PasswordBearer** or **APIKeyHeader** (via `fastapi.security`) for authentication. Use `python-jose` or `PyJWT` for JWT token creation and validation.
- Validate all inputs using Pydantic — FastAPI raises a `422 Unprocessable Entity` automatically for invalid data. Add custom validators with `@field_validator` and `@model_validator` for business-rule constraints.
- Use `settings: Annotated[Settings, Depends(get_settings)]` with `lru_cache` for singleton configuration injection.
- Configure **CORS** explicitly using `CORSMiddleware`. Always restrict `allow_origins` to known domains in production — never use `allow_origins=["*"]` in a production API that handles credentials.

## 5. Testing & Operations

- Test with `pytest` using **`httpx.AsyncClient`** with `ASGITransport`. Never use `TestClient` (synchronous) with async endpoints.
- Use `pytest-asyncio` (`asyncio_mode = "auto"`) for async test functions. Use separate test database fixtures backed by transactions with rollback between tests.
- Run in development with `uvicorn app.main:app --reload`. In production, run with **Gunicorn + Uvicorn workers**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`.
- Expose `/health` and `/ready` endpoints. Mount a `/metrics` endpoint using `prometheus-fastapi-instrumentator`.
- **CI pipeline**: `ruff check` → `ruff format --check` → `mypy` → `pytest --asyncio-mode=auto --cov`.
