# Django Development Guidelines

> Objective: Define standards for building secure, scalable, and maintainable Django applications.

## 1. Project Structure

- Follow Django's **app-based structure**. Each app encapsulates a single domain concept (`users`, `orders`, `products`).
- Keep apps reusable and loosely coupled. Apps MUST NOT import from each other's internal modules — use signals, services, or a shared `core/` app for cross-app communication.
- Use a separate `settings/` directory with `base.py`, `dev.py`, `staging.py`, and `production.py`. Use `django-environ` or `environs` to load environment-specific variables.
- Organize large apps with subdirectories: `tests/`, `migrations/`, `management/commands/`, `templates/<app>/`.

## 2. Models & Database

- Define `__str__` methods on every model for readable admin, shell, and log representations.
- Use `select_related()` (foreign keys) and `prefetch_related()` (many-to-many, reverse FK) to avoid N+1 queries. Profile with `django-debug-toolbar` during development.
- Always run `python manage.py check` and `python manage.py migrate --run-syncdb` (check mode) before deploying. Commit all migrations.
- Add `db_index=True` to fields frequently filtered. Use `unique_together` or `UniqueConstraint` for multi-column uniqueness. Use `Meta.ordering` sparingly — it adds an implicit ORDER BY to all queries.
- Use **`BIGINT GENERATED ALWAYS AS IDENTITY`** (via `BigAutoField`) as the default primary key type. Set `DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'` in settings.

## 3. Views, APIs & URLs

- Prefer **Class-Based Views (CBVs)** for standard CRUD. Use **Function-Based Views (FBVs)** for simple or one-off views.
- Use **Django REST Framework (DRF)** for all API development. Define serializers for all public API inputs and outputs. Use `ModelSerializer` for standard CRUD, explicit `Serializer` for custom shapes.
- Name all URL patterns (`name="user-detail"`). Use `reverse()` or `{% url %}` instead of hardcoded paths.
- Use **DRF viewsets** with routers for rapid RESTful CRUD. Use `@action(detail=True)` for custom actions.

## 4. Security

- Never disable Django's built-in CSRF protection.
- Use Django's ORM for all database queries. Never use raw SQL with user-controlled input. If raw SQL is necessary, always use parameterized queries.
- Set `DEBUG = False` in production. Configure `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT = True`, `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True`, and security middleware (`SecurityMiddleware`).
- Use Django's built-in `User` model or extend `AbstractUser`. Never implement custom password hashing — use `set_password()` which uses PBKDF2 by default (upgrade to Argon2 via `django[argon2]`).

## 5. Testing & Tooling

- Use `pytest-django` with the `@pytest.mark.django_db` fixture (not `django.test.TestCase`) for modern, composable tests.
- Use **`factory-boy`** with **`Faker`** for generating realistic test data. Define factories in `tests/factories.py`.
- Use **DRF's `APIClient`** for API endpoint testing. Use `pytest-cov` for coverage measurement.
- Run `python manage.py check --deploy` in CI to catch insecure settings. Run `bandit -r .` for security linting.
- Use **Celery** with **Redis** or **RabbitMQ** for asynchronous task processing. Never perform slow operations (email, external API calls) synchronously in views.
