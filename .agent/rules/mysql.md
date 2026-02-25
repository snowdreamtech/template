# MySQL / MariaDB Development Guidelines

> Objective: Define standards for designing, querying, and operating MySQL and MariaDB databases safely and efficiently, covering schema design, indexing, query optimization, transactions, and operations.

## 1. Schema Design

### Naming & Types

- Use **`snake_case`** for all table, column, index, and constraint names. Table names should be plural nouns (`users`, `orders`, `order_items`).
- Always define a **`PRIMARY KEY`**. Use `BIGINT UNSIGNED AUTO_INCREMENT` for surrogate integer keys. Use `CHAR(36)` or `BINARY(16)` for UUID primary keys if cross-service portability is required:
  ```sql
  CREATE TABLE users (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    external_id CHAR(36)       NOT NULL UNIQUE DEFAULT (UUID()),
    email      VARCHAR(320)    NOT NULL UNIQUE,
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME        NULL,
    PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  ```
- Use **InnoDB** storage engine exclusively. Never use MyISAM — it has no transactions, no foreign key support, and no crash recovery.
- Use **`utf8mb4`** charset and `utf8mb4_unicode_ci` (or `utf8mb4_0900_ai_ci` in MySQL 8) collation for all tables and text columns. Never use the legacy `utf8` charset — it is limited to 3-byte characters and silently truncates emoji and some CJK characters.
- Use **`DATETIME`** for time columns. Store times in **UTC** at the application level. Be aware that `TIMESTAMP` auto-converts based on the session timezone — this causes surprises in multi-timezone setups.
- Prefer `TINYINT(1)` (not BOOLEAN — MySQL stores them the same) for boolean columns. Use `NOT NULL DEFAULT 0`.

### Soft Deletes

- If using soft deletes, add `deleted_at DATETIME NULL DEFAULT NULL`. Add a **partial index** on `deleted_at IS NULL` (MySQL 8+ supports functional indexes) for undeleted row queries to remain fast.

### Normalization

- Follow **3NF (Third Normal Form)** for OLTP schemas. Denormalize selectively with documentation only when query performance profiling justifies it.
- Avoid wide tables with many nullable columns. Prefer separate related tables. Avoid storing serialized JSON values in VARCHAR when the data will be queried column-by-column (use the `JSON` column type and generated columns instead).

## 2. Indexing

- Index all columns used in **`WHERE`**, **`JOIN ON`**, **`ORDER BY`**, and **`GROUP BY`** clauses. Always index foreign key columns explicitly (InnoDB does not do this automatically):
  ```sql
  CREATE INDEX idx_orders_user_id ON orders (user_id);
  CREATE INDEX idx_orders_status_created ON orders (status, created_at);
  ```
- Use **composite indexes** — order columns by selectivity (most selective first) and consider actual query patterns. MySQL uses the **leftmost prefix rule**: a query must match columns left-to-right to use the index:
  ```sql
  -- Index: (status, created_at)
  WHERE status = 'pending'                       -- ✅ uses index (leftmost prefix)
  WHERE status = 'pending' AND created_at > '...'-- ✅ uses full composite index
  WHERE created_at > '...'                       -- ❌ skips index (not leftmost)
  ```
- Use **`EXPLAIN`** (or **`EXPLAIN ANALYZE`** in MySQL 8+) to verify queries use indexes and identify `type: ALL` (full table scan) on large tables:
  ```sql
  EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
  ```
- Use **covering indexes**: include all queried columns in the index so MySQL can satisfy the query entirely from the index without accessing the row data:
  ```sql
  -- Query: SELECT id, status, total FROM orders WHERE user_id = 123
  CREATE INDEX idx_orders_covering ON orders (user_id, id, status, total);
  ```
