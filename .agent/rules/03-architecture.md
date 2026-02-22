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
├── .agent/              # AI agent configuration (primary)
│   ├── rules/           # Unified AI rules (Single Source of Truth)
│   ├── skills/          # AI skills (symlinks, auto-managed)
│   └── workflows/       # AI workflows (project-owned)
├── .agents/             # AI agent skills source (auto-managed)
│   └── skills/          # Skills source code (downloaded packages)
├── .github/             # GitHub-specific configuration (Copilot)
├── .vscode/             # VS Code settings
├── src/                 # Source code
├── tests/               # Test files
├── docs/                # Documentation
└── scripts/             # Build and utility scripts
```

## 5. AI IDE Configuration Files

This project uses a **redirect pattern** to maintain a Single Source of Truth:
all AI IDE config files point to `.agent/rules/` for actual rules.

### Root-level redirect files

| File | AI IDE |
|------|--------|
| `CLAUDE.md` | Claude Code |
| `AGENTS.md` | OpenAI Codex / Generic agents |
| `CONVENTIONS.md` | Generic convention readers |
| `codex.md` | OpenAI Codex |
| `.cursorrules` | Cursor (legacy) |
| `.clinerules` | Cline (legacy) |
| `.windsurfrules` | Windsurf (legacy) |
| `.replit.agent.md` | Replit Agent |
| `.aider.conf.yml` | Aider (YAML format) |
| `.coderabbit.yaml` | CodeRabbit (YAML format) |
| `sweep.yaml` | Sweep AI (YAML format) |
| `.pr_agent.toml` | Qodo PR-Agent (TOML format) |

### IDE-specific directories

Each directory contains a redirect rules file:

| Directory | Rules File | AI IDE |
|-----------|-----------|--------|
| `.claude/` | `CLAUDE.md` | Claude Code |
| `.cursor/` | `rules/rules.md`, `rules/rules.mdc` | Cursor |
| `.windsurf/` | `rules/rules.md` | Windsurf |
| `.github/` | `copilot-instructions.md`, `instructions/rules.instructions.md` | GitHub Copilot |
| `.gemini/` | `GEMINI.md` | Gemini |
| `.cline/` | `rules/rules.md` | Cline |
| `.roo/` | `rules/rules.md` | Roo Code |
| `.augment/` | `rules/rules.md` | Augment |
| `.amazonq/` | `rules/rules.md` | Amazon Q |
| `.continue/` | `rules/rules.md` | Continue |
| `.trae/` | `rules/project_rules.md` | Trae |
| `.kiro/` | `steering/rules.md` | Kiro |
| `.goose/` | `.goosehints` | Goose |
| `.junie/` | `guidelines.md` | Junie |
| `.codex/` | `rules.md` | OpenAI Codex |
| `.void/` | `rules.md` | Void IDE |
| `.aide/` | `rules.md` | Aide IDE |
| `.devin/` | `settings.md` | Devin AI |
| `.kilocode/` | `rules/rules.md` | Kilocode |
| `.openhands/` | `microagents/rules.md` | OpenHands |
| `.bob/` | `rules.md` | Bob AI |
| `.cortex/` | `rules.md` | Cortex |
| `.zencoder/` | `rules/rules.md` | Zencoder |
| `.opencode/` | `rules.md` | OpenCode |
| `.pearai/` | `rules.md` | PearAI |
| `.melty/` | `rules.md` | Melty |
| `.zed/` | `agent/rules.md` | Zed IDE |
| + 15 more | `rules.md` | Various AI IDEs |
