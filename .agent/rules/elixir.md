# Elixir Development Guidelines

> Objective: Define standards for building concurrent, fault-tolerant, and maintainable Elixir applications.

## 1. Functional Style

- Embrace immutability: all data in Elixir is immutable. Functions transform data and return new values.
- Use the **pipe operator** (`|>`) to compose transformations into a readable, linear data flow.
- Prefer pattern matching in function heads over complex `if/case` expressions inside a function body.
- Use **guards** (`when is_integer(x)`) in function heads and `case` expressions for additional dispatch logic.

## 2. Processes & OTP

- Model concurrent state and behavior as **GenServers**. Avoid storing state in global variables.
- Use **Supervisors** to manage process lifecycles. Design supervision trees for fault tolerance ("let it crash" philosophy).
- Never share in-process mutable state across processes. Use message passing (`send`/`receive`, `GenServer.call`/`cast`) for inter-process communication.

## 3. Phoenix (if applicable)

- Keep **Controllers** thin: delegate business logic to context modules (the domain layer).
- Use **Contexts** to group related business logic and expose a clean API to the web layer.
- Use **Ecto** for all database interactions. Use changesets for data validation and Ecto queries for database access.

## 4. Code Style

- Follow the community **Elixir Style Guide**. Enforce with **Credo** (linter) and **mix format** (formatter).
- Use `snake_case` for variables, function names, and atom keys. Use `PascalCase` for modules.
- Document all public functions with `@doc` and `@spec` typespecs.

## 5. Testing

- Use **ExUnit** for all tests.
- Use `Mox` for mocking external dependencies defined via behaviours.
- Run `mix test` and `mix credo` in CI.
