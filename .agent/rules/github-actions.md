# GitHub Actions Development Guidelines

> Objective: Define standards for writing maintainable, secure, and efficient GitHub Actions workflows, covering workflow structure, security hardening, reusability, performance optimization, and operational excellence.

## 1. Workflow Structure & Organization

- Store all workflows in `.github/workflows/`. Use descriptive, role-based filenames:
  - `ci.yml` — continuous integration (tests, linting, type checks)
  - `release.yml` — release and changelog generation
  - `deploy-production.yml` — production deployment
  - `security-scan.yml` — scheduled vulnerability scans
- Give every workflow a clear `name:` and every job within it a descriptive `name:`. This makes failed workflow runs instantly identifiable in the Actions UI without expanding each job.
- Use **trigger filters** to avoid running expensive workflows unnecessarily:

  ```yaml
  on:
    push:
      branches: [main, "release/**"]
      paths:
        - "src/**"
        - "package.json"
        - "go.sum"
    pull_request:
      branches: [main]
      paths-ignore:
        - "**.md"
        - "docs/**"
  ```

- Define `concurrency` to cancel in-progress runs for the same ref when new commits arrive — prevents duplicate CI runs on rapid pushes:

  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: ${{ github.ref != 'refs/heads/main' }} # don't cancel main branch deploys
  ```

- Organize complex pipelines into multiple focused workflow files. Use reusable workflows (`workflow_call`) to compose them without duplication.

## 2. Security Hardening

### Action Pinning & Supply Chain

- **Pin all actions to a full commit SHA**, not a version tag. Tags are mutable and can be updated by the action author to point to malicious code:

  ```yaml
  # ❌ Tag — mutable, can change
  uses: actions/checkout@v4

  # ✅ SHA — immutable, audit-friendly
  uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
  ```

- Use **Dependabot** to keep action SHA pins current. Configure in `.github/dependabot.yml`:

  ```yaml
  version: 2
  updates:
    - package-ecosystem: "github-actions"
      directory: "/"
      schedule:
        interval: "weekly"
      groups:
        actions:
          patterns: ["*"]
  ```

### Permissions (Least Privilege)

- **Declare minimum permissions** at the workflow and job level. Set `permissions: {}` at the workflow level to revoke all defaults, then grant only what each job requires:

  ```yaml
  # Workflow-level default: deny all
  permissions: {}

  jobs:
    test:
      runs-on: ubuntu-latest
      permissions:
        contents: read # checkout only
      steps: ...

    comment:
      runs-on: ubuntu-latest
      permissions:
        contents: read
        pull-requests: write # post PR comment
      steps: ...
  ```

- Never use `permissions: write-all` — it grants every permission to the `GITHUB_TOKEN`.

### Secrets & Injection Prevention

- **Never echo secrets** in `run:` steps. Reference secrets only via `${{ secrets.NAME }}`. Never construct log messages or shell commands that include secret variable values.
- **Prevent script injection attacks**: never interpolate `${{ github.event.* }}` or `${{ inputs.* }}` directly in `run:` steps. Pass through environment variables first:

  ```yaml
  # ❌ Injection — malicious PR title could inject shell commands
  - run: echo "PR title: ${{ github.event.pull_request.title }}"

  # ✅ Safe — environment variable prevents injection
  - run: echo "PR title: $PR_TITLE"
    env:
      PR_TITLE: ${{ github.event.pull_request.title }}
  ```

- Audit `GITHUB_TOKEN` usage — it has access to repository contents. Prefer scoped fine-grained tokens for sensitive operations.

### OIDC for Cloud Authentication

- Use **OIDC** (OpenID Connect) for cloud authentication (AWS, GCP, Azure) instead of long-lived static access keys. OIDC issues short-lived, job-scoped tokens:

  ```yaml
  permissions:
    contents: read
    id-token: write # required for OIDC

  steps:
    - uses: aws-actions/configure-aws-credentials@e3dd6a429d7300a6a4c196c26e071d42e0343502 # v4.0.2
      with:
        role-to-assume: arn:aws:iam::123456789:role/GitHubActionsDeploy
        aws-region: us-east-1
        # No static credentials — short-lived token via OIDC
  ```

## 3. Reusability & DRY

- Use **Composite Actions** (`.github/actions/<name>/action.yml`) to extract reusable step sequences within a repository:

  ```yaml
  # .github/actions/setup-node/action.yml
  name: "Setup Node.js"
  inputs:
    node-version:
      default: "20"
  runs:
    using: composite
    steps:
      - uses: actions/setup-node@cdca7365b2d0f64f794a2daf5be0b89ae6eb40b9 # v4.3.0
        with:
          node-version: ${{ inputs.node-version }}
          cache: npm
      - run: npm ci
        shell: bash
  ```

- Use **Reusable Workflows** (`workflow_call`) for sharing entire job sequences across repositories:

  ```yaml
  # .github/workflows/test-reusable.yml
  on:
    workflow_call:
      inputs:
        node-version:
          type: string
          default: "20"
      secrets:
        NPM_TOKEN:
          required: true

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@...
        - run: npm ci && npm test
  ```

- Use the **`env:`** key for shared environment variables at the workflow, job, or step level to avoid duplication:

  ```yaml
  env:
    NODE_ENV: production
    AWS_REGION: us-east-1
  ```

## 4. Performance & Efficiency

### Dependency Caching

- Use **`actions/cache`** for all dependency managers. A missing cache causes unnecessary full installs on every run:

  ```yaml
  - uses: actions/cache@5a3ec84eff668545956fd18c39b1ba4a59d65f26 # v4.2.3
    with:
      path: |
        ~/.npm
        node_modules
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-
  ```

  Use `hashFiles()` to key the cache on the lockfile — cache busts automatically when dependencies change.

### Parallel Execution

- Run independent jobs **in parallel** (parallel is the default — avoid extra `needs:` dependencies):

  ```yaml
  jobs:
    test:      runs-on: ubuntu-latest
    lint:      runs-on: ubuntu-latest     # independent — runs in parallel with test
    typecheck: runs-on: ubuntu-latest     # independent — runs in parallel

    deploy:
      needs: [test, lint, typecheck]     # only express real dependencies
  ```

- Use **matrix strategies** for cross-platform and cross-version testing. Use `fail-fast: false` to see all failure combinations:

  ```yaml
  strategy:
    fail-fast: false
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
      go: ["1.22", "1.23"]
      exclude:
        - os: windows-latest
          go: "1.22" # skip this combination
  ```

## 5. Reliability & Operations

### Timeouts & Error Handling

- Set `timeout-minutes:` on every job and step. The default is 360 minutes — far too long:

  ```yaml
  jobs:
    build:
      runs-on: ubuntu-latest
      timeout-minutes: 20
      steps:
        - name: Run tests
          timeout-minutes: 10 # per-step timeout
          run: go test ./...
  ```

- Use `continue-on-error: true` sparingly. Always add an inline comment explaining why the step is allowed to fail.

### Environments & Deployment Protection

- Use **Environments** (Settings → Environments) for production deployments to enforce:
  - Required reviewers (human approval before deploy)
  - Deployment protection rules (branch restrictions, time windows)
  - Environment-scoped secrets (not visible to other jobs/envs)

  ```yaml
  jobs:
    deploy:
      environment: production # awaits required reviewer approval
      runs-on: ubuntu-latest
  ```

### Structured Outputs & Audit

- Use `$GITHUB_OUTPUT` for job outputs (the deprecated `::set-output` is removed):

  ```bash
  echo "image-tag=${IMAGE_TAG}" >> "$GITHUB_OUTPUT"
  ```

- Use `$GITHUB_STEP_SUMMARY` to write Markdown summaries visible in the Actions UI:

  ```bash
  echo "## Test Results" >> "$GITHUB_STEP_SUMMARY"
  echo "✅ All ${PASSING} tests passed" >> "$GITHUB_STEP_SUMMARY"
  ```

- Use **`ossf/scorecard-action`** on the default branch to measure supply chain security: pinned actions, branch protection, vulnerability alerts, dependency review.
- Periodically audit active workflows and disable/delete unused ones. Monitor Actions billing with `gh api /repos/{owner}/{repo}/actions/billing/usage`.
