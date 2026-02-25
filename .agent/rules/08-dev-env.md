# Local Development & Environment Guidelines

> Objective: Define standards for environment consistency, developer experience, cross-platform compatibility, and effective local debugging.

## 1. Environment Consistency

### Runtime Version Management

- Use a **language/runtime version manager** to pin exact runtime versions. Versions MUST be committed to the repository:

  ```toml
  # .mise.toml — recommended for polyglot projects
  [tools]
  node   = "22.12.0"
  python = "3.12.8"
  go     = "1.23.4"
  java   = "21.0.5"

  [env]
  NODE_ENV = "development"
  ```

  Supported managers: `mise` (polyglot, recommended), `nvm`/`fnm` (Node.js), `pyenv` (Python), `asdf` (deprecated but widely used).

- All three of these SHOULD agree to avoid version ambiguity between tools: `.nvmrc` / `.node-version`, `engines` field in `package.json`, and `.mise.toml`.

### Environment Variables

- Provide a `.env.example` file listing all required environment variables with placeholder values and clear descriptions:

  ```bash
  # .env.example — commit this file, never the real .env

  # Database
  DATABASE_URL=postgres://user:password@localhost:5432/myapp_dev

  # Auth
  JWT_SECRET=<generate-with: openssl rand -hex 32>
  JWT_EXPIRES_IN=7d

  # External APIs
  STRIPE_SECRET_KEY=sk_test_<your-test-key>        # Stripe Dashboard → Developers
  SENDGRID_API_KEY=SG.<your-api-key>               # SendGrid → Settings → API Keys

  # Feature Flags
  ENABLE_NEW_CHECKOUT=false
  ```

- Never commit a real `.env`. Add `*.env` (except `.env.example`) to `.gitignore`. For team secret sharing, use **Doppler**, **1Password CLI**, or **dotenv-vault** with encrypted `.env.vault`.
- Document ALL required environment variables. Undocumented variables are a source of confusion and broken onboarding.

## 2. Development Container

### devcontainer.json

- Provide a **`devcontainer.json`** (VS Code Dev Containers / GitHub Codespaces) or a **`docker-compose.yml`** for the full development stack. This ensures any developer can reproduce the environment in one command:

  ```json
  // .devcontainer/devcontainer.json
  {
    "name": "MyApp Development",
    "image": "mcr.microsoft.com/devcontainers/node:22-bookworm",
    "forwardPorts": [3000, 5432, 6379],
    "postCreateCommand": "npm ci && cp .env.example .env",
    "features": {
      "ghcr.io/devcontainers/features/docker-in-docker:2": {},
      "ghcr.io/devcontainers/features/git:1": {}
    },
    "customizations": {
      "vscode": {
        "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode", "ms-vscode.vscode-typescript-next"]
      }
    },
    "mounts": ["source=${localWorkspaceFolder}/.env,target=/workspaces/myapp/.env,type=bind"]
  }
  ```

- The devcontainer image MUST be pinned to a specific tag or SHA digest. Never use `latest` in a devcontainer image reference — it breaks reproducibility.
- For services requiring GPU compute (ML/AI workloads), provide a separate `devcontainer.gpu.json` or Docker Compose profile.

## 3. Scripts & Commands

### Standard Task Targets

- Define all common developer tasks as scripts in `Makefile`, `package.json` (`scripts`), or a `scripts/` directory. Mandatory targets:

  | Target          | Purpose                                      |
  | --------------- | -------------------------------------------- |
  | `dev` / `start` | Run the application locally with hot reload  |
  | `test`          | Run the full test suite                      |
  | `test:unit`     | Run unit tests only (fast feedback)          |
  | `lint`          | Run all linters and formatters in check mode |
  | `lint:fix`      | Auto-fix linting and formatting issues       |
  | `typecheck`     | Run type checker without emitting files      |
  | `build`         | Produce a production-ready artifact          |
  | `clean`         | Remove generated artifacts and caches        |
  | `db:migrate`    | Apply pending database migrations            |
  | `db:seed`       | Seed the development database                |

  ```makefile
  # Makefile
  .PHONY: dev test lint build clean
  dev:     ## Start development server with hot reload
           npm run dev
  test:    ## Run full test suite
           npm run test
  lint:    ## Lint and format check
           npm run lint && npm run typecheck
  build:   ## Production build
           npm run build
  ```

- Scripts MUST use explicit exit codes (`0` = success, non-zero = failure). Always `set -euo pipefail` (bash) to prevent silent failures.
- Use cross-platform compatible tooling (`npx`, `python`, Node.js scripts) when the project targets Windows contributors.

