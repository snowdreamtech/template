# Terraform / Infrastructure as Code Guidelines

> Objective: Define standards for writing safe, maintainable, reusable, and secure Terraform configurations covering project structure, state management, variable handling, security scanning, and workflow automation.

## 1. Project Structure & Modules

### Layout

- Organize Terraform code into **reusable modules** and **root environment configurations**:

  ```text
  infra/
  ├── modules/                     # Reusable, versioned Terraform modules
  │   ├── network/
  │   │   ├── main.tf              # Resource definitions
  │   │   ├── variables.tf         # Input variable declarations
  │   │   ├── outputs.tf           # Output declarations
  │   │   ├── versions.tf          # Required provider/Terraform versions
  │   │   └── README.md            # Inputs, outputs, usage examples
  │   ├── database/
  │   └── compute/
  └── environments/
      ├── production/
      │   ├── main.tf              # Root configuration — calls modules
      │   ├── variables.tf
      │   ├── terraform.tfvars     # Non-secret env-specific values
      │   ├── backend.tf           # Remote backend config
      │   └── versions.tf
      └── staging/
  ```

- **Never duplicate** infrastructure code between environments. Parameterize all differences via `variables.tf`. If two environments share more than 80% configuration, they belong in the same module with different variable values.
- Each module MUST have a `README.md` documenting: inputs (name, type, description, default), outputs, resource dependencies, and usage examples.
- Use a **`locals` block** to compute derived values, avoiding repeated expressions:

  ```hcl
  locals {
    environment = var.environment
    tags = merge(var.common_tags, {
      Environment = local.environment
      ManagedBy   = "terraform"
    })
    database_name = "${var.project_name}-${local.environment}-db"
  }
  ```

### Module Design

- Design modules **around business capabilities**, not cloud resources. A `web-application` module is better than separate `alb`, `ecs`, and `rds` modules that must be wired manually for every deployment.
- Define **module version constraints** when calling external public modules:

  ```hcl
  module "vpc" {
    source  = "terraform-aws-modules/vpc/aws"
    version = "5.5.2"   # exact version — never ">= 0.0.0"
  }
  ```

- Keep module interfaces minimal — expose only variables that callers genuinely need to customize. Use sensible defaults.

## 2. State Management

- Always use a **remote backend** for shared team state. Configure it explicitly in `backend.tf`:

  ```hcl
  # AWS S3 + DynamoDB backend
  terraform {
    backend "s3" {
      bucket         = "my-terraform-state"
      key            = "production/terraform.tfstate"
      region         = "us-east-1"
      encrypt        = true
      dynamodb_table = "terraform-state-lock"
      kms_key_id     = "arn:aws:kms:us-east-1:123456789012:key/..."
    }
  }
  ```

  Supported backends: S3 + DynamoDB (AWS), GCS (GCP), Azure Blob, Terraform Cloud.
- **Never commit `.tfstate` files** to version control. Add `*.tfstate*` and `*.tfstate.backup` to `.gitignore`.
- Enable **state locking** to prevent concurrent modifications. DynamoDB provides lock for S3 backend. Always verify locking is active before enabling CI apply.
- Use **separate state files per environment** (separate backend key prefixes, not Terraform workspaces). Never share state between environments:

  ```text
  production/terraform.tfstate   # production env state
  staging/terraform.tfstate      # staging env state — isolated
  ```

- Protect the state bucket:
  - Enable S3 versioning for rollback capability
  - Restrict IAM access to CI/CD service accounts and admin roles only
  - Enable server-side encryption (SSE-KMS)

## 3. Variables & Secrets

- Declare all variables with `description`, `type`, and `validation` blocks in `variables.tf`. Never use untyped `any`:

  ```hcl
  variable "instance_type" {
    description = "EC2 instance type for the application servers"
    type        = string
    default     = "t3.medium"
    validation {
      condition     = contains(["t3.medium", "t3.large", "m5.large", "m5.xlarge"], var.instance_type)
      error_message = "instance_type must be one of: t3.medium, t3.large, m5.large, m5.xlarge"
    }
  }

  variable "replica_count" {
    description = "Number of RDS read replicas (0 disables replication)"
    type        = number
    default     = 1
    validation {
      condition     = var.replica_count >= 0 && var.replica_count <= 5
      error_message = "replica_count must be between 0 and 5"
    }
  }
  ```

- **Never hardcode secrets** in `.tf` or `.tfvars` files. Inject via:

  ```bash
  # Environment variables (TF_VAR_ prefix)
  export TF_VAR_database_password="$(aws secretsmanager get-secret-value ...)"

  # Or Vault data source
  data "vault_generic_secret" "db" {
    path = "secret/production/database"
  }
  ```

- Mark sensitive outputs and variables with `sensitive = true`:

  ```hcl
  output "database_password" {
    value     = random_password.db.result
    sensitive = true   # prevents logging in plan/apply output
  }
  ```

- Use **`terraform.tfvars`** for non-secret environment-specific values. Commit a `.tfvars.example` template showing required variables without values. Never commit actual `.tfvars` files containing secrets.

## 4. Code Quality & Security

- Run `terraform fmt -recursive` and `terraform validate` in pre-commit hooks and as CI gates.
- Use **tflint** with provider-specific ruleset:

  ```bash
  tflint --init && tflint --recursive
  ```

- Use **tfsec** or **Checkov** for infrastructure security scanning. Fail CI on high-severity findings:

  ```bash
  tfsec . --minimum-severity HIGH --soft-fail    # review findings; fail on critical
  checkov -d . --compact --quiet
  ```

- Pin **provider versions** and the **Terraform version** explicitly:

  ```hcl
  terraform {
    required_version = ">= 1.7.0, < 2.0.0"
    required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 5.0"   # permit minor updates, pin major
      }
    }
  }
  ```

- Use `terraform test` (Terraform 1.6+) or **Terratest** Go-based tests for module integration testing.
- Consider **OpenTofu** as a drop-in, API-compatible open-source Terraform fork for projects requiring open-source licensing.

## 5. Workflow & Safety

### Plan-Before-Apply Workflow

- Always review `terraform plan` output **in CI before allowing `terraform apply`**. Use a PR comment workflow for team visibility and review:
  - **Atlantis** — self-hosted, comment-driven Terraform PR automation
  - **Terraform Cloud / HCP Terraform** — managed, remote runs with policy controls
  - **Spacelift / env0** — enterprise alternatives with advanced RBAC
- Require **at least two approvals on the plan** for production infrastructure changes in your PR workflow.

### Safety Practices

- Use `-target` only for emergency surgical changes. Always document the reason in a comment and remove `-target` in a follow-up cleanup PR:

  ```bash
  # Emergency fix: only apply the load balancer listener change
  terraform apply -target="aws_lb_listener.https"
  ```

- **Tag all resources** with standard tags via a default tags provider:

  ```hcl
  provider "aws" {
    region = var.aws_region
    default_tags {
      tags = {
        Project     = var.project_name
        Environment = var.environment
        Owner       = var.team
        ManagedBy   = "terraform"
        Repository  = "github.com/org/repo"
      }
    }
  }
  ```

- Run `terraform plan` on a **daily schedule** (drift detection) and alert if the plan is non-empty (i.e., actual infrastructure differs from desired state).
- Never run `terraform destroy` in production without:
  1. A manual approval gate (required reviewers in GitHub Environments)
  2. A recent backup verification
  3. A documented rollback plan
- Use **Infracost** in CI to display the estimated monthly cost delta for each PR — prevents accidental costly changes from merging without review:

  ```bash
  infracost diff --path . --format json | infracost comment github --pull-request $PR_NUMBER
  ```
