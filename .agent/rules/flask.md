# Flask Development Guidelines

> Objective: Define standards for building maintainable, secure, and production-ready Flask applications, covering application structure, configuration, extensions, security, testing, and deployment.

## 1. Application Structure & Blueprints

### Application Factory Pattern

- Use the **Application Factory pattern** for all but the simplest scripts. It enables testing with different configurations, multiple app instances, and avoids circular imports:

  ```python
  # app/__init__.py
  from flask import Flask
  from .extensions import db, migrate, login_manager
  from .auth import auth_bp
  from .api.v1 import api_v1_bp

  def create_app(config_name: str = "production") -> Flask:
      app = Flask(__name__, instance_relative_config=True)
      app.config.from_object(f"config.{config_name.capitalize()}Config")

      # Initialize extensions
      db.init_app(app)
      migrate.init_app(app, db)
      login_manager.init_app(app)

      # Register blueprints
      app.register_blueprint(auth_bp, url_prefix="/auth")
      app.register_blueprint(api_v1_bp, url_prefix="/api/v1")

      # Register error handlers
      register_error_handlers(app)

      return app
  ```

### Project Layout

```text

project/
├── app/
│   ├── __init__.py          # create_app() factory
│   ├── extensions.py        # extension instances (db, migrate, limiter)
│   ├── models/              # SQLAlchemy models
│   ├── auth/                # auth Blueprint
│   │   ├── __init__.py      # Blueprint definition
│   │   ├── routes.py
│   │   └── schemas.py       # Marshmallow/Pydantic schemas
│   └── api/
│       └── v1/
│           ├── __init__.py
│           └── users.py
├── config.py                # Config classes
├── migrations/              # Alembic migrations
├── tests/
│   ├── conftest.py          # app fixture, client fixture
│   └── test_users.py
└── wsgi.py                  # WSGI entry point

```

- Organize code using **Blueprints** for each feature domain (`auth`, `api/v1`, `admin`). Each Blueprint is a self-contained module with its own routes, schemas, and services.
- Define **extension instances** in a dedicated `extensions.py` to avoid circular imports:

  ```python
  # app/extensions.py
  from flask_sqlalchemy import SQLAlchemy
  from flask_migrate import Migrate
  from flask_limiter import Limiter

  db = SQLAlchemy()
  migrate = Migrate()
  limiter = Limiter(key_func=lambda: "global")  # configure in create_app
  ```

- Use `wsgi.py` as the WSGI entry point: `application = create_app()`. Never expose debug servers in production.

## 2. Configuration

- Use a **class-based config hierarchy** inheriting from `BaseConfig`:

  ```python
  # config.py
  import os

  class BaseConfig:
      SECRET_KEY = os.environ.get("SECRET_KEY") or _require("SECRET_KEY")
      SQLALCHEMY_TRACK_MODIFICATIONS = False
      JSON_SORT_KEYS = False

  class DevelopmentConfig(BaseConfig):
      DEBUG = True
      SQLALCHEMY_DATABASE_URI = os.environ.get("DEV_DATABASE_URL", "sqlite:///dev.db")
      SQLALCHEMY_ECHO = True

  class ProductionConfig(BaseConfig):
      SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or _require("DATABASE_URL")
      SESSION_COOKIE_SECURE = True
      SESSION_COOKIE_HTTPONLY = True
      SESSION_COOKIE_SAMESITE = "Lax"

  class TestingConfig(BaseConfig):
      TESTING = True
      SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
      WTF_CSRF_ENABLED = False  # disable CSRF for testing

  def _require(var: str) -> str:
      raise ValueError(f"Required environment variable '{var}' is not set")
  ```

- **Validate required config values at startup.** Fail loudly (`ValueError`, `RuntimeError`) if critical variables (`SECRET_KEY`, `DATABASE_URL`) are missing or using insecure defaults.
- Use `python-dotenv` to load `.env` in development. Add `.env` to `.gitignore` — never commit environment-specific secrets.
- Use `app.config.from_prefixed_env("FLASK_")` (Flask 2.1+) for environment variable-based configuration overrides.

## 3. Extensions, Patterns & API Design

### Extensions

- Use Flask ecosystem extensions for standard concerns:

  | Concern | Extension |
  |---|---|
  | ORM | Flask-SQLAlchemy 3.x + SQLAlchemy 2.x |
  | Migrations | Flask-Migrate (Alembic) |
  | Auth (session) | Flask-Login |
  | Auth (JWT) | Flask-JWT-Extended |
  | Forms + CSRF | Flask-WTF |
  | API serialization | Marshmallow 3 / Pydantic v2 |
  | Rate limiting | Flask-Limiter |
  | Admin UI | Flask-Admin |
  | CORS | Flask-CORS |

### REST API Design Patterns

