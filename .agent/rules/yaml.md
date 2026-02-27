# YAML Writing Guidelines

> Objective: Define standards for writing clean, consistent, and valid YAML
> documents that pass `yamllint` validation, covering document structure,
> linting, formatting, data types, anchors, CI enforcement, and
> ecosystem-specific conventions (GitHub Actions, Docker Compose, Ansible).

## 1. Document Structure

- Every YAML document MUST start with a **document start marker** (`---`) on
  the first line. The `yamllint` `document-start` rule enforces this and the
  marker signals to both tools and humans that the file is intentionally YAML:

  ```yaml
  ---
  name: My Document
  version: "1.0.0"
  ```

- Use a new `---` marker to separate multiple documents within a single file.
  Each document is an independent unit:

  ```yaml
  ---
  # Document 1
  name: alpha

  ---
  # Document 2
  name: beta
  ```

- End every file with exactly **one trailing newline**. No extra blank lines
  after the last entry. Configure your editor to enforce this on save.

## 2. yamllint Compliance

### CI Enforcement

- Run `yamllint` in CI on all YAML files **before** any build or deployment
  step to catch formatting errors early and prevent broken configs from
  reaching production:

  ```bash
  yamllint .
  ```

- Commit a `.yamllint.yml` at the repository root to share a consistent
  ruleset across all contributors and CI environments:

  ```yaml
  ---
  extends: default

  # Exclude non-YAML sources that contain YAML code blocks
  ignore: |
    node_modules/
    dist/
    build/
    .git/
    **/*.md

  rules:
    line-length:
      max: 80
      level: error
    document-start:
      present: true
      level: error
    truthy:
      allowed-values: ["true", "false"]
      level: error
    indentation:
      spaces: 2
      indent-sequences: true
      level: error
    trailing-spaces:
      level: error
    empty-lines:
      max: 2
      level: error
    new-line-at-end-of-file:
      level: error
  ```

> [!IMPORTANT]
> Always add `**/*.md` to the `ignore` list. Markdown files often contain
> YAML code-fenced blocks that are syntactically invalid when parsed
> standalone, causing false-positive errors.

### Key Rules Reference

| Rule                      | Requirement                   | Common Mistake                    |
| :------------------------ | :---------------------------- | :-------------------------------- |
| `document-start`          | Always begin with `---`       | Missing `---` on line 1           |
| `line-length`             | Max 80 characters             | Long `description:` strings       |
| `truthy`                  | Only `true`/`false`           | Using `on`, `yes`, `off` unquoted |
| `indentation`             | 2 spaces, no tabs             | Mixed tabs and spaces             |
| `trailing-spaces`         | No trailing whitespace        | Editor trailing spaces            |
| `empty-lines`             | Max 2 consecutive blank lines | Accidental blank line runs        |
| `new-line-at-end-of-file` | Exactly one trailing newline  | Missing final newline             |

## 3. Formatting & Style

### Indentation

- Use **2 spaces** for all indentation levels. Never use hard tabs. Configure
  your editor to insert spaces on the Tab key for YAML files:

  ```yaml
  # ✅ Correct: 2-space indentation
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4

  # ❌ Wrong: 4-space or tab indentation
  jobs:
      build:
          runs-on: ubuntu-latest
  ```

### Line Length

- Keep all lines within **80 characters**. Use YAML block scalars to wrap
  long strings cleanly without breaking semantics:

- **Folded scalar** (`>`): folds newlines into spaces — ideal for prose
  descriptions and long single-line values:

  ```yaml
  # ✅ Good: folded scalar, each source line ≤ 80 chars
  description: >
    This project uses a unified rule system. All changes must
    adhere to the rules in the `.agent/rules/` directory.

  # ❌ Bad: single line exceeds 80 characters
  description: "This project uses a unified rule system, all changes must adhere to rules."
  ```

- **Literal scalar** (`|`): preserves every newline — use for multiline
  scripts, configuration blocks, or any content where line breaks matter:

  ```yaml
  # ✅ Good: literal scalar preserves newlines for shell scripts
  run: |
    echo "Starting build..."
    go build -o server ./cmd/server
    echo "Build complete."
  ```

