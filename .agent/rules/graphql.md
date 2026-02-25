# GraphQL Development Guidelines

> Objective: Define standards for designing and consuming GraphQL schemas and APIs.

## 1. Schema Design

- Use descriptive, domain-driven names for types, fields, and operations. Use nouns for types (`User`, `Order`) and verb-phrases for mutations (`createUser`, `cancelOrder`).
- Add **descriptions** to every type, field, enum value, and input using SDL `"""docstring"""` syntax. The schema IS the contract and primary documentation.
- Design schemas around **client data needs**, not the backend database structure or existing REST endpoints. Start from the UI mockup, not the DB schema.
- Use **Input Types** for all mutation arguments — never use ad-hoc inline scalar arguments for multi-field inputs.
- Use **Relay Connections** (`Connection`, `Edge`, `PageInfo`) for paginated list fields rather than offset-based arrays. This enables cursor-based pagination that works efficiently even as data grows.

## 2. Queries & Mutations

- **Queries** MUST be idempotent and side-effect-free. Never perform writes inside a query resolver.
- Each **Mutation** should represent a single atomic business action. Return the mutated object (or a payload type) so the client can update its local cache without additional round trips.
- Structure complex mutations with a **payload wrapper**:

  ```graphql
  type CreateOrderPayload {
    order: Order
    errors: [UserError!]!
  }
  ```

- Avoid deeply nested mutations. Prefer flat, composable operations. Deeply nested mutations are hard to reason about transactionally.
- Use `@deprecated(reason: "...")` directive on fields being phased out. Remove deprecated fields only after tracking that zero clients use them via field usage analytics.

## 3. Error Handling

- Use a **Result Union / Payload pattern** for mutations: `union CreateUserResult = User | UserAlreadyExistsError | ValidationError`. This allows type-safe, exhaustive error handling with code generation.
- Reserve the top-level GraphQL `errors` array for unexpected, system-level errors (unauthenticated, server crash). Business-rule validation errors belong in the payload type.
- Define custom error types with descriptive fields: `type ValidationError { field: String! message: String! code: ErrorCode! }`.

## 4. Performance

- Implement **DataLoader** (or an equivalent batching library) for all database lookups within resolvers to automatically batch and deduplicate requests and prevent the N+1 problem.
- Set **query depth limits** and **query complexity limits** to prevent abusive or expensive queries. Use a library (`graphql-depth-limit`, `graphql-query-complexity`) to enforce limits.
- Use **persisted queries** (hashed query IDs) in production to prevent arbitrary query execution from untrusted clients and reduce payload sizes.
- Implement **field-level authorization** in resolvers — never expose fields that require permissions without checking them. Use a directive-based approach (`@auth(requires: ADMIN)`) for consistency.

## 5. Tooling & Versioning

- Commit the schema SDL (`schema.graphql`) to version control. Treat schema changes like API changes — they require a changelog entry and schema diff review.
- Use **GraphQL Code Generator** (`graphql-codegen`) to generate type-safe client hooks (React Query, Apollo) and server resolver types from the schema. Run in CI on schema changes.
- Use **Apollo Studio**, **Hive**, or **Stellate** for schema registry, field usage tracking, and schema change impact analysis.
- Enforce schema linting and breaking change detection with **`graphql-inspector`** or **`@graphql-eslint`** in CI. Block merges that introduce breaking changes without a major version bump.
