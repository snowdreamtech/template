---
description: Initialize the project to prepare for subsequent development.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Initialize Environment**
   - Ensure the development environment supports the following tools and languages: `nodejs`, `python`.
   - Ensure the IDE installs recommended extensions and plugins based on the project configuration files.
   - Install linting tools required by `.pre-commit-config.yaml` and `.github/workflows/lint.yml`.

     **Cross-platform (pip3 + npm — works on macOS / Linux / Windows):**

     ```bash
     pip3 install yamllint ansible-lint
     npm install -g markdownlint-cli2 prettier editorconfig-checker
     ```

     **Platform-specific binary tools (`shellcheck`, `actionlint`, `hadolint`):**

     ```bash
     # macOS — Homebrew (preferred)
     brew install shellcheck actionlint hadolint

     # macOS — MacPorts (fallback if Homebrew is unavailable)
     port install shellcheck
     # actionlint / hadolint: download binaries from GitHub Releases (see below)

     # Linux (Debian/Ubuntu)
     apt-get install -y shellcheck
     # actionlint / hadolint: download binaries from GitHub Releases (see below)

     # Linux (RHEL/Fedora)
     dnf install -y ShellCheck
     # actionlint / hadolint: download binaries from GitHub Releases (see below)

     # Windows (Scoop)
     scoop install shellcheck actionlint hadolint

     # Windows (Winget)
     winget install koalaman.shellcheck rhysd.actionlint hadolint.hadolint
     ```

     **Binary downloads (actionlint / hadolint fallback for Linux & macOS):**

     ```bash
     # actionlint (official install script)
     bash <(curl -s https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
     mv actionlint /usr/local/bin/

     # hadolint
     HADOLINT_VER=$(curl -s https://api.github.com/repos/hadolint/hadolint/releases/latest | python3 -c "import sys,json;print(json.load(sys.stdin)['tag_name'])")
     OS=$(uname -s); ARCH=$(uname -m)
     curl -fL --retry 3 "https://github.com/hadolint/hadolint/releases/download/${HADOLINT_VER}/hadolint-${OS}-${ARCH}" -o /usr/local/bin/hadolint
     chmod +x /usr/local/bin/hadolint
     ```

   - Install and activate `pre-commit` hooks to enforce code quality checks before every commit:

     ```bash
     pip3 install pre-commit
     pre-commit install
     ```
