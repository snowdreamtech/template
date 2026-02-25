# Astro Development Guidelines

> Objective: Define standards for building fast, content-focused websites with Astro's Islands Architecture.

## 1. Core Philosophy (Islands Architecture)

- Astro renders pages to **static HTML by default**. JavaScript is only shipped to the browser for explicitly interactive islands.
- Default to **zero client-side JavaScript**. Add a client directive only when explicit interactivity is needed.
- Choose the correct client directive intentionally:
  - `client:load` — hydrate immediately on page load (use only for above-the-fold critical interactive elements).
  - `client:idle` — hydrate when the browser is idle (good for below-the-fold secondary widgets).
  - `client:visible` — hydrate on scroll into viewport (best for carousels, accordions, lazy widgets).
  - `client:only="framework"` — skip SSR entirely, render only in browser (for auth-gated or browser-API-dependent components).

## 2. File Structure

- Place all pages in `src/pages/`. File-based routing maps file path to URL. Use `[param].astro` for dynamic routes and `[...slug].astro` for catch-all routes.
- Place reusable UI components in `src/components/`. Use `.astro` for static/layout components; use your chosen framework (React, Vue, Svelte) for interactive islands only.
- Place shared layouts in `src/layouts/`. A layout wraps page content with the document `<html>`, `<head>`, and `<body>`.
- Use `src/content/` with the **Content Collections** API for type-safe Markdown/MDX content. Use `src/assets/` for images processed by `astro:assets`.

## 3. Content Collections

- Define collections in `src/content/config.ts` using **Zod schemas** for type-safe front matter validation.
- Always validate front matter with a schema. Never access front matter properties without type checking.
- Use `getCollection()` and `getEntry()` helpers for querying content — never read from the file system directly.
- Use **`render()`** (Astro 5) or `entry.render()` to compile Markdown/MDX content into renderable components.

## 4. Performance

- Prefer `.astro` components over framework components for purely presentational UI — they produce zero JS overhead.
- Use Astro's built-in `<Image />` component from `astro:assets` for all images — it generates optimized formats (WebP/AVIF), correct `srcset`, and prevents layout shift.
- Enable **View Transitions** (`<ViewTransitions />`) for smooth, app-like page navigation without full page reloads.
- Use `Astro.glob()` sparingly. Prefer Content Collections for content queries. Profile build times for large content sites with many images.

## 5. Build, Testing & Deployment

- Run `astro check` (TypeScript type checking for `.astro` files) and `astro build` in CI. Fix all TypeScript errors before merging.
- Use an **SSR adapter** (`@astrojs/node`, `@astrojs/cloudflare`, `@astrojs/vercel`) when server-side rendering, API routes (`src/pages/api/`), or middleware are needed. Default to `output: 'static'` for pure content sites.
- Test interactive island components separately using the framework's own test tooling (Vitest + Testing Library).
- Use **Playwright** for E2E tests of full pages. Run `astro preview` to serve the production build for testing before deployment.
- Use Lighthouse CI or `unlighthouse` to measure Core Web Vitals (LCP, CLS, INP) across all pages on each release.
