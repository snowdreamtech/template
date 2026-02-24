# Remix Development Guidelines

> Objective: Define standards for building full-stack React web applications with Remix / React Router v7.

## 1. Data Loading (Loaders)

- Use **`loader`** functions exported from route modules for all server-side data fetching. Loaders run only on the server; their data is accessed in the route component via `useLoaderData()`.
- Return data from loaders using the `json()` utility or native `Response` objects. Throw `Response` objects (or use `redirect()`) for redirects and early returns.
- **Never fetch data inside a React component** if it can be fetched in a `loader`. This is the most common Remix anti-pattern — loaders are the preferred data-fetching mechanism.
- Use `defer()` + `<Suspense>` + `<Await>` for streaming slow, non-critical data so the page shell renders immediately.

## 2. Mutations (Actions)

- Use **`action`** functions for all data mutations (form submissions, POST/PUT/DELETE/PATCH operations). Actions are the preferred replacement for `useState` + `fetch` patterns.
- Use Remix's `<Form>` component (or `useFetcher()` for non-navigating mutations) for all form-based actions.
- After an action completes, Remix **automatically re-validates and re-runs loaders** on the current page — do not manually trigger refetches.
- Validate action input server-side using Zod or similar. Return `json({ errors }, { status: 400 })` for validation failures and surface them via `useActionData()`.

## 3. Routing & File Structure

- Remix uses **file-based routing** in `app/routes/`. File names determine URL structure and nesting.
- Use **Nested Routes** for shared layouts. Parent routes render `<Outlet />` where child routes should appear.
- Use the **`handle`** export on routes to pass route-level metadata (breadcrumbs, page titles) to parent layouts via `useMatches()`.
- Use **route-level `ErrorBoundary`** exports to catch loader/action errors and render contextual error UI. Use `isRouteErrorResponse()` to distinguish HTTP responses (404, 403) from unexpected runtime errors.

## 4. TypeScript & Validation

- Use **`typeof loader`** for `useLoaderData()` typing: `useLoaderData<typeof loader>()`. This eliminates manual type annotations.
- Validate all action payloads and loader params with **Zod**. Use `zod.parse()` inside loaders/actions.
- Use Remix's built-in `params` object for route parameters, always validate and coerce types before use.

## 5. Performance & Deployment

- Enable Remix's built-in **prefetching** for routes: `<Link prefetch="intent">` preloads the route when the user hovers.
- Use the **`meta`** and **`links`** exports on route modules for per-page SEO metadata and CSS preloading.
- Run `remix build` (or `react-router build`) and test with the adapter server (e.g., `@remix-run/express`) in CI.
- Use **Playwright** or **Cypress** for E2E tests. Test route interactions, form submissions, and error boundaries.
