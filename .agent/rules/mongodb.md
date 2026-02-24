# MongoDB Development Guidelines

> Objective: Define standards for designing, querying, and maintaining MongoDB databases safely and efficiently.

## 1. Schema Design

- Even though MongoDB is schema-flexible, **define and enforce a schema** at the application level using Mongoose, Zod, or MongoDB's built-in **JSON Schema Validation** (`$jsonSchema` validator on collections).
- Design schemas for your **access patterns (query-first design)**, not to mirror relational tables. Embed related data when always read together; use references (ObjectIds) when accessed independently.
- Avoid **unbounded arrays** in documents — arrays that grow without limit cause performance issues and risk hitting the 16MB document size limit.
- Use **field name abbreviations** (e.g., `ts` instead of `timestamp`) only when storage savings are critical. Otherwise, use clear, descriptive field names.

## 2. Indexing

- Create indexes for every field used in `.find()` filters, `.sort()` calls, and Aggregation Pipeline `$match` stages.
- Use **compound indexes** to support multi-field query patterns. Field order in a compound index matters: match fields go first, sort fields go last.
- Use `db.collection.explain("executionStats")` to verify queries use indexes and avoid `COLLSCAN` (full collection scans) in production hot paths.
- Use **sparse indexes** (`sparse: true`) for fields that exist on only a subset of documents. Use **partial indexes** with filter expressions for more fine-grained optimization.
- Remove unused indexes — they consume memory and slow down all write operations.

## 3. Querying

- Use the **Aggregation Pipeline** (`$match`, `$group`, `$lookup`, `$project`, `$sort`) for complex data processing. Avoid application-side post-processing of large result sets.
- Project only the fields you need: `{ field1: 1, field2: 1, _id: 0 }`. Never return full documents when only a subset is needed.
- Use `countDocuments({ filter })` instead of the deprecated `count()`. Use `estimatedDocumentCount()` for fast approximate counts without filter criteria.
- For cursor-based pagination, use range queries on an indexed field: `{ _id: { $gt: lastId } }` with a `LIMIT`. Avoid large `skip()` values — they scan and discard documents.

## 4. Security

- Never expose MongoDB directly to the internet. Place it behind a private network, VPN, or security group.
- Enable **authentication** and use RBAC (role-based access control). Application users MUST have only the minimum required roles (`readWrite` on a specific database, not `root`).
- Sanitize all user input before using it in query operators to prevent **NoSQL injection** via operators like `$where`, `$expr`, `$regex` with untrusted input.
- Enable **TLS/SSL** for all MongoDB connections in production. Use client certificate authentication for sensitive internal services.

## 5. Operations & Reliability

- Enable **journaling** for durability. Use **Replica Sets** (minimum 3 members with a primary, secondary, and arbiter) for production deployments — standalone MongoDB is not production-ready.
- Use **Atlas continuous backup** or `mongodump`/`mongorestore` with a tested restore procedure. Verify backups monthly.
- Monitor slow operations: enable the **MongoDB Profiler** (`db.setProfilingLevel(1, { slowms: 100 })`) to log queries exceeding 100ms.
- Use **connection pooling** from the driver (Mongoose, the official Node.js/Python/Go driver). Configure `maxPoolSize` appropriate to your load. Do not create a new connection per request.
- Run `db.runCommand({ currentOp: 1, active: true })` to inspect long-running operations. Use `db.killOp(opId)` for runaway queries.