- **Chomping modifiers** (`>-`, `|-`): strip the trailing newline added by
  the block scalar — use when the consuming tool does not expect a trailing
  newline (e.g., single-line env var values):

  ```yaml
  # >- folds + strips trailing newline
  message: >-
    This long message renders as one line
    with no trailing newline character.

  # |- preserves newlines + strips trailing newline
  script: |-
    echo "line one"
    echo "line two"
  ```

### Quotes and Strings

- Quote strings that contain **special characters**, colons followed by a
  space (`:` + space), leading `#`, or values that could be misinterpreted
  as another YAML type:

  ```yaml
  # ✅ Must quote: special chars, colon-space, leading hash
  title: "Fix: resolved #123"
  ratio: "1:2"
  comment: "#this-is-not-a-comment"
  empty: ""

  # ✅ No quotes needed: plain safe strings
  name: my-service
  env: production
  image: nginx:alpine
  ```

- **Always quote** YAML 1.1 truthy-ambiguous strings when used as plain
  text. YAML 1.1 (PyYAML, many CI parsers) silently converts these to
  booleans:

  | Unquoted value            | YAML 1.1 result | Fix             |
  | :------------------------ | :-------------- | :-------------- |
  | `on`, `yes`, `true`, `y`  | `True` (bool)   | `'on'`, `'yes'` |
  | `off`, `no`, `false`, `n` | `False` (bool)  | `'off'`, `'no'` |
  | `~`                       | `None` (null)   | `'~'`           |

  ```yaml
  # ✅ GitHub Actions — 'on' must be quoted
  'on':
    push:
      branches:
        - main

  # ❌ Many parsers treat unquoted 'on' as boolean true
  on:
    push:
      branches:
        - main
  ```

- Prefer **single quotes** (`'`) for strings with no escape sequences (they
  are literal — no backslash interpretation). Use **double quotes** (`"`)
  only when escape sequences are required (`\n`, `\t`, `\"`, etc.):

  ```yaml
  path: "/usr/local/bin" # single: no escapes needed
  message: "Hello\tWorld\n" # double: tab + newline escapes
  ```

## 4. Comments

- Place comments on their own line above the code they describe, or inline
  with a **single space** after `#`. Never omit the space:

  ```yaml
  # ✅ Block comment — describes the following line
  # Run at 00:30 UTC every day (staggered to avoid GitHub rate limits)
  - cron: "30 0 * * *"

  retries: 3  # max retries before marking job failed
  ```

- Write comments in **English**. Explain the _why_ and _constraints_ — the
  YAML structure itself shows _what_ is configured:

  ```yaml
  # ❌ Explains nothing new
  timeout: 30  # timeout is 30

  # ✅ Explains the constraint and its origin
  timeout: 30  # 30s: upstream API SLA is 25s + 5s buffer
  ```

- Do NOT commit commented-out configuration blocks. Either delete unused
  configuration or track it in a dedicated issue/PR:

  ```yaml
  # ❌ Do not leave dead config in production files
  # replicas: 3
  replicas: 1
  ```

## 5. Data Types & Scalars

### Booleans

- Use **unquoted** `true` / `false` for genuine boolean values — they are
  unambiguous in both YAML 1.1 and 1.2:

  ```yaml
  enabled: true
  debug: false
  dry_run: true
  ```

### Numbers

- Use unquoted integers and floats. **Never use leading zeros** for decimal
  integers — YAML 1.1 parsers interpret them as octal:

  ```yaml
  port: 8080
  timeout: 30.5

  # ❌ Parsed as octal 0700 = 448 in YAML 1.1
  mode: 0700

  # ✅ For file permissions, always quote
  mode: "0700"
  ```

### Null Values

- Use explicit `null` to express absent/undefined values. Avoid `~` (tilde)
  or bare empty values, which are less readable and tool-dependent:

  ```yaml
  # ✅ Explicit null — clear intent
  assignee: null
  optional_field: null

  # ❌ Ambiguous — is this null, empty string, or omission?
  assignee:
  optional_field: ~
  ```

### Multiline Strings — Quick Reference

| Style | Newlines        | Trailing newline | Use for                            |
| :---- | :-------------- | :--------------- | :--------------------------------- |
| `\|`  | Preserved       | Kept             | Shell scripts, multi-line configs  |
| `>`   | Folded to space | Kept             | Prose descriptions, long strings   |
| `\|-` | Preserved       | Stripped         | Scripts used as inline values      |
| `>-`  | Folded to space | Stripped         | Descriptions used as inline values |

