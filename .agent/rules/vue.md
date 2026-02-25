# Vue Development Guidelines

> Objective: Define standards for building maintainable, performant, and type-safe Vue applications using Vue 3's Composition API and TypeScript, covering component design, state management, reactivity, rendering, and tooling.

## 1. Component Structure & File Organization

### Composition API & Single File Components

- **Use the Composition API with `<script setup>`** for all new components. Avoid the Options API in new code — it is more verbose, harder to type, and offers no tree-shaking benefits.
- Use `.vue` Single File Components (SFCs) with this consistent block order:

  ```vue
  <script setup lang="ts">
  // 1. Script (composables, props, emits, computed, methods)
  </script>

  <template>
    <!-- 2. Template markup -->
  </template>

  <style scoped>
  /* 3. Scoped styles */
  </style>
  ```

- Use **TypeScript** (`<script setup lang="ts">`) for all new components. Define types explicitly using generic syntax with `defineProps<Props>()` and `defineEmits<Events>()`.

### Naming Conventions

- Use **multi-word component names** for user-defined components to avoid conflicts with existing and future HTML elements (`UserCard.vue` not `Card.vue`).
- Use **`PascalCase`** for component filenames and imports: `UserProfile.vue`, `import UserProfile from './UserProfile.vue'`.
- Use **`kebab-case`** in templates when including components: `<user-profile />` or `<UserProfile />` (both are valid; be consistent within a project).

### File Layout

```text

src/
├── components/
│   ├── ui/               # Generic UI components (buttons, modals, avatars)
│   │   └── BaseButton.vue
│   └── features/
│       └── UserCard/
│           ├── UserCard.vue
│           ├── UserCard.test.ts  # co-located test
│           └── _UserAvatar.vue   # private sub-component (prefix with _)
├── composables/          # Reusable Composition API logic
│   └── useAuth.ts
├── stores/               # Pinia stores
│   └── userStore.ts
└── views/                # Page-level components (routed views)
    └── UserProfileView.vue

```

## 2. Props, Emits & Component Design

### Props

- Define and type all props using `defineProps<Props>()`. Document defaults with `withDefaults()`:

  ```typescript
  interface Props {
    userId: string;
    variant?: "compact" | "expanded";
    showActions?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: "compact",
    showActions: true,
  });
  ```

- **One-way data flow**: Props flow down; events flow up. Never mutate a prop directly inside a child component.

### Emits

- Define all custom events with typed event signatures:

  ```typescript
  const emit = defineEmits<{
    "update:modelValue": [value: string];
    delete: [id: string];
    submit: [data: FormData];
  }>();
  ```

### Two-Way Binding

- Use **`defineModel()`** (Vue 3.4+) for custom `v-model` bindings — much cleaner than manual `modelValue`/`update:modelValue` pairs:

  ```typescript
  // ✅ Vue 3.4+ v-model shorthand
  const model = defineModel<string>({ required: true });

  // Or with validation:
  const count = defineModel<number>({ default: 0, validator: (v) => v >= 0 });
  ```

## 3. State Management & Reactivity

### Pinia

- Use **Pinia** as the standard state management library. Organize stores by feature/domain:

  ```typescript
  // stores/userStore.ts
  import { defineStore } from "pinia";

  export const useUserStore = defineStore("user", () => {
    const currentUser = ref<User | null>(null);
    const isAuthenticated = computed(() => currentUser.value !== null);

    async function login(credentials: LoginCredentials) {
      const user = await authService.login(credentials);
      currentUser.value = user;
    }

    function logout() {
      currentUser.value = null;
    }

    return { currentUser, isAuthenticated, login, logout };
  });
  ```

  Use the **setup store** syntax (function-based) over the options-based store for better TypeScript support and composability.

### Composables

