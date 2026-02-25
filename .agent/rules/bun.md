# Bun Development Guidelines

> Objective: Define standards for building fast JavaScript/TypeScript applications with the Bun runtime.

## 1. Runtime & Tooling

- Bun is an **all-in-one toolkit**: runtime, bundler, package manager, and test runner. Prefer Bun's built-in tools over third-party equivalents where they meet your needs.
- Use **`bun install`** for package management. Commit `bun.lockb` to version control for reproducible installs. Use `--frozen-lockfile` in CI to prevent accidental lockfile mutations.
- Use **`bunx`** (Bun's `npx` equivalent) to run package binaries without global installation.
- Pin the Bun version for reproducibility: use `.mise.toml` (`bun = "1.1.x"`), `.tool-versions` (asdf), or a CI pinning strategy (`oven-sh/setup-bun@v2`). Never rely on a system-wide Bun installation of unknown version.
- Use **`bun run <script>`** to execute scripts defined in `package.json`. Prefer consistent script names across projects: `dev`, `build`, `test`, `lint`, `typecheck`.

## 2. Compatibility & Ecosystem

- Bun aims for Node.js compatibility but is **not 100% identical**. Test your application with `bun run` before assuming compatibility with existing Node.js code.
- Packages using **native Node.js addons** (`.node` files) may not work with Bun. Identify incompatible dependencies early in the project and plan alternatives.
- For maximum ecosystem compatibility (e.g., when `npm` scripts or Node.js-specific packages are required), consider using Bun as a package manager and bundler only, while keeping the runtime as Node.js.
- Use `bun pm ls` to inspect installed packages. Use `bun update --latest` with a lockfile review to safely update dependencies.
- Prefer packages with explicit Bun support. Check the [Bun compatibility table](https://bun.sh/docs/runtime/nodejs-apis) for known incompatibilities.

## 3. TypeScript & JavaScript

- Bun supports TypeScript **natively without a transpilation step**. Follow the `typescript.md` rules for type safety and configuration.
- Use **`bun --hot`** for hot module reloading during development (replaces `nodemon`/`tsx`). Use `bun --watch` for simple file watching.
- **Type-check separately**: Bun's native TS execution does not perform type checking. Add a `typecheck` script using `bun run tsc --noEmit` and run it in CI.
- Configure `tsconfig.json` with `"moduleResolution": "bundler"` when using Bun as a bundler for best compatibility.

## 4. HTTP Server & APIs

- Use Bun's native **`Bun.serve()`** for HTTP servers — it is significantly faster than Node.js's `http` module:

  ```ts
  Bun.serve({
    port: 3000,
    async fetch(req: Request): Promise<Response> {
      return new Response("Hello");
    },
    error(err: Error): Response {
      return new Response(`Error: ${err.message}`, { status: 500 });
    },
  });
  ```

- For production APIs, prefer a framework with first-class Bun support: **Elysia** (Bun-native, schema-first), **Hono** (multi-runtime), or **Fastify** (with Bun adapter).
- Bun's `Bun.serve()` supports WebSockets natively via the `websocket` option — no additional library needed.
- Use `Bun.file()` for efficient file serving instead of reading into memory with `fs.readFile()`.

## 5. Testing & CI

- Use Bun's built-in test runner: **`bun test`**. It is Jest-compatible (`describe`, `it`, `expect`, `mock`, `spyOn`).
- Tests are auto-discovered from `*.test.ts`, `*.spec.ts`, and `*.test.js` files. No additional configuration needed for basic projects.
- Use **`--bail`** flag in CI to stop on first failure: `bun test --bail`. Use `--timeout` to prevent hanging tests.
- Use `bun test --coverage` to generate coverage reports. Set a minimum threshold in `bunfig.toml`.
- Run the full quality gate in CI: `bun run typecheck && bun run lint && bun test --coverage --bail`.
- Use `bun build` to produce optimized production bundles. Inspect bundle size with `--analyze` or a separate bundle analyzer tool.
