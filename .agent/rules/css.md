# CSS Development Guidelines

> Objective: Define standards for maintainable, scalable, and performant CSS.

## 1. Methodology & Architecture

- Choose and consistently apply **one** CSS methodology across the project: **BEM** (Block-Element-Modifier), **SMACSS**, or **Utility-First** (Tailwind CSS). Do not mix strategies.
- For BEM: use the `.block__element--modifier` naming convention. Avoid deep element chains beyond two levels (`.block__element1__element2`).
- Organize stylesheets logically: `tokens/variables` → `base/reset` → `layout` → `components` → `utilities`.
- Use a **CSS Reset** (e.g., `@layer base` in Tailwind, or modern-normalize) to establish a consistent cross-browser baseline before applying custom styles.

## 2. Custom Properties (Design Tokens)

- Use **CSS Custom Properties** (`--color-primary: hsl(210, 80%, 45%)`) for all design tokens: colors, spacing, typography type scales, border radii, shadows, and z-index layers.
- Define all tokens in `:root` and override in `.dark` or `[data-theme="dark"]` for dark mode support.
- Never hard-code raw values in component rules that should come from tokens. Referencing a token makes global theme changes automatic.
- For complex design systems, use a tool like **Style Dictionary** or **Theo** to generate tokens from a single source of truth across platforms.

## 3. Selectors & Specificity

- Prefer class selectors (`.component`) over element selectors (`div`) or ID selectors (`#id`) for styling. IDs have high specificity and cannot be reused.
- Keep selector specificity as flat and as low as possible. Avoid nesting beyond 2-3 levels even with CSS preprocessors.
- Do not use `!important` except to override third-party library styles — always add a comment explaining why it is necessary.
- Use `:is()`, `:where()`, and `:has()` pseudo-classes for concise, readable selectors. `:where()` has zero specificity, making it useful for utility resets.

## 4. Responsive Design

- Follow a **mobile-first** approach: write base styles for small screens, then layer styles for larger viewports using `@media (min-width: ...)`.
- Use **relative units** (`rem`, `em`, `%`, `vw`, `svh`) over fixed `px` for layout, typography, and spacing.
- Use CSS **Grid** for two-dimensional layouts and **Flexbox** for one-dimensional layouts. Avoid positioning-based layout hacks.
- Define breakpoints as named custom properties or in a single dedicated `_breakpoints.css` file to ensure consistency.

## 5. Performance & Tooling

- Avoid **layout-triggering properties** (`width`, `height`, `top`, `margin`) in animations. Use `transform` and `opacity` exclusively for smooth, GPU-accelerated animations.
- Remove unused CSS in production builds using **PurgeCSS** or Tailwind's built-in JIT purging. Monitor CSS bundle size with Lighthouse.
- Lint with **Stylelint** (`stylelint-config-standard` or `stylelint-config-recommended`). Enforce property order, no duplicate rules, no invalid values. Integrate into CI and pre-commit hooks.
- Format CSS with **Prettier** (auto-formats `.css`, `.scss`, `.vue` style blocks). Use **PostCSS** for modern CSS features (nesting, custom media, logical properties) with the appropriate plugins.
