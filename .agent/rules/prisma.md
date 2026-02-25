# Prisma ORM Development Guidelines

> Objective: Define standards for using Prisma safely and efficiently in TypeScript/Node.js projects, covering schema design, PrismaClient usage, querying, transactions, and migrations.

## 1. Schema Design (schema.prisma)

- `prisma/schema.prisma` is the **Single Source of Truth** for your database schema. It is a versioned contract between your application and the database — review it as carefully as you review migration SQL.
- Define all constraints (primary keys, unique constraints, indexes) through the schema file — never create ad-hoc indexes outside migrations:

  ```prisma
  model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String
    role      Role     @default(VIEWER)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    orders    Order[]

    @@map("users")                    // maps to snake_case DB table
    @@index([role, createdAt(sort: Desc)])   // composite index for filtered queries
  }

  enum Role {
    ADMIN
    EDITOR
    VIEWER
  }

  model Order {
    id       Int    @id @default(autoincrement())
    userId   Int
    status   OrderStatus @default(PENDING)
    total    Decimal @db.Decimal(10, 2)

    user     User @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@map("orders")
    @@index([userId, status])
  }
  ```

- Use `@default(now())` for `createdAt` and `@updatedAt` for `updatedAt` on all models — Prisma manages these automatically.
- Use Prisma **`enum`** types for fields with a fixed set of values — they are database-native and generate TypeScript union types automatically.
- Define **`@relation`** explicitly on both sides of a relation (including `fields:`, `references:`, `onDelete:`) to prevent Prisma from inferring incorrect foreign key configurations. Document cascade behavior in comments.
- Use **`@@map()`** / **`@map()`** to map PascalCase Prisma model/field names to snake_case database table/column names.

## 2. PrismaClient Configuration & Lifecycle

### Singleton Pattern

- Instantiate a **single `PrismaClient`** instance per application process. In frameworks with hot-reload (Next.js, Vite), use a module-level singleton to prevent exhausting the connection pool:

  ```typescript
  // lib/prisma.ts
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

  export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
  ```

### Graceful Shutdown

- Call `await prisma.$disconnect()` on process shutdown to cleanly release all connections:

  ```typescript
  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  ```

### Connection Pooling for Serverless

- In serverless/edge environments (Vercel, AWS Lambda, Cloudflare Workers), **traditional TCP connection pooling will exhaust database connections** as functions scale. Use:
  - **Prisma Accelerate** — Prisma's managed connection pool and edge cache proxy
  - **PgBouncer** — self-hosted connection pooler for PostgreSQL (`pgbouncer=true` in the connection string)
  - **`@prisma/adapter-neon`** — Neon serverless PostgreSQL with HTTP-based connections

### Extensions

- Use **`$extends`** (Prisma Client Extensions) to add custom query helpers, computed fields, and result transformations without losing type safety:

  ```typescript
  const prisma = new PrismaClient().$extends({
    result: {
      user: {
        fullName: {
          needs: { firstName: true, lastName: true },
          compute(user) {
            return `${user.firstName} ${user.lastName}`;
          },
        },
      },
    },
  });

  const user = await prisma.user.findFirst();
  console.log(user.fullName); // computed field, type-safe
  ```

## 3. Querying

### Selection & Over-fetching

- Always use **`select` or `include`** to limit fetched fields. Never over-fetch — returning more data than needed degrades performance and leaks sensitive fields:

  ```typescript
  // ❌ Over-fetching — returns all fields including hashed_password
  const user = await prisma.user.findFirst({ where: { id } });

  // ✅ Explicit selection — only fields the API response needs
  const user = await prisma.user.findFirst({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
  ```

- Use **`findUniqueOrThrow`** and **`findFirstOrThrow`** when the record is expected to exist. They throw `PrismaClientKnownRequestError` on miss rather than returning `null`:

  ```typescript
  const user = await prisma.user.findUniqueOrThrow({ where: { id } });
  // No null check needed — throws if not found
  ```

- Reuse query fragments via **composable `where` objects**:

  ```typescript
  const activeUserFilter = { deletedAt: null, isActive: true };
  const users = await prisma.user.findMany({ where: { ...activeUserFilter, role: "ADMIN" } });
  ```

### Raw Queries

- **Never use `$queryRaw` with string concatenation** — it bypasses type safety and risks SQL injection:

  ```typescript
  // ❌ SQL injection — never interpolate user input
  prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

  // ✅ Tagged template literal — auto-parameterized, safe
  prisma.$queryRaw<User[]>`SELECT * FROM users WHERE email = ${email}`;
  ```

## 4. Transactions

- Use **`prisma.$transaction([])`** for a list of independent operations that must all succeed or fail together:

  ```typescript
  const [post, notification] = await prisma.$transaction([prisma.post.create({ data: postData }), prisma.notification.create({ data: notifData })]);
  ```

- Use **interactive transactions** for complex conditional logic spanning multiple queries:

  ```typescript
  const result = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (user.credits < amount) throw new InsufficientCreditsError();
      await tx.user.update({ where: { id: userId }, data: { credits: { decrement: amount } } });
      return tx.order.create({ data: { userId, amount, status: "PAID" } });
    },
    { timeout: 5000 },
  ); // always set timeout to prevent lock hold
  ```

- Keep transactions **short and minimal** — long transactions hold database locks. Avoid N+1 queries inside transactions.
- Avoid nested transactions — Prisma does not support savepoints. Design transaction logic to be flat.

## 5. Migrations & Operations

### Migration Workflow

- Use **`prisma migrate dev`** during development (creates migration files, applies them, regenerates Prisma Client):

  ```bash
  prisma migrate dev --name add_user_preferences
  ```

- Use **`prisma migrate deploy`** in production CI/CD — applies pending migrations without generating new ones:

  ```bash
  # In CI before starting the application:
  prisma migrate deploy && node dist/server.js
  ```

- Commit all `prisma/migrations/` files to version control. **Never edit a migration file** after it has been applied to any environment — create a new migration instead.
- Use **`prisma migrate status`** in startup health checks to verify migrations are applied before the application serves traffic.

### Seeding & Testing

- Use **`prisma db seed`** with `prisma/seed.ts` for reference/fixture data in staging. Define the seed command in `package.json`:

  ```json
  { "prisma": { "seed": "ts-node prisma/seed.ts" } }
  ```

- In tests, use **Testcontainers** to spin up an isolated database instance per test suite:

  ```typescript
  const container = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = container.getConnectionUri();
  ```

- Alternatively, use `prisma.$transaction` with `rollback` or reset the database between test runs with `prisma migrate reset --force --skip-seed` in CI.
