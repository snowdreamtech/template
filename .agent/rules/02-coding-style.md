# Coding Style & Conventions

> Objective: Define universal coding conventions to ensure consistent, readable, and maintainable code across all languages and projects.

## 1. Git Commit Messages

- Follow **[Conventional Commits](https://www.conventionalcommits.org/)** specification.
- Format: `<type>(<scope>): <description>` — e.g., `feat(auth): add refresh token support`.
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.
- Commit messages MUST be in **English**. Descriptions must be written in the imperative mood ("add" not "added", "fix" not "fixed").
- Body (optional): explain **why** the change was made, not what it does — the diff shows what.

## 2. Code Quality Principles

- **DRY (Don't Repeat Yourself)**: Extract shared logic into reusable functions, modules, or helpers. Duplicated code is a bug waiting to diverge.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions over clever or overly abstract ones. Complexity must earn its keep.
- **YAGNI (You Aren't Gonna Need It)**: Do not implement features speculatively. Build only what is needed now.
- **Single Responsibility**: Functions and classes should do one thing and do it well. If a function needs a conjunction in its name ("and", "or"), split it.

## 3. Error Handling

- Always handle errors explicitly — never silently swallow exceptions with an empty `catch` or bare `except`.
- Provide **meaningful error messages** that include: what failed, why, and (where useful) how to resolve it.
- Log errors with sufficient context: timestamp, operation name, relevant input data (sanitized), and a stack trace where applicable.
- Use the language's idiomatic error mechanism: `Result`/`Option` in Rust, typed errors in TypeScript, exceptions in Java/Python.

## 4. Documentation

- All public APIs, exported functions, and non-obvious code blocks should have clear **docstrings or inline comments** in **English**.
- `README.md` files and user-facing documentation should be in **Simplified Chinese (简体中文)**.
- Comments explain **why**, not **what**. Avoid comments that merely restate the code (`// increment i by 1`).
- Keep documentation up to date when modifying code. Outdated documentation is worse than no documentation.

## 5. Naming Conventions

- Use **descriptive, meaningful names** for variables, functions, classes, and modules. Avoid abbreviations except for universally understood ones (`id`, `url`, `ctx`).
- Follow language-specific conventions:
  - JavaScript/TypeScript: `camelCase` for variables/functions, `PascalCase` for classes/components, `UPPER_SNAKE_CASE` for constants.
  - Python: `snake_case` for variables/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
  - Go: `camelCase`/`PascalCase` (exported = PascalCase), short variable names are idiomatic in narrow scopes.
  - CSS/HTML: `kebab-case` for class names and IDs.
- Avoid generic names (`data`, `temp`, `result`, `obj`) except in very local, short-lived scopes. Name things by what they represent, not their type.
