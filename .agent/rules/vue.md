# Vue Development Guidelines

> Objective: Vue project conventions (Composition API, components, state).

## 1. API & Syntax

- **Composition API**: Use the Composition API with `<script setup>` for all new components. Avoid the Options API in modern codebases.
- **Single File Components (SFCs)**: Use `.vue` files, grouping template, script, and style.
- **TypeScript**: Use TypeScript (`<script setup lang="ts">`) for robust typing.

## 2. Component Design

- **Naming**: Use multi-word component names to prevent UI element conflicts (e.g., `TodoList.vue` instead of `Todo.vue`). Use `PascalCase` for filenames and imports.
- **Props & Emits**: Explicitly define and type props using `defineProps`. Define custom events using `defineEmits`.
- **V-model**: Use `v-model` for two-way binding on custom form input components.

## 3. State Management

- **Pinia**: Use Pinia as the standard state management library instead of Vuex for new projects.
- **Reactivity**: Understand the difference between `ref` (for primitives) and `reactive` (for objects). Prefer `ref` as the default for consistency and easy destructuring.

## 4. Directives & Rendering

- **Keys**: Always use a unique `key` attribute with `v-for`. Never use the array index as a key if the order of items can change.
- **Conditional vs Display**: Use `v-if` when elements are rarely toggled (it destroys/recreates the element). Use `v-show` for elements that are toggled frequently (it toggles CSS `display`).
