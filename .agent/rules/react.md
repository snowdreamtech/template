# React Development Guidelines

> Objective: Define standards for building maintainable, performant, and accessible React applications using modern patterns.

## 1. Components & Architecture

- **Functional Components**: Use functional components and Hooks exclusively. Avoid class components in new code.
- **Naming**: Use `PascalCase` for component filenames (e.g., `UserProfile.tsx`) and component names. File name must match the component name.
- **Purity**: React components must act as pure functions with respect to their props. Do not mutate props or produce side effects during rendering.
- **Composition**: Favor composition over inheritance. Build complex UIs by composing small, focused components.
- **Co-location**: Co-locate a component's styles (`*.module.css`), tests (`*.test.tsx`), and Storybook story (`*.stories.tsx`) with the component file.
- In **React Server Components** (RSC) environments (Next.js App Router), default to Server Components for data fetching and rendering. Add `'use client'` only when a component needs interactivity, browser APIs, or event handlers.

## 2. Hooks

- **Rules of Hooks**: Strictly follow the Rules of Hooks (only call Hooks at the top level, only from React functions). Enable and obey `eslint-plugin-react-hooks`.
- **Dependencies**: Provide comprehensive, accurate dependency arrays for `useEffect`, `useCallback`, and `useMemo`. Never suppress the `exhaustive-deps` lint rule — fix the root cause.
- **Custom Hooks**: Extract complex, reusable component logic into testable custom hooks (e.g., `useAuth()`, `usePagination()`).
- **`useEffect` discipline**: Every effect should have a clear cleanup function if it starts a subscription, timer, or listener. Avoid large `useEffect` blocks — split by concern.
- **Performance**: Use `useMemo` and `useCallback` to prevent expensive recalculations and unnecessary child re-renders. Profile before adding memoization — it has overhead too.

## 3. State Management

- **Local vs Global**: Use local state (`useState`, `useReducer`) for component-specific or subtree state. Lift state only as high as necessary.
- **Context API**: Use React Context for static or rarely-changing global state (theme, locale, authenticated user). For frequently changing state, Context causes unnecessary rerenders — use a dedicated store.
- **Server State**: Use **TanStack Query** (React Query), **SWR**, or **Apollo Client** for fetching, caching, and mutating server state. Do not manage server state in Redux/Zustand.
- **Client Global State**: Use **Zustand** or **Jotai** for lightweight global client state. Use **Redux Toolkit** only for complex state machines with deeply nested updates.
- Use **`useTransition`** (React 18+) to mark non-urgent state updates as transitions, keeping the UI responsive during heavy re-renders. Use **React 19 Actions** (`<form action={serverAction}>`) for server-driven form submissions without manual `onSubmit` wiring.

## 4. TypeScript Integration

- Define a **`Props` interface** for every component: `interface UserCardProps { userId: string; onDelete: (id: string) => void }`.
- Never use `any`. Use `unknown` for genuinely unknown values and narrow before use.
- Prefer plain function definitions with typed props argument: `function UserCard({ userId }: UserCardProps)` over `React.FC<Props>`, as `React.FC` implicitly includes `children`.
- Use `ComponentPropsWithoutRef<'button'>` for wrapping native HTML elements to correctly forward all native props.

## 5. Performance & Accessibility

- Use `React.memo()` to prevent unnecessary re-renders of pure, expensive components. Profile with React DevTools Profiler before memoizing.
- Use **code splitting** with `React.lazy` and `Suspense` for route-level and heavy component lazy loading.
- Ensure all interactive elements are keyboard accessible. Use semantic HTML elements (`<button>`, `<a>`, `<label>`) — never `<div onClick>`.
- Write tests using **React Testing Library** with user-event. Test behavior, not implementation: query by role, label, or text — not by class or `data-testid` unless unavoidable.
- Use **Vitest** or **Jest** + `@testing-library/react` for unit and integration tests. Use **Playwright** or **Cypress** for E2E tests.
