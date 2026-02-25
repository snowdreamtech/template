# Markdown Writing Guidelines

> Objective: Define standards for writing clean, consistent, and accessible Markdown documents that pass markdownlint validation and conform to GitHub Flavored Markdown (GFM), covering structure, linting, formatting, links, and accessibility.

## 1. Document Structure

### Required Structure

- Every Markdown document MUST start with a single **level-1 heading (`# Title`)** as the first non-empty line. Do not use front matter YAML as a substitute for a human-readable title:

  ```markdown
  # My Document Title

  Brief description of what this document covers.

  ## Section One

  Content...
  ```

- Use **only one `#` heading per document**. All subsequent headings follow a strict descending hierarchy (`##` → `###` → `####`) — never skip levels:

  ```markdown
  # Document Title (only one per file)

  ## Section (two = second level)

  ### Subsection (three = third level)

  #### Detail Point (four = fourth level — use sparingly)
  ```

- Separate every block element (headings, paragraphs, code blocks, lists, blockquotes, tables) with a **single blank line above and below**:

  ````markdown
  ## Section Heading

  Paragraph text here.

  - List item 1
  - List item 2

  ```python
  code_block()
  ```
  ````

  Another paragraph.

  ```

  ```

- Do not use trailing whitespace. Configure your editor to trim trailing spaces on save.
- End every file with exactly **one trailing newline** (no empty line after last content, just a final `\n`).

### Front Matter (YAML)

- Use YAML front matter only when required by the rendering target (Jekyll, Hugo, Docusaurus). Place it before the `# Title` heading. Always include the title field in front matter for tools that need it:

  ```yaml
  ---
  title: My Document Title
  date: 2025-01-15
  description: Brief description for SEO and link previews
  ---
  # My Document Title
  ```

## 2. markdownlint Compliance

### Configuration

- Commit a **`.markdownlint.json`** at the repository root to enforce consistent rules across all contributors and CI:

  ```json
  {
    "default": true,
    "MD013": { "line_length": 120, "code_blocks": false, "tables": false },
    "MD033": { "allowed_elements": ["details", "summary", "kbd"] },
    "MD041": true,
    "MD025": true
  }
  ```

- Run **`markdownlint-cli2`** in CI on all Markdown files:

  ```bash
  markdownlint-cli2 "**/*.md" "#node_modules" "#.git" "#dist"
  ```

### Key Rules

- Always keep these rules enabled:
  - **MD001** — Heading levels must increment by one (no skipping)
  - **MD041** — First line must be a top-level heading (`# Title`)
  - **MD025** — Only one `#` heading per document
  - **MD009** — No trailing spaces
  - **MD010** — No hard tab characters (use 2 or 4 spaces)
  - **MD012** — No multiple consecutive blank lines
  - **MD022** — Headings must be surrounded by blank lines
  - **MD031** — Fenced code blocks must be surrounded by blank lines
  - **MD032** — Lists must be surrounded by blank lines
  - **MD047** — Files must end with a single newline character

## 3. Formatting & Style

### Headings & Emphasis

- Use **ATX-style headings** (`# Heading`) — never Setext-style (underlines with `===` or `---`). ATX works at all levels and is more consistent:

  ```markdown
  ✅ # Title
  ✅ ## Section

  ❌ Title # Setext — only works for h1/h2, inconsistent
  =====
  ❌ Section
  ------
  ```

- Headings MUST NOT contain emojis or decorative symbols — they break TOC generators, `markdownlint`, and accessibility tools. Use plain text only.
- Use `**bold**` for important terms on first introduction. Use `*italic*` for titles of works and technical emphasis. Avoid overusing both — if everything is bold, nothing is.

### Code Blocks

- Use **fenced code blocks** with an explicit language identifier for all code samples. Never use indented code blocks (4-space indent — confusing and fragile):

  ````markdown
  ```python
  def greet(name: str) -> str:
      return f"Hello, {name}"
  ```
  ````

  ```
  Supported language identifiers: `bash`, `sh`, `python`, `javascript`, `typescript`, `go`, `rust`, `sql`, `yaml`, `json`, `dockerfile`, `html`, `css`, `markdown`, `text`.
  ```

