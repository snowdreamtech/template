# Next.js Development Guidelines

> Objective: Define standards for building production-grade Next.js applications using the App Router.

## 1. App Router & Routing

- Use the **App Router** (`app/` directory) for all new Next.js 13+ projects. Avoid mixing with the Pages Router in the same project.
- Co-locate related files (components, styles, tests, utils) with their route segment in the `app/` directory using private folders (`_components/`).
- Use **Route Groups** (`(groupName)/`) to organize routes without affecting the URL path.
- Use **Parallel Routes** (`@slot`) and **Intercepting Routes** for complex UX patterns (modals, split views) without JavaScript-only state.
- Handle 404s and errors with `not-found.tsx` and `error.tsx` — define them at each route segment level as needed.

## 2. Server vs. Client Components

- Default to **Server Components**. Only add `"use client"` when you need interactivity, browser APIs, or React hooks.
- Keep the client boundary as low in the component tree as possible. Pass serializable data (not functions or class instances) from Server to Client Components.
- Never fetch data inside a Client Component if it can be fetched in a Server Component — move the data fetching up the tree.
- Use **`"use server"`** directives for Server Actions. Validate all inputs server-side (never trust the client) using Zod or a similar schema validator.

## 3. Data Fetching & Caching

- Fetch data directly in **Server Components** using `async/await`. Leverage Next.js's extended `fetch` API with `cache` and `next.revalidate` options.
- Use **React Suspense** and `loading.tsx` for streaming and progressive page rendering.
- Use **Server Actions** (`"use server"`) for form mutations and data writes; use `revalidatePath()` or `revalidateTag()` to invalidate cached data after mutations.
- For client-side data, use **TanStack Query** to integrate with Server Actions or API Routes.

## 4. Performance

- Use `next/image` for all images: automatic optimization, lazy loading, and layout shift prevention.
- Use `next/font` for all fonts to eliminate layout shift and remove external font requests.
- Use **dynamic imports** (`next/dynamic`) to lazy-load heavy Client Components.
- Measure and target Core Web Vitals (LCP, CLS, INP) using Vercel Analytics, Datadog RUM, or Web Vitals API.
- Prefer **Partial Prerendering (PPR)** (Next.js 14+) to statically generate the shell and stream dynamic content.

## 5. Environment Variables & Security

- Prefix client-exposed variables with `NEXT_PUBLIC_`. Never expose secret keys (API tokens, DB passwords) with this prefix.
- Access server-only variables (without `NEXT_PUBLIC_`) exclusively inside Server Components, API Routes, and Server Actions.
- Validate all environment variables at build/startup time using Zod or `@t3-oss/env-nextjs`. Fail fast if required variables are missing.
- Use **middleware** (`middleware.ts`) for authentication guards, rate limiting, and geolocation-based routing. Keep middleware thin and fast — it runs on every request.
