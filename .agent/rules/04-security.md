# Security & Compliance Guidelines

> Objective: Define rules for handling sensitive information, credentials, and auditing to reduce leakage and compliance risks.

## 1. Credential & Key Management

- All keys, tokens, and passwords **MUST NOT** appear in the repository (including commit history).
- Use environment variables or secret management systems (e.g., Vault, GitHub Secrets, Azure Key Vault).
- Provide a `.env.example` but NEVER commit a real `.env`.

## 2. Access & Auditing

- Retain audit logs and record the executor for critical operations (publishing, key creation, permission changes).
- Principle of least privilege: grant permissions on an as-needed basis and review permissions regularly.

## 3. Encryption & Transmission

- The transport layer MUST use TLS/HTTPS. mTLS or encrypted channels are recommended for internal communication.
- For static sensitive data (backups, exports), use strong encryption and record the source of the keys.

## 4. Security Scanning & Dependencies

- Enable dependency vulnerability scanning in CI (e.g., Dependabot, Snyk, OSS-Fuzz).
- Regularly run Static Application Security Testing (SAST) and base image vulnerability scanning.

## 5. Response & Disclosure

- Establish a security incident response process and a list of responsible persons (including contact channels).
- Specify the process and time window for public/private vulnerability disclosure.
