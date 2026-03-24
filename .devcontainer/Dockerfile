# --- Base Image Configuration ---
# [Recommended] Microsoft's official devcontainer base image, optimized for VS Code.
# If you need to use a custom or internal enterprise image, replace the FROM line below.
# hadolint ignore=DL3026
FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Use pipefail for safer shell operations
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install system dependencies, Node tools, Python tools, and binary tools in consolidated layers
# hadolint ignore=DL3008,DL3016,DL3013,DL4006
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl git make python3 python3-pip python3-venv nodejs npm golang-go \
    shellcheck hadolint shfmt gitleaks ruff clang-format openjdk-17-jre-headless unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && corepack enable \
    && make setup \
    && curl -fLsS https://raw.githubusercontent.com/dotenv-linter/dotenv-linter/master/install.sh | sh -s -- -b /usr/local/bin \
    && curl -fLsS https://raw.githubusercontent.com/golangci/golangci-lint/HEAD/install.sh | sh -s -- -b /usr/local/bin \
    && curl -fLsS https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash \
    && curl -fLsS https://github.com/stackrox/kube-linter/releases/latest/download/kube-linter-linux.tar.gz | tar -xz -C /usr/local/bin kube-linter \
    && GO_CHECKMAKE_URL=$(curl -sSf https://api.github.com/repos/checkmake/checkmake/releases/latest | grep 'browser_download_url.*linux.*amd64' | head -1 | cut -d'"' -f4) \
    && curl -fLsS "$GO_CHECKMAKE_URL" -o /usr/local/bin/checkmake && chmod +x /usr/local/bin/checkmake \
    && curl -fLsS -o /usr/local/bin/ktlint https://github.com/pinterest/ktlint/releases/latest/download/ktlint && chmod +x /usr/local/bin/ktlint \
    && TERRAFORM_VERSION=$(curl -sSf https://api.github.com/repos/hashicorp/terraform/releases/latest | grep '"tag_name":' | sed -E 's/.*"v([^"]+)".*/\1/') \
    && curl -fLsS "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -o terraform.zip \
    && unzip terraform.zip && mv terraform /usr/local/bin/ && rm terraform.zip

# Set up user environment
USER vscode
WORKDIR /workspace