- Extract reusable stateful logic into **composables** (`use` prefix convention):

  ```typescript
  // composables/usePagination.ts
  export function usePagination(fetchFn: (params: PaginationParams) => Promise<PaginatedResult<any>>) {
    const page = ref(1);
    const items = ref<any[]>([]);
    const total = ref(0);
    const isLoading = ref(false);

    async function loadPage(p: number) {
      isLoading.value = true;
      try {
        const result = await fetchFn({ page: p, limit: 20 });
        items.value = result.items;
        total.value = result.total;
        page.value = p;
      } finally {
        isLoading.value = false;
      }
    }

    return { page: readonly(page), items: readonly(items), total, isLoading, loadPage };
  }
  ```

### Reactivity Primitives

- Use **`ref`** for primitives and object references. Use **`reactive`** for complex object state only when you need deep reactive access without `.value`. Prefer `ref` as the default for consistency.
- Use **`computed()`** for all derived state — never compute derived values in templates:

  ```typescript
  const fullName = computed(() => `${user.value?.firstName} ${user.value?.lastName}`.trim());
  const activeUsers = computed(() => users.value.filter((u) => u.isActive));
  ```

- Use **`watchEffect`** when all reactive dependencies should be tracked automatically. Use **`watch`** when you need explicit source control, access to old values, or lazy evaluation:

  ```typescript
  // watchEffect — auto-tracks all reactive deps accessed inside
  watchEffect(() => {
    document.title = `${unreadCount.value} — MyApp`;
  });

  // watch — explicit source, old/new values
  watch(
    userId,
    async (newId, oldId) => {
      if (newId !== oldId) await loadUserProfile(newId);
    },
    { immediate: true },
  );
  ```

- Always return a **cleanup function** from watchers that start subscriptions to prevent memory leaks.

## 4. Directives & Rendering

- Always provide a **stable, unique `key`** with `v-for`. **Never use array index** as a key when items can be reordered, filtered, or deleted:

  ```vue
  <!-- ❌ Index key — breaks animations, component state, recycling -->
  <TodoItem v-for="(todo, i) in todos" :key="i" />

  <!-- ✅ Stable ID key -->
  <TodoItem v-for="todo in todos" :key="todo.id" :todo="todo" />
  ```

- Use **`v-if`** for elements that are rarely shown — it removes the DOM element entirely. Use **`v-show`** for elements that toggle frequently — it only toggles CSS `display`.
- Never use `v-if` and `v-for` on the same element. `v-for` has higher priority; use `computed()` to pre-filter the array instead.
- Use **`<Teleport>`** for modals, notifications, and tooltips that must render in a different DOM location (e.g., directly in `<body>`) while remaining logically in the component tree.

## 5. Performance, Accessibility & Tooling

### Performance

- Use **`<KeepAlive>`** to cache component state for tabs or wizard steps users navigate back to. Use `include`/`exclude` to limit caching scope — don't cache everything.
- Use **`defineAsyncComponent()`** and route-level lazy loading for code splitting:

  ```typescript
  const HeavyDashboard = defineAsyncComponent(() => import("./HeavyDashboard.vue"));
  ```

- Use **Vue DevTools** to profile renders and inspect Pinia state. Identify unnecessary re-renders before reaching for `v-memo` or `shallowRef` manual optimizations.
- Use **`shallowRef()`** for large, externally-managed data structures (canvas state, chart data) where deep reactivity tracking would be wasteful.

### Accessibility

- Use semantic HTML elements (`<button>`, `<a>`, `<label>`) — never `<div @click>` for interactive controls in Vue templates.
- Components rendering modals and dropdowns MUST manage focus. Use `@radix-ui/vue` (Radix Vue) or Headless UI for accessible compound components.
- Test accessibility with `jest-axe` in component tests and `@testing-library/vue` for a11y-first test querying.

### Tooling

- Lint with **`eslint-plugin-vue`** (`vue3-recommended`) and **`@typescript-eslint`**. Format with **Prettier**. Enforce both in CI with `--max-warnings 0`.
- Write component tests with **Vitest** + `@vue/test-utils` or **`@testing-library/vue`**. Use **Playwright** or **Cypress** for E2E tests of critical user flows.
- Use **Volar** (Vue Language Features) as the VS Code extension — not Vetur. Enable `"volar.inlayHints.optionsWrapper"` for richer template type inference.
- Run `vue-tsc --noEmit` in CI for full Vue SFC type checking across all templates.
