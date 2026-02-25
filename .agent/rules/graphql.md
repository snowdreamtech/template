# GraphQL Development Guidelines

> Objective: Define standards for designing and consuming GraphQL schemas and APIs, covering schema design, query/mutation patterns, error handling, performance, and tooling.

## 1. Schema Design

### Naming & SDL Conventions

- Use descriptive, **domain-driven names**. Use nouns for types (`User`, `Order`, `Product`), verb-phrases for mutations (`createUser`, `cancelOrder`, `updateProfile`), and noun-phrases for queries (`user`, `users`, `searchProducts`).
- Add **descriptions** to every type, field, enum value, and input type using SDL `"""docstring"""` syntax. The schema IS the primary API contract and documentation:

  ```graphql
  """
  A registered user account in the system.
  """
  type User {
    """
    Unique identifier (UUID v4).
    """
    id: ID!

    """
    Email address — must be unique across all accounts.
    """
    email: String!

    """
    Display name set by the user.
    """
    name: String

    """
    Account status. Inactive users cannot log in.
    """
    status: UserStatus!

    """
    Orders placed by this user, sorted by date descending.
    """
    orders(first: Int = 10, after: String): OrderConnection!
  }
  ```

- Design schemas around **client data needs**, not backend database structure or existing REST endpoints. Start from UI requirements and work backward.

### Type Design Principles

- Use **Input Types** for all mutation arguments — never use ad-hoc inline scalar arguments for multi-field inputs:

  ```graphql
  # ❌ Ad-hoc scalars — not reusable, not documented
  mutation createUser($name: String!, $email: String!, $role: String) { ... }

  # ✅ Input type — reusable, self-documenting
  input CreateUserInput {
    name:  String!
    email: String!
    role:  UserRole = VIEWER
  }
  mutation createUser(input: CreateUserInput!): CreateUserPayload!
  ```

- Use **Relay Connections** for all paginated list fields — enabling cursor-based pagination that performs well on large datasets:

  ```graphql
  type Query {
    users(first: Int, after: String, last: Int, before: String, filter: UserFilter): UserConnection!
  }

  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type UserEdge {
    node: User!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  ```

- Use `@deprecated(reason: "...")` on fields being phased out. Track field usage analytics (Apollo Studio, Hive) and remove deprecated fields only after verifying zero clients use them.

## 2. Queries & Mutations

### Queries

- Queries MUST be **idempotent and side-effect-free**. Never perform writes (DB updates, sends, etc.) inside a query resolver.
- Design queries to be **composition-friendly**: allow clients to request exactly the data they need across related types in a single operation.
- Use **field arguments** for filtering, sorting, and search. Define reusable input types for common filter patterns:

  ```graphql
  type Query {
    products(filter: ProductFilter, orderBy: ProductOrderBy = CREATED_AT_DESC, first: Int = 20, after: String): ProductConnection!
  }

  input ProductFilter {
    status: ProductStatus
    categoryId: ID
    minPrice: Float
    maxPrice: Float
    searchQuery: String
  }
  ```

### Mutations

- Each mutation should represent a **single atomic business action** and return the mutated object (or a payload type) so the client can update the local cache without additional round trips.
- Use **payload wrapper types** for all mutations to support structured error returns and future extensibility:

  ```graphql
  type Mutation {
    createOrder(input: CreateOrderInput!): CreateOrderPayload!
    cancelOrder(id: ID!, reason: String): CancelOrderPayload!
  }

  type CreateOrderPayload {
    order: Order # null on error
    errors: [UserError!]! # always present (empty on success)
  }

  type UserError {
    field: String # null for non-field errors
    message: String!
    code: UserErrorCode!
  }
  ```

- Avoid deeply nested mutations — they are hard to reason about transactionally. Prefer flat, composable operations.

## 3. Error Handling

### Error Classification

