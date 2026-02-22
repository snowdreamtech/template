# Deployment & Docker Guidelines

> Objective: Standardize containerization, infrastructure as code, and deployment practices.

## 1. Containerization (Docker)

- **Multi-Stage Builds**: Always use multi-stage Docker builds to keep the final production image size minimal and free of build-time dependencies.
- **Base Images**: Use official, minimal base images (e.g., `alpine`, `distroless`, `slim`). Pin base images to specific tags or SHAs; avoid using `latest` in production.
- **Non-Root Execution**: Containers MUST NOT run as the root user. Define and switch to a dedicated non-root `USER` before the `CMD` or `ENTRYPOINT`.

## 2. Configuration & Secrets

- **Environment Variables**: Inject configuration via environment variables at runtime. Do not bake configuration into the Docker image.
- **Secret Management**: Never mount secrets as plaintext files or environment variables if avoidable. Rely on native orchestrator secret management (e.g., Kubernetes Secrets, Docker Swarm Secrets) or external vaults.

## 3. Deployment Flow

- **Immutability**: Treat deployments as immutable. Do not modify running containers or SSH into production servers to make manual changes; update the code, rebuild the image, and trigger a new deployment.
- **Health Checks**: Always configure `HEALTHCHECK` instructions in the Dockerfile, and define liveness/readiness probes in orchestrator manifests.

## 4. Infrastructure as Code (IaC)

- **Declarative Infrastructure**: Manage infrastructure (e.g., Terraform, Ansible, Kubernetes manifests) in version control alongside the application code or in a dedicated IaC repository.
- **State Management**: Use remote, locked state backends for IaC tools to prevent concurrent modification and state corruption.
