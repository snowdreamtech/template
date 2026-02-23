# tRPC Development Guidelines

> Objective: Define standards for building end-to-end type-safe APIs with tRPC in TypeScript projects.

## 1. Overview & When to Use

- **tRPC** eliminates the need for manually writing API contracts by sharing types directly between your TypeScript server and client. Use it for **monorepo or full-stack TypeScript projects** where the server and client are developed together.
- Do not use tRPC for public APIs that need to be consumed by non-TypeScript clients or third parties — use REST/OpenAPI or GraphQL instead.

## 2. Router Definition

- Define all procedures in typed **routers**. Group related procedures into sub-routers and merge them into an `appRouter`:
  ```ts
  export const appRouter = router({
    user: userRouter,
    post: postRouter,
  });
  export type AppRouter = typeof appRouter;
  ```
- Export only the `AppRouter` **type**, never the router implementation, to the client. This ensures zero runtime coupling.

## 3. Procedures

- Use **`query`** for read operations and **`mutation`** for write operations. Use **`subscription`** for real-time updates over WebSockets.
- Validate all inputs with **Zod** schemas in the `.input()` method — this is enforced at runtime and provides compile-time type inference:
  ```ts
  .input(z.object({ id: z.string().uuid() }))
  ```
- Use **`middleware`** (`.use()`) for cross-cutting concerns like authentication (`isAuthed`), logging, and rate limiting.

## 4. Authentication & Context

- Build the tRPC **context** (`createContext`) from the incoming request. Attach the authenticated user to the context.
- Define a `protectedProcedure` base that validates `ctx.user` exists before the handler runs. Never check auth inside individual procedures.

## 5. Client Usage

- Use `@trpc/react-query` for React clients — it wraps `@tanstack/react-query` and provides auto-generated, type-safe hooks.
- Use the tRPC **vanilla client** for non-React environments (server-to-server calls, scripts).
- Keep the `AppRouter` type import in the client as a type-only import: `import type { AppRouter } from '@/server/api/root'`.
