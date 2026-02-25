# Shell Scripting Guidelines

> Objective: Define standards for writing robust, portable, and safe shell scripts for automation, CI/CD pipelines, and developer tooling, covering safety flags, variables, portability, error handling, and cross-platform compatibility.

## 1. Safety Flags & Script Header

### Mandatory Header

- Always begin non-trivial scripts with **`set -euo pipefail`**:

  ```bash
  #!/usr/bin/env bash
  # Description: What this script does
  # Usage:       ./script.sh [options]

  set -euo pipefail
  IFS=$'\n\t'   # safer word splitting — only newline and tab, not space
  ```

  - `-e` (`errexit`): Exit immediately when any command returns a non-zero exit code
  - `-u` (`nounset`): Treat unset variables as errors — prevents silent bugs from typos
  - `-o pipefail`: Propagate errors through pipelines (`cmd1 | cmd2` fails if `cmd1` fails, even if `cmd2` succeeds)
  - `IFS=$'\n\t'`: Prevent word-splitting on spaces in `for` loops and command substitution

### Shebang Selection

- **`#!/usr/bin/env bash`** — for Bash scripts (uses the user's `bash`, better for cross-machine compatibility)
- **`#!/bin/sh`** — ONLY when strict POSIX portability is required (Alpine containers, embedded systems, minimal CI)
- **Never use `#!/bin/bash`** on macOS — it invokes the system-bundled Bash 3.x which is outdated (due to GPL3 licensing)

### Trap & Cleanup

- Use **`trap`** for cleanup on exit and for signal handling:

  ```bash
  # Create temp file + auto-cleanup
  TMPFILE=$(mktemp)
  trap 'rm -f "$TMPFILE"' EXIT
  trap 'echo "ERROR: Script interrupted" >&2; exit 130' INT TERM

  # Function-based cleanup for complex cleanup logic
  cleanup() {
    local exit_code=$?
    rm -rf "$WORK_DIR"
    if [[ $exit_code -ne 0 ]]; then
      log_error "Script failed with exit code $exit_code"
    fi
  }
  trap cleanup EXIT
  ```

### Execution Mode Guard

- Scripts MUST detect their execution mode at the header:

  ```bash
  # For tool scripts (execute-only) — reject being sourced
  if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    echo "ERROR: This script must be executed, not sourced." >&2
    return 1
  fi

  # For environment scripts (source-only, e.g., load_env.sh) — reject being executed
  if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "ERROR: This script must be sourced, not executed. Run: . ${BASH_SOURCE[0]}" >&2
    exit 1
  fi
  ```

## 2. Variables & Quoting

### Quoting Rules

- Always **double-quote variable expansions** and command substitutions. Unquoted expansions are subject to word-splitting and pathname expansion:

  ```bash
  # ❌ Unquoted — breaks on spaces, globbing
  cp $source_file $dest_dir
  for file in $(ls $dir); do ...

  # ✅ Quoted — safe with spaces and special characters
  cp "$source_file" "$dest_dir"
  while IFS= read -r file; do ...
  done < <(find "$dir" -type f)
  ```

### Variable Patterns

- Use parameter expansion for safe defaults and required variables:

  ```bash
  # Default value if unset or empty
  LOG_LEVEL="${LOG_LEVEL:-info}"

  # Fail immediately with message if required variable is unset or empty
  : "${DATABASE_URL:?ERROR: DATABASE_URL is required}"
  : "${AWS_REGION:?ERROR: AWS_REGION is required}"

  # Conditional use — expand only if set
  EXTRA_ARGS="${VERBOSE:+--verbose}"
  ```

- Use **`local`** for all variables inside functions to prevent polluting the global scope:
  ```bash
  install_dependency() {
    local package="${1:?Package name required}"
    local version="${2:-latest}"
    local install_path="${INSTALL_DIR}/packages/${package}"
    ...
  }
  ```
- Declare constants with **`readonly`**: `readonly MAX_RETRIES=3 TIMEOUT=30`
- Use **`UPPER_SNAKE_CASE`** for exported/environment variables and `lower_snake_case` for local function variables.

## 3. Functions & Structure

### Script Organization

- Define reusable logic as **named functions**. Keep the main script body minimal — just call functions:

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  readonly SCRIPT_DIR

  # --- Functions ---
  usage() {
    cat <<-EOF
    Usage: $(basename "$0") [OPTIONS] <argument>

    Options:
      -h, --help     Show this help
      -v, --verbose  Enable verbose output
    EOF
    exit "${1:-0}"
  }

  log_info()  { printf '[INFO]  %s\n' "$*" >&1; }
  log_warn()  { printf '[WARN]  %s\n' "$*" >&2; }
  log_error() { printf '[ERROR] %s\n' "$*" >&2; }

  parse_args() {
    while [[ $# -gt 0 ]]; do
      case "$1" in
        -h|--help)    usage ;;
        -v|--verbose) set -x; shift ;;
        --)           shift; break ;;
        -*)           log_error "Unknown option: $1"; usage 1 ;;
        *)            POSITIONAL_ARGS+=("$1"); shift ;;
      esac
    done
  }

  main() {
    parse_args "$@"
    run_install
    verify_installation
  }

  # --- Entry point ---
  main "$@"
  ```

- Use `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"` to reliably determine the script's directory regardless of how it was invoked.
- Write a `usage()` function and call it with `exit 1` when invalid arguments are provided.

