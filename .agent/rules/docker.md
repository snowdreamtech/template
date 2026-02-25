# Docker Development Guidelines

> Objective: Define standards for building secure, minimal, and reproducible Docker images.

## 1. Dockerfile Best Practices

- **Multi-Stage Builds**: Always use multi-stage builds to separate build-time and runtime dependencies, minimizing the final image size:

  ```dockerfile
  FROM golang:1.22-alpine AS builder
  WORKDIR /app
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 go build -o server .

  FROM gcr.io/distroless/static:nonroot
  COPY --from=builder /app/server /
  ENTRYPOINT ["/server"]
  ```

- **Minimal Base Images**: Use minimal, official base images (`alpine`, `distroless`, `slim` variants). Pin to a specific SHA digest in production: `FROM golang:1.22-alpine@sha256:<digest>`. Never use `latest`.
- **Layer Caching**: Order instructions from least to most frequently changed. Copy dependency manifests (`package.json`, `go.mod`, `requirements.txt`) and install before copying source code.
- **Non-Root User**: Create and switch to a dedicated non-root user (UID ≥ 1000) before `CMD`/`ENTRYPOINT`. Use `USER $UID:$GID` form.

## 2. Security

- **Secrets**: Never `COPY` secrets, credentials, SSH keys, or `.env` files into an image. Use BuildKit secrets (`--secret`) for build-time secrets.
- **Scan Images**: Run vulnerability scans (**Trivy**, `docker scout`, Snyk) on all images in CI before pushing. Fail CI on `CRITICAL` or `HIGH` CVEs beyond the SLA threshold.
- **`.dockerignore`**: Always maintain a `.dockerignore` to exclude `.git`, `node_modules`, `.env`, `dist`, and IDE files from the build context. A missing `.dockerignore` can leak sensitive files.
- **Read-only filesystem**: Set `readOnlyRootFilesystem: true` in the Kubernetes/Compose `securityContext`. Mount writable volumes only where explicitly required.
- **Drop capabilities**: Use `--cap-drop=ALL` and add back only the specific Linux capabilities your process requires (e.g., `--cap-add=NET_BIND_SERVICE`).

## 3. Runtime Configuration

- Externalize all configuration via environment variables. Do not bake environment-specific configuration into the image.
- Define a **`HEALTHCHECK`** instruction in every production Dockerfile: `HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:8080/health || exit 1`.
- Use **`CMD ["executable", "arg"]`** (exec form) instead of shell form. This ensures the process receives signals (SIGTERM) correctly for graceful shutdown.
- Set `WORKDIR` explicitly. Avoid running commands from `/` or a default directory.
- Use **`ENTRYPOINT`** for the container's main command and **`CMD`** for default arguments — making it easy to override arguments at runtime.

## 4. Image Tagging & Metadata

- Tag images with a specific **semantic version** (e.g., `myapp:1.2.3`) and the Git SHA (e.g., `myapp:sha-abc1234`) for traceability. Never rely on `latest` in production.
- Use **`LABEL`** instructions for OCI standard traceability metadata:

  ```dockerfile
  LABEL org.opencontainers.image.revision="$GIT_SHA" \
        org.opencontainers.image.source="https://github.com/org/repo" \
        org.opencontainers.image.version="$VERSION"
  ```

- Generate a **SBOM** (Software Bill of Materials) for every published image using `docker sbom` or Syft to satisfy supply-chain security requirements.

## 5. Build & Registry

- Use **BuildKit** (`DOCKER_BUILDKIT=1`) for all builds. It enables parallel stage builds, better caching, and `--secret` support.
- Use **`--cache-from`** and `--build-arg BUILDKIT_INLINE_CACHE=1` to push and reuse cache layers in CI for faster builds.
- Prefer **multi-arch builds** (`docker buildx build --platform linux/amd64,linux/arm64`) for images consumed on Apple Silicon or ARM servers.
- Use a dedicated, access-controlled container registry (GHCR, ECR, GCR, Harbor). Never push production images to Docker Hub public repositories.
