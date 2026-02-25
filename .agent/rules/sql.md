# SQL & Database Guidelines

> Objective: Define standards for writing safe, performant, and maintainable SQL across relational databases, covering security, query design, indexing, schema design, and operational best practices.

## 1. Security

### SQL Injection Prevention

- **ALWAYS use parameterized queries or prepared statements**. Never concatenate or interpolate user input into SQL strings — this is the primary and most critical defense against SQL injection:

  ```python
  # ❌ Critical SQL injection vulnerability
  query = f"SELECT * FROM users WHERE email = '{email}'"
  cursor.execute(query)

  # ✅ Parameterized query — user input is treated as data, not SQL
  cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

  # In Go (database/sql):
  db.QueryContext(ctx, "SELECT * FROM users WHERE email = $1", email)

  # In Java (JDBC):
  PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE email = ?");
  ps.setString(1, email);
  ```

### Least Privilege

- Application database users **MUST have only the minimum required permissions**. Grant only `SELECT`, `INSERT`, `UPDATE`, `DELETE` on tables the application actually writes to:

  ```sql
  -- ❌ Never for app accounts
  GRANT ALL PRIVILEGES ON DATABASE myapp TO appuser;

  -- ✅ Scoped minimal permissions
  GRANT SELECT, INSERT, UPDATE, DELETE ON users, orders, products TO appuser;
  GRANT SELECT ON read_only_table TO appuser;
  ```

  Never grant `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, `REFERENCES`, or `SUPERUSER` to application service accounts.

### Sensitive Data

- Hash all passwords using a strong adaptive algorithm: **Argon2id** (preferred), bcrypt (cost ≥ 12), or scrypt. Never store plaintext passwords, MD5, SHA1, or unsalted hashes.
- Encrypt sensitive columns (PII, payment information, medical data) at rest using transparent data encryption (TDE) or column-level encryption. Store encryption keys separately from the data.
- Audit and log all DDL changes and privileged operations in production. Alert on unexpected schema modifications.

## 2. Query Design

### Core Principles

- **Always specify column names** in `SELECT`. Never use `SELECT *` in application code — it couples code to schema order, leaks sensitive fields, and prevents covering index optimizations:

  ```sql
  -- ❌ Leaks sensitive fields, breaks covering indexes
  SELECT * FROM users WHERE user_id = $1;

  -- ✅ Explicit projection — only what you need
  SELECT id, name, email, role, created_at FROM users WHERE id = $1;
  ```

- Use **explicit JOIN types** (`INNER JOIN`, `LEFT JOIN`). Never use implicit comma joins (`FROM a, b WHERE a.id = b.aid`) — they are harder to read and easy to accidentally create Cartesian products.
- Always **alias tables** in multi-table queries for readability and disambiguation.

### Advanced Query Patterns

- Use **keyset (cursor) pagination** for large datasets. Avoid `OFFSET` pagination beyond a few hundred rows — it performs a sequential scan to skip rows:

  ```sql
  -- ❌ Linear performance degradation
  SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;

  -- ✅ Constant performance regardless of page depth
  SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 20;
  ```

- Use **window functions** for ranking and analytical queries instead of correlated subqueries (which run once per outer row):

  ```sql
  -- ✅ Window function — single pass, much more efficient
  SELECT
    user_id,
    order_total,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS order_rank,
    LAG(order_total)  OVER (PARTITION BY user_id ORDER BY created_at) AS previous_order_total,
    SUM(order_total)  OVER (PARTITION BY user_id) AS lifetime_total
  FROM orders
  WHERE status = 'completed';
  ```

- Use **CTEs** (`WITH ... AS (...)`) to break complex queries into readable, named intermediate steps:

  ```sql
  WITH active_users AS (
    SELECT id, name FROM users WHERE status = 'active' AND last_login > NOW() - INTERVAL '30 days'
  ),
  user_order_counts AS (
    SELECT user_id, COUNT(*) AS order_count FROM orders GROUP BY user_id
  )
  SELECT au.name, uoc.order_count
  FROM active_users au
  LEFT JOIN user_order_counts uoc ON uoc.user_id = au.id
  ORDER BY uoc.order_count DESC NULLS LAST;
  ```

- Avoid `SELECT DISTINCT` as a workaround for duplicate rows — it signals a JOIN or GROUP BY logic issue. Fix the query structure instead.

## 3. Indexing

### Index Design

- Add indexes on columns frequently used in **`WHERE`**, **`JOIN ON`**, and **`ORDER BY`** clauses. Always explicitly index foreign key columns (they are not automatically indexed in PostgreSQL):

  ```sql
  -- After creating orders(user_id) FK:
  CREATE INDEX idx_orders_user_id ON orders (user_id);
  CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);
  ```

- Use **covering indexes** to serve queries entirely from the index without heap access:

  ```sql
  -- Query: SELECT id, status, total FROM orders WHERE user_id = 123
  CREATE INDEX idx_orders_covering ON orders (user_id) INCLUDE (id, status, total);
  ```

- Use **expression indexes** for queries on computed values:

  ```sql
  CREATE INDEX idx_users_email_lower ON users (LOWER(email));
  -- Enables: WHERE LOWER(email) = LOWER($1) to use the index
  ```

- For text search, use **full-text search indexes** (`tsvector`/GIN in PostgreSQL, `FULLTEXT` in MySQL) — `LIKE '%term%'` cannot use standard B-tree indexes.
- Avoid **over-indexing**: each index incurs write-time overhead (every INSERT/UPDATE/DELETE updates all indexes). Use `EXPLAIN ANALYZE` to confirm index usage and remove unused indexes.

## 4. Schema Design

### Data Types

- Use appropriate data types:
  - `BIGINT` for surrogate IDs (or `UUID/CHAR(36)/BINARY(16)` for distributed systems)
  - `TIMESTAMPTZ` (PostgreSQL) for timestamps — always store in UTC with time zone
  - `BOOLEAN` for flags — not `TINYINT(1)` or `VARCHAR`
  - `NUMERIC(p, s)` or `DECIMAL(p, s)` for monetary amounts — never `FLOAT` or `DOUBLE`
  - `JSONB` (PostgreSQL) for semi-structured data that you need to query — not `TEXT`

### Constraints

- Always declare columns as `NOT NULL` unless they are genuinely optional. Nullable columns complicate queries, make index planning harder, and require three-valued logic in WHERE clauses.
- Define `FOREIGN KEY` constraints with explicit `ON DELETE`/`ON UPDATE` behavior:

  ```sql
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE RESTRICT    -- prevent deleting users with orders
    ON UPDATE CASCADE;    -- propagate user ID changes
  ```

- Use database-level **check constraints** for column-level domain rules:

  ```sql
  total    NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  quantity INT            NOT NULL CHECK (quantity > 0),
  status   VARCHAR(32)    NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled'))
  ```

### Migrations

- Use migrations for ALL schema changes. Commit migration scripts to version control. Never modify schema manually in production: Flyway, Liquibase, Alembic, `golang-migrate`, `dbmate`.

## 5. Transactions & Operations

### Transaction Management

- Wrap multi-step write operations in explicit transactions with proper error handling:

  ```sql
  BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = $1;
  UPDATE accounts SET balance = balance + 100 WHERE id = $2;
  COMMIT;  -- or ROLLBACK on error
  ```

- Keep transactions **as short as possible** to minimize lock contention. Never call external HTTP services, file I/O, or slow operations inside a transaction.

### Query Performance Analysis

- Use `EXPLAIN (ANALYZE, BUFFERS)` to investigate slow queries before adding indexes or rewriting:

  ```sql
  EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
  SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
  ```

  Look for: `Seq Scan` on large tables (may need an index), `Sort Method: external merge Disk` (memory issue), `Nested Loop` with large outer set (join order issue).
- Enable slow query logging: `log_min_duration_statement = 1000` (PostgreSQL) — logs queries over 1 second.
- Use `ANALYZE` (PostgreSQL) or `ANALYZE TABLE` (MySQL) after bulk loads to update planner statistics.
- In PostgreSQL, monitor dead tuples with `SELECT relname, n_dead_tup FROM pg_stat_user_tables ORDER BY n_dead_tup DESC` and tune `autovacuum` aggressively for frequently-updated tables.
