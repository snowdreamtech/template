# Git, Commit & PR Guidelines

> Objective: Unify commit history, branching, PR workflows, and review standards to improve traceability and collaboration efficiency.

## 1. Commit Messages

- Use **Conventional Commits** format: `<type>(<scope>): <description>` (e.g., `feat(auth): add OAuth2 login`).
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.
- Commit messages **MUST** be in **English**. The description must be concise (≤ 72 characters), written in the imperative mood ("add", not "added"). The body (optional) explains **why**, not what — the diff shows what. Separate body from subject with a blank line.
- Breaking changes MUST include a `BREAKING CHANGE:` footer in the commit body: `BREAKING CHANGE: removed /api/v1 endpoint, use /api/v2`.
- Where the repository policy requires it, **sign commits with GPG** (`git commit -S`). Enforce signature verification on protected branches via branch protection rules.
- Configure `.gitattributes` to normalize line endings (`* text=auto`) and designate merge drivers for binary formats.

## 2. Branching Strategy

- Use a feature branch workflow with clear branch naming:
  - `feature/<ticket>-short-description` — new feature work
  - `fix/<ticket>-short-description` — bug fixes
  - `release/x.y.z` — release stabilization
  - `hotfix/<ticket>-short-description` — emergency production fixes
- Branch names must be **lowercase with hyphens**. Include ticket/issue numbers where applicable.
- Before merging into `main`, the branch MUST pass CI completely and receive approval from at least one (preferably two) reviewers.
- Delete branches after merging. Keep the remote repository clean.
- **Monorepo strategy**: in a monorepo, use path-scoped branch names (`feature/auth-<ticket>`) and only run CI for affected packages/services (using Nx, Turborepo, or Bazel affected detection).

## 3. Pull Request Requirements

- PR titles MUST follow the Conventional Commits format for automated changelog generation.
- PR descriptions MUST include: **Summary of changes**, **Testing performed**, **Related issue/ticket**, and **Rollback plan** for risky changes.
- Use **Draft PRs** for work-in-progress to signal that the code is not ready for review. Convert to "Ready for Review" only when CI passes and the implementation is complete.
- PRs related to security, dependencies, or database migrations MUST explicitly list impacts, tag the PR (`security`, `db-migration`), and have a rollback procedure documented.
- Keep PRs small and focused (target **< 400 lines changed**). Large PRs MUST be broken into smaller, logically independent PRs with a parent PR or tracking issue.

## 4. Code Review Standards

- Reviewers MUST check for: correctness, test coverage, security implications, performance impact, and adherence to project conventions.
- Use **blocking** review comments for required changes. Use non-blocking comments (prefixed with `nit:` or `suggestion:`) for optional improvements.
- **Review SLA**: reviewers MUST respond within **48 business hours** of being requested. If no response within SLA, the PR author may escalate or seek an alternate reviewer.
- Authors MUST respond to all review comments before requesting re-review. Do not force-push to a branch under active review without notifying reviewers.
- **AI-assisted review**: when using AI tools to assist code review, treat AI suggestions as a first pass only. Human reviewers remain accountable for all approved changes. Do not merge based solely on AI approval.

## 5. History Hygiene

- Use `rebase` (not merge) to integrate upstream changes into feature branches to maintain a linear, readable history.
- **Squash** trivial/fixup commits (`wip`, `fix typo`, `address review`) before merging. Preserve meaningful individual commits that tell the story of a change.
- Never rewrite history on shared branches (`main`, `develop`, `release/*`). Force-push is only allowed on personal feature branches with prior team communication.
- Store large binary files (videos, datasets, compiled artifacts > 50 MB) in **Git LFS** (`git lfs track "*.bin"`), not directly in the repository. Document LFS usage in the project README.
- Tag every production release with a signed semantic version tag: `git tag -a -s v1.2.3 -m "Release v1.2.3"` and push tags to the remote.
