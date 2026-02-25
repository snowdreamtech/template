# Django Development Guidelines

> Objective: Define standards for building secure, scalable, and maintainable Django applications, covering project structure, models, views, security, testing, and async task processing.

## 1. Project Structure & Settings

### App-Based Organization

- Follow Django's **app-based structure**. Each app encapsulates a single domain concept: `users`, `orders`, `products`, `payments`.
- Keep apps **loosely coupled** — apps MUST NOT import from each other's internal modules. Use signals, shared `core/` utilities, or service objects for cross-app communication.
- Organize large apps with subdirectories:

  ```text
  myapp/
  ├── migrations/
  ├── management/
  │   └── commands/
  │       └── seed_data.py
  ├── templates/
  │   └── myapp/
  ├── tests/
  │   ├── test_models.py
  │   ├── test_views.py
  │   └── factories.py
  ├── models.py           # or models/ directory for large apps
  ├── views.py
  ├── urls.py
  ├── serializers.py      # DRF serializers
  ├── services.py         # Business logic service functions/classes
  └── admin.py
  ```

- For platform-level shared utilities, create a `core/` app: `core/models.py` (abstract base models), `core/permissions.py`, `core/exceptions.py`.

### Settings Management

- Use a **settings package** with `base.py`, `dev.py`, `staging.py`, `production.py`:

  ```python
  # settings/base.py
  from pathlib import Path
  import environ

  env = environ.Env(DEBUG=(bool, False))
  environ.Env.read_env()  # reads .env in project root

  BASE_DIR = Path(__file__).resolve().parent.parent
  SECRET_KEY = env("SECRET_KEY")
  DEBUG = env("DEBUG")
  DATABASES = {"default": env.db()}
  ```

- Use **`django-environ`** or **`environs`** for environment variable parsing and type coercion. Never hardcode secrets — always load from environment variables.
- Set `DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'` in `base.py` for consistent 64-bit integer primary keys.

## 2. Models & Database

- Define **`__str__`** methods on every model for readable admin, shell, and log representations:

  ```python
  class User(AbstractUser):
      def __str__(self) -> str:
          return f"{self.get_full_name()} <{self.email}>"
  ```

- Use `select_related()` (for FK/OneToOne) and `prefetch_related()` (for M2M and reverse FK) to prevent **N+1 queries**. Profile with `django-debug-toolbar` or `silk` during development:

  ```python
  # ❌ N+1 — one query per user
  orders = Order.objects.filter(status="pending")
  for o in orders:
      print(o.user.email)

  # ✅ 2 queries total
  orders = Order.objects.filter(status="pending").select_related("user")
  ```

- **Migrations**: Always commit all migrations. Never modify an applied migration. Run `python manage.py check` and `python manage.py showmigrations` before deploying:

  ```bash
  python manage.py makemigrations --check        # fail if unapplied migration changes exist
  python manage.py migrate --check               # fail if unapplied migrations exist (production)
  ```

- Add `db_index=True` to fields frequently used in `.filter()`, `.order_by()`, or `.get()`. Use `UniqueConstraint` for multi-column uniqueness:

  ```python
  class Meta:
      constraints = [
          models.UniqueConstraint(fields=["tenant", "email"], name="uq_tenant_email"),
      ]
      indexes = [
          models.Index(fields=["status", "created_at"], name="ix_order_status_created"),
      ]
  ```

- Use `Meta.ordering` sparingly — it adds an implicit `ORDER BY` to all QuerySets for the model, which can be an unexpected performance hit.

## 3. Views, APIs & Serialization

### Class-Based Views & DRF

- Use **Class-Based Views (CBVs)** for standard CRUD. Use **Function-Based Views (FBVs)** for simple, one-off endpoints or when CBV inheritance becomes confusing.
- Use **Django REST Framework (DRF)** for all API development:

  ```python
  # serializers.py
  from rest_framework import serializers

  class CreateOrderSerializer(serializers.Serializer):
      product_id = serializers.UUIDField()
      quantity   = serializers.IntegerField(min_value=1, max_value=999)

  class OrderSerializer(serializers.ModelSerializer):
      class Meta:
          model = Order
          fields = ["id", "status", "total", "created_at"]
          read_only_fields = ["id", "status", "created_at"]
  ```

- Use **DRF ViewSets** with routers for rapid RESTful CRUD. Use `@action` for custom resource operations:

  ```python
  class OrderViewSet(viewsets.ModelViewSet):
      serializer_class = OrderSerializer
      permission_classes = [IsAuthenticated]

      def get_queryset(self):
          return Order.objects.filter(user=self.request.user).select_related("product")

      @action(detail=True, methods=["post"], url_path="cancel")
      def cancel(self, request, pk=None):
          order = self.get_object()
          cancel_order(order)
          return Response({"status": "cancelled"})
  ```