- Enable the **slow query log** in configuration:
  ```ini
  [mysqld]
  slow_query_log = ON
  slow_query_log_file = /var/log/mysql/slow.log
  long_query_time = 1
  log_queries_not_using_indexes = ON
  ```
  Analyze with **`pt-query-digest`** (Percona Toolkit) to aggregate and rank slow queries over time.

## 3. Querying

- Use **parameterized queries / prepared statements** for all user-controlled input. Never concatenate user data into SQL strings:

  ```python
  # ❌ SQL injection
  cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")

  # ✅ Parameterized
  cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
  ```

- Use **explicit column names** in `SELECT`. Avoid `SELECT *` in application code — it may cause issues if columns are added or reordered, and prevents covering index optimizations.
- Use **keyset pagination** for large tables. Avoid `LIMIT ... OFFSET` beyond the first few hundred rows — MySQL scans and discards skipped rows:

  ```sql
  -- ❌ Slow OFFSET pagination — scans 1000 rows to skip them
  SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 1000;

  -- ✅ Keyset pagination — starts directly from cursor
  SELECT * FROM orders WHERE id > :last_id ORDER BY id LIMIT 20;
  ```

- Prefer **`UNION ALL`** over `UNION` when duplicates are acceptable — `UNION` adds a costly deduplication step (equivalent to `DISTINCT`).
- For upsert operations, use **`INSERT ... ON DUPLICATE KEY UPDATE`** or `INSERT INTO ... VALUES ... ON DUPLICATE KEY UPDATE ...` — not a separate `SELECT` + `INSERT` sequence:
  ```sql
  INSERT INTO user_stats (user_id, event_count)
  VALUES (123, 1)
  ON DUPLICATE KEY UPDATE event_count = event_count + 1;
  ```

## 4. Transactions & Constraints

- Use `START TRANSACTION` / `COMMIT` / `ROLLBACK` for all multi-step write operations. Keep transactions **as short as possible** to minimize lock contention and deadlock risk.
- Define **`FOREIGN KEY` constraints** explicitly with `ON DELETE` and `ON UPDATE` behavior:
  ```sql
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT    -- prevent deleting user with orders
    ON UPDATE CASCADE;    -- propagate user_id changes
  ```
  Never disable `foreign_key_checks` in production unless you are loading a full database dump and re-enabling immediately after.
- **Deadlock handling**: MySQL resolves deadlocks by rolling back the lighter transaction. Always implement retry logic with exponential backoff for deadlocked transactions in the application layer.
- Use **`SELECT ... FOR UPDATE`** to acquire an exclusive lock on rows for read-then-write operations within a transaction.

## 5. Operations & Safety

### Schema Changes

- Use migration tools (Flyway, Liquibase, `golang-migrate`, `dbmate`) for all schema changes. Commit all migrations to version control. Never run `ALTER TABLE` manually in production:
  ```bash
  dbmate up      # apply pending migrations
  dbmate status  # show applied/pending migrations
  ```
- For large table schema changes, use **`gh-ost`** (GitHub) or **`pt-online-schema-change`** (Percona) to avoid locking the table while millions of rows are modified.

### Backup & Recovery

- Use **`mysqldump --single-transaction`** for logical backups (InnoDB, consistent snapshot without locking). Use **Percona XtraBackup** or **Mariabackup** for hot physical backups at scale.
- Test restore procedures **monthly** — an untested backup is not a backup.

### Security & Replication

- Grant only **minimum required privileges** to application users. Never grant `GRANT ALL` to app service accounts:
  ```sql
  GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO 'appuser'@'%' IDENTIFIED BY 'secret';
  FLUSH PRIVILEGES;
  ```
- Enable **connection pooling** via ProxySQL or MySQL Router for high-concurrency applications. Configure `max_connections` appropriately with pool sizing.
- For replicated setups, monitor replication lag with `SHOW REPLICA STATUS\G` (`Seconds_Behind_Source`). Alert when lag exceeds your write-visibility SLA. Use **semi-synchronous replication** or **MySQL Group Replication** for stronger durability.
