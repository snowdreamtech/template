# Astro Development Guidelines

> Objective: Define standards for building fast, content-focused websites and full-stack applications with Astro's Islands Architecture, covering project structure, content collections, performance optimization, SSR, and testing.

## 1. Core Philosophy & Islands Architecture

- Astro renders pages to **static HTML by default**. JavaScript is only sent to the browser for explicitly interactive "islands." Default to **zero client-side JavaScript** — add a client directive only when explicit interactivity is required.
- Choose the correct **client directive** to control when an island is hydrated:

  | Directive | When it hydrates | Use case |
  |---|---|---|
  | `client:load` | Immediately on page load | Above-the-fold critical interactive elements |
  | `client:idle` | When the browser is idle | Below-the-fold secondary widgets |
  | `client:visible` | On scroll into viewport | Carousels, accordions, lazy content |
  | `client:media="(query)"` | When media query matches | Responsive interactive element |
  | `client:only="framework"` | Browser-only, no SSR | Auth-gated or browser-API-dependent components |

- Prefer **`.astro` components** over framework components for purely presentational UI — they produce zero JavaScript overhead on the client.
- Astro's multi-framework support (React, Vue, Svelte, Solid, Preact) allows using the best tool for each island. Standardize on **one framework** per project unless there is a compelling reason to mix.
- Pin the Astro version and adapter in `package.json`. Review Astro's changelog carefully between major versions — breaking changes often affect content collections, routing, and middleware APIs.

## 2. File Structure & Routing

### Standard Project Layout

```text

src/
├── pages/              # File-based routes (*.astro, *.ts, *.js for API)
│   └── api/            # API endpoints (server-only, Astro API routes)
├── components/         # Reusable UI components
│   ├── *.astro         # Static/layout components (zero JS)
│   └── interactive/    # Client-side framework components (islands)
├── layouts/            # Page layouts (wraps <html>, <head>, <body>)
├── content/            # Content Collections (Markdown, MDX, YAML, JSON)
│   └── config.ts       # Collection schemas (Zod)
├── assets/             # Images & fonts processed by astro:assets
├── styles/             # Global CSS and design tokens
└── middleware.ts        # Request/response middleware (SSR mode)
public/                 # Static assets served verbatim (favicon, robots.txt)
astro.config.mjs        # Astro configuration (integrations, adapter, output)

```

- Use `src/pages/` for all routes. File path maps directly to URL path. Use `[param].astro` for dynamic routes and `[...slug].astro` for catch-all routes.
- Place reusable UI in `src/components/`. Use `.astro` for static/layout; use framework components for interactive islands only.
- Layouts wrap page content with the document shell (`<html>`, `<head>`, `<body>`). Nest layouts for section-specific structure (e.g., blog layout → base layout).
- Define **Middleware** in `src/middleware.ts` using `defineMiddleware` for request/response interception: auth checks, redirects, A/B testing, setting security headers. Middleware runs on every server request in SSR mode.

### API Routes

- Use `src/pages/api/` for server-side API endpoints (`.ts` files with exported `GET`, `POST`, etc. functions):

  ```ts
  // src/pages/api/users/[id].ts
  import type { APIRoute } from "astro";

  export const GET: APIRoute = async ({ params, request }) => {
    const user = await db.user.findUnique({ where: { id: params.id } });
    if (!user) return new Response(null, { status: 404 });
    return Response.json(user);
  };
  ```

- Validate API route inputs (path params, query strings, request body) with Zod. Return appropriate status codes and structured error responses.

## 3. Content Collections

- Define collections in `src/content/config.ts` using **Zod schemas** for type-safe front matter validation. A schema is mandatory for every content collection:

  ```ts
  import { defineCollection, z } from "astro:content";

  const blog = defineCollection({
    type: "content",
    schema: z.object({
      title: z.string().max(100),
      pubDate: z.coerce.date(),
      author: z.string(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      image: z.object({ url: z.string(), alt: z.string() }).optional(),
    }),
  });

  export const collections = { blog };
  ```

- Always validate front matter with a schema. AccessType never access front matter without type checking from the collection API.
- Use `getCollection()` and `getEntry()` helpers to query content — never read files from the file system directly (`fs.readFileSync`):

  ```ts
  const allPosts = await getCollection("blog", ({ data }) => !data.draft);
  const post = await getEntry("blog", "my-first-post");
  const { Content, headings } = await render(post);
  ```

