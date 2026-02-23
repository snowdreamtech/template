# Deno Development Guidelines

> Objective: Define standards for building secure, modern TypeScript/JavaScript applications with Deno.

## 1. Security & Permissions

- **Deno is secure by default.** Always run with the minimal required permissions. Use explicit flags: `--allow-read`, `--allow-write`, `--allow-net`, `--allow-env`.
- Avoid `--allow-all` (`-A`) in production scripts. Audit what permissions your code and dependencies actually need.
- Use `deno compile --allow-...` to produce single-file executables with permissions baked in for distribution.

## 2. Imports & Dependencies

- Use **URL imports** or the **`deno.json` import maps** to manage dependencies. Do not use npm-style `node_modules`.
- Pin dependency versions in import URLs: `https://deno.land/x/oak@v12.6.0/mod.ts` — never import from unversioned URLs.
- Use `deno.json` (or `deno.jsonc`) as the project config file for tasks, import maps, compiler options, and lint/fmt config.
- Run `deno cache deps.ts` to pre-cache dependencies in CI.

## 3. TypeScript

- Deno supports TypeScript natively — use it. Follow the `typescript.md` rules in this repository.
- Use Deno's built-in type checking: `deno check main.ts` in CI (equivalent to `tsc --noEmit`).

## 4. Standard Library & Built-ins

- Prefer Deno's built-in **Web APIs** (`fetch`, `Request`, `Response`, `URL`, `TextEncoder`) and the **Deno Standard Library** (`@std/*`) over third-party equivalents.
- Use `Deno.serve()` for HTTP servers (Deno 1.35+). It is the modern, stable API.

## 5. Testing & Tooling

- Use Deno's built-in test runner: `deno test`. Write tests with `Deno.test()`.
- Format with `deno fmt` and lint with `deno lint`. Both are built-in and require no configuration.
- Run `deno fmt --check`, `deno lint`, and `deno test` in CI.
