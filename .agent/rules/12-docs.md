# Documentation Standards

> Objective: Define mandatory structure, content requirements, and quality standards for all project documentation to ensure consistency, discoverability, and long-term maintainability.

## 1. Documentation Architecture

Every repository MUST maintain the following documentation layers:

| Layer                  | Location                         | Language        | Audience             |
| ---------------------- | -------------------------------- | --------------- | -------------------- |
| Project README         | `README.md` / `README_zh-CN.md`  | EN + zh-CN      | All users            |
| API reference          | `docs/api/` or inline docstrings | English         | Developers           |
| Architecture decisions | `docs/adr/`                      | English         | Engineers            |
| Operations runbooks    | `docs/runbooks/`                 | English + zh-CN | Ops/SRE              |
| Changelog              | `CHANGELOG.md`                   | English         | All users            |
| Contributing guide     | `CONTRIBUTING.md`                | English + zh-CN | Contributors         |
| Security policy        | `SECURITY.md`                    | English         | Security researchers |

Documentation is treated as code — it MUST be versioned, reviewed, and kept in sync with the implementation it describes.

## 2. README Structure

All `README.md` (and `README_zh-CN.md`) files MUST follow the five-section structure below. Sections may be expanded but MUST NOT be omitted.

### Section 1 — Design & Architecture

Explain the fundamental design rationale, architectural patterns, and core responsibilities.

Required content:

- **Overview statement**: one paragraph summarizing what the component does, what problem it solves, and 3–5 key capabilities (bullet list).
- **Architecture diagram**: ASCII art or a linked image (`docs/architecture.png`) showing component relationships and data flow.
- **Design principles**: document the guiding principles specific to this component. Common ones:
  - **Auditable** — every decision is traceable; state changes are logged.
  - **Overridable** — configuration follows a clear priority/namespace hierarchy.
  - **Extensible** — logic is data-driven rather than hard-coded.
  - **Lean** — focused configuration with no unintended side effects.
- **Responsibilities**: explicitly list what this component owns, what it delegates, and where its boundaries are.

### Section 2 — Usage Guide

Provide a complete operational reference for users and integrators.

Required content:

- **Prerequisites**: runtime versions, system dependencies, environment variables required before use.
- **Quick start**: ≤ 5 commands to get the project/component running from scratch.
- **Configuration reference**: table of all parameters — required and optional — with types, defaults, and examples:

  ```markdown
  ### Required parameters

  | Parameter | Description                  | Example                   |
  | --------- | ---------------------------- | ------------------------- |
  | `API_URL` | Base URL of the upstream API | `https://api.example.com` |

  ### Optional parameters

  | Parameter | Description                | Default |
  | --------- | -------------------------- | ------- |
  | `TIMEOUT` | Request timeout in seconds | `30`    |
  ```

- **Workflow patterns** (if applicable): for each mode of operation, document: purpose, step-by-step explanation, code example, and when to use it.
- **File/directory structure**: tree layout annotated with the purpose of each entry.
- **Usage examples**: minimum 3 examples covering simple → advanced scenarios, including CLI invocations and integration snippets.

### Section 3 — Operations Guide

Equip operators with everything needed to deploy, monitor, and recover the component.

Required content:

- **Pre-deployment checklist**: ordered list of prerequisite checks with example commands.
- **Performance considerations**: scale limits (file counts, node counts, memory), optimization recommendations, network/disk I/O constraints.
- **Troubleshooting guide**: minimum 3 common failure scenarios in the format:
  - **Problem**: description of the symptom.
  - **Diagnosis**: commands to confirm the root cause.
  - **Solution**: step-by-step remediation.
- **Maintenance procedures**: routine tasks (log rotation, certificate renewal, schema migrations), update flow, and backup/restore procedures where applicable.

### Section 4 — Security Considerations

Document the security model, best practices, and compliance posture.

Required content:

- **Security model**: authentication mechanism, authorization model, encryption in transit and at rest, secret management approach.
- **Best practices table**:

  ```markdown
  | Aspect           | Requirement                           | Implementation                        |
  | ---------------- | ------------------------------------- | ------------------------------------- |
  | File permissions | Config files owned by service account | `chmod 600 config.yaml`               |
  | Secret storage   | Never committed to VCS                | Use Vault / env vars / secret manager |
  | Audit logging    | All privileged operations logged      | Structured JSON to SIEM               |
  ```

- **Compliance notes**: how the component satisfies audit requirements; `no_log` / log masking usage; data retention policies.
- **Attack surface analysis**: what data is exposed, where secrets reside in the workflow, and mitigation strategies for each exposure.

### Section 5 — Development Guide

Enable contributors to understand the codebase structure and contribute effectively.

Required content:

- **Code organization**: directory layout with module/file responsibilities and naming conventions.
- **Extension points**: how to add new features, override mechanisms, plugin or hook systems.
- **Contribution requirements**:
  - All public API changes require docstring updates.
  - All behavioral changes require test coverage (unit + integration).
  - All documentation changes must keep English and Chinese versions in sync.
  - Commit messages follow Conventional Commits (see `02-coding-style.md`).
- **Local development setup**: steps to bootstrap a local dev environment, run tests, and validate linting.
- **References**: links to related project docs, upstream specifications, and external resources.

## 3. Bilingual Documentation

All user-facing documents MUST provide both language versions:

- `README.md` — English (canonical technical reference)
- `README_zh-CN.md` — Simplified Chinese (accessibility surface)

Synchronization rules:

1. **Content parity**: both versions MUST contain identical information and examples.
2. **Code blocks**: code, variable names, and CLI commands stay in English in both versions.
3. **Simultaneous updates**: a PR that changes one version MUST update the other in the same commit. A PR updating only one language version is insufficient grounds for merge.
4. **Terminology**: maintain a project glossary (`docs/glossary.md`) for consistent term translation — do not translate the same term differently across documents.

## 4. API Documentation

All public APIs, exported functions, and non-obvious code MUST have docstrings in English. Use the idiomatic format for the language:

```typescript
/**
 * Authenticate a user with email and password.
 *
 * @param email - The user's email address (must be verified)
 * @param password - The plaintext password (min 8 chars)
 * @returns A signed JWT access token (expires in 24h)
 * @throws {AuthenticationError} If credentials are invalid
 * @throws {AccountLockedError} After 5 failed attempts
 *
 * @example
 * const token = await authenticate("user@example.com", "secret");
 */
