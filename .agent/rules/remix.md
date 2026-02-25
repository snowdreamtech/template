# Remix Development Guidelines

> Objective: Define standards for building full-stack React web applications with Remix / React Router v7.

## 1. Data Loading (Loaders)

- Use **`loader`** functions exported from route modules for all server-side data fetching. Loaders run only on the server; their data is accessed in the route component via `useLoaderData()`.
- Return data from loaders using the `json()` utility or native `Response` objects. Throw `Response` objects (or use `redirect()`) for redirects and early exits from loaders.
- **Never fetch data inside a React component** if it can be fetched in a `loader`. This is the most common Remix anti-pattern — loaders enable parallel data loading and server-side caching.
- Use `defer()` + `<Suspense>` + `<Await>` for streaming slow, non-critical data so the page shell renders immediately without waiting for all data.
- Type loaders with `LoaderFunctionArgs` and use `typeof loader` for `useLoaderData<typeof loader>()` — eliminates manual type annotations.

## 2. Mutations (Actions)

- Use **`action`** functions for all data mutations (POST/PUT/DELETE/PATCH form submissions). Actions are the preferred replacement for `useState` + `fetch` patterns for form interactions.
- Use Remix's `<Form>` component (or `useFetcher()` for non-navigating mutations) for all form-based actions. `<Form>` works without JavaScript — progressive enhancement out of the box.
- After an action completes, Remix **automatically re-validates and re-runs loaders** on the current page. Do not manually trigger refetches.
- Validate action input server-side using Zod or similar. Return `json({ errors }, { status: 400 })` for validation failures and surface them via `useActionData()`.
- Use `useFetcher()` for optimistic UI and non-navigating mutations (e.g., toggling a like, updating a status inline).

## 3. Routing & File Structure

- Remix uses **file-based routing** in `app/routes/`. File names determine URL structure and nesting (dot notation for nested routes).
- Use **Nested Routes** for shared layouts. Parent routes render `<Outlet />` where child routes should appear. Nested routes share data loading in parallel.
- Use the **`handle`** export on routes to pass route-level metadata (breadcrumbs, page titles) to parent layouts via `useMatches()`.
- Use **route-level `ErrorBoundary`** exports to catch loader/action errors and render contextual error UI. Use `isRouteErrorResponse()` to distinguish HTTP error responses (404, 403) from unexpected runtime errors.

## 4. TypeScript & Validation

- Use **`typeof loader`** for `useLoaderData()` typing: `useLoaderData<typeof loader>()`. This eliminates manual type annotations and keeps types in sync with the loader.
- Validate all action payloads and loader params with **Zod**. Parse form data with `parseFormData()` or a helper library like `remix-hook-form`.
- Use Remix's **`params`** object for route parameters — always validate and coerce types (they are always strings) before use.
- Use `json()` with explicit type parameters for loader return types: `return json<LoaderData>({ user })`.

## 5. Performance & Deployment

- Enable Remix's built-in **prefetching**: `<Link prefetch="intent">` preloads the route and its data when the user hovers. Use `prefetch="render"` for links likely to be clicked.
- Use the **`meta`** and **`links`** exports on route modules for per-page SEO metadata and CSS preloading. These run on the server during SSR.
- Use **`shouldRevalidate`** to prevent unnecessary loader re-runs on mutations that don't affect the current route's data.
- Run `remix build` (or `react-router build`) in CI and test with the deployment adapter. Use **Playwright** or **Cypress** for E2E tests covering route transitions, form submissions, and error boundaries.
- Deploy on Fly.io, Vercel, Cloudflare Workers, or any Node.js server with the appropriate adapter. Keep the adapter dependency updated.
