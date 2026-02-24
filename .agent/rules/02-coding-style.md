# Coding Style & Conventions

> Objective: Define universal coding conventions to ensure consistent, readable, and maintainable code across all languages and projects.

## 1. Git Commit Messages

- Follow **[Conventional Commits](https://www.conventionalcommits.org/)** specification.
- Format: `<type>(<scope>): <description>` — e.g., `feat(auth): add refresh token support`.
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.
- Commit messages MUST be in **English**. Descriptions must be written in the imperative mood ("add" not "added", "fix" not "fixed"). Keep the subject line ≤ 72 characters.
- Body (optional): explain **why** the change was made, not what it does — the diff shows what. Separate body from subject with a blank line.
- Breaking changes MUST include a `BREAKING CHANGE:` footer: `BREAKING CHANGE: removed /api/v1/users endpoint, use /api/v2/users`.
- Sign commits with GPG where the repository policy requires it (`git commit -S`).

## 2. Code Quality Principles

- **DRY (Don't Repeat Yourself)**: Extract shared logic into reusable functions, modules, or helpers. Duplicated code is a bug waiting to diverge.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions over clever or overly abstract ones. Complexity must earn its keep.
- **YAGNI (You Aren't Gonna Need It)**: Do not implement features speculatively. Build only what is needed now.
- **Single Responsibility**: Functions and classes should do one thing and do it well. If a function needs a conjunction ("and", "or") in its name, split it.
- **Cyclomatic Complexity**: Keep per-function cyclomatic complexity ≤ 15. Functions exceeding this threshold are candidates for decomposition.
- **SOLID** (for OOP contexts): Adhere to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.

## 3. Error Handling

- Always handle errors explicitly — never silently swallow exceptions with an empty `catch` or bare `except`.
- Classify errors by origin:
  - **User errors** (validation failures): return a descriptive, user-safe message with appropriate HTTP 4xx status.
  - **System errors** (unhandled exceptions, OOM): log with full context, return a generic message to the user, alert on-call.
  - **External errors** (downstream API failures): implement retry with backoff, circuit-breaker if applicable, and propagate a meaningful wrapped error.
- Provide **meaningful error messages** that include: what failed, why, and (where useful) how to resolve it.
- Log errors with sufficient context: timestamp, operation name, relevant input data (sanitized), trace ID, and a stack trace where applicable.
- Use the language's idiomatic error mechanism: `Result`/`Option` in Rust, typed errors in TypeScript, checked exceptions or error wrapping in Java/Go.

## 4. Documentation

- All public APIs, exported functions, and non-obvious code blocks MUST have clear **docstrings or inline comments** in **English**.
- `README.md` files and user-facing documentation MUST be in **Simplified Chinese (简体中文)**.
- Comments explain **why**, not **what**. Avoid comments that merely restate the code (`// increment i by 1`).
- Keep documentation up to date when modifying code. Outdated documentation is worse than no documentation. Add a doc-update checklist item to PR templates.
- API documentation MUST include: parameter types/descriptions, return type, possible errors, and a usage example.
- Document **deprecation** inline with a `@deprecated` tag and migration path before removing any public API.

## 5. Naming Conventions

- Use **descriptive, meaningful names** for variables, functions, classes, and modules. Avoid abbreviations except for universally understood ones (`id`, `url`, `ctx`, `err`, `cfg`).
- Follow language-specific conventions:
  - **JavaScript/TypeScript**: `camelCase` for variables/functions, `PascalCase` for classes/components/types, `UPPER_SNAKE_CASE` for constants.
  - **Python**: `snake_case` for variables/functions/modules, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
  - **Go**: `camelCase`/`PascalCase` (exported = PascalCase), short variable names (`i`, `v`, `err`) are idiomatic in narrow scopes only.
  - **Java/Kotlin**: `camelCase` for variables/methods, `PascalCase` for classes/interfaces, `UPPER_SNAKE_CASE` for constants, package names in `lowercase.dotted`.
  - **Rust**: `snake_case` for variables/functions/modules, `PascalCase` for types/traits/enums, `UPPER_SNAKE_CASE` for constants/statics.
  - **CSS/HTML**: `kebab-case` for class names and IDs.
- Avoid generic names (`data`, `temp`, `result`, `obj`, `value`, `info`, `manager`) except in very local, short-lived scopes. Name things by what they represent, not their type.
- Boolean variables and functions MUST use a predicate form: `isEnabled`, `hasPermission`, `canRetry`, `shouldSkip`.
