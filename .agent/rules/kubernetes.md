# Kubernetes Guidelines

> Objective: Define standards for writing safe, observable, and maintainable Kubernetes manifests, covering resource design, configuration, security, autoscaling, and operations tooling.

## 1. Resource Design & Scheduling

### Resource Requests & Limits

- Always specify **`resources.requests` and `resources.limits`** for CPU and memory on every container. Never deploy without resource constraints — it risks node starvation and unpredictable OOM kills:

  ```yaml
  resources:
    requests:
      cpu: "100m" # 0.1 CPU cores — guaranteed minimum
      memory: "128Mi" # guaranteed minimum memory
    limits:
      cpu: "500m" # max 0.5 CPU cores
      memory: "512Mi" # exceeding this triggers OOM kill
  ```

  Use Vertical Pod Autoscaler (VPA) in recommendation mode to right-size requests based on actual usage over time.

### Health Probes

- Set **`readinessProbe`** (controls traffic routing) and **`livenessProbe`** (controls container restarts) on every long-running container. Define both appropriately:

  ```yaml
  readinessProbe:
    httpGet:
      path: /health/ready
      port: 8080
    initialDelaySeconds: 10 # wait before first check
    periodSeconds: 5 # check every 5 seconds
    failureThreshold: 3 # fail after 3 consecutive failures

  livenessProbe:
    httpGet:
      path: /health/live
      port: 8080
    initialDelaySeconds: 30 # give app time to start
    periodSeconds: 15
    failureThreshold: 3

  startupProbe: # separate startup probe for slow-starting apps
    httpGet:
      path: /health/live
      port: 8080
    failureThreshold: 30 # allow up to 5 minutes to start (30 × 10s)
    periodSeconds: 10
  ```

- Readiness and liveness endpoints should reflect **true application health** — not just HTTP 200. Readiness should verify upstream dependencies (database connectivity). Liveness should check for internal deadlocks/corruption.

### Pod Disruption Budgets

- Set **`PodDisruptionBudget`** (PDB) for critical services to ensure minimum availability during node drains and rolling updates:

  ```yaml
  apiVersion: policy/v1
  kind: PodDisruptionBudget
  metadata:
    name: api-pdb
  spec:
    minAvailable: 2 # at least 2 replicas must stay running
    selector:
      matchLabels:
        app.kubernetes.io/name: my-api
  ```

### Security Context

- Never run containers as root. Set security context on every container:

  ```yaml
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    readOnlyRootFilesystem: true # prevents writes to container FS
    allowPrivilegeEscalation: false
    capabilities:
      drop: ["ALL"] # drop all Linux capabilities
      add: ["NET_BIND_SERVICE"] # only if needed (binding port < 1024)
  ```

## 2. Configuration & Secrets

### ConfigMap & Secrets

- Use **`ConfigMap`** for non-sensitive configuration (log levels, feature flags, service URLs). Use **`Secret`** for sensitive data (API keys, passwords, certificates) — reference via `valueFrom.secretKeyRef`:

  ```yaml
  env:
    - name: LOG_LEVEL
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: log-level
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: database-url
  ```

  Or use `envFrom` for bulk loading:

  ```yaml
  envFrom:
    - configMapRef: { name: app-config }
    - secretRef: { name: app-secrets }
  ```

### Secrets Management

- **Encrypt Secrets at rest**: enable `EncryptionConfiguration` on the API server or use a KMS provider (AWS KMS, GCP CKMS).
- Use **External Secrets Operator** or **Vault Agent Sidecar** to sync secrets from HashiCorp Vault / AWS Secrets Manager into Kubernetes Secrets automatically — eliminating manual secret rotation.
- **Never commit plaintext secrets** to version control. Use tools like **Sealed Secrets** (encrypted YAML safe to commit) or SOPS (Mozilla) for GitOps workflows.

## 3. Manifest Structure & Autoscaling

### Deployment Best Practices

