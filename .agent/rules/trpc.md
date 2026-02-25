# tRPC Development Guidelines

> Objective: Define standards for building end-to-end type-safe APIs with tRPC in TypeScript projects.

## 1. Overview & When to Use

- **tRPC** eliminates API contract duplication by sharing TypeScript types directly between server and client. It is ideal for **monorepos or full-stack TypeScript projects** where server and client are developed together.
- Do **not** use tRPC for public APIs consumed by non-TypeScript clients or third parties — use REST/OpenAPI or GraphQL instead.
- tRPC generates no standard HTTP endpoints and has no stable versioned surface area. Do not use it if you need to expose a public API.
- tRPC integrates naturally with Next.js App Router, SvelteKit, and Astro as a backend layer.

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
- Define the root `router`, `publicProcedure`, and `middleware` in a shared `trpc.ts` file. Import from it everywhere.

## 3. Procedures & Middleware

- Use **`query`** for read operations (GET semantics) and **`mutation`** for write operations. Use **`subscription`** for real-time updates via WebSockets or SSE.
- Validate all inputs with **Zod** schemas in the `.input()` method. Validation is enforced at runtime and infers TypeScript types at compile-time:

  ```ts
  .input(z.object({ id: z.string().uuid(), page: z.number().int().min(1).default(1) }))
  ```

- Use **middleware** (`.use()`) for cross-cutting concerns: authentication (`isAuthed`), rate limiting, logging, and caching.
- Chain middleware into reusable base procedures: `publicProcedure` → `protectedProcedure = publicProcedure.use(isAuthed)` → `adminProcedure = protectedProcedure.use(isAdmin)`. Never check auth inline in individual procedures.

## 4. Authentication & Context

- Build the tRPC **context** (`createContext`) from the incoming request. Attach the authenticated user object (or `null`) to the context. Keep context creation lightweight — do not run queries in context creation.
- Define a `protectedProcedure` base that asserts `ctx.user` is non-null before the handler runs. This guarantee is type-safe.
- Pass context data (database client, request headers, user session) through the context object, not through global variables or module-level state.
- Use `experimental_caller` for server-side tRPC calls without HTTP overhead (e.g., in Server Components or getServerSideProps).

## 5. Client Usage & Integration

- Use **`@trpc/react-query`** for React clients — it wraps TanStack Query and provides auto-generated, type-safe hooks with loading, error, and data states.
- Use the **tRPC vanilla client** (`createTRPCClient`) for non-React environments (server-to-server calls, CLIs, scripts).
- Keep `AppRouter` import as type-only: `import type { AppRouter } from '@/server/api/root'`. This ensures no server code leaks to the client bundle.
- Use **`createServerSideHelpers`** for server-side data prefetching in Next.js Pages Router. In App Router, use the tRPC server caller directly in Server Components.
- Integrate error formatting with `errorFormatter` in the tRPC init to produce consistent, sanitized error shapes on the client.
