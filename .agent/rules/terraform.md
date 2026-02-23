# Terraform / Infrastructure as Code Guidelines

> Objective: Define standards for writing safe, maintainable, and reusable Terraform configurations.

## 1. Project Structure

- Organize Terraform code into **modules** for reusability. Separate root configurations per environment:
  ```
  infra/
  ├── modules/          # Reusable, versioned modules
  │   ├── network/
  │   └── database/
  ├── environments/
  │   ├── production/   # Root configuration for prod
  │   └── staging/      # Root configuration for staging
  ```
- Never duplicate infrastructure code between environments. Parameterize modules with `variables.tf`.

## 2. State Management

- Always use a **remote backend** (e.g., S3 + DynamoDB, GCS, Terraform Cloud) for state storage. Never rely on local state in team settings.
- Enable state locking to prevent concurrent modifications.
- Never edit the `.tfstate` file manually.

## 3. Variables & Secrets

- Declare all variables with `description` and `type` in `variables.tf`.
- **Never hardcode secrets** (API keys, passwords) in `.tf` files. Inject via environment variables (`TF_VAR_*`) or a secrets manager.
- Use `sensitive = true` for sensitive variable and output values to prevent them from being printed in logs.

## 4. Code Quality

- Run `terraform fmt` and `terraform validate` before every commit.
- Use **tflint** and **tfsec** (or Checkov) in CI for linting and security scanning.
- Pin provider and module versions explicitly: `version = "~> 5.0"`. Do not use `>= 0.0.0`.

## 5. Workflow & Safety

- Always review `terraform plan` output before applying. Never run `terraform apply` without reviewing the plan first.
- Use `-target` sparingly and only for emergency surgical changes.
- Tag all resources with standard tags: `environment`, `project`, `managed-by = "terraform"`.
