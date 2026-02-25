# Terraform / Infrastructure as Code Guidelines

> Objective: Define standards for writing safe, maintainable, reusable, and secure Terraform configurations.

## 1. Project Structure

- Organize Terraform code into **reusable modules** and **root configurations** per environment:

  ```text
  infra/
  ├── modules/          # Reusable, versioned Terraform modules
  │   ├── network/      # Each module: main.tf, variables.tf, outputs.tf, README.md
  │   └── database/
  ├── environments/
  │   ├── production/   # Root configuration: main.tf, terraform.tfvars, backend.tf
  │   └── staging/
  ```

- Never duplicate infrastructure code between environments. Parameterize differences via `variables.tf`.
- Each module MUST have a `README.md` documenting inputs, outputs, resource dependencies, and usage examples.
- Use a `locals` block to compute derived values rather than repeating expressions inline.

## 2. State Management

- Always use a **remote backend** (S3 + DynamoDB locking, GCS, Azure Blob, Terraform Cloud) for shared state. Never commit `.tfstate` files to version control — add `*.tfstate*` to `.gitignore`.
- Enable state locking to prevent concurrent modifications. Always verify locking is active before running CI apply jobs.
- Use **separate state files per environment** (separate workspaces or separate backend configurations). Never share state between environments.
- Protect the state file: enable versioning on the backend bucket and restrict access with IAM policies. Store the state encryption key securely.
- Run `terraform state list` and `terraform state show` to inspect state before making structural changes.

## 3. Variables & Secrets

- Declare all variables with `description`, `type`, and (where appropriate) `validation` blocks in `variables.tf`. Never use untyped `any` variables.
- **Never hardcode secrets** (API keys, passwords, tokens) in `.tf` or `.tfvars` files. Inject via environment variables (`TF_VAR_*`), Vault data sources, or AWS Secrets Manager.
- Mark sensitive outputs and variables with `sensitive = true` to prevent them from appearing in plan/apply logs and output.
- Use **`terraform.tfvars`** for environment-specific non-secret values. Commit a `.tfvars.example` template; never commit actual secret `.tfvars`.

## 4. Code Quality & Security

- Run `terraform fmt -recursive` and `terraform validate` before every commit. Enforce in CI as a pre-apply gate.
- Use **tflint** for provider-specific linting and **tfsec** or **Checkov** for security scanning. Block CI on any high-severity findings.
- Pin **provider versions** explicitly: `version = "~> 5.0"`. Pin **module sources** to a specific version tag or commit hash. Never use `>= 0.0.0` or no version constraint.
- Use `terraform test` (Terraform 1.6+) or **Terratest** Go-based tests for module integration testing.

## 5. Workflow & Safety

- Always review `terraform plan` output in CI before allowing `terraform apply`. Use a PR comment workflow (Atlantis, Terraform Cloud, env0) for team review of infrastructure changes.
- Use `-target` only for emergency surgical changes. Document the reason in a comment and remove it in a follow-up PR.
- Tag all cloud resources with standard tags: `environment`, `project`, `owner`, `managed-by = "terraform"`.
- Run `terraform plan` on a daily schedule (**drift detection**) and alert on unexpected differences between plan and actual infrastructure.
- Never run `terraform destroy` in production without a manual approval gate and a recent backup verification.
