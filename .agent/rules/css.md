# CSS Development Guidelines

> Objective: Define standards for maintainable, scalable, and performant CSS.

## 1. Methodology & Architecture

- Choose and consistently apply **one** CSS methodology across the project: **BEM** (Block-Element-Modifier), **SMACSS**, or **Utility-First** (Tailwind CSS). Do not mix strategies in the same codebase.
- For BEM: use the `.block__element--modifier` naming convention. Avoid deep element chains beyond two levels (`.block__el1__el2`). Extract as a new block instead.
- Organize stylesheets logically using CSS cascade layers: `@layer tokens` → `@layer base/reset` → `@layer layout` → `@layer components` → `@layer utilities`.
- Use a **CSS Reset** (e.g., `@layer base` in Tailwind, or modern-normalize) to establish a consistent cross-browser baseline before applying custom styles.
- Scope component styles to avoid pollution: use BEM, CSS Modules, or scoped `<style>` blocks (Vue/Svelte) — never rely on document-level element or descendant selectors.

## 2. Custom Properties (Design Tokens)

- Use **CSS Custom Properties** (`--color-primary: hsl(210, 80%, 45%)`) for all design tokens: colors, spacing, type scale, border radii, shadows, and z-index layers.
- Define all tokens in `:root` and override in `.dark` or `[data-theme="dark"]` for automatic dark mode support.
- Never hard-code raw values in component rules that should come from tokens. Referencing tokens makes global theme changes automatic and auditable.
- For complex design systems, use a tool like **Style Dictionary** or **Theo** to generate tokens from a single JSON source of truth across platforms (CSS, iOS, Android).

## 3. Selectors & Specificity

- Prefer class selectors (`.component`) over element selectors (`div`) or ID selectors (`#id`) for styling. IDs have high specificity and cannot be reused.
- Keep selector specificity as flat and low as possible. Avoid nesting beyond 2–3 levels even with CSS preprocessors or the native `&` nesting.
- Do not use `!important` except to override third-party library styles — always add a comment explaining why it is necessary.
- Use `:is()`, `:where()`, and `:has()` pseudo-classes for concise, readable selectors. `:where()` has zero specificity, making it ideal for resets.

## 4. Responsive Design

- Follow a **mobile-first** approach: write base styles for small screens, then layer enhancements for larger viewports using `@media (min-width: ...)`.
- Use **relative units** (`rem`, `em`, `%`, `vw`, `svh`, `dvh`) over fixed `px` for layout, typography, and spacing.
- Use CSS **Grid** for two-dimensional layouts and **Flexbox** for one-dimensional layouts. Avoid positioning-based layout hacks.
- Define breakpoints as named custom properties or in a single dedicated `_breakpoints.css` file to ensure consistency across the project.
- Use **`@container` queries** for component-level responsive design — adapting a component's layout based on its container's size, not the viewport. This enables truly reusable components that adapt to where they are placed.

## 5. Performance & Tooling

- Use `transform` and `opacity` exclusively for smooth, GPU-accelerated animations. Avoid animating **layout-triggering properties** (`width`, `height`, `top`, `margin`) which cause expensive reflows.
- Remove unused CSS in production builds using **PurgeCSS** or Tailwind's built-in JIT purging. Monitor CSS bundle size with Lighthouse.
- Lint with **Stylelint** (`stylelint-config-standard` or `stylelint-config-recommended`). Enforce property order, no duplicate rules, no invalid values. Integrate into CI and pre-commit hooks.
- Format CSS with **Prettier**. Use **PostCSS** for modern CSS features (nesting, custom media, logical properties, `@layer`) with the appropriate plugins.
