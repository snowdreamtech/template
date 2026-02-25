# tRPC Development Guidelines

> Objective: Define standards for building end-to-end type-safe APIs with tRPC in TypeScript projects, covering router design, input validation, authentication, client integration, error handling, and testing.

## 1. Overview & When to Use

- **tRPC** eliminates API contract duplication by sharing TypeScript types directly between server and client. It is ideal for **monorepos or full-stack TypeScript projects** where server and client are developed together in the same repository.
- Do **not** use tRPC for public APIs consumed by non-TypeScript clients or third parties — use REST/OpenAPI or GraphQL instead. tRPC has no standard HTTP endpoint surface and no stable versioned API contract.
- tRPC integrates naturally as an API layer with **Next.js App Router**, **SvelteKit**, **Astro**, and standard Node.js HTTP servers.
- Evaluate tRPC's trade-offs before adopting:
  - ✅ Compile-time type safety across the entire stack with zero schema duplication
  - ✅ Eliminates the need for type-unsafe `fetch` calls, REST client generation, or GraphQL codegen
  - ❌ Server and client must both be TypeScript — no language-agnostic contract
  - ❌ No built-in versioning — router changes are immediately reflected client-side (version with care)
- Pin the tRPC version (`@trpc/server`, `@trpc/client`, `@trpc/react-query`) and review breaking changes between major versions carefully.

## 2. Router Definition & Organization

- Define all procedures in typed **routers**. Group related procedures into feature sub-routers and merge into the root `appRouter`:

  ```ts
  // server/api/root.ts
  import { userRouter } from "./routers/user";
  import { postRouter } from "./routers/post";

  export const appRouter = createTRPCRouter({
    user: userRouter,
    post: postRouter,
  });

  export type AppRouter = typeof appRouter;
  ```

- Export **only the `AppRouter` type** to the client package — never the router implementation. This ensures zero runtime coupling between server and client bundles:

  ```ts
  // client: type-only import — no server code leaks to the bundle
  import type { AppRouter } from "@/server/api/root";
  ```

- Define the shared `t` object (router, procedure, middleware factories) in a single `trpc.ts` initialization file. Import from it everywhere — never call `initTRPC` more than once:

  ```ts
  // server/api/trpc.ts
  import { initTRPC } from "@trpc/server";
  import superjson from "superjson";

  export const t = initTRPC.context<Context>().create({ transformer: superjson });
  export const router = t.router;
  export const publicProcedure = t.procedure;
  ```

- Use `superjson` as the transformer in `initTRPC.create()` to transparently handle `Date`, `Map`, `Set`, `BigInt`, and `undefined` across the wire — no manual serialization needed.
- Co-locate each sub-router with its domain feature: `server/api/routers/user.ts`, `server/api/routers/post.ts`.

## 3. Procedures, Validation & Middleware

### Input Validation

- Validate **all inputs** with **Zod** schemas in the `.input()` method. Validation is enforced at runtime and infers TypeScript types at compile-time — single source of truth:

  ```ts
  export const userRouter = router({
    getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({ where: { id: input.id } });
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(100),
          email: z.string().email(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return ctx.db.user.create({ data: input });
      }),
  });
  ```

- Define Zod schemas in a shared `schemas/` directory to reuse between tRPC validation and other consumers (form validation, database layer).
- Use **`query`** for read operations (GET semantics: safe, idempotent, cacheable). Use **`mutation`** for write operations (POST semantics: state-changing). Use **`subscription`** for real-time updates over WebSockets or SSE.

### Middleware & Procedure Chaining

- Use **middleware** (`.use()`) for cross-cutting concerns: authentication, authorization, rate limiting, logging, and caching. Never repeat auth logic inside individual procedures.
- Chain middleware into reusable base procedures:

  ```ts
  export const publicProcedure = t.procedure;

  export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
    if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { ...ctx, user: ctx.session.user } }); // narrows ctx.user to non-null
  });

  export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== "ADMIN") throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx });
  });
  ```

- Apply `timing()` or a custom logging middleware globally for observability. Log procedure inputs (sanitized), response time, and outcome.

## 4. Authentication, Context & Error Handling

### Context & Authentication

- Build the tRPC **context** (`createContext`) from the incoming request. Attach the authenticated session/user object (or `null`) to the context. Keep context creation lightweight — validate the session token but do not run business logic queries here:

  ```ts
  export async function createContext({ req }: { req: Request }) {
    const session = await getSession(req.headers);
    return { db: prisma, session };
  }
  export type Context = Awaited<ReturnType<typeof createContext>>;
  ```

