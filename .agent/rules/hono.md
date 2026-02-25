# Hono Development Guidelines

> Objective: Define standards for building fast, multi-runtime web APIs with Hono.

## 1. Overview & Runtime Selection

- **Hono** runs on Cloudflare Workers, Deno, Bun, Node.js, AWS Lambda, and other runtimes with a unified API. Choose the appropriate adapter:
  - **Cloudflare Workers**: `export default app;`
  - **Node.js**: `serve(app, { port: 3000 });` via `@hono/node-server`
  - **Deno**: `Deno.serve(app.fetch)`
  - **Bun**: `Bun.serve({ fetch: app.fetch })`
- Hono's multi-runtime portability is its primary advantage. **Design your application logic to be runtime-agnostic** — keep runtime-specific code (bindings, env access) confined to entry points, not the application core.
- Pin the Hono version in `package.json` and follow Hono's changelog for breaking changes between minor versions.

## 2. Routing & Handlers

- Define routes with HTTP method helpers: `app.get('/users/:id', handler)`, `app.post('/users', handler)`.
- Use `app.route('/api', subApp)` or `new Hono().basePath('/api')` to compose sub-applications. This keeps routing organized and modular.
- Handler signature: `async (c: Context) => Response`. Return responses with `c.json()`, `c.text()`, `c.html()`, or `c.body()`.
- Access typed request data with Hono helpers: `c.req.param('id')`, `c.req.query('page')`, `await c.req.json<T>()`.
- Use `c.status(code)` before `c.json()` or use `c.json(body, code)` shorthand to set HTTP status codes.

## 3. Validation & Type Safety

- Use **Zod Validator** middleware (`@hono/zod-validator`) for type-safe, schema-validated inputs:

  ```ts
  app.post("/users", zValidator("json", createUserSchema), async (c) => {
    const body = c.req.valid("json"); // fully typed, no casting needed
    return c.json({ id: 1, ...body }, 201);
  });
  ```

- Use `zValidator("param", schema)` for path parameters and `zValidator("query", schema)` for query string parameters.
- Define Zod schemas in a shared `schemas/` directory to reuse between validation and TypeScript types (`z.infer<typeof schema>`).
- Use Hono's **RPC client** (`hc<AppType>()`) for end-to-end type-safe API calls from a TypeScript frontend — eliminates schema duplication.

## 4. Middleware & Context

- Use `app.use('*', middleware)` for global middleware. Use `app.use('/api/*', middleware)` for prefix-scoped middleware.
- Hono ships built-in middleware: `logger`, `cors`, `etag`, `bearerAuth`, `compress`, `requestId`, `secureHeaders`.
- Use **`createMiddleware()`** to create type-safe reusable middleware with typed context variables.
- Use **Context Variables** (typed via `new Hono<{ Variables: { user: User } }>()`) to pass type-safe, request-scoped values between middleware and handlers:

  ```ts
  const app = new Hono<{ Variables: { userId: string } }>();
  app.use(async (c, next) => {
    c.set("userId", "123");
    await next();
  });
  app.get("/me", (c) => c.json({ id: c.get("userId") }));
  ```

## 5. Cloudflare Workers & Testing

- Access Cloudflare bindings (KV, D1, R2, Queues, Durable Objects) from `c.env`. Type the environment with `type Env = { DB: D1Database; CACHE: KVNamespace }` and pass it as a type parameter.
- Run `wrangler deploy --dry-run` in CI to validate the build without deploying.
- Use **`vitest`** with `@cloudflare/vitest-pool-workers` for unit tests in the Workers runtime. For Node.js targets, use standard `vitest` or `jest`.
- Write integration tests using Hono's `app.request()` helper — it simulates an HTTP request without starting a server:

  ```ts
  const res = await app.request("/users/1", { method: "GET" });
  expect(res.status).toBe(200);
  ```

- Use `hono/testing` helpers for testing middleware chains and error handlers in isolation.
