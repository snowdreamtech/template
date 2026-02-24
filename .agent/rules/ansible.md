# Ansible Development Guidelines

> Objective: Define standards for writing idempotent, secure, and maintainable Ansible playbooks and roles.

## 1. Idempotency

- All tasks MUST be **idempotent** — running a playbook multiple times must produce the same end state without errors.
- Use Ansible **modules** (e.g., `ansible.builtin.file`, `ansible.builtin.template`, `ansible.builtin.systemd`) instead of raw `shell` or `command` tasks whenever an appropriate module exists.
- When `shell` or `command` tasks are unavoidable, add `changed_when: false` (if always idempotent) or a proper condition, and `creates`/`removes` guards.
- Use `ansible.builtin.stat` to check state before acting, rather than relying on error behavior.

## 2. Structure & Organization

- Organize automation into **roles** using the standard directory layout: `tasks/`, `handlers/`, `defaults/`, `vars/`, `templates/`, `files/`, `meta/`.
- Use **collections** (`ansible-galaxy collection install`) for shared, reusable roles across projects. Pin collection versions in `requirements.yml`.
- Follow the standard project layout:
  ```
  inventory/          # Per-environment inventory files or directories
  roles/              # Reusable roles
  playbooks/          # Top-level orchestration playbooks
  group_vars/         # Group-level variable overrides
  host_vars/          # Host-level variable overrides
  requirements.yml    # Galaxy collection and role dependencies
  ```

## 3. Variables & Secrets

- Use `defaults/main.yml` for role defaults (lowest precedence, easily overridable by group_vars or extra_vars).
- Use `vars/main.yml` for role constants that are not intended to be overridden externally.
- **Never store plaintext secrets** in variable files or version control. Use **Ansible Vault** to encrypt sensitive values (`ansible-vault encrypt_string`).
- Store vault-encrypted values in Git. Store the vault password in a secrets manager (Vault, AWS Secrets Manager) — never commit the password itself.

## 4. Naming, Style & Best Practices

- Use `snake_case` for all task names, variable names, tag names, and role names.
- Give every task a descriptive `name:` field. Never leave a task unnamed — unnamed tasks produce unreadable output.
- Use `notify` and `handlers` for operations that should run only when a change occurs (e.g., restart a service only after its config file changes).
- Set `become: true` at the task or play level only where `sudo` escalation is required. Avoid setting `become: true` globally on all plays.
- Use **tags** (`tags: [config, service]`) on all tasks to enable targeted playbook runs.

## 5. Testing & Linting

- Lint all playbooks and roles with **`ansible-lint`** in CI. Fix all warnings and errors before merging. Commit `.ansible-lint` config to enforce custom rules.
- Test roles with **Molecule** using Docker or Podman as the driver. Write idempotence tests (run converge twice, assert no changes on the second run).
- Use `--check` (dry-run) mode combined with `--diff` in CI to preview changes before applying to production environments.
- Use `ansible-playbook --syntax-check playbook.yml` as a lightweight pre-flight check in CI before running the full Molecule test suite.
