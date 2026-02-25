# MongoDB Development Guidelines

> Objective: Define standards for designing, querying, and maintaining MongoDB databases safely and efficiently, covering schema design, indexing, querying, security, and operations.

## 1. Schema Design

### Query-First Design

- Even though MongoDB is schema-flexible, **define and enforce a schema** at the application level using Mongoose, Zod + MongoDB JSON Schema validation, or MongoDB Atlas Schema Validation:

  ```javascript
  // MongoDB collection-level $jsonSchema validator
  db.createCollection("users", {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["email", "name", "role", "createdAt"],
        additionalProperties: false,
        properties: {
          _id: { bsonType: "objectId" },
          email: { bsonType: "string", pattern: "^.+@.+$", description: "Unique email address" },
          name: { bsonType: "string", minLength: 1, maxLength: 100 },
          role: { bsonType: "string", enum: ["admin", "editor", "viewer"] },
          createdAt: { bsonType: "date" },
          tags: { bsonType: "array", items: { bsonType: "string" }, maxItems: 20 },
        },
      },
    },
    validationAction: "error", // reject documents that fail validation
    validationLevel: "strict", // validate on all inserts and updates
  });
  ```

- Design schemas for your **access patterns (query-first design)** — not to mirror relational tables. Ask: "What queries will run most frequently on this data?"

### Embedding vs. References

- **Embed** related data when it is always read together, changes together, and has bounded size. Use **references** (ObjectIds + lookup) when:
  - The related data is very large or unbounded
  - The related data is accessed independently
  - The related data is shared across multiple parent documents
- Avoid **unbounded arrays** — arrays that grow without limit cause documents to exceed the 16MB document size limit and degrade performance:

  ```javascript
  // ❌ Unbounded array — grows forever, causes problems
  { userId: "123", orders: [/* hundreds of orders */] }

  // ✅ Separate collection with indexed reference
  // orders collection: { _id, userId, total, status, createdAt }
  // Query: db.orders.find({ userId: "123" }).sort({ createdAt: -1 }).limit(20)
  ```

- Use clear, descriptive field names. Avoid ambiguous abbreviations unless critical for storage savings in document-heavy workloads — document abbreviation schemes in the schema `description` field.

## 2. Indexing

### Index Design

- Create indexes for every field used in `.find()` filters, `.sort()`, Aggregation `$match`, and `$lookup` conditions. **Foreign key fields (reference ObjectIds) are especially important** to index — MongoDB does not create them automatically:

  ```javascript
  // Always index reference fields
  db.orders.createIndex({ userId: 1 });
  db.orders.createIndex({ status: 1 });

  // Compound index: match on status, sort by createdAt
  db.orders.createIndex({ status: 1, createdAt: -1 });

  // Unique constraint
  db.users.createIndex({ email: 1 }, { unique: true });

  // TTL index for auto-expiry
  db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  ```

- Use **compound indexes** to support multi-field query patterns. Field order matters — follow the ESR rule: **Equality** fields first, **Sort** fields second, **Range** fields last.
- Use `db.collection.explain("executionStats")` to verify queries use indexes. Alert on `COLLSCAN` in production hot paths — they are full collection scans:

  ```javascript
  db.orders.explain("executionStats").find({ userId: userId, status: "pending" });
  // Look for: winningPlan.stage === "IXSCAN" (good), "COLLSCAN" (bad)
  ```

- Use **sparse indexes** (`{ sparse: true }`) for optional fields that exist on only a subset of documents. Use **partial indexes** for more selective optimizations:

  ```javascript
  // Partial index — only indexes pending orders
  db.orders.createIndex({ createdAt: 1 }, { partialFilterExpression: { status: "pending" } });
  ```

- Remove unused indexes to free memory and reduce write overhead. Identify unused indexes with:

  ```javascript
  db.orders.aggregate([{ $indexStats: {} }]).filter((idx) => idx.accesses.ops === 0);
  ```

## 3. Querying

### Aggregation Pipeline

