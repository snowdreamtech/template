# Git, Commit & PR Guidelines

> Objective: Unify commit history, PR workflows, and review standards to improve traceability and collaboration efficiency.

## 1. Commit Messages

- Use the Conventional Commits format: `<type>(<scope>): <description>` (Types: feat, fix, docs, style, refactor, test, chore).
- Commit messages MUST be in English.

## 2. Branching Strategy

- Recommend using feature branches (`feature/*`), `develop`, and `main` (or `release/*`).
- Before merging into `main`, it MUST pass CI and get approval from at least one reviewer.

## 3. PR Requirements

- PR descriptions should include a summary of changes, validation steps, related issue/task numbers, and rollback precautions.
- PRs related to security, dependencies, or database migrations must explicitly list impacts and rollback steps, and be tagged with `security` or `db`.

## 4. Cleaning History

- Selectively squash or rebase history to keep the main branch clear; however, the merge strategy requires team consensus.
