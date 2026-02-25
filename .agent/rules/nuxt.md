# Nuxt.js Development Guidelines

> Objective: Define standards for building full-stack, SSR-capable Vue applications with Nuxt.

## 1. Directory Structure & Conventions

- Follow Nuxt's **file-based conventions**. Auto-imports are enabled for `components/`, `composables/`, `utils/`, and `stores/` — leverage them instead of manual imports.
- Use `pages/` for routed views, `layouts/` for shared page chrome, `middleware/` for route guards, and `plugins/` for third-party library initialization.
- Keep `server/api/` endpoint files thin: validate input → call service → return response. Delegate business logic to `server/services/` or `server/utils/`.
- Use `app/router.options.ts` for fine-grained router configuration instead of modifying Nuxt internals.
- Prefix private server utilities and internal modules with `_` to prevent them from being auto-imported.
- Use **Nuxt Layers** (`extends` in `nuxt.config.ts`) to share components, composables, and configuration across multiple Nuxt apps as a maintainable base layer.

## 2. Data Fetching

- Use **`useFetch`** and **`useAsyncData`** for SSR-compatible data fetching. They integrate with Nuxt's hydration, caching, and request deduplication automatically.
- Use **`lazy: true`** on non-critical data fetches to avoid blocking the initial page render. Combine with a loading skeleton UI.
- Use **`$fetch`** (Nuxt's isomorphic `ofetch` wrapper) for programmatic API calls in composables, event handlers, or server-to-server calls. Do not use the global `fetch` directly.
- Use **`useRequestHeaders`** and **`useRequestEvent`** to forward cookies or auth headers from the browser request to server-side fetch calls during SSR.
- Use `key` option on `useFetch`/`useAsyncData` to differentiate requests and control cache invalidation: `useFetch('/api/users', { key: () => route.params.id })`.

## 3. Server-Side (Nitro)

- Define API endpoints in `server/api/` using file-name method encoding: `server/api/users/[id].get.ts`, `server/api/users/index.post.ts`.
- Use **`defineEventHandler`** for all server route handlers. Use **`readValidatedBody`** and **`getValidatedQuery`** with Zod schemas for type-safe, validated input parsing.
- Access environment variables with **`useRuntimeConfig()`**. Prefix client-exposed variables with `public:` in `nuxt.config.ts`. Never access `process.env` directly in handlers.
- Use **H3 middleware** (`server/middleware/`) for global server-side concerns: authentication, rate limiting, and structured logging.
- Use `setCookie`, `getCookie`, and `deleteCookie` from H3 for server-side cookie management.

## 4. State Management

- Use **Pinia** for global state management. Define stores in `stores/` for auto-import. Do not use Vuex.
- Prefer `useFetch`/`useAsyncData` over Pinia for server-fetched data to avoid duplicating SSR hydration logic.
- Use `useState()` for SSR-safe shared state that needs to survive hydration without Pinia overhead.
- Use `useNuxtData()` to share `useAsyncData`/`useFetch` cached data between components without re-fetching.

## 5. Performance, SEO & Tooling

- Use **`@nuxt/image`** for automatic image optimization, lazy loading, and responsive `srcset` generation.
- Use **`useSeoMeta()`** and **`useHead()`** composables for managing document head metadata (title, description, Open Graph tags) per-page. These are SSR-aware and type-safe.
- Enable **Nuxt DevTools** during development for performance analysis, composable inspection, and module management.
- Run `nuxt build` and `nuxt typecheck` in CI. Use **Vitest** with `@nuxt/test-utils` for unit and component tests. Use **Playwright** for E2E tests.
- Audit bundle size with `nuxt analyze` before production releases. Use dynamic imports (`defineAsyncComponent`, `lazyLoad`) and `lazy` prefix on auto-imported components.
- Use Nuxt's **edge rendering** preset (`nitro.preset = 'cloudflare-pages'` / `'vercel-edge'`) for latency-sensitive routes deployed to edge CDN networks.
