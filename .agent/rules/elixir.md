# Elixir Development Guidelines

> Objective: Define standards for building concurrent, fault-tolerant, and maintainable Elixir applications.

## 1. Functional Style

- Embrace immutability: all data in Elixir is immutable. Functions transform data and return new values — never mutate in place.
- Use the **pipe operator** (`|>`) to compose transformations into a readable, linear data flow. Keep pipeline stages simple and pure — each stage should do one thing well.
- Prefer **pattern matching** in function heads (`def handle(:ok, result)`) over `if/else` or `case` inside a function body for dispatching on different inputs.
- Use **guards** (`when is_integer(x) and x > 0`) in function heads and `case`/`cond` expressions for additional type and value dispatch logic.
- Use **structs** (`defstruct`) for structured data instead of plain maps when the shape is known and stable. Structs provide better documentation and compile-time checks.

## 2. OTP & Processes

- Model concurrent state and behavior as **GenServers**. Avoid storing state outside of process-managed structures.
- Use **Supervisors** and design supervision trees for fault tolerance. Embrace the "let it crash" philosophy — fix root causes in the error handler, not with defensive programming at every callsite.
- Never share in-process mutable state across processes. Use **message passing** (`send`/`receive`, `GenServer.call`/`cast`) for inter-process communication.
- Use **Task** for one-off concurrent work. Use **Task.Supervisor** to supervise async tasks and handle crashes gracefully.
- Use **Registry** or **pg** (process groups) for process discovery instead of hardcoded PIDs.

## 3. Phoenix & Ecto

- Keep **Phoenix Controllers** thin: delegate all business logic to **Context modules** (the domain layer). Controllers orchestrate; contexts contain logic.
- Use **Contexts** to group related business logic in a clean module API. Contexts expose a public interface; internal schemas and queries are private (`lib/myapp/accounts/user.ex`).
- Use **Ecto** for all database interactions. Use **changesets** for data validation and **Ecto queries** for structured, composable database access.
- Use **Ecto.Multi** for multi-step database operations that should succeed or fail atomically as a single unit.
- Use **Phoenix Channels** or **LiveView** for real-time features. Prefer LiveView over custom JavaScript for server-driven interactive UIs.

## 4. Code Style & Documentation

- Follow the community **Elixir Style Guide**. Enforce with **Credo** (linter) and `mix format` (formatter). Commit `.credo.exs` configuration.
- Use `snake_case` for variables, function names, and module attributes. `PascalCase` for module names.
- Document all public functions with `@doc` and all modules with `@moduledoc`. Add **typespecs** (`@spec`) to all public function signatures.
- Use `@type` and `@opaque` to define domain types inside modules. This improves documentation and Dialyzer precision.
- Run **Dialyzer** (`dialyxir`) in CI for gradual static type checking. Address all Dialyzer warnings.

## 5. Testing & Tooling

- Use **ExUnit** for all tests. Organize tests with `describe` blocks and descriptive test names.
- Use **Mox** for mocking **behaviours** (explicitly defined interfaces). Define behaviours for all external dependencies to enable easy substitution in tests.
- Use `Ecto.Adapters.SQL.Sandbox` for database isolation in tests — each test runs in a transaction that is rolled back automatically after the test.
- Run `mix test --cover` in CI. Use `mix credo --strict` for linting. Run `mix dialyzer` for type checking.
- Use **ExMachina** for test data factories as an alternative to manual fixture creation.