## 4. Pre-commit Hooks

### Hook Configuration

- Use **Husky + lint-staged** (Node.js), **pre-commit** (Python), or equivalent to run fast checks before every commit:

  ```json
  // package.json — lint-staged config
  {
    "lint-staged": {
      "*.{ts,tsx,js,jsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
      "*.{css,scss}": ["prettier --write", "stylelint --fix"],
      "*.{md,json,yaml,yml}": ["prettier --write"],
      "*.sh": ["shellcheck --severity=warning"]
    }
  }
  ```

  ```yaml
  # .pre-commit-config.yaml (Python projects)
  repos:
    - repo: https://github.com/astral-sh/ruff-pre-commit
      rev: v0.9.0
      hooks:
        - id: ruff
          args: [--fix]
        - id: ruff-format
    - repo: https://github.com/pre-commit/pre-commit-hooks
      rev: v5.0.0
      hooks:
        - id: detect-private-key
        - id: check-merge-conflict
  ```

- Keep pre-commit hooks **fast** (target < 5 seconds). Run hooks only on staged files. Move slow checks (full test suite, E2E) to CI.
- Commit message validation with **commitlint** enforcing Conventional Commits:

  ```javascript
  // commitlint.config.js
  export default { extends: ["@commitlint/config-conventional"] };
  ```

- Pre-commit configuration MUST be committed to the repository so all team members use identical hooks. Document how to install hooks in `CONTRIBUTING.md`.

## 5. Debugging & Observability

### Debug Configuration

- Configure **structured local logging** with log-level support. Provide one-line instructions to enable verbose logging:

  ```bash
  LOG_LEVEL=debug npm run dev     # Node.js
  RUST_LOG=debug cargo run        # Rust
  DEBUG=* node server.js          # Express/Node.js debug namespace
  ```

- Provide **launch configurations** committed to the repository for debugger attach:

  ```json
  // .vscode/launch.json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "type": "node",
        "request": "attach",
        "name": "Attach to Node.js",
        "port": 9229,
        "sourceMaps": true,
        "outFiles": ["${workspaceFolder}/dist/**/*.js"]
      },
      {
        "type": "node",
        "request": "launch",
        "name": "Run Tests (Vitest)",
        "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
        "args": ["run", "--reporter=verbose"]
      }
    ]
  }
  ```

- Maintain a `CONTRIBUTING.md` with step-by-step local setup instructions, prerequisites, and a **troubleshooting section**. A new team member MUST be able to run the project within 15 minutes.
- Document the approved **profiling approach** per language:
  - Node.js: `node --prof server.js` + `node --prof-process isolate-*.log`
  - Python: `py-spy record -o profile.svg -- python myapp.py`
  - Go: `go tool pprof` + `runtime/pprof` package
  - Rust: `cargo flamegraph`

## 6. Onboarding Automation

- Provide a **`scripts/setup.sh` (or `setup.ps1`)** that automates the full onboarding sequence: runtime installation, dependency install, `.env` copy, database creation/migration, and seed data loading:

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail

  echo "🔧 Setting up development environment..."

  # Verify required tools
  command -v node >/dev/null || { echo "Error: node not found. Run: mise install"; exit 1; }
  command -v docker >/dev/null || { echo "Error: docker not found."; exit 1; }

  # Install dependencies
  npm ci

  # Configure environment
  [ -f .env ] || cp .env.example .env
  echo "⚠️  Please review and fill in .env before continuing."

  # Start services and run migrations
  docker compose up -d postgres redis
  sleep 3   # wait for postgres to be ready
  npm run db:migrate
  npm run db:seed

  echo "✅ Setup complete. Run: npm run dev"
  ```

  Scripts MUST be idempotent — safe to run multiple times without causing errors or duplicate data.

- Track **onboarding time**: periodically measure how long it takes a new developer to go from `git clone` to a passing test run. The target is **≤ 15 minutes**. Failures to meet this SLA MUST be treated as developer experience bugs.

- Automate dependency **health checks** using a `scripts/check-env.sh` that validates all required tools, versions, and services before any developer runs the project:

  ```bash
  #!/usr/bin/env bash
  # Check minimum required tool versions
  NODE_VERSION=$(node --version | sed 's/v//')
  MIN_NODE="20.0.0"

  # Compare semver (simplified)
  if [ "$(printf '%s\n' "$MIN_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$MIN_NODE" ]; then
    echo "❌ node $NODE_VERSION < required $MIN_NODE. Run: mise install"
    exit 1
  fi

  echo "✅ All environment checks passed"
  ```
