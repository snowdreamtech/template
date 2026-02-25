# Deno Development Guidelines

> Objective: Define standards for building secure, modern TypeScript/JavaScript applications with Deno, covering permission model, imports, configuration, standard APIs, HTTP servers, and testing.

## 1. Security & Permissions

### Deno's Security Model

- **Deno is secure by default** — no file system, network, or environment access without explicit flags. Always run with the minimum required permissions:

  ```bash
  # ✅ Scoped permissions — specific paths and hosts only
  deno run \
    --allow-read=./data,./config \
    --allow-write=/tmp/cache \
    --allow-net=api.example.com:443,db.internal:5432 \
    --allow-env=PORT,DATABASE_URL,JWT_SECRET \
    main.ts

  # ❌ Never use --allow-all in production
  deno run --allow-all main.ts
  ```

- Document the required permissions for each script in a comment at the top of the entry point file:
  ```typescript
  // Required permissions:
  //   --allow-net=api.example.com  (outbound HTTP to API)
  //   --allow-env=DATABASE_URL     (database connection string)
  //   --allow-read=./migrations    (migration files)
  ```
- Use **`deno compile`** to produce single-file executables with permissions baked in for distribution to users who should not need to install Deno:
  ```bash
  deno compile \
    --allow-net=api.example.com \
    --allow-env=API_KEY \
    --output dist/myapp \
    main.ts
  ```
- Review third-party module permission requirements before adding dependencies. Scope permissions as tightly as possible, even for trusted packages.
- Run **`deno info <specifier>`** to inspect a module's full dependency graph before importing it.

## 2. Imports & Dependency Management

### Import Maps (deno.json)

- Pin all dependency versions in **import maps** via `deno.json`:
  ```jsonc
  // deno.json
  {
    "imports": {
      "@std/http": "jsr:@std/http@^1.0.0",
      "@std/path": "jsr:@std/path@^1.0.0",
      "@std/assert": "jsr:@std/assert@^1.0.0",
      "hono": "npm:hono@^4.0.0",
      "zod": "npm:zod@^3.22.0",
    },
    "tasks": {
      "dev": "deno run --allow-net --allow-env --watch main.ts",
      "test": "deno test --allow-net --coverage=./cov",
      "check": "deno check main.ts",
      "fmt": "deno fmt",
      "lint": "deno lint",
    },
    "lock": true,
  }
  ```
- After adding/updating dependencies, run `deno cache main.ts` to update `deno.lock` and commit it for reproducible installs.

### Registry Priority

- Prefer the **JSR registry** (`jsr:@scope/package@version`) for Deno-native packages — JSR provides TypeScript-first distributions with better Deno integration.
- Use **npm specifiers** (`npm:package@version`) for npm packages that don't have JSR equivalents.
- Never use raw HTTPS URL imports without a locked version hash — they are unmaintainable and insecure. Prefer JSR or npm specifiers with pinned semver ranges.
- Pre-warm the module cache in CI:
  ```bash
  deno cache --reload main.ts   # download and verify all deps
  ```
- Do NOT commit the Deno module cache directory — the `deno.lock` file handles reproducibility.

## 3. TypeScript & Configuration

### Type Safety

- Deno supports TypeScript **natively** — no separate compilation step required. Use strict TypeScript settings (configured in `deno.json`):
  ```jsonc
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "exactOptionalPropertyTypes": true,
      "noFallthroughCasesInSwitch": true,
      "verbatimModuleSyntax": true,
    },
  }
  ```
- Run **`deno check main.ts`** in CI for full type checking (equivalent to `tsc --noEmit`). This MUST run before tests.
- Use `import type { ... }` for type-only imports to ensure they are erased at runtime (required by `verbatimModuleSyntax`).

### Formatting & Linting

- Use built-in **`deno fmt`** for formatting and **`deno lint`** for linting — both are zero-config by default:
  ```bash
  deno fmt --check   # fail CI if formatting differs
  deno lint          # fail CI on any lint violation
  ```
