# Deployment & Infrastructure Guidelines

> Objective: Standardize containerization, infrastructure as code, deployment pipelines, and operational practices.

## 1. Containerization (Docker)

- **Multi-Stage Builds**: Always use multi-stage Docker builds to keep the final production image minimal and free of build-time dependencies (compilers, SDK headers, dev tools).
- **Base Images**: Use official, minimal base images (`alpine`, `distroless`, `slim`). Pin base images to a specific tag or SHA digest; never use `latest` in production.
- **Non-Root Execution**: Containers MUST NOT run as root. Create and switch to a dedicated non-root `USER` before `CMD`/`ENTRYPOINT`.
- **`.dockerignore`**: Always maintain a `.dockerignore` to exclude `.git`, `node_modules`, `.env`, and test files from the build context.

## 2. Configuration & Secrets

- **Environment Variables**: Inject all runtime configuration via environment variables. Do not bake configuration into the image.
- **Secret Management**: Never mount secrets as plaintext files or embed them in images. Use native orchestrator secret management (Kubernetes Secrets, Docker Swarm Secrets, Vault) or external secret managers (AWS Secrets Manager, Azure Key Vault).
- Provide a `.env.example` with all required environment variable names and placeholder values. Never commit a real `.env`.

## 3. Deployment Pipeline

- **Immutable Deployments**: Treat deployments as immutable. Never SSH into production servers to make changes. Update the code, rebuild the image, and trigger a new rollout.
- **Health Checks**: Always define `HEALTHCHECK` instructions in the `Dockerfile` and configure liveness/readiness probes in orchestrator manifests (Kubernetes).
- **Progressive Rollout**: Use rolling updates or blue-green deployments to achieve zero downtime. Configure `maxUnavailable: 0` and a meaningful `maxSurge` in Kubernetes Deployments.
- **Rollback Plan**: Every deployment MUST have a documented, tested rollback procedure. Automated rollback should trigger on health check failures.

## 4. Infrastructure as Code (IaC)

- **Declarative Infrastructure**: Manage all infrastructure (Terraform, Ansible, Kubernetes manifests, CloudFormation) in version control alongside or adjacent to the application code.
- **Remote State**: Use remote, locking state backends for IaC tools (S3 + DynamoDB for Terraform) to prevent concurrent modification and state corruption.
- **Review Before Apply**: Always review `plan`/`dry-run` output before applying infrastructure changes. Never apply terraform without reviewing the plan.

## 5. Observability & Operations

- **Structured Logging**: All applications MUST emit **structured logs** (JSON format) with fields: `timestamp`, `level`, `service`, `traceId`, `message`. Never log sensitive data.
- **Metrics & Alerting**: Expose a `/metrics` endpoint (Prometheus format). Define alerting rules for service-level objectives (error rate, latency p99, saturation).
- **Distributed Tracing**: Instrument all inter-service calls with OpenTelemetry spans. Propagate `traceparent` headers across service boundaries.
- **Runbooks**: Every production alert MUST link to a runbook describing diagnosis steps and remediation actions.
