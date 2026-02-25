# Redis Development Guidelines

> Objective: Define standards for using Redis safely, efficiently, and consistently as a cache, session store, message queue, rate limiter, or pub/sub broker, covering key design, TTL management, data structures, performance, and security.

## 1. Key Naming & Namespacing

- Use a consistent, hierarchical key naming convention with colons (`:`) as separators. Establish one pattern for the entire project and document it:

  ```text
  Pattern: {app}:{env}:{service}:{resource}:{id}[:{qualifier}]

  Examples:
    myapp:prod:users:1234:session         # user session data
    myapp:prod:products:cache:list        # product list cache
    myapp:prod:auth:rate:192.168.1.1      # IP-based rate limit
    myapp:prod:jobs:email:queue           # email job queue
    myapp:prod:leaderboard:weekly         # weekly score sorted set
  ```

- Keep key names short but descriptive. Long keys consume memory and slow operations — avoid UUIDs with dashes; use compact identifiers where possible.
- Namespace keys by application, environment, and service when **sharing a Redis instance** across services. Never let two services use the same key patterns without coordination.
- Document the **key schema** for each feature in code or a schema registry file: key pattern, data type, TTL, owning service, and semantics of each field.
- Use the `{hash-tag}` syntax (`{user:1234}:sessions`) for Redis Cluster to force related keys to the same hash slot when Multi-key operations across keys are needed.

## 2. Expiry (TTL) & Cache Patterns

### TTL Rules

- **Always set a TTL** (`EX seconds`, `PX milliseconds`, `EXAT timestamp`) on cache keys. Store data indefinitely only when it is genuinely permanent and externally managed:

  ```bash
  SET user:123:session "{...}" EX 3600        # 1 hour
  SET product:456:detail "{...}" EX 86400     # 24 hours
  SETEX rate:192.168.1.1 60 1                 # 60 seconds
  ```

- Design for **cache misses** — the application MUST handle a missing key gracefully, fall back to the source of truth, and repopulate the cache. Treat cache as an optional performance layer.

### Cache-Aside (Lazy Loading)

- Use the **Cache-Aside pattern** (recommended default):

  ```python
  async def get_user(user_id: str) -> User:
      cached = await redis.get(f"user:{user_id}")
      if cached:
          return User.parse_raw(cached)

      user = await db.users.find_by_id(user_id)
      if user:
          await redis.set(f"user:{user_id}", user.json(), ex=3600)
      return user
  ```

### Cache Stampede Prevention

- Use **`SET NX`** (set-if-not-exists) combined with a lock key to prevent cache stampedes under high traffic:

  ```bash
  SET cache:products:list "{...}" EX 3600 NX  # only set if not exists
  ```

  Or implement probabilistic early expiration: recompute the cache before it expires (e.g., recompute when TTL < 20% of original) to avoid synchronous misses.
- Configure an appropriate **eviction policy** in `redis.conf` based on use case:
  - `allkeys-lru` — pure cache; evict least recently used keys when memory full
  - `volatile-lru` — only evict keys with TTL set (mix of cache + permanent data)
  - `noeviction` — return error when memory full (databases, queues — not for caches)

## 3. Data Structure Selection

Choose the **most specific Redis data type** for each use case — it determines memory efficiency, operation semantics, and available commands:

| Structure | Commands | Best for |
| ----------------- | ---------------------------------- | --------------------------------------------------------- |
| **String** | `GET`, `SET`, `INCR`, `INCRBY` | Simple K-V, counters, session tokens, rate limit counts |
| **Hash** | `HGET`, `HSET`, `HMGET`, `HGETALL` | Object with multiple fields (user profile, config) |
| **List** | `LPUSH`, `RPOP`, `LRANGE`, `LLEN` | FIFO queues, recent activity feeds, chat history |
| **Set** | `SADD`, `SISMEMBER`, `SMEMBERS` | Unique membership, tags, online users, blacklists |
| **Sorted Set** | `ZADD`, `ZRANGEBYSCORE`, `ZRANK` | Leaderboards, rate-limit sliding windows, priority queues |
| **Stream** | `XADD`, `XREAD`, `XREADGROUP` | Reliable, persistent, consumer-group message queues |
| **String + JSON** | `JSON.SET`, `JSON.GET` | Complex objects (with RedisJSON module) |

