# Redis Development Guidelines

> Objective: Define standards for using Redis safely, efficiently, and consistently as a cache, session store, or message broker.

## 1. Key Naming

- Use a consistent, hierarchical key naming convention with colons as separators: `{app}:{resource}:{id}` (e.g., `myapp:user:1234:session`, `myapp:product:cache:all`).
- Keep key names short but descriptive. Avoid generic names like `cache` or `data`.

## 2. Expiry (TTL)

- **Always set a TTL** (`EX`, `PX`, `EXPIREAT`) on cache keys. Never store data with no expiry unless it is explicitly intended to be permanent (e.g., a persistent counter).
- Design for cache misses: the application must handle a missing cache key gracefully and populate it from the source of truth.
- Use the **Cache-Aside** pattern: application reads from cache first, falls back to the database on miss, then writes to cache.

## 3. Data Structure Selection

- Choose the right data type for the use case:
  - **String**: Simple key-value, counters, session tokens.
  - **Hash**: Object with multiple fields (e.g., user profile).
  - **List**: FIFO/LIFO queues, timelines.
  - **Set**: Unique membership checks, tags.
  - **Sorted Set**: Leaderboards, rate-limiting windows, time-series indexing.
  - **Streams**: Persistent, consumer-group message queues.

## 4. Performance & Safety

- Use **pipelining** (`MULTI`/`EXEC` or pipeline commands) for batches of multiple Redis commands to reduce round-trip latency.
- Avoid `KEYS *` in production — it blocks the server. Use `SCAN` with a cursor for key iteration.
- Do not store large blobs (> a few MB) in Redis. It is an in-memory store; use object storage (S3) for large binary data.

## 5. Security

- Enable **AUTH** (require a password or ACL user). Never expose Redis directly to the internet.
- Use **TLS** for Redis connections in production.
- Use **ACLs** (Redis 6+) to grant minimal permissions per application user.
