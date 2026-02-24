# Svelte Development Guidelines

> Objective: Define standards for building clean, performant, and maintainable Svelte 5 applications.

## 1. Components & Structure

- Each Svelte component lives in a `.svelte` file containing `<script>`, markup, and `<style>` blocks in that order.
- Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$props`) for all reactivity in new projects. Avoid the legacy reactive `$:` label syntax and legacy stores in new code.
- Keep components focused and small. Split large components into smaller, composable ones co-located in a `_components/` directory.
- Use `<script module>` (Svelte 5 module context) for code that runs once per module rather than once per component instance.

## 2. Reactivity

- Use **`$state()`** for mutable reactive state. Use **`$derived()`** for computed values that depend on other state — never recompute in template expressions.
- Use **`$effect()`** for side effects. Always return a cleanup function when setting up subscriptions, timers, or event listeners.
- Avoid mutating state that derives from props. Use `$props()` to receive props: `let { title, count = 0 } = $props()`.
- For complex state objects, use `$state.raw()` for non-deeply-reactive state or `$state.snapshot()` for serialization.

## 3. State Management

- For component-scoped state, use `$state()` runes.
- For shared state across components/modules, use **Svelte Stores** (`writable`, `readable`, `derived`) or write plain reactive state objects using `$state` in a shared module.
- Use Svelte's **context API** (`setContext`/`getContext`) for dependency injection within a component tree without prop drilling.
- For SvelteKit apps, prefer `+page.svelte` load data (`data` prop) over global stores for page-specific data.

## 4. SvelteKit

- Use `+page.svelte` for page components and `+layout.svelte` for shared layouts.
- Load data server-side in **`+page.server.ts`** (load functions). Use `+page.ts` for data that can be loaded on both server and client (isomorphic).
- Use **Form Actions** (`+page.server.ts` actions) for form mutations. Avoid manual `fetch` calls for form submits when Actions cover the use case.
- Use **`hooks.server.ts`** for cross-cutting concerns: authentication, logging, and request context initialization.

## 5. Styling & Tooling

- Use scoped `<style>` blocks for component-level styles. Use `:global()` sparingly, only for styles that intentionally escape the component scope.
- Integrate with a utility CSS framework (Tailwind CSS) or Svelte component library (shadcn-svelte, Skeleton) consistently across the project.
- Lint with **`eslint-plugin-svelte`** and format with **Prettier + prettier-plugin-svelte**. Enforce in CI.
- Use **Vitest** with `@testing-library/svelte` for unit and component tests. Use **Playwright** for E2E tests.
- Run `svelte-check` in CI to catch type errors and Svelte-specific warnings in `.svelte` files.