- Prefer **Streams** over bare Lists for message queues when **at-least-once delivery** and consumer acknowledgment are required. Streams support consumer groups, acknowledgment, and replay.
- Use **Hash** to store object data instead of `SET user:123 <entire json>` when only a few fields are needed at a time — `HMGET user:123 name email` is more efficient than parsing the full JSON.
- Use **Sorted Sets** for sliding window rate limiting:

  ```bash
  # Sliding window — add current request timestamp (score = epoch ms)
  ZADD rate:user:123 1700000000000 "req-uuid-1"
  # Remove old requests outside the window
  ZREMRANGEBYSCORE rate:user:123 -inf 1699999940000   # older than 60s
  # Count remaining
  ZCARD rate:user:123
  ```

## 4. Performance & Reliability

### Command Best Practices

- Use **pipelining** to batch multiple Redis commands in a single roundtrip — reduces latency dramatically for bulk operations:

  ```python
  async with redis.pipeline(transaction=False) as pipe:
      pipe.get("user:1")
      pipe.get("user:2")
      pipe.incr("counter:daily")
      user1, user2, daily = await pipe.execute()
  ```

- Use **`MULTI`/`EXEC`** (transactions) only when atomicity is required — they disable pipelining during transaction execution.
- **Never use `KEYS *`** in production — it blocks the server event loop and can kill latency for all other clients. Use `SCAN` with `MATCH` and `COUNT` for key iteration:

  ```bash
  # Paginated key scan — does NOT block the server
  SCAN 0 MATCH "myapp:cache:*" COUNT 100
  ```

- Do NOT store large blobs (> 1MB) in Redis. It is an in-memory store — use object storage (S3, GCS, R2) for large binary data and store a reference URL or key in Redis.
- Use **Lua scripts** (`EVAL` / `EVALSHA`) for complex atomic multi-command operations that must be race-condition-free:

  ```lua
  -- Atomic check-and-decrement for rate limiting
  local remaining = redis.call('DECR', KEYS[1])
  if remaining < 0 then
    redis.call('SET', KEYS[1], '0')
    return -1  -- rate limited
  end
  return remaining
  ```

  Cache scripts with `SCRIPT LOAD` → `EVALSHA` to avoid resending the script body on every call.

### Persistence & Reliability

- Enable **RDB + AOF** persistence for data that must survive restarts:
  - `save 900 1` (RDB snapshot) for periodic disaster recovery
  - `appendonly yes` + `appendfsync everysec` for durability (at most 1 second of data loss)
  - For pure caches, RDB snapshots alone may be sufficient.
- Use **Redis Sentinel** (Redis 6+, automatic failover, < 10GB dataset) or **Redis Cluster** (horizontal sharding, > 10GB dataset) for production high availability. Never run a single standalone Redis node in production.
- Implement **client-side retry logic** with exponential backoff for connection errors. Use connection pools. Redis client libraries (ioredis, redis-py) provide connection pooling automatically.

## 5. Security & Observability

### Security

- Enable **Redis AUTH** using ACL users (Redis 6+ ACL system — `requirepass` alone is deprecated for fine-grained access):

  ```bash
  # redis.conf
  ACL SETUSER appuser on >s3cr3tpass ~myapp:* +get +set +del +expire +exists +scan resetkeys
  ```

  Grant each application the **minimum required ACL permissions** — specific key patterns and command sets only.
- Use **TLS** for all Redis connections in production. Disable Redis on public interfaces — bind to `127.0.0.1` or a private VLAN IP:

  ```bash
  bind 127.0.0.1 -::1    # only local and private
  tls-port 6380
  tls-cert-file /etc/tls/redis.crt
  ```

- Disable dangerous commands in production via ACL (`-flushall`, `-flushdb`, `-config`, `-debug`). Log all admin commands.

### Monitoring & Observability

- Monitor with `redis_exporter` for Prometheus metrics and Grafana dashboards. Key metrics to alert on:

  | Metric | Alert threshold |
  |---|---|
  | `redis_connected_clients` | > 80% of `maxclients` |
  | `redis_memory_used_bytes` | > 80% of `maxmemory` |
  | `redis_keyspace_misses_total` | > 20% miss rate (cache efficiency) |
  | `redis_slowlog_length` | > 10 entries (commands > 10ms) |
  | `redis_repl_backlog_active` | lag > 5 seconds |

- Check `SLOWLOG GET 10` regularly for commands exceeding the slow log threshold (default: 10ms). Investigate commands with > 100ms execution time.
- **Never use `MONITOR` in production** — it publishes every command to a subscriber and can reduce throughput by 50% or more.
- Use **RedisBloom** module for memory-efficient probabilistic use cases:
  - `BF.ADD`/`BF.EXISTS` — Bloom filter for cache-miss protection (never query the DB for non-existent keys)
  - `HLL` commands (`PFADD`, `PFCOUNT`) — HyperLogLog for approximate cardinality (unique visitors, event counts) with < 1% error rate and constant memory usage
