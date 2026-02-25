# Elasticsearch Development Guidelines

> Objective: Define standards for designing, querying, and operating Elasticsearch clusters efficiently and safely, covering index mapping, query DSL, performance, security, and cluster operations.

## 1. Index Design & Mapping

### Explicit Mapping

- Design indexes around **query patterns** first — understand how data will be searched and aggregated before defining the mapping. Index structure should match access patterns, not source data structure.
- Define an **explicit mapping for every index** before ingesting data. Disable or restrict `dynamic: strict` mapping in production — dynamic mapping silently creates wrong field types (e.g., interpreting a numeric string as `long`) that are hard to fix without full reindexing:
  ```json
  PUT /orders
  {
    "mappings": {
      "dynamic": "strict",
      "properties": {
        "order_id":   { "type": "keyword" },
        "user_id":    { "type": "keyword" },
        "status":     { "type": "keyword" },
        "total":      { "type": "double" },
        "created_at": { "type": "date", "format": "strict_date_optional_time" },
        "description":{ "type": "text", "analyzer": "english",
                        "fields": { "keyword": { "type": "keyword", "ignore_above": 256 } } }
      }
    }
  }
  ```
- Field type selection:
  - **`keyword`**: exact-match fields — IDs, status codes, tags, enum values, used in filters (`term`), aggregations (`terms agg`), and sorting
  - **`text`**: full-text search fields — product descriptions, comments, titles. Never use `text` for filtering or aggregations
  - **`long`/`double`/`scaled_float`**: numeric fields; use `scaled_float` for financial amounts (`scaling_factor: 100`)
  - **`date`**: timestamps with ISO 8601 format
  - **`dense_vector`**: embedding vectors for semantic/nearest-neighbor search
- Use **multi-fields** to index the same field both as `text` (for full-text search) and as `keyword` (for exact filtering and aggregations):
  ```json
  "title": {
    "type": "text",
    "analyzer": "english",
    "fields": {
      "keyword": { "type": "keyword", "ignore_above": 512 }
    }
  }
  ```
- Use **Index Templates** and **Component Templates** to apply consistent mapping across multiple auto-created indexes (e.g., time-series log/event indexes with date patterns: `logs-app-2025.01.15`).
- Use **Index Lifecycle Management (ILM)** for time-series data: define rollover (by age/size), shrink, warm, cold, and delete phases to automatically tier data and manage storage cost.

### Vector Search (Elasticsearch 8.x+)

- Use **`dense_vector`** field type with `knn` queries for semantic search and similarity search. Pair with a text-embedding model (ELSER, Vertex AI, OpenAI) to enable hybrid BM25 + vector scoring:
  ```json
  "knn": {
    "field":          "content_embedding",
    "query_vector":   [0.1, 0.2, ...],
    "k":              10,
    "num_candidates": 100
  }
  ```

## 2. Querying

### Query DSL

- Use the **Query DSL via official client libraries**. Never build raw JSON query strings via string concatenation with user input — it risks query injection:

  ```python
  # Python — using official elasticsearch-py client
  from elasticsearch import Elasticsearch

  client = Elasticsearch(hosts=ES_HOSTS, api_key=API_KEY)

  response = client.search(
    index="orders",
    body={
      "query": {
        "bool": {
          "filter": [
            {"term":  {"status": "pending"}},
            {"range": {"created_at": {"gte": "now-7d/d"}}},
          ],
          "must": [
            {"match": {"description": search_query}},
          ]
        }
      },
      "sort":  [{"created_at": "desc"}],
      "_source": ["order_id", "user_id", "status", "total", "created_at"],
      "size":  20,
    }
  )
  ```

- Prefer **`filter` context** over `query` context for binary match conditions (term, range, exists). Filter results are **cached** by Elasticsearch and do NOT affect the relevance `_score`:
  ```json
  {
    "bool": {
      "filter": [              ← cached, no scoring — for exact matches
        { "term": {"status": "active"} },
        { "range": {"price": {"lte": 100}} }
      ],
      "must": [                ← scored — for full-text relevance
        { "match": {"title": "running shoes"} }
      ]
    }
  }
  ```
- Always **paginate results**. Avoid deep `from + size` pagination beyond 10,000 total hits (default `index.max_result_window`). Use:
  - **`search_after`** (stateless, production-grade) for deep pagination with a sort cursor
  - **`scroll` API** for batch export/migration (not for real-time search)
  - **PIT (Point in Time)** + `search_after` for consistent pagination across concurrent writes

