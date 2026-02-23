# PostgreSQL Development Guidelines

> Objective: Define standards for designing, querying, and operating PostgreSQL databases safely and efficiently.

## 1. Schema Design

- Use `snake_case` for all table, column, index, and constraint names.
- Always define a primary key. Prefer `BIGSERIAL` (or `BIGINT GENERATED ALWAYS AS IDENTITY`) over `SERIAL` for new tables.
- Use `TIMESTAMPTZ` (timestamp with time zone) for all datetime columns — never `TIMESTAMP` without zone.
- Add `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL` and `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL` to all tables.
- Enforce referential integrity with `FOREIGN KEY` constraints. Define `ON DELETE` behavior explicitly (`CASCADE`, `SET NULL`, `RESTRICT`).

## 2. Indexing

- Always index foreign key columns — PostgreSQL does not create these automatically.
- Use **partial indexes** for selective queries: `CREATE INDEX ON orders (user_id) WHERE status = 'pending';`
- Use **composite indexes** ordered by selectivity (most selective column first).
- Use `EXPLAIN (ANALYZE, BUFFERS)` to verify index usage. Aim to eliminate `Seq Scan` on large tables in hot paths.
- Monitor and remove unused indexes with `pg_stat_user_indexes`.

## 3. Querying

- Always use **parameterized queries** / prepared statements to prevent SQL injection.
- Use `SELECT` with explicit column names — avoid `SELECT *` in application code.
- Prefer **CTEs** (`WITH`) for readability on complex queries. Use `WITH ... MATERIALIZED` or `NOT MATERIALIZED` to control optimization behaviour in PostgreSQL 12+.
- Use `LIMIT` with `OFFSET` for simple pagination, but prefer **keyset/cursor pagination** (`WHERE id > $last_id LIMIT 20`) for large datasets to avoid performance degradation.

## 4. Transactions & Locks

- Wrap multi-step operations in explicit transactions (`BEGIN` / `COMMIT` / `ROLLBACK`).
- Keep transactions **short and fast** to minimize lock contention. Do not call external services inside a transaction.
- Use `SELECT ... FOR UPDATE SKIP LOCKED` for queue-style workloads (e.g., job processing).
- Avoid `LOCK TABLE` — prefer row-level locking via `SELECT ... FOR UPDATE`.

## 5. Operations & Safety

- Use **migrations** (Flyway, Liquibase, `golang-migrate`, Alembic) for all schema changes. Never modify schema manually in production.
- Use `pg_dump` or continuous backup (pgBackRest, WAL-G) with a tested restore procedure.
- Enable **connection pooling** with PgBouncer in front of PostgreSQL for high-concurrency workloads.
- Monitor with `pg_stat_activity`, `pg_stat_statements`, and `pg_locks` for slow queries and deadlocks.
- Never run application database users with `SUPERUSER` privileges. Grant only the minimum required permissions.
