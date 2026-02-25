# React Development Guidelines

> Objective: Define standards for building maintainable, performant, and accessible React applications using modern patterns, covering component design, hooks, state management, TypeScript integration, performance, and testing.

## 1. Components & Architecture

### Component Model

- **Functional Components only**: Use functional components and Hooks exclusively. Never write new class components — functional components with hooks are simpler, easier to test, and support all React features.
- **Naming**: `PascalCase` for component filenames (`UserProfile.tsx`) and component function names. The file name MUST match the exported component name. Named exports preferred over default exports for better IDE support and refactoring.
- **Purity**: React components must behave as pure functions with respect to props and state. Never mutate props. Never produce side effects during rendering (no API calls, no timers, no `document` access in the render path).
- **Single responsibility**: Each component should have one clear purpose. If a component has more than ~150 lines, consider extracting sub-components or custom hooks.

### Architecture Principles

- **Composition over inheritance**: Build complex UIs by composing small, focused components. Pass components as props (render props, `children`) for flexible composition.
- **Co-location**: Place a component's tests (`*.test.tsx`), styles (`*.module.css`), and Storybook story (`*.stories.tsx`) alongside the component file:
  ```text
  components/
  └── UserCard/
      ├── UserCard.tsx          # Component
      ├── UserCard.test.tsx     # Tests
      ├── UserCard.module.css   # Scoped styles
      └── UserCard.stories.tsx  # Storybook story
  ```
- **React Server Components (RSC)**: In Next.js App Router, default to Server Components for data fetching and rendering. Move to `'use client'` only when a component requires:
  - User interaction (onClick, onChange event handlers)
  - Browser-only APIs (localStorage, window, navigator)
  - React state or lifecycle hooks (useState, useEffect, useRef)
  - Third-party client-only libraries

### Recommended File Structure

```text
app/                          # Next.js App Router (or pages/ for legacy)
├── (auth)/                   # Route group
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx
components/
├── ui/                       # Generic UI components (shadcn/ui, custom design system)
└── features/                 # Feature-specific components
    └── UserProfile/
lib/
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand or Jotai stores
├── api/                      # Data fetching functions
└── utils/                    # Pure utility functions
```

## 2. Hooks

### Rules of Hooks

- **Strictly follow the Rules of Hooks**: Call hooks only at the top level of React functions (never inside conditions, loops, or nested functions). Enable and enforce **`eslint-plugin-react-hooks`** — treat all violations as errors.
- Provide **complete and accurate dependency arrays** for `useEffect`, `useCallback`, and `useMemo`. Never disable or suppress the `react-hooks/exhaustive-deps` lint rule — fix the root cause instead.

### Common Hooks Best Practices

```typescript
// useEffect — cleanup subscription, avoid stale closures
useEffect(() => {
  const subscription = dataStream.subscribe((data) => setData(data));
  return () => subscription.unsubscribe(); // cleanup on unmount/deps change
}, [dataStream]); // stable reference required

// useCallback — memoize callback passed to child components
const handleSubmit = useCallback(
  async (data: FormData) => {
    await submitForm(data);
  },
  [submitForm],
); // include all referenced values in deps

// useMemo — memoize expensive computation, not just any derived value
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.score - b.score),
  [items], // only recompute when items changes
);
```

### Custom Hooks

- Extract complex, reusable, or stateful logic into **custom hooks** (`use` prefix required). Custom hooks should be testable in isolation:

  ```typescript
  // hooks/useDebounce.ts
  export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
  }

  // hooks/usePagination.ts — encapsulates pagination state and logic
  // hooks/useIntersectionObserver.ts — wraps IntersectionObserver API
  ```

- Avoid having large `useEffect` blocks that handle multiple concerns — split by concern, one effect per concern.

## 3. State Management

### Decision Hierarchy

1. **URL/query string**: navigation state, search filters, shareable page state
2. **Local state** (`useState`/`useReducer`): component-scoped transient state
3. **Lifted state**: shared subtree state — lift to nearest common ancestor
4. **Context API**: static or rarely-changing global state (theme, locale, auth user)
5. **Zustand/Jotai**: frequently-changing global client state (shopping cart, UI flags)
6. **TanStack Query/SWR**: server state — remote data, caches, invalidation

### Server State

