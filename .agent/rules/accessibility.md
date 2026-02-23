# Accessibility (a11y) Guidelines

> Objective: Define standards for building universally accessible digital products that meet WCAG 2.1 AA compliance.

## 1. Semantic Structure

- Use correct semantic HTML elements for their intended purpose: `<button>` for actions, `<a>` for navigation, `<h1>`–`<h6>` for headings in logical hierarchy, `<nav>` for navigation landmarks, `<main>` for primary content.
- Each page MUST have exactly one `<h1>`. Heading levels must not be skipped (e.g., do not jump from `<h1>` to `<h3>`).
- Use `<ul>`/`<ol>` for lists of items, not `<div>` with manual bullet characters.

## 2. Color & Contrast

- Text and interactive elements must meet **WCAG AA contrast ratios**:
  - Normal text: minimum **4.5:1** contrast ratio.
  - Large text (18pt+ or 14pt+ bold): minimum **3:1**.
  - UI components and graphical objects: minimum **3:1**.
- Never convey information through color alone. Always pair color with a text label, icon, or pattern.

## 3. Keyboard Navigation

- Every interactive element (links, buttons, form inputs, modals, dropdowns) MUST be fully operable via keyboard alone.
- The tab order must follow a logical reading order in the DOM.
- Provide a visible focus indicator (`:focus-visible` style). Never use `outline: none` without providing a custom visible alternative.
- Implement **focus trapping** inside modals and dialogs: focus must not escape to the background while the modal is open.

## 4. ARIA

- Prefer native HTML semantics over ARIA roles. Use ARIA only when semantic HTML cannot express the widget's role.
- Every interactive custom component (custom dropdown, slider, modal, tab panel) must have the correct ARIA role, state (`aria-expanded`, `aria-selected`, `aria-checked`), and property (`aria-label`, `aria-labelledby`, `aria-describedby`).
- Dynamic content updates must be announced to screen readers using `aria-live` regions (`polite` or `assertive`).

## 5. Testing & Compliance

- Run **automated accessibility scans** using **axe-core** (via `@axe-core/react`, `cypress-axe`, or browser extensions) in CI.
- Perform **manual keyboard-only testing** on all interactive flows before release.
- Perform **screen reader testing** with at least one of: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS).
- Target **WCAG 2.1 Level AA** compliance as the minimum standard for all user-facing products.
