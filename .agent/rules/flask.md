# Flask Development Guidelines

> Objective: Define standards for building maintainable, secure, and production-ready Flask applications.

## 1. Application Structure

- Use the **Application Factory pattern** for all but the simplest scripts to enable testing and multiple configurations:

  ```python
  def create_app(config: str = "config.ProductionConfig") -> Flask:
      app = Flask(__name__)
      app.config.from_object(config)
      db.init_app(app)
      app.register_blueprint(auth_bp, url_prefix="/auth")
      app.register_blueprint(api_bp, url_prefix="/api/v1")
      return app
  ```

- Organize code using **Blueprints** for each feature domain (`auth`, `api/v1`, `admin`). Register them in the factory function.
- Follow the project layout: `app/` (package with `__init__.py` and Blueprints), `config.py`, `tests/`, `migrations/`, `wsgi.py`.
- Use `wsgi.py` as the WSGI entry point. Never import `create_app` from the package `__init__.py` directly in production servers.

## 2. Configuration

- Use a class-based config hierarchy: `BaseConfig` → `DevelopmentConfig` / `ProductionConfig` / `TestingConfig`. `TestingConfig` must set `TESTING = True` and use an in-memory/test database.
- Load secrets from environment variables using `os.environ` or `python-dotenv`. Never hardcode secrets or commit `.env` files to version control.
- Validate required config values at startup. Raise `ValueError` if critical variables (`SECRET_KEY`, `DATABASE_URL`) are missing or still set to default insecure values.
- Use `app.config.from_prefixed_env("FLASK_")` (Flask 2.1+) for environment variable-based configuration.

## 3. Extensions & Patterns

- Use Flask's ecosystem extensions for standard concerns:
  - **Flask-SQLAlchemy** + **Flask-Migrate** for ORM and database migrations.
  - **Flask-Login** for session-based authentication.
  - **Flask-WTF** for form handling and CSRF protection.
  - **Marshmallow** or **Pydantic v2** for API request/response validation and serialization.
- Initialize all extensions outside the factory and call `ext.init_app(app)` inside to avoid circular imports.
- Use `flask.g` for request-scoped state (e.g., current database connection, current user object). Use `flask.current_app` when you need app context outside request context.
- Use `@app.before_request` and `@app.teardown_appcontext` for request lifecycle hooks, not monkey-patching.

## 4. Security

- Enable CSRF protection via **Flask-WTF** for all HTML form submissions. For JSON REST APIs, use token-based auth (JWT) with `Authorization: Bearer` header instead of CSRF tokens.
- Set `SECRET_KEY` from an environment variable — never hardcode. Use a cryptographically random 256-bit key.
- Use **Flask-Talisman** to enforce security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) in production.
- **Never use `flask run` in production.** Deploy with **Gunicorn**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker "app:create_app()"` for async support, or `gunicorn -w 4 "app:create_app()"` for sync.
- Set `SESSION_COOKIE_SECURE=True`, `SESSION_COOKIE_HTTPONLY=True`, `SESSION_COOKIE_SAMESITE="Lax"` in production config.

## 5. Testing & Tooling

- Use **`pytest`** with the `app.test_client()` fixture for integration tests. Use `pytest-flask` for convenient fixtures (`client`, `app`, `live_server`).
- Use `pytest-cov` for coverage measurement. Set a minimum threshold (`--cov-fail-under=80`) in CI.
- Use **Factory Boy** with **Faker** for realistic test data generation. Pair with `pytest-factoryboy` for automatic fixture registration.
- Lint with **Ruff** and type-check with **mypy** (`--strict`). Run `flask --app wsgi:app check` in CI to verify the application loads without errors.
- Use **Flask-DebugToolbar** in development for query profiling, template inspection, and logging. Never enable it in production.