### Lists

- Use **asterisks** (`*`) or **hyphens** (`-`) consistently for unordered lists. Pick one per repository and configure markdownlint `MD004` to enforce it:

  ```markdown
  - First item
  - Second item
    - Nested item (indented 2 spaces)
  ```

- For ordered lists, use `1.` for every item — most renderers auto-increment, and it minimizes diff noise when items are reordered:

  ```markdown
  1. First step
  1. Second step (renderer shows "2.")
  1. Third step (renderer shows "3.")
  ```

- Use **blockquotes** (`>`) for callouts, notes, or important information. Use **GitHub-style alerts** where supported:

  ```markdown
  > [!NOTE]
  > Background information that provides context.

  > [!WARNING]
  > Potential issues or breaking changes that require attention.

  > [!CAUTION]
  > Destructive actions that could cause data loss.
  ```

## 4. Links & Images

### Link Design

- Use **descriptive link text** that explains the destination without needing to hover:

  ```markdown
  ✅ See the [contributing guide](CONTRIBUTING.md) for setup instructions.
  ✅ Read the [OpenTelemetry documentation](https://opentelemetry.io/docs/).

  ❌ Click [here](CONTRIBUTING.md) for setup.
  ❌ See [this link](https://opentelemetry.io/docs/).
  ```

- Use **relative links** for internal repository documents. Use absolute HTTPS URLs for external resources.
- Use **reference-style links** when the same URL appears multiple times in a document:

  ```markdown
  See [OpenTelemetry][otel] for instrumentation. The [OTel SDK][otel] supports all major languages.

  [otel]: https://opentelemetry.io
  ```

### Images

- Every image MUST include descriptive **alt text** — required for accessibility (screen readers) and shown when images fail to load:

  ```markdown
  ✅ ![Screenshot of the login page showing the email and password fields](docs/images/login.png)
  ❌ ![image](docs/images/login.png)
  ❌ ![][login] # missing alt text
  ```

- For images with detailed context, add a figure caption using a blockquote below the image:

  ```markdown
  ![Architecture diagram showing three services connected to a shared database](docs/arch.png)

  > _Figure 1: Application architecture overview_
  ```

- Validate all links in CI using **`lychee`** or **`markdown-link-check`** to catch broken URLs and dead references:

  ```bash
  lychee --timeout 10 --verbose "**/*.md"
  ```

## 5. Accessibility & Maintainability

### Writing Style

- Write in **plain, clear language** — minimize jargon and unexplained acronyms. Define domain-specific terms on first use.
- Use **active voice** and direct phrasing: "Run `npm install`" not "The `npm install` command should be run".
- Keep individual `.md` files **focused on a single topic**. Split large documents into separate files with clear cross-links rather than one megadocument.

### Tables

- Every table MUST have a **header row** with descriptive column names. Use alignment pipes consistently:

  ```markdown
  | Feature    | Supported | Notes          |
  | :--------- | :-------: | :------------- |
  | Basic auth |    ✅     | All versions   |
  | OAuth 2.0  |    ✅     | v2.0+ only     |
  | SAML SSO   |    ❌     | Not on roadmap |
  ```

- Avoid tables for information that reads better as a list — tables add visual noise when there is only one data column.

### Document Navigation

- For documents longer than 500 words, add a **Table of Contents** (TOC) using anchor links:

  ```markdown
  ## Table of Contents

  - [Section One](#section-one)
  - [Section Two](#section-two)
    - [Subsection](#subsection)
  ```

  Or generate automatically with `markdown-toc`, `doctoc`, or GitHub's built-in TOC button.

- Avoid embedding raw HTML (`<div>`, `<span>`, `<br>`) in Markdown unless the rendering target explicitly requires it. Standard Markdown is more portable across renderers (GitHub, GitLab, Notion, Docusaurus).
