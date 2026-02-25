# MySQL / MariaDB Development Guidelines

> Objective: Define standards for designing, querying, and operating MySQL and MariaDB databases safely and efficiently.

## 1. Schema Design

- Use `snake_case` for all table, column, index, and constraint names.
- Always define a `PRIMARY KEY`. Use `BIGINT UNSIGNED AUTO_INCREMENT` for surrogate keys.
- Prefer `DATETIME` for time columns — store dates in UTC at the application level. Be aware that `TIMESTAMP` is stored in UTC and converted on read based on session timezone, which can cause surprises.
- Add `created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` and `updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` to all tables.
- Use the **InnoDB** storage engine exclusively for all new tables. Never use MyISAM (no transactions, no foreign key support, no crash recovery).
- Use `utf8mb4` as the character set and `utf8mb4_unicode_ci` (or `utf8mb4_0900_ai_ci` in MySQL 8) as the collation for all tables and columns. Never use the legacy `utf8` charset — it only stores 3-byte characters and silently truncates emoji and some CJK characters.

## 2. Indexing

- Index all columns used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses. Index foreign key columns explicitly.
- Use **composite indexes** with the most selective column first. MySQL uses the **leftmost prefix rule** — queries must match columns left-to-right in the index to use it.
- Run `EXPLAIN` (or `EXPLAIN ANALYZE` in MySQL 8) to verify queries use indexes. Eliminate `type: ALL` (full table scan) on large tables in production.
- Enable the **slow query log** (`slow_query_log = ON`, `long_query_time = 1`) to identify queries exceeding 1 second.
- Use `pt-query-digest` (Percona Toolkit) to aggregate and analyze slow query log output over time.

## 3. Querying

- Use **parameterized queries** / prepared statements for all user input. Never concatenate user data into SQL strings.
- Use explicit column names in `SELECT`. Avoid `SELECT *` in application code.
- Use **keyset pagination** (`WHERE id > :last_id LIMIT 20`) for large tables. Avoid `LIMIT ... OFFSET` beyond the first few hundred rows — it performs a sequential scan to skip rows.
- Use **covering indexes** to serve queries entirely from the index without hitting the table. Especially effective for read-heavy workloads.
- Prefer `UNION ALL` over `UNION` when duplicate rows are acceptable — `UNION` adds a costly deduplication step equivalent to `DISTINCT`.

## 4. Transactions & Constraints

- Use `START TRANSACTION` / `COMMIT` / `ROLLBACK` for all multi-step write operations.
- Define `FOREIGN KEY` constraints explicitly with `ON DELETE` and `ON UPDATE` behavior. InnoDB enforces these by default — do not disable `foreign_key_checks` in production.
- Keep transactions **short** to minimize lock contention and reduce deadlock risk.
- For upsert operations, use `INSERT ... ON DUPLICATE KEY UPDATE` or `INSERT IGNORE` (with care), not a separate `SELECT` + `INSERT` pattern.

## 5. Operations & Safety

- Use migration tools (Flyway, Liquibase, `golang-migrate`, Dbmate) for all schema changes. Never run `ALTER TABLE` manually in production without a migration script.
- For large table schema changes, use **pt-online-schema-change** (Percona) or **gh-ost** (GitHub) to avoid locking the table during migration.
- Use `mysqldump` for logical backups or **Percona XtraBackup** for hot physical backups. Test restore procedures monthly.
- Enable **connection pooling** via **ProxySQL** or MySQL Router for high-concurrency applications.
- Grant only the minimum required privileges to application users (`SELECT`, `INSERT`, `UPDATE`, `DELETE` on specific databases). Never `GRANT ALL PRIVILEGES`.
- For replicated setups, monitor replication lag with `SHOW REPLICA STATUS` (`Seconds_Behind_Source`). Alert when lag exceeds your write visibility SLA. Use **semi-synchronous replication** or **MySQL Group Replication** for durability guarantees.
