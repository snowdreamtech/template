# Prisma ORM Development Guidelines

> Objective: Define standards for using Prisma safely and efficiently in TypeScript/Node.js projects.

## 1. Schema Design (`schema.prisma`)

- Define all models in `prisma/schema.prisma`. This is the **Single Source of Truth** for your database schema.
- Use `@id`, `@unique`, `@index`, and `@@index` decorators for all primary keys, unique constraints, and indexes. Do not manage indexes outside of the schema.
- Use `@default(now())` for `createdAt` and `@updatedAt` for `updatedAt` on all models.
- Use **enums** (Prisma `enum`) for fields with a fixed set of values instead of plain strings.
- Use `@relation` to define relationships explicitly. Always define both sides of a relation.

## 2. PrismaClient Usage

- Instantiate a **single `PrismaClient`** instance per application and reuse it. In development, use a module-level singleton pattern to avoid exhausting connections during hot-reload:
  ```ts
  // lib/prisma.ts
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- Always call `await prisma.$disconnect()` on process shutdown.

## 3. Querying

- Use `select` or `include` to limit fetched fields and relations — never return more data than needed.
- Use `findUniqueOrThrow` and `findFirstOrThrow` instead of `findUnique`/`findFirst` when the record must exist, to get automatic `PrismaClientKnownRequestError` on miss.
- Use Prisma's **type-safe `where` clauses**. Never use `$queryRaw` with user input — it bypasses type safety and risks SQL injection. If raw SQL is needed, always use tagged template literals: `prisma.$queryRaw\`SELECT \* FROM users WHERE id = ${id}\``.

## 4. Transactions

- Use `prisma.$transaction([...])` for sequential atomic operations.
- Use **interactive transactions** (`prisma.$transaction(async (tx) => { ... })`) for complex, conditional multi-step operations where you need logic between queries.

## 5. Migrations

- Use `prisma migrate dev` for development migrations (creates and applies migration files).
- Use `prisma migrate deploy` in CI/production (applies existing migrations only — never generates new ones).
- Commit all migration files in `prisma/migrations/` to version control.
- Never edit migration files after they have been applied.
