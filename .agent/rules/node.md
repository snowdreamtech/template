# Node.js Development Guidelines

> Objective: Define standards for building secure, performant, and maintainable Node.js applications, covering runtime, package management, module system, environment configuration, async patterns, and observability.

## 1. Runtime & Version

### Version Pinning

- Pin the Node.js version using **one** of: `.nvmrc`, `.node-version`, or `engines` field in `package.json`. All three should agree to avoid ambiguity between tools:
  ```
  # .nvmrc
  22.x
  ```
  ```json
  // package.json
  { "engines": { "node": ">=22.0.0" } }
  ```
- Use the latest **LTS (Long-Term Support)** release for production. LTS releases receive 3 years of security fixes. Never run production on odd-numbered (Current/unstable) releases.
- Use a version manager (`fnm` — fastest, Rust-based; or `mise` for polyglot projects) for consistent environments across development, CI, and developer machines:
  ```bash
  # .tool-versions (mise/rtx format)
  nodejs 22.12.0
  ```

### Runtime Selection

- For **I/O-bound services** (APIs, proxies): Use Node.js — the event loop model excels at concurrent I/O.
- For **CPU-bound workloads** (image processing, ML inference, video transcoding): Use Node.js **Worker Threads** (`node:worker_threads`) or offload to a separate process. Do not run CPU-intensive work on the main thread.
- For applications requiring **edge deployment**: Consider Deno, Bun, or Cloudflare Workers for better Web API compatibility.

## 2. Package Management

### Dependency Management

- Use **`npm`** or **`pnpm`** consistently across the project. Never mix package managers. Each creates incompatible lock files:
  - `package-lock.json` (npm)
  - `pnpm-lock.yaml` (pnpm)
  - Commit whichever lock file your project uses — deterministic builds require it.
- Use **`npm ci`** (not `npm install`) in CI pipelines — it does a clean install from the lock file and fails if the lock file is out of sync:
  ```bash
  npm ci --ignore-scripts   # faster, more secure — disable postinstall scripts in CI
  ```
- Never install project-specific tools globally. Add them to `devDependencies` and invoke via `npx` or npm scripts.
- Define all scripts in `package.json`:
  ```json
  {
    "scripts": {
      "dev": "tsx watch src/index.ts",
      "build": "tsc --project tsconfig.build.json",
      "start": "node dist/index.js",
      "test": "vitest run --reporter=verbose",
      "lint": "eslint . --max-warnings 0",
      "typecheck": "tsc --noEmit"
    }
  }
  ```

### Security & Updates

- Run **`npm audit --audit-level=high`** in CI. Block on `high` and `critical` vulnerabilities:
  ```bash
  npm audit --audit-level=high --production  # only production deps
  ```
- Use **Renovate** or **Dependabot** to automate dependency update PRs with grouping and scheduling. Configure minor/patch updates weekly, major updates with careful review.

## 3. Code Style & Module System

### ES Modules

- Use **ES Modules** (`"type": "module"` in `package.json`, `import`/`export` syntax) for all new projects targeting Node.js 18+. Avoid mixing CommonJS (`require`) and ESM in the same package:

  ```json
  // package.json
  { "type": "module" }
  ```

  ```typescript
  // ✅ ESM
  import { createServer } from "node:http";
  import { db } from "./database.js"; // include extensions in ESM imports

  // ❌ CommonJS — avoid in new code
  const { createServer } = require("http");
  ```

- Import Node.js built-in modules with the **`node:` prefix** to distinguish them from npm packages:
  ```typescript
  import { readFile } from "node:fs/promises";
  import { createHash } from "node:crypto";
  import { join, resolve } from "node:path";
  ```

### TypeScript

