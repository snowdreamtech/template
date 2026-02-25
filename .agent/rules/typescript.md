# TypeScript Development Guidelines

> Objective: Define standards for strongly-typed, safe, and maintainable TypeScript code, covering configuration, the type system, generics, async patterns, and tooling.

## 1. Configuration (tsconfig.json)

- Always use **`"strict": true`** in `tsconfig.json`. This enables the full set of strict checks: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`. Never disable strict mode or individual flags from within it.
- Enable additional safety flags beyond `strict`:

  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "exactOptionalPropertyTypes": true,
      "noUncheckedIndexedAccess": true,
      "verbatimModuleSyntax": true,
      "moduleResolution": "bundler",
      "target": "ES2022",
      "module": "ESNext",
      "skipLibCheck": true
    }
  }
  ```

- Use `"moduleResolution": "bundler"` (TS 5.0+) for Vite/Webpack projects, or `"node16"` / `"nodenext"` for pure Node.js projects. These align with modern package resolution semantics and prevent importing without file extensions.
- Use `"verbatimModuleSyntax": true` to ensure type-only imports use `import type` and are always erased at emit time — prevents runtime import of type-only modules.
- Run **`tsc --noEmit`** in CI to catch type errors without producing output. This is a hard gate — fail CI on any type error.
- Separate `tsconfig.json` variants for different environments using `extends`:

  ```json
  // tsconfig.build.json — production build
  { "extends": "./tsconfig.json", "exclude": ["**/*.test.ts", "**/*.spec.ts"] }

  // tsconfig.test.json — test environment
  { "extends": "./tsconfig.json", "include": ["src/**/*", "tests/**/*"] }
  ```

## 2. Type System Best Practices

### Avoiding `any`

- **Never use `any`** — it disables the type system entirely. Use `unknown` for truly unknown inputs, then narrow the type before use:

  ```typescript
  // ❌ any — disables all type checking
  function parse(input: any): any {
    return JSON.parse(input);
  }

  // ✅ unknown — forces caller to narrow the type
  function parse(input: string): unknown {
    return JSON.parse(input);
  }

  function isUser(val: unknown): val is User {
    return typeof val === "object" && val !== null && "email" in val;
  }

  const parsed = parse(rawJson);
  if (isUser(parsed)) {
    console.log(parsed.email); // TypeScript knows it's User
  }
  ```

- Acceptable exceptions for `any`: configuring legacy JS libraries with no types (`@types/...` not available), very complex generic inference, or when using the `as unknown as T` escape hatch (document why).

### Interfaces vs Types

- Prefer **`interface`** for object shapes that serve as contracts — interfaces are extendable, merge declarations, and produce cleaner error messages:

  ```typescript
  interface User {
    id: string;
    email: string;
    createdAt: Date;
  }
  interface Admin extends User {
    permissions: string[];
  }
  ```

- Use **`type`** for: unions, intersections, mapped types, conditional types, aliases of primitives, and types that should not be extendable:

  ```typescript
  type UserId = string;
  type UserOrAdmin = User | Admin;
  type WithTimestamps<T> = T & { createdAt: Date; updatedAt: Date };
  type Status = "pending" | "active" | "archived";
  ```

### Nullability

- With `strictNullChecks: true`, always handle `null` and `undefined` explicitly:

  ```typescript
  // ❌ Non-null assertion — runtime crash if null
  const name = user!.name;

  // ✅ Optional chaining + nullish coalescing
  const name = user?.name ?? "Anonymous";

  // ✅ Guard clause
  if (!user) throw new Error("User required");
  ```

- Use **discriminated unions** instead of nullable fields to model states:

  ```typescript
  type AsyncState<T> = { status: "idle" } | { status: "loading" } | { status: "success"; data: T } | { status: "error"; error: Error };
  ```

### Type Narrowing

- Use **`satisfies`** operator (TS 4.9+) to validate that an expression matches a type without widening it to that type:

  ```typescript
  const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
  } satisfies Record<string, string | number[]>;
  // palette.red is number[], not string | number[]
  ```

## 3. Generics & Advanced Types

