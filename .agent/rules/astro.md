# Astro Development Guidelines

> Objective: Define standards for building fast, content-focused websites with Astro's Islands Architecture.

## 1. Core Philosophy (Islands Architecture)

- Astro renders components to **static HTML by default**. JavaScript is only shipped to the browser for interactive islands.
- Default to **zero client-side JavaScript**. Add a client directive only when an explicit interactive need exists.
- Choose the correct client directive intentionally:
  - `client:load` — hydrate immediately on page load (use sparingly)
  - `client:idle` — hydrate when the browser is idle (good for below-the-fold widgets)
  - `client:visible` — hydrate when the component enters the viewport (best for carousels, accordions)
  - `client:only="framework"` — skip SSR entirely, browser-only (for auth-gated widgets)

## 2. File Structure

- Place all pages in `src/pages/`. File-based routing maps to URL paths.
- Place reusable UI components in `src/components/`. Use `.astro` for static/layout components and your chosen framework (React, Vue, Svelte) for interactive islands.
- Place shared layouts in `src/layouts/`. A layout wraps page content with a common `<html>`, `<head>`, and `<body>`.
- Use `src/content/` with the **Content Collections** API for type-safe Markdown/MDX content management.

## 3. Content Collections

- Define collections in `src/content/config.ts` using Zod schemas for type safety.
- Always validate front matter with a collection schema; never access front matter without type checking.
- Use `getCollection()` and `getEntry()` helpers for querying content — never read the file system directly.

## 4. Performance

- Prefer Astro components over framework components for purely presentational UI to avoid JavaScript overhead.
- Use Astro's built-in `<Image>` component from `astro:assets` for all images — it provides automatic optimization, sizing, and format conversion.
- Enable **View Transitions** (`<ViewTransitions />`) for smooth, app-like page navigation without a full client-side router.

## 5. Build & Deployment

- Run `astro check` (TypeScript type checking) and `astro build` in CI.
- Use an **SSR adapter** (`@astrojs/node`, `@astrojs/cloudflare`, `@astrojs/vercel`) when server-side rendering or API routes are needed. Default to `output: 'static'` for pure content sites.
