# Local Development & Environment Guidelines

> Objective: Define standards for environment consistency, developer experience, and cross-platform compatibility.

## 1. Environment Consistency

- Use a **language/runtime version manager** (`nvm`, `fnm`, `pyenv`, `asdf`, `mise`) to pin exact runtime versions.
- Pin runtime and tool versions in a config file committed to the repo: `.nvmrc`, `.python-version`, `.tool-versions`.
- Provide a `.env.example` file listing all required environment variables with placeholder or documentation values. Never commit a real `.env`.

## 2. Development Container (Optional but Recommended)

- Provide a **`devcontainer.json`** (VS Code Dev Containers / GitHub Codespaces) or a **`docker-compose.yml`** for the full development stack.
- This ensures any developer can reproduce the environment in one command (`devcontainer up` or `docker compose up`), regardless of their OS.

## 3. Scripts & Commands

- Define all common developer tasks as scripts in `Makefile`, `package.json` (`scripts`), or a `scripts/` directory:
  - `start` / `dev` — run the application locally
  - `test` — run the test suite
  - `lint` — run all linters
  - `build` — build for production
- Scripts should be self-documenting: print usage with `--help` and echo the command being run.
- Use cross-platform compatible tooling (e.g., `npx`, `python`, Node.js scripts) instead of Bash-only scripts when the project targets Windows contributors.

## 4. Pre-commit Hooks

- Use **Husky** (Node), **pre-commit** (Python), or the equivalent to run checks before commits: linting, formatting, and banned-pattern checks.
- Keep pre-commit hooks fast (< 5 seconds). Move slow checks (full test suite) to CI.

## 5. Onboarding

- Maintain a `CONTRIBUTING.md` or `docs/setup.md` with step-by-step local setup instructions, including prerequisites (Docker, Node version, secrets setup).
- Include a **troubleshooting section** for the most common setup failures.
- Keep setup documentation up to date — a new team member should be able to run the project within 15 minutes of following it.
