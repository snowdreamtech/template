# Architecture & Project Structure

## 1. Cross-Platform Design

- **Path Handling**: Always use `path.join()` or equivalent cross-platform path functions. Never hard-code `/` or `\` separators.
- **Line Endings**: Configure `.gitattributes` to normalize line endings (`* text=auto`).
- **Shell Scripts**: When shell scripts are necessary, provide both `.sh` (Unix) and `.ps1` or `.cmd` (Windows) variants, or use cross-platform runners (e.g., `npx`, `python`).
- **Environment Variables**: Use `.env` files with a `.env.example` template. Never commit actual `.env` files.

## 2. Dependency Management

- Always pin dependency versions in lock files (`package-lock.json`, `poetry.lock`, etc.).
- Lock files MUST be committed to version control.
- The `node_modules/`, `venv/`, `skills/` directories MUST be in `.gitignore`.

## 3. Configuration Hierarchy

- Project-level configuration takes precedence over global configuration.
- Environment-specific overrides (dev, staging, production) should use environment variables or dedicated config files.
- Sensitive values (API keys, passwords, tokens) MUST be stored in environment variables or secret management systems, never in source code.

## 4. Project File Organization

```text
project-root/
├── .agent/           # AI agent configuration
│   ├── rules/        # Unified AI rules (Single Source of Truth)
│   ├── skills/       # AI skills (symlinks, auto-managed)
│   └── workflows/    # AI workflows (project-owned)
├── .agents/          # AI agent skills source (auto-managed)
│   └── skills/       # Skills source code (downloaded packages)
├── .github/          # GitHub-specific configuration
├── .vscode/          # VS Code settings
├── src/              # Source code
├── tests/            # Test files
├── docs/             # Documentation
└── scripts/          # Build and utility scripts
```
