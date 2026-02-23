# CSS Development Guidelines

> Objective: Define standards for maintainable, scalable, and performant CSS.

## 1. Methodology & Architecture

- Choose and consistently apply one CSS methodology for the project: **BEM** (Block-Element-Modifier), **SMACSS**, or **Utility-First** (e.g., Tailwind CSS). Do not mix approaches.
- For BEM: use the `.block__element--modifier` naming convention.
- Organize stylesheets logically: variables/tokens → base/reset → layout → components → utilities.

## 2. Custom Properties (Variables)

- Use CSS Custom Properties (`--color-primary: #1a73e8;`) for all design tokens: colors, spacing, typography, breakpoints.
- Define all variables in `:root` or a dedicated `:host` scope.
- Never hard-code values that should be tokens directly in component rules.

## 3. Selectors

- Prefer class selectors (`.component`) over element selectors (`div`) or ID selectors (`#id`) for styling.
- Avoid overly specific or deeply nested selectors. Keep nspecificity as low as possible.
- Do not use `!important` (except to override third-party library styles with a clear comment explaining why).

## 4. Responsive Design

- Follow a **mobile-first** approach: write base styles for small screens, then use `min-width` media queries for larger breakpoints.
- Use relative units (`rem`, `em`, `%`, `vw`, `vh`) over fixed pixel values for layout and typography.
- Define breakpoints as named CSS variables or in a single dedicated file.

## 5. Performance & Quality

- Avoid layout-triggering properties (e.g., `width`, `height`, `top`) in animations; prefer `transform` and `opacity` for smooth, GPU-accelerated animations.
- Remove unused CSS. Use a tool like PurgeCSS in production builds.
- Lint with Stylelint enforcing consistent property order, no duplicate rules, and no invalid values.
