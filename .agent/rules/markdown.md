# Markdown Writing Guidelines

> Objective: Define standards for writing clean, consistent, and accessible Markdown documents that pass markdownlint validation.

## 1. Document Structure

- Every Markdown document MUST start with a single **level-1 heading (`# Title`)** as the first non-empty line. Do not use front matter as a substitute for a title.
- Use **only one `#` heading per document**. All subsequent headings use `##`, `###` etc. in a strict hierarchy — never skip levels (e.g., do not jump from `##` to `####`).
- Separate every block element (headings, paragraphs, code blocks, lists, blockquotes, tables) with a **single blank line above and below**.
- Do not use trailing whitespace. Configure your editor to strip trailing spaces on save.
- End every file with exactly **one trailing newline**. Not zero, not two.

## 2. markdownlint Compliance

- Commit a `.markdownlint.json` (or `.markdownlint.yaml`) at the repository root to enforce consistent rules across all contributors:

  ```json
  {
    "default": true,
    "MD013": { "line_length": 120 },
    "MD033": false,
    "MD041": true
  }
  ```

- Run **`markdownlint-cli2`** in CI on all `**/*.md` files: `markdownlint-cli2 "**/*.md" "#node_modules"`.
- Common rules to always keep enabled:
  - **MD001**: Heading levels increment by one only.
  - **MD041**: First line must be a top-level heading.
  - **MD009**: No trailing spaces.
  - **MD010**: No hard tab characters (use spaces).
  - **MD012**: No multiple consecutive blank lines.
  - **MD022**: Headings surrounded by blank lines.
  - **MD031**: Fenced code blocks surrounded by blank lines.
  - **MD032**: Lists surrounded by blank lines.

## 3. Formatting & Style

- Use **ATX-style headings** (`# Heading`) not Setext-style (underline with `=` or `-`) for consistency. ATX-style works at all levels.
- Headings MUST NOT contain emojis or decorative symbols. Use plain text only to ensure compatibility with TOC generators, `markdownlint`, and accessibility tools.
- Use **fenced code blocks** (triple backticks) with an explicit language identifier for all code samples: ` ```python `, ` ```bash `, ` ```json `. Never use indented code blocks (4-space indent).
- Use **asterisks** (`*`) for unordered lists and `1.` for ordered lists (with auto-increment — all items can use `1.`). Be consistent within a list.
- Use `**bold**` for important terms and `*italic*` for emphasis. Avoid overusing both.
- Use `> blockquote` for callouts, notes, or quoted content. Prefer GitHub-style alerts (`> [!NOTE]`) where supported.

## 4. Links & Images

- Use **descriptive link text** that explains the destination: `[view the contributing guide](CONTRIBUTING.md)` not `[click here](CONTRIBUTING.md)`.
- Prefer **relative links** for internal documents within the repository. Use absolute HTTPS URLs for external resources.
- All images MUST have a descriptive **alt text**: `![Screenshot of the login screen](docs/images/login.png)`.
- Use **reference-style links** for URLs that appear multiple times in a document to reduce duplication.
- Validate all links in CI using **`lychee`** or **`markdown-link-check`** to catch broken URLs.

## 5. Accessibility & Maintainability

- Write in **plain, clear language** — minimize jargon and acronyms. Define domain-specific terms on first use.
- Table cells MUST have a **header row** and use alignment pipes consistently:

  ```markdown
  | Column A | Column B |
  | :------- | -------: |
  | left     |    right |
  ```

- Avoid embedding raw HTML (`<div>`, `<span>`, `<br>`) in Markdown unless the rendering target explicitly requires it. Standard Markdown elements are more portable.
- Keep individual `.md` files **focused on a single topic**. Split large documents into separate files with clear cross-links.
- For long documents, add a **Table of Contents** at the top using anchor links or a tool like `markdown-toc`.
