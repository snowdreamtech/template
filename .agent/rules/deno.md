# Deno Development Guidelines

> Objective: Define standards for building secure, modern TypeScript/JavaScript applications with Deno.

## 1. Security & Permissions

- **Deno is secure by default.** Always run with the minimum required permissions. Use explicit flags: `--allow-read=./data`, `--allow-write=/tmp`, `--allow-net=api.example.com`, `--allow-env=PORT,DATABASE_URL`.
- Avoid **`--allow-all` (`-A`)** in production scripts and committed run configurations. Audit what permissions your code and dependencies actually require.
- Use `deno compile --allow-...` to produce single-file, self-contained executables with permissions baked in for distribution.
- Use **`deno permission check`** during development to discover what permissions a script requires before running it.
- When using third-party deno modules, review their permission requirements and scope them as tightly as possible.

## 2. Imports & Dependencies

- Pin all dependency versions in **import maps** (defined in `deno.json`):

  ```jsonc
  // deno.json
  { "imports": { "@std/http": "jsr:@std/http@^0.224.0", "zod": "npm:zod@^3.22.4" } }
  ```

- Use the **JSR registry** (`jsr:`) and **npm specifier** (`npm:`) for packages. JSR is the preferred registry for Deno packages over raw URL imports.
- Avoid pinning to naked URLs without versions. Always specify a semver-compatible version range.
- Run `deno cache --reload` in CI to pre-warm the module cache and detect missing packages before runtime.
- Do not commit the Deno cache directory (`.deno/`) to version control — the `deno.lock` file handles reproducibility.

## 3. TypeScript & Configuration

- Deno supports TypeScript **natively** — no transpilation build step required. Use strict TypeScript settings.
- Use `deno check main.ts` in CI for type checking (equivalent to `tsc --noEmit`). Run this before tests.
- Configure TypeScript options in `deno.json` under the `"compilerOptions"` key:

  ```jsonc
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "exactOptionalPropertyTypes": true,
    },
  }
  ```

- Use `deno fmt` for formatting and `deno lint` for linting — both are built in. Commit `deno.json` lint and format configuration to enforce project-wide standards.

## 4. Standard Library & APIs

- Prefer Deno's built-in **Web APIs** (`fetch`, `Request`, `Response`, `URL`, `URLSearchParams`, `TextEncoder`, `crypto`) and the **Deno Standard Library** (`@std/*` on JSR) over third-party equivalents where they cover the use case.
- Use **`Deno.serve()`** for HTTP servers (Deno 1.35+). It is the stable, performant, recommended API:

  ```ts
  Deno.serve({ port: 3000 }, (req: Request): Response | Promise<Response> => {
    return new Response("Hello");
  });
  ```

- For full-stack web applications, use **Fresh** (Deno-native SSR framework) or **Hono** (multi-runtime).
- Use `Deno.KV` for simple persistent key-value storage in Cloudflare/Deno Deploy environments.

## 5. Testing & Tooling

- Use Deno's built-in test runner: **`deno test`**. Write tests with `Deno.test("name", () => { ... })`. Use `{ sanitizeOps: false }` or `{ sanitizeResources: false }` sparingly when testing async code that intentionally leaks handles.
- Use `deno test --coverage=./cov` to generate coverage data. Run `deno coverage ./cov --lcov > cov.lcov` for reports.
- Run the full quality pipeline in CI: `deno fmt --check && deno lint && deno check main.ts && deno test --coverage`.
- Use **`deno task`** (defined in `deno.json`'s `"tasks"` key) as the standard way to run scripts — the cross-platform alternative to npm scripts.
- Use `deno bench` for performance benchmarking of CPU-bound code paths.
