# Svelte Development Guidelines

> Objective: Define standards for building clean, performant, and maintainable Svelte 5 applications.

## 1. Components & Structure

- Each Svelte component lives in a `.svelte` file containing `<script>`, markup, and `<style>` blocks in that order. Keep each component focused on a single responsibility.
- Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$props`) for all reactivity in new projects. Avoid the legacy reactive `$:` label syntax and legacy stores in new code.
- Keep components focused and small. Extract reusable logic into composable `*.svelte.ts` files. Co-locate sub-components in a `_components/` directory alongside the consuming component.
- Use `<script module>` (Svelte 5 module context) for code that runs once per module, not per instance — e.g., shared constants, singleton connections.
- Prefix private/internal components with `_` to signal they are not meant for external use.

## 2. Reactivity (Runes)

- Use **`$state()`** for mutable reactive state. Keep state as close to where it is used as possible; lift it only when sharing is necessary.
- Use **`$derived()`** for computed values that depend on other state — never recompute in template expressions or `$effect` blocks.
- Use **`$effect()`** for side effects only. Always return a cleanup function when setting up subscriptions, timers, or event listeners to prevent memory leaks.
- Avoid mutating state that derives from props. Use `$props()` to receive props: `let { title, count = 0 } = $props()`. Props are read-only.
- For complex state objects, use `$state.raw()` for non-deeply-reactive state or `$state.snapshot()` to get a non-reactive serializable copy.

## 3. State Management

- For component-scoped state, use `$state()` runes directly.
- For shared state across components or modules, use Svelte Stores (`writable`, `readable`, `derived`) or write a plain reactive state object using `$state` in a shared module file.
- Use Svelte's **context API** (`setContext`/`getContext`) for dependency injection within a component tree, avoiding prop drilling for deeply nested components.
- For SvelteKit apps, prefer `+page.svelte` `data` prop for page-specific server data over global Pinia/Svelte Store patterns.
- Avoid global mutable stores for server-fetched data — prefer `useFetch`/`useAsyncData` patterns or SvelteKit load functions for SSR compatibility.

## 4. SvelteKit

- Use `+page.svelte` for page components and `+layout.svelte` for shared layouts. Use `+error.svelte` for contextual error boundaries.
- Load data server-side in **`+page.server.ts`** (load functions returning typed `PageServerLoad`). Use `+page.ts` for data that can be loaded isomorphically.
- Use **Form Actions** (`+page.server.ts` `actions`) for all form mutations. Avoid manual `fetch` calls for form submits when Actions cover the use case — they work without JavaScript enabled.
- Use **`hooks.server.ts`** for cross-cutting server concerns: authentication checks, request logging, and populating `event.locals`.
- Use `$app/navigation` (`goto`, `invalidate`, `preloadData`) for programmatic navigation and data re-fetching.

## 5. Styling & Tooling

- Use scoped `<style>` blocks for component-level styles. Use `:global()` sparingly — only for styles that intentionally escape the component scope (e.g., styling Markdown-rendered HTML).
- Integrate with a utility CSS framework (Tailwind CSS) or Svelte component library (shadcn-svelte, Skeleton) consistently across the project.
- Lint with **`eslint-plugin-svelte`** and format with **Prettier + prettier-plugin-svelte**. Enforce both in CI.
- Use **Vitest** with `@testing-library/svelte` for unit and component tests. Use **Playwright** for E2E tests.
- Run `svelte-check` in CI to catch Svelte-specific type errors and warnings in `.svelte` files. Run `vite build` and inspect bundle size regularly.
