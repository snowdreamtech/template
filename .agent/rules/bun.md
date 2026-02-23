# Bun Development Guidelines

> Objective: Define standards for building fast JavaScript/TypeScript applications with the Bun runtime.

## 1. Runtime & Tooling

- Bun is an **all-in-one toolkit**: runtime, bundler, package manager, and test runner. Prefer Bun's built-in tools over third-party equivalents where they meet your needs.
- Use `bun install` for package management. Commit `bun.lockb` to version control.
- Use `bunx` (Bun's `npx` equivalent) to run package binaries without globally installing them.

## 2. Compatibility

- Bun aims for Node.js compatibility but is not 100% identical. Test your application with `bun run` before assuming it works — especially for packages that use native Node.js addons.
- Use `bun --bun` flag to force Bun's runtime for all child processes when running scripts.
- For maximum compatibility in CI, pin the Bun version in `.mise.toml`, `asdf`, or via `curl -fsSL https://bun.sh/install | bash -s "bun-v1.x.x"`.

## 3. TypeScript

- Bun supports TypeScript natively without transpilation. Follow the `typescript.md` rules in this repository.
- Use `bun --hot` for hot module reloading during development (Bun's equivalent of `nodemon`).

## 4. HTTP Server

- Use Bun's native `Bun.serve()` for HTTP servers — it is significantly faster than Node.js's `http` module.
  ```ts
  Bun.serve({
    port: 3000,
    fetch(req) {
      return new Response("Hello");
    },
  });
  ```
- For frameworks, prefer those with first-class Bun support: **Elysia**, **Hono**, or **Fastify** (with Bun adapter).

## 5. Testing

- Use Bun's built-in test runner: `bun test`. It is Jest-compatible (`describe`, `it`, `expect`).
- No additional configuration is needed for most projects — tests are auto-discovered from `*.test.ts` files.
- Run `bun test` in CI. Use `bun run typecheck` (via a `tsc --noEmit` script) for type checking.
