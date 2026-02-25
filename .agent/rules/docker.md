# Docker Development Guidelines

> Objective: Define standards for building secure, minimal, and reproducible Docker images, covering Dockerfile best practices, security hardening, runtime configuration, tagging, and CI/CD registry management.

## 1. Dockerfile Best Practices

### Multi-Stage Builds

- **Always use multi-stage builds** to separate build-time and runtime dependencies, minimizing the final image size and attack surface:

  ```dockerfile
  # Stage 1: Build
  FROM golang:1.22-alpine AS builder
  WORKDIR /app
  # Copy manifests first for better layer caching
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

  # Stage 2: Runtime — distroless or minimal
  FROM gcr.io/distroless/static-debian12:nonroot
  COPY --from=builder /app/server /server
  USER nonroot:nonroot
  ENTRYPOINT ["/server"]
  ```

### Base Image Strategy

- Use **minimal official base images** appropriate for each stack:
  - `gcr.io/distroless/static:nonroot` — Go, Rust binaries (zero OS packages)
  - `gcr.io/distroless/java21-debian12:nonroot` — Java (JRE only)
  - `python:3.12-slim` — Python (minimal Debian-based)
  - `node:20-alpine` — Node.js (Alpine-based)
  - `nginx:alpine` — Nginx web server
- Pin base images to a **specific digest** in production for reproducible, secure builds:
  ```dockerfile
  FROM golang:1.22-alpine@sha256:a6d2702e5641c27e76293b7c5e4059ffcam87d38df38fa27  # replace with real digest
  ```
  Never use `latest` — it changes silently and breaks reproducibility.

### Layer Caching Optimization

- Order `COPY` and `RUN` instructions from **least to most frequently changed**. Copy dependency manifests first, install dependencies, then copy source code:

  ```dockerfile
  # ✅ Correct order — source changes don't invalidate dep layer
  COPY package.json package-lock.json ./
  RUN npm ci --only=production
  COPY src/ ./src/

  # ❌ Wrong order — source changes invalidate npm ci layer
  COPY . .
  RUN npm ci --only=production
  ```

- Use `RUN --mount=type=cache` (BuildKit) to cache package manager directories between builds:
  ```dockerfile
  RUN --mount=type=cache,target=/root/.cache/go-build \
      CGO_ENABLED=0 go build -o server .
  ```
