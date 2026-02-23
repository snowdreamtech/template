# SQL & Database Guidelines

> Objective: Define standards for writing safe, performant, and maintainable SQL.

## 1. Security

- **Parameterized Queries**: ALWAYS use parameterized queries or prepared statements. Never concatenate user input directly into SQL strings — this is the primary defense against SQL injection.
- **Least Privilege**: Database users used by applications should only have the permissions they need (`SELECT`, `INSERT`) — never `DROP` or `ALTER` in production application accounts.

## 2. Query Design

- **Explicit Columns**: Always specify column names in `SELECT` statements. Never use `SELECT *` in production code.
- **JOINs**: Prefer explicit `INNER JOIN` / `LEFT JOIN` over implicit comma joins. Always alias tables in multi-table queries.
- **WHERE Clauses**: Ensure all queries against large tables have selective `WHERE` clauses. Avoid full table scans on production data.

## 3. Indexing

- Add indexes on columns frequently used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses.
- Avoid over-indexing: each index has a write-time cost. Review and remove unused indexes.
- Use `EXPLAIN` / `EXPLAIN ANALYZE` to validate query execution plans before deploying.

## 4. Schema Design

- Use appropriate data types (e.g., `BIGINT` for IDs, `TIMESTAMPTZ` for timestamps, `TEXT` over `VARCHAR` in PostgreSQL).
- Never store sensitive data (passwords, tokens, PII) in plaintext. Hash passwords with bcrypt/argon2.
- Use database migrations (e.g., Flyway, Alembic, Liquibase) and commit all migration scripts to version control.

## 5. Transactions

- Wrap multi-step operations that must succeed or fail together in explicit transactions.
- Keep transactions as short as possible to reduce lock contention.
