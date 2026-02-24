# Node.js Development Guidelines

> Objective: Define standards for building secure, performant, and maintainable Node.js applications.

## 1. Runtime & Version

- Pin the Node.js version using **one** of: `.nvmrc`, `.node-version`, or `engines` field in `package.json`. All three should agree to avoid ambiguity.
- Use the latest **LTS (Long-Term Support)** release for production. Never run production on an odd-numbered (Current/unstable) release.
- Use a version manager (`fnm`, `mise`, or `nvm`) for consistent environments across development, CI, and developer machines.
- Run `node --version` and `npm --version` as part of CI startup to make the pinned versions visible in logs.

## 2. Package Management

- Use **`npm`** or **`pnpm`** consistently across the project. Never mix package managers. Commit `package-lock.json` (npm) or `pnpm-lock.yaml` (pnpm) to version control.
- Use **`npm ci`** (not `npm install`) in CI pipelines — it does a deterministic, clean install from the lock file and fails if the lock file is outdated.
- Never install project-specific tools globally. Add them to `devDependencies` and invoke via `npx` or npm scripts.
- Run **`npm audit --audit-level=high`** in CI. Fail on `high` or `critical` vulnerabilities. Review `moderate` manually.
- Use **Renovate** or **Dependabot** to automate dependency update PRs with grouped, scheduled updates.

## 3. Code Style & Module System

- Lint with **ESLint** (`eslint.config.js` flat config) and format with **Prettier**. Enforce both in CI and via pre-commit hooks (`Husky` + `lint-staged`).
- Use **ES Modules** (`"type": "module"` in `package.json`, `import`/`export` syntax) for all new projects targeting Node.js 18+. Avoid mixing CommonJS (`require`) and ESM in the same package.
- Use **TypeScript** for all non-trivial Node.js projects. Target `"strict": true` and `"noUncheckedIndexedAccess": true`. See `typescript.md` for full TypeScript rules.
- Use **`tsx`** or **`ts-node`** (with `--esm`) for running TypeScript directly in development. Always compile to JavaScript for production (`tsc` or `esbuild`).

## 4. Environment & Configuration

- Use **`dotenv`** (or `dotenv-flow` for multi-environment) for local development. **Never commit `.env` files** — use `.env.example` with placeholder values.
- **Validate all environment variables at startup** using a schema library: `@t3-oss/env-core`, `zod` + `envalid`, or `joi`. Fail immediately with a clear error message if required variables are missing or malformed.
- Access environment variables through a **single config module** (`config/env.ts`). Never scatter `process.env.VARIABLE` calls directly in business logic — it makes testing and auditing impossible.
- Keep secrets (API keys, DB passwords, TLS certs) out of code and `.env` files in production — use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler).

## 5. Async Patterns & Event Loop

- Use **`async`/`await`** for all asynchronous code. Avoid raw callbacks for new code — wrap callback-based APIs with `util.promisify()` or `promisify` from the `node:util` module.
- **Always `await` Promises** and wrap `async` functions in try/catch (or use a catch-all middleware). A floating Promise (not awaited and not `.catch()`-handled) will cause silent failures or unhandled rejections.
- Never **block the event loop** with synchronous I/O (`fs.readFileSync`, `JSON.parse` on large payloads, `crypto.pbkdf2Sync`) in request handlers. Offload CPU-intensive work to **Worker Threads** (`node:worker_threads`) or a child process.
- Use **Streams** (`node:stream`) for processing large files, HTTP uploads, and database result sets — never buffer the entire data set in memory.
- Use **`AbortController`** and **`AbortSignal`** to implement request cancellation for fetch calls, database queries, and long-running operations.

## 6. Security

- **Never use `eval()`, `new Function()`, or `vm.runInNewContext()`** with user-provided input. These execute arbitrary code and are the most critical Node.js security anti-pattern.
- Sanitize and validate all user input at the API boundary before using it in file paths, database queries, or shell execution. Use `path.resolve()` + `path.startsWith()` checks to prevent **directory traversal** attacks.
- **Never use `child_process.exec()` with user input** — it invokes a shell and is vulnerable to command injection. Use `child_process.execFile()` or `spawn()` with an argument array instead.
- Use **Helmet** (`helmet` middleware) for all HTTP APIs to set security headers (CSP, HSTS, X-Frame-Options, etc.).
- Set **`--max-old-space-size`** and consider using `node --max-http-header-size` to limit attack surface for resource exhaustion.
- Run **`npm audit`** and **`snyk test`** in CI. Scan container images with Trivy.

## 7. Error Handling & Observability

- Register global safety-net handlers: `process.on('uncaughtException', ...)` and `process.on('unhandledRejection', ...)`. **Log the error and exit immediately** (`process.exit(1)`) — attempting recovery after an uncaught exception is unsafe.
- Use **structured logging** (`pino` preferred over `winston` for performance, or `winston` with JSON format). Never use `console.log` in production code — it cannot be queried, correlated, or filtered.
- Add a **request ID** to every incoming HTTP request and include it in all log entries for that request. Use `crypto.randomUUID()` or `nanoid` for generation.
- Instrument with **OpenTelemetry** (`@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`). This provides automatic tracing for HTTP, gRPC, and database calls with zero code changes.
- Expose a **`/health`** (readiness) and **`/live`** (liveness) endpoint. Health must verify database connectivity and dependent service reachability.
- Run Node.js behind a process manager (`PM2 cluster mode`) or a container orchestrator (Docker/Kubernetes) for automatic restarts and zero-downtime deployments. Never daemonize manually.
