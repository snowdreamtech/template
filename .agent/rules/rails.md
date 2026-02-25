# Ruby on Rails Development Guidelines

> Objective: Define standards for building productive, secure, and maintainable web applications with Rails, covering conventions, ActiveRecord, routing, security, background jobs, and testing.

## 1. Convention over Configuration

- Embrace Rails conventions rigorously. Use `rails generate` for all code generation. Follow standard naming conventions:
  - `UsersController` → `app/controllers/users_controller.rb`
  - `User` model → `app/models/user.rb`, `users` table
  - `users_path` URL helper, `@users` instance variable convention in controllers
- **Skinny Controllers, Fat Service Objects**: move all business logic out of controllers. Controllers should only: authorize the request, parse and permit params, call a service or model method, and render/redirect.
  ```ruby
  # ✅ Thin controller
  def create
    result = UserRegistrationService.new(user_params).call
    if result.success?
      redirect_to root_path, notice: "Welcome!"
    else
      @errors = result.errors
      render :new, status: :unprocessable_entity
    end
  end
  ```
- Use **Service Objects** (`app/services/`) for complex operations that span multiple models, external APIs, or require transactional coordination. Name them as actions: `UserRegistrationService`, `OrderFulfillmentService`.
- Use **Query Objects** (`app/queries/`) for complex ActiveRecord queries to keep models clean:

  ```ruby
  # app/queries/active_users_query.rb
  class ActiveUsersQuery
    def initialize(relation = User.all)
      @relation = relation
    end

    def call(subscribed_after:)
      @relation
        .where(active: true)
        .where(created_at: subscribed_after..)
        .order(created_at: :desc)
    end
  end
  ```

- Use **Concerns** (`ActiveSupport::Concern`) for shared behavior across models or controllers, but sparingly — overuse creates invisible coupling. Each concern should have a single clearly defined responsibility.
- Use **Form Objects** for multi-model forms or complex validations that don't map cleanly to a single model. Use **Presenters/Decorators** (Draper gem) for view-layer logic, keeping views and models clean.

## 2. ActiveRecord Best Practices

### Queries & Performance

- Use **scopes** (`scope :active, -> { where(active: true) }`) for reusable, chainable query logic. Chain scopes for composable data access: `User.active.premium.order(created_at: :desc)`.
- Use `includes()` (or `preload()`, `eager_load()`) to prevent N+1 queries. Always use **Bullet** gem in development to detect N+1 queries and unused eager loads at runtime:

  ```ruby
  # ❌ N+1 query
  User.all.each { |user| puts user.posts.count }

  # ✅ Eager loaded
  User.includes(:posts).all.each { |user| puts user.posts.size }
  ```

- Use `find_each` (batches of 1000) instead of `.all.each` for large datasets to avoid loading all records into memory.
- Use `select()` to fetch only the columns you need: `User.select(:id, :email, :name)`.

### Validations & Constraints

- Define ALL database constraints in migrations (NOT NULL, unique indexes, foreign keys with `on_delete: :cascade`) **AND** validate in the model for defense in depth:

  ```ruby
  # Migration
  add_column :users, :email, :string, null: false
  add_index :users, :email, unique: true

  # Model
  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  ```

- Use `find_by` (returns `nil` on missing) over `find` (raises `ActiveRecord::RecordNotFound`) for optional lookups. Use `find_by!` when you want the exception.
- Avoid `after_*` callbacks for side effects (sending emails, enqueuing jobs, calling external APIs). Use explicit service method calls — callbacks make code harder to test and reason about.
- Use `update_columns` (bypasses validations/callbacks) consciously. Always document why with a comment.

## 3. Routing & API Design

- Use Rails resourceful routing (`resources :users`) as the default. Only create custom named routes when there is a genuine reason that a standard resource action cannot accommodate.
- Namespace API routes with version prefixes:
  ```ruby
  # config/routes.rb
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create, :update, :destroy]
      resources :posts, only: [:index, :show, :create]
    end
  end
  ```
- Avoid nesting routes deeper than 2 levels. Use **shallow routes** (`shallow: true`) to automatically generate non-nested routes for member actions (show, edit, update, destroy):
  ```ruby
  resources :posts, shallow: true do
    resources :comments  # GET /posts/:post_id/comments, GET /comments/:id
  end
  ```
