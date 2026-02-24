# tRPC Development Guidelines

> Objective: Define standards for building end-to-end type-safe APIs with tRPC in TypeScript projects.

## 1. Overview & When to Use

- **tRPC** eliminates API contract duplication by sharing TypeScript types directly between server and client. It is ideal for **monorepos or full-stack TypeScript projects** where server and client are developed together.
- Do **not** use tRPC for public APIs that need to be consumed by non-TypeScript clients or third parties — use REST/OpenAPI or GraphQL instead.
- tRPC is not a REST API and does not generate standard HTTP endpoints. Do not use it if you need to expose a stable, versioned public API surface.

## 2. Router Definition

- Define all procedures in typed **routers**. Group related procedures into sub-routers and merge into `appRouter`:
  ```ts
  export const appRouter = router({
    user: userRouter,
    post: postRouter,
  });
  export type AppRouter = typeof appRouter;
  ```
- Export only the `AppRouter` **type** to the client package — never the router implementation. This ensures zero runtime coupling between server and client bundles.

## 3. Procedures & Middleware

- Use **`query`** for read operations (GET semantics) and **`mutation`** for write operations. Use **`subscription`** for real-time updates via WebSockets.
- Validate all inputs with **Zod** schemas in the `.input()` method. Validation is enforced at runtime and infers TypeScript types at compile-time:
  ```ts
  .input(z.object({ id: z.string().uuid() }))
  ```
- Use **middleware** (`.use()`) for cross-cutting concerns: authentication (`isAuthed`), rate limiting, logging, and caching.
- Chain middleware: create a `publicProcedure`, then a `protectedProcedure = publicProcedure.use(isAuthed)`, then `adminProcedure = protectedProcedure.use(isAdmin)`.

## 4. Authentication & Context

- Build the tRPC **context** (`createContext`) from the incoming request. Attach the authenticated user object (or `null`) to the context.
- Define a `protectedProcedure` base that asserts `ctx.user` is non-null before the handler runs. Never check auth inline in individual procedures — this is error-prone.
- Pass context data (database client, request headers) through the context object, not through global variables.

## 5. Client Usage & Integration

- Use **`@trpc/react-query`** for React clients — it wraps TanStack Query and provides auto-generated, type-safe hooks with loading, error, and data states.
- Use the **tRPC vanilla client** for non-React environments (server-to-server calls, CLIs, scripts).
- Keep `AppRouter` type import as type-only: `import type { AppRouter } from '@/server/api/root'`. This ensures no server code leaks to the client bundle.
- Integrate tRPC with **Next.js** via `@trpc/next` or the App Router using `createServerSideHelpers` for efficient server-side data prefetching.
