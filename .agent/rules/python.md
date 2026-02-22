# Python Development Guidelines

> Objective: Python project conventions (virtual environments, formatting, dependencies, and testing).

## 1. Virtual Environments

- Recommend using `venv` or `poetry`; provide `pyproject.toml` or `requirements.txt` in the project root.

## 2. Formatting & Linting

- Use `black` (formatting) and `flake8` / `ruff` (static analysis).

## 3. Dependencies & Execution

- In CI, verify `requirements.txt` or `poetry.lock` before using `pip` to install dependencies.
