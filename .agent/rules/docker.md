# Docker Development Guidelines

> Objective: Define standards for building secure, minimal, and reproducible Docker images.

## 1. Dockerfile Best Practices

- **Multi-Stage Builds**: Always use multi-stage builds to separate build-time and runtime dependencies, minimizing the final image size.
- **Minimal Base Images**: Use minimal, official base images (e.g., `alpine`, `distroless`, `slim` variants). Pin to a specific version tag or digest — never use `latest` in production.
- **Layer Caching**: Order instructions from least to most frequently changed. Copy dependency manifests (`package.json`, `requirements.txt`) and install before copying source code.
- **Non-Root User**: Create and switch to a dedicated non-root user before the `CMD`/`ENTRYPOINT`.

## 2. Security

- **Secrets**: Never `COPY` secrets, credentials, or `.env` files into an image. Use build secrets (`--secret`) or inject at runtime.
- **Scan Images**: Run vulnerability scans (e.g., `docker scout`, Trivy, Snyk) on all images in CI before pushing.
- **`.dockerignore`**: Always maintain a `.dockerignore` file to exclude `.git`, `node_modules`, `.env`, and other unnecessary files from the build context.

## 3. Runtime Configuration

- Externalize all configuration via environment variables. Do not bake configuration into the image.
- Define a `HEALTHCHECK` instruction in every production Dockerfile.
- Use `CMD ["executable", "arg"]` (exec form) instead of `CMD "executable arg"` (shell form) to ensure signals are handled correctly.

## 4. Image Tagging

- Tag images with both a specific version (e.g., `myapp:1.2.3`) and a rolling tag (e.g., `myapp:latest`) in production pipelines.
- Include the Git commit SHA as an image label for traceability: `LABEL git-commit="$GIT_SHA"`.
