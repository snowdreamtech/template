# Security & Compliance Guidelines

> Objective: Define rules for handling sensitive information, credentials, access control, and vulnerability management to reduce security risk and compliance exposure.

## 1. Credential & Secret Management

- All keys, tokens, passwords, and certificates **MUST NOT** appear in the repository — including commit history, comments, log files, and CI environment dumps. Use tools like **gitleaks** or **truffleHog** to scan history.
- Use environment variables or dedicated secret management systems for all secrets:
  - **GitHub**: GitHub Secrets (Actions), GitHub Environments
  - **AWS**: AWS Secrets Manager, AWS Parameter Store
  - **GCP**: GCP Secret Manager
  - **HashiCorp Vault**: for multi-cloud, self-hosted, or cross-platform requirements
  - **Azure**: Azure Key Vault
- Provide a `.env.example` listing all required variables with placeholder values and descriptions. **Never commit a real `.env`** or any equivalent secrets file:
  ```bash
  # .env.example — commit this
  DATABASE_URL=postgres://user:password@localhost:5432/mydb   # PostgreSQL connection string
  JWT_SECRET=<replace-with-random-256bit-secret>              # OpenSSL: openssl rand -hex 32
  STRIPE_SECRET_KEY=sk_live_<your-stripe-secret-key>         # From Stripe Dashboard
  ```
- Prevent accidental commits using pre-commit hooks: **git-secrets**, **gitleaks**, or **detect-secrets**. Configure as a CI hard gate that blocks the entire pipeline on any detected secret:
  ```bash
  gitleaks detect --source . --report-format json --exit-code 1
  ```
- Rotate secrets immediately upon any suspected or confirmed exposure. Revoke the old credentials before generating new ones. Document the rotation in an incident log with timestamp and actor.
- Use **short-lived credentials** wherever possible (OAuth 2.0 access tokens with short TTL, AWS STS AssumeRole, GCP Workload Identity, Kubernetes service account tokens) over long-lived static credentials.

## 2. Access Control & Auditing

- Apply the **Principle of Least Privilege**: grant users, services, and processes only the permissions they need to perform their specific function. Default to deny-all; explicitly allow required accesses. Review at every permission request.
- Implement **Role-Based Access Control (RBAC)** with clearly defined roles. Avoid sharing service accounts between unrelated services — each service has its own identity.
- Retain **audit logs** for all critical operations: secret access, permission changes, deployments, database schema changes, and administrative actions. Log format MUST include:
  ```json
  {
    "timestamp": "2025-01-15T10:30:00Z",
    "actor": "service-account@project.iam",
    "operation": "secrets.read",
    "resource": "projects/myapp/secrets/database-password",
    "outcome": "success",
    "requestId": "req-abc-123"
  }
  ```
- Review permissions regularly (at minimum quarterly, or after personnel changes). Revoke stale or over-broad access promptly. Maintain a permission inventory.
- Use **multi-factor authentication (MFA)** for all human accounts with access to production systems, CI/CD pipelines, or cloud consoles. Enforce MFA at the Identity Provider level (Okta, Google Workspace, Entra ID). Hardware keys (YubiKey) are preferred over TOTP for privileged accounts.
- For service-to-service communication: use **mTLS** or signed JWT assertions instead of shared secrets where possible.

## 3. Encryption & Transport Security

- All network communication MUST use **TLS 1.2+**. Prefer TLS 1.3 for new services. Redirect all HTTP traffic to HTTPS. Set `Strict-Transport-Security` (HSTS) headers with `max-age ≥ 31536000; includeSubDomains` for all user-facing services.
- Disable insecure protocol versions and cipher suites. Require forward secrecy (ECDHE) in TLS configurations. Validate TLS configurations with **SSL Labs** for public services.
- Use **mTLS** or encrypted channels for internal service-to-service communication in sensitive environments (financial, healthcare, PII-handling).
- For sensitive data at rest (backups, exports, PII fields in databases), use strong encryption:
  - Symmetric: **AES-256-GCM** (preferred), AES-256-CBC with HMAC
  - Asymmetric: RSA-4096 or ECC P-256 for key exchange
  - Document key management procedures including rotation schedule and recovery
- Never store passwords in plaintext or with weak hashing. Use adaptive algorithms with tunable cost:
  - **Argon2id**: preferred (OWASP recommended) — `m=65536, t=2, p=1` minimum
  - **bcrypt**: cost factor ≥ 12 (1 second+ on modern hardware)
  - **scrypt**: `N=32768, r=8, p=1` minimum
  - Use a unique salt per credential (most libraries handle this automatically)
