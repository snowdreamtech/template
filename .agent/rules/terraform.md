# Terraform / Infrastructure as Code Guidelines

> Objective: Define standards for writing safe, maintainable, reusable, and secure Terraform configurations.

## 1. Project Structure

- Organize Terraform code into **reusable modules** and **root configurations** per environment:
  ```
  infra/
  ├── modules/          # Reusable, versioned Terraform modules
  │   ├── network/      # Each module: main.tf, variables.tf, outputs.tf, README.md
  │   └── database/
  ├── environments/
  │   ├── production/   # Root configuration: main.tf, terraform.tfvars, backend.tf
  │   └── staging/
  ```
- Never duplicate infrastructure code between environments. Parameterize differences using `variables.tf`.
- Each module MUST have a `README.md` documenting inputs, outputs, and examples.

## 2. State Management

- Always use a **remote backend** (S3 + DynamoDB locking, GCS, Azure Blob, Terraform Cloud) for shared state. Never commit `.tfstate` files to version control.
- Enable state locking to prevent concurrent modifications. Test locking behavior in CI.
- Use **workspaces** or separate state files per environment. Never share state between environments.
- Protect the state file: enable versioning on the backend bucket and restrict access with IAM policies.

## 3. Variables & Secrets

- Declare all variables with `description`, `type`, and (where appropriate) `validation` blocks in `variables.tf`.
- **Never hardcode secrets** (API keys, passwords, tokens) in `.tf` or `.tfvars` files. Inject via environment variables (`TF_VAR_*`), Vault, or AWS Secrets Manager data sources.
- Mark sensitive outputs and variables with `sensitive = true` to prevent them from appearing in plan/apply output and logs.
- Use **`terraform.tfvars`** for environment-specific non-secret values. Do NOT commit `.tfvars` files containing secrets.

## 4. Code Quality & Security

- Run `terraform fmt -recursive` and `terraform validate` before every commit. Enforce in CI as a gate.
- Use **tflint** for provider-specific linting and **tfsec** or **Checkov** for security scanning. Block CI on high-severity findings.
- Pin **provider versions** explicitly: `version = "~> 5.0"`. Pin **module sources** to a specific version tag or commit hash. Never use `>= 0.0.0`.
- Use `terraform test` (Terraform 1.6+) or **Terratest** Go tests for module integration testing.

## 5. Workflow & Safety

- Always review `terraform plan` output in CI before allowing `terraform apply`. Use a PR comment workflow (Atlantis, Terraform Cloud) for review.
- Use `-target` only for emergency surgical changes. Document why and remove in a follow-up commit.
- Tag all cloud resources with standard tags: `environment`, `project`, `owner`, `managed-by = "terraform"`.
- Use **drift detection**: run `terraform plan` on a schedule (e.g., daily) and alert if drift is detected.
- Never run `terraform destroy` in production without a manual approval gate.