- Combine `RUN` instructions where they logically belong together to minimize layers; use `&&` and `\`:
  ```dockerfile
  RUN apt-get update \
      && apt-get install -y --no-install-recommends ca-certificates \
      && rm -rf /var/lib/apt/lists/*
  ```

### User & Working Directory

- Set an explicit `WORKDIR` — never run from `/` or an implicit directory:
  ```dockerfile
  WORKDIR /app
  ```
- Create and switch to a **non-root user** before `CMD`/`ENTRYPOINT`. Use a specific UID ≥ 1000:
  ```dockerfile
  RUN addgroup -S appgroup && adduser -S -G appgroup -u 1001 appuser
  USER appuser
  ```

## 2. Security Hardening

### Secrets Management

- **Never** `COPY` secrets, API keys, SSH keys, `.env` files, or any credential files into an image — they persist in image layers even if `RUN rm` removes them in a later layer.
- Use **BuildKit secrets** for build-time credentials (pip, npm, package registries):
  ```bash
  docker build --secret id=npmrc,src=$HOME/.npmrc .
  ```
  ```dockerfile
  RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install
  ```
- Pass runtime secrets via environment variables from a secrets manager (Vault, AWS Secrets Manager, K8s Secrets mounted as env vars) — not baked into the image.

### Vulnerability Scanning

- Run **Trivy** or **Docker Scout** on all images in CI before pushing:
  ```bash
  trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:$TAG
  docker scout cves myapp:$TAG
  ```
  Fail CI on `CRITICAL` CVEs. Define and document your SLA for `HIGH` CVEs.
- Subscribe to base image security advisories. Update base images regularly (monthly at minimum, immediately for critical CVEs).

### `.dockerignore`

- Always maintain a comprehensive `.dockerignore` to prevent sensitive files from entering the build context:
  ```gitignore
  .git
  .gitignore
  node_modules
  dist
  build
  .env
  .env.*
  *.log
  .DS_Store
  coverage/
  .idea/
  .vscode/
  ```
  A missing `.dockerignore` can accidentally include `.env` files containing secrets, slow down builds (massive `node_modules`), and leak sensitive configuration.

## 3. Runtime Configuration

- Externalize all configuration via **environment variables**. Never bake environment-specific configuration (database URLs, API endpoints) into the image. The same image artifact should deploy to dev, staging, and production.
- Use **`CMD ["executable", "arg"]`** (exec form) instead of shell form. Exec form ensures the process is PID 1 and receives Unix signals (SIGTERM for graceful shutdown) directly:

  ```dockerfile
  # ✅ Exec form — receives SIGTERM
  ENTRYPOINT ["/server"]
  CMD ["--port", "8080"]

  # ❌ Shell form — sh becomes PID 1, SIGTERM doesn't reach server
  CMD /server --port 8080
  ```

- Define a **`HEALTHCHECK`** instruction in every production Dockerfile. The container orchestrator uses this to determine readiness:
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/health/live || exit 1
  ```
- Use `ENTRYPOINT` for the container's primary command and `CMD` for default arguments — this allows callers to override arguments cleanly without changing the entrypoint.
- Set resource-related environment hints where applicable (e.g., `JAVA_OPTS` for JVM heap size, `GOMAXPROCS` for Go goroutine scheduling on CPU-limited containers).

## 4. Image Tagging, Labels & SBOM

- Tag images with **multiple meaningful tags** for traceability and rollback capability:

  ```bash
  IMAGE_TAG="${REGISTRY}/${APP}:${VERSION}"    # semver: myapp:1.2.3
  COMMIT_TAG="${REGISTRY}/${APP}:sha-${SHA}"   # git SHA: myapp:sha-abc1234
  BRANCH_TAG="${REGISTRY}/${APP}:${BRANCH}"    # branch: myapp:main

  docker build \
    -t "${IMAGE_TAG}" \
    -t "${COMMIT_TAG}" \
    -t "${BRANCH_TAG}" .
  ```

- Apply **OCI standard labels** for supply-chain traceability and tooling:
  ```dockerfile
  LABEL org.opencontainers.image.source="https://github.com/org/repo" \
        org.opencontainers.image.revision="${GIT_SHA}" \
        org.opencontainers.image.version="${VERSION}" \
        org.opencontainers.image.created="${BUILD_DATE}" \
        org.opencontainers.image.authors="team@example.com"
  ```
- Generate a **SBOM (Software Bill of Materials)** for every published image to satisfy supply-chain security and compliance requirements:
  ```bash
  syft myapp:${VERSION} -o cyclonedx-json > sbom.json
  # Or via Docker: docker sbom myapp:${VERSION}
  ```
- **Never use the `latest` tag** in production deployments. It obscures which version is running and makes rollbacks impossible.

## 5. Build Pipeline, Registry & Deployment

### BuildKit & Caching

- Enable **BuildKit** for all builds (`DOCKER_BUILDKIT=1`). It enables: parallel stage builds, `RUN --mount=type=cache`, `--secret` build secrets, better cache management, and provenance attestations.
- In CI, use **inline caching** to reuse previously pushed layers:
  ```bash
  # Build with inline cache
  docker build \
    --cache-from myapp:cache \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    -t myapp:${SHA} \
    -t myapp:cache .
  docker push myapp:cache
  ```
- Use **`docker buildx`** with `--platform linux/amd64,linux/arm64` for multi-architecture builds to support Apple Silicon development, ARM servers, and Raspberry Pi:
  ```bash
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --push \
    -t myapp:${VERSION} .
  ```

### Registry & Access Control

- Use a **dedicated access-controlled container registry**. Never push production images to Docker Hub public repositories:
  - **GitHub Container Registry (GHCR)**: integrated with GitHub Actions, free for public repos
  - **Amazon ECR**: integrated with AWS services, IAM-based access
  - **Google Artifact Registry**: multi-format (Docker, npm, Maven)
  - **Harbor**: self-hosted, vulnerability scanning included
- Implement **image signing** with Cosign (Sigstore) for supply-chain integrity verification:
  ```bash
  cosign sign --key cosign.key myapp:${SHA}
  # Verify at deployment:
  cosign verify --key cosign.pub myapp:${SHA}
  ```
- Set up **image retention policies** in the registry to automatically delete old, untagged images. Keep the N most recent tagged images per branch. This prevents registry storage costs from growing unbounded.
- Use **immutable tags** in the registry (enabled per-repository on ECR/GCR) — once a tag is pushed, it cannot be overwritten. This prevents accidental tag mutation and supply-chain attacks.