- Use `only:` or `except:` on resource declarations to expose exactly the routes your controller implements, preventing 404 routes from showing up in `rails routes`.
- For JSON APIs, consider `ActionController::API` as the base class — it strips middleware not needed for API-only apps (views, cookies, session).

## 4. Security

### Authentication & Authorization

- Use **Devise** for authentication or Rails 8's built-in authentication generator. Never implement custom password hashing (`bcrypt` with appropriate cost) or session management.
- Use **Pundit** or **CanCanCan** for authorization. Enforce authorization on every controller action — never rely on "hidden" UI to protect routes.
  ```ruby
  # Pundit — policy-based
  def update
    @post = Post.find(params[:id])
    authorize @post  # Raises Pundit::NotAuthorizedError if not allowed
    ...
  end
  ```
- Always use **Strong Parameters** — never use `.permit!`:
  ```ruby
  def user_params
    params.require(:user).permit(:name, :email, :bio)
    # ❌ Never: params[:user].permit!
  end
  ```

### Security Configuration

- Enable and configure **Content Security Policy** in `config/initializers/content_security_policy.rb`.
- Use `bundle audit` and **Brakeman** in CI as hard gates:
  ```bash
  bundle exec bundle-audit check --update  # checks for vulnerable gems
  bundle exec brakeman --exit-on-warn      # Rails-specific security analysis
  ```
- HTML output is automatically escaped by ERB. Use `raw` or `html_safe` only when absolutely required, and **never** with user-provided content.
- Enable `config.force_ssl = true` in production. Set `config.session_store :cookie_store, secure: true, httponly: true, same_site: :strict`.
- Use `rack-attack` for rate limiting and IP blocking to protect against brute-force and abuse.

## 5. Background Jobs, Testing & Operations

### Background Jobs

- Use **Sidekiq** (with Redis) for background jobs. Use **ActiveJob** as the adapter interface to stay queue-agnostic:

  ```ruby
  # app/jobs/send_welcome_email_job.rb
  class SendWelcomeEmailJob < ApplicationJob
    queue_as :default
    sidekiq_options retry: 3, dead: false

    def perform(user_id)
      user = User.find_by(id: user_id)
      return unless user  # safe: record may have been deleted
      UserMailer.welcome(user).deliver_now
    end
  end
  ```

- Set job timeouts and retry limits. Use Sidekiq Pro's batch/unique job features for idempotent bulk operations.
- Monitor the Sidekiq Web UI (`require 'sidekiq/web'`) behind authentication in production.

### Testing

- Use **RSpec** with `rails-rspec`, **FactoryBot** for test data, and **Capybara** with `selenium-webdriver` for feature (browser-level) tests:

  ```ruby
  RSpec.describe UserRegistrationService do
    let(:valid_params) { { name: "Alice", email: "alice@example.com" } }

    it "creates a user and sends a welcome email" do
      expect { described_class.new(valid_params).call }
        .to change(User, :count).by(1)
        .and have_enqueued_mail(UserMailer, :welcome)
    end
  end
  ```

- Use **FactoryBot** with `create_list`, `build_stubbed` (fastest, no DB), and `create` (involves DB). Prefer `build_stubbed` for unit tests.
- Use `VCR` or `WebMock` to stub external HTTP calls. Never make real network requests in CI.
- Run `bundle exec rspec --format progress` in CI. Use `rubocop`, `brakeman`, and `bundle audit` as separate CI gate steps.
- Use `db:schema:load` (not `db:migrate`) for setting up test databases from scratch — it is significantly faster and avoids migration accumulation issues.
- Aim for ≥ 80% test coverage on service objects and models. Use **SimpleCov** for coverage reporting.

### Operations & Observability

- Use **Rails application health checks** with `rails/health` (Rails 7.1+) at `GET /up` for load balancer readiness.
- Instrument with **OpenTelemetry** (`opentelemetry-ruby`) for distributed tracing across microservices or external API calls.
- Use **Lograge** to replace Rails' multi-line request logs with single JSON log lines:
  ```ruby
  config.lograge.enabled = true
  config.lograge.formatter = Lograge::Formatters::Json.new
  ```
- Monitor N+1 queries in production with **rack-mini-profiler** (development) and **Scout APM** or **Datadog** (production). Set up alerts on slow database queries exceeding 100ms.
