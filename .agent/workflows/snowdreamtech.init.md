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
     pip3 install yamllint ansible-core ansible-lint sqlfluff semgrep
     npm install -g markdownlint-cli2 prettier editorconfig-checker cspell eslint @stoplight/spectral-cli @commitlint/cli @commitlint/config-conventional stylelint stylelint-config-standard @taplo/cli
     ```

     **Other Backend Ecosystems (.NET / Ruby / PHP):**
     _Note: `.NET` formatters are built-in (`dotnet format`)._

     ```bash
     gem install rubocop
     composer global require friendsofphp/php-cs-fixer
     ```

     **Platform-specific binary tools (`shellcheck`, `actionlint`, `hadolint`):**

     ```bash
     # macOS — Homebrew (preferred)
     brew install shellcheck actionlint hadolint shfmt gitleaks golangci-lint ruff swiftformat swiftlint clang-format ktlint google-java-format kube-linter tflint lychee trivy checkmake
     brew install --cask powershell
     brew tap dart-lang/dart && brew install dart

     # macOS — MacPorts (fallback if Homebrew is unavailable)
     port install shellcheck actionlint hadolint shfmt gitleaks ruff swiftformat swiftlint ktlint tflint lychee trivy checkmake
     # powershell: download pkg from GitHub / actionlint / hadolint: binary download below

     # Linux (Debian/Ubuntu)
     apt-get install -y shellcheck shfmt trivy powershell
     # actionlint / hadolint: use binary download below

     # Linux (RHEL/Fedora)
     dnf install -y ShellCheck shfmt trivy powershell
     # actionlint / hadolint: use binary download below

     # Windows (Scoop)
     scoop install shellcheck actionlint hadolint shfmt gitleaks golangci-lint ruff dart swiftformat swiftlint clang-format ktlint google-java-format kube-linter tflint lychee trivy checkmake pwsh

     # Windows (Winget)
     winget install koalaman.shellcheck rhysd.actionlint hadolint.hadolint shfmt aquasecurity.trivy Microsoft.PowerShell
     ```

     **Binary downloads (actionlint / hadolint / checkmake / lychee / gitleaks / golangci-lint — macOS & Linux fallback):**

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

     # checkmake
     CHECKMAKE_VER="v0.3.2"
     OS=$(uname -s | tr '[:upper:]' '[:lower:]'); ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ]; then CA="amd64"; elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then CA="arm64"; else CA=$ARCH; fi
     curl -fL --retry 3 \
       "${GITHUB_PROXY}https://github.com/checkmake/checkmake/releases/download/${CHECKMAKE_VER}/checkmake-${CHECKMAKE_VER}.${OS}.${CA}" \
       -o ~/.local/bin/checkmake && chmod +x ~/.local/bin/checkmake

     # lychee
     LYCHEE_VER="v0.18.0"
     OS=$(uname -s | tr '[:upper:]' '[:lower:]'); ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ]; then LA="x86_64"; elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then LA="aarch64"; else LA=$ARCH; fi
     if [ "$OS" = "darwin" ]; then LL="apple-darwin"; else LL="unknown-linux-gnu"; fi
     curl -fL --retry 3 \
       "${GITHUB_PROXY}https://github.com/lycheeverse/lychee/releases/download/${LYCHEE_VER}/lychee-${LYCHEE_VER}-${LA}-${LL}.tar.gz" \
       | tar -xz -C ~/.local/bin lychee

     # gitleaks
     GITLEAKS_VER="v8.21.2"
     OS=$(uname -s | tr '[:upper:]' '[:lower:]'); ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then GA="x64"; elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then GA="arm64"; elif [ "$ARCH" = "i386" ] || [ "$ARCH" = "i686" ]; then GA="x32"; else GA=$ARCH; fi
     if [ "$OS" = "darwin" ]; then GL="darwin"; else GL="linux"; fi
     curl -fL --retry 3 \
       "${GITHUB_PROXY}https://github.com/gitleaks/gitleaks/releases/download/${GITLEAKS_VER}/gitleaks_${GITLEAKS_VER#v}_${GL}_${GA}.tar.gz" \
       | tar -xz -C ~/.local/bin gitleaks

     # golangci-lint
     GOLANGCI_VER="v1.61.0"
     OS=$(uname -s | tr '[:upper:]' '[:lower:]'); ARCH=$(uname -m); if [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then GOA="amd64"; elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then GOA="arm64"; else GOA=$ARCH; fi
     curl -fL --retry 3 \
       "${GITHUB_PROXY}https://github.com/golangci/golangci-lint/releases/download/${GOLANGCI_VER}/golangci-lint-${GOLANGCI_VER#v}-${OS}-${GOA}.tar.gz" \
       | tar -xz -C ~/.local/bin --strip-components=1 "golangci-lint-${GOLANGCI_VER#v}-${OS}-${GOA}/golangci-lint"
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

   - Install PowerShell `PSScriptAnalyzer` module for local linting:

     ```bash
     pwsh -NoProfile -Command "Set-PSRepository PSGallery -InstallationPolicy Trusted; Install-Module -Name PSScriptAnalyzer -Force -ErrorAction Stop"
     ```

     ```

     ```
