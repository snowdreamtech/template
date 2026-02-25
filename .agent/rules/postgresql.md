# PostgreSQL Development Guidelines

> Objective: Define standards for designing, querying, migrating, and operating PostgreSQL databases safely and efficiently.

## 1. Schema Design

- Use `snake_case` for all table, column, index, and constraint names.
- Always define a primary key. Prefer `BIGINT GENERATED ALWAYS AS IDENTITY` over `SERIAL`/`BIGSERIAL` for new tables — the identity syntax is SQL standard.
- Use `TIMESTAMPTZ` (timestamp with time zone) for all datetime columns — never bare `TIMESTAMP`. Store and compare datetimes in UTC.
- Add `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL` and `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL` to all tables. Use a trigger or ORM hook to auto-update `updated_at`.
- Enforce referential integrity with `FOREIGN KEY` constraints. Define `ON DELETE` behavior explicitly (`CASCADE`, `SET NULL`, `RESTRICT`). Do not defer this decision.

## 2. Indexing

- Always index foreign key columns — PostgreSQL does not create them automatically. Un-indexed FKs cause full table scans on joins and cascade operations.
- Use **partial indexes** for selective queries: `CREATE INDEX ON orders (user_id) WHERE status = 'pending'`.
- Use **composite indexes** with columns ordered by selectivity (most selective first). Include columns referenced only in `SELECT` using `INCLUDE (col)` to create covering indexes (PostgreSQL 11+).
- Use `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)` to verify query plans. Eliminate `Seq Scan` on large tables in hot paths.
- Monitor unused indexes with `SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0` and remove those not needed. Unused indexes slow down all write operations.

## 3. Querying

- Always use **parameterized queries** / prepared statements to prevent SQL injection.
- Use explicit column names in `SELECT` — avoid `SELECT *` in application code. It couples code to schema structure and can over-expose sensitive columns.
- Use **CTEs** (`WITH`) for readable complex queries. Use `NOT MATERIALIZED` in PostgreSQL 12+ to allow the optimizer to inline the CTE.
- Use **keyset/cursor pagination** (`WHERE id > $last_id ORDER BY id LIMIT 20`) for large datasets. Avoid `OFFSET` pagination beyond the first few thousand rows — it degrades linearly.
- Use `COPY` instead of `INSERT` for bulk data loading. Use `unnest` + `INSERT INTO ... SELECT` for multi-row inserts from application code.

## 4. Transactions & Locks

- Wrap all multi-step operations in explicit transactions (`BEGIN` / `COMMIT` / `ROLLBACK`). Ensure every code path handles rollback on error.
- Keep transactions **short** to minimize lock contention. Never call external services (HTTP, file I/O) inside a transaction.
- Use `SELECT ... FOR UPDATE SKIP LOCKED` for queue-style workloads (job tables). Prefer this over advisory locks for most use cases.
- Avoid schema changes inside long-running transactions — DDL acquires heavy locks (`ACCESS EXCLUSIVE`). For zero-downtime migrations, use `LOCK TIMEOUT` and small-batch operations.

## 5. Operations & Safety

- Use **migrations** (Flyway, Liquibase, `golang-migrate`, Alembic, `dbmate`) for all schema changes. Never modify schema manually in production.
- Take regular backups with `pg_dump` or continuous archiving (**pgBackRest**, **WAL-G** with S3). **Test restores quarterly** — an untested backup is not a backup.
- Enable **connection pooling** with **PgBouncer** (transaction mode) in front of PostgreSQL for high-concurrency workloads. Without pooling, thousands of connections exhaust PostgreSQL's process-per-connection model.
- Monitor with `pg_stat_statements` (enable extension), `pg_stat_activity`, and `pg_locks`. Set `log_min_duration_statement = 1000` to log slow queries.
- Grant database users the minimum required privileges (no `SUPERUSER`). Use role inheritance and `GRANT` at the schema level.
