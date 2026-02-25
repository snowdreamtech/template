# FastAPI Development Guidelines

> Objective: Define standards for building type-safe, performant, and maintainable Python APIs with FastAPI, covering project structure, Pydantic schemas, async patterns, dependency injection, security, and testing.

## 1. Project Structure & Application Factory

### Layout

- Organize code by **feature/domain**, not by technical type:

  ```text
  app/
  ├── main.py               # App factory — create_app(), lifespan context
  ├── config.py             # Settings via pydantic-settings (loaded once)
  ├── database.py           # Async SQLAlchemy engine and sessionmaker
  ├── features/
  │   ├── users/
  │   │   ├── __init__.py
  │   │   ├── router.py     # APIRouter, endpoint definitions
  │   │   ├── schemas.py    # Pydantic I/O models (Request/Response)
  │   │   ├── service.py    # Business logic
  │   │   ├── models.py     # SQLAlchemy ORM models
  │   │   └── deps.py       # Feature-specific Depends() functions
  │   └── orders/
  ├── core/
  │   ├── exceptions.py     # Custom exception types + handlers
  │   ├── security.py       # JWT, password hashing
  │   └── deps.py           # Shared Depends(): get_db, get_current_user
  └── tests/
  ```

- **Application Factory Pattern**: instantiate `FastAPI()` in a factory function for testability and flexibility:

  ```python
  from contextlib import asynccontextmanager

  @asynccontextmanager
  async def lifespan(app: FastAPI):
      # Startup: initialize connection pools
      await db.connect()
      await redis_client.initialize()
      yield
      # Shutdown: gracefully close
      await db.disconnect()
      await redis_client.close()

  def create_app() -> FastAPI:
      app = FastAPI(
        title="My API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/docs",
      )
      app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
      app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
      app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, ...)
      return app

  app = create_app()  # module-level for uvicorn
  ```

- Use **`lifespan`** context manager (FastAPI 0.95+) for startup/shutdown logic — not the deprecated `@app.on_event()` decorators.

## 2. Type Safety & Schemas

### Pydantic v2 Models

- Define all request bodies, query parameters, and responses using **Pydantic v2** models. Separate concerns into distinct model classes:

  ```python
  # ✅ Separated schemas — different models for different purposes
  class CreateUserRequest(BaseModel):
      name: str = Field(min_length=1, max_length=100)
      email: EmailStr
      role: UserRole = UserRole.VIEWER

  class UpdateUserRequest(BaseModel):
      name: str | None = Field(default=None, min_length=1, max_length=100)

  class UserResponse(BaseModel):
      id: UUID
      name: str
      email: str
      role: UserRole
      created_at: datetime
      # Note: hashed_password is intentionally excluded

      model_config = ConfigDict(from_attributes=True)  # ORM compatibility
  ```

- Annotate every endpoint with **`response_model=`** to control the API output schema and automatically filter sensitive fields:

  ```python
  @router.post("/", response_model=UserResponse, status_code=201)
  async def create_user(body: CreateUserRequest, svc: UserService = Depends(get_user_service)):
      return await svc.create(body)
  ```

- Use `Annotated` for rich parameter declarations with validators and metadata:

  ```python
  from typing import Annotated
  from fastapi import Query, Path

  @router.get("/")
  async def list_users(
      page:  Annotated[int, Query(ge=1, le=10_000)] = 1,
      limit: Annotated[int, Query(ge=1, le=100)]    = 20,
      search: Annotated[str | None, Query(max_length=200)] = None,
  ): ...
  ```

- Use `model_config = ConfigDict(strict=True)` for critical payloads to prevent coercions (e.g., string "1" silently coerced to int 1).

## 3. Async & Performance

### Async Database Access

- Use `async def` for all path operations that perform I/O. **Never call synchronous blocking libraries** in async handlers — they block the uvicorn event loop:

  ```python
  # ❌ Blocks event loop — synchronous psycopg2 in async handler
  @router.get("/{user_id}")
  async def get_user(user_id: UUID):
      user = db_session.query(User).filter_by(id=user_id).first()  # blocks!

  # ✅ Async driver — non-blocking
  @router.get("/{user_id}")
  async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
      result = await db.execute(select(User).where(User.id == user_id))
      user = result.scalar_one_or_none()
  ```

