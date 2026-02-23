# React Development Guidelines

> Objective: React project conventions (hooks, components, state management).

## 1. Components

- **Functional Components**: Use functional components and Hooks. Avoid class components in new code.
- **Naming**: Use `PascalCase` for component filenames (e.g., `UserProfile.tsx`) and component names.
- **Purity**: React components must act as pure functions with respect to their props. Do not mutate props.

## 2. Hooks

- **Rules of Hooks**: Strictly follow the Rules of Hooks (only call Hooks at the top level, only from React functions). Enable `eslint-plugin-react-hooks`.
- **Dependencies**: Always specify comprehensive dependency arrays for `useEffect`, `useCallback`, and `useMemo`. Do not lie to the linter.
- **Custom Hooks**: Extract complex component logic into testable custom hooks (e.g., `useFetchData()`).

## 3. State Management

- **Local vs Global**: Use local state (`useState`, `useReducer`) for component-specific state. Use Context API or libraries (Redux, Zustand) only for truly global state (e.g., user sessions, themes).
- **Server State**: Use specialized libraries (e.g., React Query, SWR, Apollo) for fetching, caching, and updating server state.

## 4. Typing (TypeScript)

- **Interfaces**: Define `Props` interfaces for all components.
- **Avoid any**: Do not use `any`. Use `unknown` or specific types.
