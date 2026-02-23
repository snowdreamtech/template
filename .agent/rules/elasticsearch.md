# Elasticsearch Development Guidelines

> Objective: Define standards for designing, querying, and operating Elasticsearch clusters efficiently and safely.

## 1. Index Design

- Design indexes around **query patterns**, not data storage. One index per entity type (e.g., `products`, `logs`, `articles`) is a common starting point.
- Define an explicit **mapping** for every index before indexing data. Avoid dynamic mapping in production — it can create unintended field types that cause errors at scale.
- Use `keyword` type for exact-match fields (IDs, status codes, tags) and `text` type for full-text search fields. Do not use `text` for filtering or aggregations.
- Use **Index Templates** or **Index Lifecycle Management (ILM)** for time-series indexes (e.g., logs): `logs-2026.02.23`, managed by ILM to roll over and delete old indexes automatically.

## 2. Querying

- Use the **Query DSL** via the official client library. Never build raw JSON query strings via string concatenation with user input.
- Prefer **`filter` context** over `query` context for exact matches and range queries — filter results are cached and faster.
- Use **`bool` query** to combine `must`, `should`, `filter`, and `must_not` clauses for complex search logic.
- Always paginate results. Avoid deep pagination (`from + size` > 10,000). Use **Search After** or **Scroll API** for large result sets.

## 3. Performance

- Define `_source` fields carefully. Exclude large, rarely-needed fields with `excludes` to reduce response size.
- Use **bulk API** (`_bulk`) for all batch indexing operations. Never index documents one at a time in a loop.
- Set appropriate `refresh_interval` (default `1s`). For bulk indexing, set it to `-1` (manual refresh) and restore after.
- Use **Aliases** to allow zero-downtime reindexing: point the alias at the old index, reindex into a new one, then swap the alias.

## 4. Security

- Enable **X-Pack Security** (TLS + authentication) in production. Never expose Elasticsearch directly to the internet.
- Use **role-based access control (RBAC)** for index and cluster permissions. Application accounts should only access their own indexes.

## 5. Operations

- Monitor cluster health with `_cluster/health` and node stats with `_nodes/stats`.
- Set **JVM heap** to no more than 50% of available RAM, and never exceed 32GB (to stay within JVM compressed oops).
- Use **Index Lifecycle Management** for log/time-series data rollover and deletion.