- Use **Result Union or Payload pattern** for mutations — provides type-safe, exhaustive error handling with code generation:

  ```graphql
  union CreateUserResult = User | UserAlreadyExistsError | UserValidationError

  type Query {
    # Queries may also return union results for not-found
    user(id: ID!): UserResult!
  }
  union UserResult = User | UserNotFoundError
  ```

- Reserve the **top-level GraphQL `errors` array** for unexpected, system-level errors (unauthenticated, server 500). Business-rule validation errors belong in the payload type's `errors` field.
- Define custom error types with descriptive fields and machine-readable codes:

  ```graphql
  type UserAlreadyExistsError implements Error {
    message: String!
    code: ErrorCode!
    email: String! # which email caused the conflict
  }

  interface Error {
    message: String!
    code: ErrorCode!
  }
  ```

## 4. Performance

### N+1 Problem Prevention

- Implement **DataLoader** for all database lookups within resolvers — it batches and deduplicates queries automatically:

  ```typescript
  // Node.js with DataLoader
  const userLoader = new DataLoader<string, User>(async (userIds) => {
    const users = await db.user.findMany({ where: { id: { in: userIds as string[] } } });
    return userIds.map((id) => users.find((u) => u.id === id) ?? new Error(`User ${id} not found`));
  });

  // In resolver:
  const order = {
    user: (parent: Order) => userLoader.load(parent.userId),
  };
  ```

### Query Complexity & Security

- Set **query depth limits** and **query complexity limits** to prevent abusive or expensive queries. Enforce in the schema middleware layer:

  ```typescript
  import depthLimit from "graphql-depth-limit";
  import costAnalysis from "graphql-cost-analysis";

  validationRules: [depthLimit(7), costAnalysis({ maximumCost: 1000, defaultCost: 1 })];
  ```

- Use **persisted queries** (hashed query IDs sent instead of full query text) in production to:
  - Prevent arbitrary query execution from untrusted clients
  - Dramatically reduce request payload sizes
  - Enable CDN caching of GET-based queries
- Implement **field-level authorization** in resolvers — never expose protected fields without checking permissions. Use a directive-based approach for consistency:

  ```graphql
  type User {
    email: String! @auth(requires: SELF_OR_ADMIN)
    ssn: String @auth(requires: ADMIN)
    name: String!
  }
  ```

### Federation & Microservices

- For microservice architectures, use **Apollo Federation v2** or **GraphQL Mesh** to compose a supergraph from multiple downstream subgraph services without duplicating schema definitions.

## 5. Tooling & Schema Evolution

### Schema Registry

- Commit the schema SDL (`schema.graphql`) to version control. Treat schema changes with the same care as database migrations — they require a changelog entry and schema diff review in PRs.
- Use **Apollo Studio**, **Hive** (open-source), or **Stellate** for:
  - Schema registry and versioning
  - Field usage tracking (which fields are used by which clients)
  - Schema change impact analysis before deployment

### Code Generation

- Use **GraphQL Code Generator** to generate type-safe code from the schema:

  ```yaml
  # codegen.yml
  generates:
    src/generated/graphql.ts:
      plugins: [typescript, typescript-resolvers]
    src/graphql/hooks.ts: # for React clients
      plugins: [typescript, typescript-operations, typescript-react-query]
  ```

  Run in CI: `graphql-codegen --check` to fail if generated code is out of sync with the schema.

### Schema Linting & Breaking Changes

- Enforce schema linting and breaking change detection with **`graphql-inspector`** or **`@graphql-eslint`** in CI. Block merges that introduce breaking changes:

  ```bash
  # Detect breaking changes between branches
  graphql-inspector diff schema.graphql origin/main:schema.graphql

  # Lint SDL files
  graphql-inspector validate schema.graphql
  ```

  Breaking changes include: removing types/fields, changing field types, making nullable fields non-null, removing enum values.

- Monitor resolver-level performance in production using **Apollo Tracing** or `graphql-parse-resolve-info` to profile which fields contribute to slow operation latency.
