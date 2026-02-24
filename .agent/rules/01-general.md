# General Configuration Best Practices

> This file defines the core behavior and operational standards, focusing on general best practices independent of specific tools.

## 1. Language & Communication

- MUST use **Simplified Chinese (简体中文)** for all user-facing communication and documentation (README, user guides, error messages presented to end-users).
- Code, code comments, Git commit messages, and internal API documentation MUST be in **English**.
- Documentation is layered: technical specs and inline docs → English; product documentation and user-facing changelogs → Simplified Chinese.
- Never use machine-translated text directly. All Chinese documentation must be written or reviewed by a human fluent in Chinese.
- Emoji usage: use moderately to emphasize key points and mark structure, while maintaining professionalism and technical rigor. Avoid emoji in code comments, commit messages, or error messages.

## 2. Standards & Idempotency

- Strictly follow `.aiconfig` conventions where present in the project.
- Maintain **idempotency** in all scripts, infrastructure, and configuration: running any operation multiple times MUST produce the same result as running it once. Idempotency check: re-run the script/apply and verify state is identical.
- Prefer **declarative** over imperative configuration (e.g., desired-state IaC over ad-hoc shell scripts). Declarative configs are self-documenting and inherently idempotent.
- Avoid side effects in initialization code. Setup scripts must be safe to re-run without human intervention.
- When a non-idempotent operation is unavoidable, guard it explicitly (existence check, `CREATE IF NOT EXISTS`, `--skip-existing`) and document the reason.

## 3. Cross-Platform Compatibility

- **Full Compatibility**: All scripts, tooling, and automation MUST support **Linux (Debian/RedHat/Alpine)**, **macOS**, and **Windows** simultaneously.
- Avoid hard-coding system-specific paths or commands. Adapt dynamically:
  - Use `path.join()` (Node.js), `os.path.join()` / `pathlib.Path` (Python), `filepath.Join()` (Go).
  - Detect OS at runtime: `process.platform`, `sys.platform`, `runtime.GOOS`.
- When shell scripts are required, provide both `.sh` (Unix/POSIX) and `.ps1` (Windows PowerShell) variants, or use a cross-platform runner (`npx`, `python`, `node`).
- Normalize line endings: configure `.gitattributes` with `* text=auto` to prevent CRLF/LF conflicts across platforms.
- Test on all target platforms in CI using matrix builds (`runs-on: [ubuntu, macos, windows]`).

## 4. Network Operations

- **Retry Mechanism**: When using network tools (`curl`, `wget`, scripts) to download resources, a retry mechanism **MUST** be configured.
  - `curl`: use `--retry 3 --retry-delay 5 --retry-connrefused`.
  - Scripts: implement exponential backoff (1s, 2s, 4s) with a maximum of 5 attempts.
- **Proxy**: When downloading GitHub resources, the `{{ github_proxy }}` prefix (or equivalent variable) **MUST** be added before the URL to ensure stable access in restricted environments. Example: `{{ github_proxy }}https://github.com/org/repo/archive/main.tar.gz`.
- **Checksum Verification**: Validate downloaded artifacts with a checksum (SHA-256) before using them. Store checksums in a separate, version-controlled file (e.g., `checksums.sha256`).
- Configure connection and read timeouts for all HTTP clients. Never use an infinite timeout in production code.
- For services behind a proxy, support `HTTP_PROXY`, `HTTPS_PROXY`, and `NO_PROXY` environment variables.

## 5. Security & Audit

- **Explicit Definition**: All configurations (GPG, SSH, signing keys, certificates) MUST explicitly specify key parameters (Key ID, fingerprint, expiry) to ensure auditability and reproducibility.
- **Clean Config**: Configuration files should remain "clean" — avoid irrelevant version numbers, greetings, or non-functional comments (`no-emit-version`, `no-greeting`).
- Avoid printing sensitive information (API tokens, passwords, PII, internal IPs) in logs, console output, or error messages. Sanitize before logging.
- Follow the **Principle of Least Privilege**: grant only the minimum permissions required. Escalate permissions temporarily and explicitly, then revoke immediately.
- Sensitive data classification (handle accordingly):
  - **Critical**: credentials, private keys, session tokens — never log, never expose in URLs.
  - **Sensitive**: email addresses, user IDs — mask in logs, protect in transit.
  - **Internal**: configuration values, internal URLs — restrict access, do not expose publicly.
