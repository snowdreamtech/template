# Next.js Development Guidelines

> Objective: Define standards for building production-grade Next.js applications using the App Router, covering routing, Server/Client Components, data fetching, caching, performance, and security.

## 1. App Router & Routing

### File System Routing Conventions

- Use the **App Router** (`app/` directory) for all new Next.js 13+ projects. Avoid mixing with the Pages Router in the same project — they have fundamentally different data fetching models.
- Co-locate related files (components, styles, tests, utils) with their route segment using **private folders** (`_components/`, `_lib/`) — underscore prefix prevents the folder from being treated as a route:
  ```text
  app/
  ├── (marketing)/         # Route Group — no URL impact
  │   ├── about/page.tsx
  │   └── blog/
  │       ├── page.tsx
  │       └── [slug]/page.tsx
  ├── (app)/               # Route Group — different layout
  │   ├── layout.tsx
  │   ├── dashboard/
  │   │   ├── page.tsx
  │   │   ├── _components/  # Private — not a route
  │   │   └── loading.tsx
  │   └── users/
  │       ├── page.tsx
  │       └── [id]/
  │           ├── page.tsx
  │           └── not-found.tsx
  └── layout.tsx           # Root layout
  ```
- Use **Route Groups** (`(groupName)/`) to organize routes without affecting the URL path — enables different layouts for the same path prefix.
- Use **Parallel Routes** (`@slot/`) and **Intercepting Routes** (`(..)segment`) for complex UX: modals while preserving URL state, split-view dashboards — without JavaScript-only hacks.
- Define `not-found.tsx` (404), `error.tsx` (error boundaries), and `loading.tsx` (Suspense fallback) at each route segment level as needed. Use `global-error.tsx` for root-level unhandled errors.

## 2. Server vs. Client Components

### Component Model

- Default to **Server Components** — they run on the server, have no JavaScript bundle cost, and can directly access databases, file system, and secrets:

  ```tsx
  // Server Component — no "use client" needed — runs on server only
  export default async function UserProfile({ params }: { params: { id: string } }) {
    const user = await db.user.findUnique({ where: { id: params.id } });
    if (!user) notFound();

    return (
      <>
        <h1>{user.name}</h1>
        <UserActions userId={user.id} /> {/* Client Component boundary */}
      </>
    );
  }
  ```

- Add **`"use client"`** only when a component needs interactivity, browser APIs (`window`, `document`, `localStorage`), React hooks (`useState`, `useEffect`), or event listeners.
- Keep the **client boundary as low in the component tree as possible**. Pass only serializable data (strings, numbers, plain objects, arrays — not functions, class instances, or Date objects) from Server to Client Components.

### Server Actions

- Use **`"use server"`** directives for form mutations and data writes. Server Actions run on the server and can be called directly from Client Components:

  ```tsx
  // actions/users.ts
  "use server";

  import { revalidateTag } from "next/cache";
  import { z } from "zod";

  const updateNameSchema = z.object({ name: z.string().min(1).max(100) });

  export async function updateUserName(userId: string, formData: FormData) {
    const { name } = updateNameSchema.parse(Object.fromEntries(formData)); // ← always validate server-side

    await db.user.update({ where: { id: userId }, data: { name } });
    revalidateTag(`user-${userId}`); // invalidate cached user data
  }
  ```

- Use `React.cache()` in Server Components to deduplicate expensive function calls within the same render request (useful for deduplicating database calls across multiple components in the tree).

## 3. Data Fetching & Caching

### Fetch & Cache Strategy

