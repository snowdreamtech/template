# YAML Writing Guidelines

> Objective: Define standards for writing clean, consistent, and valid YAML
> documents that pass `yamllint` validation, covering structure, linting,
> formatting, scalars, comments, and CI enforcement best practices.

## 1. Document Structure

- Every YAML document MUST start with a **document start marker** (`---`) on the
  first line. This is required by `yamllint` `document-start` rule and clearly
  signals intent:

  ```yaml
  ---
  name: My Document
  version: 1.0.0
  ```

- Use a new `---` marker to separate multiple documents within a single file:

  ```yaml
  ---
  # Document 1
  name: alpha

  ---
  # Document 2
  name: beta
  ```

- End every file with exactly **one trailing newline**. No trailing empty lines
  after the last entry.

## 2. yamllint Compliance

### CI Enforcement

- Run `yamllint` in CI on all YAML files **before** any build or deployment
  step to catch formatting errors early:

  ```bash
  yamllint .
  # or with explicit config
  yamllint -c .yamllint.yml .
  ```

- Commit a `.yamllint.yml` at the repository root to share consistent rules
  across all contributors:

  ```yaml
  ---
  extends: default

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

- Add `**/*.md` to the `ignore` list to prevent yamllint from parsing
  Markdown files, which may contain YAML code-fenced blocks that appear
  syntactically invalid out of context.

### Key Rules Reference

| Rule                      | Requirement                     | Common Mistake                     |
| :------------------------ | :------------------------------ | :--------------------------------- |
| `document-start`          | Always begin with `---`         | Missing `---` on line 1            |
| `line-length`             | Max 80 characters               | Long `description:` strings        |
| `truthy`                  | Only `true`/`false` as booleans | Using `on`, `yes`, `off` unquoted  |
| `indentation`             | 2 spaces, no tabs               | Mixed tabs and spaces              |
| `trailing-spaces`         | No trailing whitespace          | Editor trailing spaces             |
| `empty-lines`             | Max 2 consecutive blank lines   | Accidental blank line runs         |
| `new-line-at-end-of-file` | Exactly one trailing newline    | Missing or double trailing newline |

## 3. Formatting & Style

### Indentation

- Use **2 spaces** for all indentation levels. Never use hard tabs:

  ```yaml
  # ✅ Correct: 2 spaces
  jobs:
    build:
      steps:
        - name: Checkout

  # ❌ Wrong: tabs or 4 spaces
  jobs:
      build:
  ```

### Line Length

- Keep all lines within **80 characters**. Use YAML block scalars to wrap long
  strings — this avoids horizontal scroll and satisfies `line-length` linting.

- **Folded scalar** (`>`): newlines become spaces — use for prose descriptions:

  ```yaml
  # ✅ Good: folded scalar wraps long description
  description: >
    This project uses a unified rule system. All changes must adhere
    to the rules in the `.agent/rules/` directory.

  # ❌ Bad: single long line
  description: "This project uses a unified rule system. All changes must adhere to the rules in the `.agent/rules/` directory."
  ```

- **Literal scalar** (`|`): preserves newlines — use for multiline scripts or
  code:

  ```yaml
  # ✅ Good: literal scalar for shell script
  run: |
    echo "Building..."
    go build -o server ./cmd/server
    echo "Done"
  ```

- **Block scalars with chomping** (`>-`, `|-`): strip the final newline — use
  when the consuming tool does not expect a trailing newline:

  ```yaml
  message: >-
    This string will have no trailing newline,
    which is useful for inline values.
  ```

### Quotes and Strings

- Quote strings that contain **special characters**, colons followed by a space,
  hash symbols, or YAML type-ambiguous values:

  ```yaml
  # ✅ Quote to avoid ambiguity
  title: "Fix: resolved #123"
  ratio: "1:2"
  empty: ""

  # ✅ No quotes needed for simple strings
  name: my-service
  env: production
  ```

- **Always quote** strings that look like booleans (`true`, `false`, `yes`,
  `no`, `on`, `off`) when you intend them as string values. YAML 1.1 (used by
  many parsers including PyYAML) interprets these as boolean — a major source of
  bugs in CI/CD pipelines:

  ```yaml
  # ✅ Good: single-quoted to prevent truthy parsing
  'on':
    push:
      branches:
        - main

  # ❌ Bad: 'on' is parsed as boolean true by YAML 1.1 parsers
  on:
    push:
      branches:
        - main
  ```

- Prefer **single quotes** (`'`) for string values that contain no escape
  sequences. Use **double quotes** (`"`) only when escape sequences are needed
  (`\n`, `\t`, `\"`, etc.).

## 4. Comments

- Place comments on their own line or inline with a **single space after `#`**:

  ```yaml
  # ✅ Good: block comment
  # Automatically run on every week
  - cron: "0 0 * * 0"

  name: my-job  # inline: keep short and on-point
  ```

- Write comments in **English**. Explain the _why_, not the _what_ — the YAML
  structure itself shows what is configured.

- Do NOT leave commented-out code in production YAML files. Remove it or
  track it in a dedicated issue instead.

## 5. Data Types & Scalars

### Numbers and Booleans

- Always use unquoted `true`/`false` for actual boolean values. Use unquoted
  integers and floats without leading zeros (to avoid octal parsing):

  ```yaml
  enabled: true
  debug: false
  port: 8080
  timeout: 30.5
  # ❌ Leading zero — parsed as octal 0700 = 448 in YAML 1.1
  mode: 0700
  # ✅ For file permissions, use strings
  mode: "0700"
  ```

### Null Values

- Use `null` (not `~` or empty) to express null/undefined values explicitly:

  ```yaml
  # ✅ Explicit and clear
  assignee: null

  # ❌ Ambiguous — empty value or null?
  assignee:
  ```

### Multiline Strings

- Use `|` for content where newlines are significant (scripts, configs).
- Use `>` for prose where newlines are just formatting aids.
- Use `>-` or `|-` to strip the trailing newline when needed.

## 6. Anchors & Aliases (DRY)

- Use **anchors** (`&`) and **aliases** (`*`) to avoid repeating identical
  blocks. This is YAML's native DRY mechanism:

  ```yaml
  ---
  # Define an anchor
  _defaults: &defaults
    restart: always
    logging:
      driver: json-file

  services:
    web:
      <<: *defaults # merge alias
      image: nginx:alpine

    api:
      <<: *defaults # reuse without duplication
      image: myapp:latest
  ```

- Document anchors with a comment explaining their purpose. Give anchors
  descriptive names prefixed with `_` (e.g., `&_base_job`, `&_common_env`).

## 7. Best Practices

- **File extensions**: use `.yml` for GitHub Actions workflows and
  Ansible playbooks (community convention). Use `.yaml` elsewhere.
  Pick one per project and apply it consistently.
- **Schema validation**: use JSON Schema or schema stores to validate YAML
  files in your editor (e.g., VS Code YAML extension with `yaml.schemas`
  in `.vscode/settings.json`):

  ```json
  {
    "yaml.schemas": {
      "https://json.schemastore.org/github-workflow.json": ".github/workflows/*.yml"
    }
  }
  ```

- **Sorting keys**: do not sort keys alphabetically in data-heavy configs
  (it obscures logical groupings). Instead, group related keys together
  and document the grouping with a comment.
- **Sensitive values**: never hardcode secrets, tokens, or passwords in YAML
  files committed to version control. Reference environment variables or secret
  managers:

  ```yaml
  # ❌ Hardcoded secret
  password: "my-super-secret"

  # ✅ Reference from environment or Vault
  password: "${DB_PASSWORD}"
  ```
