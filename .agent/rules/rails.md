# Ruby on Rails Development Guidelines

> Objective: Define standards for building productive, secure, and maintainable web applications with Rails.

## 1. Convention over Configuration

- Embrace Rails conventions rigorously. Use `rails generate` for all scaffolding. Follow standard naming: `UsersController`, `User` model, `users` table, `users_path` helper.
- Keep **fat models, skinny controllers**: move business logic out of controllers into models, service objects, or concerns.
- Use **Service Objects** (plain Ruby classes in `app/services/`) for complex operations that span multiple models.

## 2. ActiveRecord

- Use **scopes** (`scope :active, -> { where(active: true) }`) for reusable query logic. Chain scopes rather than writing one-off queries in controllers.
- Always use `find_by` (returns `nil`) over `find` (raises `RecordNotFound`) unless you explicitly want the error.
- Use `includes()` to eager-load associations and prevent N+1 queries. Verify with **Bullet** gem in development.
- Define all database constraints in migrations AND in model validations for defense in depth.

## 3. Routing

- Use Rails resourceful routing (`resources :users`). Avoid custom routes unless truly necessary.
- Namespace API routes: `namespace :api do; namespace :v1 do; resources :users; end; end`.
- Avoid deep nesting (more than 2 levels). Use shallow resources instead.

## 4. Security

- Always use **Strong Parameters** (`params.require(:user).permit(:name, :email)`) in controllers.
- Enable **Content Security Policy** via `config/initializers/content_security_policy.rb`.
- Use `bundle audit` and `brakeman` in CI to catch vulnerable gems and security code issues.
- HTML output is automatically escaped by ERB. Use `raw` and `html_safe` only when absolutely necessary, and never with user-provided content.

## 5. Testing

- Use **RSpec** with `rails-rspec` helper, **FactoryBot** for fixtures, and **Capybara** for feature (browser) tests.
- Use `VCR` or `WebMock` to stub external HTTP calls in tests.
- Run `bundle exec rspec` in CI.
