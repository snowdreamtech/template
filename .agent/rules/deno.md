# Deno Development Guidelines

> Objective: Define standards for building secure, modern TypeScript/JavaScript applications with Deno.

## 1. Security & Permissions

- **Deno is secure by default.** Always run with the minimum required permissions. Use explicit flags: `--allow-read`, `--allow-write`, `--allow-net=api.example.com`, `--allow-env=PORT,DATABASE_URL`.
- Avoid **`--allow-all` (`-A`)** in production scripts. Audit what permissions your code and dependencies actually require.
- Use `deno compile --allow-...` to produce single-file, self-contained executables with permissions baked in for distribution.
- Use **`deno permission check`** during development to discover what permissions a script requires before running it.

## 2. Imports & Dependencies

- Pin all dependency versions in **import maps** (defined in `deno.json`):
  ```jsonc
  // deno.json
  { "imports": { "@std/http": "jsr:@std/http@^0.224.0" } }
  ```
- Use the **JSR registry** (`jsr:`) and **npm specifier** (`npm:`) for packages. JSR is the preferred registry for Deno packages over raw URL imports.
- Avoid pinning to naked URLs without versions. Always specify a semver-compatible version.
- Run `deno cache --reload` in CI to pre-cache dependencies and detect missing packages before runtime.

## 3. TypeScript

- Deno supports TypeScript **natively** — no transpilation build step required.
- Use `deno check main.ts` in CI for TypeScript type checking (equivalent to `tsc --noEmit`).
- Configure TypeScript options in `deno.json` under the `"compilerOptions"` key.

## 4. Standard Library & Built-ins

- Prefer Deno's built-in **Web APIs** (`fetch`, `Request`, `Response`, `URL`, `URLSearchParams`, `TextEncoder`, `Crypto`) and the **Deno Standard Library** (`@std/*` on JSR) over third-party equivalents.
- Use **`Deno.serve()`** for HTTP servers (Deno 1.35+). It is the stable, recommended API:
  ```ts
  Deno.serve({ port: 3000 }, (req: Request): Response | Promise<Response> => {
    return new Response("Hello");
  });
  ```
- For full-stack web applications, use **Fresh** (Deno-native SSR framework) or **Hono** (multi-runtime).

## 5. Testing & Tooling

- Use Deno's built-in test runner: **`deno test`**. Write tests with `Deno.test("name", () => { ... })`.
- Use `deno test --coverage` to generate coverage data. Run `deno coverage` to produce a coverage report.
- Run the full quality pipeline in CI: `deno fmt --check && deno lint && deno check main.ts && deno test`.
- Use **`deno task`** (defined in `deno.json`'s `"tasks"` key) as the standard way to run scripts — the cross-platform alternative to npm scripts.
