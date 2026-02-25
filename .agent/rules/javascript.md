# JavaScript Development Guidelines

> Objective: Define standards for modern, maintainable, and performant JavaScript across browser and server environments, covering syntax, modules, async patterns, error handling, security, and tooling.

## 1. Syntax & Language Features

- Target **ES2022+** features for new code. If cross-browser or legacy Node.js support is required, configure a transpiler (esbuild, SWC, or Babel) and document the target in the project's build config.
- Always use **`const`** by default. Use **`let`** only when the variable must be reassigned. **Never use `var`** — it has function scope and is prone to hoisting bugs.
- Use **arrow functions** (`() => {}`) for callbacks, short functions, and method references in closures. Use named `function` declarations for top-level, reusable functions that benefit from hoisting and named stack traces.
- Use **template literals** for string interpolation: `` `Hello ${name}` ``. Prefer multi-line template literals over string concatenation.
- Use **optional chaining** (`?.`) and **nullish coalescing** (`??`). Avoid `||` for defaults when `0`, `""`, or `false` are valid values:

  ```javascript
  // ❌ Incorrect: falsy defaults clobber valid values
  const timeout = config.timeout || 5000; // wrong if timeout=0 is valid

  // ✅ Nullish: only uses default when null/undefined
  const timeout = config.timeout ?? 5000;
  const url = config?.api?.baseUrl ?? "https://api.example.com";
  ```

- Use **object and array destructuring** for cleaner code:

  ```javascript
  const { id, name, email = "unknown" } = user;
  const [first, second, ...rest] = items;
  const {
    status,
    data: { results, total },
  } = response;
  ```

- Use **spread operator** for shallow cloning and merging:

  ```javascript
  const updated = { ...original, name: "New Name" };
  const merged = [...arrayA, ...arrayB];
  ```

- Use **`structuredClone()`** for deep cloning — it handles Date, RegExp, Map, Set, TypedArray correctly:

  ```javascript
  const clone = structuredClone(complexObject); // ✅ Native, handles all types
  // ❌ JSON.parse/stringify loses Dates, undefined, functions, Maps, Sets
  ```

- Use **private class fields** (`#field`) and **static class blocks** for modern, encapsulated class design.

## 2. Modules & Imports

- Use **ES Modules** (`import`/`export`) exclusively in new code. Do NOT mix with CommonJS (`require`/`module.exports`) in the same module. Specify `"type": "module"` in `package.json` for Node.js ESM.
- Organize imports in this order, separated by blank lines:
  1. Node.js built-ins (`node:fs`, `node:path`)
  2. External libraries (`@scope/library`, `express`)
  3. Internal modules (`./services/user`, `../utils`)
  4. Type-only imports (if not using TypeScript, document types via JSDoc)
- Use explicit **named exports** over default exports for better refactoring, IDE autocompletion, and tree-shaking:

  ```javascript
  // ✅ Named export — IDE can find all usages, rename safely
  export function createUser(data) { ... }
  export const MAX_RETRIES = 3;

  // Default export is fine for framework entry points (page components, route handlers)
  ```

- Avoid **circular dependencies**. Use a linting rule (`import/no-cycle`) to detect them. Circular dependencies cause module initialization issues and are hard to debug.
- Prefer **specific named imports** over namespace imports to enable tree-shaking:

  ```javascript
  // ✅ Only imports what's needed
  import { pick, omit } from "lodash-es";

  // ❌ Imports entire module — defeats tree-shaking
  import _ from "lodash";
  ```

## 3. Async Programming

- Use **`async`/`await`** for all asynchronous operations. Avoid raw `.then()`/`.catch()` chains for complex logic — they produce deeply nested, hard-to-follow code:

  ```javascript
  // ✅ async/await — clear sequential flow
  async function loadUserProfile(userId) {
    const user = await userService.findById(userId);
    const permissions = await permissionService.forUser(user.id);
    return { ...user, permissions };
  }
  ```

- Wrap `await` calls in `try...catch` blocks for explicit error handling:

  ```javascript
  async function submitOrder(cart) {
    try {
      const order = await orderService.create(cart);
      await notificationService.sendConfirmation(order.id);
      return order;
    } catch (error) {
      logger.error("Order submission failed", { cartId: cart.id, error });
      throw new ServiceError("Order submission failed", { cause: error });
    }
  }
  ```

