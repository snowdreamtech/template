# Security & Compliance Guidelines

> Objective: Define rules for handling sensitive information, credentials, access control, and vulnerability management to reduce security risk and compliance exposure.

## 1. Credential & Secret Management

- All keys, tokens, passwords, and certificates **MUST NOT** appear in the repository — including commit history, comments, log files, and CI environment dumps.
- Use environment variables or secret management systems (HashiCorp Vault, AWS Secrets Manager, GitHub Secrets, Azure Key Vault, GCP Secret Manager) for all secrets.
- Provide a `.env.example` listing all required variables with placeholder values and descriptions. **Never commit a real `.env`** or any equivalent secrets file.
- Prevent accidental commits using pre-commit tools: **git-secrets**, **gitleaks**, or **detect-secrets**. Configure these checks in CI as a hard gate.
- Rotate secrets immediately upon any suspected or confirmed exposure. Revoke the old credentials before generating new ones. Document the rotation in an incident log.
- Use short-lived credentials wherever possible (OAuth 2.0 access tokens, AWS STS, Workload Identity) over long-lived static credentials.

## 2. Access Control & Auditing

- Apply the **Principle of Least Privilege**: grant users, services, and processes only the permissions they need to perform their specific function. Default to deny-all; explicitly whitelist required accesses.
- Implement **Role-Based Access Control (RBAC)** with clearly defined roles. Avoid sharing service accounts between unrelated services.
- Retain **audit logs** for all critical operations: secret access, permission changes, deployments, database schema changes, and administrative actions. Log format MUST include: `actor`, `timestamp`, `operation`, `resource`, and `outcome`.
- Review permissions regularly (at minimum quarterly, or after personnel changes). Revoke stale or over-broad access promptly.
- Use **multi-factor authentication (MFA)** for all human accounts with access to production systems, CI/CD pipelines, or cloud consoles. Enforce MFA at the Identity Provider level.

## 3. Encryption & Transport Security

- All network communication MUST use **TLS 1.2+**. Prefer TLS 1.3 for new services. Redirect all HTTP traffic to HTTPS. Set `Strict-Transport-Security` (HSTS) headers with `max-age ≥ 31536000` for user-facing services.
- Use **mTLS** or encrypted channels for internal service-to-service communication in sensitive environments (financial, healthcare, PII-handling).
- For sensitive data at rest (backups, exports, PII fields in databases), use strong encryption (AES-256-GCM) and document key management procedures including rotation schedule.
- Never store passwords in plaintext or with weak hashing (MD5, SHA-1, unsalted SHA-256). Use **bcrypt** (cost ≥ 12), **scrypt**, or **Argon2id** with a sufficient cost factor. Use a unique salt per credential.
- Key rotation SLA: encryption keys MUST be rotated at least annually; credentials for critical systems (DB, cloud root) MUST be rotated at least every 90 days.

## 4. Security Scanning & Dependency Hygiene

- Enable **automated dependency vulnerability scanning** in CI: Dependabot (GitHub), Snyk, OWASP Dependency-Check, or language-specific tools (`npm audit --audit-level=high`, `cargo audit`, `safety check`).
- Run **Static Application Security Testing (SAST)** in CI: CodeQL, Semgrep, Bandit (Python), SpotBugs (Java), or equivalent. SAST failures of HIGH or CRITICAL severity MUST block merge.
- Scan container images for OS and package vulnerabilities before pushing to any registry (Trivy, Docker Scout, Snyk Container). Pin base images to a specific SHA digest for reproducibility.
- Generate a **Software Bill of Materials (SBOM)** in CycloneDX or SPDX format for every production release using `syft` or `cyclonedx-cli`. Attach to the release artifact.
- CVE remediation SLA: **CRITICAL** within 7 days, **HIGH** within 30 days, **MEDIUM** within 90 days. Document exceptions with an approved risk acceptance record.

## 5. Incident Response & Disclosure

- Establish and document a **security incident response process**: who to notify (on-call, CISO, legal), how to isolate affected systems, how to investigate root cause, and how to remediate. Classify incidents as P1 (Critical), P2 (High), or P3 (Medium) by business impact.
- Define and publish a **responsible disclosure policy** (`SECURITY.md` in the repository root) with a dedicated security contact channel (e.g., security@company.com or HackerOne) and expected response times (acknowledge within 24h, triage within 72h).
- For internal vulnerabilities: fix and validate in staging, deploy to production, then post-deploy disclosure to affected stakeholders. For third-party library CVEs: coordinate with the upstream maintainer before announcing.
- Conduct a **blameless post-mortem** for every P1/P2 security incident: document root cause, timeline, impact scope, and corrective actions. Assign owners and deadlines to all action items.
- Maintain a **security runbook** for each production service: document known attack vectors, detection signals, isolation steps, and recovery procedures.
