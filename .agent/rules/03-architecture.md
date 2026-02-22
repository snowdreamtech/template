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
│   └── workflows/       # AI workflows / commands (source of truth)
├── .agents/             # AI agent skills source (auto-managed)
│   ├── commands/        # Command files (source of truth for all IDEs)
│   └── skills/          # Skills source code (downloaded packages)
├── .cline/              # Example IDE dir (all IDE dirs follow this pattern)
│   ├── rules/           # Real folder — IDE-specific rules redirect
│   │   └── rules.md     # Real file — redirects to .agent/rules/
│   ├── commands/        # Real folder — contains file-level symlinks
│   │   ├── speckit.analyze.md  -> .agents/commands/speckit.analyze.md
│   │   └── ...          # 9 speckit command files as symlinks
│   └── skills/          -> .agents/skills/  (directory-level symlink)
├── .github/             # GitHub-specific configuration (Copilot)
├── .vscode/             # VS Code settings
├── src/                 # Source code
├── tests/               # Test files
├── docs/                # Documentation
└── scripts/             # Build and utility scripts
```

## 5. AI IDE Symlink Convention

All AI IDE directories follow a **hybrid symlink pattern** to maintain a Single Source of Truth while allowing per-IDE customization:

| Directory        | Structure                            | Source               |
| ---------------- | ------------------------------------ | -------------------- |
| `.IDE/rules/`    | Real folder, real files              | IDE-specific content |
| `.IDE/commands/` | Real folder, **file-level symlinks** | `.agents/commands/`  |
| `.IDE/skills/`   | **Directory-level symlink**          | `.agents/skills/`    |

**Rationale:**

- `rules/` files are real — each IDE may need slightly different redirect content
- `commands/` files are symlinks — 10 command files (1 init + 9 speckit) are identical across all IDEs; updates to `.agents/commands/` auto-propagate
- `skills/` is a directory symlink — 120 skills are identical; directory-level is simpler than 120 individual symlinks

**Exception — `.gemini/commands/`:** Gemini CLI requires TOML format. This directory contains both:

- `.md` file-level symlinks → `.agents/commands/` (standard pattern)
- `.toml` companion files (embedded full prompt content, Gemini CLI format)

Both `.md` and `.toml` must exist for each command in `.gemini/commands/`.

**Adding a new command:** Edit only `.agents/commands/` — all IDE dirs automatically reflect the change via symlinks. Also add a `.toml` file to `.gemini/commands/`.

**Adding a new IDE:** Create `.newIDE/rules/rules.md` (real), `.newIDE/commands/` (real dir with file symlinks), `.newIDE/skills/` (dir symlink to `.agents/skills/`).

## 6. AI IDE Configuration Files

This project uses a **redirect pattern** to maintain a Single Source of Truth:
all AI IDE config files point to `.agent/rules/` for actual rules.

### Root-level redirect files

| File               | AI IDE                        |
| ------------------ | ----------------------------- |
| `CLAUDE.md`        | Claude Code                   |
| `AGENTS.md`        | OpenAI Codex / Generic agents |
| `CONVENTIONS.md`   | Generic convention readers    |
| `codex.md`         | OpenAI Codex                  |
| `.cursorrules`     | Cursor (legacy)               |
| `.clinerules`      | Cline (legacy)                |
| `.roorules`        | Roo Code (legacy)             |
| `.traerules`       | Trae (legacy)                 |
| `.windsurfrules`   | Windsurf (legacy)             |
| `.replit.agent.md` | Replit Agent                  |
| `.aider.conf.yml`  | Aider (YAML format)           |
| `.coderabbit.yaml` | CodeRabbit (YAML format)      |
| `sweep.yaml`       | Sweep AI (YAML format)        |
| `.pr_agent.toml`   | Qodo PR-Agent (TOML format)   |

### IDE-specific directories

Each directory contains a redirect `rules/rules.md` file, plus `commands/` (file symlinks) and `skills/` (dir symlink):

| Directory       | Rules File                                                      | AI IDE                 |
| --------------- | --------------------------------------------------------------- | ---------------------- |
| `.claude/`      | `CLAUDE.md`                                                     | Claude Code            |
| `.cursor/`      | `rules/rules.md`, `rules/rules.mdc`                             | Cursor                 |
| `.windsurf/`    | `rules/rules.md`                                                | Windsurf               |
| `.github/`      | `copilot-instructions.md`, `instructions/rules.instructions.md` | GitHub Copilot         |
| `.gemini/`      | `GEMINI.md`                                                     | Gemini                 |
| `.cline/`       | `rules/rules.md`                                                | Cline                  |
| `.roo/`         | `rules/rules.md`                                                | Roo Code               |
| `.augment/`     | `rules/rules.md`                                                | Augment                |
| `.amazonq/`     | `rules/rules.md`                                                | Amazon Q               |
| `.continue/`    | `rules/rules.md`                                                | Continue               |
| `.trae/`        | `rules/project_rules.md`                                        | Trae                   |
| `.kiro/`        | `steering/rules.md`                                             | Kiro                   |
| `.goose/`       | `.goosehints`                                                   | Goose                  |
| `.junie/`       | `guidelines.md`                                                 | Junie                  |
| `.codex/`       | `rules/rules.md`                                                | OpenAI Codex           |
| `.void/`        | `rules/rules.md`                                                | Void IDE               |
| `.aide/`        | `rules/rules.md`                                                | Aide IDE               |
| `.devin/`       | `rules/rules.md`                                                | Devin AI               |
| `.kilocode/`    | `rules/rules.md`                                                | Kilocode               |
| `.openhands/`   | `microagents/rules.md`                                          | OpenHands              |
| `.bob/`         | `rules/rules.md`                                                | Bob AI                 |
| `.cortex/`      | `rules/rules.md`                                                | Cortex                 |
| `.zencoder/`    | `rules/rules.md`                                                | Zencoder               |
| `.opencode/`    | `rules/rules.md`                                                | OpenCode               |
| `.pearai/`      | `rules/rules.md`                                                | PearAI                 |
| `.specify/`     | `rules/rules.md`                                                | Specify                |
| `.melty/`       | `rules/rules.md`                                                | Melty                  |
| `.zed/`         | `agent/rules.md`                                                | Zed IDE                |
| `.codeium/`     | `rules/rules.md`                                                | Codeium                |
| `.cody/`        | `rules/rules.md`                                                | Sourcegraph Cody       |
| `.tabnine/`     | `rules/rules.md`                                                | Tabnine                |
| `.supermaven/`  | `rules/rules.md`                                                | Supermaven             |
| `.blackbox/`    | `rules/rules.md`                                                | Blackbox               |
| `.codegeex/`    | `rules/rules.md`                                                | CodeGeeX               |
| `.bito/`        | `rules/rules.md`                                                | Bito                   |
| `.aiassistant/` | `rules/project_rules.md`                                        | JetBrains AI Assistant |
| `.adal/`        | `rules/rules.md`                                                | ADAL                   |
| `.commandcode/` | `rules/rules.md`                                                | CommandCode            |
| `.codebuddy/`   | `rules/rules.md`                                                | CodeBuddy              |
| `.crush/`       | `rules/rules.md`                                                | Crush                  |
| `.factory/`     | `rules/rules.md`                                                | Factory                |
| `.iflow/`       | `rules/rules.md`                                                | iFlow                  |
| `.kode/`        | `rules/rules.md`                                                | Kode                   |
| `.mcpjam/`      | `rules/rules.md`                                                | MCP Jam                |
| `.mux/`         | `rules/rules.md`                                                | Mux                    |
| `.neovate/`     | `rules/rules.md`                                                | Neovate                |
| `.pi/`          | `rules/rules.md`                                                | Pi IDE                 |
| `.pochi/`       | `rules/rules.md`                                                | Pochi                  |
| `.qoder/`       | `rules/rules.md`                                                | Qoder                  |
| `.qwen/`        | `rules/rules.md`                                                | Qwen                   |
| `.shai/`        | `rules/rules.md`                                                | Shai                   |
| `.vibe/`        | `rules/rules.md`                                                | Vibe                   |
