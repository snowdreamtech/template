# Security & Compliance Guidelines

> Objective: Define rules for handling sensitive information, credentials, access control, and vulnerability management to reduce security risk and compliance exposure.

## 1. Credential & Secret Management

- All keys, tokens, passwords, and certificates **MUST NOT** appear in the repository — including commit history, comments, and log files.
- Use environment variables or secret management systems (HashiCorp Vault, AWS Secrets Manager, GitHub Secrets, Azure Key Vault) for all secrets.
- Provide a `.env.example` listing all required variables with placeholder values. **Never commit a real `.env`**.
- Rotate secrets immediately upon any suspected exposure, and revoke the old ones.

## 2. Access Control & Auditing

- Apply the **Principle of Least Privilege** everywhere: grant users, services, and processes only the permissions they need to perform their specific function.
- Retain **audit logs** for all critical operations: secret access, permission changes, deployments, database schema changes. Logs must include: actor, timestamp, operation, and outcome.
- Review permissions regularly (quarterly or after personnel changes). Revoke stale or over-broad access promptly.
- Use **multi-factor authentication (MFA)** for all human accounts with access to production systems, CI/CD, or cloud consoles.

## 3. Encryption & Transport Security

- All network communication MUST use **TLS 1.2+**. Redirect all HTTP traffic to HTTPS. Set `HSTS` headers for user-facing services.
- Use **mTLS** or encrypted channels for internal service-to-service communication in sensitive environments.
- For sensitive data at rest (backups, exports, PII fields), use strong encryption (AES-256) and document key management procedures.
- Never store passwords in plaintext or with weak hashing (MD5, SHA-1). Use bcrypt, scrypt, or Argon2 with a sufficient cost factor.

## 4. Security Scanning & Dependency Hygiene

- Enable **automated dependency vulnerability scanning** in CI: Dependabot (GitHub), Snyk, OWASP Dependency-Check, or language-specific tools (`npm audit`, `cargo audit`, `safety`).
- Run **Static Application Security Testing (SAST)** in CI: CodeQL, Semgrep, Bandit (Python), or equivalent.
- Scan container images for OS and package vulnerabilities in CI before pushing to a registry (Trivy, Docker Scout, Snyk).
- Resolve **CRITICAL** and **HIGH** severity findings within a defined SLA (e.g., 7 days for CRITICAL, 30 days for HIGH).

## 5. Incident Response & Disclosure

- Establish and document a **security incident response process**: who to notify, how to isolate, how to investigate, and how to remediate.
- Define and publish a **responsible disclosure policy** (`SECURITY.md` in the repository root) with a contact channel and expected response times.
- For internal vulnerabilities, follow a **coordinated disclosure** process: fix and deploy before public disclosure. For third-party library CVEs, coordinate with the upstream maintainer.
- Conduct a **post-mortem** for every significant security incident: document root cause, timeline, impact, and corrective actions to prevent recurrence.
