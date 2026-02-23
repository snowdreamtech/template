# Shell Scripting Guidelines

> Objective: Define standards for writing robust, portable, and safe shell scripts.

## 1. Safety Flags

- Always begin non-trivial scripts with `set -euo pipefail`:
  - `-e`: Exit immediately on error.
  - `-u`: Treat unset variables as errors.
  - `-o pipefail`: Catch errors in pipelines.
- Trap signals for cleanup: `trap 'cleanup' EXIT INT TERM`.

## 2. Variables & Quoting

- Always double-quote variable expansions: `"$variable"` and `"$(command)"`. Unquoted variables are subject to word-splitting and globbing.
- Use `${VAR:-default}` for default values and `${VAR:?error message}` to enforce required variables.
- Use `local` for all variables inside functions to avoid polluting the global scope.

## 3. Functions & Structure

- Define reusable logic as functions. Keep the main script body minimal.
- Use `SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"` to reliably find the script's directory.
- Group related functions together and add a brief comment above each function.

## 4. Portability

- Target `#!/usr/bin/env bash` for portability over `#!/bin/bash`.
- Avoid bash-only syntax if the script must run on `/bin/sh` (e.g., in Alpine containers).
- Use `command -v tool` to check for tool availability instead of `which`.

## 5. Error Handling & Output

- Print error messages to stderr: `echo "ERROR: message" >&2`.
- Use meaningful exit codes: `exit 0` for success, `exit 1` for general errors.
- Lint all shell scripts with **ShellCheck** in CI (`shellcheck script.sh`).
