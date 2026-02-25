# Vue Development Guidelines

> Objective: Define standards for building maintainable, performant, and type-safe Vue applications.

## 1. API & Component Structure

- **Composition API**: Use the Composition API with `<script setup>` for all new components. Avoid the Options API in modern codebases.
- **Single File Components (SFCs)**: Use `.vue` files with a consistent block order: `<script setup>` → `<template>` → `<style scoped>`.
- **TypeScript**: Use TypeScript (`<script setup lang="ts">`) for all new components. Define types explicitly using `defineProps<Props>()` and `defineEmits<Events>()` with generic syntax.
- **Naming**: Use multi-word component names to prevent conflicts with HTML elements (e.g., `TodoList.vue` instead of `Todo.vue`). Use `PascalCase` for filenames and imports.
- Use private folders (`_components/`) to co-locate sub-components with their consuming parent and signal they are not for general use.

## 2. Props, Emits & Component Design

- **Props**: Explicitly define and type all props using `defineProps<Props>()`. Validate required props at the type level. Mark optional props with `?` and document defaults using `withDefaults`.
- **Emits**: Define all custom events using `defineEmits<{ 'update:modelValue': [value: string] }>()` with typed event signatures.
- **One-way data flow**: Props flow down; events flow up. Never mutate props directly inside a child component.
- **`v-model`**: Use `defineModel()` (Vue 3.4+) for two-way binding in custom input components. Support multiple named v-models when appropriate.
- **Slots**: Document default and named slots in the component using JSDoc comments for IDE discoverability.

## 3. State Management & Reactivity

- **Pinia**: Use **Pinia** as the standard state management library for new projects. Avoid Vuex. Organize stores by feature/domain, not by type (actions/mutations).
- **Reactivity**: Use `ref` (for primitives and when you need `.value`) and `reactive` (for complex object state). Prefer `ref` as the default for consistency and easy destructuring.
- **Computed**: Use `computed()` for derived state. Avoid computing derived values in templates directly — move them to computed properties for caching and testability.
- **Watch**: Use `watchEffect` for tracking all reactive dependencies automatically. Use `watch` for explicit source tracking with old/new value access. Always return a cleanup function from watchers that start subscriptions.

## 4. Directives & Rendering

- **Keys**: Always use a stable, unique `key` attribute with `v-for`. Never use the array index as a key if the order of items can change.
- **Conditional**: Use `v-if` for elements that are rarely toggled (destroys/recreates the DOM). Use `v-show` for elements that toggle frequently (CSS `display` only).
- **Custom Directives**: Use custom directives only for DOM-level manipulation that cannot be achieved through components or composables. Document the directive's behavior and lifecycle hooks.
- **`<Teleport>`**: Use `<Teleport>` for UI elements (modals, tooltips, notifications) that must render outside the component tree but need to be logically within the template.

## 5. Performance & Tooling

- Use **`<KeepAlive>`** to cache component state for tabs or wizard steps that users navigate back to frequently. Define explicit `include`/`exclude` to limit caching scope.
- Use **async components** (`defineAsyncComponent`) and route-level lazy loading (`() => import('./MyPage.vue')`) for code splitting and reduced initial bundle size.
- Use **Vue DevTools** to profile renders and inspect Pinia state. Identify and fix unnecessary re-renders before reaching for `v-memo` or `shallowRef` optimizations.
- Lint with **eslint-plugin-vue** (`vue3-recommended` ruleset) and **@typescript-eslint**. Format with **Prettier**. Enforce in CI.
- Use **Vitest** with `@vue/test-utils` for unit and component tests. Use **Playwright** or **Cypress** for E2E tests. Use `@testing-library/vue` for a11y-first component tests.
