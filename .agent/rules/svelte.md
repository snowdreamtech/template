# Svelte Development Guidelines

> Objective: Define standards for building clean, performant, and maintainable Svelte 5 and SvelteKit applications, covering component design, reactivity, state management, routing, and testing.

## 1. Components & File Structure

- Each Svelte component lives in a `.svelte` file. Organize blocks in this order: `<script>`, markup, `<style>`. Keep each component focused on a single responsibility.
- Use **one component per file**. Name component files in `PascalCase` (`UserCard.svelte`). Name route files and utility modules in `kebab-case` or `snake_case`.
- Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$props`) for all reactivity in new projects. Do NOT use the legacy `$:` reactive label or `store.subscribe()` patterns in new Svelte 5 code.
- Keep components **small and focused**. Extract reusable logic into:
  - `*.svelte.ts` files — composable reactive logic (Svelte's equivalent of Vue composables)
  - `_components/` — private sub-components used only by the parent
  - `lib/components/` — shared, reusable UI components
- Prefix internal/private components with `_` to signal they are not for external consumption.
- Use `<script module>` (Svelte 5 module context) for code that runs once per module (not per component instance) — shared constants, singleton connections, module-level data.

### Standard Project Layout (SvelteKit)

```text

src/
├── routes/
│   ├── +layout.svelte        # Root layout
│   ├── +layout.server.ts     # Server-side layout load (auth, session)
│   ├── +page.svelte           # Page component
│   ├── +page.server.ts        # Server-side load + Form Actions
│   └── +error.svelte          # Error boundary per route segment
├── lib/
│   ├── components/            # Shared UI components
│   ├── server/                # Server-only utilities (db, auth)
│   └── utils/                 # Client-safe utilities
├── params/                    # Route param matchers
└── app.html                   # HTML shell

