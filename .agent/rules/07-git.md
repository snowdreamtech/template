# Git, Commit & PR Guidelines

> Objective: Unify commit history, branching, PR workflows, and review standards to improve traceability and collaboration efficiency.

## 1. Commit Messages

- Use **Conventional Commits** format: `<type>(<scope>): <description>` (e.g., `feat(auth): add OAuth2 login`).
- Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`.
- Commit messages **MUST** be in **English**. The description must be concise (≤ 72 characters), written in the imperative mood ("add", not "added").
- The commit body (optional) explains **why** the change was made, not what — the diff shows what.

## 2. Branching Strategy

- Use feature branches (`feature/<ticket>-short-description`), `develop` (integration), and `main` (production-ready).
- Branch names must be lowercase with hyphens. Include ticket/issue numbers where applicable.
- Before merging into `main`, the branch MUST pass CI completely and receive approval from at least one (preferably two) reviewers.
- Delete branches after merging. Keep the remote repository clean.

## 3. Pull Request Requirements

- PR titles must follow the Conventional Commits format for automated changelog generation.
- PR descriptions must include: **Summary of changes**, **Testing performed**, **Related issue/ticket**, and **Rollback plan** for risky changes.
- PRs related to security, dependencies, or database migrations must explicitly list impacts, tag the PR with `security` or `db-migration`, and have a rollback procedure documented.
- Keep PRs small and focused (< 400 lines changed). Large PRs must be broken into smaller, logically independent PRs.

## 4. Code Review Standards

- Reviewers must check for: correctness, test coverage, security implications, performance impact, and adherence to project conventions.
- Use **blocking** review comments for required changes. Use non-blocking comments (prefixed with `nit:` or `suggestion:`) for optional improvements.
- Authors must respond to all review comments before requesting re-review. Do not force-push to a branch under active review without notifying reviewers.

## 5. History Hygiene

- Use `rebase` (not merge) to integrate upstream changes into feature branches to maintain a linear, readable history.
- **Squash** trivial/fixup commits (`wip`, `fix typo`) before merging. Preserve meaningful individual commits that tell the story of a change.
- Never rewrite history on shared branches (`main`, `develop`). Force-push is only allowed on personal feature branches with prior team communication.
- Tag every production release with a semantic version tag: `git tag -a v1.2.3 -m "Release v1.2.3"`.
