# Remix Development Guidelines

> Objective: Define standards for building full-stack React web applications with Remix.

## 1. Data Loading (Loaders)

- Use **`loader`** functions (exported from route modules) for all server-side data fetching. Loaders run only on the server and their data is passed to the route component via `useLoaderData()`.
- Return data from loaders using the `json()` utility. Throw `Response` objects (or use `redirect()`) for redirects and error states.
- Never fetch data inside a React component if it can be fetched in a `loader`.

## 2. Mutations (Actions)

- Use **`action`** functions for all data mutations (form submissions, POST/PUT/DELETE). Actions replace the need for most `useState` + `fetch` patterns.
- Forms are the primary mutation mechanism in Remix. Use `<Form>` (Remix's component) or `useFetcher()` for non-navigating mutations.
- After an action completes, Remix automatically re-validates and reloads loader data — do not manually refetch.

## 3. Routing & File Structure

- Remix uses **file-based routing** in the `app/routes/` directory. File name conventions determine URL structure and nesting.
- Use **Nested Routes** for shared layouts. Render child routes with `<Outlet />` in the parent layout route.
- Use **`handle` export** on routes to pass metadata (breadcrumbs, page titles) up to parent layouts.

## 4. Error Boundaries

- Export an **`ErrorBoundary`** component from every route that makes data requests. This catches loader/action errors and renders a contextual error UI without crashing the whole page.
- Use `isRouteErrorResponse()` in `ErrorBoundary` to distinguish HTTP errors (404, 403) from unexpected errors.

## 5. Performance & SEO

- Remix provides **streaming** with `defer()` + `<Suspense>` for non-critical, slow data. Use it for optional page sections.
- Manage document `<head>` with the **`meta`** and **`links`** exports on route modules for per-page SEO metadata.
- Run `remix build` and test with `remix-serve` in CI. Use Playwright or Cypress for e2e browser tests.