- Use the **Aggregation Pipeline** for complex data processing. Always place `$match` and `$limit` as early as possible to reduce documents flowing through subsequent pipeline stages:

  ```javascript
  db.orders.aggregate([
    // ✅ $match first — uses indexes, reduces flow
    { $match: { status: "completed", createdAt: { $gte: startDate } } },
    // ✅ $project early — reduces document size
    { $project: { userId: 1, total: 1, createdAt: 1 } },
    // $lookup only on reduced set
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $group: { _id: "$user.country", totalRevenue: { $sum: "$total" }, orderCount: { $sum: 1 } } },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
  ]);
  ```

### Cursor-Based Pagination

- Use **keyset/cursor pagination** for large result sets. Avoid large `skip()` values — they perform sequential scans and worsen linearly with page depth:

  ```javascript
  // ❌ Slow deep pagination — scans and discards all previous pages
  db.orders.find({ userId }).skip(10000).limit(20);

  // ✅ Keyset pagination — constant performance regardless of depth
  db.orders
    .find({ userId, _id: { $gt: lastSeenId } })
    .sort({ _id: 1 })
    .limit(20);
  ```

- Use `countDocuments({ filter })` for filtered counts. Use `estimatedDocumentCount()` for fast approximate collection size without filtering.
- Use **Change Streams** (`collection.watch()`) for real-time CDC (change data capture), cache invalidation, and audit logging in event-driven architectures:

  ```javascript
  const changeStream = db.collection("orders").watch([{ $match: { operationType: "insert", "fullDocument.status": "confirmed" } }]);
  changeStream.on("change", (event) => processNewOrder(event.fullDocument));
  ```

## 4. Security

### Access Control

- Never expose MongoDB directly to the internet. Place it behind a private VPC network, security groups, or a VPN. Port 27017 must never be publicly accessible.
- Enable **authentication** at the server level and use RBAC. Application users MUST have only the minimum required roles:

  ```javascript
  // Create restricted app user
  db.createUser({
    user: "app_service",
    pwd: passwordPrompt(),
    roles: [{ role: "readWrite", db: "myapp" }], // only one DB, no admin
  });
  ```

- Sanitize all user input before using it in query operators. Reject or strip values starting with `$` to prevent **NoSQL injection** via `$where`, `$expr`, `$regex`:

  ```javascript
  // ❌ NoSQL injection — malicious input: { "$where": "sleep(10000)" }
  db.users.find({ username: req.body.username });

  // ✅ Validated input via Zod or Mongoose schema
  const { username } = createUsernameSchema.parse(req.body);
  db.users.find({ username });
  ```

- Enable **TLS/SSL** for all connections in production. Use client certificate authentication for sensitive internal services.

## 5. Operations & Reliability

### Deployment & Backups

- **Minimum production deployment**: 3-node Replica Set (primary + 2 secondaries or 1 secondary + arbiter). Standalone MongoDB is never production-ready — no automatic failover.
- Use **MongoDB Atlas** for managed operations (automated backups, point-in-time recovery, auto-scaling, Atlas Search/Vector Search). For self-hosted, use continuous oplog tailing backup.
- Test backups with a monthly restore drill. An untested backup is not a backup.

### Performance Monitoring

- Enable the **MongoDB profiler** to log slow queries in development and staging:

  ```javascript
  db.setProfilingLevel(1, { slowms: 100 }); // log queries > 100ms
  db.system.profile.find().sort({ ts: -1 }).limit(20); // inspect slow queries
  ```

- Configure **connection pooling** from the driver. Do not create a new connection per request:

  ```javascript
  const client = new MongoClient(uri, {
    maxPoolSize: 50, // max simultaneous connections
    minPoolSize: 5, // keep warm connections
    maxIdleTimeMS: 60000, // close connections idle > 60s
    connectTimeoutMS: 5000,
  });
  ```

### Atlas Features

- Use **Atlas Search** (Lucene-based) for full-text search on MongoDB Atlas — avoids running a separate Elasticsearch cluster.
- Use **Atlas Vector Search** for semantic similarity search with embedding models — embed + search within the same database.
- Use **Atlas Device Sync** for mobile offline-first applications with automatic conflict resolution.
