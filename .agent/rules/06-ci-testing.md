# CI & Testing Guidelines

> Objective: Unify test scope, quality thresholds, CI behavior, and gating strategy for all projects.

## 1. Test Types & Coverage

- All projects **MUST** include unit tests and integration tests. End-to-end (E2E) tests are required for all user-facing flows and critical happy paths.
- Set coverage targets for critical paths. Coverage is a signal, not the sole quality metric — prioritize meaningful tests over inflating numbers with trivial assertions:
  - Core business logic: ≥ 80% line and branch coverage
  - Critical security paths (auth, payments): ≥ 95%
  - UI components: ≥ 70% (supplemented by visual regression tests)
- Use **table-driven or parameterized tests** to cover edge cases and boundary conditions systematically:

  ```go
  // Go table-driven test pattern
  tests := []struct {
    name    string
    input   string
    want    int
    wantErr bool
  }{
    {"valid input", "42", 42, false},
    {"empty string", "", 0, true},
    {"negative", "-1", -1, false},
    {"overflow", "99999999999", 0, true},
  }
  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      got, err := ParseAge(tt.input)
      if (err != nil) != tt.wantErr { t.Fatalf("wantErr=%v, got err=%v", tt.wantErr, err) }
      if got != tt.want { t.Errorf("want %d, got %d", tt.want, got) }
    })
  }
  ```

- Include **contract tests** (Pact, Spring Cloud Contract) for all service-to-service integrations. Consumer-driven contract tests MUST pass before publishing a new provider version.
- Include **performance benchmark tests** for latency and throughput-sensitive code paths. Track results over time and alert on regressions exceeding 10%.

## 2. CI Pipeline Requirements

- All PRs **MUST** pass CI (lint, unit tests, integration tests, static analysis, security scanning) before merging. Merging is prohibited when CI fails — no exceptions without documented override and incident report.
- The CI pipeline MUST be **hermetically sealed**: same inputs → same outputs on every run. Enforce by:
  - Pinning ALL dependencies (lock files committed)
  - Using deterministic cache keys (lockfile hash, OS, runtime version)
  - Banning network calls during test execution (use mocks or a dedicated test network)

  ```yaml
  # GitHub Actions — deterministic cache
  - uses: actions/cache@v4
    with:
      path: ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: ${{ runner.os }}-node-
  ```

- CI must complete within a reasonable time:
  - **Fast path** (lint + unit tests): < 5 minutes
  - **Full pipeline** (integration + E2E + security): < 30 minutes
  - Use **parallelism** (parallel jobs), **layer caching** (Docker), and **affected-only runs** (Nx, Turborepo) aggressively.
- Artifact traceability: every CI run MUST produce a build manifest linking: `source commit SHA` → `build artifacts` → `test results` → `scan reports`. Archive these for audit purposes.
- Configure CI to run on a **matrix** of OS/runtime versions for cross-platform projects:

  ```yaml
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
      node: [20, 22]
  runs-on: ${{ matrix.os }}
  ```

## 3. Test Data & Environments

- Use **reproducible, isolated test data**: factories, fixtures, or recorded snapshots. Never depend on production data, shared databases, or mutable external state:

  ```typescript
  // Factory pattern — deterministic test data
  const createUser = (overrides: Partial<User> = {}): User => ({
    id: crypto.randomUUID(),
    email: "test@example.com",
    role: "user",
    createdAt: new Date("2025-01-01T00:00:00Z"),
    ...overrides,
  });
  ```

- **PII in test data is strictly prohibited**. Anonymize or synthesize any data derived from production. Treat synthetic test data containing realistic PII patterns with the same controls as real PII.
- Use **Testcontainers** (or Docker Compose) for integration tests that require real databases, caches, or message queues — avoid mocking infrastructure at the integration level:

  ```java
  // Testcontainers — real PostgreSQL in tests
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");
  ```

- Define a clear **test data lifecycle**: create in `beforeEach`/setup, clean up in `afterEach`/teardown. Tests MUST NOT leave persistent state that affects other tests.
- For cross-platform compatibility, run critical CI pipelines on at least **Linux and macOS** using matrix builds.

