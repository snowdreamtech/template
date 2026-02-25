# GitHub Actions Development Guidelines

> Objective: Define standards for writing maintainable, secure, and efficient GitHub Actions workflows.

## 1. Workflow Structure

- Store all workflows in `.github/workflows/`. Use descriptive file names: `ci.yml`, `release.yml`, `deploy-production.yml`.
- Give every workflow a clear `name:` and every job a clear `name:`. This makes failed runs instantly identifiable in the Actions UI.
- Use **path filters** and **branch filters** to avoid running expensive workflows unnecessarily:

  ```yaml
  on:
    push:
      branches: [main]
      paths: ["src/**", "package.json"]
  ```

- Define `concurrency` to cancel in-progress runs for the same ref on new pushes:

  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
  ```

## 2. Security

- **Pin actions to a full commit SHA**, not a tag: `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`. Tags are mutable; SHAs are immutable. Use **Dependabot** (`dependabot.yml`) to keep action versions current.
- **Never echo secrets** in `run:` steps. Reference secrets only via `${{ secrets.NAME }}` — never construct log messages containing secret values.
- **Declare minimum permissions** at the workflow or job level. Set `permissions: {}` at the workflow level to revoke all defaults, then grant only what each job requires:

  ```yaml
  permissions:
    contents: read
    pull-requests: write
  ```

- **Prevent injection attacks**: never use `${{ github.event.* }}` or `${{ inputs.* }}` directly in `run:` steps. Use environment variables as intermediaries:

  ```yaml
  env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "$PR_TITLE"
  ```

## 3. Reusability & DRY

- Use **Composite Actions** (`.github/actions/my-action/action.yml`) to extract reusable step sequences and share within a repository.
- Use **Reusable Workflows** (`workflow_call`) for sharing entire job sequences across repositories. Pin external reusable workflows to a SHA.
- Use the **`env:`** key for shared environment variables at the workflow, job, or step level. Avoid duplicating values across steps.

## 4. Performance

- Use **`actions/cache`** for all dependency managers: `node_modules`, Go module cache, pip, Maven `.m2`, Cargo registry. A missing cache key causes unnecessary full dependency installs on every run.
- Run independent jobs **in parallel**. Only use `needs:` to express true dependencies between jobs.
- Use **matrix strategies** for cross-platform/cross-version testing. Use `fail-fast: false` on matrices to see all failures:

  ```yaml
  strategy:
    fail-fast: false
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
      node: [20, 22]
  ```

## 5. Reliability & Operations

- Set `timeout-minutes:` on every job and step to prevent runaway builds from consuming runner minutes (default is 360 minutes — far too long for most workloads).
- Use `continue-on-error: true` sparingly, and always document with a comment (`# Allowed to fail: this step is informational only`).
- Use **Environments** (Settings → Environments) for production deployments to enforce required reviewers, deployment protection rules, and environment-scoped secrets.
- Store structured outputs from jobs using `$GITHUB_OUTPUT` (not the deprecated `::set-output`). Use `$GITHUB_STEP_SUMMARY` to write Markdown summaries visible in the Actions UI.
- Periodically audit workflow run history and prune old workflows. Monitor billing using the `gh` CLI or the GitHub API.