## 6. Anchors & Aliases (DRY)

- Use **anchors** (`&name`) and **aliases** (`*name`) to eliminate repeated
  identical blocks. This is YAML's native DRY mechanism — reduces drift and
  maintenance overhead:

  ```yaml
  ---
  # Shared default settings — reused by all services below
  x-defaults: &defaults
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"

  services:
    web:
      <<: *defaults # merge anchor — inherits all defaults
      image: nginx:alpine
      ports:
        - "80:80"

    api:
      <<: *defaults # reuse without duplication
      image: myapp:latest
      ports:
        - "8080:8080"
  ```

- Name anchors descriptively. Use an `x-` prefix for extension fields in
  Docker Compose, or `_` prefix for generic anchors to signal they are
  reusable templates, not standalone data:

  ```yaml
  # Docker Compose extension field convention
  x-common-env: &common-env
    TZ: UTC
    LOG_LEVEL: info

  # Generic anchor convention
  _base_job: &base_job
    runs-on: ubuntu-latest
    timeout-minutes: 30
  ```

> [!NOTE]
> Anchor merge (`<<:`) is a YAML 1.1 feature. It is widely supported in
> Docker Compose and CI tools but is not part of the YAML 1.2 spec.
> Verify support before using it with strict YAML 1.2 parsers.

## 7. Ecosystem-Specific Conventions

### GitHub Actions

- Quote the `on:` trigger key with **single quotes** — unquoted `on` is
  a YAML boolean in YAML 1.1:

  ```yaml
  ---
  name: CI

  "on":
    push:
      branches: ["main"]
    pull_request:
      branches: ["main"]
  ```

- Use block scalars (`|`) for all multi-step `run:` blocks:

  ```yaml
  - name: Build and test
    run: |
      go build ./...
      go test ./... -race
  ```

### Docker Compose

- Use `x-` prefixed extension fields with YAML anchors for shared service
  configuration. This is the idiomatic DRY pattern in Compose:

  ```yaml
  ---
  x-restart: &restart
    restart: unless-stopped

  services:
    db:
      <<: *restart
      image: postgres:16-alpine
  ```

- Always quote port mappings to prevent colon-ambiguity parsing issues:

  ```yaml
  ports:
    - "8080:80" # ✅ quoted
    - 8080:80 # ❌ may cause parsing issues on some YAML parsers
  ```

### Ansible

- Prefer `true`/`false` over `yes`/`no` for boolean task parameters —
  `yes`/`no` are YAML 1.1 truthy values that may behave unexpectedly in
  strict parsers or future Ansible versions:

  ```yaml
  - name: Enable service
    ansible.builtin.service:
      name: nginx
      enabled: true # ✅ unambiguous
      state: started
  ```

## 8. Schema Validation & Editor Integration

- Configure JSON Schema validation in your editor to catch structural errors
  at edit time, before CI runs. For VS Code, add `yaml.schemas` to
  `.vscode/settings.json`:

  ```json
  {
    "yaml.schemas": {
      "https://json.schemastore.org/github-workflow.json": ".github/workflows/*.yml",
      "https://json.schemastore.org/docker-compose.json": "docker-compose*.yml",
      "https://json.schemastore.org/ansible-playbook.json": "playbooks/*.yml"
    }
  }
  ```

- Install the **[YAML extension for VS Code](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)**
  (Red Hat) which provides schema-driven autocompletion, hover docs, and
  inline error highlighting.

## 9. Security & Sensitive Values

- **Never hardcode** secrets, API keys, tokens, or passwords in YAML files
  committed to version control. Reference environment variables or a secrets
  manager instead:

  ```yaml
  # ❌ Hardcoded secret — visible in git history forever
  database:
    password: "my-super-secret-password"

  # ✅ Reference from environment at runtime
  database:
    password: "${DB_PASSWORD}"

  # ✅ Reference from GitHub Actions secrets
  env:
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  ```

- Apply `yamllint` secret scanning in CI with tools like `gitleaks` or
  `truffleHog` in addition to formatting checks. Run them as the first
  pipeline step before any build:

  ```bash
  gitleaks detect --source . --exit-code 1
  yamllint .
  ```
