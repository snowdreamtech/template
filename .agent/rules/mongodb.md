# MongoDB Development Guidelines

> Objective: Define standards for designing, querying, and maintaining MongoDB databases safely and efficiently.

## 1. Schema Design

- Even though MongoDB is schema-flexible, **define and enforce a schema** at the application level using a validation library (e.g., Mongoose, Zod, or MongoDB's built-in JSON Schema validation).
- Design schemas for your **query patterns**, not to mirror relational database tables. Embed related data when it is always read together; reference (use ObjectIds) when data is queried independently.
- Avoid unbounded arrays in documents (arrays that grow without limit). They cause performance issues and hit the 16MB document size limit.

## 2. Indexing

- Always create indexes for fields used in `.find()`, `.sort()`, and aggregation `$match` stages.
- Use **compound indexes** to support multi-field query patterns.
- Use `db.collection.explain("executionStats")` to verify queries use indexes and are not performing `COLLSCAN` (full collection scans) in production.
- Remove unused indexes — they consume memory and slow down writes.

## 3. Querying

- Use the **Aggregation Pipeline** for complex data processing and transformations instead of application-side post-processing.
- Project only the fields you need: `{ field1: 1, field2: 1, _id: 0 }`. Never return full documents when only a subset is needed.
- Use `countDocuments()` instead of `count()` (deprecated). Use `estimatedDocumentCount()` for fast approximate counts.

## 4. Security

- Never expose MongoDB directly to the internet. Always place it behind a private network or VPN.
- Enable **authentication** and use role-based access control (RBAC). Application users should have the minimum required roles.
- Sanitize all user input before using it in query operators to prevent **NoSQL injection** (e.g., `$where`, `$expr` with untrusted input).

## 5. Operations

- Enable **journaling** and take regular backups (`mongodump` or Atlas continuous backup).
- Monitor slow queries with the **MongoDB Profiler** (`db.setProfilingLevel(1, { slowms: 100 })`).
- Use **connection pooling** from the driver. Do not create a new connection per request.
