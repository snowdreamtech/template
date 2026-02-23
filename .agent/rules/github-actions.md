# GitHub Actions Development Guidelines

> Objective: Define standards for writing maintainable, secure, and efficient GitHub Actions workflows.

## 1. Workflow Structure

- Store all workflows in `.github/workflows/`. Use descriptive file names: `ci.yml`, `release.yml`, `deploy-production.yml`.
- Give every workflow a clear `name:` and every job a clear `name:`. This makes failed runs easy to find in the UI.
- Use **path filters** and **branch filters** to avoid running expensive workflows unnecessarily:
  ```yaml
  on:
    push:
      branches: [main]
      paths: ["src/**", "package.json"]
  ```

## 2. Security

- **Pin actions to a full commit SHA**, not a tag: `uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`. Tags are mutable; SHAs are not. Use Dependabot to keep them updated.
- **Never echo secrets** in run steps. GitHub masks known secrets, but avoid constructing strings from secrets that might not be masked.
- Use **`GITHUB_TOKEN`** with minimal permissions. Declare permissions explicitly at the workflow or job level:
  ```yaml
  permissions:
    contents: read
    pull-requests: write
  ```
- **Validate external input**: any `${{ github.event.* }}` or `${{ inputs.* }}` used in `run:` steps must be treated as untrusted. Use environment variables as an intermediary to prevent script injection.

## 3. Reusability & DRY

- Use **Composite Actions** (`.github/actions/my-action/action.yml`) to extract reusable step sequences.
- Use **Reusable Workflows** (`workflow_call`) for sharing entire job sequences across repositories.
- Use the **`env:`** key for shared environment variables. Define them at the workflow level for global scope or job level for job scope.

## 4. Performance

- Use **`actions/cache`** to cache dependencies (`node_modules`, Go module cache, pip packages) between runs.
- Run independent jobs **in parallel**. Use `needs:` only to express actual dependencies between jobs.
- Use **matrix strategies** for cross-platform/cross-version testing:
  ```yaml
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
      node: [18, 20, 22]
  ```

## 5. Best Practices

- Use `timeout-minutes:` on every job to prevent runaway builds from consuming runner minutes.
- Use `continue-on-error: true` sparingly and document why a step is allowed to fail.
- Use **Environments** (Settings → Environments) for production deployments to enforce required reviewers and protection rules.