- Use `Promise.all()` for concurrent independent operations; use `Promise.allSettled()` when you need all results regardless of failures:

  ```javascript
  // Parallel — fails fast if any rejects
  const [user, posts, settings] = await Promise.all([
    fetchUser(id), fetchPosts(id), fetchSettings(id)
  ]);

  // Parallel — collects all results
  const results = await Promise.allSettled(requests);
  const { fulfilled, rejected } = results.reduce(...);
  ```

- Set **timeouts** on all external async operations using `AbortController`:

  ```javascript
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
  ```

- Handle **unhandled Promise rejections** explicitly. Register a global handler in Node.js:

  ```javascript
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Promise rejection", { reason, promise });
    process.exit(1); // crash and let orchestrator restart
  });
  ```

- Offload **CPU-intensive** synchronous work to Web Workers (browser) or `worker_threads` (Node.js) to avoid blocking the event loop:

  ```javascript
  // Web Worker for CPU-bound image processing
  const worker = new Worker("./image-processor.worker.js");
  worker.postMessage({ imageData });
  ```

## 4. Error Handling

- **Never use empty `catch` blocks** that silently swallow errors:

  ```javascript
  // ❌ Silent failure — impossible to debug
  try {
    something();
  } catch (e) {}

  // ✅ At minimum, log with full context
  try {
    something();
  } catch (e) {
    logger.error("operation failed", { context, error: e });
    throw e; // or handle appropriately
  }
  ```

- Always throw **`Error` objects** (or subclasses), never plain strings or objects:

  ```javascript
  // ❌ Plain string — no stack trace, no instanceof checks
  throw "Something went wrong";

  // ✅ Error object — has stack trace, can be caught by type
  throw new Error("Something went wrong");
  ```

- Create **custom error classes** for domain-specific errors:

  ```javascript
  class ValidationError extends Error {
    constructor(message, { field, value } = {}) {
      super(message);
      this.name = "ValidationError";
      this.field = field;
      this.value = value;
    }
  }

  class NotFoundError extends Error {
    constructor(resource, id) {
      super(`${resource} with id ${id} not found`);
      this.name = "NotFoundError";
      this.resource = resource;
      this.id = id;
    }
  }
  ```

- Use the `cause` option to chain errors (ES2022+):

  ```javascript
  throw new ServiceError("User registration failed", { cause: dbError });
  ```

## 5. Security, Code Quality & Tooling

### Security (Browser)

- **Never pass user input to `innerHTML`, `eval()`, `document.write()`, or `setTimeout(string)`** — these are XSS injection points:

  ```javascript
  // ❌ XSS vulnerability
  element.innerHTML = user.name;

  // ✅ Safe text content
  element.textContent = user.name;
  // Or use DOM methods:
  const el = document.createElement("span");
  el.textContent = user.name;
  container.appendChild(el);
  ```

- Use **Trusted Types** policies (browser) to prevent DOM XSS injection at scale. Configure a `default` policy that enforces safe HTML generation.
- Set **Content Security Policy** headers to restrict resource loading and prevent injection attacks.
- **Sanitize HTML** before rendering (when client-controlled rich text is unavoidable): use `DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })`.

### Code Quality

- Avoid mutating function arguments or shared global state — write pure functions where possible.
- Limit function length to < 40 lines. If a function does more than one thing, extract it into smaller, focused functions.
- Avoid **magic numbers** — use named constants: `const MAX_LOGIN_ATTEMPTS = 5;` instead of `if (count > 5)`.

### Tooling

- Lint with **ESLint** using `@eslint/js` + environment-appropriate plugins. Enforce in CI with `eslint --max-warnings 0`:

  ```bash
  # Recommended rules to enable:
  no-console: "warn"
  no-debugger: "error"
  no-unused-vars: "error"
  no-var: "error"
  prefer-const: "error"
  eqeqeq: "error"
  no-eval: "error"
  no-implied-eval: "error"
  ```

- Format with **Prettier**. Commit `.prettierrc`. Enforce in CI: `prettier --check .`.
- Use **JSDoc** for public function documentation in non-TypeScript projects:

  ```javascript
  /**
   * Creates a new user account.
   * @param {CreateUserParams} params - User creation parameters
   * @returns {Promise<User>} The created user
   * @throws {ValidationError} If email is already taken
   */
  async function createUser(params) { ... }
  ```

- Profile performance-critical paths with browser DevTools Performance tab or Node.js `--prof` before optimizing. Never prematurely optimize without profiling data.
