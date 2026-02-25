# Nuxt.js Development Guidelines

> Objective: Define standards for building full-stack, SSR-capable Vue applications with Nuxt, covering directory conventions, data fetching, server-side Nitro patterns, state management, performance, and testing.

## 1. Directory Structure & Conventions

### Auto-Import Conventions

- Follow Nuxt's **file-based conventions**. Auto-imports are enabled for `components/`, `composables/`, `utils/`, and `stores/` — leverage them instead of manual imports. Document this in the project README so all contributors understand the convention.
- Prefix private internal files with `_` to prevent them from being auto-imported: `_helpers.ts`, `_InternalCard.vue`.
- Use the standard directory roles:

  ```text
  app/
  ├── pages/              # Routed views (file-based routing)
  ├── layouts/            # Shared page chrome (default, auth, dashboard)
  ├── components/         # Auto-imported UI components
  │   ├── Base/           # Generic: BaseButton.vue, BaseInput.vue
  │   └── features/       # Domain-specific: UserCard.vue
  ├── composables/        # Auto-imported composable functions (useAuth.ts)
  ├── utils/              # Auto-imported pure utility functions
  ├── stores/             # Pinia stores (auto-imported via useUserStore())
  ├── middleware/         # Route guards (auth.ts, admin.ts)
  ├── plugins/            # Third-party library initialization (*.client.ts, *.server.ts)
  └── server/
      ├── api/            # API endpoints (file-name encodes method)
      ├── middleware/      # H3 global middleware (auth, logging)
      ├── services/        # Server business logic (not auto-imported)
      └── utils/           # Server-only utilities (DB clients)
  ```

- Use **Nuxt Layers** (`extends` in `nuxt.config.ts`) to share components, composables, and configuration across multiple Nuxt apps as a maintainable base layer.
- Use `app/router.options.ts` for fine-grained router configuration instead of modifying Nuxt internals.

### TypeScript Configuration

- Use TypeScript throughout the entire project. Nuxt auto-generates `nuxt.d.ts`, `components.d.ts`, and auto-import type definitions. Run `nuxt prepare` after installation.
- Run **`nuxt typecheck`** (or `vue-tsc --noEmit`) in CI as a mandatory gate — it type-checks all pages, components, and composables.

## 2. Data Fetching

### SSR-Safe Fetching

- Use **`useFetch`** for route component data that must be available during SSR. Use **`useAsyncData`** for the same with more control (custom cache key, `execute`, `refresh`):

  ```typescript
  // Preferred for simple cases
  const { data: user, pending, error, refresh } = await useFetch(`/api/users/${userId}`);

  // useAsyncData for explicit key control and manual execution
  const { data: orders, execute } = await useAsyncData(
    `orders-${userId}`, // stable cache key
    () => $fetch(`/api/orders?userId=${userId}`),
    { lazy: true }, // don't block initial render
  );
  ```

- Use **`lazy: true`** for non-critical data fetches to avoid blocking initial page rendering. Combine with a loading skeleton:

  ```vue
  <template>
    <Suspense>
      <template #fallback><OrdersSkeleton /></template>
      <OrdersList v-if="!pending" :orders="orders" />
    </Suspense>
  </template>
  ```

