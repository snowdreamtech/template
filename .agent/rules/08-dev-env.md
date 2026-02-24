# Local Development & Environment Guidelines

> Objective: Define standards for environment consistency, developer experience, cross-platform compatibility, and effective local debugging.

## 1. Environment Consistency

- Use a **language/runtime version manager** (`nvm`, `fnm`, `pyenv`, `asdf`, `mise`) to pin exact runtime versions. Prefer `mise` for polyglot projects (supports Node, Python, Go, Java, Ruby, and more in a single `.mise.toml`).
- Pin runtime and tool versions in config files committed to the repo: `.nvmrc` or `.node-version` (Node.js), `.python-version` (Python), `.tool-versions` or `.mise.toml` (multi-language). Include a verification step in onboarding docs.
- Provide a `.env.example` file listing all required environment variables with placeholder or documentation values. Never commit a real `.env`. Use `dotenv-vault` or equivalent for encrypted `.env` sharing within teams.
- Document required system dependencies (Docker, system libraries, compilers) in `docs/setup.md` with version requirements. Automate prerequisite checks in `scripts/check-env.sh`.

## 2. Development Container

- Provide a **`devcontainer.json`** (VS Code Dev Containers / GitHub Codespaces) or a **`docker-compose.yml`** for the full development stack. This ensures any developer can reproduce the environment in one command (`devcontainer up` or `docker compose up`), regardless of their OS.
- `devcontainer.json` MUST include: `name`, `image` or `dockerFile`, `forwardPorts`, `postCreateCommand` (dependency install + setup), and `customizations.vscode.extensions` for recommended IDE extensions.
- For services requiring GPU compute (ML/AI workloads), document GPU resource requirements and provide a separate `devcontainer.gpu.json` or a Docker Compose profile.
- The dev container image MUST be pinned to a specific tag or SHA digest. Never use `latest` in a devcontainer image reference.

## 3. Scripts & Commands

- Define all common developer tasks as scripts in `Makefile`, `package.json` (`scripts`), or a `scripts/` directory. Mandatory targets/scripts:
  - `start` / `dev` — run the application locally with hot reload
  - `test` — run the full test suite
  - `lint` — run all linters and formatters (check mode)
  - `lint:fix` — auto-fix linting and formatting issues
  - `build` — produce a production-ready artifact
  - `clean` — remove generated artifacts and caches
- Scripts MUST be self-documenting: print usage with `--help` when invoked with that flag.
- Scripts MUST use explicit exit codes: `0` = success, non-zero = failure. Always `set -euo pipefail` (bash) or equivalent to prevent silent failures.
- Use cross-platform compatible tooling (e.g., `npx`, `python`, Node.js scripts) instead of Bash-only scripts when the project targets Windows contributors.

## 4. Pre-commit Hooks

- Use **Husky + lint-staged** (Node.js), **pre-commit** (Python), or the equivalent to run checks before every commit:
  - Linting & code formatting
  - Commit message validation (commitlint with Conventional Commits)
  - Banned-pattern checks (e.g., `TODO: fix`, `console.log`, hardcoded secrets)
  - Type checking for statically typed languages
- Keep pre-commit hooks fast (target **< 5 seconds**). Run hooks only on staged files (lint-staged pattern). Move slow checks (full test suite, E2E) to CI.
- Pre-commit configuration MUST be committed to the repository so all team members use the same hooks. Document how to install hooks in `CONTRIBUTING.md`.

## 5. Debugging & Observability

- Configure **structured local logging** with log-level support (`DEBUG`, `INFO`, `WARN`, `ERROR`). Use the `DEBUG` level freely during local development; WARN/ERROR are signal in production. Provide a one-line instruction to enable verbose logging (`LOG_LEVEL=debug npm run dev`).
- Provide **launch configurations** (`.vscode/launch.json`, JetBrains run configs) for the debugger, covering: application start, test runner, and Docker-attached debugging. Commit these to the repo.
- Document **common debugging scenarios** in `docs/debugging.md`: how to attach a debugger to a running container, how to inspect database state, how to replay a failed request.
- For performance issues, document the approved **profiling approach** per language/runtime (e.g., `node --prof`, `py-spy`, `pprof` for Go, `perf` for Linux). Include instructions for generating and reading flame graphs.
- Maintain a `CONTRIBUTING.md` or `docs/setup.md` with step-by-step local setup instructions including prerequisites (Docker, Node version, secrets setup) and a **troubleshooting section** for the most common setup failures. A new team member MUST be able to run the project within 15 minutes.
