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
- Always run `python manage.py check` and review `python manage.py showmigrations` before deploying. Commit all migrations. Never modify applied migrations.
- Add `db_index=True` to fields frequently filtered. Use `UniqueConstraint` for multi-column uniqueness. Use `Meta.ordering` sparingly — it adds an implicit `ORDER BY` to all queries.
- Set `DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'` in settings to use 64-bit integer primary keys by default.

## 3. Views, APIs & URLs

- Prefer **Class-Based Views (CBVs)** for standard CRUD. Use **Function-Based Views (FBVs)** for simple or one-off views.
- Use **Django REST Framework (DRF)** for all API development. Define serializers for all public API inputs and outputs. Use `ModelSerializer` for standard CRUD, explicit `Serializer` for custom shapes.
- Name all URL patterns (`name="user-detail"`). Use `reverse()` or `{% url %}` instead of hardcoded paths.
- Use **DRF viewsets** with routers for rapid RESTful CRUD. Use `@action(detail=True, methods=["post"])` for custom actions on resource detail endpoints.

## 4. Security

- Never disable Django's built-in **CSRF protection**. For DRF APIs using session auth, keep CSRF enabled.
- Use Django's ORM for all database queries. Never use raw SQL with user-controlled input. If raw SQL is necessary, use parameterized queries with `cursor.execute(sql, params)` or `RawQuerySet`.
- Set `DEBUG = False` in production. Configure `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT = True`, `SESSION_COOKIE_SECURE = True`, `CSRF_COOKIE_SECURE = True`, and `SecurityMiddleware`.
- Use Django's built-in `User` model or extend `AbstractUser`. Never implement custom password hashing — use `set_password()` which defaults to PBKDF2. Upgrade to Argon2 via `django[argon2]` for new projects.
- Enable **HSTS** by setting `SECURE_HSTS_SECONDS = 31536000`, `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`, and `SECURE_HSTS_PRELOAD = True` in production after SSL is fully set up.

## 5. Testing & Tooling

- Use `pytest-django` with the `@pytest.mark.django_db` fixture for modern, composable tests. Prefer this over `django.test.TestCase`.
- Use **`factory-boy`** with **`Faker`** for generating realistic test data. Define factories in `tests/factories.py`. Use `create_batch()` for population tests.
- Use **DRF's `APIClient`** for API endpoint testing. Use `pytest-cov` for coverage measurement.
- Run `python manage.py check --deploy` in CI to catch insecure settings. Run `bandit -r .` for security linting.
- Use **Celery** with **Redis** or **RabbitMQ** for asynchronous task processing. Never perform slow operations (email, external API calls) synchronously in views. Always add idempotency keys to Celery tasks.
- Use **`django-stubs`** with `mypy` for type-safe Django model, QuerySet, and form type checking. Add `django-stubs[compatible-mypy]` to dev dependencies and configure `mypy.ini`.
