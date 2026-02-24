# Nuxt.js Development Guidelines

> Objective: Define standards for building full-stack, SSR-capable Vue applications with Nuxt.

## 1. Directory Structure & Conventions

- Follow Nuxt's **file-based conventions**. Auto-imports are enabled for `components/`, `composables/`, `utils/`, and `stores/` — leverage them instead of manual imports.
- Use `pages/` for routed views, `layouts/` for shared page chrome, `middleware/` for route guards, and `plugins/` for third-party library initialization.
- Keep `server/api/` endpoint files thin: validate input → call service → return response. Delegate business logic to `server/services/` or `server/utils/`.
- Use `app/router.options.ts` for fine-grained router configuration instead of modifying Nuxt internals.

## 2. Data Fetching

- Use **`useFetch`** and **`useAsyncData`** for SSR-compatible data fetching. They integrate with Nuxt's hydration, caching, and deduplication automatically.
- Use **`lazy: true`** on non-critical data fetches to avoid blocking the initial page render.
- Use **`$fetch`** (Nuxt's isomorphic `ofetch` wrapper) for programmatic API calls in composables or event handlers. Do not use the global `fetch` directly.
- Use **`useRequestHeaders`** and **`useRequestEvent`** to forward cookies/auth headers from the browser request to server-side fetch calls in SSR.

## 3. Server-Side (Nitro)

- Define API endpoints in `server/api/` using file-name method encoding (e.g., `server/api/users/[id].get.ts`, `server/api/users/index.post.ts`).
- Use **`defineEventHandler`** for all server route handlers. Use **`readValidatedBody`**, **`getValidatedQuery`** with a Zod schema for safe, validated input parsing.
- Access environment variables with **`useRuntimeConfig()`**. Prefix client-exposed variables with `public:`. Never access `process.env` directly in handlers.
- Use **H3 middleware** (`server/middleware/`) for global server-side concerns (auth, rate limiting, logging).

## 4. State Management

- Use **Pinia** for global state management. Define stores in `stores/` for auto-import. Do not use Vuex.
- Prefer `useFetch`/`useAsyncData` over Pinia for server-fetched data to get SSR caching and hydration deduplication automatically.
- Use `useState()` for SSR-safe shared state that needs to survive hydration without Pinia.

## 5. Performance, SEO & Tooling

- Use **`@nuxt/image`** for automatic image optimization and responsive srcset generation.
- Use **`useSeoMeta()`** and **`useHead()`** composables for managing document head metadata (title, description, Open Graph tags) per-page.
- Enable **Nuxt DevTools** during development for performance analysis, composable inspection, and module management.
- Run `nuxt build` and `nuxt typecheck` in CI. Use **Vitest** with `@nuxt/test-utils` for unit tests and **Playwright** for E2E tests.
- Audit bundle size with `nuxt analyze` before production releases. Use dynamic imports and lazy components to reduce initial payload.
