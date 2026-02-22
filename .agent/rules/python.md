```markdown
# Python 开发规范

> 目标：Python 项目约定（虚拟环境、格式化、依赖与测试）。

## 1. 虚拟环境

- 推荐使用 `venv` 或 `poetry`；在项目根目录提供 `pyproject.toml` 或 `requirements.txt`。

## 2. 格式化与 lint

- 使用 `black`（格式化）和 `flake8` / `ruff`（静态检查）。

## 3. 依赖与运行

- 在 CI 中使用 `pip` 安装依赖前先校验 `requirements.txt` 或 `poetry.lock`。
```