- Configure `fmt` and `lint` options in `deno.json`:
  ```jsonc
  {
    "fmt": { "lineWidth": 120, "singleQuote": false, "useTabs": false },
    "lint": {
      "rules": {
        "include": ["no-eval", "no-var", "prefer-const", "no-throw-literal"],
      },
    },
  }
  ```

## 4. Standard Library & HTTP Servers

### Preferred APIs

- Prefer Deno's built-in **Web APIs** (`fetch`, `Request`, `Response`, `URL`, `URLSearchParams`, `TextEncoder`, `crypto.subtle`) and the **Deno Standard Library** (`jsr:@std/*`) over third-party equivalents for standard operations.
- Use the **`Deno` namespace** for platform APIs (`Deno.readFile`, `Deno.stat`, `Deno.env`, `Deno.openKv`).

### HTTP Server

- Use **`Deno.serve()`** (stable since Deno 1.35) for HTTP servers. It is performant and integrates with native Request/Response:

  ```typescript
  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok" });
    }

    if (url.pathname === "/api/users" && req.method === "GET") {
      const users = await userRepo.listAll();
      return Response.json({ data: users });
    }

    return new Response("Not Found", { status: 404 });
  };

  Deno.serve({ port: Number(Deno.env.get("PORT") ?? "3000"), hostname: "0.0.0.0" }, handler);
  ```

- For production APIs with routing and middleware, prefer **Hono** (multi-runtime, works on Deno, Bun, Cloudflare Workers, Node.js) or **Fresh** (Deno-native, SSR with Islands architecture).

### Deno KV & Deploy

- Use **`Deno.openKv()`** for simple key-value persistence in Deno Deploy environments. Designed for edge-compatible, globally replicated storage:
  ```typescript
  const kv = await Deno.openKv();
  await kv.set(["users", userId], userData);
  const entry = await kv.get<UserData>(["users", userId]);
  ```
- Deploy to **Deno Deploy** for zero-config, globally distributed edge deployments with TypeScript native support. Use `deployctl` for CI:
  ```bash
  deployctl deploy --project=my-project main.ts
  ```
- Deno 2 is fully **Node.js-compatible**: use `node:*` module specifiers for Node built-ins (`node:path`, `node:crypto`, `node:fs`). npm packages work via `npm:` specifiers without explicit install.

## 5. Testing & CI Pipeline

### Testing

- Use Deno's built-in test runner: **`deno test`**. Write tests with `Deno.test(...)`:

  ```typescript
  import { assertEquals, assertRejects } from "jsr:@std/assert@^1.0.0";

  Deno.test("parseUser() — valid input returns User", () => {
    const raw = { id: "1", name: "Alice", email: "alice@example.com" };
    const user = parseUser(raw);
    assertEquals(user.name, "Alice");
  });

  Deno.test("parseUser() — missing email throws", async () => {
    await assertRejects(() => parseUser({ id: "1", name: "Alice" }), Error, "email is required");
  });
  ```

- Group related tests using `Deno.test` with subtests:
  ```typescript
  Deno.test("UserService", async (t) => {
    await t.step("findById returns user", async () => { ... });
    await t.step("findById throws for unknown id", async () => { ... });
  });
  ```
- Use `{ sanitizeOps: false }` or `{ sanitizeResources: false }` only when necessary (e.g., long-running background servers in tests) and with a comment explaining why.

### Coverage & CI Pipeline

- Generate and upload coverage:
  ```bash
  deno test --coverage=./cov
  deno coverage ./cov --lcov > cov.lcov
  ```
- Full **CI quality gate**:
  ```bash
  deno fmt --check              # formatting
  deno lint                     # linting
  deno check main.ts            # type checking
  deno test --coverage=./cov    # tests + coverage
  ```
- Use **`deno task`** (defined in `deno.json` `"tasks"` object) for all script invocation — the cross-platform alternative to npm scripts. Commit the standard task names: `dev`, `build`, `test`, `check`, `lint`, `fmt`.
- Use **`deno bench`** for performance benchmarking of CPU-bound code paths. Benchmark output is formatted for easy comparison between runs.