- Use **service functions** or service classes for business logic. Keep views thin — a view should validate, delegate to service, and serialize:

  ```python
  def cancel_order(order: Order) -> None:
      """Cancel a pending order and process refund."""
      if order.status != "pending":
          raise ValidationError("Only pending orders can be cancelled")
      order.status = "cancelled"
      order.save(update_fields=["status", "updated_at"])
      process_refund.delay(order.id)  # Celery async task
  ```

- Name all URL patterns (`name="order-detail"`). Use `reverse("order-detail", kwargs={"pk": pk})` or `{% url %}` — never hardcode paths.

## 4. Security

### Authentication & Session Security

- Enable **`django-axes`** or **rate limiting** on authentication endpoints to prevent brute-force attacks.
- Use Django's built-in `AbstractUser` or `AbstractBaseUser`. Never implement custom password hashing — use `set_password()` which defaults to PBKDF2. Upgrade to **Argon2** for new projects:

  ```python
  # settings/base.py
  PASSWORD_HASHERS = ["django.contrib.auth.hashers.Argon2PasswordHasher", ...]
  ```

- Set **secure cookie flags** in production:

  ```python
  # settings/production.py
  SESSION_COOKIE_SECURE   = True
  SESSION_COOKIE_HTTPONLY = True
  SESSION_COOKIE_SAMESITE = "Lax"
  CSRF_COOKIE_SECURE      = True
  ```

### SQL & CSRF Security

- Use Django's ORM for all database queries. **Never interpolate user input** into raw SQL:

  ```python
  # ❌ SQL injection
  cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")

  # ✅ Parameterized
  cursor.execute("SELECT * FROM users WHERE email = %s", [email])
  ```

- **Never disable CSRF protection** (do not add `CsrfViewMiddleware` exceptions without explicit security review).

### Production Hardening

- Set `DEBUG = False` in production. Configure:

  ```python
  ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
  SECURE_SSL_REDIRECT              = True
  SECURE_HSTS_SECONDS              = 31536000  # 1 year
  SECURE_HSTS_INCLUDE_SUBDOMAINS   = True
  SECURE_HSTS_PRELOAD              = True
  SECURE_CONTENT_TYPE_NOSNIFF      = True
  X_FRAME_OPTIONS                  = "DENY"
  ```

- Run `python manage.py check --deploy` in CI to catch insecure settings.

## 5. Testing, Tooling & Async Tasks

### Testing

- Use **`pytest-django`** with the `@pytest.mark.django_db` fixture for modern, composable tests. Prefer over `unittest.TestCase`:

  ```python
  import pytest
  from tests.factories import UserFactory, OrderFactory

  @pytest.mark.django_db
  class TestOrderAPI:
      def test_cancel_order_success(self, api_client):
          user = UserFactory()
          order = OrderFactory(user=user, status="pending")
          api_client.force_authenticate(user)

          response = api_client.post(f"/api/orders/{order.id}/cancel/")

          assert response.status_code == 200
          order.refresh_from_db()
          assert order.status == "cancelled"

      def test_cancel_non_pending_order_fails(self, api_client):
          user = UserFactory()
          order = OrderFactory(user=user, status="completed")
          api_client.force_authenticate(user)

          response = api_client.post(f"/api/orders/{order.id}/cancel/")
          assert response.status_code == 400
  ```

- Use **`factory-boy`** + **`Faker`** for test data. Define factories in `tests/factories.py`:

  ```python
  import factory

  class UserFactory(factory.django.DjangoModelFactory):
      class Meta:
          model = User
      username = factory.Sequence(lambda n: f"user{n}")
      email    = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
  ```

- Use `pytest-cov` for coverage. Set `--cov-fail-under=80`. Run `bandit -r .` for security linting.
- Use **Testcontainers** for integration tests requiring a real PostgreSQL or Redis instance.

### Type Checking

- Use **`django-stubs`** with `mypy` for type-safe QuerySet, model, and form checking:

  ```ini
  # mypy.ini
  [mypy]
  plugins = mypy_django_plugin.main

  [mypy.plugins.django-stubs]
  django_settings_module = config.settings.test
  ```

  Add `django-stubs[compatible-mypy]` to dev dependencies. Run `mypy .` in CI.

### Celery Async Tasks

- Use **Celery** with Redis or RabbitMQ broker for asynchronous task processing. Never perform slow operations (emails, API calls, PDF generation) synchronously in views:

  ```python
  # tasks.py
  from celery import shared_task

  @shared_task(bind=True, max_retries=3, default_retry_delay=60, acks_late=True)
  def send_order_confirmation(self, order_id: int) -> None:
      """Send order confirmation email. Idempotent — safe to retry."""
      order = Order.objects.select_related("user").get(id=order_id)
      try:
          email_service.send_confirmation(order)
      except EmailServiceError as exc:
          raise self.retry(exc=exc)
  ```

  Tasks MUST be **idempotent** — assume they may execute more than once due to retries or at-least-once delivery.

- Use **`django-celery-results`** to store task results in the database. Use **`django-celery-beat`** for periodic task scheduling via the admin interface.