## 4. Portability & Best Practices

### POSIX vs Bash

- When targeting `/bin/sh` (Alpine containers, minimal CI images), avoid Bash-specific syntax:
  | Bash-only | POSIX sh alternative |
  |-----------|---------------------|
  | `[[ expr ]]` | `[ expr ]` with careful quoting |
  | `${BASH_SOURCE[0]}` | `$0` (less reliable) |
  | `${var,,}` lowercase | `echo "$var" \| tr '[:upper:]' '[:lower:]'` |
  | `${var^^}` uppercase | `echo "$var" \| tr '[:lower:]' '[:upper:]'` |
  | Arrays: `arr=(a b c)` | Space-separated variables or multiple vars |
  | `function foo() {}` | `foo() {}` (no `function` keyword) |
  | `&>>` redirect | `>> file 2>&1` |
  | `source` | `. file` (dot) |
  | `==` in `[ ]` | `=` for string comparison |

### Cross-Platform Patterns

- Test for tool availability with `command -v` — not `which`:

  ```bash
  # ❌ which varies by OS — returns different exit codes, paths, or errors
  which docker

  # ✅ Portable and reliable
  command -v docker &>/dev/null || { log_error "docker is required but not installed"; exit 1; }
  ```

- Avoid GNU-specific flags for cross-platform portability:

  ```bash
  # ❌ GNU grep only
  grep -P '\d+' file.txt      # Perl regex
  sed -i '' 's/old/new/' file # macOS requires '' after -i; Linux doesn't

  # ✅ Portable
  grep -E '[0-9]+' file.txt   # ERE — supported everywhere
  # Use perl for in-place edit portably:
  perl -pi -e 's/old/new/g' file
  ```

- Use **`mktemp`** for temporary files and always clean up in `EXIT` trap:
  ```bash
  TMPFILE=$(mktemp /tmp/myscript.XXXXXX)
  TMPDIR=$(mktemp -d /tmp/myscript-dir.XXXXXX)
  trap 'rm -rf "$TMPFILE" "$TMPDIR"' EXIT
  ```
- Use **`printf`** instead of `echo` for formatted output — `echo` behavior for `-n`, `-e`, and backslashes varies across implementations:
  ```bash
  printf '%s\n' "$message"           # safe, portable
  printf 'File: %s, Size: %d\n' "$f" "$size"  # formatted output
  ```

## 5. Error Handling & Tooling

### Error Patterns

- Print error messages to **stderr** with function context:
  ```bash
  log_error() {
    local func="${FUNCNAME[1]:-main}"
    printf '[ERROR] [%s] %s\n' "$func" "$*" >&2
  }
  ```
- Use meaningful exit codes:
  - `0` — success
  - `1` — general error
  - `2` — misuse of shell command (invalid arguments)
  - `126` — command found but not executable (permission denied)
  - `127` — command not found
  - `128+n` — fatal error signal `n` (e.g., `130` = Ctrl+C, `137` = SIGKILL)

### CI & Tooling

- Lint all shell scripts with **ShellCheck** in CI — catches common mistakes, portability issues, and quoting bugs:
  ```bash
  # CI step
  find . -name "*.sh" -not -path "*/node_modules/*" -exec shellcheck --severity=warning {} +
  ```
  Document any necessary `# shellcheck disable=SC2034` exclusions with a reason.
- Format with **shfmt** for consistent, automated formatting:
  ```bash
  shfmt -i 2 -ci -bn -w **/*.sh   # 2-space indent, indent case blocks, binary ops on newlines
  ```
- For complex scripts requiring real testing, use **BATS** (Bash Automated Testing System):
  ```bash
  @test "install_dependency fails on empty package name" {
    run install_dependency ""
    [ "$status" -eq 1 ]
    [[ "$output" == *"Package name required"* ]]
  }
  ```
- **Know when to stop writing shell**. When a script exceeds ~200 lines, consider replacing it with Python (`argparse`, `subprocess`, `pathlib`) or Go for better testability, error handling, and cross-platform compatibility.
