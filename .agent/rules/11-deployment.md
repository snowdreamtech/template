# Deployment & Infrastructure Guidelines

> Objective: Standardize containerization, infrastructure as code, deployment pipelines, disaster recovery, and operational practices.

## 1. Containerization (Docker)

### Dockerfile Best Practices

- **Multi-Stage Builds**: Always use multi-stage Docker builds to keep the final production image minimal and free of build-time dependencies:

  ```dockerfile
  # Stage 1: Build
  FROM node:22-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --ignore-scripts
  COPY tsconfig*.json ./
  COPY src/ ./src/
  RUN npm run build

  # Stage 2: Production — only runtime artifacts
  FROM node:22-alpine AS runner
  WORKDIR /app

  # Non-root user
  RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs
  USER nodejs

  COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
  COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
  COPY package.json ./

  EXPOSE 3000
  HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

  ENTRYPOINT ["node", "dist/index.js"]
  ```

- **Base Images**: Use official, minimal base images. Pin to a specific **SHA digest** for reproducible builds — tags can be overwritten without warning:

  ```dockerfile
  FROM node:22-alpine@sha256:abc123...   # ✅ pinned SHA digest
  # FROM node:22-alpine                  # ❌ tag can change
  # FROM node:latest                     # ❌ never in production
  ```

- **Non-Root Execution**: Containers MUST NOT run as root. Create and switch to a dedicated non-root user with a numeric UID (compatible with Kubernetes Pod Security Standards).
- **`.dockerignore`**: Always maintain a `.dockerignore` to minimize the build context and prevent secrets from being included:

  ```dockerignore
  .git
  .env
  node_modules/
  dist/
  **/*.test.ts
  **/__tests__/
  .github/
  docs/
  ```

- **SBOM & Image Scanning**: Scan every image with Trivy before pushing. CRITICAL and HIGH CVEs MUST block the push:

  ```bash
  trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
  syft myapp:latest -o cyclonedx-json > sbom.json   # generate SBOM
  cosign sign myapp:latest                            # sign the image
  ```

## 2. Configuration & Secrets

### Runtime Configuration

- Inject all runtime configuration via environment variables. Do not bake configuration or secrets into the image. The same image MUST run correctly in dev, staging, and production — only the environment changes.
- **Secret Management**: Never mount secrets as plaintext files or embed them in images. Use:
  - **Kubernetes**: External Secrets Operator + AWS Secrets Manager / Vault
  - **Docker Swarm**: Docker secrets (`docker secret create`)
  - **Standalone servers**: HashiCorp Vault Agent, AWS SSM Parameter Store

  ```yaml
  # Kubernetes — External Secrets Operator example
  apiVersion: external-secrets.io/v1beta1
  kind: ExternalSecret
  spec:
    refreshInterval: 1h
    secretStoreRef: { name: aws-secrets-manager, kind: ClusterSecretStore }
    target: { name: app-secrets }
    data:
      - secretKey: database-url
        remoteRef: { key: myapp/production, property: DATABASE_URL }
  ```

- Provide a `.env.example` with all required environment variable names, placeholder values, and descriptions. Never commit a real `.env`.
- **Hot Reload of Config**: Design services to reload non-secret configuration without restarting (config map watch, SIGHUP handler, config server polling). Document which values require a full restart.

## 3. Deployment Pipeline

### Zero-Downtime Deployments

- **Immutable Deployments**: Treat deployments as immutable. Never SSH into production servers to make changes. Always update source, rebuild the image, and trigger a new rollout via the pipeline.
- **Health Checks**: Define `HEALTHCHECK` in every Dockerfile and configure separate **liveness** and **readiness** probes in orchestrator manifests:
  - **Readiness**: traffic control — pod only receives traffic when ready. Check DB connectivity, cache availability.
  - **Liveness**: restart control — container restarted if liveness fails. Check for internal deadlocks.
  - **Startup**: gives slow-starting apps time to boot without failing liveness.