- Use **SQLAlchemy 2.0 async** with `asyncpg` for PostgreSQL. Configure the async engine:

  ```python
  from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

  engine = create_async_engine(settings.database_url.replace("postgresql://", "postgresql+asyncpg://"))
  async_session = async_sessionmaker(engine, expire_on_commit=False)

  async def get_db() -> AsyncGenerator[AsyncSession, None]:
      async with async_session() as session:
          yield session
  ```

### Dependency Injection

- Use **`Depends()`** extensively for database sessions, authenticated user resolution, feature flags, and rate limiters:

  ```python
  # deps.py
  async def get_current_user(
      token: str = Depends(oauth2_scheme),
      db:    AsyncSession = Depends(get_db),
  ) -> User:
      payload = verify_jwt(token)
      user = await db.get(User, payload.sub)
      if not user:
          raise HTTPException(status_code=401, detail="User not found")
      return user

  # In endpoint:
  @router.get("/me")
  async def get_me(current_user: User = Depends(get_current_user)):
      return UserResponse.model_validate(current_user)
  ```

- Use **`BackgroundTasks`** for fire-and-forget work that doesn't affect the response. For heavy workloads requiring retry, use Celery or `arq`.

## 4. Error Handling & Security

### Error Handling

- Raise `HTTPException` for client-facing errors with descriptive `detail` fields.
- Register custom exception handlers for consistent error shapes:

  ```python
  @app.exception_handler(ServiceError)
  async def service_error_handler(request: Request, exc: ServiceError) -> JSONResponse:
      return JSONResponse(
          status_code=exc.http_status,
          content={"error": exc.code, "message": exc.message},
      )
  ```

- Use `@field_validator` and `@model_validator` in schemas for business-rule constraints beyond type validation.

### Security

- Use **OAuth2PasswordBearer** or **APIKeyHeader** (via `fastapi.security`) for authentication. Use `PyJWT` for JWT creation and validation.
- Use `PassLib[bcrypt]` or Argon2 for password hashing:

  ```python
  from passlib.context import CryptContext
  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
  ```

- Configure **CORS** explicitly — use `allow_origins=settings.allowed_origins` in production. Never use `allow_origins=["*"]` for APIs that handle credentials or sensitive data.
- Use **rate limiting** via `slowapi` or an nginx/gateway layer for production APIs:

  ```python
  from slowapi import Limiter
  limiter = Limiter(key_func=get_remote_address)

  @router.post("/login")
  @limiter.limit("10/minute")
  async def login(request: Request, body: LoginRequest): ...
  ```

## 5. Testing & Operations

### Testing

- Test with `pytest` using **`httpx.AsyncClient`** with `ASGITransport`. Never use `TestClient` (synchronous) with async endpoints:

  ```python
  import pytest
  import httpx
  from app.main import create_app

  @pytest.fixture
  async def client(db_session):
      app = create_app()
      app.dependency_overrides[get_db] = lambda: db_session
      async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
          yield c

  @pytest.mark.asyncio
  async def test_create_user(client: httpx.AsyncClient):
      res = await client.post("/api/v1/users", json={"name": "Alice", "email": "alice@example.com"})
      assert res.status_code == 201
      assert res.json()["email"] == "alice@example.com"
  ```

- Override dependencies in tests using `app.dependency_overrides` — never patch at the module level.
- Use **Testcontainers** for integration tests requiring real PostgreSQL or Redis.

### Deployment & Observability

- Run in development with `uvicorn app.main:app --reload`. In production, use **Gunicorn + Uvicorn workers**:

  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 app.main:app
  ```

- Expose `/health/live` (liveness) and `/health/ready` (readiness) endpoints. Mount `/metrics` using `prometheus-fastapi-instrumentator`:

  ```python
  from prometheus_fastapi_instrumentator import Instrumentator
  Instrumentator().instrument(app).expose(app, endpoint="/metrics")
  ```

- **CI pipeline**: `ruff check .` → `ruff format --check .` → `mypy .` → `bandit -r app/` → `pytest --asyncio-mode=auto --cov --cov-fail-under=80`.
