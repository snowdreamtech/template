# UI/UX & Frontend Guidelines

> Objective: Define standards for frontend development, styling, componentization, accessibility, and user experience quality.

## 1. Styling & CSS Architecture

- Use the project's designated styling approach consistently (**Tailwind CSS**, **CSS Modules**, **styled-components**, or vanilla CSS). Never mix approaches within the same project.
- Rely on **CSS variables** (custom properties) or design system tokens for colors, spacing, typography, border-radius, and shadows. Never hard-code values that belong in the design system.
- Follow a **mobile-first** approach. Write base styles for the smallest breakpoint, then progressively enhance with `min-width` media queries.

## 2. Componentization & Architecture

- Build **modular, reusable components** with a single, clear responsibility.
- Separate **presentational (dumb) components** from **container (smart) components**. Presentational components receive data via props and emit events; they contain no data-fetching logic.
- Define clear, typed **props/interfaces** for every component. Document required vs optional props and their types.
- Co-locate a component's styles, tests, and story (if using Storybook) in the same directory.

## 3. Accessibility (a11y)

- Use **semantic HTML** elements for their intended purpose: `<nav>`, `<main>`, `<article>`, `<button>`, `<label>`. Do not use `<div>` for interactive elements.
- All interactive elements must be fully operable via **keyboard navigation**. Never remove `outline` without providing a visible custom focus indicator.
- All `<img>` elements MUST have a descriptive `alt` attribute. Use `alt=""` for decorative images.
- Use **ARIA roles and attributes** only when semantic HTML is insufficient. Test with a screen reader (VoiceOver, NVDA) for critical flows.

## 4. Performance & UX

- Provide immediate **visual feedback** for all user actions: loading spinners, success toasts, error messages, disabled states during async operations.
- Optimize images: use modern formats (WebP, AVIF), specify `width`/`height` to prevent layout shifts, and lazy-load images below the fold.
- Minimize **Cumulative Layout Shift (CLS)**: always reserve space for dynamic content (images, ads, async-loaded components) before it loads.
- Lazy-load non-critical components and routes with code splitting (`React.lazy`, dynamic `import()`).

## 5. Design Consistency & Tooling

- Maintain a **design system** or component library as a single source of truth for visual design decisions (colors, typography, spacing scale, component variants).
- Use **Storybook** (or equivalent) to develop and document UI components in isolation.
- Run automated **visual regression tests** (Chromatic, Percy) for critical UI components to catch unintended visual changes.
- Lint styles with **Stylelint** and enforce design token usage to prevent ad-hoc values from accumulating.