## 4. Fast Feedback Strategy

- Structure the pipeline in **progressive stages** — fast checks first, slow checks later:

  ```
  Stage 1 (< 3 min): lint, format, typecheck, unit tests
  Stage 2 (< 10 min): integration tests, contract tests
  Stage 3 (parallel): E2E tests, security scans, performance benchmarks
  ```

- Use **incremental/affected testing** where possible: only re-run tests for code paths affected by a change:
  - Monorepos: **Nx affected**, **Turborepo**, or **Bazel**
  - Python: **pytest-changed** (tests affected by changed files)
  - Languages with import analysis: selectively run test targets
- Report test results in **machine-readable format** (JUnit XML, TAP, CTRF) to enable dashboard tracking, trend analysis, and CI integration with test reporting tools:

  ```bash
  jest --reporters=jest-junit   # JUnit XML output
  pytest --junitxml=results.xml  # pytest JUnit output
  go test ./... -v 2>&1 | go-junit-report > results.xml  # Go
  ```

- Cache aggressively with **content-addressed keys** that include all relevant inputs:

  ```yaml
  key: ${{ runner.os }}-${{ matrix.node }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('src/**') }}
  ```

## 5. Quality Gates & Failure Policy

- Define explicit **quality gates** that block merge:
  - Linter errors (zero tolerance — must be clean)
  - Test failures (zero tolerance)
  - Coverage drop below threshold (configurable per project)
  - Security findings of HIGH or CRITICAL severity
  - Contract test failures (consumer-driven contracts)
  - Build failures or type errors
- **Flaky test policy**:
  - A test is **flaky** if it fails intermittently without code changes (timing issues, race conditions, order-dependent tests, network calls)
  - Flaky tests MUST be **quarantined** within 24 hours of detection:

    ```python
    @pytest.mark.skip(reason="Flaky — tracked in issue #456, owner: @alice")
    def test_sends_notification():
        ...
    ```

  - Quarantined flaky tests MUST be resolved within **2 weeks** (one sprint). Unresolved flakes escalate to the team lead.
  - Root-cause analysis required: fix the underlying race condition or non-determinism — do not simply retry the test.
- Major test failures **MUST** trigger notifications to the responsible team via the project's notification channel (Slack webhook, PagerDuty, email).
- Post-merge failures in `main` or `develop` are **P1 incidents** — the team MUST stop new feature work and restore green CI before continuing. Revert the offending commit if a fix is not immediately available.

## 6. CI Security & Supply Chain

- Pin ALL CI action versions to a specific **commit SHA** — not a mutable tag like `v4` which could be changed without notice:

  ```yaml
  # ❌ Mutable tag — can be silently overwritten
  - uses: actions/checkout@v4

  # ✅ Pinned SHA — immutable, auditable
  - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
  ```

  Use tools like `renovate` (with `pinDigests: true`) or `pin-github-action` CLI to automate SHA pinning.

- Use **OIDC (OpenID Connect)** for short-lived cloud credentials in CI instead of long-lived static secrets:

  ```yaml
  # GitHub Actions OIDC — no stored AWS credentials
  permissions:
    id-token: write
    contents: read

  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789:role/github-actions-deploy
      aws-region: us-east-1
  ```

- Apply **least-privilege permissions** to every CI workflow. Only grant the minimum `permissions` required:

  ```yaml
  permissions:
    contents: read # read source only
    pages: write # only if deploying to GitHub Pages
    id-token: write # only if using OIDC
  ```

- Sign build artifacts and container images in CI using **Sigstore/cosign**:

  ```bash
  cosign sign --yes "$IMAGE_DIGEST"
  cosign verify --certificate-identity-regexp=".*" \
    --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
    "$IMAGE_DIGEST"
  ```

- Run **secret scanning** as the first step in every CI pipeline, before any code builds:

  ```bash
  gitleaks detect --source . --report-format json --exit-code 1
  ```
