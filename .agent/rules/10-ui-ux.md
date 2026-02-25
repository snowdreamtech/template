# UI/UX & Frontend Guidelines

> Objective: Define standards for frontend development, styling, componentization, accessibility, internationalization, and user experience quality.

## 1. Styling & CSS Architecture

### Design System Approach

- Use the project's designated styling approach consistently. Never mix approaches within the same project without a documented migration plan:
  - **Tailwind CSS**: utility-first, excellent for rapid prototyping and design system consistency
  - **CSS Modules**: scoped styles, no class conflicts, ideal for component libraries
  - **styled-components / Emotion**: CSS-in-JS, powerful theming via React context
  - **Vanilla CSS with custom properties**: maximum performance, zero runtime overhead
- Rely on **CSS variables (custom properties)** or design system tokens for all design decisions — colors, spacing, typography, border-radius, shadows. Never hard-code values that belong in the design system:

  ```css
  /* ✅ Token-based — theming is trivial */
  .button {
    background: var(--color-primary-500);
    padding: var(--spacing-2) var(--spacing-4);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  /* ❌ Hard-coded — can't theme, can't maintain */
  .button {
    background: #3b82f6;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
  }
  ```

- Follow a **mobile-first** approach. Write base styles for the smallest breakpoint, then progressively enhance with `min-width` media queries:

  ```css
  /* Mobile first */
  .grid {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    .grid {
      flex-direction: row;
      columns: 2;
    }
  }
  ```

- Implement **Dark Mode** using `prefers-color-scheme` and CSS variables. Map all color tokens to both light and dark variants:
  ```css
  :root {
    --color-bg: #ffffff;
    --color-text: #111827;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --color-bg: #111827;
      --color-text: #f9fafb;
    }
  }
  ```
- Apply a consistent **CSS Reset** (`modern-normalize`, `@tailwind/base`, or `@layer base { * { box-sizing: border-box } }`) to eliminate cross-browser inconsistencies.

## 2. Componentization & Architecture

### Component Design Principles

- Build **modular, reusable components** with a single, clear responsibility. Decompose large components into:
  - **Container (smart) components**: fetch data, manage state, communicate with services, no direct styling concerns
  - **Presentational (dumb) components**: receive data via props, emit events — no data-fetching, no store access, no side effects
- Co-locate a component's styles, tests, and Storybook story in the same directory:
  ```text
  components/
  └── UserCard/
      ├── index.ts              # re-export
      ├── UserCard.tsx          # component
      ├── UserCard.module.css   # scoped styles
      ├── UserCard.test.tsx     # unit tests
      └── UserCard.stories.tsx  # Storybook story
  ```
- Define clear, typed **props/interfaces** for every component. Document required vs optional props and provide usage examples:
  ```typescript
  interface UserCardProps {
    /** User object to display (required) */
    user: User;
    /** Called when the user clicks the follow button */
    onFollow?: (userId: string) => void;
    /** If true, shows a compact single-line version (default: false) */
    compact?: boolean;
  }
  ```
- Version and document breaking changes in component APIs. Increment the component's major version for any breaking prop change and provide a migration guide.
- Use **Storybook** to develop and document UI components in isolation. Stories serve as both living documentation and a component test harness.

## 3. Accessibility (a11y)

### WCAG Compliance

- Target **WCAG 2.2 Level AA** as the minimum for all user-facing products. Level AAA is the stretch goal for accessibility-critical audiences (government, healthcare, education).
- Use **semantic HTML** for its intended purpose — never use `<div>` or `<span>` for interactive elements:

  ```html
  <!-- ❌ Not accessible — no keyboard interaction, no role -->
  <div class="btn" onclick="submit()">Submit</div>

  <!-- ✅ Accessible — keyboard, role, and focus already built in -->
  <button type="submit">Submit</button>
  ```

- All interactive elements MUST be operable via **keyboard navigation**. Tab order MUST be logical. Never remove `outline` without a visible custom focus indicator:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px; /* separates from element edge */
  }
  ```
- All `<img>` elements MUST have a descriptive `alt` attribute. Use `alt=""` for decorative images. Complex visuals (charts, infographics) MUST have a text alternative.
- Color contrast MUST meet WCAG 2.2 AA minimums: **4.5:1** for normal text, **3:1** for large text (≥ 18pt or ≥ 14pt bold) and UI components.
- Use **ARIA roles and attributes** only when semantic HTML is insufficient. Test critical flows with a screen reader (VoiceOver on macOS/iOS, NVDA on Windows, TalkBack on Android) before releasing.
- Run automated accessibility audits with **axe-core** (`@axe-core/react`, `axe-playwright`) in CI — they catch ~40% of WCAG issues automatically.

## 4. Performance & UX

### Core Web Vitals

- Target **Core Web Vitals** "Good" thresholds (measured at P75):

  | Metric                          | Good    | Needs Improvement | Poor    |
  | ------------------------------- | ------- | ----------------- | ------- |
  | LCP (Largest Contentful Paint)  | < 2.5s  | 2.5s – 4.0s       | > 4.0s  |
  | INP (Interaction to Next Paint) | < 200ms | 200ms – 500ms     | > 500ms |
  | CLS (Cumulative Layout Shift)   | < 0.1   | 0.1 – 0.25        | > 0.25  |

- Provide **immediate visual feedback** for all user actions: loading spinners, skeleton screens, success toasts, error messages, and disabled states during async operations. Users should never wonder "did my click work?".
- Optimize images: use modern formats (WebP, AVIF), specify `width`/`height` to prevent CLS, lazy-load below-the-fold images, and serve via CDN with responsive `srcset`:
  ```html
  <img src="hero.jpg" srcset="hero-480.webp 480w, hero-1024.webp 1024w" sizes="(max-width: 480px) 480px, 1024px" width="1024" height="576" alt="Product screenshot showing the dashboard" loading="lazy" decoding="async" />
  ```
- Lazy-load non-critical components and routes with code splitting. Establish a **JavaScript bundle size budget** (e.g., initial bundle < 200 KB gzipped) and enforce it in CI using `bundlesize` or `bundlemon`.
- Minimize third-party scripts: load non-critical third-party scripts with `defer` or `async`. Audit with WebPageTest and Lighthouse.

## 5. Internationalization & Design Consistency

### i18n Architecture

- All user-visible strings MUST be externalized to locale files from the very beginning of the project. Never hard-code display text in component templates:

  ```typescript
  // ❌ Hard-coded — impossible to translate
  <p>Welcome back, {user.name}!</p>

  // ✅ Externalized — translation-ready
  <p>{t("user.welcomeBack", { name: user.name })}</p>
  // en.json: { "user": { "welcomeBack": "Welcome back, {{name}}!" } }
  // zh.json: { "user": { "welcomeBack": "欢迎回来，{{name}}！" } }
  ```

- Use **locale-aware APIs** (`Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.RelativeTimeFormat`) for dates, numbers, and currencies. Never manually format locale-sensitive values.
- Design layouts using **logical CSS properties** (`margin-inline-start`, `padding-block-end`) instead of physical properties (`margin-left`, `padding-bottom`) to enable RTL language support without rewrites.
- Maintain a **design system** or component library as a single source of truth for visual design decisions. Design tokens MUST be versioned and breaking changes managed like a public API — with a changelog and migration guide.
- Run automated **visual regression tests** (Chromatic, Percy, Playwright screenshot comparisons) for critical UI components in CI to catch unintended visual changes.
