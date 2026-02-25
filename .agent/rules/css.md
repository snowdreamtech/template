# CSS Development Guidelines

> Objective: Define standards for maintainable, scalable, performant, and accessible CSS across project types, covering methodology, design tokens, selectors, responsive design, animation, and tooling.

## 1. Methodology & Architecture

- Choose and consistently apply **one** CSS methodology across the entire project. Do not mix strategies:
  | Methodology | Best for | Key pattern |
  |---|---|---|
  | **BEM** | Traditional class-based projects | `.block__element--modifier` |
  | **SMACSS** | Large, structured applications | Base, Layout, Module, State, Theme layers |
  | **Utility-First (Tailwind)** | Rapid UI with co-located styles | `flex items-center gap-4` |
  | **CSS Modules** | Component-scoped styles in frameworks | `styles.button` — hashed class names |
- For **BEM**: use `.block__element--modifier` naming. Avoid chaining elements beyond two levels (`.card__header__title` is wrong — extract `.card-title` as a new block).
- Organize stylesheets using **CSS Cascade Layers** for explicit precedence control:

  ```css
  @layer tokens, reset, base, layout, components, utilities;

  @layer tokens { :root { --color-primary: hsl(210, 80%, 45%); } }
  @layer reset { *, *::before, *::after { box-sizing: border-box; } }
  @layer components { .button { ... } }
  @layer utilities { .sr-only { ... } }
  ```

  Layers defined later have higher priority. Utility classes in the `utilities` layer always win over component styles.

- Apply a **CSS Reset** (`modern-normalize`, `@layer reset` in Tailwind, or `@import "reset.css"`) to establish a consistent cross-browser baseline before custom styles.
- **Scope component styles** to prevent global pollution: use BEM class prefixes, CSS Modules, or scoped `<style>` blocks (Vue/Svelte). Never write unscoped element selectors (`p { ... }`, `a { ... }`) outside of the reset/base layer.
- Co-locate component styles with their markup/component file (`Button.module.css` next to `Button.tsx`) for cohesive, maintainable units.

## 2. Custom Properties & Design Tokens

- Use **CSS Custom Properties** (`var(--token-name)`) for all design tokens. Hard-coding values that belong in the design system is forbidden:

  ```css
  :root {
    /* Colors */
    --color-primary-500: hsl(210, 80%, 45%);
    --color-surface: hsl(0, 0%, 100%);
    --color-text: hsl(0, 0%, 10%);

    /* Spacing (8px grid system) */
    --space-1: 0.25rem; /* 4px */
    --space-2: 0.5rem; /* 8px */
    --space-4: 1rem; /* 16px */
    --space-8: 2rem; /* 32px */

    /* Typography */
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --line-height-normal: 1.5;

    /* Border radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-full: 9999px;
  }
  ```

- Define **dark mode tokens** by overriding light mode tokens in a media query or class:
  ```css
  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: hsl(220, 15%, 10%);
      --color-text: hsl(0, 0%, 95%);
    }
  }
  /* Or theme class: [data-theme="dark"] { ... } */
  ```
- For complex design systems, use **Style Dictionary** to generate tokens from a single JSON/YAML source of truth, producing CSS custom properties, SCSS variables, iOS Swift files, and Android XML simultaneously.
- Document all design tokens with comments explaining their purpose and acceptable value range. Group related tokens together.

## 3. Selectors & Specificity

- **Prefer class selectors** (`.component`) over element selectors (`div`, `span`) or ID selectors (`#element`) for styling:
  - IDs have high specificity (100) and cannot be reused — reserve for JavaScript hooks and accessibility anchors
  - Element selectors create overly broad rules that bleed across components
- Keep selector specificity **as low and as flat as possible**. Avoid nesting beyond 2–3 levels even with CSS preprocessors or native nesting:

  ```css
  /* ❌ Too specific and brittle */
  .card .card-header > ul.nav > li.active > a { ... }

  /* ✅ Flat, predictable */
  .nav-link--active { ... }
  ```

