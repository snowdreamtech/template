# TypeScript Development Guidelines

> Objective: Define standards for strongly-typed, safe, and maintainable TypeScript code.

## 1. Configuration

- Use `strict: true` in `tsconfig.json`. This enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and other critical checks. Never disable strict mode.
- Enable additional safety flags: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`.
- Use `"moduleResolution": "bundler"` (TS 5.0+) or `"node16"` to align with modern package resolution.
- Commit `tsconfig.json` and any extended `tsconfig.*.json` to version control. Document the purpose of each tsconfig variant.
- Run `tsc --noEmit` in CI to catch type errors without producing output.

## 2. Type System Best Practices

- **Avoid `any`**: Never use `any` except as a last resort for untypable third-party interop. Use `unknown` for truly unknown values and narrow the type before use with `typeof`, `instanceof`, or type guards.
- **Prefer `interface` for object shapes** used as contracts (extendable). Use `type` for unions, intersections, mapped types, and aliases of primitives.
- **Explicit return types**: Annotate the return type of all exported/public functions explicitly. Inferred return types are acceptable for private/local functions.
- **Non-null assertions**: Avoid the `!` non-null assertion operator. Use proper null-checks, optional chaining `?.`, or nullish coalescing `??` instead.
- **Narrowing**: Use type guards (`isString()`, `hasOwnProperty()`), `in` operator, and discriminated unions to narrow types safely. Use `satisfies` operator (TS 4.9+) for validating expressions without widening the type.

## 3. Generics

- Use generics to write reusable, type-safe functions, classes, and components.
- Give generic type parameters descriptive names beyond single letters when context warrants it: `TEntity`, `TResponse`, `TError`.
- Constrain generics with `extends` to enforce shape requirements: `function merge<T extends object, U extends object>(a: T, b: U)`.
- Prefer `readonly` modifiers on generic parameters used as immutable inputs: `function sort<T>(items: readonly T[]): T[]`.
- Use `infer` in conditional types to extract sub-types: `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never`.
- Use **Template Literal Types** for string pattern constraints (e.g., `type EventName = \`on${Capitalize<string>}\``) — very useful for event systems and strongly-typed CSS class name utilities.

## 4. Enums, Constants & Utility Types

- Prefer `const` object literals with `as const` over `enum` for simple string/number unions — they are more predictable at runtime and tree-shakeable.
- Use `enum` only when bidirectional mapping (value ↔ key) is needed or for a clear, finite enumeration of discrete values.
- Leverage built-in utility types: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>`, `ReturnType<F>`, `Parameters<F>`.
- Create domain-specific utility types for repeated patterns: `type Maybe<T> = T | null | undefined`.

## 5. Code Quality & Tooling

- Lint with **`@typescript-eslint`** plugin. Enforce rules: `no-explicit-any`, `consistent-type-imports`, `no-floating-promises`, `prefer-nullish-coalescing`, `no-unnecessary-type-assertion`.
- Use `import type { ... }` for type-only imports to ensure they are erased at compile time and reduce circular dependency risks.
- Format with **Prettier** (TypeScript-aware). Enforce in CI.
- Avoid type assertions (`as Type`) in production code — they bypass the type system. If unavoidable, explain the reason in a comment.
- Document complex types with TSDoc comments: `/** @template T The entity type being fetched */`. Run `typedoc` in CI for library projects.
