# MySQL / MariaDB Development Guidelines

> Objective: Define standards for designing, querying, and operating MySQL and MariaDB databases safely and efficiently.

## 1. Schema Design

- Use `snake_case` for all table, column, index, and constraint names.
- Always define a `PRIMARY KEY`. Use `BIGINT UNSIGNED AUTO_INCREMENT` for surrogate keys.
- Use `DATETIME` or `TIMESTAMP` for time columns. Be aware: `TIMESTAMP` is stored in UTC and converted to the session timezone; `DATETIME` is stored as-is. Prefer `DATETIME` with explicit UTC application-side handling for consistency.
- Add `created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP` and `updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` to all tables.
- Use the **InnoDB** storage engine exclusively. Never use MyISAM for new tables (no transactions, no foreign key support).

## 2. Indexing

- Index all columns used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses.
- Use **composite indexes** with the most selective column first. The index must match the query's column order (leftmost prefix rule).
- Use `EXPLAIN` to verify queries use indexes and are not doing full table scans (`type: ALL`) on large tables.
- Monitor slow queries with the **slow query log** (`slow_query_log = ON`, `long_query_time = 1`).

## 3. Querying

- Use **parameterized queries** / prepared statements for all user input. Never concatenate user data into SQL strings.
- Use explicit column names in `SELECT`. Avoid `SELECT *` in application code.
- For pagination on large tables, prefer **keyset pagination** (`WHERE id > :last_id LIMIT 20`) over `LIMIT ... OFFSET` to avoid full scans.
- Avoid `SELECT COUNT(*)` on large tables in hot paths; use approximate counts from `information_schema.TABLES` where precision is not required.

## 4. Transactions & Constraints

- Use `START TRANSACTION` / `COMMIT` / `ROLLBACK` for all multi-step write operations.
- Define `FOREIGN KEY` constraints explicitly with `ON DELETE` and `ON UPDATE` behavior.
- Keep transactions short to minimize lock contention and deadlock risk.

## 5. Operations & Safety

- Use migration tools (Flyway, Liquibase, golang-migrate) for schema management. Never run `ALTER TABLE` manually in production without a migration.
- Use `mysqldump` or **Percona XtraBackup** for backups. Test restore procedures regularly.
- Enable **connection pooling** (ProxySQL, MySQL Router) for high-concurrency applications.
- Never grant `GRANT ALL PRIVILEGES` to application users. Grant only the minimum required (`SELECT`, `INSERT`, `UPDATE`, `DELETE` on specific databases).
