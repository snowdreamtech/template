# Ruby on Rails Development Guidelines

> Objective: Define standards for building productive, secure, and maintainable web applications with Rails.

## 1. Convention over Configuration

- Embrace Rails conventions rigorously. Use `rails generate` for all scaffolding. Follow standard naming conventions: `UsersController`, `User` model, `users` table, `users_path` helper.
- Keep **skinny controllers, fat service objects**: move business logic out of controllers. Controllers should only: authenticate, authorize, parse params, call a service, and render/redirect.
- Use **Service Objects** (plain Ruby classes in `app/services/`) for complex operations that span multiple models. Use **form objects** for multi-model or complex forms. Use **presenters/decorators** (Draper) for view-layer logic.
- Use **Concerns** (`ActiveSupport::Concern`) for shared behavior across models or controllers, but sparingly — overuse creates invisible coupling and makes code harder to trace.
- Use **Query Objects** (`app/queries/`) for complex ActiveRecord queries to keep models clean.

## 2. ActiveRecord

- Use **scopes** (`scope :active, -> { where(active: true) }`) for reusable, chainable query logic.
- Use `includes()` to eager-load associations and prevent N+1 queries. Detect N+1 queries with the **Bullet** gem in development.
- Define ALL database constraints in migrations (NOT NULL, unique indexes, foreign keys) AND validate in model (`validates :email, presence: true, uniqueness: true`) for defense in depth.
- Use `find_by` (returns `nil`) over `find` (raises `ActiveRecord::RecordNotFound`) unless you intentionally want an exception on missing records.
- Use `update_columns` (skips validations/callbacks) only when deliberately bypassing them — document why in a comment.
- Avoid using `after_*` callbacks for side effects (sending emails, enqueuing jobs). Use explicit service method calls instead.

## 3. Routing

- Use Rails resourceful routing (`resources :users`). Avoid custom routes when a standard resource action (`index`, `show`, `new`, `create`, `edit`, `update`, `destroy`) suffices.
- Namespace API routes: `namespace :api do; namespace :v1 do; resources :users; end; end`.
- Avoid nesting routes deeper than 2 levels. Use **shallow routes** (`shallow: true`) or restructure to avoid deep nesting.
- Use `only:` or `except:` to expose only the routes your controller actually implements.

## 4. Security

- Always use **Strong Parameters** (`params.require(:user).permit(:name, :email)`) in controllers. Never use `.permit!`.
- Enable and configure **Content Security Policy** via `config/initializers/content_security_policy.rb`. Test it with a CSP report endpoint.
- Use `bundle audit` and `brakeman` in CI to catch vulnerable gems and Rails-specific security issues.
- HTML output is automatically escaped by ERB — use `raw` and `html_safe` only when absolutely necessary, and **never** with user-provided content.
- Use **Devise** for authentication or Rails 8's built-in authentication generator. Never implement custom password hashing or session management.
- enable `config.force_ssl = true` in production. Set `config.session_store :cookie_store, secure: true, httponly: true`.

## 5. Testing & Operations

- Use **RSpec** with `rails-rspec`, **FactoryBot** for test data, and **Capybara** for feature (browser) tests.
- Use `VCR` or `WebMock` to stub external HTTP calls. Never make real network requests in CI.
- Use **Sidekiq** (with Redis) for background jobs. Use **ActiveJob** as the interface to stay queue-agnostic. Set job timeouts and retry limits.
- Run `bundle exec rspec --format progress` in CI. Use `rubocop`, `brakeman`, and `bundle audit` as separate CI steps.
- Use `db:schema:load` (not `db:migrate`) for setting up test databases from scratch for speed.
