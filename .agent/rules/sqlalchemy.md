# SQLAlchemy Development Guidelines

> Objective: Define standards for using SQLAlchemy 2.x safely and efficiently in Python applications, covering engine setup, ORM models, async patterns, querying, transactions, and migrations.

## 1. Engine, Session & Async Setup

### Engine Configuration

- Create a **single `Engine` instance** per application at startup and reuse it across the entire application lifetime. Configure the connection pool explicitly for production workloads:

  ```python
  from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

  engine = create_async_engine(
      DATABASE_URL,           # e.g., "postgresql+asyncpg://user:pass@host/db"
      pool_size=10,           # persistent connections (tune based on DB tier)
      max_overflow=20,        # additional connections beyond pool_size
      pool_pre_ping=True,     # recycles stale/dead connections automatically
      pool_recycle=1800,      # force-recycle connections older than 30 minutes
      echo=False,             # set True in development to log all SQL
      echo_pool=False,        # set True to debug pool events
  )
  ```

- Use `pool_pre_ping=True` to automatically detect and recycle stale connections after database restarts or network interruptions.

### Session Factory & Lifecycle

- Use **`async_sessionmaker`** (SQLAlchemy 2.x) for async applications — it pre-configures factory defaults in one place:
  ```python
  AsyncSessionLocal = async_sessionmaker(
      bind=engine,
      expire_on_commit=False,  # prevents expired attribute errors after commit
      autoflush=True,
      autocommit=False,
  )
  ```
- Manage session lifecycle with **dependency injection** (FastAPI) or context managers. **Never share sessions across requests, async tasks, or threads:**

  ```python
  # FastAPI dependency
  async def get_db() -> AsyncGenerator[AsyncSession, None]:
      async with AsyncSessionLocal() as session:
          try:
              yield session
          except Exception:
              await session.rollback()
              raise
          finally:
              await session.close()

  @router.get("/users/{user_id}")
  async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
      ...
  ```

- Use `expire_on_commit=False` on the session factory when returning model objects from API endpoints. Without it, accessing attributes after `commit()` triggers implicit database queries (expired attribute lazy load), which is impossible in async sessions.

## 2. ORM Models (SQLAlchemy 2.x Declarative Style)

- Define all models using the **`DeclarativeBase`** class and **typed mapped columns** (SQLAlchemy 2.0+) for full type safety and IDE support:

  ```python
  from sqlalchemy import String, DateTime, func
  from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
  from datetime import datetime

  class Base(DeclarativeBase):
      pass

  class User(Base):
      __tablename__ = "users"

      id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
      email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
      name: Mapped[str] = mapped_column(String(100), nullable=False)
      is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
      created_at: Mapped[datetime] = mapped_column(
          DateTime(timezone=True), server_default=func.now(), nullable=False
      )
      updated_at: Mapped[datetime] = mapped_column(
          DateTime(timezone=True), server_default=func.now(),
          onupdate=func.now(), nullable=False
      )

      # Relationship
      posts: Mapped[list["Post"]] = relationship("Post", back_populates="author")
  ```

- Always define `__tablename__` explicitly. Use `snake_case` for table and column names.
- Annotate all `Mapped` fields with concrete types — avoid `Mapped[Any]`. Use `Optional[T]` for nullable columns.
- Use `__table_args__` for composite indexes, composite unique constraints, and table-level options:
  ```python
  __table_args__ = (
      Index("ix_users_email_active", "email", "is_active"),
      UniqueConstraint("tenant_id", "email", name="uq_tenant_user_email"),
      {"schema": "public"},
  )
  ```

## 3. Querying (SQLAlchemy 2.x Style)

- Use the **2.x `select()` API** exclusively. The legacy `session.query()` API is deprecated in 2.x and removed in future versions:

  ```python
  from sqlalchemy import select

  # ✅ SQLAlchemy 2.x style
  result = await session.execute(
      select(User)
      .where(User.is_active == True)
      .order_by(User.created_at.desc())
      .limit(20)
  )
  users = result.scalars().all()

  # ❌ Legacy 1.x style — deprecated
  users = session.query(User).filter_by(is_active=True).all()
  ```

- Use `scalars()` to retrieve ORM model objects directly. Use `mappings()` for dict-like row access. Use `all()`, `first()`, `one()`, `one_or_none()` to control result handling.
- Use **`selectinload()`** (preferred for async) or **`joinedload()`** for eager loading relationships. **Never rely on lazy loading** with `AsyncSession` — it raises `MissingGreenlet` or `DetachedInstanceError`:
  ```python
  result = await session.execute(
      select(User)
      .options(selectinload(User.posts))  # eager load related posts
      .where(User.id == user_id)
  )
  user = result.scalar_one_or_none()
  ```
