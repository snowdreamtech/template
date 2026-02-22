# Local Development & Environment Guidelines

> Objective: Define developer startup, common scripts, and cross-platform considerations.

## 1. Environment Startup

- Provide cross-platform entry points in a `Makefile` or `scripts/` (use Node or Python scripts to avoid shell-specific syntax).
- Provide `.env.example` and startup steps documentation.

## 2. Scripts & Tools

- Common commands should be placed in `scripts/` or `scripts` in `package.json`, making them easy to invoke via `npm run` or `make`.
- Scripts should provide `--help` or print their usage purpose.

## 3. Cross-Platform Compatibility

- Avoid hardcoding path separators in scripts; use Node's `path` or Python's `os.path`.
- If platform-specific commands are needed, provide alternative implementations or explain them in the README.
