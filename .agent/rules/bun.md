# Bun Development Guidelines

> Objective: Define standards for building fast JavaScript/TypeScript applications with the Bun runtime.

## 1. Runtime & Tooling

- Bun is an **all-in-one toolkit**: runtime, bundler, package manager, and test runner. Prefer Bun's built-in tools over third-party equivalents where they meet your needs.
- Use **`bun install`** for package management. Commit `bun.lockb` to version control for reproducible installs.
- Use **`bunx`** (Bun's `npx` equivalent) to run package binaries without global installation.
- Pin the Bun version for reproducibility: use `.mise.toml` (`bun = "1.1.x"`), `.tool-versions` (asdf), or a CI pinning strategy (`oven-sh/setup-bun@v2`).

## 2. Compatibility

- Bun aims for Node.js compatibility but is **not 100% identical**. Test your application with `bun run` before assuming compatibility.
- Packages using **native Node.js addons** (`.node` files) may not work with Bun. Identify alternatives early in the project.
- For maximum ecosystem compatibility (e.g., when `npm` scripts or Node.js-specific packages are required), consider using Bun as a package manager + bundler only, while keeping the runtime as Node.js.

## 3. TypeScript

- Bun supports TypeScript **natively without transpilation step**. Follow the `typescript.md` rules.
- Use **`bun --hot`** for hot module reloading during development (replaces `nodemon`/`tsx`).
- Type-check with `bun run tsc --noEmit` or add a `typecheck` script. Bun's native TS execution does not perform type checking.

## 4. HTTP Server

- Use Bun's native **`Bun.serve()`** for HTTP servers — it is significantly faster than Node.js's `http` module:
  ```ts
  Bun.serve({
    port: 3000,
    async fetch(req: Request): Promise<Response> {
      return new Response("Hello");
    },
  });
  ```
- For production APIs, prefer a framework with first-class Bun support: **Elysia** (Bun-native), **Hono** (multi-runtime), or **Fastify** (with Bun adapter).
- Bun's `Bun.serve()` supports WebSockets natively via the `websocket` option — no additional library needed.

## 5. Testing & CI

- Use Bun's built-in test runner: **`bun test`**. It is Jest-compatible (`describe`, `it`, `expect`, `mock`).
- Tests are auto-discovered from `*.test.ts` and `*.spec.ts` files. No additional configuration needed for basic projects.
- Use **`--bail`** flag in CI to stop on first failure: `bun test --bail`.
- Run `bun run typecheck && bun test --coverage` in CI for a complete quality gate.
