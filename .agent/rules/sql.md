# SQL & Database Guidelines

> Objective: Define standards for writing safe, performant, and maintainable SQL across relational databases.

## 1. Security

- **Parameterized Queries**: ALWAYS use parameterized queries or prepared statements. Never concatenate user input into SQL strings — this is the most critical defense against SQL injection.
- **Least Privilege**: Application database users MUST have only the permissions they need (`SELECT`, `INSERT`, `UPDATE`, `DELETE` on relevant tables). Never grant `DROP`, `ALTER`, `CREATE`, or DBA-level permissions to application accounts.
- Hash all passwords using a strong adaptive algorithm (**Argon2id**, bcrypt, scrypt). Never store passwords in plaintext or use `MD5`/`SHA1` for password storage.
- Encrypt sensitive columns (PII, payment data) at rest using transparent data encryption or application-level encryption. Separate key storage from data storage.

## 2. Query Design

- **Explicit Columns**: Always specify column names in `SELECT` statements. Never use `SELECT *` in application code — it couples code to schema structure and can leak sensitive fields.
- **Explicit JOINs**: Use `INNER JOIN` / `LEFT JOIN` / `RIGHT JOIN` explicitly. Never use implicit comma joins (`FROM a, b WHERE a.id = b.aid`). Always alias tables in multi-table queries for readability.
- **Pagination**: Use keyset/cursor pagination (`WHERE id > :last_id ORDER BY id LIMIT :n`) for deep pagination. Avoid `OFFSET` for page numbers beyond a few hundred — performance degrades linearly.
- Avoid `SELECT DISTINCT` as a workaround for duplicate data — it indicates a query logic issue. Fix the join or group logic instead.

## 3. Indexing

- Add indexes on columns frequently used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses — especially on foreign key columns.
- Avoid over-indexing: each index incurs a write-time overhead. Use `EXPLAIN ANALYZE` to confirm index usage and remove unused indexes.
- Use **covering indexes** (including projected columns) to avoid table lookups for hot queries.
- For text search, use **full-text search indexes** (`tsvector`/GIN in PostgreSQL, `FULLTEXT` in MySQL) rather than `LIKE '%term%'` which prevents index use.

## 4. Schema Design

- Use appropriate data types: `BIGINT` for surrogate IDs, `TIMESTAMPTZ` for timestamps (always with time zone), `BOOLEAN` for flags, `NUMERIC(p,s)` for money.
- Always define columns with `NOT NULL` unless nullable is genuinely required. Nullable columns complicate queries and index design.
- Define `FOREIGN KEY` constraints and explicit `ON DELETE` behavior (`CASCADE`, `SET NULL`, `RESTRICT`). Never omit referential integrity constraints.
- Use **migrations** (Flyway, Liquibase, Alembic, `golang-migrate`, `dbmate`) for all schema changes. Commit migration scripts to version control. Never modify schema manually in production.

## 5. Transactions & Operations

- Wrap multi-step operations that must succeed or fail atomically in explicit transactions with proper `COMMIT`/`ROLLBACK` handling.
- Keep transactions **as short as possible** to minimize lock contention. Never call external services (HTTP requests, file I/O) inside a transaction.
- Use `EXPLAIN (ANALYZE, BUFFERS)` to investigate slow queries. Add query execution time logging (`log_min_duration_statement = 1000` in PostgreSQL).
- Regularly `ANALYZE` and `VACUUM` (PostgreSQL) or `OPTIMIZE TABLE` (MySQL) large tables to maintain statistics and reclaim space.