- **Never use `!important`** except to override third-party library styles. Always add a comment explaining the reason and the library being overridden.
- Use modern CSS pseudo-classes for concise, readable selectors:
  - `:is(.foo, .bar)` — matches any of the selectors (uses the highest specificity of any argument)
  - `:where(.foo, .bar)` — same but with **zero specificity** (ideal for resets and base styles)
  - `:has(> img)` — parent selector (matches containers containing specific children)
  - `:not(.excluded)` — exclusion selector
- Use **attribute selectors** for styling based on HTML semantics: `a[href^="https"]`, `input[type="email"]`, `[data-state="open"]`.

## 4. Responsive Design & Layout

- Follow a **mobile-first** approach: write base styles for the smallest viewport, then layer enhancements for larger viewports with `@media (min-width: ...)`:
  ```css
  .grid {
    display: grid;
    grid-template-columns: 1fr; /* mobile: 1 column */
  }
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    } /* tablet */
  }
  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
    } /* desktop */
  }
  ```
- Use **relative units** for responsive, accessible scaling:
  - `rem` for font sizes (relative to root font size, respects user preferences)
  - `em` for spacing that should scale with the local font size
  - `%`, `fr`, `vw`, `vh`, `svh`, `dvh` for layout dimensions
  - Avoid fixed `px` for font sizes — it ignores user browser font-size preferences
- Use **CSS Grid** for two-dimensional layouts, **Flexbox** for one-dimensional arrangements. Avoid float-based or position-based layout hacks:
  ```css
  /* Reusable auto-fill grid */
  .auto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
    gap: var(--space-4);
  }
  ```
- Use **`@container` queries** for component-level responsive design — adapting based on the container's size, not the viewport. This enables truly reusable, context-aware components:

  ```css
  .card-container {
    container-type: inline-size;
    container-name: card;
  }

  @container card (min-width: 400px) {
    .card {
      flex-direction: row;
    }
  }
  ```

- Use **logical properties** (`margin-inline-start`, `padding-block-end`, `border-inline`) instead of physical properties for automatic RTL (right-to-left) language support.

## 5. Performance, Animation & Tooling

### Animation & Performance

- Use `transform` and `opacity` exclusively for smooth, GPU-accelerated animations. These properties are composited on the GPU and do not trigger layout or paint:

  ```css
  /* ✅ GPU-composited */
  .slide-in {
    transform: translateX(0);
    opacity: 1;
    transition:
      transform 200ms ease,
      opacity 200ms ease;
  }

  /* ❌ Triggers layout reflow */
  .slide-in {
    width: 200px;
    left: 0;
  }
  ```

- Use `will-change: transform` only for elements with confirmed complex animations. Overuse wastes GPU memory — add and remove it dynamically via JavaScript when needed.
- Use `prefers-reduced-motion` to respect user accessibility preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- Use `content-visibility: auto` on below-the-fold sections to skip rendering work until they are near the viewport — can significantly reduce initial paint time for long pages.

### CSS Bundle & Tooling

- Remove unused CSS in production builds using **PurgeCSS** (Vite/webpack plugin) or Tailwind's built-in JIT purging. Monitor CSS bundle size with Lighthouse (target < 50KB compressed for critical path CSS).
- Use **Critical CSS** extraction (`critters`, `penthouse`) to inline above-the-fold styles in `<head>` and defer the rest. This eliminates render-blocking CSS for above-the-fold content.
- Lint with **Stylelint** (`stylelint-config-standard-scss` for SCSS or `stylelint-config-recommended` for vanilla CSS). Enforce: no duplicate rules, no invalid values, consistent property order (logical order or alphabetical), no empty rules. Integrate into CI and pre-commit hooks.
- Format CSS with **Prettier**. Use **PostCSS** for modern CSS features with these plugins:
  - `postcss-nesting` — native CSS nesting
  - `postcss-custom-media` — `@custom-media` for named breakpoints
  - `autoprefixer` — vendor prefixes (still needed for some properties)
  - `postcss-logical` — logical properties
- Validate color contrast ratios using tools like **Accessible Colors** or **Polypane** to ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text) across all theme variants.
