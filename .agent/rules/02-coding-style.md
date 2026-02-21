# Coding Style & Conventions

## 1. Git Commit Messages

- Follow [Conventional Commits](https://www.conventionalcommits.org/) specification.
- Format: `<type>(<scope>): <description>`
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.
- Commit messages MUST be in **English**.

## 2. Code Quality

- **DRY (Don't Repeat Yourself)**: Extract shared logic into reusable functions or modules.
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable solutions over clever ones.
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they are actually needed.

## 3. Error Handling

- Always handle errors explicitly; never silently swallow exceptions.
- Provide meaningful error messages that help with debugging.
- Log errors with sufficient context (timestamp, operation, input data).

## 4. Documentation

- All public APIs and functions should have clear docstrings/comments in **English**.
- README files and user-facing documentation should be in **Simplified Chinese**.
- Keep comments up to date when modifying code.

## 5. Naming Conventions

- Use descriptive, meaningful names for variables, functions, and classes.
- Follow language-specific naming conventions:
  - JavaScript/TypeScript: `camelCase` for variables/functions, `PascalCase` for classes/components.
  - Python: `snake_case` for variables/functions, `PascalCase` for classes.
  - CSS: `kebab-case` for class names.
