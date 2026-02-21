# General Configuration Best Practices

> **Note**: This file defines the core behavior and operational standards,
> focusing on general best practices independent of specific tools.

## 1. Core Principles

- **Language**:
  - MUST use **Simplified Chinese (简体中文)** for all communication and documentation.
  - Code and code comments MUST be in English.
  - Git commit messages MUST be in English.

- **Standards**:
  - Strictly follow `.aiconfig` conventions.
  - Maintain **idempotency** in code and configuration to avoid errors from repeated execution.

- **Compatibility**:
  - **Full Compatibility**: MUST support **Linux (Debian/RedHat/Alpine)**, **macOS**, and **Windows** simultaneously.
  - Avoid hard-coding system-specific paths or commands; adapt dynamically based on the operating system.

## 2. Coding & Tools

- **Network Operations**:
  - **Retry Mechanism**: When using network tools (e.g., `curl`, `wget`, or scripts) to download resources, a retry mechanism **MUST** be configured.
  - **Proxy**: When downloading GitHub resources, the `{{ github_proxy }}` prefix (or equivalent variable) **MUST** be added before the URL to ensure stable access.

- **Communication Context**:
  - **Emoji Usage**: Use moderate emojis in responses while maintaining professionalism, clarity, and structure. Emojis should only be used to emphasize key points and mark structure, without compromising the rigor of technical content.

## 3. Security & Audit

- **Configuration Management**:
  - **Explicit Definition**: All configurations (e.g., GPG, SSH) should explicitly specify key parameters (e.g., Key ID) to ensure auditability and reproducibility.
  - **Clean Config**: Configuration files should remain "clean", avoiding irrelevant version numbers, greetings, or non-functional comments (`no-emit-version`, `no-greeting`).

- **Privacy**:
  - Avoid printing sensitive information in logs or output.
