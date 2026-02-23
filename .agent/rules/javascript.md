# JavaScript Development Guidelines

> Objective: Define standards for modern, maintainable, and performant JavaScript.

## 1. Syntax & Language Features

- Use ES2020+ features. Target modern browsers or use a transpiler (Babel/esbuild) for wider compatibility.
- Always use `const` by default. Use `let` only when the variable must be reassigned. Never use `var`.
- Use arrow functions (`() => {}`) for callbacks and short functions. Use named `function` declarations for top-level, reusable functions.
- Prefer template literals (`` `Hello ${name}` ``) over string concatenation.

## 2. Modules

- Use ES Modules (`import`/`export`) exclusively. Do not mix with CommonJS (`require`/`module.exports`) in the same codebase.
- Keep imports at the top of each file, grouped logically (external libraries, then internal modules).

## 3. Async Programming

- Use `async`/`await` for asynchronous operations. Avoid raw `.then()` chains for complex flows.
- Always wrap `await` calls in `try...catch` blocks or use a higher-level error-handling pattern.
- Never use synchronous alternatives to async APIs (e.g., `fs.readFileSync`) in non-script contexts.

## 4. Error Handling

- Never use empty `catch` blocks that silently swallow errors.
- Log errors with sufficient context (operation name, input values where safe).
- Throw `Error` objects (or subclasses), never plain strings: `throw new Error("Descriptive message")`.

## 5. Code Quality

- Lint with ESLint using a standard config (e.g., `eslint:recommended`).
- Format with Prettier. Enforce formatting in CI.
- Avoid mutating function arguments or global state.
- Use destructuring for objects and arrays where it improves readability.
- Limit function length; if a function does more than one thing, split it.
