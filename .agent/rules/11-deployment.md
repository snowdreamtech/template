# Deployment & Infrastructure Guidelines

> Objective: Standardize containerization, infrastructure as code, deployment pipelines, disaster recovery, and operational practices.

## 1. Containerization (Docker)

- **Multi-Stage Builds**: Always use multi-stage Docker builds to keep the final production image minimal and free of build-time dependencies (compilers, SDK headers, dev tools).
- **Base Images**: Use official, minimal base images (`alpine`, `distroless`, `slim`). Pin base images to a specific **SHA digest** (not just a tag) for reproducible builds: `FROM node:20-alpine@sha256:<digest>`. Never use `latest` in production.
- **Non-Root Execution**: Containers MUST NOT run as root. Create and switch to a dedicated non-root `USER` before `CMD`/`ENTRYPOINT`. Set `USER` with a numeric UID (e.g., `USER 1001`) for compatibility with Kubernetes pod security standards.
- **`.dockerignore`**: Always maintain a `.dockerignore` to exclude `.git`, `node_modules`, `.env`, test files, and build artifacts from the build context. Minimize context size for faster builds.
- **SBOM & Image Scanning**: Generate an SBOM (`syft <image>`) and scan every image with Trivy, Docker Scout, or Snyk before pushing to any registry. CRITICAL and HIGH CVEs MUST block the push.

## 2. Configuration & Secrets

- **Environment Variables**: Inject all runtime configuration via environment variables. Do not bake configuration or secrets into the image. Configuration MUST be environment-agnostic (the same image runs in dev, staging, and production).
- **Secret Management**: Never mount secrets as plaintext files or embed them in images. Use native orchestrator secret management (Kubernetes Secrets + external-secrets-operator, Docker Swarm Secrets) or external secret managers (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).
- Provide a `.env.example` with all required environment variable names, placeholder values, and descriptions. Never commit a real `.env`.
- **Hot Reload of Config**: For non-secret configuration that changes frequently, design services to reload configuration without restarting (via config map watch, signal-based reload, or a config server). Document which values require a restart.

## 3. Deployment Pipeline

- **Immutable Deployments**: Treat deployments as immutable. Never SSH into production servers to make changes. Update the code, rebuild the image from source, and trigger a new rollout through the pipeline.
- **Health Checks**: Define `HEALTHCHECK` instructions in every `Dockerfile` and configure separate **liveness** and **readiness** probes in orchestrator manifests (Kubernetes). Readiness probe failures MUST prevent traffic routing; liveness failures MUST trigger container restart.
- **Progressive Rollout**: Use rolling updates, blue-green deployments, or canary releases to achieve zero-downtime deployments. For canary: route 5-10% of traffic to the new version, monitor error rate and latency for ≥ 10 minutes before proceeding to 100%.
- **Feature Flags**: Use feature flags (LaunchDarkly, Flipt, Unleash, or a simple config) to decouple feature releases from code deployments. Dark-launch new features before the official release.
- **Rollback Plan**: Every deployment MUST have a documented, tested rollback procedure. Automated rollback MUST trigger on health check failures within 5 minutes of a failed rollout.

## 4. Infrastructure as Code (IaC)

- **Declarative Infrastructure**: Manage all infrastructure (Terraform, Pulumi, Ansible, Kubernetes manifests, CloudFormation) in version control alongside or adjacent to the application code. Infrastructure changes follow the same PR and review process as application code.
- **Remote State**: Use remote, locking state backends for IaC tools (S3 + DynamoDB for Terraform, Terraform Cloud) to prevent concurrent modification and state corruption. Never store Terraform state locally.
- **Review Before Apply**: Always review `plan`/`dry-run` output before applying infrastructure changes. Use `terraform plan` in CI (auto) and `terraform apply` only after human approval in a protected environment.
- **Drift Detection**: Run scheduled drift detection (`terraform plan` in check mode, AWS Config, Azure Policy) and alert on detected drift. Infrastructure-as-code is the source of truth; manual changes are a drift event.
- **Cost & Tagging**: All provisioned cloud resources MUST be tagged with at minimum: `environment`, `team`, `service`, `cost-center`. Enforce tagging via policy (AWS Service Control Policies, Azure Policy, GCP Org Policies).

## 5. Observability, DR & Operations

- **Structured Logging**: All applications MUST emit **structured logs** (JSON format) with fields: `timestamp`, `level`, `service`, `traceId`, `spanId`, `message`. Never log sensitive data (PII, credentials, tokens).
- **Metrics & Alerting**: Expose a `/metrics` endpoint (Prometheus format). Define alerting rules for service-level objectives (SLOs): error rate, latency p99, saturation (CPU/memory), and external dependency availability.
- **Distributed Tracing**: Instrument all inter-service calls with **OpenTelemetry** spans. Propagate `traceparent` headers across service boundaries. Ensure trace sampling is configured (e.g., 1% in production, 100% in dev).
- **Disaster Recovery (DR)**:
  - Define and document **RTO** (Recovery Time Objective) and **RPO** (Recovery Point Objective) for each production service. Example: RTO ≤ 4h, RPO ≤ 1h.
  - Test DR procedures at minimum **quarterly** via chaos engineering or scheduled DR drills. Document and sign off on results.
  - Maintain automated backups with verified restore procedures. A backup that has never been restored is not a backup.
- **Runbooks**: Every production alert MUST link to a runbook describing: symptom description, diagnostic commands, likely root causes, step-by-step remediation, and rollback instructions.