- Use **`render()`** (Astro 5+) or `entry.render()` (Astro 4) to compile Markdown/MDX entries into `Content` component and `headings` data.
- For data collections (YAML/JSON reference data), use `type: 'data'` in the collection definition. Zod schema is enforced on all items.
- Use `reference()` to create typed relations between collections (e.g., a blog post references an author from an `authors` collection).

## 4. Performance & Optimization

### Image Optimization

- Use Astro's built-in `<Image />` component from `astro:assets` for **all** images. It automatically generates optimized formats (WebP/AVIF), correct `srcset`, `width`/`height`, and prevents Cumulative Layout Shift (CLS):

  ```astro
  ---
  import { Image } from 'astro:assets';
  import heroImage from '../assets/hero.jpg';
  ---
  <Image src={heroImage} alt="Hero image" width={1200} height={600} />
  ```

- For images from external URLs or CMS, use the `inferSize` prop or explicitly set `width` and `height`. Configure allowed image domains in `astro.config.mjs`.
- Place source images in `src/assets/` so Astro can process and optimize them. Images in `public/` are served verbatim without optimization.

### JavaScript & Performance

- Minimize the number of interactive islands. Each island adds JavaScript to the page. Prefer CSS-only interactions (hover, focus, `:has()` selectors) where possible.
- Enable **View Transitions** (`<ViewTransitions />`) for smooth, app-like page navigation without full page reloads. Annotate elements with `transition:name` for persistent element animations.
- Use `Astro.glob()` sparingly — it is lazy and untyped. Prefer Content Collections for content queries.
- Run `astro build` with `--verbose` to identify slow build steps. For large sites with many images, consider incremental builds with a build cache.
- Measure Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms. Run Lighthouse CI or `unlighthouse` against all pages on each release.
- Use **`astro:env`** (Astro 5+) for type-safe, schema-validated environment variables — catches missing or malformed env vars at build time, not at runtime:

  ```ts
  // env.d.ts
  import { defineEnv } from "astro/env";
  export const { DATABASE_URL, SECRET_KEY } = defineEnv({
    DATABASE_URL: { type: "string", context: "server", access: "secret" },
    PUBLIC_API_URL: { type: "string", context: "client", access: "public" },
  });
  ```

## 5. SSR, Build & Testing

### SSR & Adapters

- Default to `output: 'static'` for pure content sites and documentation. Use `output: 'server'` (full SSR) or `output: 'hybrid'` (static by default, selective SSR) when dynamic server features are needed.
- Install the appropriate **SSR adapter** for your deployment target:
  - **Node.js**: `@astrojs/node` — for VPS, Docker, standalone Node.js servers
  - **Cloudflare**: `@astrojs/cloudflare` — for Cloudflare Pages/Workers
  - **Vercel**: `@astrojs/vercel` — for Vercel Edge or Node.js runtime
  - **Netlify**: `@astrojs/netlify` — for Netlify Edge Functions
- In `hybrid` mode, opt specific pages into SSR with `export const prerender = false`. Mark static pages explicitly with `export const prerender = true`.
- Access server-side features in `.astro` files via `Astro.request`, `Astro.cookies`, `Astro.locals` (from middleware), and `Astro.redirect()`.
- Configure **middleware** for authentication: read session cookies in `src/middleware.ts`, set `locals.user`, and redirect unauthenticated requests:

  ```ts
  import { defineMiddleware } from "astro:middleware";

  export const onRequest = defineMiddleware(async (context, next) => {
    const session = context.cookies.get("session")?.value;
    context.locals.user = session ? await validateSession(session) : null;
    if (context.url.pathname.startsWith("/dashboard") && !context.locals.user) {
      return context.redirect("/login");
    }
    return next();
  });
  ```

### Testing & CI

- Run `astro check` (TypeScript type checking for `.astro` files) and `astro build` in CI. Fix all TypeScript errors before merging.
- Test interactive island components with the framework's own tooling: **Vitest** + **Testing Library** for React/Vue/Svelte islands.
- Write integration tests for API routes using `fetch` against a running `astro preview` server or Astro's test utilities.
- Use **Playwright** for E2E tests of full pages. Run `astro build && astro preview` to serve the production build for E2E testing before deployment.
- Use `@astrojs/check` CLI in CI to validate component types rigorously. Fix all errors — the check covers `.astro` frontmatter, props, and content.
- Configure **Lighthouse CI** (LHCI) in CI to measure Core Web Vitals on production builds and gate deployments on performance regression.