```

## 2. Reactivity (Runes API)

- Use **`$state()`** for mutable reactive state. Keep state as close to where it is used as possible — lift only when sharing is needed:

  ```svelte
  <script lang="ts">
    let count = $state(0);
    let todos = $state<Todo[]>([]);
  </script>
  ```

- Use **`$derived()`** for computed values. **Never recompute in template expressions** or `$effect` blocks — `$derived()` re-computes automatically when dependencies change:

  ```svelte
  <script lang="ts">
    let todos = $state<Todo[]>([]);
    let completed = $derived(todos.filter(t => t.done));
    let remaining = $derived(todos.length - completed.length);
    // ❌ Don't: let remaining = $state(0); $effect(() => { remaining = todos.filter(t => !t.done).length })
  </script>
  ```

- Use **`$effect()`** for side effects (DOM manipulation, subscriptions, timers). Return a cleanup function to prevent leaks:

  ```svelte
  <script lang="ts">
    let { userId } = $props<{ userId: string }>();

    $effect(() => {
      const interval = setInterval(async () => {
        status = await fetchStatus(userId);
      }, 5000);

      return () => clearInterval(interval); // cleanup on destroy/re-run
    });
  </script>
  ```

- Use **`$props()`** to receive props — always type them with TypeScript. Props are read-only; never mutate props directly:

  ```svelte
  <script lang="ts">
    interface Props { title: string; count?: number; onClose?: () => void }
    let { title, count = 0, onClose }: Props = $props();
  </script>
  ```

- Use **`$state.raw()`** for non-reactive state objects that do not need deep reactivity tracking (large arrays, external library instances).
- Use **`$bindable()`** for two-way bindings in custom components (Svelte 5 replacement for `bind:value`).

## 3. State Management

### Component-Scoped State

- Use `$state()` runes directly in the component for component-scoped reactive state.

### Shared/Global State

- For shared state across components, create a **reactive state module** using `$state` in a `.svelte.ts` file:

  ```typescript
  // lib/state/cart.svelte.ts
  let items = $state<CartItem[]>([]);

  export const cart = {
    get items() {
      return items;
    },
    add(product: Product) {
      items = [...items, { product, qty: 1 }];
    },
    remove(id: string) {
      items = items.filter((i) => i.product.id !== id);
    },
    get total() {
      return items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    },
  };
  ```

- Use Svelte's **Context API** (`setContext`/`getContext`) for dependency injection within a component tree without prop drilling:

  ```svelte
  <!-- Parent.svelte (root of tree) -->
  <script>
    import { setContext } from 'svelte';
    setContext('theme', { mode: 'dark', accent: '#6366f1' });
  </script>

  <!-- DeepChild.svelte -->
  <script>
    import { getContext } from 'svelte';
    const theme = getContext<Theme>('theme');
  </script>
  ```

- For SvelteKit apps, prefer server `load()` data via the `data` prop for page-specific data. Avoid storing SSR data in global stores (causes hydration mismatches).

## 4. SvelteKit Routing & Data Loading

### Load Functions

- Load data **server-side** in **`+page.server.ts`** for secure, authenticated data:

  ```typescript
  // +page.server.ts
  import type { PageServerLoad } from "./$types";
  import { redirect } from "@sveltejs/kit";

  export const load: PageServerLoad = async ({ locals, params }) => {
    if (!locals.user) redirect(302, "/login");
    const post = await db.post.findUnique({ where: { id: params.id } });
    if (!post) error(404, "Post not found");
    return { post };
  };
  ```

- Use **`+page.ts`** (without `server`) for data that can load isomorphically (runs both on server and client). Useful for public data from external APIs.
- Avoid duplicating data loading logic between `+layout.server.ts` and `+page.server.ts`. Use layout load functions for data shared across all pages in a route segment (auth user, nav items).

### Form Actions

- Use **Form Actions** (`+page.server.ts` → `actions` export) for all form mutations. They work without JavaScript and provide progressive enhancement:

  ```typescript
  // +page.server.ts
  export const actions = {
    createPost: async ({ request, locals }) => {
      if (!locals.user) error(401, "Unauthorized");
      const data = await request.formData();
      const title = data.get("title") as string;

      if (!title?.trim()) {
        return fail(422, { title, errors: { title: "Title is required" } });
      }

      const post = await db.post.create({ data: { title, authorId: locals.user.id } });
      redirect(303, `/posts/${post.id}`);
    },
  };
  ```

- Use **`+server.ts`** for pure JSON API endpoints (not HTML forms): `export const GET: RequestHandler = async ({ url }) => json(await fetchData(url.searchParams))`.
- Use **`hooks.server.ts`** for cross-cutting server concerns: session validation, request ID injection, populating `event.locals`:

  ```typescript
  // hooks.server.ts
  export const handle: Handle = async ({ event, resolve }) => {
    const session = event.cookies.get("session");
    event.locals.user = session ? await validateSession(session) : null;
    return resolve(event);
  };
  ```

## 5. Styling, Testing & Tooling

### Styling

- Use **scoped `<style>` blocks** for component-level CSS. Svelte automatically scopes styles to the component — no CSS Modules or BEM required.
- Use `:global()` sparingly — only for styles that intentionally escape component scope (styling Markdown-rendered HTML, third-party widget overrides).
- Integrate with **Tailwind CSS** using `tailwindcss` + `@tailwindcss/vite`. Co-locate Tailwind utilities with markup for rapid UI development.
- Use **CSS custom properties** for component theming — they pass through Svelte's scoping and allow parent customization.

### Testing

- Use **Vitest** with **`@testing-library/svelte`** for component unit tests:

  ```typescript
  import { render, fireEvent, waitFor } from "@testing-library/svelte";
  import Counter from "./Counter.svelte";
  import { describe, it, expect } from "vitest";

  describe("Counter", () => {
    it("increments count on click", async () => {
      const { getByRole, getByText } = render(Counter, { count: 0 });
      await fireEvent.click(getByRole("button", { name: /increment/i }));
      expect(getByText("1")).toBeInTheDocument();
    });
  });
  ```

- Use **Playwright** for E2E tests. Generate tests with `npx playwright codegen` and run with `npx playwright test` in CI:

  ```bash
  npx playwright test --project=chromium --reporter=html
  ```

- Run `svelte-check --tsconfig ./tsconfig.json` in CI to catch Svelte-specific TypeScript errors and warnings in `.svelte` files.
- Use `vite build && vite preview` for acceptance testing the production build before deployment.

### Tooling & CI

- Lint with **`eslint-plugin-svelte`** + TypeScript ESLint. Format with **`prettier-plugin-svelte`**. Run both in CI:

  ```bash
  npx eslint . && npx prettier --check .
  ```

- Configure TypeScript with `"strict": true` and `"checkJs": true` in `tsconfig.json`. Use typed `$props()` interfaces for all components.
- Pin Svelte and SvelteKit versions. Subscribe to release notes — Runes API and routing changes can be breaking.
- Use `adapter-auto` in development. Choose the appropriate adapter for production deployment:
  - `adapter-node` — Node.js server (Docker, VPS)
  - `adapter-cloudflare` — Cloudflare Pages
  - `adapter-vercel` — Vercel
  - `adapter-static` — fully static site export
