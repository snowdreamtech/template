# Ruby Development Guidelines

> Objective: Define standards for idiomatic, secure, and maintainable Ruby code.

## 1. Style & Conventions

- Follow the **Ruby Style Guide** (rubocop default config). Enforce with RuboCop in CI.
- Use 2-space indentation. Use `snake_case` for methods and variables, `PascalCase` for classes/modules, `SCREAMING_SNAKE_CASE` for constants.
- Prefer single quotes for strings that do not require interpolation.

## 2. Language Features

- Prefer `&&`/`||` for boolean logic in conditions and `and`/`or` only for control flow (sparingly).
- Use `Enumerable` methods (`map`, `select`, `reject`, `reduce`) over `for` loops.
- Avoid `rescue Exception`; rescue specific exception classes instead.
- Use `frozen_string_literal: true` magic comment at the top of files for performance and safety.

## 3. Rails (if applicable)

- Follow the **Convention over Configuration** principle. Use Rails generators.
- Keep controllers thin: delegate business logic to service objects or concerns.
- Use **ActiveRecord** validations and callbacks judiciously. Avoid callbacks for side effects that belong in service objects.
- Use **Strong Parameters** in controllers. Never permit all parameters with `permit!`.

## 4. Testing

- Use **RSpec** for unit, integration, and feature specs.
- Use **FactoryBot** for test data and **Shoulda-Matchers** for concise validation specs.
- Run specs with `bundle exec rspec` in CI.

## 5. Security

- Use `bundler-audit` in CI to check for vulnerable dependencies.
- Sanitize user output in views. In Rails, prefer `html_escape` (the default) over `raw` or `html_safe`.
