# Ansible Development Guidelines

> Objective: Define standards for writing idempotent, secure, and maintainable Ansible playbooks and roles.

## 1. Idempotency

- All tasks MUST be idempotent — running a playbook multiple times must produce the same result.
- Use Ansible modules (e.g., `ansible.builtin.file`, `ansible.builtin.template`, `ansible.builtin.service`) instead of raw `shell` or `command` tasks whenever a module exists for the operation.
- When using `shell` or `command`, add a `changed_when` condition or `creates`/`removes` to prevent false "changed" statuses.

## 2. Structure & Organization

- Organize automation into **roles** (`tasks/`, `handlers/`, `defaults/`, `vars/`, `templates/`, `files/`).
- Use **collections** for shared, reusable roles across projects.
- Follow the standard project layout:
  ```
  inventory/      # Inventory files per environment
  roles/          # Reusable roles
  playbooks/      # Top-level playbooks
  group_vars/     # Group-level variables
  host_vars/      # Host-level variables
  ```

## 3. Variables & Secrets

- Use `defaults/main.yml` for role defaults (lowest precedence, easily overridable).
- Use `vars/main.yml` for constants that should not be overridden.
- **Never store plaintext secrets in variable files**. Use **Ansible Vault** to encrypt sensitive values.
- Commit encrypted vault files to version control; never commit vault passwords.

## 4. Naming & Style

- Use `snake_case` for all task names, variable names, and role names.
- Give every task a descriptive `name:` field. Unnamed tasks are hard to debug.
- Use `notify` and `handlers` for operations that should only run when a change occurs (e.g., restarting a service after a config file changes).

## 5. Testing & Linting

- Lint all playbooks and roles with **ansible-lint** in CI.
- Test roles with **Molecule** (using Docker or Podman as the driver) before merging.
- Use `--check` (dry-run) mode to validate changes before applying to production.