- Key rotation SLA: encryption keys MUST be rotated at least annually. Credentials for critical systems (DB root, cloud admin) MUST be rotated at least every **90 days**.

## 4. Security Scanning & Dependency Hygiene

- Enable **automated dependency vulnerability scanning** in CI as a hard gate:
  ```yaml
  # GitHub Actions example
  - name: Security audit
    run: |
      npm audit --audit-level=high --production          # Node.js
      pip-audit --requirement requirements.txt           # Python
      cargo audit                                         # Rust
      govulncheck ./...                                   # Go
  ```
- Run **Static Application Security Testing (SAST)** in CI. SAST failures at HIGH or CRITICAL severity MUST block merge:
  - **CodeQL** (GitHub) — supports C/C++, Go, Java, Python, Ruby, JavaScript
  - **Semgrep** — fast, rule-based, supports all major languages
  - **Bandit** (Python), **SpotBugs** (Java), **gosec** (Go), **Brakeman** (Rails)
- Scan container images for OS and package vulnerabilities before pushing to any registry:
  ```bash
  trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
  ```
  Pin base images to a specific SHA digest for reproducibility: `FROM node:22-alpine@sha256:<digest>`.
- Generate a **Software Bill of Materials (SBOM)** in CycloneDX or SPDX format for every production release:
  ```bash
  syft myapp:latest -o cyclonedx-json > sbom.json
  cosign attest --type cyclonedx --predicate sbom.json myapp:latest
  ```
- CVE remediation SLA:
  | Severity | Resolution Deadline |
  |----------|-------------------|
  | Critical | 7 days |
  | High | 30 days |
  | Medium | 90 days |
  | Low | Next planned maintenance |

## 5. Incident Response & Disclosure

- Establish and document a **security incident response process**: who to notify (on-call engineer, CISO, legal, affected customers), how to isolate affected systems, how to investigate root cause, and how to remediate. Classify incidents:
  - **P1 (Critical)**: active exploitation, data breach, production service down
  - **P2 (High)**: potential exploitation, significant security degradation
  - **P3 (Medium)**: vulnerability identified but not yet exploited
- Define and publish a **responsible disclosure policy** (`SECURITY.md` in the repository root):

  ```markdown
  # Security Policy

  ## Reporting a Vulnerability

  Please report security vulnerabilities to: security@example.com
  We will acknowledge within 24 hours and triage within 72 hours.

  Please do not publicly disclose the vulnerability before we have
  had a chance to assess and release a fix.
  ```

- For internal vulnerabilities: fix and validate in staging, deploy to production, then disclose to affected stakeholders post-deploy.
- Conduct a **blameless post-mortem** for every P1/P2 security incident within 5 business days: root cause, timeline, impact scope, and corrective actions with owners and deadlines.
- Maintain a **security runbook** for each production service: known attack vectors, detection signals, isolation steps, and recovery procedures. Link runbooks from every dashboard alert.

## 6. Application Security Design

- **Input Validation**: Validate ALL external inputs (HTTP body, query params, path params, headers, file uploads) at the API boundary. Never trust client-supplied data:

  ```typescript
  // ✅ Validate with Zod at the API layer
  const CreateUserSchema = z.object({
    email: z.string().email().max(255),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_-]+$/),
    age: z.number().int().min(18).max(150),
  });

  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  ```

- **OWASP Top 10** must be addressed in every web application:
  - **A01 Broken Access Control**: enforce authorization checks on every operation — not just at the route level
  - **A02 Cryptographic Failures**: use strong algorithms (AES-256, SHA-256+), never hand-roll crypto
  - **A03 Injection**: use parameterized queries for all database access; never concatenate user input into queries
  - **A04 Insecure Design**: threat model during design phase, not after
  - **A05 Security Misconfiguration**: harden all defaults; disable debug endpoints, directory listings, and verbose error messages in production
  - **A07 Authentication Failures**: use proven auth libraries, implement MFA, use secure session management

- **Security HTTP Headers**: Set security headers on all HTTP responses using a middleware or reverse proxy:

  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

- **Rate Limiting & Abuse Prevention**: Apply rate limiting on all authentication, signup, password-reset, and data-export endpoints. Use sliding-window algorithms with IP + user-based limits. Return `429 Too Many Requests` with a `Retry-After` header.
