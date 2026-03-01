# Git, Commit & PR Guidelines

> Objective: Unify commit history, branching, PR workflows, and review standards to improve traceability and collaboration efficiency.

## 1. Commit Messages

- Use **Conventional Commits** format (strictly following `@commitlint/config-conventional`): `<type>(<scope>): <description>` (e.g., `feat(auth): add OAuth2 login`). Never write vague commit messages like "fix bug", "update code", or "WIP".
- Common types:

  | Type       | Purpose                            | Example                                     |
  | ---------- | ---------------------------------- | ------------------------------------------- |
  | `feat`     | New feature                        | `feat(user): add avatar upload`             |
  | `fix`      | Bug fix                            | `fix(auth): prevent refresh token reuse`    |
  | `docs`     | Documentation only                 | `docs(api): add rate limit description`     |
  | `style`    | Formatting, whitespace             | `style: fix trailing whitespace in models`  |
  | `refactor` | Restructuring (no behavior change) | `refactor(db): extract query builder`       |
  | `test`     | Adding or updating tests           | `test(order): add edge case for empty cart` |
  | `chore`    | Maintenance, tooling               | `chore: upgrade eslint to v9`               |
  | `ci`       | CI/CD pipeline changes             | `ci: add matrix for Node 22`                |
  | `perf`     | Performance optimization           | `perf(cache): use Redis pipelining`         |
  | `build`    | Build system changes               | `build: switch to esbuild`                  |

- Commit messages **MUST** be in **English**. The description must be concise (≤ 100 characters), written in the imperative mood ("add", not "added"), and **MUST NOT** end with a period (full stop). Note: while the traditional limit is 72, `@commitlint/config-conventional` enforces 100 characters for the header.

  ```
  feat(auth): add OAuth2 login with Google provider

  Implements OAuth2 Authorization Code flow using the `passport-google-oauth20`
  strategy. Adds /auth/google and /auth/google/callback routes.

  Users can now log in with Google alongside existing email/password auth.

  Closes: #234
  BREAKING CHANGE: /auth/login response shape changed — see migration guide.
  ```

- Where the repository policy requires it, **sign commits with GPG** (`git commit -S`). Enforce signature verification on protected branches via branch protection rules.
- Configure `.gitattributes` to normalize line endings and designate merge drivers for generated files:

  ```gitattributes
  * text=auto
  *.sh  text eol=lf
  *.ps1 text eol=crlf
  *.png binary
  package-lock.json merge=ours   # prevent merge conflicts in auto-generated lock files
  ```

## 2. Branching Strategy

- Use a feature branch workflow with clear, consistent branch naming:

  | Branch Pattern                       | Purpose                                   |
  | ------------------------------------ | ----------------------------------------- |
  | `feature/<ticket>-short-description` | New feature development                   |
  | `fix/<ticket>-short-description`     | Bug fixes                                 |
  | `release/x.y.z`                      | Release stabilization                     |
  | `hotfix/<ticket>-short-description`  | Emergency production patches              |
  | `chore/<description>`                | Maintenance (dependency updates, tooling) |

- Branch names must be **lowercase with hyphens**. Include ticket/issue numbers where applicable: `feature/issue-234-oauth-login`.
- Before merging into `main`, the branch MUST:
  - Pass CI completely (all jobs green)
  - Receive approval from at least 1 reviewer (preferably 2 for critical paths)
  - Have no unresolved comments blocking merge
  - Be up-to-date with the base branch (rebased or merged)
- Delete branches after merging — keep the remote repository clean. Enforce with GitHub/GitLab "Delete head branch" on merge settings.
- **Monorepo strategy**: use path-scoped branch names (`feature/auth-<ticket>`) and only run CI for affected packages using Nx, Turborepo, or Bazel affected detection.

## 3. Pull Request Requirements

- PR titles MUST follow the Conventional Commits format for automated changelog generation from PR merge commits.
- PR descriptions MUST include all relevant sections. Use a PR template (`.github/pull_request_template.md`):

  ```markdown
  ## Summary

  <!-- What does this PR change and why? -->

  ## Testing Performed

  <!-- Unit tests, manual test steps, affected environments -->

  ## Related Issues

  Closes: #234

  ## Rollback Plan

  <!-- For risky changes: how to revert if something goes wrong -->

  ## Checklist

  - [ ] Tests added/updated
  - [ ] Documentation updated
  - [ ] No secrets or PII in code/tests
  - [ ] Changelog entry added (if applicable)
  ```

- Use **Draft PRs** for work-in-progress. Convert to "Ready for Review" only when CI passes and the implementation is complete. Do not request reviews on Draft PRs.
- PRs related to **security**, **dependencies**, or **database migrations** MUST:
  - Explicitly list impacts and risks
  - Include tags: `security`, `db-migration`, `breaking-change`
  - Document a rollback procedure
  - Get approval from a second reviewer
- Keep PRs small and focused: target **< 400 lines changed per PR**. Large PRs MUST be broken into smaller, logically independent PRs linked by a parent tracking issue. Gigantic PRs are rarely reviewed well.

## 4. Code Review Standards

- Reviewers MUST check for: correctness, test coverage adequacy, security implications, performance impact, and adherence to project conventions.
- Use **blocking** review comments (`Request changes`) for required changes. Use non-blocking comments (prefixed with `nit:` or `suggestion:`) for optional improvements that should not block merge:

  ```
  # Blocking (must be addressed before merge)
  This function doesn't validate the input — malicious data could cause a SQL injection.

  # Non-blocking (nice to have)
  nit: Consider extracting this into a helper function for reusability.
  suggestion: We could use a Set here instead of an Array for O(1) lookup.
  ```

- **Review SLA**: reviewers MUST respond within **48 business hours** of being requested. If no response within SLA, the PR author may escalate or seek an alternate reviewer.
- Authors MUST respond to all review comments and resolve them before requesting re-review. Do not force-push to a branch under active review without notifying reviewers.
- **AI-assisted review**: treat AI suggestions as a first-pass only. Human reviewers remain accountable for all approved changes. Never merge based solely on an AI tool's approval.

## 5. History Hygiene

- Use **`rebase`** (not merge commits) to integrate upstream changes into feature branches to maintain a linear, readable history:

  ```bash
  git fetch origin
  git rebase origin/main   # rebase feature branch onto latest main
  git push --force-with-lease origin feature/my-branch   # force-push rewritten history
  ```

  Use `--force-with-lease` (never bare `--force`) to prevent overwriting others' work.
- **Squash** trivial/fixup commits (`WIP`, `fix typo`, `address review comment`) before merging. Preserve meaningful individual commits that tell the story of a change. Configure **Squash and Merge** as the default merge strategy on GitHub/GitLab for repositories preferring linear history.
- Never rewrite history on shared branches (`main`, `develop`, `release/*`). Force-push is only allowed on personal feature branches with prior team communication.
- Store large binary files (videos, datasets, compiled artifacts > 50 MB) in **Git LFS**:

  ```bash
  git lfs install
  git lfs track "*.bin" "*.mp4" "*.zip" "model-weights/**"
  git add .gitattributes
  ```

  Document LFS usage in the project README and include LFS setup in onboarding instructions.
- Tag every production release with a **signed, annotated tag**:

  ```bash
  git tag -a -s v1.2.3 -m "Release v1.2.3: Add OAuth2 login, fix token refresh race"
  git push origin v1.2.3
  ```

  Enforce tag signing verification via CI: `git tag -v v1.2.3`.