async function authenticate(email: string, password: string): Promise<string> { ... }
```

```python
def parse_config(path: str) -> Config:
    """Parse and validate a YAML configuration file.

    Args:
        path: Absolute path to the YAML configuration file.

    Returns:
        A validated Config object.

    Raises:
        ConfigNotFoundError: If the file does not exist.
        ConfigValidationError: If the file fails schema validation.

    Example:
        >>> cfg = parse_config("/etc/myapp/config.yaml")
    """
```

```go
// ParseConfig reads the configuration from the given file path and returns
// a validated Config struct. Returns ErrConfigNotFound if the file does not
// exist, or ErrInvalidConfig if validation fails.
//
// The file must be a valid YAML document satisfying the schema in
// docs/config-schema.json.
func ParseConfig(path string) (*Config, error) { ... }
```

Deprecation MUST be annotated inline before any public API is removed:

```typescript
/** @deprecated Use `authenticateV2()` instead. This method will be removed in v3.0. */
function authenticate(...) { ... }
```

## 5. Architecture Decision Records (ADR)

Significant architectural decisions MUST be recorded in `docs/adr/`:

```
docs/adr/
├── 0001-use-postgresql-over-mongodb.md
├── 0002-adopt-event-sourcing-for-audit-log.md
└── 0003-use-graphql-for-public-api.md
```

Each ADR MUST include:

- **Status**: `Proposed` | `Accepted` | `Deprecated` | `Superseded by ADR-XXXX`
- **Context**: the situation and forces at play that motivated this decision.
- **Decision**: the change that was decided upon, stated clearly.
- **Consequences**: positive consequences (benefits), negative consequences (trade-offs), and risks.
- **Alternatives considered**: other options that were evaluated and why they were not chosen.

ADR filenames follow the pattern `NNNN-<kebab-case-title>.md`. ADRs are append-only — never delete or edit a past ADR; instead, create a new one that supersedes it.

## 6. Changelog

`CHANGELOG.md` MUST follow the [Keep a Changelog](https://keepachangelog.com/) format and [Semantic Versioning](https://semver.org/):

```markdown
# Changelog

## [Unreleased]

### Added

- New feature description

## [1.2.0] - 2025-06-01

### Added

- Short description of new feature (#123)

### Fixed

- Bug fix description (#124)

### Changed

- Behavioral change description

### Deprecated

- Feature X is deprecated; use Y instead (removal in v2.0)

### Removed

- Feature Z removed (deprecated since v1.0)

### Security

- CVE-YYYY-NNNNN: description of the vulnerability and fix
```

Rules:

- Every user-visible change MUST be recorded in `[Unreleased]` at the time of the commit, not retroactively.
- Breaking changes MUST appear under `### Changed` and be prefixed with **[BREAKING]**.
- Automated dependency updates do not require changelog entries unless they change behavior.
- Release process: rename `[Unreleased]` to `[x.y.z] - YYYY-MM-DD` when tagging a release.

## 7. Markdown Quality Standards

All documentation MUST conform to the following Markdown rules (see `markdown.md` for full details):

- **Headings**: preceded and followed by a blank line; use ATX style (`#`) only.
- **Code blocks**: always specify the language identifier (` ```bash `, ` ```yaml `, ` ```python `, etc.).
- **Lists**: use `-` as the bullet character consistently.
- **Tables**: columns aligned with padding spaces; header row separated by `---`.
- **Line length**: ≤ 120 characters per line for prose; code blocks are exempt.
- **File ending**: exactly one trailing newline character.
- **No trailing spaces**: strip whitespace at end of lines.

Validate before every commit:

```bash
# Lint Markdown with markdownlint-cli2
npx markdownlint-cli2 "docs/**/*.md" "*.md"

# Fix auto-fixable issues
npx markdownlint-cli2 --fix "docs/**/*.md" "*.md"
```

## 8. Documentation Quality Checklist

Before merging any PR that affects documentation, verify all applicable items:

**README completeness**

- [ ] All five sections present and fully populated
- [ ] Architecture diagram included (ASCII or image)
- [ ] Configuration table documents every parameter
- [ ] At least 3 usage examples provided (simple → advanced)
- [ ] Troubleshooting section covers ≥ 3 common failure scenarios
- [ ] Security considerations section is present and accurate

**Bilingual compliance**

- [ ] English and Chinese versions are content-equivalent
- [ ] Code blocks are identical in both language versions
- [ ] Changed terminology matches the project glossary

**API documentation**

- [ ] All new/changed public APIs have docstrings
- [ ] Deprecations are annotated with removal version and migration path
- [ ] Usage examples included in docstrings

**Changelog & ADR**

- [ ] `CHANGELOG.md` updated for every user-visible change
- [ ] ADR created for any significant architectural decision

**Markdown quality**

- [ ] All code blocks have language identifiers
- [ ] No broken links (validate with `npx markdown-link-check`)
- [ ] Markdownlint passes with zero errors
- [ ] File ends with a single newline

**Sync**

- [ ] Documentation updated in the same PR as the implementation change
- [ ] Runbook updated if operational behavior changed
