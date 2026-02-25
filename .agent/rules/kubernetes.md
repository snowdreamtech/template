# Kubernetes Guidelines

> Objective: Define standards for writing safe, observable, and maintainable Kubernetes manifests.

## 1. Resource Design & Scheduling

- Always specify `resources.requests` and `resources.limits` for CPU and memory on every container. Never deploy without resource constraints — it risks node starvation and unpredictable scheduling.
- Set `readinessProbe` (traffic control) and `livenessProbe` (restart control) on every long-running container. Configure appropriate `initialDelaySeconds`, `periodSeconds`, and `failureThreshold`.
- Never run containers as root. Set `securityContext.runAsNonRoot: true`, specify a non-root `runAsUser` (e.g., `1000`), and set `allowPrivilegeEscalation: false`.
- Set `PodDisruptionBudget` resources for critical services to ensure minimum availability during node drains and rolling updates.

## 2. Configuration & Secrets

- Use `ConfigMap` for non-sensitive configuration. Use `Secret` for sensitive data — reference them via `valueFrom.secretKeyRef` or `envFrom.secretRef`.
- Never hardcode sensitive values directly in Pod specs or container image environment variables.
- **Encrypt Secrets at rest**: enable `EncryptionConfiguration` on the API server, or integrate with an external vault (**HashiCorp Vault**, **AWS Secrets Manager**) via a CSI driver.
- Use **External Secrets Operator** or **Vault Agent Sidecar** to sync secrets from an external vault into Kubernetes Secrets automatically.

## 3. Manifest Structure & Conventions

- Always specify `apiVersion`, `kind`, `metadata.name`, and `metadata.labels` on every resource. Use `metadata.namespace` explicitly — never rely on default namespace for production workloads.
- Use **`Deployment`** (not bare `Pod`) for stateless applications. Use **`StatefulSet`** for stateful workloads requiring stable identities and persistent storage.
- Set `strategy.type: RollingUpdate` with `maxSurge` and `maxUnavailable` for zero-downtime deployments. Set `terminationGracePeriodSeconds` appropriately for graceful drain.
- Use **`HorizontalPodAutoscaler`** (HPA) for traffic-driven autoscaling. Define `minReplicas` and `maxReplicas` conservatively. Scale based on CPU utilization or custom metrics from `kube-metrics-adapter`.
- Use **`VerticalPodAutoscaler`** (VPA) in recommendation mode to automatically right-size CPU/memory requests based on real usage, reducing wasted capacity.

## 4. Labels, Selectors & Observability

- Apply consistent labels on all resources using standard Kubernetes labels: `app.kubernetes.io/name`, `app.kubernetes.io/version`, `app.kubernetes.io/component`, `app.kubernetes.io/part-of`.
- Do not change label selectors on existing Deployments — it requires a delete-and-recreate which causes a disruption. Plan label schema before first deployment.
- Define **liveness and readiness probes** that reflect true application health. Do not use a trivial HTTP 200 healthcheck if the app has upstream dependencies — it masks real failures.
- Export Prometheus metrics from every service and create Grafana dashboards and AlertManager rules for SLO monitoring.

## 5. Security & Tooling

- Apply **NetworkPolicies** for all namespaces with a default-deny-all rule, then explicitly allow required traffic. Never leave network policies unset in production.
- Use **RBAC** with the principle of least privilege. Never use `cluster-admin` for application service accounts. Audit RBAC bindings with `kubectl auth can-i --list`.
- Manage manifests with **Helm** (versioned charts) or **Kustomize** (overlay-based). Lint manifests with **kubeconform** against the appropriate Kubernetes schema version.
- Use **Kyverno** or **OPA/Gatekeeper** for admission policy enforcement (require labels, prohibit `latest` image tags, enforce resource limits).
- Run **Trivy** or **Kubescape** in CI to scan Kubernetes manifests for misconfigurations and CVEs before deploying.
- Use **Karpenter** (AWS) or **Cluster Autoscaler** for node-level autoscaling — provision right-sized nodes on-demand instead of over-provisioning a fixed node pool.
- Attach a **Software Bill of Materials (SBOM)** to container images in CI using `syft` or `cosign`. Sign images with cosign and enforce signature verification in the cluster via admission webhooks.