- Use **TanStack Query** (React Query) or **SWR** for all server-state management. Never put server-fetched data in Redux or Zustand:

  ```typescript
  // ✅ TanStack Query — automatic caching, refetch, loading/error states
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateUserData) => updateUser(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", userId] }),
  });
  ```

### Client Global State

- Use **Zustand** for lightweight global state. Keep stores small and domain-focused:

  ```typescript
  // stores/cartStore.ts
  interface CartStore {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (id: string) => void;
    total: () => number;
  }

  export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    addItem: (product) => set((state) => ({ items: [...state.items, { product, qty: 1 }] })),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.product.id !== id) })),
    total: () => get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
  }));
  ```

- Use **React 18 `useTransition`** and **`useDeferredValue`** to keep the UI responsive during expensive state updates. Use **React 19 Actions** (`<form action={serverAction}>`) for server-driven form submissions.

## 4. TypeScript Integration

- Define a **`Props` type or interface** for every component. Export it for consumers of your component library:

  ```typescript
  export interface UserCardProps {
    userId: string;
    variant?: 'compact' | 'expanded';
    onDelete?: (id: string) => void;
    className?: string;
  }

  export function UserCard({ userId, variant = 'compact', onDelete }: UserCardProps) {
    ...
  }
  ```

- Use **plain function declarations** with typed props instead of `React.FC<Props>`:
  - `React.FC` implicitly includes `children` (incorrect in most cases)
  - `React.FC` doesn't support generics cleanly
  - Plain functions have simpler TypeScript inference
- Use `ComponentPropsWithoutRef<'button'>` or `ComponentPropsWithRef<'button'>` for component wrappers that forward native HTML element props:
  ```typescript
  interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
    variant?: "primary" | "secondary";
    isLoading?: boolean;
  }
  ```
- Type `useRef` explicitly: `const ref = useRef<HTMLDivElement>(null)`. Type `useState` when the initial value doesn't convey the full type: `const [users, setUsers] = useState<User[]>([])`.

## 5. Performance, Accessibility & Testing

### Performance

- Use **`React.memo()`** to prevent unnecessary re-renders of pure, expensive leaf components. Always profile with **React DevTools Profiler** before adding memoization — it has overhead and can make performance worse when misapplied.
- Use **code splitting** with `React.lazy()` + `<Suspense>` for route-level and heavy component chunks:

  ```typescript
  const HeavyChart = React.lazy(() => import('./HeavyChart'));

  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart data={data} />
  </Suspense>
  ```

- Avoid rendering large lists without virtualization. Use **react-virtual** or **TanStack Virtual** to render only visible rows for lists > 100 items.
- Use **`<Image>`** (Next.js) or `loading="lazy"` on native images. Specify `width` and `height` to prevent layout shift (CLS).

### Accessibility

- Ensure all interactive elements are keyboard accessible. Use semantic HTML (`<button>`, `<a>`, `<label>`) — never `<div onClick>` or `<span onClick>` without ARIA.
- Components that render modals, dropdowns, or focus-trapping UI MUST manage focus correctly. Use `@radix-ui` (headless, accessible primitives) rather than implementing complex ARIA patterns from scratch.
- Test accessibility using `jest-axe` in component tests:

  ```typescript
  import { axe, toHaveNoViolations } from 'jest-axe';
  expect.extend(toHaveNoViolations);

  it('has no accessibility violations', async () => {
    const { container } = render(<UserCard userId="1" />);
    expect(await axe(container)).toHaveNoViolations();
  });
  ```

### Testing

- Write tests using **React Testing Library** with **`@testing-library/user-event`**. Test **behavior**, not implementation details: query by role, label, text, or `aria-*` attributes — not CSS classes or internal state:

  ```typescript
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';

  describe('LoginForm', () => {
    it('calls onLogin with credentials on valid submission', async () => {
      const onLogin = vi.fn();
      render(<LoginForm onLogin={onLogin} />);

      await userEvent.type(screen.getByLabelText('Email'), 'alice@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'secret');
      await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(onLogin).toHaveBeenCalledWith({ email: 'alice@example.com', password: 'secret' });
    });
  });
  ```

- Use **Vitest** (for Vite-based projects) or **Jest** as the test runner. Use **Playwright** or **Cypress** for E2E tests of critical user flows.
- Aim for > 80% coverage on components with business logic. Don't write meaningless snapshot tests — focus on edge cases and user interactions.
