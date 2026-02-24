# Redis Development Guidelines

> Objective: Define standards for using Redis safely, efficiently, and consistently as a cache, session store, queue, or pub/sub broker.

## 1. Key Naming & Namespacing

- Use a consistent, hierarchical key naming convention with colons as separators: `{app}:{env}:{resource}:{id}` (e.g., `myapp:prod:user:1234:session`, `myapp:prod:product:cache:list`).
- Keep key names short but descriptive. Use prefixes to group related keys for batch operations (`SCAN MATCH myapp:session:*`).
- Avoid collisions: namespace keys by application, environment, and resource type to safely share a Redis instance across services.
- Document the key schema for each feature: key pattern, data type, TTL rule, and owner service.

## 2. Expiry (TTL) & Eviction

- **Always set a TTL** (`EX`, `PX`, `EXPIREAT`) on cache keys. Never store data with no expiry unless it is genuinely intended to persist indefinitely.
- Design for cache misses: the application MUST handle a missing cache key gracefully, falling back to the source of truth and repopulating the cache.
- Apply the **Cache-Aside** pattern: read from cache → miss → read from DB → write to cache. Use `SET key value EX ttl NX` (set-if-not-exists) to prevent cache stampedes.
- Configure an appropriate `maxmemory-policy` in `redis.conf`: use `allkeys-lru` for a pure cache, `volatile-lru` if only some keys have TTL.

## 3. Data Structure Selection

- Choose the right Redis data type for the use case:
  - **String**: Simple key-value, counters (`INCR`), session tokens, rate limit counts.
  - **Hash**: Object with multiple fields (e.g., user profile, config).
  - **List**: FIFO/LIFO queues (`LPUSH`/`RPOP`), recent activity feeds.
  - **Set**: Unique membership checks, tags, online users.
  - **Sorted Set**: Leaderboards, rate-limiting sliding windows, time-series indexing by score.
  - **Streams**: Persistent, consumer-group-based message queues (prefer over bare List for reliability).

## 4. Performance & Reliability

- Use **pipelining** to batch multiple Redis commands and reduce round-trip latency. Use transactions (`MULTI`/`EXEC`) only when atomicity is required.
- **Never use `KEYS *`** in production — it blocks the server event loop. Use `SCAN cursor MATCH pattern COUNT hint` for key iteration.
- Do not store large blobs (> 1MB) in Redis. It is an in-memory store — use object storage (S3) for large binary data and store only a reference in Redis.
- Enable **Redis Persistence**: use `RDB + AOF` (`appendonly yes`, `appendfsync everysec`) for crash recovery. For pure cache use, `RDB` snapshots alone may suffice.

## 5. Security & Operations

- Enable **AUTH** via an ACL user (`requirepass` is deprecated). Use **Redis ACLs** (Redis 6+) to grant minimal permissions (`~key:*`, `+get`, `+set`) per application user.
- Use **TLS** for all Redis connections in production. Disable Redis on public interfaces — bind to `127.0.0.1` or a private VLAN IP only.
- For high availability, use **Redis Sentinel** (failover) or **Redis Cluster** (horizontal shaling). Never rely on a standalone single node in production.
- Monitor with `redis-cli INFO stats`, `MONITOR` (development only), and `SLOWLOG GET 10` for slow commands. Export metrics to Prometheus using `redis_exporter`.
