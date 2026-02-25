# PostgreSQL Development Guidelines

> Objective: Define standards for designing, querying, migrating, and operating PostgreSQL databases safely and efficiently, covering schema design, indexing, query optimization, transactions, and reliability.

## 1. Schema Design

- Use `snake_case` for all table, column, index, and constraint names. Avoid camelCase or mixed naming.
- Always define a primary key. Use **`BIGINT GENERATED ALWAYS AS IDENTITY`** for new tables — it is the SQL standard successor to `SERIAL`:

  ```sql
  CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
  );
  ```

- Use **`TIMESTAMPTZ`** (timestamp with time zone) for all datetime columns — never bare `TIMESTAMP`. Store datetimes as UTC:
  - `created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
  - `updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL`
  - Use a trigger to auto-update `updated_at`, or handle it in your ORM.
- Enforce referential integrity with **`FOREIGN KEY`** constraints. Define `ON DELETE` behavior explicitly — not choosing is a choice that often leads to orphaned data or unintended cascades:
  - `ON DELETE CASCADE` — delete child records when parent is deleted (use when children have no meaning without the parent)
  - `ON DELETE SET NULL` — nullify FK when parent is deleted (use for optional relationships)
  - `ON DELETE RESTRICT` — prevent parent deletion if children exist (use for critical business relationships)
- Use appropriate data types: `TEXT` over `VARCHAR(n)` unless you specifically need a length constraint enforced at the DB level. Use `JSONB` (not `JSON`) for semi-structured data. Use `UUID` as a primary key when distributed ID generation is needed.
- Add `NOT NULL` constraints at the database level for columns that must always have a value — do not rely solely on application-level validation.
- Use **check constraints** for business rule enforcement at the database level:

  ```sql
  ALTER TABLE products ADD CONSTRAINT positive_price CHECK (price > 0);
  ALTER TABLE orders ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'fulfilled', 'cancelled'));
  ```

## 2. Indexing & Query Planning

### Index Design

- **Always index foreign key columns** — PostgreSQL does not create them automatically. Un-indexed FK columns cause full table scans on joins and cascade operations:

  ```sql
  CREATE INDEX idx_orders_user_id ON orders (user_id);
  CREATE INDEX idx_order_items_order_id ON order_items (order_id);
  ```

- Use **partial indexes** for selective queries on subsets of data:

  ```sql
  CREATE INDEX idx_orders_pending ON orders (user_id, created_at)
  WHERE status = 'pending';
  ```

- Use **composite indexes** with columns ordered by selectivity (most selective first). Use `INCLUDE (col)` for covering indexes (PostgreSQL 11+) to satisfy queries entirely from the index without a heap fetch:

  ```sql
  CREATE INDEX idx_users_email_name ON users (email)
  INCLUDE (name, created_at);  -- query: SELECT name, created_at WHERE email = ?
  ```

- Use `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)` to verify query plans before deploying. Investigate and eliminate `Seq Scan` on large tables in hot paths.
- Monitor and remove unused indexes regularly:

  ```sql
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0 AND schemaname = 'public'
  ORDER BY tablename;
  ```

  Unused indexes slow all write operations (INSERT, UPDATE, DELETE) and consume storage.

### Specialized Indexes

- Use **GIN indexes** for `JSONB`, full-text search (`tsvector`), and array columns.
- Use **GiST indexes** for geometric types, range types, and `ts_vector` full-text search.
- Use **trigram indexes** (`pg_trgm` extension) for `LIKE '%pattern%'` searches without full-text setup.

## 3. Querying & Performance

- Always use **parameterized queries** / prepared statements. Never interpolate user input into SQL strings — this is the primary defense against SQL injection:

  ```sql
  -- Application driver: use ? or $1 placeholders
  SELECT id, email FROM users WHERE email = $1 AND active = true;
  ```

- Use explicit column names in `SELECT` — avoid `SELECT *` in application code. It couples application code to schema structure and may over-expose sensitive columns.
- Use **CTEs** (`WITH`) for readable multi-step queries. In PostgreSQL 12+, use `NOT MATERIALIZED` to allow the optimizer to inline them for better performance:

  ```sql
  WITH recent_orders AS NOT MATERIALIZED (
    SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days'
  )
  SELECT u.name, COUNT(o.id)
  FROM users u JOIN recent_orders o ON u.id = o.user_id
  GROUP BY u.name;
  ```

- Use **keyset/cursor pagination** instead of `OFFSET` for large datasets:

  ```sql
  -- ✅ Keyset pagination — O(log n) regardless of page
  SELECT * FROM posts WHERE id > $last_id ORDER BY id LIMIT 20;

  -- ❌ OFFSET pagination — O(n), degrades linearly with page number
  SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 10000;
  ```

- Use `COPY` for bulk data loading: `COPY users FROM stdin CSV HEADER`. It is 10-100× faster than `INSERT` for large datasets. For programmatic multi-row inserts, use `INSERT INTO ... SELECT FROM unnest(...)`.
- Avoid `SELECT COUNT(*)` on large tables without a filter — it scans the entire table. Use `pg_stat_user_tables.live_tup_count` for approximate counts.

## 4. Transactions & Locks

- Wrap all multi-step mutations in explicit transactions. Ensure every code path handles rollback on error:

  ```sql
  BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = $1;
    UPDATE accounts SET balance = balance + 100 WHERE id = $2;
  COMMIT;
  -- On error: ROLLBACK;
  ```

- Keep transactions **short** — minimize the time between `BEGIN` and `COMMIT`. Long-running transactions block autovacuum, cause `pg_stat_activity` accumulation, and increase lock contention.
- **Never call external services** (HTTP requests, file I/O, message queue publishes) inside a database transaction. Network timeouts can hold locks for unbounded time.
- Use `SELECT ... FOR UPDATE` to lock specific rows before modifying them. Use `SKIP LOCKED` for queue-style workloads:

  ```sql
  SELECT id, payload FROM job_queue
  WHERE status = 'pending'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  ```

- For zero-downtime schema migrations, use DDL with `LOCK TIMEOUT`:

  ```sql
  SET lock_timeout = '2s';  -- Fail if lock not acquired in 2s
  ALTER TABLE orders ADD COLUMN notes TEXT;  -- Generally safe (no lock required for adding nullable column)
  ```

  Avoid `ALTER TABLE ... ADD COLUMN NOT NULL` without a default on large tables — use a 3-step migration instead (add nullable, backfill, add not null constraint with `VALIDATE CONSTRAINT`).

## 5. Operations, Safety & Observability

### Migrations

- Use a dedicated migration tool for all schema changes. Never modify schema in production manually:
  - **golang-migrate**: simple, Git-friendy migration files
  - **Alembic** (Python): deep SQLAlchemy integration
  - **Flyway** / **Liquibase** (Java/JVM): enterprise-grade, teams and plugins
  - **Atlas**: modern, declarative schema management
- Run `migrate up` / `alembic upgrade head` in CI/CD **before starting the new application version**. Ensure downgrade scripts (`migrate down`) are tested and work.

### Backup & Recovery

- Take regular backups:
  - **Logical**: `pg_dump -Fc mydb > backup.dump` for logical backups of specific databases. Schedule with `pg_dumpall` for all databases + global objects (roles).
  - **Physical**: **pgBackRest** or **WAL-G** with S3/GCS/Azure for continuous archiving with point-in-time recovery (PITR) — essential for PITR capability.
- **Test restores quarterly** — perform a full restore to a separate environment and verify data integrity. An untested backup is not a backup.
- Set `archive_mode = on` and configure WAL archiving for PITR capability.

### Connection Pooling & Monitoring

- Enable **PgBouncer** (transaction mode) in front of PostgreSQL for high-concurrency workloads. Without pooling, PostgreSQL's process-per-connection model exhausts resources at thousands of connections.
- Configure monitoring and alerting:
  - Enable `pg_stat_statements` extension: tracks query execution statistics (calls, total time, rows)
  - Monitor `pg_stat_activity` for long-running queries (alert on > 5 minutes)
  - Monitor `pg_locks` for lock contention
  - Set `log_min_duration_statement = 1000` (ms) to log slow queries
  - Alert on replication lag (if using streaming replication) exceeding 30 seconds
- Grant database users the **minimum required privileges**. Avoid `SUPERUSER`. Use role inheritance:

  ```sql
  CREATE ROLE app_readonly;
  GRANT CONNECT ON DATABASE mydb TO app_readonly;
  GRANT USAGE ON SCHEMA public TO app_readonly;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;

  CREATE USER myapp WITH PASSWORD 'secret' IN ROLE app_readonly;
  ```
