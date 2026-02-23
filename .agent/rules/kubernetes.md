# Kubernetes Guidelines

> Objective: Define standards for writing safe, observable, and maintainable Kubernetes manifests.

## 1. Resource Design

- Always specify `requests` and `limits` for CPU and memory on every container. Never deploy without resource constraints.
- Set `readinessProbe` and `livenessProbe` on every long-running container.
- Never run containers as root. Set `securityContext.runAsNonRoot: true` and specify a non-root `runAsUser`.

## 2. Configuration & Secrets

- Use `ConfigMap` for non-sensitive configuration and `Secret` for sensitive data.
- Never hardcode sensitive values in Pod specs or manifests. Reference them via `valueFrom.secretKeyRef`.
- Encrypt Secrets at rest (enable `EncryptionConfiguration` in the API server, or use an external vault).

## 3. Manifest Structure

- Use **namespaces** to isolate environments and teams.
- Always specify `apiVersion`, `kind`, `metadata.name`, and `metadata.labels` on every resource.
- Use `Deployment` (not bare `Pod`) for stateless applications. Use `StatefulSet` for stateful workloads (databases, etc.).
- Set `strategy.type: RollingUpdate` for zero-downtime deployments.

## 4. Labels & Selectors

- Apply consistent labels to all resources: `app.kubernetes.io/name`, `app.kubernetes.io/version`, `app.kubernetes.io/component`.
- Do not change label selectors on existing Deployments (it requires deletion and recreation).

## 5. Tooling & Safety

- Manage manifests with **Helm** or **Kustomize** for templating and environment-specific overrides.
- Lint manifests with **kubeval** or **kubeconform**.
- Use **RBAC** with least-privilege principles. Avoid using `cluster-admin` for application service accounts.
- Apply **NetworkPolicies** to restrict traffic between pods by default (deny-all, then allow explicitly).
