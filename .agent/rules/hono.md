# Hono Development Guidelines

> Objective: Define standards for building fast, multi-runtime web APIs with Hono.

## 1. Overview & Runtime Selection

- **Hono** runs on Cloudflare Workers, Deno, Bun, Node.js, AWS Lambda, and other runtimes with a unified API. Choose the appropriate entry point:
  - **Cloudflare Workers**: `export default app;`
  - **Node.js**: `serve(app, { port: 3000 });` via `@hono/node-server`
  - **Deno**: `Deno.serve(app.fetch)`
  - **Bun**: `Bun.serve({ fetch: app.fetch })`
- Hono's multi-runtime portability is its primary advantage. Design your application logic to be portable — avoid runtime-specific APIs in the application core.

## 2. Routing & Handlers

- Define routes with HTTP method helpers: `app.get('/users/:id', handler)`, `app.post('/users', handler)`.
- Use `app.route('/api', subApp)` to compose sub-applications (Hono's equivalent of Express Router). This keeps routing modular.
- Handler signature: `async (c: Context) => Response`. Return responses with `c.json()`, `c.text()`, `c.html()`, or `c.body()`.
- Access typed request data with Hono helpers: `c.req.param('id')`, `c.req.query('page')`, `await c.req.json<T>()`.

## 3. Validation

- Use **Zod Validator** middleware (`@hono/zod-validator`) for type-safe, schema-validated inputs:
  ```ts
  app.post("/users", zValidator("json", createUserSchema), async (c) => {
    const body = c.req.valid("json"); // fully typed
    // ...
  });
  ```
- Validated data via `c.req.valid()` is fully typed — no manual type casting needed.
- Use `zValidator("param", schema)` for path parameters and `zValidator("query", schema)` for query params.

## 4. Middleware & Context

- Use `app.use('*', middleware)` for global middleware. Use `app.use('/api/*', middleware)` for prefix-scoped middleware.
- Hono ships built-in middleware for: `logger`, `cors`, `etag`, `bearerAuth`, `compress`, `requestId`.
- Use **`createMiddleware()`** to create type-safe reusable middleware with typed context variables.
- Use **Context Variables** (typed via `new Hono<{ Variables: { user: User } }>()`) to pass type-safe values between middleware and handlers.

## 5. Cloudflare Workers Specifics

- Access Cloudflare bindings (KV, D1, R2, Queues, Durable Objects) from `c.env`: `const kv = c.env.CACHE;`.
- Use Hono's **RPC client** (`hc<AppType>()`) for end-to-end type-safe API calls from a TypeScript frontend — no schema duplication required.
- Run `wrangler deploy --dry-run` in CI to validate the build. Use `vitest` with `@cloudflare/vitest-pool-workers` for unit tests in the Workers runtime.
- Pin the Hono version in `package.json`. Follow Hono's changelog for breaking changes between minor versions.
