# Node.js Development Guidelines

> Objective: Node.js project conventions (formatting, linting, testing, and building).

## 1. Toolchain

- Recommend using `eslint` + `prettier`. Provide configuration files: `.eslintrc.js`, `.prettierrc`.
- Use `npm` or `pnpm`, and commit the corresponding lock file (`package-lock.json` or `pnpm-lock.yaml`).

## 2. Package Management

- Runtime install of dependencies is prohibited. All dependencies should be declared in `package.json`.

## 3. Building & Publishing

- Provide clear build scripts (`build`), test scripts (`test`), and local start scripts (`start`).
