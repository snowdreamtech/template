# Elasticsearch Development Guidelines

> Objective: Define standards for designing, querying, and operating Elasticsearch clusters efficiently and safely.

## 1. Index Design & Mapping

- Design indexes around **query patterns**, not data structure. Understand how data will be searched and aggregated before defining the mapping.
- Define an **explicit mapping** for every index before indexing data. Avoid `dynamic: true` mapping in production — it silently creates field types that are often wrong, cause errors at scale, and are hard to fix without reindexing.
- Use `keyword` for exact-match fields (IDs, status codes, tags, enum values — used in filters and aggregations). Use `text` for full-text search fields. Never use `text` for filtering or aggregations.
- Use **multi-fields** to index the same field as both `text` (for search) and `keyword` (for aggregation/sorting): `{ "type": "text", "fields": { "keyword": { "type": "keyword" } } }`.
- Use **Index Templates** and **Index Lifecycle Management (ILM)** for time-series data (logs, events): define rollover policies (by size/age) and delete old indices automatically.
- Use `dense_vector` field type with `knn` queries (Elasticsearch 8.x) for **semantic search** and similarity search. Pair with a text-embedding model (Vertex AI, OpenAI, ELSER) to enable hybrid BM25 + vector scoring pipelines.

## 2. Querying

- Use the **Query DSL** via the official client library. Never build raw JSON query strings via string concatenation with user input.
- Prefer **`filter` context** over `query` context for exact matches, range queries, and term-level queries — filter results are cached and do not affect relevance score.
- Use **`bool` query** to combine `must`, `should`, `filter`, and `must_not` clauses for complex search logic.
- Always **paginate results**. Avoid deep `from + size` pagination beyond 10,000 hits. Use **Search After** (stateless, production-grade) or **Scroll API** (for bulk export) for large result sets.

## 3. Performance

- Use the **bulk API** (`/_bulk`) for all batch indexing. Never index documents one by one in a loop — it has extreme overhead.
- For large reindex operations, temporarily set `refresh_interval: "-1"` (disable auto-refresh) and `number_of_replicas: 0` on the target index, then restore after indexing is complete.
- Use **Index Aliases** to enable zero-downtime reindexing: point the read alias at the old index, reindex into a new one, then atomically swap the alias with a single `_aliases` API call.
- Define `_source` includes/excludes to avoid returning large, unused fields in search responses. Use `stored_fields` for accessing individual fields without loading the entire `_source`.

## 4. Security

- Enable **TLS + authentication** (X-Pack Security / Elastic Stack Security) in production. Never expose Elasticsearch directly to the internet without authentication.
- Use **Role-Based Access Control (RBAC)** for index and cluster permissions. Application accounts should have access only to their own indexes.
- Sanitize all user input before including it in Query DSL — especially in `query_string` and `simple_query_string` queries, which support Lucene syntax and can expose data if misconfigured.

## 5. Operations & Reliability

- Monitor cluster health with `GET /_cluster/health`. Alert on `yellow` status (unassigned replica shards) and page on `red` status (unassigned primary shards = potential data loss).
- Set **JVM heap** to no more than 50% of available RAM, and never exceed 31GB (JVM compressed ordinary object pointer limit — beyond 32GB, pointer size doubles and performance degrades).
- Design for the **split-brain problem**: use an odd number of master-eligible nodes and set `cluster.initial_master_nodes`. Use **dedicated master nodes** for clusters with more than 5 data nodes.
- Use **Curator** or **ILM** to manage index lifecycle (rollover, shrink, delete). Never manually retire time-series indices without an automated policy.
- Use **Snapshot Lifecycle Management (SLM)** to automate regular snapshots to a repository (S3, GCS, Azure). Test snapshot restore regularly — an unverified backup is not a backup.
