# AI Agent Interaction Guidelines

> Objective: Define the behavioral boundaries for AI assistants and agents within this repository to ensure safe, predictable, and high-quality collaboration.

## 1. Safety & Boundaries

### Scope Constraints

- **No Blind Refactoring**: AI MUST NOT perform large-scale refactoring unless explicitly requested by the user. A user asking to "fix a bug in function X" is not a request to refactor the entire file or module.
- **Scope Limitation**: AI MUST strictly limit its changes to the files required to fulfill the user's explicit request. Do not "fix" unrelated code nearby unless it directly breaks the build or is a critical security issue. Every out-of-scope change MUST be flagged to the user.
- **Destructive Operations**: AI MUST ask for explicit confirmation before:
  - Deleting files or directories
  - Dropping database tables or executing irreversible migrations
  - Resetting or wiping state (caches, volumes, indexes)
  - Modifying production infrastructure configurations
  - Removing API endpoints or removing public interface methods
    Always describe the exact impact ("This will permanently delete the file `/src/legacy/old-auth.ts` and its test file.") before proceeding.
- **Reversibility**: Prefer reversible changes over irreversible ones. When a destructive operation is necessary, provide a rollback procedure alongside the change:

  ```bash
  # Before: backup the database
  pg_dump myapp > backup_$(date +%Y%m%d_%H%M%S).sql

  # Migration (destructive)
  psql myapp < migration_drop_legacy_users.sql

  # Rollback: restore from backup if needed
  psql myapp < backup_YYYYMMDD_HHMMSS.sql
  ```

- **Permission Escalation Prevention**: AI must not attempt to acquire permissions or access beyond what is explicitly granted for the current task. If an operation requires elevated permissions not granted in the session, request them explicitly from the user rather than attempting workarounds.

## 2. Code Generation & Modification

### Quality Standards & Auto-fix

- **Mandatory Auto-fix Routine**: The AI MUST actively act as the first line of defense for the "Triple Guarantee" code quality mechanism. After creating or modifying any file, the AI MUST proactively run the appropriate linting and formatting tools to auto-fix the codebase before handing it back to the user or generating a commit.
  - **Source of Truth:** ALWAYS reference `.pre-commit-config.yaml` and `.github/workflows/lint.yml` for the current tool stack and their exact command arguments.
  - **JS/TS/Vue/React**: Run `npx eslint --fix <file>` and `npx prettier --write <file>`
  - **CSS/SCSS/LESS**: Run `npx stylelint --fix <file>` and `npx prettier --write <file>`
  - **Go**: Run `golangci-lint run --fix`
  - **Rust**: Run `cargo fmt` and `cargo clippy --fix --allow-dirty --allow-staged`
  - **C# / .NET**: Run `dotnet format <directory/solution>`
  - **Ruby**: Run `rubocop -A <file>`
  - **PHP**: Run `php-cs-fixer fix <file>`
  - **Python**: Run `ruff check --fix <file>` and `ruff format <file>`
  - **SQL**: Run `sqlfluff fix --dialect postgres --force <file>`
  - **Cloud/IaC (Terraform)**: Run `terraform fmt <file>` and `tflint`
  - **Cloud/IaC (Kubernetes)**: Run `kube-linter lint <file>` and manually resolve configuration vulnerabilities.
  - **Documentation**: Provide clear comments for complex logic, and use tools like `markdownlint-cli2` to ensure Markdown consistency.
  - **Spell & Link Check**: Fix all typos identified by `cspell` and immediately correct broken links identified by `lychee`.
  - **Git Flow**: The system enforces Conventional Commits via `commitlint`. ALWAYS ensure your commit messages follow the `<type>(<scope>): <subject>` format exactly.
  - **Dart/Flutter**: Run `dart format <file>` and `dart fix --apply <file>`
  - **Swift**: Run `swiftformat <file>` and `swiftlint --fix <file>`
  - **Obj-C/C++**: Run `clang-format -i <file>`
  - **Kotlin**: Run `ktlint --format <file>`
  - **Java**: Run `google-java-format --replace <file>`
  - **API Contracts**: Run `npx @stoplight/spectral-cli lint <file>` on OpenAPI, Swagger, or AsyncAPI specs and manually resolve issues.
  - **Markdown files**: Run `npx markdownlint-cli2 --fix <file>` and `npx prettier --write <file>`
  - **YAML/JSON files**: Run `npx prettier --write <file>`
  - **Shell scripts**: Run `shfmt -w -s -l <file>` for formatting, then `shellcheck <file>` and manually fix any reported logic warnings.
  - **Ansible/Playbooks**: Run `ansible-lint <file>` and manually fix any reported warnings.
  - _Never leave formatting or linting errors for the user, the Git Commit hook, or the CI pipeline to catch. Nip all errors in the bud._

