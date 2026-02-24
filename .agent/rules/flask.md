# Flask Development Guidelines

> Objective: Define standards for building maintainable, secure, and production-ready Flask applications.

## 1. Application Structure

- Use the **Application Factory pattern** for all but the simplest scripts to enable testing and multiple configurations:
  ```python
  def create_app(config: str = "config.ProductionConfig") -> Flask:
      app = Flask(__name__)
      app.config.from_object(config)
      db.init_app(app)
      # register blueprints
      app.register_blueprint(auth_bp, url_prefix="/auth")
      return app
  ```
- Organize code using **Blueprints** for each feature domain (`auth`, `api/v1`, `admin`). Register them in the factory.
- Follow the project layout: `app/` (package with `__init__.py` and Blueprints), `config.py`, `tests/`, `migrations/`, `wsgi.py`.

## 2. Configuration

- Use a class-based config hierarchy: `BaseConfig` → `DevelopmentConfig` / `ProductionConfig` / `TestingConfig`.
- Load secrets from environment variables using `os.environ` or `python-dotenv`. Never hardcode secrets or commit `.env` files.
- Validate required config values at startup. Raise `ValueError` if critical variables (like `SECRET_KEY`, `DATABASE_URL`) are missing or use default values.

## 3. Extensions & Patterns

- Use Flask's ecosystem extensions for standard concerns:
  - **Flask-SQLAlchemy** + **Flask-Migrate** for ORM and database migrations.
  - **Flask-Login** for session-based authentication.
  - **Flask-WTF** for form handling and CSRF protection.
  - **Marshmallow** or **Pydantic v2** for API request/response validation and serialization.
- Initialize all extensions outside the factory and call `ext.init_app(app)` inside to avoid circular imports.
- Use `flask.g` for request-scoped state (e.g., current database connection, current user object).

## 4. Security

- Enable CSRF protection via **Flask-WTF** for all HTML form submissions. For JSON REST APIs, use token-based auth (JWT) instead of CSRF tokens.
- Set `SECRET_KEY` from an environment variable — never hardcode it. This key protects session cookies and CSRF tokens.
- Use **Flask-Talisman** to set security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) in production.
- **Never use `flask run` in production.** Deploy with **Gunicorn** + **Uvicorn workers** (for async) or **Gunicorn** (sync): `gunicorn -w 4 "app:create_app()"`.

## 5. Testing & Tooling

- Use **`pytest`** with the `app.test_client()` fixture for integration and request-level tests. Use `pytest-flask` for convenient fixtures (`client`, `app`, `live_server`).
- Use `pytest-cov` for coverage measurement. Set a minimum coverage threshold in CI.
- Use **Factory Boy** with **Faker** for test data generation.
- Lint with **Ruff** and type-check with **mypy** (set `mypy --strict`). Run `flask --app wsgi:app check` in CI to verify the application loads without errors.
