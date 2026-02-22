```markdown
# 本地开发与环境规范

> 目标：定义开发者启动、常用脚本与跨平台注意事项。

## 1. 环境启动

- 提供 `Makefile` 或 `scripts/` 中的跨平台入口（使用 Node 脚本或 Python 脚本避免 shell 专属语法）。
- 提供 `.env.example` 与启动步骤文档（中文 README 中描述）。

## 2. 脚本与工具

- 常用命令应放在 `scripts/` 或 `package.json` 的 `scripts` 中，便于 `npm run` / `make` 调用。
- 脚本应具备 `--help` 或可打印用途说明。

## 3. 跨平台兼容

- 避免在脚本中硬编码路径分隔符；使用 Node 的 `path` 或 Python 的 `os.path`。
- 如需 platform-specific 命令，提供替代实现或在 README 中说明。
```