- Use **TypeScript** for all non-trivial Node.js projects. Enable strict mode:
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitReturns": true,
      "outDir": "dist",
      "rootDir": "src"
    }
  }
  ```
- Use **`tsx`** for running TypeScript directly in development (zero config, fast). Always compile to JavaScript for production (`tsc`):
  ```bash
  npx tsx src/index.ts          # dev
  npx tsc && node dist/index.js # prod
  ```

### Linting & Formatting

- Lint with **ESLint** (flat config `eslint.config.js`) and format with **Prettier**. Enforce via CI and pre-commit hooks (Husky + lint-staged):
  ```bash
  # .husky/pre-commit
  npx lint-staged
  ```
  ```json
  // package.json lint-staged config
  {
    "lint-staged": {
      "*.{ts,js}": ["eslint --fix --max-warnings 0", "prettier --write"],
      "*.{md,json,yaml}": ["prettier --write"]
    }
  }
  ```

## 4. Environment & Configuration

### Environment Variables

- Use **`dotenv`** (or `@dotenvx/dotenvx`) for local development. **Never commit `.env` files** — commit only `.env.example` with documented placeholder values.
- **Validate all environment variables at startup** using a schema. Fail immediately with a clear error message if required variables are missing or malformed:

  ```typescript
  // config/env.ts
  import { z } from "zod";

  const envSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  });

  export const env = envSchema.parse(process.env);
  ```

- Access environment variables through a **single config module** (`config/env.ts`). Never scatter `process.env.VARIABLE` calls across business logic — use the typed config object instead.
- Keep secrets out of code and `.env` files in production — use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler) with automatic rotation.

## 5. Async Patterns & Event Loop

### Async/Await

- Use **`async`/`await`** for all asynchronous code. Avoid raw callbacks for new code — wrap callback-based APIs with `util.promisify()`:

  ```typescript
  import { promisify } from "node:util";
  import { readFile } from "node:fs";

  const readFileAsync = promisify(readFile);
  const content = await readFileAsync("config.json", "utf8");
  ```

- **Always `await` Promises and handle rejections**. A floating Promise (not awaited, no `.catch()`) causes silent failures or unhandled rejections:

  ```typescript
  // ❌ Floating Promise — rejection is swallowed silently
  cache.set("key", value); // returns a Promise but it's not awaited

  // ✅ Awaited
  await cache.set("key", value);

  // ✅ Fire-and-forget with explicit error handling
  cache.set("key", value).catch((err) => logger.warn({ err }, "Cache write failed"));
  ```

### Event Loop Protection

- Never **block the event loop** with synchronous I/O or CPU-intensive work in request handlers. Offload to **Worker Threads** for CPU-bound work:

  ```typescript
  import { Worker, isMainThread, workerData, parentPort } from "node:worker_threads";

  // Main thread — offload CPU work
  const result = await new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", { workerData: { input } });
    worker.on("message", resolve);
    worker.on("error", reject);
  });
  ```

- Use **Streams** (`node:stream`) for large files, HTTP uploads, and database cursors — never buffer entire datasets in memory:

  ```typescript
  import { pipeline } from "node:stream/promises";
  import { createReadStream, createWriteStream } from "node:fs";
  import { createGzip } from "node:zlib";

  await pipeline(createReadStream("large-file.csv"), createGzip(), createWriteStream("output.csv.gz"));
  ```

- Use **`AbortController`** and **`AbortSignal`** for request cancellation. Pass signals to `fetch`, database queries, and `setTimeout`:

  ```typescript
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeout);
  }
  ```

## 6. Security

- **Never use `eval()`, `new Function()`, or `vm.runInNewContext()`** with user-provided input — they execute arbitrary code.
- Sanitize and validate all user input at the API boundary. Use `path.resolve()` + `startsWith()` checks to prevent **directory traversal**:

  ```typescript
  import { join, resolve } from "node:path";

  const UPLOAD_DIR = resolve("./uploads");
  const filePath = resolve(UPLOAD_DIR, req.params.filename);

  if (!filePath.startsWith(UPLOAD_DIR)) {
    throw new Error("Directory traversal blocked");
  }
  ```

- **Never use `child_process.exec()` with user input** — use `execFile()` or `spawn()` with an argument array:

  ```typescript
  // ❌ exec — passes string to shell — injection risk
  exec(`git log ${branch}`);

  // ✅ execFile/spawn — argument array, no shell invocation
  execFile("git", ["log", branch]);
  ```

- Use **Helmet** middleware for all HTTP APIs to set security headers. Run `npm audit` and scan container images with Trivy in CI.

## 7. Error Handling & Observability

- Register global safety nets and **exit on unrecoverable errors**:
  ```typescript
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });
  process.on("unhandledRejection", (err) => {
    logger.fatal({ err }, "Unhandled rejection");
    process.exit(1);
  });
  ```
- Use **structured logging** with `pino` (fastest Node.js logger):

  ```typescript
  import pino from "pino";
  const logger = pino({ level: env.LOG_LEVEL });

  // Structured log — queryable, filterable
  logger.info({ userId: user.id, orderId: order.id }, "Order created");
  ```

- Add a **request ID** to every HTTP request and propagate it in all downstream log entries:
  ```typescript
  app.use((req, _res, next) => {
    req.requestId = req.headers["x-request-id"] ?? crypto.randomUUID();
    req.log = logger.child({ requestId: req.requestId });
    next();
  });
  ```
- Instrument with **OpenTelemetry** for automatic distributed tracing:

  ```typescript
  // tracing.ts — loaded before application code
  import { NodeSDK } from "@opentelemetry/sdk-node";
  import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

  new NodeSDK({ instrumentations: [getNodeAutoInstrumentations()] }).start();
  ```

- Expose **`/health`** (readiness — includes DB connectivity check) and **`/live`** (liveness — basic HTTP 200) endpoints for Kubernetes probes.
