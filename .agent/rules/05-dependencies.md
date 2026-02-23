# Dependency & Release Guidelines

> Objective: Ensure dependencies are reproducible, auditable, and secure, and define a structured release process.

## 1. Locking & Versioning

- Lock files (`package-lock.json`, `pnpm-lock.yaml`, `poetry.lock`, `Cargo.lock`, `go.sum`, etc.) **MUST** be committed to version control.
- Prefer exact or tightly-pinned versions. Avoid broad fuzzy strategies (`^`, `~`, `>=`) in production unless there is a documented reason.
- Pin tool and runtime versions alongside dependency versions (e.g., Node version in `.nvmrc`, Python version in `.python-version`).

## 2. Dependency Sources & Integrity

- Prioritize **official registries** (npm, PyPI, crates.io, Maven Central). Use internal proxies or caches (Nexus, Artifactory) for air-gapped or enterprise environments.
- When downloading external resources from scripts, configure a retry mechanism and verify downloaded artifacts with a **checksum** (SHA-256) or digital signature before use.
- Never introduce unreviewed prebuilt binaries or wheels without verified sources.

## 3. Dependency Review & Auditing

- Enable **automated vulnerability scanning** in CI (e.g., `npm audit`, Dependabot, Snyk, `cargo audit`, Safety).
- Regularly review critical runtime dependencies. Establish a policy for updating dependencies with known CVEs within a defined SLA (e.g., critical within 7 days).
- Track and document all direct dependencies. Minimize transitive dependency sprawl.

## 4. Release Process

- Define a clear **release branch strategy** (e.g., `main` = production, `develop` = pre-release, `release/x.y.z` for hotfix branches).
- Releases **MUST** pass CI in its entirety (lint, tests, security scanning) and receive approval from at least one code reviewer before merging.
- Use **Semantic Versioning** (`MAJOR.MINOR.PATCH`) for all published packages and APIs. Document breaking changes in a `CHANGELOG.md`.

## 5. Changelog & Communication

- Maintain a `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) format.
- Every release must have a corresponding changelog entry summarizing: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
- Automate changelog generation from Conventional Commit messages using tools like `release-please`, `semantic-release`, or `git-cliff`.