- **Progressive Rollout Strategy**: Use rolling updates, blue-green, or canary deployments for zero-downtime:

  | Strategy       | Use Case                                                      | Risk Level |
  | -------------- | ------------------------------------------------------------- | ---------- |
  | Rolling Update | Standard deployments with ≥ 2 replicas                        | Low        |
  | Blue-Green     | Critical services, instant rollback needed                    | Medium     |
  | Canary         | High-risk changes, gradual traffic shifting (5% → 25% → 100%) | Low        |
  | Shadow         | Test new service with production traffic, no user impact      | Zero       |

- **Feature Flags**: Use feature flags (LaunchDarkly, Flipt, Unleash) to decouple feature releases from code deployments. Dark-launch new features before official release.
- **Rollback Plan**: Every deployment MUST have a documented, tested rollback procedure. Automated rollback MUST trigger on health check failures within 5 minutes:

  ```bash
  # Kubernetes rollback
  kubectl rollout undo deployment/myapp
  kubectl rollout status deployment/myapp  # monitor rollout
  ```

## 4. Infrastructure as Code (IaC)

### Declarative Infrastructure

- Manage ALL infrastructure (Terraform, Pulumi, Ansible, Kubernetes manifests, CloudFormation) in version control alongside the application code. Infrastructure changes follow the same PR and review process as application code.
- **Remote State**: Use remote, locking state backends for IaC tools to prevent concurrent modification:

  ```hcl
  # terraform backend — S3 + DynamoDB locking
  terraform {
    backend "s3" {
      bucket         = "myapp-terraform-state"
      key            = "production/terraform.tfstate"
      region         = "us-east-1"
      encrypt        = true
      dynamodb_table = "myapp-terraform-locks"
    }
  }
  ```

- **Review Before Apply**: Always review `plan`/`dry-run` output before applying infrastructure changes:

  ```bash
  terraform plan -out=tfplan   # generate plan in CI (reviewed by humans)
  terraform apply tfplan        # apply in protected environment after approval
  ```

- **Drift Detection**: Run scheduled drift detection and alert on detected drift. IaC is the source of truth — manual changes are a drift event that must be remediated.
- **Cost & Tagging**: All provisioned cloud resources MUST be tagged with: `environment`, `team`, `service`, `cost-center`. Enforce via AWS SCPs, Azure Policy, or GCP Org Policies.

## 5. Observability, DR & Operations

### Structured Observability

- **Structured Logging**: All applications MUST emit structured JSON logs to stdout:

  ```json
  {
    "timestamp": "2025-01-15T10:30:00.123Z",
    "level": "info",
    "service": "order-service",
    "traceId": "abc-123",
    "spanId": "def-456",
    "userId": "usr_789",
    "message": "Order created successfully",
    "orderId": "ord_234",
    "durationMs": 42
  }
  ```

  Never log: passwords, API keys, PII (email, SSN), or internal infrastructure details.
- **Metrics & Alerting**: Expose a `/metrics` endpoint in Prometheus format. Define SLO-based alerting rules:
  - Error rate: alert if error rate > 1% over 5 minutes
  - Latency: alert if P99 latency > 2s over 5 minutes
  - Saturation: alert if CPU > 80% or memory > 85%
- **Distributed Tracing**: Instrument all inter-service calls with **OpenTelemetry** spans. Propagate `traceparent` headers. Configure trace sampling: 1% in production, 100% in development.
- **Disaster Recovery (DR)**:
  - Define and document **RTO** (Recovery Time Objective) and **RPO** (Recovery Point Objective) for each production service
  - Test DR procedures at minimum **quarterly** via chaos engineering or scheduled DR drills
  - Maintain automated backups with verified restore procedures. An untested backup is not a backup
  - Example SLA: critical payment service — RTO ≤ 15 minutes, RPO ≤ 5 minutes
- **Runbooks**: Every production alert MUST link to a runbook with: symptom description, diagnostic commands, likely root causes, step-by-step remediation, and rollback instructions.
