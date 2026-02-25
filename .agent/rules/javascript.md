# JavaScript Development Guidelines

> Objective: Define standards for modern, maintainable, and performant JavaScript across browser and server environments.

## 1. Syntax & Language Features

- Use **ES2022+** features. Target modern browsers or configure a transpiler (Babel/esbuild/SWC) for wider compatibility — document the target in the project's build config.
- Always use `const` by default. Use `let` only when the variable must be reassigned. Never use `var`.
- Use **arrow functions** (`() => {}`) for callbacks, short functions, and method references in closures. Use named `function` declarations for top-level, reusable functions that benefit from hoisting.
- Prefer **template literals** (`` `Hello ${name}` ``) over string concatenation.
- Use **optional chaining** (`?.`) and **nullish coalescing** (`??`) instead of verbose null checks. Avoid `||` for defaults when `0` or `""` are valid.
- Prefer **destructuring** for objects and arrays where it improves readability: `const { id, name } = user`.
- Use `structuredClone()` (native, available in all modern environments) for deep-cloning objects instead of `JSON.parse(JSON.stringify(obj))` — it handles more types correctly.

## 2. Modules & Imports

- Use **ES Modules** (`import`/`export`) exclusively. Do not mix with CommonJS (`require`/`module.exports`) in the same codebase.
- Keep imports at the top of each file, grouped and ordered: external libraries → internal modules → type-only imports.
- Avoid circular dependencies. Use a linting rule (`import/no-cycle`) to detect them.
- Use explicit **named exports** over default exports for better refactoring support and IDE support. Default exports are acceptable for page/route-level components.
- Tree-shake unused exports — prefer `import { specific } from 'lib'` over `import * as lib from 'lib'`.

## 3. Async Programming

- Use **`async`/`await`** for asynchronous operations. Avoid raw `.then()`/`.catch()` chains for complex flows.
- Always wrap `await` calls in `try...catch` blocks or use a higher-level error-handling wrapper.
- Use `Promise.all()` for concurrent independent async operations. Use `Promise.allSettled()` when results are needed even if some fail.
- Set timeouts on all external async calls using `AbortController` or a wrapper with a deadline.
- Handle Promise rejections explicitly. Configure an `unhandledRejection` listener at the process level in Node.js.
- Offload CPU-intensive synchronous work (image processing, compression, crypto) to **Web Workers** (browser) or `worker_threads` (Node.js) to avoid blocking the main thread.

## 4. Error Handling

- Never use empty `catch` blocks that silently swallow errors.
- Always throw `Error` objects (or subclasses), never plain strings: `throw new Error("Descriptive message")`.
- Create **custom error classes** for domain-specific errors: `class ValidationError extends Error { constructor(msg) { super(msg); this.name = "ValidationError"; } }`.
- Log errors with sufficient context: operation name, sanitized input values, and the original error cause (`new Error("msg", { cause: originalErr })`).

## 5. Code Quality & Tooling

- Lint with **ESLint** using `eslint:recommended` plus environment-appropriate plugins. Enforce in CI.
- Format with **Prettier**. Enforce formatting in CI via `prettier --check`. Commit a `.prettierrc` config.
- Avoid mutating function arguments or shared global state. Prefer pure functions.
- Limit function length (target < 40 lines). If a function does more than one thing, extract it.
- Use **JSDoc** for public function documentation when not using TypeScript. Document parameters, return types, and thrown errors.
- Measure and profile performance-critical paths. Avoid premature optimization — profile first, optimize second.
- In browser environments handling HTML construction, use **Trusted Types** policies to defend against DOM XSS attacks. Never pass raw user input to `innerHTML`, `eval()`, or `document.write()`.