- Use **`$fetch`** (Nuxt's isomorphic `ofetch` wrapper) for programmatic API calls in composables and event handlers:

  ```typescript
  async function createOrder(data: CreateOrderDto) {
    return await $fetch("/api/orders", { method: "POST", body: data });
  }
  ```

  Do NOT use the global `fetch` directly or import `axios` — `$fetch` handles JSON serialization, base URL resolution, and server-side proxying automatically.
- Forward browser cookies/auth headers in SSR context using `useRequestHeaders`:

  ```typescript
  const headers = useRequestHeaders(["cookie", "authorization"]);
  const { data } = await useFetch("/api/profile", { headers });
  ```

- Use the `key` option to differentiate requests and control cache invalidation:

  ```typescript
  // Refetches when route.params.id changes
  const { data } = await useFetch("/api/users", { key: () => route.params.id as string });
  ```

## 3. Server-Side (Nitro)

### API Endpoint Design

- Define API endpoints in `server/api/` using file-name method encoding:

  ```text
  server/api/
  ├── users/
  │   ├── index.get.ts      # GET /api/users
  │   ├── index.post.ts     # POST /api/users
  │   └── [id].get.ts       # GET /api/users/:id
  ```

- Use **`defineEventHandler`** for all server routes. Use **`readValidatedBody`** and **`getValidatedQuery`** with Zod for type-safe, validated input parsing:

  ```typescript
  // server/api/users/index.post.ts
  import { z } from "zod";

  const CreateUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
  });

  export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, CreateUserSchema.parse);
    const user = await userService.create(body);
    setResponseStatus(event, 201);
    return user;
  });
  ```

- Access environment variables with **`useRuntimeConfig()`** — never use `process.env` directly in server routes:

  ```typescript
  // nuxt.config.ts
  export default defineNuxtConfig({
    runtimeConfig: {
      apiSecret: process.env.API_SECRET, // server-only
      public: {
        apiBase: process.env.API_BASE_URL, // exposed to client
      },
    },
  });

  // In server route:
  const config = useRuntimeConfig();
  const secret = config.apiSecret; // available server-side only
  ```

- Use **H3 middleware** in `server/middleware/` for global server-side concerns (auth, rate limiting, request logging, request ID injection). Middleware files run for all API requests in alphabetical order.

## 4. State Management

### Pinia

- Use **Pinia** for global state management. Define stores in `stores/` for auto-import:

  ```typescript
  // stores/cartStore.ts
  export const useCartStore = defineStore("cart", () => {
    const items = ref<CartItem[]>([]);
    const total = computed(() => items.value.reduce((sum, i) => sum + i.total, 0));

    function addItem(product: Product, qty: number) {
      const existing = items.value.find((i) => i.productId === product.id);
      if (existing) existing.qty += qty;
      else items.value.push({ productId: product.id, product, qty, total: product.price * qty });
    }

    return { items, total, addItem };
  });
  ```

- Prefer `useFetch`/`useAsyncData` for server-fetched data over storing it in Pinia — Nuxt handles SSR hydration automatically for `useFetch` data.

### SSR-Safe Shared State

- Use **`useState()`** for SSR-safe shared state that needs to survive the hydration boundary without Pinia overhead:

  ```typescript
  const theme = useState<"light" | "dark">("theme", () => "light");
  ```

- Use **`useNuxtData()`** to share cached `useAsyncData`/`useFetch` data between components without re-fetching.

## 5. Performance, SEO & Testing

### Performance & Bundle Size

- Use **`@nuxt/image`** for automatic image optimization, lazy loading, and responsive `srcset` generation.
- Audit bundle size with `nuxt analyze` before production releases. Look for large dependencies in the client bundle.
- Use lazy component loading with the **`Lazy` prefix** on auto-imported components (`<LazyHeavyChart>`) for code splitting:

  ```vue
  <LazyHeavyChart v-if="showChart" :data="chartData" />
  ```

- Use Nuxt's **edge rendering** presets for latency-sensitive routes deployed to edge CDN networks:

  ```typescript
  // nuxt.config.ts
  export default defineNuxtConfig({ nitro: { preset: "cloudflare-pages" } });
  ```

### SEO & Metadata

- Use **`useSeoMeta()`** for structured meta tag management per page — type-safe and SSR-aware:

  ```typescript
  useSeoMeta({
    title: `${user.value?.name} — My App`,
    description: `Profile page for ${user.value?.name}`,
    ogTitle: `${user.value?.name} — My App`,
    ogImage: `https://myapp.com/og/${user.value?.id}.png`,
  });
  ```

- Use `useHead()` for non-meta head elements (scripts, links).

### Testing

- Write unit and component tests with **Vitest** + `@nuxt/test-utils`:

  ```typescript
  import { setup, $fetch } from "@nuxt/test-utils/e2e";

  describe("API endpoint", async () => {
    await setup({ rootDir: fileURLToPath(new URL("./", import.meta.url)) });

    it("returns 200 for valid request", async () => {
      const res = await $fetch("/api/users");
      expect(res).toHaveProperty("items");
    });
  });
  ```

- Run `nuxt build` and `nuxt typecheck` in CI as mandatory gates. Use **Playwright** for E2E tests of critical user flows (authentication, checkout, key navigation paths).
- Enable **Nuxt DevTools** during local development for performance analysis, composable inspection, and module management.