## 3. Performance

### Bulk Indexing

- Use the **bulk API** (`/_bulk`) for all batch document indexing. Never index documents one-at-a-time in loops — single-document PUT has extreme per-request overhead:

  ```python
  from elasticsearch.helpers import bulk

  def generate_actions(documents):
    for doc in documents:
      yield { "_index": "orders", "_id": doc["id"], "_source": doc }

  bulk(client, generate_actions(documents), chunk_size=500, request_timeout=60)
  ```

  Target bulk request size: 5-15MB per request, 200-1000 documents per batch (profile for your data size).

### Reindexing

- For large reindex operations, optimize for write speed:

  ```json
  PUT /new-index/_settings
  { "index": { "refresh_interval": "-1", "number_of_replicas": 0 } }

  // Run reindex...
  POST /_reindex { "source": {"index": "old-index"}, "dest": {"index": "new-index"} }

  // Restore after completion
  PUT /new-index/_settings
  { "index": { "refresh_interval": "1s", "number_of_replicas": 1 } }
  ```

- Use **Index Aliases** to enable zero-downtime reindexing. Point the read alias at the old index, reindex into a new index, then atomically swap:
  ```json
  POST /_aliases
  {
    "actions": [
      { "remove": { "index": "orders-v1", "alias": "orders" } },
      { "add":    { "index": "orders-v2", "alias": "orders" } }
    ]
  }
  ```

### Source & Field Selection

- Define `_source` includes/excludes to avoid returning large, unused fields in search responses:
  ```json
  "_source": { "includes": ["id", "name", "price", "status"] }
  ```

## 4. Security

### Cluster Authentication & Authorization

- Enable **TLS + authentication** (Elastic Stack Security, X-Pack) in all environments including development and staging. Never expose Elasticsearch directly to the internet without authentication.
- Use **Role-Based Access Control (RBAC)** with minimal privilege:

  ```json
  PUT /_security/role/app_read_only
  {
    "indices": [{ "names": ["orders*"], "privileges": ["read"] }]
  }

  // Application users get only read on their indexes
  PUT /_security/user/app_service
  { "roles": ["app_read_only"], "password": "..." }
  ```

- Sanitize all user input before embedding it in Query DSL. Be especially careful with `query_string` and `simple_query_string` queries — Lucene query syntax allows wildcard (`*`), field-level queries, and fuzzy matching that can expose data or degrade performance if user input is unescaped.

### Network Security

- Never expose port 9200 (HTTP) or 9300 (transport) to the public internet. Access should be restricted to internal VPC networks.
- Use an API gateway or reverse proxy (nginx, HAProxy) for external access. Enable firewall rules limiting Elasticsearch ports to specific internal CIDR ranges.

## 5. Operations & Reliability

### Cluster Health & JVM

- Monitor cluster health with `GET /_cluster/health`. Alert on:
  - **`yellow`** — unassigned replica shards (degraded — no redundancy)
  - **`red`** — unassigned primary shards (critical — potential data loss, query failures)
- Set **JVM heap** to no more than **50% of available RAM**, and never exceed **31 GB** — beyond 32 GB, JVM compressed ordinary object pointer (OOP) optimization is disabled and pointer sizes double, degrading performance significantly:
  ```bash
  # jvm.options
  -Xms24g
  -Xmx24g   # never exceed 31g
  ```

### High Availability

- Design for split-brain prevention: use an **odd number of master-eligible nodes** (3 or 5). Set `cluster.initial_master_nodes` explicitly. Use **dedicated master nodes** for clusters with more than 5 data nodes.
- Set shard counts appropriately: target 10-50 GB per shard. Avoid over-sharding (hundreds of tiny shards) — it creates overhead. Use `_shrink` API to merge shards after rollover for cold data.

### Backup & Lifecycle

- Use **Snapshot Lifecycle Management (SLM)** to automate regular snapshots to an external repository (S3, GCS, Azure Blob). Test snapshot restores regularly — an untested backup is not a backup:
  ```json
  PUT /_slm/policy/daily-snapshots
  {
    "schedule":   "0 0 2 * * ?",   // 2am daily
    "name":       "<snapshot-{now/d}>",
    "repository": "s3-backup",
    "retention":  { "expire_after": "30d", "min_count": 5, "max_count": 50 }
  }
  ```
- Use **ILM** or **Curator** to manage time-series index lifecycle (hot → warm → cold → delete). Do not rely on manual index deletion.
