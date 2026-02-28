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

     ````bash
     pip3 install yamllint ansible-lint sqlfluff
     npm install -g markdownlint-cli2 prettier editorconfig-checker cspell eslint @stoplight/spectral-cli @commitlint/cli @commitlint/config-conventional

     **Other Backend Ecosystems (.NET / Ruby / PHP):**
     _Note: `.NET` formatters are built-in (`dotnet format`)._

     ```bash
     gem install rubocop
     composer global require friendsofphp/php-cs-fixer
     ````

     **Platform-specific binary tools (`shellcheck`, `actionlint`, `hadolint`):**

     ```bash
     # macOS — Homebrew (preferred)
     brew install shellcheck actionlint hadolint shfmt gitleaks golangci-lint ruff swiftformat swiftlint clang-format ktlint google-java-format kube-linter tflint
     brew tap dart-lang/dart && brew install dart

     # macOS — MacPorts (fallback if Homebrew is unavailable)
     port install shellcheck shfmt
     # actionlint / hadolint: use binary download below

     # Linux (Debian/Ubuntu)
     apt-get install -y shellcheck shfmt
     # actionlint / hadolint: use binary download below

     # Linux (RHEL/Fedora)
     dnf install -y ShellCheck shfmt
     # actionlint / hadolint: use binary download below

     # Windows (Scoop)
     scoop install shellcheck actionlint hadolint shfmt gitleaks golangci-lint ruff dart swiftformat swiftlint clang-format ktlint google-java-format kube-linter tflint

     # Windows (Winget)
     winget install koalaman.shellcheck rhysd.actionlint hadolint.hadolint shfmt
     ```

     **Binary downloads (actionlint / hadolint — macOS & Linux fallback):**

     > `GITHUB_PROXY` is set to `https://gh-proxy.sn0wdr1am.com/` by default to ensure reliable downloads in restricted network environments.

     ```bash
     GITHUB_PROXY="${GITHUB_PROXY:-https://gh-proxy.sn0wdr1am.com/}"

     # actionlint
     ACTIONLINT_VER="v1.7.11"
     OS=$(uname -s | tr '[:upper:]' '[:lower:]'); ARCH=$(uname -m)
     curl -fL --retry 3 \
       "${GITHUB_PROXY}https://github.com/rhysd/actionlint/releases/download/${ACTIONLINT_VER}/actionlint_${ACTIONLINT_VER#v}_${OS}_${ARCH}.tar.gz" \
       | tar -xz -C ~/.local/bin actionlint

     # hadolint
     HADOLINT_VER="v2.12.0"
     ARCH=$(uname -m); if [ "$ARCH" = "arm64" ]; then HA="arm64"; else HA="x86_64"; fi
     curl -fL --retry 3 \
       "${GITHUB_PROXY}https://github.com/hadolint/hadolint/releases/download/${HADOLINT_VER}/hadolint-$(uname -s)-${HA}" \
       -o ~/.local/bin/hadolint && chmod +x ~/.local/bin/hadolint
     ```

     Ensure `~/.local/bin` is in your `PATH`:

     ```bash
     echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc  # or ~/.bashrc
     ```

   - Install and activate `pre-commit` hooks to enforce code quality checks before every commit:

     ```bash
     pip3 install pre-commit
     pre-commit install
     ```
