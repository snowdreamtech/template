# Shell Scripting Guidelines

> Objective: Define standards for writing robust, portable, and safe shell scripts.

## 1. Safety Flags & Script Header

- Always begin non-trivial scripts with `set -euo pipefail`:
  - `-e`: Exit immediately on any command error.
  - `-u`: Treat unset variables as errors (prevents typo-silent bugs).
  - `-o pipefail`: Propagate errors through pipelines, not just the last command.
- Use `trap` for cleanup and signal handling:

  ```sh
  trap 'cleanup' EXIT
  trap 'echo "Interrupted"; exit 130' INT TERM
  ```

- Use the portable shebang: `#!/usr/bin/env bash` (prefers the user's `bash`) for Bash scripts. Use `#!/bin/sh` only when POSIX portability is strictly required.

## 2. Variables & Quoting

- Always double-quote variable expansions: `"$variable"` and `"$(command)"`. Unquoted variables are subject to word-splitting and pathname expansion.
- Use `${VAR:-default}` for default values, `${VAR:?Error: VAR is required}` to enforce required variables, and `${VAR:+value}` for conditional substitution.
- Use `local` for all variables inside functions to prevent polluting the global scope.
- Declare constants with `readonly`: `readonly MAX_RETRIES=3`.
- Use `UPPER_SNAKE_CASE` for environment/exported variables and `lower_snake_case` for local variables.

## 3. Functions & Structure

- Define reusable logic as **named functions**. Keep the main script body minimal — just call functions.
- Use `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"` to reliably determine the script's directory.
- Write a `usage()` function and call it with `exit 1` when invalid arguments are passed.
- Group related functions together with section comments. Each function should have a brief comment describing its purpose.
- For scripts over 100 lines, consider splitting into modular files sourced by a main entry point.

## 4. Portability & Best Practices

- Test for tool availability with `command -v tool &>/dev/null || { echo "ERROR: tool not found"; exit 1; }` instead of `which`.
- Avoid bash-only syntax if the script must run on `/bin/sh` (e.g., in Alpine containers or minimal CI images). When POSIX portability is strictly required, use `#!/bin/sh` as the shebang (not `#!/usr/bin/env bash`).
- **Prohibited Bash-isms in POSIX sh scripts**:
  - `[[ ]]` double-bracket tests → use `[ ]` single brackets
  - `${BASH_SOURCE[0]}` → use `$0`; for script directory: `SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)`
  - `${var:offset:length}` substring expansion → use `cut` or `sed`
  - `${var,,}` / `${var^^}` case conversion → use `tr` or `awk`
  - `&>>` redirect operator → use `>> file 2>&1`
  - Arrays → use space-separated strings or multiple variables
  - `function` keyword → use `func_name() { }` syntax
  - `==` in `[ ]` tests → use `=` for string comparison
  - `source` command → use `.` (dot) for sourcing
- **Cross-platform considerations**: Test scripts with `/bin/sh` (not just `bash`) before committing. Avoid GNU-specific flags in utilities (e.g., `grep -P`, `sed -r` → use portable alternatives). Use `command -v` instead of `which`.
- **Execution Mode Guard**: Scripts MUST detect their execution mode at the header:
  - **Tool scripts** (meant to be executed): MUST reject being `source`d to prevent accidental terminal exit.
  - **Environment scripts** (meant to be sourced, e.g., `setup_venv.sh`): MUST reject being executed directly.
- Use `mktemp` for temporary files and clean them up in the `EXIT` trap.
- Use `printf` instead of `echo` for formatted or escape-sequence output — `echo` behavior varies across implementations.
- Handle filenames with spaces and special characters: use `-- "$file"` to mark the end of options.

## 5. Error Handling & Tooling

- Print error messages to stderr: `echo "ERROR: ${FUNCNAME[0]}: message" >&2`.
- Use meaningful exit codes: `0` for success, `1` for general error, `2` for misuse of shell command, `126` for permission denied, `127` for command not found.
- Lint all shell scripts with **ShellCheck** in CI: `shellcheck --severity=warning script.sh`. Fix all warnings; document any necessary `# shellcheck disable=SCxxxx` exclusions.
- Use **shfmt** for automatic formatting: `shfmt -i 2 -ci -w script.sh`.
- For complex scripts, consider replacing shell with Python or Go for better testability, error handling, and cross-platform compatibility.
