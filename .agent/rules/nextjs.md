# Next.js Development Guidelines

> Objective: Define standards for building production-grade Next.js applications using the App Router.

## 1. App Router & Routing

- Use the **App Router** (`app/` directory) for all new Next.js 13+ projects. Avoid mixing with the Pages Router.
- Co-locate related files (components, styles, tests, utils) with their route segment in the `app/` directory.
- Use **Route Groups** (`(groupName)/`) to organize routes without affecting the URL path.

## 2. Server vs. Client Components

- Default to **Server Components**. Only add `"use client"` when you need interactivity, browser APIs, or React hooks.
- Keep the client boundary as low in the component tree as possible. Pass serializable props from Server to Client Components.
- Never fetch data inside a Client Component if it can be fetched in a Server Component instead.

## 3. Data Fetching

- Fetch data directly in Server Components using `async/await`. Leverage Next.js's extended `fetch` API with `cache` and `revalidate` options.
- Use **React Suspense** and `loading.tsx` for streaming and progressive rendering.
- Use **Server Actions** (`"use server"`) for form mutations and data writes instead of separate API routes where appropriate.

## 4. Performance

- Use `next/image` for all images to get automatic optimization, lazy loading, and correct sizing.
- Use `next/font` for all fonts to eliminate layout shift and optimize loading.
- Use **dynamic imports** (`next/dynamic`) to lazy-load heavy Client Components.
- Measure and target Core Web Vitals (LCP, CLS, INP) using `@vercel/analytics` or a real user monitoring tool (e.g., Datadog RUM, Sentry).

## 5. Environment Variables

- Prefix client-exposed variables with `NEXT_PUBLIC_`. Never expose secret keys with this prefix.
- Access server-only variables without the prefix inside Server Components, API Routes, and Server Actions.