- Use **`with_only_columns()`** or select specific columns to avoid over-fetching:
  ```python
  result = await session.execute(
      select(User.id, User.name, User.email)
      .where(User.is_active == True)
  )
  ```
- **Never interpolate user input** into SQL strings. Use SQLAlchemy expressions or bound parameters with `text()`:

  ```python
  # ✅ Parameterized
  from sqlalchemy import text
  result = await session.execute(text("SELECT * FROM users WHERE email = :email"), {"email": email})

  # ❌ SQL injection risk
  result = await session.execute(text(f"SELECT * FROM users WHERE email = '{email}'"))
  ```

- Use `func.count()`, `func.sum()`, `func.max()`, etc. for aggregate queries. Use `group_by()` and `having()` for grouped aggregates.

## 4. Transactions & Bulk Operations

### Transactions

- Sessions operate in an implicit transaction by default. Use explicit `commit()` and `rollback()` calls, or use the `session.begin()` context manager:
  ```python
  # Explicit transaction context manager — auto-commit on success, auto-rollback on exception
  async with session.begin():
      session.add(new_user)
      await session.execute(update_stmt)
      # commit happens here if no exception, rollback if exception
  ```
- **Never call `commit()`** inside a loop for individual records — batch writes and commit once:

  ```python
  # ✅ Batch insert — one commit
  session.add_all([User(email=e) for e in emails])
  await session.commit()

  # ❌ One commit per record — slow and high lock contention
  for email in emails:
      session.add(User(email=email))
      await session.commit()
  ```

- Use **savepoints** (`session.begin_nested()`) for partial rollback within a larger transaction:
  ```python
  async with session.begin():
      session.add(main_record)
      async with session.begin_nested():  # savepoint
          try:
              session.add(optional_record)
          except IntegrityError:
              pass  # rollback savepoint only, outer transaction continues
  ```

### Bulk Operations

- For bulk inserts, use `session.execute(insert(Model), records_list)` with a list of dicts — much faster than creating ORM objects:
  ```python
  await session.execute(
      insert(User),
      [{"email": e, "name": n} for e, n in user_data]
  )
  await session.commit()
  ```
- Use `update()` statements for bulk updates instead of loading and modifying objects individually:
  ```python
  await session.execute(
      update(User)
      .where(User.is_active == False, User.last_login < cutoff_date)
      .values(archived=True)
  )
  ```

## 5. Migrations, Testing & Performance

### Alembic Migrations

- Use **Alembic** for all schema migrations. Never modify the database schema directly or via `Base.metadata.create_all()` in production:
  ```bash
  alembic revision --autogenerate -m "add_users_is_verified_column"
  alembic upgrade head        # apply all pending migrations
  alembic check               # verify no pending migrations exist (use in CI)
  alembic downgrade -1        # rollback last migration
  ```
- **Review autogenerated migrations carefully**: Alembic's autogenerate cannot detect all changes (check constraints, column server defaults, column type changes on some backends, partial indexes). Manually add any missing operations.
- Run `alembic upgrade head` in CI/CD **before** starting the new application version. Use `alembic check` to verify no pending migrations exist after startup.
- Commit all migration files in `alembic/versions/` to version control. **Never edit** a migration that has been applied to any environment.
- Test that `alembic downgrade` scripts work. Validate them in CI against a test database before deploying.

### Testing

- Use separate test databases for each test run. Create and tear down the schema using `Base.metadata.create_all(engine)` / `Base.metadata.drop_all(engine)` per test session:
  ```python
  @pytest.fixture(scope="session")
  async def test_engine():
      engine = create_async_engine("postgresql+asyncpg://localhost/test_db")
      async with engine.begin() as conn:
          await conn.run_sync(Base.metadata.create_all)
      yield engine
      async with engine.begin() as conn:
          await conn.run_sync(Base.metadata.drop_all)
      await engine.dispose()
  ```
- Use **Testcontainers** (`testcontainers-python`) for isolated test databases in CI:

  ```python
  from testcontainers.postgres import PostgresContainer

  @pytest.fixture(scope="session")
  def postgres():
      with PostgresContainer("postgres:16-alpine") as pg:
          yield pg.get_connection_url()
  ```

- Mock sessions in unit tests using `unittest.mock.AsyncMock` or `pytest-mock` to test service layers without database I/O.

### Performance

- Enable slow query logging with `echo=True` in development. In production, use the database's own slow query log (`log_min_duration_statement` in PostgreSQL).
- Monitor connection pool exhaustion with `QueuePool` events or APM tools. Increase `pool_size` or add `max_overflow` if `TimeoutError: QueuePool limit` errors appear.
- Use `lazy="raise"` on relationships in production to prevent accidental lazy loading from triggering N+1 queries:
  ```python
  posts: Mapped[list["Post"]] = relationship("Post", back_populates="author", lazy="raise")
  ```
