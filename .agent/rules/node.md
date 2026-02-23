# Node.js Development Guidelines

> Objective: Define standards for building secure, performant, and maintainable Node.js applications.

## 1. Runtime & Version

- Pin the Node.js version in `.nvmrc`, `.node-version`, or `engines` field in `package.json`.
- Use the latest **LTS (Long-Term Support)** release for production. Never run production on an odd-numbered (Current) release.
- Use a version manager (`nvm`, `fnm`, or `mise`) to ensure consistent environments across development and CI.

## 2. Package Management

- Use **`npm`** or **`pnpm`** consistently (do not mix). Commit the corresponding lock file (`package-lock.json` or `pnpm-lock.yaml`).
- Never install packages globally for project-specific tools. Use `npx` or add them to `devDependencies`.
- Use `npm ci` (not `npm install`) in CI pipelines for deterministic, clean installs from the lock file.
- Audit dependencies regularly: run `npm audit` and resolve critical vulnerabilities.

## 3. Code Style & Tooling

- Lint with **ESLint** and format with **Prettier**. Enforce both in CI and via pre-commit hooks (Husky + lint-staged).
- Use ES Modules (`"type": "module"` in `package.json` and `import`/`export`) for new projects. Avoid mixing CommonJS and ESM in the same project.
- Use TypeScript for all non-trivial Node.js projects. See `typescript.md`.

## 4. Environment & Configuration

- Use `dotenv` (or `dotenv-flow`) for local development. Never commit `.env` files.
- Validate all environment variables at startup using a schema (e.g., Zod, `envalid`). Fail fast if required variables are missing.
- Access environment variables via a single config module — never scatter `process.env.VAR` calls throughout the codebase.

## 5. Error Handling & Process Management

- Handle `uncaughtException` and `unhandledRejection` events at the process level to log fatal errors before exiting.
- Use **structured logging** (e.g., `pino`, `winston`) instead of `console.log` in production.
- Run Node.js behind a process manager (`PM2`) or let the container orchestrator (Docker/K8s) handle restarts. Do not daemonize manually.
