# UI/UX & Frontend Guidelines

> Objective: Define standards for frontend development, styling, componentization, accessibility, internationalization, and user experience quality.

## 1. Styling & CSS Architecture

- Use the project's designated styling approach consistently (**Tailwind CSS**, **CSS Modules**, **styled-components**, or vanilla CSS). Never mix approached within the same project without a documented migration plan.
- Rely on **CSS variables** (custom properties) or design system tokens for colors, spacing, typography, border-radius, and shadows. Never hard-code values that belong in the design system.
- Follow a **mobile-first** approach. Write base styles for the smallest breakpoint, then progressively enhance with `min-width` media queries.
- Implement **Dark Mode** support using the `prefers-color-scheme` media query and CSS variables. Map all color tokens to both light and dark variants. Test with both system preferences. Never hard-code color values that differ between modes.
- Apply a consistent **CSS Reset** (`modern-normalize` or equivalent) to eliminate cross-browser inconsistencies. Document which reset is used and why.

## 2. Componentization & Architecture

- Build **modular, reusable components** with a single, clear responsibility.
- Separate **presentational (dumb) components** from **container (smart) components**. Presentational components receive data via props and emit events; they contain no data-fetching logic, side effects, or direct store access.
- Define clear, typed **props/interfaces** for every component. Document required vs optional props, their types, default values, and usage examples using TSDoc/JSDoc or framework-specific equivalents (Storybook controls).
- Co-locate a component's styles, tests, and story (if using Storybook) in the same directory. Follow the pattern: `ComponentName/index.tsx`, `ComponentName/styles.module.css`, `ComponentName/ComponentName.test.tsx`, `ComponentName/ComponentName.stories.tsx`.
- Version and document breaking changes in component APIs. Increment the component's major version for any breaking prop change; provide a migration guide.

## 3. Accessibility (a11y)

- Target **WCAG 2.2 Level AA** compliance as the minimum bar for all user-facing products. Level AAA is a stretch goal for accessibility-critical audiences.
- Use **semantic HTML** elements for their intended purpose: `<nav>`, `<main>`, `<article>`, `<button>`, `<label>`. Do not use `<div>` or `<span>` for interactive elements.
- All interactive elements MUST be fully operable via **keyboard navigation**. Tab order must be logical. Never remove `outline` without providing a visible custom focus indicator with at least 3:1 contrast ratio.
- All `<img>` elements MUST have a descriptive `alt` attribute. Use `alt=""` for decorative images. All complex visuals (charts, infographics) MUST have a text alternative.
- Color contrast MUST meet WCAG 2.2 AA minimums: **4.5:1** for normal text, **3:1** for large text and UI components.
- Use **ARIA roles and attributes** only when semantic HTML is insufficient. Test critical flows with a screen reader (VoiceOver on macOS/iOS, NVDA on Windows) before releasing.

## 4. Performance & UX

- Target **Core Web Vitals** thresholds for "Good" status:
  - **LCP** (Largest Contentful Paint) < 2.5s
  - **INP** (Interaction to Next Paint) < 200ms
  - **CLS** (Cumulative Layout Shift) < 0.1
- Provide immediate **visual feedback** for all user actions: loading spinners, skeleton screens, success toasts, error messages, disabled states during async operations.
- Optimize images: use modern formats (WebP, AVIF), specify `width`/`height` attributes to prevent CLS, lazy-load images below the fold, and serve images via a CDN with responsive `srcset`.
- Lazy-load non-critical components and routes with code splitting (`React.lazy`, dynamic `import()`). Establish a **JavaScript bundle size budget** (e.g., initial bundle < 200 KB gzipped) and enforce it in CI.
- Minimize third-party scripts: audit all external scripts for performance impact. Load non-critical third-party scripts with `defer` or `async`.

## 5. Internationalization & Design Consistency

- **i18n Architecture**: All user-visible strings MUST be externalized to locale files (e.g., `locales/en.json`, `locales/zh.json`). Never hard-code display text in component templates. Use a i18n library (`i18next`, `vue-i18n`, `next-intl`) from project inception.
- **Date, Number, and Currency Formatting**: Always use locale-aware APIs (`Intl.DateTimeFormat`, `Intl.NumberFormat`) for formatting. Never manually format locale-sensitive values.
- **RTL Support**: Design layouts using logical CSS properties (`margin-inline-start`, `padding-block-end`) instead of physical properties (`margin-left`, `padding-bottom`) to enable RTL language support without component rewrites.
- Maintain a **design system** or component library as a single source of truth for visual design decisions (colors, typography, spacing scale, component variants). Design tokens MUST be versioned and breaking changes managed like a public API.
- Use **Storybook** (or equivalent) to develop and document UI components in isolation. Run automated **visual regression tests** (Chromatic, Percy, Playwright snapshots) for critical UI components to catch unintended visual changes in CI.
