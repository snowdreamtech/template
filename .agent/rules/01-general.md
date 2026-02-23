# General Configuration Best Practices

> This file defines the core behavior and operational standards, focusing on general best practices independent of specific tools.

## 1. Language & Communication

- MUST use **Simplified Chinese (简体中文)** for all user-facing communication and documentation (README, comments, reports).
- Code, code comments, and Git commit messages MUST be in **English**.
- Emoji usage: use moderately to emphasize key points and mark structure, while maintaining professionalism and technical rigor.

## 2. Standards & Idempotency

- Strictly follow `.aiconfig` conventions where present in the project.
- Maintain **idempotency** in all scripts, infrastructure, and configuration: running any operation multiple times must produce the same result as running it once.
- Prefer declarative over imperative configuration (e.g., desired-state IaC over ad-hoc scripts).

## 3. Cross-Platform Compatibility

- **Full Compatibility**: All scripts, tooling, and automation MUST support **Linux (Debian/RedHat/Alpine)**, **macOS**, and **Windows** simultaneously.
- Avoid hard-coding system-specific paths or commands. Adapt dynamically based on the operating system using abstractions (`path.join()`, `os.path`, `pathlib`).
- When shell scripts are required, provide both `.sh` (Unix) and `.ps1` (Windows PowerShell) variants, or use a cross-platform runner (`npx`, `python`).

## 4. Network Operations

- **Retry Mechanism**: When using network tools (`curl`, `wget`, scripts) to download resources, a retry mechanism **MUST** be configured (e.g., `curl --retry 3 --retry-delay 5`).
- **Proxy**: When downloading GitHub resources, the `{{ github_proxy }}` prefix (or equivalent variable) **MUST** be added before the URL to ensure stable access in restricted environments.
- Validate downloaded artifacts with a checksum (SHA-256) before using them.

## 5. Security & Audit

- **Explicit Definition**: All configurations (GPG, SSH, signing keys) should explicitly specify key parameters (e.g., Key ID) to ensure auditability and reproducibility.
- **Clean Config**: Configuration files should remain "clean" — avoid irrelevant version numbers, greetings, or non-functional comments (`no-emit-version`, `no-greeting`).
- Avoid printing sensitive information (tokens, passwords, PII) in logs or console output.
- Follow the **Principle of Least Privilege** everywhere: grant only the minimum permissions required for a task to function.