- Always specify `apiVersion`, `kind`, `metadata.name`, and `metadata.labels` explicitly. Use `metadata.namespace` on every production resource — never rely on the `default` namespace:

  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: my-api
    namespace: production
    labels:
      app.kubernetes.io/name: my-api
      app.kubernetes.io/version: "1.2.3"
      app.kubernetes.io/part-of: my-platform
  spec:
    replicas: 3
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxSurge: 1
        maxUnavailable: 0 # zero-downtime rolling update
    selector:
      matchLabels:
        app.kubernetes.io/name: my-api
    template:
      metadata:
        labels:
          app.kubernetes.io/name: my-api
          app.kubernetes.io/version: "1.2.3"
      spec:
        terminationGracePeriodSeconds: 60 # time for graceful shutdown
  ```

### Autoscaling

- Use **`HorizontalPodAutoscaler`** (HPA) for traffic-driven autoscaling. Scale based on CPU/memory or custom metrics from `kube-metrics-adapter` or Keda:

  ```yaml
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: my-api
    minReplicas: 2
    maxReplicas: 20
    metrics:
      - type: Resource
        resource:
          name: cpu
          target: { type: Utilization, averageUtilization: 70 }
  ```

- Use **KEDA** (Kubernetes Event-Driven Autoscaling) for queue-depth-based scaling (Kafka consumer lag, SQS queue length, Redis list length).
- Use **Vertical Pod Autoscaler (VPA)** in `Recommendation` mode first — observe recommendations before enabling automatic updates.

## 4. Labels, Selectors & Observability

### Standard Labels

- Apply consistent labels using the **standard Kubernetes well-known labels** on all resources:

  ```yaml
  labels:
    app.kubernetes.io/name: my-api
    app.kubernetes.io/instance: my-api-production
    app.kubernetes.io/version: "1.2.3"
    app.kubernetes.io/component: backend
    app.kubernetes.io/part-of: my-platform
    app.kubernetes.io/managed-by: helm
  ```

- **Do not change `selector.matchLabels`** on existing Deployments after first creation — it requires delete-and-recreate which causes downtime. Plan label schema carefully upfront.

### Observability

- Export **Prometheus metrics** from every service (`/metrics` endpoint). Create Grafana dashboards and AlertManager rules for SLO monitoring.
- Use **structured JSON logs** from containers (stdout only — no file writes). Collect with a log agent (Fluentd, Fluent Bit, Alloy) to Loki or Elasticsearch.
- Attach **OpenTelemetry** instrumentation to all services. Export traces to Jaeger or Tempo.

## 5. Security & Tooling

### Network & RBAC Security

- Apply **`NetworkPolicy`** for all namespaces starting with a default-deny-all rule:

  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata: { name: default-deny-all, namespace: production }
  spec:
    podSelector: {} # applies to all pods in namespace
    policyTypes:
      - Ingress
      - Egress # deny all by default, then explicitly allow
  ```

- Use **RBAC** with least privilege. Never use `cluster-admin` for application service accounts. Audit RBAC bindings with `kubectl auth can-i --list --namespace production`.

### Tooling & Policy Enforcement

- Manage manifests with **Helm** (versioned chart packaging) or **Kustomize** (overlay-based configuration). Lint manifests with **`kubeconform`** and **`kube-score`** in CI.
- Use **Kyverno** or **OPA/Gatekeeper** for admission policy enforcement — require standard labels, prohibit `latest` image tags, enforce resource limits on all containers.
- Run **Trivy** and **Kubescape** in CI to scan manifests for misconfigurations and CVEs before deploying:

  ```bash
  trivy config ./kubernetes/                   # config scanning
  kubescape scan ./kubernetes/ --threshold 60  # fail if score < 60
  ```

- Sign container images with **cosign** and enforce signature verification in the cluster via admission webhooks. Attach a **SBOM** (Software Bill of Materials) using `syft`:

  ```bash
  syft my-service:v1.2.3 -o cyclonedx-json > sbom.json
  cosign attest --type cyclonedx --predicate sbom.json my-service:v1.2.3
  ```

- Use **Karpenter** (AWS) or **Cluster Autoscaler** for node-level autoscaling — provision right-sized nodes on-demand based on pending pod requirements instead of over-provisioning.
