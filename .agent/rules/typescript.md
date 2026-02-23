# TypeScript Development Guidelines

> Objective: Define standards for strongly-typed, safe, and maintainable TypeScript code.

## 1. Configuration

- Use `strict: true` in `tsconfig.json`. This enables `strictNullChecks`, `noImplicitAny`, and other critical checks. Do not disable strict mode.
- Enable `noUnusedLocals`, `noUnusedParameters`, and `noImplicitReturns` for cleaner code.
- Commit `tsconfig.json` to version control.

## 2. Typing

- **Avoid `any`**: Never use `any` except as a last resort for untypable third-party interop. Use `unknown` for truly unknown values and narrow the type before use.
- **Prefer `interface` for object shapes** and `type` for unions, intersections, and aliases of primitives.
- **Explicit return types**: Annotate the return type of all non-trivial exported functions explicitly.
- **Non-null assertions**: Avoid the `!` non-null assertion operator. Instead, use proper null-checks or early returns.

## 3. Generics

- Use generics to write reusable, type-safe functions and components.
- Give generic type parameters descriptive names beyond single letters when context warrants it (e.g., `TEntity`, `TResponse`).

## 4. Enums & Const

- Prefer `const` object literals with `as const` over `enum` for simple string unions — they are more predictable at runtime.
- Use `enum` only when you need bidirectional mapping or a clear enumeration of discrete values.

## 5. Code Quality

- Lint with `@typescript-eslint`. Enforce `@typescript-eslint/no-explicit-any` and `@typescript-eslint/consistent-type-imports`.
- Use `import type { ... }` for type-only imports to ensure they are erased at compile time.
- Run `tsc --noEmit` in CI to catch type errors without producing output.
