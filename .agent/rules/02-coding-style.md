# Coding Style & Conventions

> Objective: Define universal coding conventions to ensure consistent, readable, and maintainable code across all languages and projects.

## 1. Git Commit Messages

- Follow **[Conventional Commits](https://www.conventionalcommits.org/)** specification.
- Format: `<type>(<scope>): <description>` — e.g., `feat(auth): add refresh token support`
- Common types:

  | Type       | When to Use                                 |
  | ---------- | ------------------------------------------- |
  | `feat`     | A new feature                               |
  | `fix`      | A bug fix                                   |
  | `docs`     | Documentation only changes                  |
  | `style`    | Formatting, whitespace — no logic change    |
  | `refactor` | Restructuring without behavior change       |
  | `test`     | Adding/updating tests                       |
  | `chore`    | Maintenance, build, tooling                 |
  | `ci`       | CI configuration changes                    |
  | `perf`     | Performance improvement                     |
  | `build`    | Build system or external dependency changes |

- Commit messages MUST be in **English**. Descriptions must be written in the imperative mood: "add" not "added", "fix" not "fixed". Keep the subject line ≤ 72 characters.
- Body (optional): explain **why** the change was made, not what it does — the diff shows what. Separate body from subject with a blank line:

  ```
  feat(auth): add refresh token rotation

  Implements sliding-window refresh token rotation to reduce the
  attack surface of stolen tokens. Old refresh tokens are invalidated
  on use — a second use of the same token triggers session revocation.

  Closes: #234
  ```

- Breaking changes MUST include a `BREAKING CHANGE:` footer: `BREAKING CHANGE: removed /api/v1/users endpoint, use /api/v2/users`.
- Sign commits with GPG where the repository policy requires it (`git commit -S`). Enforce on protected branches.

## 2. Code Quality Principles

- **DRY (Don't Repeat Yourself)**: Extract shared logic into reusable functions, modules, or helpers. Duplicated code is a bug waiting to diverge — every copy needs to be kept in sync.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions over clever or overly abstract ones. Complexity must earn its keep with measurable benefit.
- **YAGNI (You Aren't Gonna Need It)**: Do not implement features speculatively. Build only what is needed now. Premature abstractions are technical debt.
- **Single Responsibility**: Functions and classes should do one thing and do it well. If a function needs a conjunction ("and", "or") in its name, split it into two functions.
- **Cyclomatic Complexity**: Keep per-function cyclomatic complexity ≤ 15. Functions exceeding this threshold are strong candidates for decomposition. Most linters (`eslint complexity`, `pylint`, `gocyclo`) can enforce this automatically.
- **SOLID** (for OOP contexts):
  - **S** — Single Responsibility: a class has one reason to change
  - **O** — Open/Closed: open for extension, closed for modification
  - **L** — Liskov Substitution: subtypes must be substitutable for their base types
  - **I** — Interface Segregation: prefer many specific interfaces over one general-purpose one
  - **D** — Dependency Inversion: depend on abstractions, not concretions

## 3. Error Handling

- Always handle errors **explicitly** — never silently swallow exceptions with an empty `catch` or bare `except`:

  ```python
  # ❌ Silent failure — debugging nightmare
  try:
      process_payment(order)
  except:
      pass

  # ✅ Explicit handling with logging
  try:
      process_payment(order)
  except PaymentGatewayError as e:
      logger.error("Payment failed for order %s: %s", order.id, e)
      raise PaymentError(f"Could not process payment: {e}") from e
  ```

- Classify errors by origin:
  - **User errors** (validation failures): return a descriptive, user-safe message with appropriate HTTP 4xx status. Do not expose internal details.
  - **System errors** (unhandled exceptions, OOM): log with full context, return a generic message to the user, alert on-call.
  - **External errors** (downstream API failures): implement retry with backoff, circuit-breaker if applicable, and propagate a meaningful wrapped error.
- Provide **meaningful error messages** that include: what failed, why (if known), and how to resolve it (if applicable).
- Log errors with sufficient context: timestamp, operation name, relevant sanitized input data, trace ID, and a stack trace where applicable.
- Use the language's idiomatic error mechanism:
  - **Rust**: `Result<T, E>` and `Option<T>` — propagate with `?`, wrap with `thiserror`/`anyhow`
  - **Go**: `error` return values — wrap with `fmt.Errorf("context: %w", err)`
  - **TypeScript**: typed errors, `Result` patterns where applicable, discriminated unions for expected error cases
  - **Java/Kotlin**: checked exceptions for expected failure modes; unchecked for programming errors

## 4. Documentation

- All public APIs, exported functions, and non-obvious code blocks MUST have clear **docstrings or inline comments** in **English**:

  ```go
  // ParseConfig reads the configuration from the given file path and returns
  // a validated Config struct. Returns ErrConfigNotFound if the file does not
  // exist, or ErrInvalidConfig if validation fails.
  //
  // The config file must be a valid YAML document satisfying the schema
  // defined in docs/config-schema.json.
  func ParseConfig(path string) (*Config, error) { ... }
  ```

- `README.md` files and user-facing documentation MUST be in **Simplified Chinese (简体中文)**.
- Comments explain **why**, not **what**. Avoid comments that merely restate the code:

  ```go
  // ❌ Obvious — restates what the code does
  i++ // increment i by 1

  // ✅ Non-obvious — explains the why
  retries++ // retry count excludes the initial attempt per RFC 9110 §15.1
  ```

- Keep documentation up to date when modifying code. Outdated documentation is worse than no documentation. Add a doc-update checklist item to PR templates.
- API documentation MUST include: parameter types/descriptions, return type, possible errors, and a usage example.
- Document **deprecation** inline with a `@deprecated` tag and migration path before removing any public API.

## 5. Naming Conventions

- Use **descriptive, meaningful names** for variables, functions, classes, and modules. Avoid abbreviations except for universally understood ones (`id`, `url`, `ctx`, `err`, `cfg`, `req`, `res`).
- Follow language-specific conventions consistently throughout the project:

  | Language              | Variables/Functions      | Classes/Types | Constants                      | Files/Modules                     |
  | --------------------- | ------------------------ | ------------- | ------------------------------ | --------------------------------- |
  | JavaScript/TypeScript | `camelCase`              | `PascalCase`  | `UPPER_SNAKE_CASE`             | `kebab-case`                      |
  | Python                | `snake_case`             | `PascalCase`  | `UPPER_SNAKE_CASE`             | `snake_case`                      |
  | Go                    | `camelCase`/`PascalCase` | `PascalCase`  | `UPPER_SNAKE_CASE` (pkg-level) | `snake_case`                      |
  | Java/Kotlin           | `camelCase`              | `PascalCase`  | `UPPER_SNAKE_CASE`             | `PascalCase` / `lowercase.dotted` |
  | Rust                  | `snake_case`             | `PascalCase`  | `UPPER_SNAKE_CASE`             | `snake_case`                      |
  | CSS/HTML              | `kebab-case`             | —             | —                              | `kebab-case`                      |

- Avoid generic names (`data`, `temp`, `result`, `obj`, `value`, `info`, `manager`) except in very local, short-lived scopes. Name things by what they **represent**, not their type.
- Boolean variables and functions MUST use a predicate form: `isEnabled`, `hasPermission`, `canRetry`, `shouldSkip`, `isLoading`, `wasDeleted`.
- Function names should be verbs describing their action: `fetchUser`, `validateEmail`, `sendNotification`, `parseConfig` — not `userFetcher`, `emailValidator`.
- Avoid negative boolean names (`isNotValid`, `isDisabled`) — they create confusing double-negatives in conditionals. Prefer positive forms: `isValid`, `isEnabled`.

## 6. Triple Guarantee Quality Mechanism

- The project enforces a rigorous "**Triple Guarantee**" mechanism to ensure code quality across all stages of development. This is built on two core architectural philosophies: **Shift-Left (防线左移)** for developer experience and **Strict Gatekeeping (严格门禁)** for repository purity. All contributors, including AI agents, MUST adhere to this multi-layered defense strategy:
  1. **First Line of Defense: Agent/Developer Auto-fix (Shift-Left, Incremental Scope)**
     - Developers and AI Agents MUST proactively run formatters and linters (`eslint --fix`, `shfmt -w`, `prettier --write`, `markdownlint-cli2 --fix`) immediately after modifying or generating code.
     - **Scope:** Restricted to the currently open or heavily modified files to save time and maintain focus.
     - **Goal:** Maximum auto-correction and minimum mental burden. Never leave formatting or linting errors for the next stage.
  2. **Second Line of Defense: Git Commit Intercept (Shift-Left, Incremental Scope)**
     - Driven by `pre-commit` hooks configured in `.pre-commit-config.yaml`.
     - Automatically intercepts `git commit` operations. Supported tools are explicitly configured in **auto-fix mode** (e.g., `eslint --fix`, `shfmt -w -s -l`) to automatically rectify formatting issues and transparently merge them into the user's commit.
     - **Scope:** Runs _only_ on the files currently staged for commit (incremental).
     - Unfixable issues (e.g., cspell unknown words, complex shellcheck warnings) will block the commit, forcing the developer/agent to address them locally before the code ever leaves their machine.
  3. **Third Line of Defense: CI/CD Strict Checks (Strict Gatekeeping, Full Repository Scope)**
     - Driven by GitHub Actions (e.g., `.github/workflows/lint.yml`).
     - Runs all linters and formatters strictly in **Check-only / Diff mode** (e.g., `eslint`, `shfmt -d`, `prettier --check`).
     - **Scope:** Performs a **Full-Repository** scan. This ensures that massive refactors or dependency updates haven't subtly broken formatting or conventions in untouched files, and provides an absolute baseline of quality.
     - **Goal:** Absolute repository purity. Under no circumstances does the CI pipeline attempt to silently auto-fix and commit code, as CI runners lack (and should lack) the context/permissions to push structural changes back to the user's branch. Any violation at this stage results in a **hard failure (red build)**, blocking pull requests and forcing the contributor to fix the issues locally.
- **Goal: Absolute Synchronization (极致同步)**
  - Every linting tool, whether local or remote, MUST strictly and consistently ignore the following standard dependency and build folders to avoid resource waste and false positives:
    `node_modules`, `.venv`, `venv`, `env`, `vendor`, `dist`, `build`, `out`, `target`, `.next`, `.nuxt`, `.output`, `__pycache__`, `.specify`.
  - When adding a new lint tool, its configuration (e.g., `.ignore`, `config.json`) or CI command flags (e.g., `--exclude`, `--skip-dirs`) MUST be updated to include this full list.
  - Large-scale scanning tools (Trivy, Semgrep, Gitleaks) SHOULD be optimized for local performance by focusing on configuration or incremental scans, shifting exhaustive analyses to the CI gate.
