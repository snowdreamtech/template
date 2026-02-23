# Flask Development Guidelines

> Objective: Define standards for building maintainable, secure, and production-ready Flask applications.

## 1. Application Structure

- Use the **Application Factory pattern** for all but the simplest scripts:
  ```python
  def create_app(config=None):
      app = Flask(__name__)
      app.config.from_object(config or "config.ProductionConfig")
      # register blueprints, extensions
      return app
  ```
- Organize code using **Blueprints** for each feature domain (`auth`, `api`, `admin`). Register them in the factory.
- Follow the layout: `app/` (package with `__init__.py`, blueprints), `config.py`, `tests/`, `wsgi.py`.

## 2. Configuration

- Use a class-based config hierarchy: `BaseConfig` → `DevelopmentConfig` / `ProductionConfig` / `TestingConfig`.
- Load secrets from environment variables, never from version-controlled config files.
- Use `python-dotenv` to load `.env` during development. Never commit `.env`.

## 3. Extensions

- Use Flask's ecosystem extensions for standard concerns — do not reinvent the wheel:
  - **Flask-SQLAlchemy** / **Flask-Migrate** for database ORM and migrations.
  - **Flask-Login** for session-based authentication.
  - **Flask-WTF** for form handling and CSRF protection.
  - **Marshmallow** or **Pydantic** for API request/response validation.
- Initialize all extensions in the factory (`db.init_app(app)`) to avoid circular imports.

## 4. Security

- Enable CSRF protection via **Flask-WTF** for all forms. For JSON APIs, use token-based auth instead.
- Set `SECRET_KEY` from an environment variable — never hardcode it. Flask sessions depend on it.
- Use **Flask-Talisman** to set security headers (CSP, HSTS, etc.) in production.
- Never use the built-in `flask run` development server in production. Use **Gunicorn** or **uWSGI**.

## 5. Testing

- Use **pytest** with the `app.test_client()` fixture for request-level tests.
- Use `pytest-flask` for convenient fixtures (`client`, `app`).
- Run `pytest` and `flask --app ... check` in CI.
