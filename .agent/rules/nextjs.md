# Next.js Development Guidelines

> Objective: Define standards for building production-grade Next.js applications using the App Router.

## 1. App Router & Routing

- Use the **App Router** (`app/` directory) for all new Next.js 13+ projects. Avoid mixing with the Pages Router in the same project.
- Co-locate related files (components, styles, tests, utils) with their route segment in the `app/` directory using private folders (`_components/`, `_lib/`).
- Use **Route Groups** (`(groupName)/`) to organize routes without affecting the URL path. Useful for different layouts sharing the same path prefix.
- Use **Parallel Routes** (`@slot`) and **Intercepting Routes** for complex UX patterns (modals while maintaining URL state, split views) without JavaScript-only hacks.
- Handle 404s and errors with `not-found.tsx` and `error.tsx` — define them at each route segment level as needed. Use `global-error.tsx` for root-level unhandled errors.

## 2. Server vs. Client Components

- Default to **Server Components**. Add `"use client"` only when you need interactivity, browser APIs (`window`, `localStorage`), or React hooks.
- Keep the client boundary as low in the component tree as possible. Pass serializable data (not functions or class instances) from Server to Client Components.
- Never fetch data inside a Client Component if it can be done in a Server Component — move data fetching up the tree.
- Use **`"use server"`** directives for Server Actions. Validate all inputs server-side using Zod. Never trust the client.
- Use `React.cache()` in Server Components to deduplicate expensive function calls across a single render pass.

## 3. Data Fetching & Caching

- Fetch data directly in **Server Components** using `async/await`. Leverage Next.js's extended `fetch` API with `{ cache: "force-cache" | "no-store" }` and `next: { revalidate, tags }` options.
- Use **React Suspense** and `loading.tsx` for streaming and progressive page rendering. Wrap slow data blocks in `<Suspense fallback={...}>`.
- Use **Server Actions** (`"use server"`) for form mutations and data writes; use `revalidatePath()` or `revalidateTag()` to invalidate stale cached data after mutations.
- For client-side data and real-time updates, use **TanStack Query** or SWR. Integrate with Server Actions via `useMutation`.

## 4. Performance

- Use `next/image` for all images: automatic optimization, lazy loading, AVIF/WebP conversion, and layout shift prevention via required `width`/`height`.
- Use `next/font` for all fonts to eliminate CLS and remove external font requests. Fonts are self-hosted automatically.
- Use **dynamic imports** (`next/dynamic`) to lazy-load heavy Client Components. Use `{ ssr: false }` for browser-only components.
- Measure and target Core Web Vitals (LCP, CLS, INP) using Vercel Analytics, Datadog RUM, or the Web Vitals API.
- Use **Partial Prerendering (PPR)** (Next.js 14+) to statically prerender the shell and stream dynamic content, combining the best of static and dynamic rendering.

## 5. Environment Variables & Security

- Prefix client-exposed variables with `NEXT_PUBLIC_`. Never expose secret keys (API tokens, DB passwords) with this prefix.
- Access server-only variables exclusively inside Server Components, API Routes, and Server Actions.
- Validate all environment variables at build/startup time using Zod or `@t3-oss/env-nextjs`. Fail fast with descriptive errors if required variables are missing.
- Use **middleware** (`middleware.ts`) for authentication guards, rate limiting, and geolocation-based routing. Keep middleware thin and fast — it runs on every request.
- Use **`next-safe-headers`** or manual `headers()` in `next.config.js` to set `Content-Security-Policy`, `X-Frame-Options`, `Permissions-Policy`, and other security headers.
