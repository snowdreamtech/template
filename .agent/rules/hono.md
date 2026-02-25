# Hono Development Guidelines

> Objective: Define standards for building fast, multi-runtime web APIs with Hono, covering runtime selection, routing, validation, middleware, authentication, testing, and performance optimization.

## 1. Overview, Runtime Selection & Project Structure

- **Hono** is an ultrafast, multi-runtime web framework with a unified API surface. It runs on **Cloudflare Workers, Deno, Bun, Node.js, AWS Lambda, Vercel Edge**, and other WinterCG-compliant runtimes.
- Hono's primary advantage is **multi-runtime portability** combined with first-class TypeScript support and near-zero overhead. Design your application logic to be runtime-agnostic — keep runtime-specific code (bindings, platform env access) confined to entry points.
- Choose the appropriate adapter for the target runtime:
  | Runtime | Entry Point | Import |
  |---|---|---|
  | Cloudflare Workers | `export default app` | `hono` |
  | Node.js | `serve(app, { port: 3000 })` | `@hono/node-server` |
  | Deno | `Deno.serve(app.fetch)` | `hono` |
  | Bun | `Bun.serve({ fetch: app.fetch })` | `hono` |
  | AWS Lambda | `handle(app)` | `hono/aws-lambda` |
  | Vercel | `app.fire()` or `export default handle(app)` | `@hono/vercel` |
- Pin the Hono version in `package.json`/`deno.json`. Hono follows semantic versioning but may have minor breaking changes in adapter APIs between versions.

### Standard Project Layout

```text
src/
├── index.ts             # Entry point: runtime adapter, app.export/serve
├── app.ts               # App factory: creates Hono instance, registers routes + middleware
├── routes/              # Route modules — one file per domain, returns Hono sub-app
│   ├── users.ts
│   └── health.ts
├── middleware/          # Custom middleware with typed context
│   ├── auth.ts
│   └── logger.ts
├── schemas/             # Zod schemas (shared between validation and types)
│   ├── user.ts
│   └── common.ts
├── services/            # Business logic layer
└── repositories/        # Data access layer
```

- Create the Hono app in a factory function for testability:

  ```ts
  // src/app.ts
  import { Hono } from "hono";
  import { userRoutes } from "./routes/users";
  import { healthRoutes } from "./routes/health";

  export function createApp(): Hono<Env> {
    const app = new Hono<Env>();
    app.route("/api/v1/users", userRoutes);
    app.route("/health", healthRoutes);
    return app;
  }
  ```

## 2. Routing & Handlers

- Define routes with HTTP method helpers on the main app or a sub-app:
  ```ts
  const users = new Hono<Env>();
  users.get("/", listUsers);
  users.post("/", createUser);
  users.get("/:id", getUser);
  users.put("/:id", updateUser);
  users.delete("/:id", deleteUser);
  export const userRoutes = users;
  ```
- Use `app.route('/path', subApp)` to compose sub-applications. Use `new Hono().basePath('/api')` for a root prefix.
- **Handler signature**: `async (c: Context) => Response`. Return responses with `c.json()`, `c.text()`, `c.html()`, or `c.body()`:
  ```ts
  const getUser: Handler<Env> = async (c) => {
    const id = c.req.param("id");
    const user = await userService.findById(id);
    if (!user) return c.json({ error: "user not found" }, 404);
    return c.json(user, 200);
  };
  ```
- Access typed request data with Hono helpers:
  - `c.req.param('id')` — URL path parameter
  - `c.req.query('page')` — query string
  - `await c.req.json<T>()` — JSON body (throws on invalid JSON)
  - `c.req.valid('json')` — validated body from `zValidator` (typed, safe)
  - `c.req.header('Authorization')` — request header
- Use `c.status(code)` before `c.json()` or use `c.json(body, code)` shorthand to set status codes.
- Use `c.redirect(url, 301)` for redirects. Use `c.notFound()` for 404 responses.

## 3. Validation & Type Safety

- Use **Zod Validator** middleware (`@hono/zod-validator`) for type-safe, runtime-validated inputs:

  ```ts
  import { zValidator } from "@hono/zod-validator";
  import { z } from "zod";

  const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    role: z.enum(["user", "admin"]).default("user"),
  });

  users.post(
    "/",
    zValidator("json", createUserSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: "validation failed", details: result.error.flatten() }, 422);
      }
    }),
    async (c) => {
      const body = c.req.valid("json"); // fully typed — no casting needed
      const user = await userService.create(body);
      return c.json(user, 201);
    },
  );
  ```

- Use `zValidator("param", schema)` for path parameters and `zValidator("query", schema)` for query string parameters.
- Define Zod schemas in a shared `schemas/` directory. Derive TypeScript types from schemas: `type CreateUserRequest = z.infer<typeof createUserSchema>`.
- Use Hono's **RPC client** (`hc<AppType>()`) for end-to-end type-safe API calls from a TypeScript frontend — eliminates schema duplication between server and client:
  ```ts
  import { hc } from "hono/client";
  const client = hc<AppType>("http://localhost:3000");
  const res = await client.api.v1.users.$get();
  const users = await res.json(); // fully typed
  ```
