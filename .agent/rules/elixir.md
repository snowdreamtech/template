# Elixir Development Guidelines

> Objective: Define standards for building concurrent, fault-tolerant, and maintainable Elixir applications, covering functional style, OTP patterns, Phoenix/Ecto, code quality, and testing.

## 1. Functional Style & Idioms

### Immutability & Pure Functions

- Embrace immutability: all Elixir data is immutable. Functions transform and return new values — they never mutate in place. Design functions to be pure (output depends only on input, no side effects) wherever possible.
- Use the **pipe operator** (`|>`) to compose transformations into a readable, linear data flow. Each stage should be a single, focused pure function:

  ```elixir
  # ✅ Readable pipeline — data flows left to right
  result =
    raw_params
    |> Map.take([:name, :email, :role])
    |> AtomValidator.validate()
    |> Accounts.create_user()
    |> handle_response()

  # ❌ Nested — harder to follow
  result = handle_response(Accounts.create_user(AtomValidator.validate(Map.take(raw_params, [:name, :email, :role]))))
  ```

### Pattern Matching

- Use **pattern matching in function heads** to dispatch on different inputs instead of `if/else` chains inside a function body:

  ```elixir
  # ✅ Pattern matching in function heads
  def process({:ok, %{status: "active"} = user}), do: send_welcome_email(user)
  def process({:ok, %{status: "inactive"}}),       do: :skipped
  def process({:error, reason}),                   do: log_error(reason)

  # ❌ Avoid — puts dispatch logic inside the function
  def process(result) do
    case result do
      {:ok, user} -> if user.status == "active", do: send_welcome_email(user)
      {:error, reason} -> log_error(reason)
    end
  end
  ```

- Use **guards** (`when is_integer(x) and x > 0`) in function heads and `case`/`cond` expressions for type and value dispatch:
  ```elixir
  def divide(_, 0), do: {:error, :division_by_zero}
  def divide(a, b) when is_number(a) and is_number(b), do: {:ok, a / b}
  ```

### Structs & Data Modeling

- Use **`defstruct`** for structured data with known, documented fields. Prefer structs over plain maps when the data shape is stable:

  ```elixir
  defmodule Accounts.User do
    @enforce_keys [:id, :email]
    defstruct [:id, :email, :name, role: :viewer, inserted_at: nil]

    @type t :: %__MODULE__{
      id:          integer(),
      email:       String.t(),
      name:        String.t() | nil,
      role:        :admin | :editor | :viewer,
      inserted_at: DateTime.t() | nil,
    }
  end
  ```

- Use `@enforce_keys` to require critical fields at struct construction time.

## 2. OTP & Process Design

### GenServer

- Model concurrent, stateful behavior as **GenServer** processes. Avoid global mutable state outside of process-managed structures:

  ```elixir
  defmodule MyApp.Counter do
    use GenServer

    def start_link(initial), do: GenServer.start_link(__MODULE__, initial, name: __MODULE__)

    def increment(amount \\ 1), do: GenServer.cast(__MODULE__, {:incr, amount})
    def value,                  do: GenServer.call(__MODULE__, :value)

    @impl true
    def init(initial), do: {:ok, initial}

    @impl true
    def handle_cast({:incr, amount}, state), do: {:noreply, state + amount}

    @impl true
    def handle_call(:value, _from, state), do: {:reply, state, state}
  end
  ```

### Supervisors & Fault Tolerance

- Use **Supervisors** to build supervision trees. Define supervision strategies (`one_for_one`, `rest_for_one`, `one_for_all`) based on dependency relationships between workers.
- Embrace **"let it crash"** — write crash-resilient systems through Supervisor restarts rather than defensive `try/rescue` at every callsite. Fix root causes in error logs, not in defensive code surrounding every operation.
- Use **DynamicSupervisor** for dynamically starting supervised processes:
  ```elixir
  DynamicSupervisor.start_child(MyApp.WorkerSupervisor, {MyApp.Worker, job_id})
  ```

### Tasks & Async Patterns

- Use **`Task`** for one-off concurrent work. Use **`Task.Supervisor`** to supervise async tasks and handle crashes gracefully:
  ```elixir
  # Supervised async task
  task = Task.Supervisor.async(MyApp.TaskSupervisor, fn ->
    process_large_file(path)
  end)
  result = Task.await(task, 30_000)  # timeout in ms
  ```
- Use **`Task.async_stream`** for concurrent processing of a collection with concurrency control:
  ```elixir
  results =
    user_ids
    |> Task.async_stream(&fetch_user/1, max_concurrency: 10, timeout: 5000, on_timeout: :kill_task)
    |> Enum.to_list()
  ```
- Use **`Registry`** or **`pg`** (process groups) for dynamic process discovery instead of hardcoded PIDs or registered names:
  ```elixir
  {:ok, _} = Registry.register(MyApp.Registry, {:job, job_id}, self())
  [{pid, _}] = Registry.lookup(MyApp.Registry, {:job, job_id})
  ```

## 3. Phoenix & Ecto

### Phoenix Architecture

- Keep **Phoenix Controllers** thin — delegate all business logic to **Context modules**. Controllers orchestrate; contexts contain domain logic:
  ```elixir
  # ✅ Thin controller
  def create(conn, %{"user" => user_params}) do
    case Accounts.create_user(user_params) do
      {:ok, user}      -> conn |> put_status(201) |> render(:show, user: user)
      {:error, changeset} -> conn |> put_status(422) |> render(:error, changeset: changeset)
    end
  end
  ```
