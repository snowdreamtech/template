# Nuxt.js Development Guidelines

> Objective: Define standards for building full-stack Vue applications with Nuxt.

## 1. Directory Structure

- Follow Nuxt's **file-based conventions**: auto-imports from `components/`, `composables/`, `utils/`, and `stores/` are enabled by default — do not manually import from these directories.
- Use `pages/` for routed views. Use `layouts/` for shared page chrome. Use `middleware/` for route guards.
- Keep `server/api/` endpoints thin; delegate business logic to `server/services/` or `server/utils/`.

## 2. Data Fetching

- Use **`useFetch`** and **`useAsyncData`** for server-side and universal data fetching. They integrate with Nuxt's SSR cache and hydration automatically.
- Set `lazy: true` on non-critical data fetches to avoid blocking page rendering.
- Use `$fetch` (Nuxt's isomorphic fetch) for programmatic calls (inside composables or event handlers), not the global `fetch`.

## 3. Server-Side (Nitro)

- Define API endpoints in `server/api/` as named files (e.g., `server/api/users/index.get.ts`). The file name encodes the HTTP method.
- Use **`defineEventHandler`** for all server route handlers.
- Use `useRuntimeConfig()` for accessing environment variables in both server and client code (prefix client-exposed vars with `public:`).

## 4. State Management

- Use **Pinia** for global state management. Define stores in `stores/` for auto-import.
- Prefer `useAsyncData` / `useFetch` over Pinia for server-fetched data to get SSR caching for free.

## 5. Performance & Tooling

- Use Nuxt's built-in **Image** (`@nuxt/image`) and **Font** (`@nuxt/fonts`) modules for optimization.
- Enable **Nuxt DevTools** during development for component inspection and performance analysis.
- Run `nuxt build` and `nuxt typecheck` in CI. Use Vitest for unit tests and Playwright for e2e.
