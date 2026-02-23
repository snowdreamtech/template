# Hono Development Guidelines

> Objective: Define standards for building fast, multi-runtime web APIs with Hono.

## 1. Overview & Runtime Selection

- **Hono** runs on Cloudflare Workers, Deno, Bun, Node.js, AWS Lambda, and other runtimes with a single, unified API. Choose the appropriate entry point per runtime:
  - Cloudflare Workers: `export default app;`
  - Node.js: `serve(app, { port: 3000 });` (via `@hono/node-server`)
  - Deno/Bun: `Deno.serve(app.fetch)` / `Bun.serve({ fetch: app.fetch })`

## 2. Routing & Handlers

- Define routes with HTTP method helpers: `app.get('/users/:id', handler)`, `app.post('/users', handler)`.
- Use `app.route('/api', subApp)` to compose sub-applications (Hono's equivalent of Express Router).
- Handler signature: `async (c: Context) => Response`. Return responses with `c.json()`, `c.text()`, `c.html()`.
- Access request data with Hono's typed helpers:
  - `c.req.param('id')` — path parameters
  - `c.req.query('page')` — query strings
  - `await c.req.json<T>()` — JSON body

## 3. Validation

- Use **Zod Validator** middleware (`@hono/zod-validator`) for type-safe request validation:
  ```ts
  app.post("/", zValidator("json", schema), async (c) => {
    const body = c.req.valid("json");
  });
  ```
- Validated data accessed via `c.req.valid()` is fully typed — no manual casting needed.

## 4. Middleware

- Use `app.use('*', middleware)` for global middleware or `app.use('/api/*', middleware)` for prefix-scoped middleware.
- Hono ships built-in middleware for: `logger`, `cors`, `etag`, `basicAuth`, `bearerAuth`, `compress`, and more.
- Use `createMiddleware()` to create type-safe reusable middleware with full Context access.

## 5. Cloudflare Workers Specifics

- Access Cloudflare bindings (KV, D1, R2, Queues) from `c.env`: `const db = c.env.DB;`
- Use Hono's **RPC** feature (`hc()` client) for type-safe client calls to your Hono API from a TypeScript frontend.
- Run `wrangler deploy --dry-run` in CI to validate the build. Use `vitest` for unit tests.
