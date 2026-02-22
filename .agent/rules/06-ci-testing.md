# CI & Testing Guidelines

> Objective: Unify test scope, quality thresholds, and CI behavior.

## 1. Test Types & Coverage

- MUST include unit tests and integration tests.
- Set coverage targets for critical paths (e.g., core modules no less than 80%), but coverage is not the only quality metric.

## 2. CI Behavior

- All PRs MUST pass CI (lint, unit tests, static analysis, security scanning).
- Merging is prohibited when CI fails; major test failures require flagging and notifying relevant personnel.

## 3. Test Data & Environments

- Use reproducible test data (fixtures, factories) and avoid direct dependence on production data.
- For cross-platform compatibility, run critical pipelines on at least Linux and macOS (or Windows) in CI.

## 4. Fast Feedback Strategy

- Place fast, lightweight checks in the first phase of the PR (lint, fast unit tests). Longer-running integration/end-to-end tests can run in parallel.
