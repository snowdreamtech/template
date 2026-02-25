# Accessibility (a11y) Guidelines

> Objective: Define standards for building universally accessible digital products meeting WCAG 2.2 AA compliance.

## 1. Semantic Structure

- Use the correct semantic HTML element for its intended purpose: `<button>` for actions, `<a href>` for navigation, `<h1>`–`<h6>` for headings in a logical hierarchy, `<nav>` for navigation landmarks, `<main>` for primary content, `<footer>`, `<aside>`.
- Each page MUST have **exactly one `<h1>`**. Heading levels must not be skipped (never jump from `<h1>` directly to `<h3>`).
- Use `<ul>` / `<ol>` for lists of items, `<table>` with `<thead>`, `<tbody>`, `<th scope="col/row">` for tabular data.
- Avoid `<div>` and `<span>` elements for interactive controls — always use semantic elements. They provide implicit ARIA roles, keyboard behavior, and state management for free.
- Use `<label for="inputId">` or `aria-labelledby` to associate all form controls with their labels. Never use placeholder text as the only label — it disappears on focus.

## 2. Color & Contrast

- Text and interactive elements MUST meet **WCAG 2.2 AA** minimum contrast ratios:
  - Normal text (< 18pt / 14pt bold): **4.5:1** minimum.
  - Large text (≥ 18pt or ≥ 14pt bold): **3:1** minimum.
  - UI components (input borders, focus indicators, graphical objects): **3:1** minimum.
- **Never convey information through color alone.** Always pair color with a text label, icon, shape, or pattern. This is critical for color-blind users.
- Dark mode MUST maintain the same contrast ratios as light mode. Verify both themes with a contrast checker.

## 3. Keyboard Navigation

- Every interactive element (links, buttons, form inputs, custom dropdowns, date pickers, modals) MUST be fully operable via keyboard alone (Tab, Shift+Tab, Enter, Space, Escape, Arrow Keys).
- Tab order must follow a **logical, predictable reading order** matching the visual layout.
- Provide a **visible focus indicator** using `:focus-visible`. Never use `outline: none` or `outline: 0` without providing a highly visible alternative. The focus indicator must meet 3:1 contrast.
- Implement **focus trapping** inside modal dialogs: focus must not escape to background content while the modal is open. Return focus to the trigger element when the modal closes.
- Provide a **"Skip to main content"** link as the first focusable element on every page to allow keyboard users to bypass repetitive navigation.

## 4. ARIA

- **Prefer native HTML semantics over ARIA.** The first rule of ARIA is: if you can use a native HTML element or attribute to achieve the semantics, do that.
- When building custom interactive components (carousel, combobox, tab panel, custom select), implement the correct **ARIA design pattern** from the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).
- Add appropriate ARIA attributes: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`, `aria-label`, `aria-labelledby`, `aria-describedby`.
- Use `aria-live="polite"` for non-critical dynamic content updates. Use `aria-live="assertive"` for errors and urgent alerts. Avoid overusing `assertive` — it interrupts screen reader speech.

## 5. Testing & Compliance

- Run **automated accessibility scans** using **axe-core** (`@axe-core/playwright`, `@axe-core/react`, browser DevTools) in CI. Automated tools catch ~30–40% of issues — they are necessary but not sufficient.
- Perform **manual keyboard-only testing** of all interactive flows before release. Walk through the entire user journey without a mouse.
- Perform **screen reader testing** with: NVDA + Firefox (Windows), JAWS + Chrome (Windows), VoiceOver + Safari (macOS/iOS), TalkBack (Android).
- Target **WCAG 2.2 Level AA** as the minimum compliance standard for all user-facing products. Document known exceptions with remediation plans and target dates.
