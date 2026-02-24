# CI & Testing Guidelines

> Objective: Unify test scope, quality thresholds, CI behavior, and gating strategy for all projects.

## 1. Test Types & Coverage

- All projects **MUST** include unit tests and integration tests. End-to-end (E2E) tests are required for all user-facing flows and critical happy paths.
- Set coverage targets for critical paths (e.g., core business logic modules ≥ 80%). Coverage is a signal, not the sole quality metric — prioritize meaningful tests over inflating numbers with trivial assertions.
- Use table-driven or parameterized tests to cover edge cases and boundary conditions systematically. Each test case must have a name describing the scenario.
- Include **contract tests** (e.g., Pact, Spring Cloud Contract) for all service-to-service integrations. Consumer-driven contract tests MUST pass before publishing a new provider version.
- Include **performance benchmark tests** for latency and throughput-sensitive code paths. Track results over time and alert on regressions exceeding 10%.

## 2. CI Pipeline Requirements

- All PRs **MUST** pass CI (lint, unit tests, integration tests, static analysis, security scanning) before merging. Merging is prohibited when CI fails.
- The CI pipeline MUST be **hermetically sealed**: same inputs → same outputs on every run. Enforce by pinning dependencies, caching deterministically, and disallowing network calls during test execution (use mocks or a dedicated test network).
- CI must complete within a reasonable time: target **< 10 minutes** for the fast path (lint + unit tests), **< 30 minutes** for the full pipeline. Use parallelism and layer caching aggressively.
- Artifact traceability: every CI run MUST produce a build manifest linking source commit SHA → build artifacts → test results → scan reports. Archive these for audit purposes.
- Configure CI to run on a **matrix** of OS/runtime versions for cross-platform projects (`ubuntu-latest`, `macos-latest`, `windows-latest`).

## 3. Test Data & Environments

- Use **reproducible, isolated test data**: factories (factory_bot, faker), fixtures, or recorded snapshots (VCR cassettes). Never depend on production data, shared databases, or mutable external state.
- **PII in test data is strictly prohibited**. Anonymize or synthesize any data derived from production. Treat synthetic test data containing realistic PII patterns with the same controls as real PII.
- For cross-platform compatibility, run critical CI pipelines on at least **Linux and macOS** using matrix builds.
- Use **test containers** (Testcontainers, Docker Compose) for integration tests that require real databases, caches, or message queues — avoid mocking infrastructure at the integration level.
- Define a clear **test data lifecycle**: create in `beforeEach`/`setUp`, clean up in `afterEach`/`tearDown`. Tests MUST NOT leave persistent state that affects other tests.

## 4. Fast Feedback Strategy

- Structure the pipeline in **progressive stages**: fast checks first (linting, formatting, unit tests in < 3 min), then slower checks (integration tests, E2E, security scans) in parallel subsequent stages.
- Use **incremental/affected testing** where possible: only re-run tests for code paths affected by a change (Nx affected, Bazel, pytest-changed).
- Report test results in **machine-readable format** (JUnit XML, TAP) to enable dashboard tracking, trend analysis, and CI integration with test reporting tools.
- Cache aggressively: dependency installation, build outputs, Docker layers, and test results for unchanged modules. Validate cache keys include all relevant inputs (lockfile hash, OS, runtime version).

## 5. Quality Gates & Failure Policy

- Define explicit **quality gates** that block merge: linter errors, test failures, code coverage drop below threshold, security findings of HIGH or CRITICAL severity, or contract test failures.
- Flaky test policy:
  - A test is **flaky** if it fails intermittently without code changes.
  - Flaky tests MUST be **quarantined** (skipped with a tracked issue referencing the flake) within 24 hours of detection. They MUST NOT be left to randomly fail CI.
  - Quarantined flaky tests MUST be resolved within the current sprint (or 2 weeks maximum). Unresolved flakes after the SLA escalate to team lead.
- Major test failures **MUST** trigger notifications to the responsible team via the project's notification channel (Slack, PagerDuty, email). Do not silently ignore failures.
- Post-merge failures in `main` or `develop` are **P1 incidents** — the team MUST stop new feature work and restore green CI before continuing.
