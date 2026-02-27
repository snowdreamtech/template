# YAML Writing Guidelines

> Objective: Define standards for writing clean, consistent, and valid YAML documents that pass yamllint validation, covering structure, linting, formatting, and best practices.

## 1. Document Structure

- Every YAML document MUST start with a document start marker (`---`) as the first line.
- Use multiple document markers (`---`) to separate multiple YAML documents within a single single file if needed.
- End every file with exactly **one trailing newline** (no trailing empty lines).

## 2. yamllint Compliance

### Configuration

- Run **`yamllint`** in CI on all YAML files to ensure consistency across the project:

  ```bash
  yamllint .
  ```

### Key Rules

- Always keep these rules in mind to avoid common yamllint warnings:
  - **document-start**: Always start files with `---`.
  - **line-length**: Keep lines within 80 characters limits. Use block scalars (`>`) to break long lines safely.
  - **truthy**: Always quote truthy-looking strings that are not meant to be booleans (e.g., `'yes'`, `'no'`, `'on'`, `'off'`). Especially important for GitHub Actions triggers like `'on'`.
  - **indentation**: Use 2 spaces for indentation.
  - **trailing-spaces**: Ensure there are no trailing whitespaces at the end of lines.
  - **empty-lines**: Avoid multiple consecutive empty lines.

## 3. Formatting & Style

### Indentation and Line Length

- Use **2 spaces** for indentation. Never use hard tabs.
- Strictly adhere to a maximum **line length of 80 characters** to ensure readability and maintainability.
- When dealing with long strings or descriptions, use the YAML folded block scalar (`>`) or literal block scalar (`|`) to wrap text across multiple lines. This avoids horizontal scrolling and satisfies line-length linters.

  ```yaml
  # ✅ Good: Uses folded scalar to keep lines under 80 characters
  description: >
    This is a very long description that spans multiple lines
    in the source code but will be parsed as a single string
    with spaces replacing the newlines.

  # ❌ Bad: Exceeds 80 characters
  description: "This is a very long description that spans multiple lines in the source code."
  ```

### Quotes and Strings

- YAML handles strings without quotes in most cases, but it's recommended to **quote strings that contain special characters**, colons followed by a space, or anything that could be misinterpreted as other YAML types.
- Always quote strings that look like booleans (`true`, `false`, `yes`, `no`, `on`, `off`) when you intend for them to be parsed as strings. This is a common pitfall in CI/CD pipeline definitions:

  ```yaml
  # ✅ Good: Quotes 'on' so it's parsed as a string key
  'on':
    push:
      branches:
        - main

  # ❌ Bad: 'on' unquoted is evaluated as boolean true by YAML 1.1 spec
  on:
    push:
      branches:
        - main
  ```

## 4. Best Practices

- Standardize file extensions. Prefer `.yml` for GitHub workflows and Ansible playbooks, or stick consistently to `.yaml` depending on the project's pre-existing conventions.
- Make extensive use of anchors (`&`) and aliases (`*`) to keep DRY (Don't Repeat Yourself) when defining repeated dictionary block objects.