- Use generics to write reusable, type-safe functions and utilities. Give meaningful names when context warrants it — avoid single letters for complex generics:

  ```typescript
  // ✅ Descriptive names
  function paginate<TEntity>(items: TEntity[], page: number, pageSize: number): TEntity[];

  // Constrained generic
  function merge<TBase extends object, TOverrides extends Partial<TBase>>(base: TBase, overrides: TOverrides): TBase & TOverrides;
  ```

- Use `infer` in conditional types for complex type extraction:

  ```typescript
  type UnpackPromise<T> = T extends Promise<infer R> ? R : T;
  type FunctionParams<T> = T extends (...args: infer P) => unknown ? P : never;
  ```

- Use **Template Literal Types** for string pattern constraints:

  ```typescript
  type EventName = `on${Capitalize<string>}`; // "onClick", "onChange"...
  type ApiRoute = `/${string}`; // "/users", "/posts/1"...
  type CSSProperty = `${string}-${string}`; // "font-size", "background-color"...
  ```

- Prefer **`const` assertions** (`as const`) over `enum` for named string/number sets — they are tree-shakeable and produce literal types:

  ```typescript
  const UserRole = { ADMIN: "admin", VIEWER: "viewer", EDITOR: "editor" } as const;
  type UserRole = (typeof UserRole)[keyof typeof UserRole]; // "admin" | "viewer" | "editor"
  ```

- Use `enum` only when you explicitly need bidirectional mapping or a self-documenting computed-value name.
- Leverage built-in utility types: `Partial<T>`, `Required<T>`, `Readonly<T>`, `Pick<T,K>`, `Omit<T,K>`, `Record<K,V>`, `ReturnType<F>`, `Parameters<F>`, `NonNullable<T>`, `Awaited<T>`.

## 4. Async Patterns

- Use **`async`/`await`** for all asynchronous code. Avoid `.then().catch()` chains for readability:

  ```typescript
  // ✅ Readable and errorhandling-safe
  async function loadUser(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
  ```

- Use `import type` for **type-only imports** to ensure they are erased at emit time and cannot cause circular runtime dependencies:

  ```typescript
  import type { User, UserRole } from "./user.types";
  import { createUser } from "./user.service";
  ```

- Handle **`Promise.all`** and **`Promise.allSettled`** with proper typing:

  ```typescript
  // Parallel, fails fast if any rejects
  const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);

  // Parallel, collects all results including failures
  const results = await Promise.allSettled([fetchUser(id), fetchPosts(id)]);
  results.forEach((result) => {
    if (result.status === "fulfilled") console.log(result.value);
    else console.error(result.reason);
  });
  ```

- Avoid **floating Promises** — always `await` or `.catch()` every Promise. The `@typescript-eslint/no-floating-promises` lint rule enforces this.

## 5. Code Quality & Tooling

### ESLint

- Lint with **`@typescript-eslint`** plugin. Configure in `eslint.config.ts` (ESLint 9+ flat config):

  ```typescript
  // Must-enable rules:
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/consistent-type-imports": "error", // enforce import type
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-unnecessary-type-assertion": "error",
  "@typescript-eslint/prefer-nullish-coalescing": "warn",
  "@typescript-eslint/prefer-optional-chain": "warn",
  "no-console": "warn",
  "no-debugger": "error",
  ```

- Run ESLint in CI: `npx eslint . --max-warnings 0`. Treat warnings as errors in CI.

### Formatting

- Format with **Prettier** (TypeScript-aware). Commit `.prettierrc` to share formatting rules. Run `prettier --check .` in CI.
- Do NOT maintain separate style rules via ESLint for formatting — delegate entirely to Prettier. Use `eslint-config-prettier` to disable ESLint formatting rules.

### Documentation

- Document complex types, generics, and public API functions with **TSDoc** comments:

  ```typescript
  /**
   * Fetches a user by ID from the database.
   * @param id - The user's UUID
   * @returns The user if found
   * @throws {UserNotFoundError} If no user with the given ID exists
   * @example
   * const user = await fetchUser("550e8400-e29b-41d4-a716-446655440000");
   */
  async function fetchUser(id: string): Promise<User>;
  ```

- Run `typedoc` in CI for library projects to validate that all public symbols are documented and generate API reference docs.
- Avoid using `// @ts-ignore` or `// @ts-expect-error` in production code. If unavoidable, always include a comment explaining why and file a ticket to remove it.