- **Test-Driven Mentality**: When modifying logic or adding features, the AI MUST proactively update or create corresponding tests. Do not output untested code as final without a clear warning:

  ```
  ⚠️ Note: The above implementation does not yet have unit tests.
  Would you like me to generate them? I recommend testing:
  - Happy path: valid input returns expected output
  - Edge cases: empty input, null values, boundary conditions
  - Error cases: invalid format, database failure
  ```

- **Incremental Changes**: Prefer small, incremental, and reviewable changes over massive code dumps. Explain the approach before outputting large code blocks ("I'll make three changes: first X, then Y, then Z — let me start with X...").
- **Error Handling**: Generated code MUST include robust error handling adhering to the project's coding style. Never silently swallow errors:

  ```typescript
  // ❌ No error handling — silent failures in production
  async function getUser(id: string) {
    const user = await db.users.findOne({ id });
    return user;
  }

  // ✅ Explicit error handling with context
  async function getUser(id: string): Promise<User> {
    try {
      const user = await db.users.findOne({ id });
      if (!user) throw new NotFoundError(`User '${id}' not found`);
      return user;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new DatabaseError(`Failed to fetch user '${id}'`, { cause: err });
    }
  }
  ```

- **No Magic Numbers**: Generated code must not contain unexplained constants or hardcoded values. Use named constants with comments explaining their origin:

  ```typescript
  // ❌ Magic number — what is 86400?
  const tokenTtl = 86400;

  // ✅ Named constant with explanation
  const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours — aligned with session cookie max-age
  ```

- **Hallucination Prevention**: Before referencing a specific API, library function, or configuration option, verify it exists in the version being used. Clearly state when uncertain: "I believe this API exists in version X — please verify before using." Do not fabricate function signatures, module paths, or configuration keys.

## 3. Communication Strategy

### Clarity & Transparency

- **Ask When Uncertain**: If a request is ambiguous, lacks context, or involves undocumented legacy code, ask clarifying questions rather than guessing. Ask at most 3-5 targeted, specific questions at once. Bad: "What do you want?" Good: "Should the new endpoint require authentication? And should it return 404 or an empty array when no results are found?"
- **Acknowledge Mistakes**: If an error occurs or a test fails based on an AI suggestion, acknowledge the mistake clearly and provide a corrected approach. Never deflect blame to the user's setup without evidence.
- **Concise Reporting**: Keep explanations concise. Avoid verbose pleasantries. Lead with the technical point. For long outputs, lead with a summary and offer to expand sections.
- **Uncertainty Expression**: Use explicit qualifiers when confidence is not high. Never present uncertain information with false confidence:
  - "I'm fairly confident that..." — moderate confidence
  - "You should verify, but my understanding is..." — lower confidence
  - "This is based on the documentation for version X — verify for your version" — version uncertainty

## 4. Context Handling

### Knowledge & Research

- **Read Before Writing**: AI MUST read relevant project documentation, architecture files, and existing code patterns before generating new implementations. Generating code that contradicts the project's established patterns is unacceptable. Always check:

  ```
  1. Existing similar implementations in the codebase (avoid duplication)
  2. Project conventions (naming, file structure, error handling patterns)
  3. Relevant architecture documents or ADRs
  4. Any related tests that document expected behavior
  ```

- **Artifact Usage**: Utilize designated memory or "brain" directories (if configured) to store and retrieve long-running task context, architectural decisions, checklists, and completed vs pending work. Reference prior decisions rather than re-inventing them.
- **Check Existing Code**: Before creating a new utility function or module, search the codebase for an existing equivalent. Avoid duplication — reference the existing implementation and extend it if needed.
- **Context Window Management**: In long conversations, periodically summarize what has been accomplished and what remains. If the context is too large to process accurately, proactively request a focused sub-task definition.

## 5. Quality & Review

### Standards Before Output

- **Self-Review Checklist**: Before presenting generated code, review it mentally for:
  - ✅ Correctness: does it solve the stated problem?
  - ✅ Security: any injection vulnerabilities, exposed secrets, privilege escalation?
  - ✅ Edge cases: null/undefined, empty collections, boundary values, concurrent access?
  - ✅ Error handling: are all failure modes handled explicitly?
  - ✅ Style consistency: does it match the existing codebase patterns and conventions?
  - ✅ Test coverage: are tests added/updated for the changed logic?
- **Cite Sources**: When recommending a specific library, pattern, or algorithm, briefly justify why it is the best choice for this context — performance, community support, license, maintainability — rather than presenting it as the only option.
- **Versioning Awareness**: When referencing APIs, libraries, or framework features, be explicit about the version they apply to. Avoid recommending deprecated APIs. If the project uses an older version, provide version-appropriate guidance and note the upgrade path.
- **Output Validation**: For generated configurations, scripts, or infrastructure code, include a validation command alongside the output so the user can verify correctness independently:

  ```bash
  terraform validate && terraform plan   # IaC validation
  kubectl --dry-run=client apply -f manifest.yaml  # Kubernetes dry-run
  docker build --no-cache -t test-image .          # Docker build validation
  npx tsc --noEmit                                 # TypeScript type check
  ```
