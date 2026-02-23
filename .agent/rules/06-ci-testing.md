# CI & Testing Guidelines

> Objective: Unify test scope, quality thresholds, CI behavior, and gating strategy for all projects.

## 1. Test Types & Coverage

- All projects **MUST** include unit tests and integration tests. End-to-end (E2E) tests are required for user-facing flows.
- Set coverage targets for critical paths (e.g., core business logic modules ≥ 80%). Coverage is a signal, not the sole quality metric — prioritize meaningful tests over inflating numbers.
- Use table-driven or parameterized tests to cover edge cases and boundary conditions systematically.

## 2. CI Pipeline Requirements

- All PRs **MUST** pass CI (lint, unit tests, integration tests, static analysis, security scanning) before merging. Merging is prohibited when CI fails.
- The CI pipeline MUST be reproducible: it must produce the same result on every run with the same inputs (hermetic builds, pinned dependencies, no network calls at test time).
- CI must complete within a reasonable time (target < 10 minutes for the fast path). Use parallelism and caching aggressively.

## 3. Test Data & Environments

- Use **reproducible test data**: factories, fixtures, or recorded snapshots — never depend on production data or shared mutable state.
- For cross-platform compatibility, run critical CI pipelines on at least **Linux and macOS** (or Windows) using matrix builds.
- Use **test containers** (Testcontainers, Docker Compose) for integration tests that require real databases, caches, or message queues — avoid mocking infrastructure at the integration level.

## 4. Fast Feedback Strategy

- Structure the pipeline in **progressive stages**: fast checks first (linting, unit tests), then slower checks (integration tests, E2E) in parallel or in subsequent stages.
- Use **incremental testing** where possible: only re-run tests for code paths affected by a change.
- Report test results in a machine-readable format (JUnit XML) to enable dashboard tracking and trend analysis.

## 5. Quality Gates & Failure Policy

- Define explicit **quality gates** that block merge: linter errors, test failures, coverage drops below threshold, security findings of HIGH or CRITICAL severity.
- Major test failures **MUST** be flagged and notify relevant personnel (Slack, email). Do not silently ignore flaky tests — track them in an issue and fix within a defined SLA.
- Flaky tests must be quarantined (skipped with a tracked issue) rather than left to randomly fail CI. Resolve within the sprint.