- Export `AppType = typeof app` from the server and import it (type-only) on the client for the RPC client.

## 4. Middleware, Authentication & Context

### Middleware

- Use `app.use('*', middleware)` for global middleware. Use `app.use('/api/*', middleware)` for prefix-scoped middleware:
  ```ts
  // Global middleware
  app.use("*", logger());
  app.use("*", timing());
  app.use("*", secureHeaders());
  app.use("/api/*", corsMiddleware);
  ```
- Hono ships built-in middleware for common concerns:
  | Middleware | Import | Purpose |
  |---|---|---|
  | `logger` | `hono/logger` | Request logging |
  | `cors` | `hono/cors` | CORS headers |
  | `secureHeaders` | `hono/secure-headers` | Security headers (CSP, HSTS, etc.) |
  | `bearerAuth` | `hono/bearer-auth` | Bearer token validation |
  | `compress` | `hono/compress` | gzip/brotli compression |
  | `requestId` | `hono/request-id` | Unique request ID |
  | `timing` | `hono/timing` | Server-Timing header |
  | `etag` | `hono/etag` | ETag caching support |

### Context Variables (Type-Safe)

- Use **typed Context Variables** to pass request-scoped values between middleware and handlers without losing type safety:

  ```ts
  type Variables = {
    userId: string;
    user: User;
  };
  type Env = { Bindings: CloudflareBindings; Variables: Variables };

  const app = new Hono<Env>();

  app.use("*", async (c, next) => {
    const userId = await validateToken(c.req.header("Authorization"));
    c.set("userId", userId);
    await next();
  });

  app.get("/profile", (c) => {
    const userId = c.get("userId"); // type: string — no casting
    return c.json({ userId });
  });
  ```

### Authentication

- Create reusable auth middleware using `createMiddleware()` for type-safe middleware with context injection:

  ```ts
  const authMiddleware = createMiddleware<Env>(async (c, next) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "unauthorized" }, 401);
    const user = await validateJWT(token);
    if (!user) return c.json({ error: "invalid token" }, 401);
    c.set("user", user);
    await next();
  });

  // Apply to protected routes
  app.use("/api/protected/*", authMiddleware);
  ```

## 5. Cloudflare Workers, Testing & Performance

### Cloudflare Workers

- Access Cloudflare **platform bindings** (KV, D1, R2, Queues, Durable Objects, AI) from `c.env`. Type the environment for full type safety:

  ```ts
  type Bindings = {
    DB: D1Database;
    CACHE: KVNamespace;
    QUEUE: Queue;
    MY_BUCKET: R2Bucket;
    AI: Ai;
  };
  type Env = { Bindings: Bindings; Variables: Variables };

  app.get("/data", async (c) => {
    const result = await c.env.DB.prepare("SELECT * FROM users").all();
    return c.json(result.results);
  });
  ```

- Run `wrangler deploy --dry-run` in CI to validate the build without deploying. Run `wrangler dev` locally for development.
- Use `wrangler.toml` for binding definitions per environment (dev, staging, production). Never hardcode binding names in code.

### Testing

- Use **`vitest`** for unit tests. For Workers, use `@cloudflare/vitest-pool-workers` to run tests in the actual Workers runtime.
- Write route tests using Hono's `app.request()` helper — it simulates HTTP requests without starting a server:

  ```ts
  import { describe, it, expect } from "vitest";
  import { createApp } from "./app";

  describe("GET /api/v1/users/:id", () => {
    it("returns 200 for existing user", async () => {
      const app = createApp();
      const res = await app.request("/api/v1/users/user-1");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe("user-1");
    });

    it("returns 404 for missing user", async () => {
      const app = createApp();
      const res = await app.request("/api/v1/users/nonexistent");
      expect(res.status).toBe(404);
    });
  });
  ```

- Use `hono/testing` helpers for testing middleware chains and error handlers in isolation.
- For Node.js production deployments, test with `supertest` against a running `@hono/node-server` instance.

### Performance & Optimization

- Hono uses a **Trie-based router** (RegExpRouter or SmartRouter) for near-zero routing overhead. Prefer static routes over dynamic where possible for maximum performance.
- Minimize middleware overhead: apply middleware as close to the routes that need it as possible (route-scoped, not global) when they are not universally required.
- Use `etag` middleware for GET endpoints returning stable data — reduces bandwidth and serves 304 responses for unchanged resources.
- For Cloudflare Workers, use **`c.env.CACHE` (KV)** or the **Cache API** for caching computed responses:
  ```ts
  const cache = await caches.open("v1");
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = c.json(data);
  cache.put(request, response.clone());
  return response;
  ```
- Run Lighthouse and `wrk`/`k6` load tests for Node.js deployments. Monitor p95/p99 latency in Cloudflare Analytics for Workers deployments.
