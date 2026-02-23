# Svelte Development Guidelines

> Objective: Define standards for building clean, performant, and maintainable Svelte applications.

## 1. Components

- Each Svelte component lives in a `.svelte` file containing `<script>`, markup, and `<style>` blocks.
- Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`, `$props`) for reactivity in new projects. Prefer runes over the legacy reactive `$:` syntax.
- Keep components focused. Split large components into smaller, composable ones.

## 2. Reactivity

- Use `$state()` for mutable reactive state. Use `$derived()` for computed values that depend on other state.
- Use `$effect()` for side effects (DOM manipulation, subscriptions). Always return a cleanup function from `$effect` when setting up subscriptions.
- Avoid mutating state derived from props; lift state up or use stores for shared state.

## 3. State Management

- For local, component-scoped state, use `$state()` runes.
- For shared global state, use **Svelte Stores** (`writable`, `readable`, `derived`) or Svelte's context API.
- Structure stores in a dedicated `src/lib/stores/` directory.

## 4. SvelteKit (if applicable)

- Use `+page.svelte` for page components and `+layout.svelte` for shared layouts.
- Load data server-side in `+page.server.ts` (load functions). Use `+page.ts` for data that can be loaded on both server and client.
- Use **Form Actions** (`+page.server.ts` actions) for form mutations instead of manual `fetch` calls.

## 5. Styling

- Use scoped `<style>` blocks for component-level styles by default.
- Use `:global()` sparingly and only for styles that intentionally need to escape the component scope.
- Integrate with a utility CSS framework (Tailwind) or a Svelte component library (shadcn-svelte) consistently across the project.
