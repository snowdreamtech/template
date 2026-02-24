# JavaScript Development Guidelines

> Objective: Define standards for modern, maintainable, and performant JavaScript across browser and server environments.

## 1. Syntax & Language Features

- Use **ES2022+** features. Target modern browsers or configure a transpiler (Babel/esbuild/SWC) for wider compatibility — document the target in the project's build config.
- Always use `const` by default. Use `let` only when the variable must be reassigned. Never use `var`.
- Use **arrow functions** (`() => {}`) for callbacks, short functions, and method references in closures. Use named `function` declarations for top-level, reusable functions that benefit from hoisting.
- Prefer **template literals** (`` `Hello ${name}` ``) over string concatenation.
- Use **optional chaining** (`?.`) and **nullish coalescing** (`??`) instead of verbose null checks. Avoid `||` for default values when `0` or `""` are valid.
- Prefer **destructuring** for objects and arrays where it improves readability: `const { id, name } = user`.

## 2. Modules & Imports

- Use **ES Modules** (`import`/`export`) exclusively. Do not mix with CommonJS (`require`/`module.exports`) in the same codebase.
- Keep imports at the top of each file, grouped and ordered: external libraries → internal modules → type-only imports.
- Avoid circular dependencies. Use a linting rule (`import/no-cycle`) to detect them.
- Use explicit **named exports** over default exports for better refactoring support and clarity. Default exports are acceptable for page/route-level components.
- Tree-shake unused exports — prefer `import { specific } from 'lib'` over `import * as lib from 'lib'`.

## 3. Async Programming

- Use **`async`/`await`** for asynchronous operations. Avoid raw `.then()`/`.catch()` chains for complex flows.
- Always wrap `await` calls in `try...catch` blocks or use a higher-level error-handling wrapper.
- Use `Promise.all()` for concurrent independent async operations. Use `Promise.allSettled()` when you need results even if some fail.
- Never use synchronous file/IO alternatives (`fs.readFileSync`, `localStorage` in critical paths) in non-script, server contexts.
- Set timeouts on all external async calls using `AbortController` or a wrapper with a deadline.

## 4. Error Handling

- Never use empty `catch` blocks that silently swallow errors.
- Always throw `Error` objects (or subclasses), never plain strings: `throw new Error("Descriptive message")`.
- Create **custom error classes** for domain-specific errors: `class ValidationError extends Error {}`.
- Log errors with sufficient context: operation name, sanitized input values, and the original error cause (`{ cause: originalErr }`).
- Handle Promise rejections explicitly. Configure `unhandledRejection` listener at the process level in Node.js.

## 5. Code Quality & Tooling

- Lint with **ESLint** using `eslint:recommended` plus environment-appropriate plugins. Enforce in CI.
- Format with **Prettier**. Enforce formatting in CI via `prettier --check`. Commit a `.prettierrc` config.
- Avoid mutating function arguments or global/shared state. Prefer pure functions.
- Limit function length (target < 40 lines). If a function does more than one thing, extract it.
- Use **JSDoc** for public function documentation when not using TypeScript. Document parameters, return type, and thrown errors.
- Measure and profile performance-critical paths. Avoid premature optimization — profile first, optimize second.