- Fetch data directly in Server Components using `async/await`. Use Next.js's extended `fetch` API with cache directives:

  ```tsx
  // Static (cached indefinitely, revalidated on-demand or at build time)
  const data = await fetch("https://api.example.com/products", {
    next: { tags: ["products"] }, // tag for on-demand revalidation
  });

  // Time-based revalidation (ISR)
  const posts = await fetch("https://cms.example.com/posts", {
    next: { revalidate: 3600 }, // revalidate every hour
  });

  // Dynamic per-request (no caching)
  const user = await fetch(`https://api.example.com/users/${id}`, {
    cache: "no-store", // opt out of caching
  });
  ```

- Use **React Suspense** and `loading.tsx` for streaming and progressive rendering. Wrap slow data-fetching blocks in `<Suspense>` to unblock the rest of the page:
  ```tsx
  export default function Dashboard() {
    return (
      <>
        <header>Dashboard</header>
        <Suspense fallback={<OrdersSkeleton />}>
          <Orders /> {/* Streams when ready, doesn't block above content */}
        </Suspense>
      </>
    );
  }
  ```
- Use **on-demand ISR** (`revalidateTag()` / `revalidatePath()`) from API route handlers or Server Actions when upstream data changes (CMS webhook, payment event):
  ```tsx
  // api/webhooks/cms/route.ts
  export async function POST(req: Request) {
    const { tag } = await req.json();
    revalidateTag(tag);
    return Response.json({ revalidated: true });
  }
  ```
- For client-side data and real-time updates, use **TanStack Query** (`useQuery`, `useMutation`) or SWR. Seed initial data from `initialData` passed from a Server Component.

## 4. Performance

### Image & Font Optimization

- Use **`next/image`** for all images — automatic AVIF/WebP conversion, lazy loading, and layout shift prevention via required `width`/`height` or `fill` + `sizes` attribute:
  ```tsx
  <Image
    src="/hero.jpg"
    alt="Hero image"
    width={1400}
    height={700}
    priority // above-fold images: skip lazy loading
    sizes="(max-width: 768px) 100vw, 1400px"
  />
  ```
- Use **`next/font`** for all web fonts — eliminates layout shift, removes external font requests, and self-hosts fonts automatically:
  ```tsx
  import { Inter } from "next/font/google";
  const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
  ```

### Bundle & Rendering

- Use **`next/dynamic`** to lazy-load heavy Client Components and reduce the initial bundle:
  ```tsx
  const HeavyChart = dynamic(() => import("./_components/HeavyChart"), {
    loading: () => <ChartSkeleton />,
    ssr: false, // for browser-only libraries (e.g., chart.js, mapbox)
  });
  ```
- Use **Partial Prerendering (PPR)** (Next.js 14+) to statically prerender the shell and stream dynamic content — combines static performance with dynamic data.
- Measure and target Core Web Vitals (LCP, CLS, INP) with Vercel Analytics, Datadog RUM, or the Web Vitals API. Target LCP < 2.5s, CLS < 0.1.

## 5. Environment Variables & Security

### Configuration & Validation

- Prefix client-exposed variables with **`NEXT_PUBLIC_`**. Never expose secrets (API tokens, DB passwords, private keys) with this prefix — they will be bundled into the client JavaScript:

  ```bash
  # .env — server-only (not exposed to browser)
  DATABASE_URL="postgres://..."
  STRIPE_SECRET_KEY="sk_live_..."

  # Exposed to browser — safe to be public
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
  NEXT_PUBLIC_APP_URL="https://app.example.com"
  ```

- Validate all environment variables at build/startup time using **Zod** or **`@t3-oss/env-nextjs`**. Fail with descriptive errors if required variables are missing — never deploy with silently-missing config.

### Security Headers & Middleware

- Use **middleware** (`middleware.ts`) for authentication guards and rate limiting. Keep middleware thin and fast — it runs in the Edge runtime on every matched request:

  ```typescript
  // middleware.ts
  import { NextResponse } from "next/server";

  export function middleware(request) {
    const token = request.cookies.get("session_token");
    if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  ```

- Set security headers in `next.config.js`:
  ```javascript
  const headers = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "Content-Security-Policy", value: cspHeader },
  ];
  ```
- In **Next.js 15**, enable `experimental.dynamicIO` to enforce explicit caching intent for all data fetching — catching accidental cache misses and over-caching during development.
