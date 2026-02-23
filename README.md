# Snowdream Tech AI IDE Template

An enterprise-grade, foundational template designed for multi-AI IDE collaboration. This repository serves as a **Single Source of Truth** for AI agent rules, workflows, and project configurations, supporting over 50 different AI-assisted IDEs seamlessly.

## Features

- **Multi-IDE Compatibility**: Out-of-the-box support for Cursor, Windsurf, GitHub Copilot (Code/CLI), Cline, Roo Code, Trae, Gemini, Claude Code, and dozens of other AI editors.
- **Unified Rule System**: Centralized rule definitions in `.agent/rules/`. Modifying a rule here propagates to all supported 50+ IDEs immediately via safe symlink/redirect patterns.
- **Intelligent Workflows**: Standardized `.agent/workflows/` (commands) such as `speckit.plan`, `speckit.analyze`, and `snowdreamtech.init` available uniformly across supported environments.
- **Secure & Compliant**: Built-in architecture guardrails, strict credential management, and isolated `.gitignore` boundaries.
- **Cross-Platform Ready**: Designed for maximum compatibility across macOS, Linux, and Windows.

## Directory Structure

```text
project-root/
├── .agent/              # 🤖 Canonical AI configuration (The Brain)
│   ├── rules/           # Unified AI behavioral rules (SSoT)
│   └── workflows/       # Unified commands & scripts
├── .github/             # 🐙 GitHub integration & Copilot settings
├── .vscode/             # 💻 Optimized VS Code configurations
├── .cline/              # 🔗 Example of IDE-specific redirect folder (50+ included)
├── .editorconfig        # 📐 Universal layout guardrails
└── src/                 # 📦 Your actual application source code
```

## Getting Started

1.  **Clone the template**.
2.  **Initialize the Environment**:
    Depending on your AI IDE, trigger the initialization command (e.g., typing `snowdreamtech.init` in your IDE's agent chat, or executing the corresponding CLI workflow).
3.  **Read the Rules**:
    Before coding, ensure both you and your AI assistant have read the core principles located at `.agent/rules/01-general.md`.

## AI Interaction Guidelines

This repository strictly enforces interaction rules to prevent "AI hallucinations" and destructive edits. By design, our provided AI IDE settings will redirect the agent to read `.agent/rules/09-ai-interaction.md` upon session startup.

> **Language Notice:** While all technical code, commits, and rule definitions must be in English, all communication with the AI and user-facing documentation should default to **Simplified Chinese (简体中文)**.

## Project Rules Definition

If you wish to augment the AI's behavior, please **do not** modify individual IDE configuration directories directly (e.g., do not edit `.cursorrules` directly if it's a redirect). Instead:

1.  Add or modify markdown files inside `.agent/rules/`.
2.  The existing symlink topology will automatically apply your new rules to all 50+ AI environments.

## License

This project is licensed under the **MIT License**.

Copyright (c) 2026-present [SnowdreamTech Inc.](https://github.com/snowdreamtech)

See the [LICENSE](./LICENSE) file for the full license text.
