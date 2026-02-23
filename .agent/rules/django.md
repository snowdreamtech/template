# Django Development Guidelines

> Objective: Define standards for building secure, scalable, and maintainable Django applications.

## 1. Project Structure

- Follow Django's **app-based structure**. Each app should encapsulate a single domain concept (`users`, `orders`, `products`).
- Keep apps reusable and loosely coupled. Apps should not import from each other's internals — use signals or services for cross-app communication.
- Use a separate `settings/` directory with `base.py`, `dev.py`, and `production.py` to manage environment-specific settings.

## 2. Models & Database

- Define `__str__` methods on every model for readable admin and shell representations.
- Use `get_or_create`, `select_related`, and `prefetch_related` to avoid N+1 queries.
- Always run `python manage.py check` before deploying. Create and commit all migrations.
- Add `db_index=True` to fields frequently used in `.filter()` queries.

## 3. Views & URLs

- Prefer **Class-Based Views (CBVs)** for standard CRUD operations. Use **Function-Based Views (FBVs)** for simple or one-off logic.
- Use **Django REST Framework (DRF)** for API development. Define serializers for all public API inputs and outputs.
- Name all URL patterns. Use `reverse()` or `{% url %}` instead of hardcoding URLs.

## 4. Security

- Never disable Django's built-in CSRF protection.
- Use Django's ORM for all database queries. Never use raw SQL with user-controlled input.
- Set `DEBUG = False` in production. Configure `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT`, and security middleware.
- Use Django's `User` model authentication system. Never implement custom password hashing.

## 5. Testing

- Use Django's `TestCase` and `APIClient` (DRF) for unit and integration tests.
- Use **factory-boy** with **Faker** for generating test data.
- Run `python manage.py test` in CI. Use coverage.py to measure test coverage.
