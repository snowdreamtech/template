# Ruby Development Guidelines

> Objective: Define standards for idiomatic, secure, and maintainable Ruby code.

## 1. Style & Conventions

- Follow the **Ruby Style Guide**. Enforce with **RuboCop** in CI. Commit `.rubocop.yml` to the repository with explicit enabled/disabled cops.
- Use 2-space indentation. Use `snake_case` for methods and variables, `PascalCase` for classes/modules, `SCREAMING_SNAKE_CASE` for constants.
- Prefer single quotes for strings that do not require interpolation. Use double-quoted strings only when interpolation or escape sequences are required.
- Use **StandardRB** (an opinionated RuboCop config) for projects that prefer zero-configuration style enforcement.
- Add `# frozen_string_literal: true` magic comment at the top of all Ruby files for performance and immutability.

## 2. Language Features

- Use `Enumerable` methods (`map`, `select`, `reject`, `reduce`, `group_by`, `flat_map`) over imperative `for` loops for collection transformations.
- Avoid `rescue Exception` — rescue specific exception classes (`StandardError` or its subclasses) to avoid catching system signals.
- Prefer `&&`/`||` for boolean expressions in conditions. Use `and`/`or` only for control flow and only when the precedence is intentional.
- Use `Struct` or a dedicated **Value Object** class for simple data carriers instead of plain hashes for structured data.
- Use **Pattern Matching** (`case/in`) for complex data structure matching. It is idiomatic in Ruby 3+.

## 3. Architecture & Rails Patterns

- Keep **controllers thin**: delegate all business logic to service objects, use cases, or form objects. A controller action should be ≤ 10 lines.
- Use **ActiveRecord** validations for data integrity at the model layer. Use **Strong Parameters** in controllers (`permit` specific attributes — never use `permit!`).
- Avoid **ActiveRecord callbacks** for side effects (emails, jobs, external calls) — they make behavior implicit and hard to test. Use service objects or event publishing instead.
- Use **background jobs** (Sidekiq, GoodJob) for any work that takes > 100ms or involves external services.

## 4. Testing

- Use **RSpec** for all test types (unit, integration, request, feature specs). Organize specs using `describe`, `context`, and `it` blocks with descriptive strings.
- Use **FactoryBot** for test data generation. Prefer `create` only when persistence is required; use `build` or `build_stubbed` for unit tests to avoid slow database writes.
- Use **VCR** or **WebMock** to stub external HTTP calls in tests. Never make real network calls in CI.
- Run `bundle exec rspec --format progress --format RspecJunitFormatter` in CI for JUnit XML output. Use `simplecov` for coverage reporting.

## 5. Security & Tooling

- Run `bundle audit update && bundle audit check` in CI to check for known vulnerable gem versions.
- Use `brakeman` (static analysis security scanner for Rails apps) in CI. Fix all high-confidence findings before merging.
- Sanitize user output in views. In Rails, prefer the default HTML escaping — avoid `raw`, `html_safe`, and `sanitize` with permissive options.
- Pin **Ruby version** in `.ruby-version` (rbenv/rvm/mise). Specify `ruby "~> 3.3"` in `Gemfile`.
- Use `rubocop-performance` and `rubocop-rspec` extensions for additional linting coverage beyond the core RuboCop cops.