- Use **Marshmallow schemas** or **Pydantic v2 models** for request validation and response serialization:

  ```python
  from marshmallow import Schema, fields, validate, ValidationError

  class CreateUserSchema(Schema):
      name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
      email = fields.Email(required=True)

  @api_v1_bp.route("/users", methods=["POST"])
  def create_user():
      schema = CreateUserSchema()
      try:
          data = schema.load(request.json or {})
      except ValidationError as err:
          return jsonify({"errors": err.messages}), 422
      user = UserService.create(**data)
      return jsonify(schema.dump(user)), 201
  ```

- Use `flask.g` for request-scoped state (current user, DB session, request ID). Use `flask.current_app` for app context outside request context.
- Use `@app.before_request` for auth token validation, rate limiting checks, and `request_id` attachment. Use `@app.after_request` to add response headers (CORS, `X-Request-ID`).

## 4. Security

### Authentication & CSRF

- Enable **CSRF protection** via Flask-WTF for all HTML form submissions:

  ```python
  from flask_wtf.csrf import CSRFProtect
  csrf = CSRFProtect()
  csrf.init_app(app)
  ```

  For JSON REST APIs, use **JWT token authentication** (`Authorization: Bearer`) with Flask-JWT-Extended instead of CSRF tokens.
- Set `SECRET_KEY` from an environment variable — never hardcode. Use a cryptographically random 256-bit key:

  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

### Security Headers & TLS

- Use **Flask-Talisman** to enforce security headers in production:

  ```python
  from flask_talisman import Talisman
  talisman = Talisman(
      app,
      force_https=True,
      strict_transport_security=True,
      content_security_policy={
          "default-src": ["'self'"],
          "script-src": ["'self'"],
      }
  )
  ```

- Configure rate limiting with **Flask-Limiter** to protect against brute-force attacks:

  ```python
  from flask_limiter import Limiter
  from flask_limiter.util import get_remote_address

  limiter = Limiter(app, key_func=get_remote_address, default_limits=["200/day", "50/hour"])

  @auth_bp.route("/login", methods=["POST"])
  @limiter.limit("10/minute")
  def login(): ...
  ```

### Deployment

- **Never use `flask run` in production.** Deploy with **Gunicorn**:

  ```bash
  # Sync workers (WSGI)
  gunicorn -w 4 --bind 0.0.0.0:8000 wsgi:application
  # Async workers (ASGI, with Flask-async support)
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker wsgi:application
  ```

- Run behind a reverse proxy (Nginx, Caddy) — never expose Gunicorn directly to the internet. Set `ProxyFix` middleware to correctly parse `X-Forwarded-For`:

  ```python
  from werkzeug.middleware.proxy_fix import ProxyFix
  app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
  ```

## 5. Testing, Tooling & Observability

### Testing

- Use **`pytest`** with the application factory for test isolation:

  ```python
  # tests/conftest.py
  import pytest
  from app import create_app
  from app.extensions import db as _db

  @pytest.fixture(scope="session")
  def app():
      app = create_app("testing")
      with app.app_context():
          _db.create_all()
          yield app
          _db.drop_all()

  @pytest.fixture
  def client(app):
      return app.test_client()

  @pytest.fixture(autouse=True)
  def db(app):
      yield _db
      _db.session.rollback()
  ```

- Use `pytest-flask` for convenience fixtures (`client`, `live_server`). Use the `client.post("/api/v1/users", json={...})` pattern for API tests.
- Use **Factory Boy** with **Faker** for realistic test data generation. Pair with `pytest-factoryboy` for fixture auto-registration.
- Configure `pytest-cov` with a minimum coverage threshold in `pyproject.toml`:

  ```toml
  [tool.pytest.ini_options]
  addopts = "--cov=app --cov-fail-under=80 --cov-report=xml"
  ```

### Tooling & Observability

- Lint with **Ruff** (replaces flake8, isort, pep8): `ruff check . && ruff format --check .`. Type-check with **mypy** (`--strict`).
- Run `flask --app wsgi:app check` in CI to verify the application configuration loads without errors.
- Use **Flask-DebugToolbar** in development for query profiling, template inspection, and logging. Never enable it in production.
- Integrate **Sentry** (`sentry-sdk[flask]`) for production error tracking:

  ```python
  import sentry_sdk
  from sentry_sdk.integrations.flask import FlaskIntegration

  sentry_sdk.init(dsn=os.environ.get("SENTRY_DSN"), integrations=[FlaskIntegration()], traces_sample_rate=0.1)
  ```

- Expose a health check endpoint for load balancer and orchestrator probes:

  ```python
  @app.route("/health/live")
  def liveness():
      return {"status": "ok"}, 200

  @app.route("/health/ready")
  def readiness():
      try:
          db.session.execute(text("SELECT 1"))
          return {"status": "ok"}, 200
      except Exception:
          return {"status": "unavailable"}, 503
  ```
