```markdown
# Git 与提交/PR 规范

> 目标：统一提交历史、PR 流程与审查标准，提高可追溯性与协作效率。

## 1. 提交信息

- 使用 Conventional Commits 格式：`<type>(<scope>): <description>`（类型：feat, fix, docs, style, refactor, test, chore）。
- 提交信息必须为英文。

## 2. 分支策略

- 推荐使用 feature branches（`feature/*`）、`develop` 与 `main`（或 `release/*`）。
- 合并到 `main` 前必须通过 CI 并至少一名审查者批准。

## 3. PR 要求

- PR 描述应包含变更摘要、验证步骤、相关 issue/任务号、回滚注意事项。
- 对安全、依赖、数据库迁移相关的 PR 需显式列出影响与回滚步骤并标注 `security` / `db` 标签。

## 4. 清理历史

- 对历史进行有选择的 squash 或 rebase 保持主分支清晰；但合并策略需在团队达成一致。
```
