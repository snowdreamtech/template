# GraphQL Development Guidelines

> Objective: Define standards for designing and consuming GraphQL schemas and APIs.

## 1. Schema Design

- Use descriptive, domain-driven names for types, fields, and operations. Prefer nouns for types (`User`, `Order`) and verbs for mutations (`createUser`, `cancelOrder`).
- Add descriptions to every type, field, and enum value in the schema using the SDL `"""..."""` syntax.
- Design schemas around the **client's data needs**, not the backend's database structure.

## 2. Queries & Mutations

- **Queries**: Keep queries idempotent and side-effect-free.
- **Mutations**: Each mutation should represent a single, atomic business action. Return the mutated object (or a union of success/error) so the client can update its cache.
- Avoid deeply nested mutations; prefer flat, direct mutations.

## 3. Error Handling

- Use a **Result Union** pattern for mutations: `union CreateUserResult = User | UserAlreadyExistsError | ValidationError`.
- Reserve top-level GraphQL `errors` array for unexpected, system-level errors (e.g., server crash). Business errors belong in the result union.

## 4. Performance

- Implement **DataLoader** (or equivalent) for all database lookups within resolvers to automatically batch and cache requests and prevent the N+1 query problem.
- Set query complexity and depth limits to prevent abusive queries.
- Avoid over-fetching in resolvers; only query the database for fields that are actually requested.

## 5. Tooling

- Version and validate your schema using SDL files committed to version control.
- Use code generation tools (e.g., GraphQL Code Generator) to generate type-safe client hooks and server types from the schema.
