# Python Development Guidelines

> Objective: Define standards for modern, clean, and maintainable Python code.

## 1. Version & Environment

- Target **Python 3.11+** for new projects. Use `requires-python` in `pyproject.toml` to enforce the minimum version.
- Use **`uv`** (preferred for speed) or **`poetry`** for dependency management and virtual environment isolation. Never install project dependencies into the system Python.
- Always provide a `pyproject.toml` in the project root (PEP 517/518). Use `uv lock` or `poetry.lock` for reproducible installs. Commit the lock file.
- Pin the Python version in `.python-version` (pyenv/mise) so all developers and CI use the same interpreter.

## 2. Formatting & Linting

- Format all code with **`ruff format`**. Enforce formatting in CI (`ruff format --check .`).
- Lint with **`ruff`** for fast, comprehensive static analysis — it replaces `flake8`, `isort`, `pyupgrade`, `pyflakes`, and more. Configure via `[tool.ruff]` in `pyproject.toml`.
- Use **`mypy`** (strict) or **`pyright`** (basic) for type checking. Run in CI. Prefer `pyright` for projects using VS Code.
- Remove dead code and unused imports automatically with Ruff's autofix (`ruff check --fix`).

## 3. Type Hints

- Add type annotations to **all** function signatures and class attributes in new code. Backfill as you touch legacy code.
- Use `from __future__ import annotations` for forward-compatible annotation syntax on Python < 3.10.
- Prefer modern union syntax: `X | None` over `Optional[X]`, `X | Y` over `Union[X, Y]` (Python 3.10+).
- Use `TypeVar`, `Generic`, `Protocol`, and `TypedDict` for complex typing patterns. Prefer `Protocol` over `ABC` for structural subtyping.
- Never use `Any` without an explanatory comment. Use `cast()` sparingly and only when the type system genuinely cannot infer the type.

## 4. Code Style & Patterns

- Follow **PEP 8**. Use `snake_case` for variables/functions/modules, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- Prefer **f-strings** over `%` formatting or `.format()`. Use `f"{value!r}"` for debugging output.
- Use **dataclasses** (`@dataclass`) or **Pydantic v2** models for structured data. Avoid plain `dict` for typed domain objects.
- Use `pathlib.Path` instead of `os.path` for all file system operations.
- Use **context managers** (`with`) for all resources (files, DB connections, locks) to ensure proper cleanup.
- Use the **`logging`** module for all diagnostic output. Never use `print()` for logging, debugging, or status messages in production code. Configure loggers per module: `logger = logging.getLogger(__name__)`.
- Write **generators** and use lazy evaluation where possible for large data processing. Avoid loading entire datasets into memory.
- Follow **PEP 257** for docstring conventions. Use Google-style or NumPy-style docstrings consistently in a project. Document all public functions, classes, and modules.
- Set up **`pre-commit`** hooks for `ruff check --fix`, `ruff format`, and `mypy` so formatting and type errors are caught before they reach CI.

## 5. Testing & CI

- Use **`pytest`** for all tests. Use `pytest-cov` for coverage reporting with minimum threshold enforcement.
- Aim for ≥ 80% coverage on business logic. Use `pytest.mark.parametrize` for table-driven tests.
- Use `pytest-asyncio` for async test functions. Configure `asyncio_mode = "auto"` in `pytest.ini` or `pyproject.toml`.
- Use `pytest-mock` or `unittest.mock` for mocking. Prefer dependency injection for testability over patching globals.
- **CI pipeline commands**: `ruff check .` → `ruff format --check .` → `mypy .` → `pytest --cov --cov-fail-under=80`.
- Use **`tox`** or **`nox`** to test against multiple Python versions in isolation.
- Run **`bandit -r .`** for security linting in CI to detect common Python security issues (hardcoded secrets, use of `subprocess.shell=True`, insecure deserialization).