- The `protectedProcedure` middleware narrows `ctx.user` to non-null in a type-safe way. This guarantee is enforced at the TypeScript type level — handlers using `protectedProcedure` can safely access `ctx.user` without null checks.
- Pass dependencies (database client, request headers, user session, services) through the context object. Never use global variables, module-level singletons, or ambient state in procedure handlers.
- Use `experimental_caller` (tRPC server-side caller) for calling procedures from within server code without HTTP overhead:

  ```ts
  const caller = appRouter.createCaller(ctx);
  const user = await caller.user.getById({ id: "..." });
  ```

### Error Handling

- Use `TRPCError` for all error responses. Map errors to appropriate tRPC error codes:

  ```ts
  import { TRPCError } from "@trpc/server";

  throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input", cause: zodError });
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" });
  ```

- Standard tRPC error codes and their HTTP equivalents: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `TOO_MANY_REQUESTS` (429), `INTERNAL_SERVER_ERROR` (500).
- Use `errorFormatter` in `initTRPC.create()` to produce consistent, sanitized error shapes on the client. Strip internal error details in production:

  ```ts
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  }
  ```

- Never expose internal error messages, stack traces, or database errors directly to clients. Log detailed errors server-side, return sanitized messages to clients.

## 5. Client Integration, Testing & Performance

### React Client (`@trpc/react-query`)

- Use **`@trpc/react-query`** for React clients — it wraps TanStack Query and provides auto-generated, type-safe hooks for queries, mutations, and subscriptions:

  ```ts
  // Auto-generated typed hooks
  const { data, isLoading, error } = trpc.user.getById.useQuery({ id: userId });
  const createUser = trpc.user.create.useMutation();

  await createUser.mutateAsync({ name: "Alice", email: "alice@example.com" });
  ```

- Configure the tRPC client with `superjson` transformer and the server's base URL. Set fetch options for credentials, custom headers (e.g., CSRF token), and retry behavior.
- Use **`createServerSideHelpers`** (Pages Router) or the **server-side caller** (App Router Server Components) for prefetching data on the server:

  ```ts
  // Next.js App Router Server Component
  const user = await api.user.getById({ id: params.id });
  ```

- Use **`utils.user.getById.invalidate()`** or `utils.invalidate()` after mutations to automatically refetch stale queries.
- For non-React environments (Node.js scripts, server-to-server calls, CLIs), use the **tRPC vanilla client** (`createTRPCClient`).

### Testing

- Test tRPC procedures directly using the server-side caller — no HTTP layer needed:

  ```ts
  describe("userRouter", () => {
    it("getById returns user", async () => {
      const ctx = await createInnerTRPCContext({ session: mockSession });
      const caller = appRouter.createCaller(ctx);
      const user = await caller.user.getById({ id: "uuid-1" });
      expect(user.id).toBe("uuid-1");
    });

    it("protectedProcedure throws UNAUTHORIZED when no session", async () => {
      const ctx = await createInnerTRPCContext({ session: null });
      const caller = appRouter.createCaller(ctx);
      await expect(caller.post.create({ title: "Test" })).rejects.toThrow("UNAUTHORIZED");
    });
  });
  ```

- Use **Vitest** or **Jest** for unit tests. Use an in-memory SQLite database (or `prisma-mock`) for lightweight integration tests.
- Test middleware independently by constructing mock contexts and calling the middleware function.
- For E2E API testing, use the tRPC HTTP adapter to spin up a real HTTP server and make fetch-based requests, verifying the full stack.

### Performance & Optimization

- Use **TanStack Query's staleTime and cacheTime** configuration to control client-side caching behavior. Set `staleTime: Infinity` for static reference data (rarely changes).
- Use `httpBatchLink` or `httpBatchStreamLink` to batch multiple concurrent queries into a single HTTP request, reducing latency:

  ```ts
  links: [httpBatchLink({ url: "/api/trpc", maxURLLength: 2083 })];
  ```

- Use `splitLink` to route subscriptions to a `wsLink` (WebSocket) while routing queries/mutations to `httpBatchLink`:

  ```ts
  links: [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: wsLink({ client: wsClient }),
      false: httpBatchLink({ url: "/api/trpc" }),
    }),
  ];
  ```

- Profile slow procedures using the built-in timing middleware or a custom logging middleware. Add database query explain plans for N+1 query hotspots (DataLoader pattern for related data).
