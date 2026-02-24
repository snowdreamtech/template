# Prisma ORM Development Guidelines

> Objective: Define standards for using Prisma safely and efficiently in TypeScript/Node.js projects.

## 1. Schema Design (`schema.prisma`)

- Define all models in `prisma/schema.prisma`. This is the **Single Source of Truth** for your database schema and a versioned contract.
- Use `@id`, `@unique`, `@index`, and `@@index` decorators for primary keys, unique constraints, and indexes. Manage all indexes through the schema.
- Use `@default(now())` for `createdAt` and `@updatedAt` for `updatedAt` on all models.
- Use Prisma **`enum`** for fields with a fixed set of values. Enums are database-native and type-safe.
- Define `@relation(fields: [...], references: [...])` explicitly on both sides of a relation to avoid Prisma inferring incorrect foreign key names.

## 2. PrismaClient Usage

- Instantiate a **single `PrismaClient`** per application. Use a module-level singleton to avoid exhausting connections during hot-reload in development:
  ```ts
  // lib/prisma.ts
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- Call `await prisma.$disconnect()` on process shutdown (`SIGTERM`, `SIGINT`).
- Use **Prisma Accelerate** (connection pooling) or **PgBouncer** in front of PostgreSQL for serverless/edge environments where many short-lived connections would be created.

## 3. Querying

- Use `select` or `include` to limit fetched fields and relations. **Never return more data than needed** — over-fetching is a common Prisma anti-pattern.
- Use **`findUniqueOrThrow`** and **`findFirstOrThrow`** instead of `findUnique`/`findFirst` when the record must exist. These throw `PrismaClientKnownRequestError` on miss rather than returning `null`.
- Never use `$queryRaw` with string concatenation — it bypasses type safety and risks SQL injection. Use tagged template literals: `` prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}` ``.

## 4. Transactions

- Use `prisma.$transaction([...])` for sequential, atomic operations across multiple models.
- Use **interactive transactions** (`prisma.$transaction(async (tx) => { ... })`) for complex conditional logic between queries within a single atomic operation.
- Set a `timeout` on interactive transactions in production to prevent long-running transactions holding locks.

## 5. Migrations

- Use `prisma migrate dev` for development (creates and applies migration files, regenerates the Prisma Client).
- Use `prisma migrate deploy` in CI/production — it applies existing migrations only, never generates new ones.
- Commit all migration files in `prisma/migrations/` to version control. **Never edit a migration file after it has been applied.**
- Use `prisma migrate status` in CI to verify that all migrations are applied before starting the application.
