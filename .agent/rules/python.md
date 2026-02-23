# Python Development Guidelines

> Objective: Define standards for modern, clean, and maintainable Python code.

## 1. Version & Environment

- Target **Python 3.10+** for new projects. Use `python-requires` in `pyproject.toml` to enforce the minimum version.
- Use **`venv`** (stdlib) or **`poetry`** for dependency isolation. Never install project dependencies into the system Python.
- Always provide a `pyproject.toml` (preferred) or `requirements.txt` in the project root. Pin all dependencies with lock files (`poetry.lock` or `pip-tools`' `requirements.lock`).

## 2. Formatting & Linting

- Format all code with **`ruff format`** (or `black`). Enforce formatting in CI (`ruff format --check`).
- Lint with **`ruff`** for fast, comprehensive static analysis (replaces flake8, isort, pyupgrade, and more).
- Use **`mypy`** or **`pyright`** for type checking. Run in CI with strict settings.

## 3. Type Hints

- Add type annotations to all function signatures and class attributes in new code.
- Use `from __future__ import annotations` for forward-compatible annotation syntax (Python 3.10+).
- Prefer `X | None` over `Optional[X]` and `X | Y` over `Union[X, Y]` in Python 3.10+.

## 4. Code Style

- Follow **PEP 8**. Use `snake_case` for variables/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- Prefer f-strings over `%` formatting or `.format()`.
- Use dataclasses (`@dataclass`) or Pydantic models for structured data. Avoid plain dictionaries for typed domain objects.
- Use `pathlib.Path` instead of `os.path` for all file system operations.

## 5. Testing & CI

- Use **`pytest`** for all tests. Use `pytest-cov` for coverage reporting.
- Aim for high test coverage on business logic. Use `pytest.mark.parametrize` for table-driven tests.
- In CI, run: `ruff check .`, `ruff format --check .`, `mypy .`, `pytest --cov`.
