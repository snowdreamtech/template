# Dependency & Release Guidelines

> Objective: Ensure dependencies are reproducible, auditable, and secure, and define a structured release process.

## 1. Locking & Versioning

- Lock files (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `poetry.lock`, `Cargo.lock`, `go.sum`, `Gemfile.lock`, etc.) **MUST** be committed to version control. Never add lock files to `.gitignore`.
- Prefer **exact versions** in production manifests. Avoid broad fuzzy strategies (`^`, `~`, `>=`) unless there is a documented reason; pin with `=` or the lock file equivalent.
- Pin tool and runtime versions alongside dependency versions using version manager config files committed to the repo:
  - Node.js: `.nvmrc` or `.node-version`
  - Python: `.python-version`
  - Multi-language: `.tool-versions` (asdf) or `.mise.toml` (mise)
- Do not upgrade dependencies speculatively. Use automated tools (Dependabot, Renovate) with a scheduled review cadence rather than manual ad-hoc upgrades.

## 2. Dependency Sources & Integrity

- Prioritize **official registries** (npm, PyPI, crates.io, Maven Central, Go module proxy). For enterprise or air-gapped environments, use internal proxies or caches (Nexus, Artifactory, Verdaccio) with upstream mirroring.
- When downloading external resources from scripts or CI, configure a retry mechanism and verify downloaded artifacts with a **checksum** (SHA-256) or digital signature before use. Example: `sha256sum --check checksums.sha256`.
- Never introduce unreviewed prebuilt binaries, native extensions, or pre-compiled wheels without verified sources and documented justification.
- Generate a **Software Bill of Materials (SBOM)** in CycloneDX or SPDX format for every production release (`syft <image>`, `cyclonedx-npm`, etc.) and attach it to the release artifact or container registry metadata.
- Maintain an allowlist of approved dependency registries per project. Block unapproved sources via registry configuration (`.npmrc`, `pip.conf`, `.cargo/config.toml`).

## 3. Dependency Review & Auditing

- Enable **automated vulnerability scanning** in CI — fail the pipeline on HIGH or CRITICAL severity findings:
  - Node.js: `npm audit --audit-level=high` or Snyk
  - Python: `safety check` or `pip-audit`
  - Rust: `cargo audit`
  - Java: OWASP Dependency-Check or Snyk
- CVE remediation SLA (aligned with `04-security.md`):
  | Severity | Resolution Deadline |
  |----------|-------------------|
  | Critical | 7 days |
  | High | 30 days |
  | Medium | 90 days |
  | Low | Next planned maintenance |
- Track and document all **direct dependencies**. Minimize transitive dependency sprawl — prefer libraries with fewer dependencies. Review the full dependency tree on every major version upgrade.
- Evaluate new dependencies against: maintenance activity, license compatibility, known CVE history, and community adoption. Reject abandoned packages (no commit in 12+ months) unless actively forked and maintained internally.

## 4. Release Process

- Define a clear **release branch strategy** aligned to project size:
  - Simple: `main` (production-ready, tagged releases)
  - Standard: `main` (production) + `develop` (integration)
  - Enterprise: `main` + `develop` + `release/x.y.z` (stabilization) + `hotfix/*` (emergency fixes)
- Releases **MUST** pass CI in its entirety (lint, unit tests, integration tests, security scanning) and receive approval from at least one code reviewer before tagging.
- Use **Semantic Versioning** (`MAJOR.MINOR.PATCH`) for all published packages and APIs:
  - `MAJOR`: breaking API changes
  - `MINOR`: backward-compatible features
  - `PATCH`: backward-compatible bug fixes
- Pre-release labels: use `alpha` → `beta` → `rc` progression (e.g., `1.2.0-rc.1`) for staged releases. Never publish a pre-release to the stable channel.
- Tag every release: `git tag -a v1.2.3 -m "Release v1.2.3"` and push the tag to the remote.

## 5. Changelog & Communication

- Maintain a `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) format with Semantic Versioning.
- Every release MUST have a corresponding changelog entry summarizing: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
- Automate changelog generation from Conventional Commit messages using tools like `release-please`, `semantic-release`, or `git-cliff`. Review and edit the generated changelog before publishing.
- For **breaking changes**, provide a dedicated **migration guide** (`docs/migrations/v2-to-v3.md`) with: what changed, why it changed, step-by-step migration instructions, and a deadline for v1 deprecation.
- Announce releases through the project's designated communication channel (GitHub Releases, Slack, mailing list). Include: version number, key changes summary, upgrade instructions link, and known issues.