- Use **Contexts** to group related business logic behind a clean public interface. Keep internal schemas and queries private:
  ```text
  lib/myapp/
  ├── accounts/               # Accounts context
  │   ├── accounts.ex         # Public API: create_user/1, get_user!/1
  │   ├── user.ex             # Ecto schema (private-ish)
  │   └── user_query.ex       # Query builder (private)
  └── billing/                # Billing context
  ```

### Ecto

- Use **changesets** for all data validation — they provide a structured, composable way to validate, cast, and transform data:

  ```elixir
  defmodule Accounts.User do
    use Ecto.Schema
    import Ecto.Changeset

    schema "users" do
      field :name,  :string
      field :email, :string
      field :role,  Ecto.Enum, values: [:admin, :editor, :viewer], default: :viewer
      timestamps()
    end

    def changeset(user, attrs) do
      user
      |> cast(attrs, [:name, :email, :role])
      |> validate_required([:name, :email])
      |> validate_format(:email, ~r/@/)
      |> validate_length(:name, min: 1, max: 100)
      |> unique_constraint(:email)
    end
  end
  ```

- Use **`Ecto.Multi`** for multi-step database operations that must succeed or fail atomically:
  ```elixir
  Multi.new()
  |> Multi.insert(:user, User.changeset(%User{}, attrs))
  |> Multi.insert(:profile, fn %{user: user} -> Profile.changeset(%Profile{}, %{user_id: user.id}) end)
  |> Multi.run(:send_welcome, fn _repo, %{user: user} ->
    {:ok, Mailer.send_welcome(user)}
  end)
  |> Repo.transaction()
  ```
- Use **`Ecto.Query`** for structured, composable database access. Avoid `Repo.all(Model)` on large tables without pagination.

### Real-Time

- Use **Phoenix LiveView** for server-driven interactive UIs — prefer it over client-side JS for most interactivity in Phoenix apps.
- Use **LiveView Streams** (`stream/3`) for rendering large, efficiently-updated lists — only delta updates are sent to the client.
- Use **Broadway** for multi-stage concurrent data processing pipelines (Kafka, SQS, RabbitMQ).

## 4. Code Style & Documentation

- Follow the community **Elixir Style Guide**. Format all code with `mix format` (configured in `.formatter.exs`). Enforce in CI: `mix format --check-formatted`.
- Lint with **Credo**: `mix credo --strict`. Commit committed `.credo.exs` configuration to the repository.
- **Naming**: `snake_case` for variables, function names, modules attributes; `PascalCase` for module names; `?` suffix for predicate functions returning boolean; `!` suffix for functions that raise on error.
- Document all public functions with `@doc` and all modules with `@moduledoc`. Add **`@spec`** typespecs to all public function signatures:
  ```elixir
  @doc """
  Creates a new user account.
  Returns `{:ok, user}` on success or `{:error, changeset}` on validation failure.
  """
  @spec create_user(map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def create_user(attrs) do
    %User{} |> User.changeset(attrs) |> Repo.insert()
  end
  ```
- Run **Dialyzer** (`dialyxir`) in CI for gradual static type checking: `mix dialyzer --halt-exit-status`. Address all warnings — never `@dialyzer {:nowarn_function, ...}` without a documented justification.

## 5. Testing & Tooling

### ExUnit Tests

- Use **ExUnit** for all tests. Organize with `describe` blocks and descriptive test names:

  ```elixir
  defmodule AccountsTest do
    use MyApp.DataCase  # wraps each test in a transaction

    describe "create_user/1" do
      test "creates user with valid attributes" do
        assert {:ok, user} = Accounts.create_user(%{name: "Alice", email: "alice@example.com"})
        assert user.name == "Alice"
      end

      test "rejects duplicate email" do
        attrs = %{name: "Alice", email: "alice@example.com"}
        Accounts.create_user(attrs)
        assert {:error, changeset} = Accounts.create_user(attrs)
        assert %{email: ["has already been taken"]} = errors_on(changeset)
      end
    end
  end
  ```

- Use **Mox** to mock **behaviours** — define explicit interfaces (`@behaviour`) for all external dependencies:
  ```elixir
  # In test support:
  Mox.defmock(MyApp.EmailMock, for: MyApp.EmailBehaviour)
  expect(MyApp.EmailMock, :send_welcome, fn _user -> :ok end)
  ```
- Use **`Ecto.Adapters.SQL.Sandbox`** for database isolation — each test runs in a rolled-back transaction:
  ```elixir
  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(MyApp.Repo)
    unless tags[:async], do: Ecto.Adapters.SQL.Sandbox.mode(MyApp.Repo, {:shared, self()})
    :ok
  end
  ```
- Use **ExMachina** for test data factories. Define factories in `test/support/factory.ex`.

### CI Pipeline

- Run the full quality gate in CI:
  ```bash
  mix format --check-formatted  # formatting check
  mix credo --strict             # linting
  mix dialyzer --halt-exit-status # type checking
  mix test --cover               # tests + coverage
  ```
- Set minimum coverage threshold using the `ExCoveralls` library.
