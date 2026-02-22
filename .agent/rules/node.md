```markdown
# Node.js 开发规范

> 目标：Node.js 项目约定（格式化、lint、测试与构建）。

## 1. 工具链

- 推荐使用 `eslint` + `prettier`。提供配置文件：`.eslintrc.js`、`.prettierrc`。
- 使用 `npm` 或 `pnpm`，并提交相应 lock 文件（`package-lock.json` 或 `pnpm-lock.yaml`）。

## 2. 包管理

- 禁止直接在运行时安装依赖（runtime install）。所有依赖应声明在 `package.json`。

## 3. 构建与发布

- 提供明确的构建脚本（`build`）、测试脚本（`test`）、本地运行脚本（`start`）。
```
