# Prisma ORM Development Guidelines

> Objective: Define standards for using Prisma safely and efficiently in TypeScript/Node.js projects.

## 1. Schema Design (`schema.prisma`)

- Define all models in `prisma/schema.prisma`. This is the **Single Source of Truth** for your database schema and a versioned contract between your application and the database.
- Use `@id`, `@unique`, `@index`, and `@@index` decorators for primary keys, unique constraints, and indexes. Manage all indexes through the schema file — never create ad-hoc indexes outside of migrations.
- Use `@default(now())` for `createdAt` and `@updatedAt` for `updatedAt` on all models. These are automatically managed by Prisma.
- Use Prisma **`enum`** for fields with a fixed set of values. Enums are database-native and type-safe — prefer them over plain string fields.
- Define `@relation(fields: [...], references: [...])` explicitly on both sides of a relation to avoid Prisma inferring incorrect foreign key names.
- Use `@@map("table_name")` to map model names to database-native snake_case table names when the model is PascalCase.

## 2. PrismaClient Usage

- Instantiate a **single `PrismaClient`** per application. Use a module-level singleton to avoid exhausting database connections during hot-reload in development:

  ```ts
  // lib/prisma.ts
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

- Call `await prisma.$disconnect()` on process shutdown (`SIGTERM`, `SIGINT`) to cleanly release all connections.
- Use **Prisma Accelerate** (connection pooling proxy) or **PgBouncer** in front of PostgreSQL for serverless/edge environments where many short-lived connections would be created.
- Use `$extends` (Prisma Client Extensions) to add custom query helpers, computed fields, and result transformations without breaking type safety.

## 3. Querying

- Use `select` or `include` to limit fetched fields and relations. **Never over-fetch** — returning more data than needed is a common Prisma anti-pattern that degrades performance.
- Use **`findUniqueOrThrow`** and **`findFirstOrThrow`** instead of `findUnique`/`findFirst` when the record must exist. These throw `PrismaClientKnownRequestError` on miss rather than returning `null`.
- Never use `$queryRaw` with string concatenation — it bypasses type safety and risks SQL injection. Use tagged template literals: ``prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}` ``.
- Use `prisma.$queryRawUnsafe()` only as a last resort when template tag syntax is insufficient. Always use parameterized values.

## 4. Transactions

- Use `prisma.$transaction([...])` for sequential, atomic operations across multiple models.
- Use **interactive transactions** (`prisma.$transaction(async (tx) => { ... })`) for complex conditional logic between queries within a single atomic operation.
- Set a `timeout` on interactive transactions in production to prevent long-running transactions holding database locks: `prisma.$transaction(async (tx) => { ... }, { timeout: 5000 })`.
- Avoid nested transactions — Prisma does not support savepoints. Design transactions to be flat and minimal.

## 5. Migrations

- Use `prisma migrate dev` for development (creates migration files and applies them, regenerates Prisma Client).
- Use `prisma migrate deploy` in CI/production — it applies pending migrations only, never generates new ones. No prompt, safe for automation.
- Commit all migration files in `prisma/migrations/` to version control. **Never edit a migration file after it has been applied to any environment.**
- Use `prisma migrate status` in CI health checks to verify that all migrations are applied before starting the application.
- Use `prisma db seed` with a `prisma/seed.ts` file for seeding reference data. Run it after `migrate deploy` in staging environments.
